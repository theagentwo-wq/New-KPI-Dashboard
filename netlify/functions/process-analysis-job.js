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

        const { fileUrl, mimeType, fileName, filePath, mode } = jobDetails;
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) throw new Error(`Failed to download file: ${fileUrl}`);

        const buffer = await streamToBuffer(fileResponse.body);
        const base64Data = buffer.toString('base64');
        
        // Prompt Customization based on Mode
        let personaInstruction = "You are an expert business strategist.";
        let focusArea = "Provide a balanced, general overview.";
        
        if (mode === 'Financial') {
            personaInstruction = "You are a ruthless CFO and financial auditor.";
            focusArea = "Focus heavily on P&L, margins, variance, ROI, and cost-saving opportunities. Be critical of overspending.";
        } else if (mode === 'Operational') {
            personaInstruction = "You are a seasoned COO and Operations Director.";
            focusArea = "Focus on execution, labor efficiency, speed of service, staffing levels, and operational friction points.";
        } else if (mode === 'Marketing') {
            personaInstruction = "You are a creative CMO and Brand Strategist.";
            focusArea = "Focus on customer sentiment, brand voice, campaign effectiveness, revenue growth, and local market opportunities.";
        }

        const prompt = `${personaInstruction} Your task is to analyze the provided document and generate a concise, actionable strategic brief.

        DOCUMENT CONTEXT:
        - Filename: "${fileName}"
        - Analysis Mode: ${mode || 'General'}

        YOUR PROCESS:
        1.  **COMPREHEND:** Identify the document type.
        2.  **ANALYZE:** Extract critical data points relevant to your role as ${mode || 'Strategist'}. ${focusArea}
        3.  **SYNTHESIZE:** Create a brief in Markdown using this structure:

            ---

            ### ${mode || 'Strategic'} Executive Summary
            A sharp summary of findings from your specific perspective.

            ### Key Metrics & Observations
            Bulleted list of data points that matter most to a ${mode || 'Strategist'}.

            ### Critical Insights
            *   **Insight 1:** A non-obvious takeaway.
            *   **Insight 2:** Deep dive into a specific issue or win.

            ### Recommended Actions
            1.  **Immediate Action:** What should be done today?
            2.  **Strategic Move:** What should be done this month?

            ---`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Use Pro for deeper analysis in background
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