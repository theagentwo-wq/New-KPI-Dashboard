import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Note, NoteCategory, View } from '../types';

// IMPORTANT: This configuration should be stored securely in environment variables.
// Vite exposes env vars prefixed with `VITE_` to the client.
const firebaseConfigString = process.env.VITE_FIREBASE_CLIENT_CONFIG;
if (!firebaseConfigString) {
    console.error("Firebase config not found. Please set VITE_FIREBASE_CLIENT_CONFIG in your environment variables.");
}
// Using a try-catch block to prevent the app from crashing if the JSON is malformed
let firebaseConfig = {};
try {
    firebaseConfig = firebaseConfigString ? JSON.parse(firebaseConfigString) : {};
} catch (e) {
    console.error("Failed to parse VITE_FIREBASE_CLIENT_CONFIG. Please ensure it's a valid JSON string.", e);
}


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const db = getFirestore(app);
const notesCollection = collection(db, 'notes');

export const getNotes = async (): Promise<Note[]> => {
    const q = query(notesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Firestore timestamps need to be converted to ISO strings for consistency
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        } as Note;
    });
};

export const addNote = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageUrl?: string): Promise<Note> => {
    const newNoteData = {
        monthlyPeriodLabel,
        category,
        content,
        view: scope.view,
        storeId: scope.storeId || null,
        imageUrl: imageUrl || null,
        createdAt: Timestamp.now(), // Use Firestore Timestamp for proper ordering
    };
    const docRef = await addDoc(notesCollection, newNoteData);
    return {
        id: docRef.id,
        ...newNoteData,
        createdAt: (newNoteData.createdAt).toDate().toISOString(),
    };
};

export const updateNoteContent = async (noteId: string, newContent: string, newCategory: NoteCategory): Promise<void> => {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
        content: newContent,
        category: newCategory,
    });
};

export const deleteNoteById = async (noteId: string): Promise<void> => {
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);
};