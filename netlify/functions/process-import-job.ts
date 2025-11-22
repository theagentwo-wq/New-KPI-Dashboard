import { GoogleGenAI, Type } from "@google/genai";
import { initializeFirebaseService, updateImportJob, deleteFileByPath } from '../../services/firebaseService';
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
        // Dynamically import Firebase compat SDK at runtime to avoid
        // loading browser-only modules during function module initialization.
        let firebase: any = null;
        try {
            const compat = await import('firebase/compat/app');
            firebase = (compat && (compat as any).default) || compat;
            await import('firebase/compat/firestore');
        } catch (e) {
            console.error('Failed to dynamically import Firebase in import job function:', e);
            throw e;
        }

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
    1.  **DETECT DYNAMIC SHEETS:** If you see text indicating a dropdown menu or filter control, set 'isDynamicSheet' to true. Otherwise false.
    2.  **CLASSIFY DATA TYPE:** Determine if 'Actuals' or 'Budget'.
    3.  **EXTRACT DATA:**
        *   **If 'Actuals':** Extract 'Store Name', 'Week Start Date', and top-level KPIs (Sales, SOP, Prime Cost, etc.).
        *   **FULL P&L EXTRACTION:** Scan the document for a detailed Profit & Loss statement.
            *   Extract every line item into the 'pnl' array.
            *   **Name:** The row label (e.g., "Dairy", "Liquor COGS", "FOH Hourly Labor").
            *   **Category:** Assign one of: 'Sales', 'COGS', 'Labor', 'Operating Expenses', 'Other'. Use your accounting knowledge.
            *   **Indent:** Infer hierarchy from the visual layout. Headers like "Food COGS Total" are level 0. Sub-items like "Dairy" are level 1 or 2.
            *   **Values:** Extract 'actual' and 'budget' columns. Convert percentages to decimals (22% -> 0.22).
        *   **If 'Budget':** Extract 'Store Name', 'Year', 'Month', and KPI values.
    4.  **PROCESS ALL:** Handle data for all stores and weeks found in the file.
    5.  **FORMAT:** Return strictly JSON.`;
        
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

// Make CommonJS-compatible export for the Netlify CLI local runner
(module as any).exports = { handler };
exports.handler = handler;