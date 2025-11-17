import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, Firestore, CollectionReference, DocumentData } from 'firebase/firestore';
import { Note, NoteCategory, View } from '../types';

export type FirebaseStatus = 
  | { status: 'initializing' }
  | { status: 'connected' }
  | { status: 'error', message: string, rawValue?: string };

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let notesCollection: CollectionReference<DocumentData> | null = null;
let isInitialized = false;

/**
 * Fetches the Firebase config from a secure proxy and initializes the Firebase app.
 * @returns {Promise<FirebaseStatus>} A promise that resolves to a detailed status object.
 */
export const initializeFirebaseService = async (): Promise<FirebaseStatus> => {
    if (isInitialized) return { status: 'connected' };

    try {
        const response = await fetch('/.netlify/functions/firebase-config-proxy');
        
        if (!response.ok) {
            let errorText = `Proxy request failed with status ${response.status}.`;
            try {
                const errorBody = await response.json();
                errorText = errorBody.error || errorText;
            } catch (e) {
                // The response was not JSON, which can happen with some server errors.
                 const rawResponse = await response.text();
                 errorText += ` Raw response: "${rawResponse}"`;
            }
            throw new Error(`[Proxy Error] ${errorText}`);
        }

        const firebaseConfig = await response.json();

        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
            return { 
                status: 'error', 
                message: "Fetched configuration is invalid or missing required keys like 'apiKey' or 'projectId'."
            };
        }
        
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApps()[0];
        }
        
        db = getFirestore(app);
        notesCollection = collection(db, 'notes');
        isInitialized = true;
        console.log("Firebase service initialized successfully.");
        return { status: 'connected' };

    } catch (error: any) {
        console.error("Firebase Initialization Error:", error);
        isInitialized = false;
        
        const newErrorMessage = `The FIREBASE_CLIENT_CONFIG value from your Netlify settings appears to be invalid. 
Error: ${error.message || 'Unknown error'}. 

Please follow these steps:
1. Go to your Firebase project settings and re-copy the config object.
2. Go to your Netlify site settings and edit the FIREBASE_CLIENT_CONFIG variable.
3. Paste the new value, ensuring it is a single line with no surrounding quotes.
4. Trigger a new deploy on Netlify.`;

        return { 
            status: 'error', 
            message: newErrorMessage
        };
    }
};

export const getNotes = async (): Promise<Note[]> => {
    if (!isInitialized || !db || !notesCollection) {
        console.error("Firebase not initialized. Cannot fetch notes.");
        return [];
    }
    
    try {
        const q = query(notesCollection, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data: any = doc.data();
            const note: Note = {
                id: doc.id,
                monthlyPeriodLabel: data.monthlyPeriodLabel,
                view: data.view,
                category: data.category,
                content: data.content,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                storeId: data.storeId ?? undefined,
                imageUrl: data.imageUrl ?? undefined,
            };
            return note;
        });
    } catch (error) {
        console.error("Error fetching notes from Firestore:", error);
        throw error;
    }
};

export const addNote = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageUrl?: string): Promise<Note> => {
    if (!isInitialized || !notesCollection) {
        throw new Error("Cannot add note, Firebase is not initialized.");
    }

    const createdAtTimestamp = Timestamp.now();
    
    const newNoteDataForDb: any = {
        monthlyPeriodLabel,
        category,
        content,
        view: scope.view,
        createdAt: createdAtTimestamp,
    };
    if (scope.storeId) newNoteDataForDb.storeId = scope.storeId;
    if (imageUrl) newNoteDataForDb.imageUrl = imageUrl;
    
    const docRef = await addDoc(notesCollection, newNoteDataForDb);
    
    return {
        id: docRef.id,
        ...newNoteDataForDb,
        createdAt: createdAtTimestamp.toDate().toISOString(),
    };
};

export const updateNoteContent = async (noteId: string, newContent: string, newCategory: NoteCategory): Promise<void> => {
     if (!isInitialized || !db) {
        throw new Error("Cannot update note, Firebase is not initialized.");
    }
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
        content: newContent,
        category: newCategory,
    });
};

export const deleteNoteById = async (noteId: string): Promise<void> => {
    if (!isInitialized || !db) {
        throw new Error("Cannot delete note, Firebase is not initialized.");
    }
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);
};