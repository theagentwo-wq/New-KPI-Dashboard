import { GoogleGenAI, Type } from "@google/genai";
import { initializeFirebaseService, updateImportJob, deleteFileByPath } from '../../services/firebaseService';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Handler } from '@netlify/functions';

declare var Buffer: any;

async function streamToBuffer(stream: any): Promise<any> {
    const chunks: any[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('error', (err: any) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

export const handler: Handler = async (event, _context) => {
    const status = await initializeFirebaseService();
    if (status.status === 'error') {
        console.error("Firebase init failed in background function:", status.message);
        return { statusCode: 500 };
    }

    const { jobId } = JSON.parse(event.body || '{}').payload;
    if (!jobId) {
        console.error("No jobId provided to process-import-job function.");
        return { statusCode: 400 };
    }

    let jobDetails: any = {};

    try {
        const db = firebase.firestore();
        const docRef = db.collection("import_jobs").doc(jobId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            throw new Error(`Import job document ${jobId} not found.`);
        }
        jobDetails = docSnap.data();

        await updateImportJob(jobId, { status: 'processing' });

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured on the server.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const { jobType } = jobDetails;

        // 1. Define Schemas
        const kpiProperties = {
            "Sales": { type: Type.NUMBER }, "SOP": { type: Type.NUMBER }, "Prime Cost": { type: Type.NUMBER }, "Avg. Reviews": { type: Type.NUMBER }, "Food Cost": { type: Type.NUMBER }, "Variable Labor": { type: Type.NUMBER }, "Culinary Audit Score": { type: Type.NUMBER },
        };

        const pnlItemSchema = {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Name of the P&L line item (e.g., 'Dairy', 'FOH Hourly')" },
                actual: { type: Type.NUMBER, description: "Actual value in dollars or percentage (decimal)" },
                budget: { type: Type.NUMBER, description: "Budget value in dollars or percentage (decimal)" },
                category: { type: Type.STRING, enum: ["Sales", "COGS", "Labor", "Operating Expenses", "Other"], description: "Major P&L category" },
                indent: { type: Type.NUMBER, description: "0 for main category, 1 for sub-category, 2 for item" }
            },
            required: ["name", "actual", "category"]
        };

        const actualsDataSchema = { 
            type: Type.OBJECT, 
            properties: { 
                "Store Name": { type: Type.STRING }, 
                "Week Start Date": { type: Type.STRING }, 
                ...kpiProperties,
                "pnl": { type: Type.ARRAY, items: pnlItemSchema, description: "Full hierarchical P&L data for this store/week if available." }
            }, 
            required: ["Store Name", "Week Start Date"] 
        };
        
        const budgetDataSchema = { type: Type.OBJECT, properties: { "Store Name": { type: Type.STRING }, "Year": { type: Type.NUMBER }, "Month": { type: Type.NUMBER }, ...kpiProperties }, required: ["Store Name", "Year", "Month"] };
        
        const universalSchema = { 
            type: Type.OBJECT, 
            properties: { 
                isDynamicSheet: { type: Type.BOOLEAN }, 
                dataType: { type: Type.STRING, enum: ["Actuals", "Budget"] }, 
                data: { type: Type.ARRAY, items: { oneOf: [actualsDataSchema, budgetDataSchema] } } 
            }, 
            required: ["dataType", "data", "isDynamicSheet"] 
        };

        // 2. Build the Prompt
        const universalPrompt = `You are an expert financial analyst for a restaurant group. Analyze the provided document.
    
    **CRITICAL INSTRUCTIONS:**
    1.  **DETECT DYNAMIC SHEETS:** First, examine the structure of the document. If you see text indicating a dropdown menu, a filter control, or instructions to select a store/entity to view its data, set the 'isDynamicSheet' flag to true. If it's just a static table, set 'isDynamicSheet' to false.
    2.  **CLASSIFY DATA TYPE:** Determine if the data represents 'Actuals' (historical, weekly performance) or a 'Budget' (monthly targets).
    3.  **EXTRACT DATA (The most important part):**
        *   **If 'Actuals':** Extract the 'Store Name', 'Week Start Date', and the top-level KPIs (Sales, SOP, Prime Cost, etc.).
        *   **CRITICAL - FULL P&L:** If the document contains a detailed Profit & Loss statement (rows like 'Dairy', 'Poultry', 'FOH Hourly', 'Supplies'), you MUST extract these rows into the 'pnl' array for each store/week.
            *   Map each row to a 'category': 'Sales', 'COGS', 'Labor', 'Operating Expenses', or 'Other'.
            *   Determine 'indent' level based on the visual hierarchy (0 for headers like 'Food COGS', 1 for items like 'Dairy').
            *   Extract both 'actual' and 'budget' values if present.
        *   **If 'Budget':** Extract the 'Store Name', 'Year', 'Month', and all target KPI values.
    4.  **HANDLE COMPLEX FILES:** Process data for all stores and weeks found. Ignore "Total" or "Grand Total" summary rows.
    5.  **FORMAT OUTPUT:** Return JSON strictly following the schema. Convert percentages to decimals (e.g., 18.5% -> 0.185).`;
        
        // 3. Call Gemini
        let aiResponse;

        if (jobType === 'document') {
            const { fileUrl, mimeType, fileName } = jobDetails;
            const fileResponse = await fetch(fileUrl);
            if (!fileResponse.ok) throw new Error(`Failed to download file: ${fileUrl}`);
            const buffer = await streamToBuffer(fileResponse.body);
            const base64Data = buffer.toString('base64');
            
            aiResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [ { text: `${universalPrompt}\n\nThe filename is "${fileName}".` }, { inlineData: { mimeType: mimeType, data: base64Data } } ],
                config: { responseMimeType: "application/json", responseSchema: universalSchema },
            });
        } else { // 'text'
            const { fileUrl } = jobDetails;
            const textResponse = await fetch(fileUrl);
            if(!textResponse.ok) throw new Error(`Failed to download text: ${fileUrl}`);
            const text = await textResponse.text();

            aiResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${universalPrompt}\n\n**Text to Analyze:**\n---\n${text}\n---`,
                config: { responseMimeType: "application/json", responseSchema: universalSchema },
            });
        }
        
        const parsedResult = JSON.parse(aiResponse.text!);
        await updateImportJob(jobId, { status: 'complete', result: parsedResult });

        if (jobDetails.filePath) {
            await deleteFileByPath(jobDetails.filePath);
        }

        return { statusCode: 200 };

    } catch (error: any) {
        console.error(`Error processing import job ${jobId}:`, error);
        await updateImportJob(jobId, { status: 'error', error: error.message });
        
        if (jobDetails.filePath) {
            await deleteFileByPath(jobDetails.filePath);
        }

        return { statusCode: 500 };
    }
};