

import { GoogleGenAI } from "@google/genai";
import fetch from 'node-fetch';
import { initializeFirebaseService, updateAnalysisJob, deleteFileByPath } from '../../services/firebaseService';
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
    // This is a background function, so we don't return a response to the client.
    // We handle errors by updating the job status in Firestore.

    const status = await initializeFirebaseService();
    if (status.status === 'error') {
        console.error("Firebase init failed in background function:", status.message);
        // Can't update Firestore if it failed to init, so we just log and exit.
        return { statusCode: 500 };
    }

    const { jobId } = JSON.parse(event.body || '{}').payload;
    if (!jobId) {
        console.error("No jobId provided to background function.");
        return { statusCode: 400 };
    }

    let jobDetails: any = {};

    try {
        // Use Firebase v8 compat syntax for consistency.
        const db = firebase.firestore();
        const docRef = db.collection("analysis_jobs").doc(jobId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            throw new Error(`Job document ${jobId} not found.`);
        }
        jobDetails = docSnap.data();

        await updateAnalysisJob(jobId, { status: 'processing' });

        const { fileUrl, mimeType, fileName, filePath } = jobDetails;
        
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured on the server.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) throw new Error(`Failed to download file: ${fileUrl}`);

        const buffer = await streamToBuffer(fileResponse.body);
        const base64Data = buffer.toString('base64');
        
        const prompt = `You are an expert business strategist and data analyst for a multi-unit restaurant group. Your task is to analyze the provided document and generate a concise, actionable strategic brief for an Area Director.

        DOCUMENT CONTEXT:
        - Filename: "${fileName}"

        YOUR PROCESS (follow these steps):
        1.  **COMPREHEND:** First, identify the type of document. Is it a sales report, marketing recap, event summary, customer feedback analysis, inventory sheet, etc.? State the document type clearly.
        2.  **INFER GOAL:** Based on the document type, what is the primary business question an operator would want answered? (e.g., "Was this event profitable?", "What are the key takeaways from customer reviews?", "How can we optimize this marketing campaign?").
        3.  **EXTRACT KEY DATA:** Identify and extract the most critical data points relevant to the inferred goal. Do not just list all numbers; focus on what matters. For financial reports, calculate key metrics like ROI or profit margin if possible.
        4.  **SYNTHESIZE & GENERATE BRIEF:** Create a brief using the following structure in Markdown format:

            ---

            ### Executive Summary
            A one-paragraph summary of the key findings and the overall outcome.

            ### Key Metrics & Data
            A bulleted list or a simple Markdown table of the most important data points or calculated metrics (like ROI).

            ### Strategic Insights
            *   **Insight 1:** A sharp, non-obvious observation from the data.
            *   **Insight 2:** Another key takeaway.
            *   **Insight 3:** A third important point.

            ### Actionable Recommendations
            1.  **Recommendation 1:** A concrete, specific next step an Area Director should take based on the insights.
            2.  **Recommendation 2:** Another actionable recommendation.

            ---`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [
                { text: prompt },
                { inlineData: { mimeType, data: base64Data } }
            ],
        });
        
        await updateAnalysisJob(jobId, { status: 'complete', result: response.text });

        // Clean up the file from Firebase Storage
        if (filePath) {
            await deleteFileByPath(filePath);
        }

        return { statusCode: 200 };

    } catch (error: any) {
        console.error(`Error processing job ${jobId}:`, error);
        await updateAnalysisJob(jobId, { status: 'error', error: error.message });
        
        // Cleanup file even on failure
        if (jobDetails.filePath) {
            await deleteFileByPath(jobDetails.filePath);
        }

        return { statusCode: 500 };
    }
};
