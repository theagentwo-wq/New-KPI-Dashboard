const { GoogleGenAI } = require("@google/genai");
const fetch = require('node-fetch');
const { initializeFirebaseService, updateAnalysisJob, deleteFileByPath } = require('../../services/firebaseService');

async function streamToBuffer(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

exports.handler = async (event) => {
    const status = await initializeFirebaseService();
    if(status.status === 'error') {
        console.error("Firebase init failed in background function:", status.message);
        return { statusCode: 500 };
    }

    const { jobId } = JSON.parse(event.body || '{}').payload;
    if (!jobId) {
        console.error("No jobId provided to background function.");
        return { statusCode: 400 };
    }

    let jobDetails = {};

    try {
        const { getFirestore, doc, getDoc } = require('firebase/firestore');
        const db = getFirestore();
        const docRef = doc(db, "analysis_jobs", jobId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error(`Job document ${jobId} not found.`);
        }
        jobDetails = docSnap.data();

        await updateAnalysisJob(jobId, { status: 'processing' });

        const { fileUrl, mimeType, fileName, filePath } = jobDetails;
        
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

        await deleteFileByPath(filePath);

        return { statusCode: 200 };

    } catch (error) {
        console.error(`Error processing job ${jobId}:`, error);
        await updateAnalysisJob(jobId, { status: 'error', error: error.message });
        
        if (jobDetails.filePath) {
            await deleteFileByPath(jobDetails.filePath);
        }

        return { statusCode: 500 };
    }
};
