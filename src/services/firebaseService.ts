
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import { 
    Kpi, 
    View, 
    Period, 
    PerformanceData, 
    StorePerformanceData, 
    Note, 
    Goal, 
    DirectorProfile, 
    Deployment, 
    FileUploadResult,
    FirebaseStatus,
    NoteCategory,
    Budget
} from '../types';
import { DIRECTORS } from '../constants';

// --- Firebase Initialization ---

let db: firebase.firestore.Firestore;
let storage: firebase.storage.Storage;

// Define collections
let notesCollection: firebase.firestore.CollectionReference;
let actualsCollection: firebase.firestore.CollectionReference;
let goalsCollection: firebase.firestore.CollectionReference;
let deploymentsCollection: firebase.firestore.CollectionReference;
let directorsCollection: firebase.firestore.CollectionReference;
let budgetsCollection: firebase.firestore.CollectionReference;


export const initializeFirebaseService = async (): Promise<FirebaseStatus> => {
    try {
        const configStr = import.meta.env.VITE_FIREBASE_CLIENT_CONFIG;
        if (!configStr) {
            throw new Error("Firebase client config not found in environment variables.");
        }
        const firebaseConfig = JSON.parse(configStr);

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        db = firebase.firestore();
        storage = firebase.storage();

        // Set up collections
        notesCollection = db.collection('notes');
        actualsCollection = db.collection('performance_actuals');
        goalsCollection = db.collection('goals');
        deploymentsCollection = db.collection('deployments');
        directorsCollection = db.collection('directors');
        budgetsCollection = db.collection('budgets');
        
        console.log("Firebase connected successfully");

        // Seed initial directors if collection is empty
        const directorsSnapshot = await directorsCollection.limit(1).get();
        if (directorsSnapshot.empty) {
            console.log("Directors collection is empty. Seeding initial data...");
            const batch = db.batch();
            DIRECTORS.forEach(director => {
                const docRef = directorsCollection.doc(director.id);
                batch.set(docRef, director);
            });
            await batch.commit();
            console.log("Seeded directors data.");
        }

        return { status: 'connected' };

    } catch (error) {
        console.error("Firebase initialization error:", error);
        return { status: 'error', error: (error as Error).message };
    }
};

// --- Notes Functions ---

export const getNotes = async (): Promise<Note[]> => {
    const snapshot = await notesCollection.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
};

export const addNote = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string): Promise<Note> => {
    let imageUrl = '';
    if (imageDataUrl) {
        const imageRef = storage.ref(`notes_images/${new Date().getTime()}_${Math.random().toString(36).substring(2, 15)}`);
        await imageRef.putString(imageDataUrl, 'data_url');
        imageUrl = await imageRef.getDownloadURL();
    }

    const newNote = {
        content,
        category,
        scope,
        monthlyPeriodLabel,
        imageUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await notesCollection.add(newNote);
    return { id: docRef.id, ...newNote, createdAt: new Date().toISOString() } as unknown as Note;
};

export const updateNoteContent = async (noteId: string, newContent: string, newCategory: NoteCategory): Promise<void> => {
    await notesCollection.doc(noteId).update({ content: newContent, category: newCategory });
};

export const deleteNoteById = async (noteId: string): Promise<void> => {
    await notesCollection.doc(noteId).delete();
};


// --- Performance Data Functions ---

export const savePerformanceDataForPeriod = async (storeId: string, period: Period, data: PerformanceData): Promise<void> => {
    const docId = `${storeId}_${period.startDate.getFullYear()}_${period.startDate.getMonth() + 1}`;
    await actualsCollection.doc(docId).set({
        storeId,
        year: period.startDate.getFullYear(),
        month: period.startDate.getMonth() + 1,
        ...data
    }, { merge: true });
};

export const getPerformanceData = async (startDate: Date, endDate: Date): Promise<StorePerformanceData[]> => {
    // This function would query based on date range. For now, it returns all data.
    const snapshot = await actualsCollection.get();
    return snapshot.docs.map(doc => ({
        storeId: doc.data().storeId,
        data: doc.data() as PerformanceData
    } as StorePerformanceData));
};

export const getAggregatedPerformanceDataForPeriod = async (storeId: string, period: Period): Promise<PerformanceData> => {
    const docId = `${storeId}_${period.startDate.getFullYear()}_${period.startDate.getMonth() + 1}`;
    const doc = await actualsCollection.doc(docId).get();
    return (doc.exists ? doc.data() : {}) as PerformanceData;
};


// --- Director & Goals Functions ---

export const getDirectorProfiles = async (): Promise<DirectorProfile[]> => {
    const snapshot = await directorsCollection.get();
    return snapshot.docs.map(doc => doc.data() as DirectorProfile);
};

export const addGoal = async (directorId: string, quarter: number, year: number, kpi: Kpi, target: number): Promise<Goal> => {
    const newGoal = { directorId, quarter, year, kpi, target, status: 'On Track' };
    const docRef = await goalsCollection.add(newGoal);
    return { id: docRef.id, ...newGoal } as Goal;
};

export const getGoalsForDirector = async (directorId: string, period: Period): Promise<Goal[]> => {
    const snapshot = await goalsCollection.where('directorId', '==', directorId).where('year', '==', period.endDate.getFullYear()).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
};

// --- Budget Functions ---

export const getBudgets = async (year: number): Promise<Budget[]> => {
    const snapshot = await budgetsCollection.where('year', '==', year).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
};


// --- Deployment Functions ---

export const addDeployment = async (deployment: Omit<Deployment, 'id' | 'createdAt'>): Promise<string> => {
    const newDeploymentRef = await deploymentsCollection.add({
        ...deployment,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return newDeploymentRef.id;
};

export const updateDeployment = async (deploymentId: string, updates: Partial<Deployment>): Promise<void> => {
    await deploymentsCollection.doc(deploymentId).update(updates);
};

export const deleteDeployment = async (deploymentId: string): Promise<void> => {
    await deploymentsCollection.doc(deploymentId).delete();
};

export const getDeploymentsForDirector = async (directorId: string): Promise<Deployment[]> => {
    if (!deploymentsCollection) return [];
    const q = deploymentsCollection.where('directorId', '==', directorId);
    const snapshot = await q.get();
    return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() // Handle potential server timestamp
    } as Deployment));
};

// --- File Upload Stubs ---

export const uploadFile = async (file: File): Promise<FileUploadResult> => {
    console.log("Uploading file:", file.name);
    const uploadId = new Date().getTime().toString();
    // Stub implementation
    return {
        fileName: file.name,
        filePath: `uploads/${file.name}`,
        mimeType: file.type,
        uploadId: uploadId,
        fileUrl: ''
    };
};

export const uploadTextAsFile = async (text: string, fileName: string): Promise<FileUploadResult> => {
    console.log("Uploading text as file:", fileName);
    const blob = new Blob([text], { type: 'text/plain' });
    const uploadId = new Date().getTime().toString();
    // Stub implementation
     return {
        fileName: fileName,
        filePath: `uploads/${fileName}`,
        mimeType: 'text/plain',
        uploadId: uploadId,
        fileUrl: ''
    };
};
