"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExecutiveSummary = void 0;
const firebase_functions_1 = require("firebase-functions");
const app_1 = require("firebase-admin/app");
const config_1 = require("./config");
const generative_ai_1 = require("@google/generative-ai");
(0, app_1.initializeApp)();
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.GEMINI_API_KEY);
exports.getExecutiveSummary = firebase_functions_1.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new firebase_functions_1.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
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
    }
    catch (error) {
        console.error(error);
        throw new firebase_functions_1.https.HttpsError('internal', 'Error generating executive summary.');
    }
});
//# sourceMappingURL=index.js.map