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
            const errorBody = await response.json().catch(() => ({ error: 'Proxy request failed' }));
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
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
        return { 
            status: 'error', 
            message: `Could not connect to the database. Failed to fetch or initialize Firebase configuration. Error: ${error.message || 'Unknown error'}. Please ensure the FIREBASE_CLIENT_CONFIG variable is set correctly in your Netlify deployment settings and does not have a 'VITE_' prefix.`
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
            // FIX: Cast `doc.data()` to `any` to resolve TypeScript errors about accessing properties on an 'unknown' type.
            // Firestore's `doc.data()` can return a loosely typed object, and this ensures we can access the expected fields.
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
    
    // Create a clean object, omitting undefined properties
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
