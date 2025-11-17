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

export type FirebaseStatus = 
  | { status: 'initializing' }
  | { status: 'connected' }
  | { status: 'error', message: string, rawValue?: string };

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let notesCollection: CollectionReference<DocumentData> | null = null;
let isInitialized = false;

const getFirebaseConfig = (): { config: any } | { error: string, rawValue?: string } => {
    const configStr = import.meta.env.VITE_FIREBASE_CLIENT_CONFIG;

    if (!configStr) {
        return { 
            error: "VITE_FIREBASE_CLIENT_CONFIG environment variable is not defined.",
        };
    }
    
    try {
        const cleanedConfigStr = configStr.trim().replace(/^'|'$/g, '');
        if (!cleanedConfigStr) {
           return { 
                error: "VITE_FIREBASE_CLIENT_CONFIG is defined but is an empty string.",
                rawValue: configStr
            };
        }

        const config = JSON.parse(cleanedConfigStr);
        if (!config.apiKey || !config.projectId) {
            return {
                error: "The parsed configuration is missing required keys like 'apiKey' or 'projectId'.",
                rawValue: configStr
            };
        }
        return { config };
    } catch (e) {
        return {
            error: "Failed to parse the configuration string. Please ensure it is a valid, single-line JSON object.",
            rawValue: configStr
        };
    }
};

/**
 * Initializes the Firebase app and Firestore services.
 * @returns {Promise<FirebaseStatus>} A promise that resolves to a detailed status object.
 */
export const initializeFirebaseService = async (): Promise<FirebaseStatus> => {
    if (isInitialized) return { status: 'connected' };

    const configResult = getFirebaseConfig();

    if ('error' in configResult) {
        console.error("Firebase Initialization Error:", configResult.error);
        isInitialized = false;
        return { status: 'error', message: configResult.error, rawValue: configResult.rawValue };
    }

    try {
        if (!getApps().length) {
            app = initializeApp(configResult.config);
        } else {
            app = getApps()[0];
        }
        
        db = getFirestore(app);
        notesCollection = collection(db, 'notes');
        isInitialized = true;
        console.log("Firebase service initialized successfully.");
        return { status: 'connected' };

    } catch (error: any) {
        console.error("Firebase Error: Failed to initialize Firebase app.", error);
        isInitialized = false;
        return { 
            status: 'error', 
            message: `Firebase SDK failed to initialize. Error: ${error.message || 'Unknown error'}. Please double-check your credentials.`, 
            rawValue: import.meta.env.VITE_FIREBASE_CLIENT_CONFIG 
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