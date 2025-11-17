// Fix: Manually define the type for `import.meta.env` to resolve TypeScript errors
// when the `vite/client` type definitions are not being picked up correctly.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_FIREBASE_CLIENT_CONFIG: string;
    };
  }
}

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, Firestore, CollectionReference, DocumentData } from 'firebase/firestore';
import { Note, NoteCategory, View } from '../types';

let db: Firestore | null = null;
let notesCollection: CollectionReference<DocumentData> | null = null;

/**
 * This function attempts to initialize Firebase and Firestore.
 * It is designed to fail gracefully without crashing the app if the config is invalid.
 */
const initializeFirebase = () => {
    try {
        // Correctly access Vite environment variables using import.meta.env
        const firebaseConfigString = import.meta.env.VITE_FIREBASE_CLIENT_CONFIG;

        if (!firebaseConfigString) {
            console.error("Firebase config not found. VITE_FIREBASE_CLIENT_CONFIG is missing. Notes feature will be disabled.");
            return;
        }

        const firebaseConfig = JSON.parse(firebaseConfigString);

        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is empty. Please check VITE_FIREBASE_CLIENT_CONFIG. Notes feature will be disabled.");
            return;
        }

        let app: FirebaseApp;
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApps()[0];
        }
        db = getFirestore(app);
        notesCollection = collection(db, 'notes');
        console.log("Firebase service initialized successfully.");

    } catch (error) {
        console.error("Failed to initialize Firebase. Please check your VITE_FIREBASE_CLIENT_CONFIG. Notes feature will be disabled.", error);
        db = null; // Ensure db is null on failure
    }
};

// Initialize Firebase when the module is first loaded.
initializeFirebase();

export const isFirebaseInitialized = () => !!db;

export const getNotes = async (): Promise<Note[]> => {
    // Gracefully handle the case where Firebase initialization failed.
    if (!db || !notesCollection) {
        console.warn("Firebase not initialized, returning empty notes array.");
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
        // In case of a query error (e.g., permissions), return empty array
        return [];
    }
};

export const addNote = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageUrl?: string): Promise<Note> => {
    if (!db || !notesCollection) {
        throw new Error("Cannot add note, Firebase is not initialized.");
    }

    const createdAtTimestamp = Timestamp.now();
    
    const newNoteDataForDb = {
        monthlyPeriodLabel,
        category,
        content,
        view: scope.view,
        storeId: scope.storeId,
        imageUrl: imageUrl,
        createdAt: createdAtTimestamp,
    };
    
    const docRef = await addDoc(notesCollection, newNoteDataForDb);
    
    const newNote: Note = {
        id: docRef.id,
        monthlyPeriodLabel,
        category,
        content,
        view: scope.view,
        storeId: scope.storeId,
        imageUrl: imageUrl,
        createdAt: createdAtTimestamp.toDate().toISOString(),
    };

    return newNote;
};

export const updateNoteContent = async (noteId: string, newContent: string, newCategory: NoteCategory): Promise<void> => {
    if (!db) {
        throw new Error("Cannot update note, Firebase is not initialized.");
    }
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
        content: newContent,
        category: newCategory,
    });
};

export const deleteNoteById = async (noteId: string): Promise<void> => {
    if (!db) {
        throw new Error("Cannot delete note, Firebase is not initialized.");
    }
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);
};