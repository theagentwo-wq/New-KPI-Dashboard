import { https } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GEMINI_API_KEY } from './config';
import { GoogleGenerativeAI } from '@google/generative-ai';

initializeApp();

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getExecutiveSummary = https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { period, view } = data;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        Generate an executive summary for the given period and view.
        Period: ${period}
        View: ${view}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        return { summary: text };
    } catch (error) {
        console.error(error);
        throw new https.HttpsError('internal', 'Error generating executive summary.');
    }
});
