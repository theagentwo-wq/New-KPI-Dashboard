// Fix: Manually declare Vite environment variables for TypeScript.
// This is a workaround for environments where the standard `/// <reference types="vite/client" />`
// directive is not being resolved correctly, causing build errors.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_FIREBASE_CLIENT_CONFIG: string;
    }
  }
}

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, Firestore, CollectionReference, DocumentData } from 'firebase/firestore';
import { Note, NoteCategory, View } from '../types';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let notesCollection: CollectionReference<DocumentData> | null = null;
let isInitialized = false;

/**
 * Parses the Firebase config from environment variables.
 * This is a common failure point, so we make it robust.
 * @returns A parsed Firebase config object or null.
 */
const getFirebaseConfig = () => {
    const configStr = import.meta.env.VITE_FIREBASE_CLIENT_CONFIG;

    if (!configStr) {
        console.error(
            "Firebase Error: VITE_FIREBASE_CLIENT_CONFIG is not defined.",
            "Please check your .env file or environment variables."
        );
        return null;
    }

    try {
        // Attempt to clean up common copy-paste errors, like outer single quotes
        const cleanedConfigStr = configStr.trim().replace(/^'|'$/g, '');
        const config = JSON.parse(cleanedConfigStr);

        // Basic validation
        if (!config.apiKey || !config.projectId) {
            console.error(
                "Firebase Error: The parsed VITE_FIREBASE_CLIENT_CONFIG is missing required keys like 'apiKey' or 'projectId'."
            );
            return null;
        }

        return config;
    } catch (error) {
        console.error(
            "Firebase Error: Failed to parse VITE_FIREBASE_CLIENT_CONFIG.",
            "Please ensure it's a valid, single-line JSON string.",
            "Received:", configStr,
            "Error:", error
        );
        return null;
    }
};

/**
 * Initializes the Firebase app and Firestore services.
 * This function must be called once when the application starts.
 * @returns {Promise<boolean>} A promise that resolves to true if initialization is successful, false otherwise.
 */
export const initializeFirebaseService = async (): Promise<boolean> => {
    if (isInitialized) {
        return true;
    }

    const firebaseConfig = getFirebaseConfig();

    if (!firebaseConfig) {
        return false;
    }

    try {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApps()[0];
        }
        
        db = getFirestore(app);
        notesCollection = collection(db, 'notes');
        
        isInitialized = true;
        console.log("Firebase service initialized successfully.");
        return true;

    } catch (error) {
        console.error("Firebase Error: Failed to initialize Firebase app.", error);
        isInitialized = false;
        return false;
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
            const data = doc.data();
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
