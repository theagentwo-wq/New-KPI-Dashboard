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

        const kpiProperties = {
            "Sales": { type: Type.NUMBER }, "SOP": { type: Type.NUMBER }, "Prime Cost": { type: Type.NUMBER }, "Avg. Reviews": { type: Type.NUMBER }, "Food Cost": { type: Type.NUMBER }, "Variable Labor": { type: Type.NUMBER }, "Culinary Audit Score": { type: Type.NUMBER },
        };
        const actualsDataSchema = { type: Type.OBJECT, properties: { "Store Name": { type: Type.STRING }, "Week Start Date": { type: Type.STRING }, ...kpiProperties }, required: ["Store Name", "Week Start Date"] };
        const budgetDataSchema = { type: Type.OBJECT, properties: { "Store Name": { type: Type.STRING }, "Year": { type: Type.NUMBER }, "Month": { type: Type.NUMBER }, ...kpiProperties }, required: ["Store Name", "Year", "Month"] };
        const universalPrompt = `You are an expert financial analyst for a restaurant group. Analyze the provided document.
    
    **CRITICAL INSTRUCTIONS:**
    1.  **DETECT DYNAMIC SHEETS:** First, examine the structure of the document. If you see text indicating a dropdown menu, a filter control, or instructions to select a store/entity to view its data, set the 'isDynamicSheet' flag to true. This is crucial. If it's just a static table of data for one or more entities without interactive elements, set 'isDynamicSheet' to false.
    2.  **CLASSIFY DATA TYPE:** Next, determine if the data represents 'Actuals' (historical, weekly performance data) or a 'Budget' (a forward-looking plan with monthly targets). Your primary clue is the time granularity (weekly vs. monthly) and keywords like "Budget", "Plan", "Actuals", "Report".
    3.  **EXTRACT DATA:** Based on the classification, extract all relevant financial data. If 'isDynamicSheet' is true, extract data for the currently visible store only.
        *   **If 'Actuals':** Extract the 'Store Name', 'Week Start Date' (calculate if a 'Week Ending' date is given, assuming weeks start on Monday), and all KPI values for each row.
        *   **If 'Budget':** Extract the 'Store Name', 'Year', 'Month', and all target KPI values.
    4.  **HANDLE COMPLEX FILES:** The document may contain data for multiple stores and multiple time periods (e.g., a multi-year budget). Process all of them. Ignore any summary rows like "Total" or "Grand Total".
    5.  **FORMAT OUTPUT:** Return a JSON object with two fields: 'dataType' (either "Actuals" or "Budget") and 'data' (an array of JSON objects strictly following the correct schema for that data type). Ensure all percentages are returned as numbers (e.g., 18.5% becomes 18.5).`;
        const universalSchema = { type: Type.OBJECT, properties: { isDynamicSheet: { type: Type.BOOLEAN }, dataType: { type: Type.STRING, enum: ["Actuals", "Budget"] }, data: { type: Type.ARRAY, items: { oneOf: [actualsDataSchema, budgetDataSchema] } } }, required: ["dataType", "data", "isDynamicSheet"] };

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