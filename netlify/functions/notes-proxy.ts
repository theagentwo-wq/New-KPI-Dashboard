// netlify/functions/notes-proxy.ts
import * as admin from 'firebase-admin';

// This is a Netlify Function, which runs on a Node.js backend.

// --- Firebase Admin SDK Initialization ---

// The service account key is stored as a JSON string in environment variables.
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.");
}

// Parse the JSON key and initialize Firebase Admin if not already initialized.
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
    });
}

const db = admin.firestore();
const notesCollection = db.collection('notes');

// --- Netlify Handler ---

export const handler = async (event: { httpMethod: string; body?: string }) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust for production if needed
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    try {
        const { action, payload } = JSON.parse(event.body || '{}');

        switch (action) {
            case 'getNotes': {
                const snapshot = await notesCollection.orderBy('createdAt', 'desc').get();
                const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                return { statusCode: 200, headers, body: JSON.stringify(notes) };
            }

            case 'addNote': {
                const { periodLabel, category, content, view, storeId } = payload;
                const newNote = {
                    periodLabel,
                    category,
                    content,
                    view,
                    storeId: storeId || null,
                    createdAt: new Date().toISOString(), // Server-side timestamp
                };
                const docRef = await notesCollection.add(newNote);
                return { statusCode: 201, headers, body: JSON.stringify({ id: docRef.id, ...newNote }) };
            }

            case 'updateNote': {
                const { noteId, newContent, newCategory } = payload;
                if (!noteId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Note ID is required.' }) };
                
                await notesCollection.doc(noteId).update({
                    content: newContent,
                    category: newCategory,
                });
                return { statusCode: 200, headers, body: JSON.stringify({ message: 'Note updated successfully.' }) };
            }

            case 'deleteNote': {
                const { noteId } = payload;
                if (!noteId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Note ID is required.' }) };

                await notesCollection.doc(noteId).delete();
                return { statusCode: 200, headers, body: JSON.stringify({ message: 'Note deleted successfully.' }) };
            }

            default:
                return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
        }
    } catch (error: any) {
        console.error('Error in notes-proxy function:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
    }
};
