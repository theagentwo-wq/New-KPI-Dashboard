
import { Handler } from '@netlify/functions';
import { initializeFirebaseService, getNotes, addNote, updateNoteContent, deleteNoteById } from '../../services/firebaseService';

// This handler will route requests to the appropriate Firestore function
export const handler: Handler = async (event, _context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    const status = await initializeFirebaseService();
    if (status.status === 'error') {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: `Firebase initialization failed: ${status.message}` }),
        };
    }

    const { action, payload } = event.body ? JSON.parse(event.body) : { action: null, payload: null };
    const methodAction = event.httpMethod === 'GET' ? 'get' : action;

    try {
        let result;
        switch (methodAction) {
            case 'get':
                result = await getNotes();
                break;
            case 'add':
                const { monthlyPeriodLabel, category, content, scope, imageDataUrl } = payload;
                result = await addNote(monthlyPeriodLabel, category, content, scope, imageDataUrl);
                break;
            case 'update':
                const { noteId, newContent, newCategory } = payload;
                await updateNoteContent(noteId, newContent, newCategory);
                result = { success: true };
                break;
            case 'delete':
                const { noteId: idToDelete } = payload;
                await deleteNoteById(idToDelete);
                result = { success: true };
                break;
            default:
                return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(result) };
    } catch (error: any) {
        console.error(`Error in notes-proxy for action "${action}":`, error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
    }
};
