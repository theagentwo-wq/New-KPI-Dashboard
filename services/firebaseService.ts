import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, Firestore, CollectionReference, DocumentData, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { Note, NoteCategory, View, DirectorProfile } from '../types';
import { DIRECTORS as fallbackDirectors } from '../constants';


export type FirebaseStatus = 
  | { status: 'initializing' }
  | { status: 'connected' }
  | { status: 'error', message: string, rawValue?: string };

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let notesCollection: CollectionReference<DocumentData> | null = null;
let directorsCollection: CollectionReference<DocumentData> | null = null;
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
            let rawValue;
            try {
                const errorBody = await response.json();
                errorText = errorBody.error || errorText;
                rawValue = errorBody.rawValue; // Capture the raw value from the error response
            } catch (e) {
                 const rawResponse = await response.text();
                 errorText += ` Raw response: "${rawResponse}"`;
            }
            // Create a custom error object to pass the rawValue
            const error = new Error(`[Proxy Error] ${errorText}`);
            (error as any).rawValue = rawValue;
            throw error;
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
        storage = getStorage(app);
        notesCollection = collection(db, 'notes');
        directorsCollection = collection(db, 'directors');
        isInitialized = true;
        console.log("Firebase service initialized successfully.");
        return { status: 'connected' };

    } catch (error: any) {
        console.error("Firebase Initialization Error:", error);
        isInitialized = false;
        
        const finalMessage = `The config value from your Netlify settings is invalid and could not be parsed. This is almost always a copy-paste error. Please carefully follow the updated instructions in the README.`;

        return { 
            status: 'error', 
            message: finalMessage,
            rawValue: error.rawValue || 'Could not retrieve raw value from server.'
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
            const createdAt = data.createdAt instanceof Timestamp 
                ? data.createdAt.toDate().toISOString()
                : new Date().toISOString(); // Fallback to current time if invalid

            const note: Note = {
                id: doc.id,
                monthlyPeriodLabel: data.monthlyPeriodLabel,
                view: data.view,
                category: data.category,
                content: data.content,
                createdAt: createdAt,
                storeId: data.storeId ?? undefined,
                imageUrl: data.imageUrl ?? undefined,
            };
            return note;
        });
    } catch (error) {
        console.error("Error fetching notes from Firestore:", error);
        if (error instanceof Error) {
            if (error.message.includes("permission-denied") || error.message.includes("PERMISSION_DENIED")) {
                throw new Error("Permission denied. Please check your Firestore Security Rules to allow reads on the 'notes' collection. See the README for instructions.");
            }
            if (error.message.includes("failed-precondition") || error.message.includes("requires an index")) {
                const urlMatch = error.message.match(/https?:\/\/[^\s)]*/);
                const indexLink = urlMatch ? urlMatch[0] : "Please check the developer console for an index creation link.";
                throw new Error(`A Firestore index is required for this query. Please see the README for instructions, or create the index here: ${indexLink}`);
            }
        }
        throw error;
    }
};

export const uploadNoteAttachment = async (noteId: string, imageDataUrl: string): Promise<string> => {
    if (!storage) {
        throw new Error("Cannot upload attachment, Firebase Storage is not initialized.");
    }
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const fileExtension = blob.type.split('/')[1] || 'jpg';
    const storageRef = ref(storage, `note_attachments/${noteId}/attachment-${Date.now()}.${fileExtension}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};

export const addNote = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string): Promise<Note> => {
    if (!isInitialized || !notesCollection || !db) {
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
    
    // Add the note document first to get an ID
    const docRef = await addDoc(notesCollection, newNoteDataForDb);
    
    let finalImageUrl: string | undefined = undefined;

    // If an image was provided, upload it and update the note document
    if (imageDataUrl) {
        try {
            finalImageUrl = await uploadNoteAttachment(docRef.id, imageDataUrl);
            const noteRef = doc(db, 'notes', docRef.id);
            await updateDoc(noteRef, { imageUrl: finalImageUrl });
        } catch (uploadError) {
            console.error("Failed to upload note attachment, but note was saved without image.", uploadError);
        }
    }
    
    return {
        id: docRef.id,
        ...newNoteDataForDb,
        createdAt: createdAtTimestamp.toDate().toISOString(),
        imageUrl: finalImageUrl,
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

export const getDirectorProfiles = async (): Promise<DirectorProfile[]> => {
    if (!isInitialized || !db || !directorsCollection) {
        console.error("Firebase not initialized. Cannot fetch director profiles. Returning fallback data.");
        return fallbackDirectors;
    }
    try {
        const snapshot = await getDocs(directorsCollection);
        if (snapshot.empty) {
            console.log("No director profiles found in Firestore, seeding with initial data...");
            const batch = writeBatch(db);
            fallbackDirectors.forEach(director => {
                const docRef = doc(directorsCollection!, director.id);
                batch.set(docRef, director);
            });
            await batch.commit();
            return fallbackDirectors;
        }
        return snapshot.docs.map(doc => doc.data() as DirectorProfile);
    } catch (error) {
        console.error("Error fetching director profiles:", error);
        return fallbackDirectors; // Return fallback data on error
    }
};

export const uploadDirectorPhoto = async (directorId: string, file: File): Promise<string> => {
    if (!isInitialized || !storage) {
        throw new Error("Cannot upload photo, Firebase Storage is not initialized.");
    }
    const storageRef = ref(storage, `director_photos/${directorId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};

export const updateDirectorPhotoUrl = async (directorId: string, photoUrl: string): Promise<void> => {
    if (!isInitialized || !db) {
        throw new Error("Cannot update photo URL, Firebase is not initialized.");
    }
    const directorRef = doc(db, 'directors', directorId);
    await updateDoc(directorRef, { photo: photoUrl });
};