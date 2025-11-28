
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
        console.log("[Firebase Init] Starting initialization...");
        let firebaseConfig;

        try {
            console.log("[Firebase Init] Attempting to fetch /__/firebase/init.json");
            const response = await fetch('/__/firebase/init.json');
            if (response.ok) {
                firebaseConfig = await response.json();
                console.log("[Firebase Init] ✅ Config loaded from /__/firebase/init.json");
            } else {
                console.log("[Firebase Init] /__/firebase/init.json returned status:", response.status);
            }
        } catch (e) {
            console.log("[Firebase Init] Fetch failed, trying env var...", e);
        }

        if (!firebaseConfig) {
            console.log("[Firebase Init] Checking VITE_FIREBASE_CLIENT_CONFIG...");
            const envConfig = import.meta.env.VITE_FIREBASE_CLIENT_CONFIG;
            console.log("[Firebase Init] VITE_FIREBASE_CLIENT_CONFIG exists?", !!envConfig);
            if (envConfig) {
                // Handle both object (if already parsed) and string formats
                firebaseConfig = typeof envConfig === 'string' ? JSON.parse(envConfig) : envConfig;
                console.log("[Firebase Init] ✅ Config loaded from VITE_FIREBASE_CLIENT_CONFIG");
            }
        }

        if (!firebaseConfig) {
            throw new Error("Firebase config not found. Checked /__/firebase/init.json and VITE_FIREBASE_CLIENT_CONFIG.");
        }

        console.log("[Firebase Init] Config obtained, initializing app...");
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("[Firebase Init] ✅ App initialized");
        } else {
            console.log("[Firebase Init] App already initialized");
        }

        console.log("[Firebase Init] Getting Firestore instance...");
        db = firebase.firestore();
        console.log("[Firebase Init] Firestore instance:", typeof db, db);

        console.log("[Firebase Init] Getting Storage instance...");
        storage = firebase.storage();

        console.log("[Firebase Init] Creating collection references...");
        // Initialize collections after db is set
        notesCollection = db.collection('notes');
        console.log("[Firebase Init] notesCollection type:", typeof notesCollection, "has get?", typeof notesCollection.get);

        actualsCollection = db.collection('performance_actuals');
        goalsCollection = db.collection('goals');
        deploymentsCollection = db.collection('deployments');
        directorsCollection = db.collection('directors');
        budgetsCollection = db.collection('budgets');

        console.log("[Firebase Init] All collections created. Starting seed...");
        await seedInitialData();
        console.log("[Firebase Init] ✅ Initialization complete!");
        return { status: 'connected' };
    } catch (error) {
        console.error("[Firebase Init] ❌ ERROR:", error);
        console.error("[Firebase Init] Error stack:", (error as Error).stack);
        return { status: 'error', message: (error as Error).message, error: (error as Error).message };
    }
};

// --- Seeding ---

const seedInitialData = async () => {
    const directorsSnapshot = await directorsCollection.get();
    if (directorsSnapshot.empty) {
        console.log("Directors collection is empty. Seeding initial data...");
        const batch = db.batch();
        DIRECTORS.forEach(director => {
            const docRef = directorsCollection.doc(director.id);
            batch.set(docRef, director);
        });
        await batch.commit();
        console.log("Seeded directors.");
    }
};

// --- Notes Functions ---

export const addNote = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string): Promise<Note> => {
    let imageRefUrl = '';
    if (imageDataUrl) {
        const imageRef = storage.ref().child(`notes_images/${new Date().toISOString()}.jpg`);
        const snapshot = await imageRef.putString(imageDataUrl, 'data_url');
        imageRefUrl = await snapshot.ref.getDownloadURL();
    }

    const newNote: Omit<Note, 'id'> = {
        monthlyPeriodLabel,
        category,
        content,
        scope,
        createdAt: new Date().toISOString(),
        imageUrl: imageRefUrl || undefined,
    };
    const docRef = await notesCollection.add(newNote);
    return { id: docRef.id, ...newNote };
};

export const getNotes = async (): Promise<Note[]> => {
    const snapshot = await notesCollection.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
};

export const updateNoteContent = async (noteId: string, newContent: string, newCategory: NoteCategory): Promise<void> => {
    await notesCollection.doc(noteId).update({ content: newContent, category: newCategory });
};

export const deleteNoteById = async (noteId: string): Promise<void> => {
    await notesCollection.doc(noteId).delete();
};

// --- Performance Data Functions ---

export const savePerformanceDataForPeriod = async (storeId: string, period: Period, data: PerformanceData): Promise<void> => {
    const docId = `${storeId}_${period.startDate.getFullYear()}-${String(period.startDate.getMonth() + 1).padStart(2, '0')}-${String(period.startDate.getDate()).padStart(2, '0')}`;
    await actualsCollection.doc(docId).set({
        storeId,
        workStartDate: period.startDate.toISOString(),
        data: data
    }, { merge: true });
};

export const getPerformanceData = async (): Promise<StorePerformanceData[]> => {
    const snapshot = await actualsCollection.get();
    return snapshot.docs.map(doc => {
        const docData = doc.data();
        const docId = doc.id;

        // ID format is "Store Name, ST_YYYY-MM-DD" or "Store_Name_ST_YYYY-MM-DD"
        const lastUnderscoreIndex = docId.lastIndexOf('_');
        const dateStr = docId.substring(lastUnderscoreIndex + 1); // "YYYY-MM-DD"

        const dateParts = dateStr.split('-').map(Number);
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];

        return {
            storeId: docData.storeId,
            year: year,
            month: month,
            day: day,
            data: docData.data as PerformanceData
        } as StorePerformanceData;
    });
};

export const getAggregatedPerformanceDataForPeriod = async (period: Period, storeId?: string): Promise<PerformanceData> => {
    try {
        // Convert dates to ISO strings for querying
        const startDateStr = period.startDate.toISOString();
        const endDateStr = period.endDate.toISOString();

        // Build query
        let query = actualsCollection
            .where('workStartDate', '>=', startDateStr)
            .where('workStartDate', '<=', endDateStr);

        // If storeId is provided, we need to filter after fetching since we can't have multiple inequality filters
        const snapshot = await query.get();

        // Filter and aggregate
        const aggregated: PerformanceData = {};
        let docCount = 0;

        snapshot.docs.forEach(doc => {
            const docData = doc.data();

            // Apply storeId filter if specified
            if (storeId && docData.storeId !== storeId) {
                return;
            }

            docCount++;
            const data = docData.data as PerformanceData;

            // Aggregate each KPI
            if (data) {
                Object.keys(data).forEach(kpi => {
                    const value = data[kpi as Kpi];
                    if (typeof value === 'number') {
                        if (!aggregated[kpi as Kpi]) {
                            aggregated[kpi as Kpi] = 0;
                        }
                        aggregated[kpi as Kpi]! += value;
                    }
                });
            }
        });

        console.log(`Aggregated ${docCount} documents for period ${period.label}${storeId ? ` (store: ${storeId})` : ''}`);
        return aggregated;
    } catch (error) {
        console.error('Error fetching aggregated performance data:', error);
        return {};
    }
}

// --- Director & Goals Functions ---

export const getDirectorProfiles = async (): Promise<DirectorProfile[]> => {
    const snapshot = await directorsCollection.get();
    return snapshot.docs.map((doc: firebase.firestore.DocumentData) => doc.data() as DirectorProfile);
};

export const addGoal = async (directorId: string, quarter: number, year: number, kpi: Kpi, target: number): Promise<Goal> => {
    const newGoal = { directorId, quarter, year, kpi, target, status: 'On Track' };
    const docRef = await goalsCollection.add(newGoal);
    return { id: docRef.id, ...newGoal } as Goal;
};

export const getGoals = async (directorId: string): Promise<Goal[]> => {
    const snapshot = await goalsCollection.where('directorId', '==', directorId).get();
    return snapshot.docs.map((doc: firebase.firestore.DocumentData) => ({ id: doc.id, ...doc.data() }) as Goal);
};

export const updateGoal = async (goalId: string, newTarget: number, newStatus: string): Promise<void> => {
    await goalsCollection.doc(goalId).update({ target: newTarget, status: newStatus });
};

// --- Deployments ---
export const getDeploymentsForDirector = async (directorId: string): Promise<Deployment[]> => {
    const snapshot = await deploymentsCollection.where('directorId', '==', directorId).get();
    return snapshot.docs.map((doc: firebase.firestore.DocumentData) => ({ id: doc.id, ...doc.data() } as Deployment));
};

export const createDeployment = async (deployment: Omit<Deployment, 'id'>): Promise<Deployment> => {
    const docRef = await deploymentsCollection.add({
        ...deployment,
        createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...deployment };
};

export const updateDeployment = async (id: string, deployment: Partial<Deployment>): Promise<void> => {
    await deploymentsCollection.doc(id).update(deployment);
};

export const deleteDeployment = async (id: string): Promise<void> => {
    await deploymentsCollection.doc(id).delete();
};

// --- Budgets ---
export const getBudgets = async (year: number): Promise<Budget[]> => {
    const snapshot = await budgetsCollection.where('year', '==', year).get();
    return snapshot.docs.map((doc: firebase.firestore.DocumentData) => doc.data() as Budget);
};

export const saveBudgets = async (budgets: Budget[]): Promise<void> => {
    const batch = db.batch();
    budgets.forEach(budget => {
        const docId = `${budget.storeId}_${budget.year}_${budget.month}`;
        const docRef = budgetsCollection.doc(docId);
        batch.set(docRef, budget);
    });
    await batch.commit();
};

// --- File Uploads ---

export const uploadFile = async (file: File, onProgress: (progress: number) => void): Promise<FileUploadResult> => {
    const storageRef = storage.ref();
    const uploadId = `${Date.now()}-${file.name}`;
    const fileRef = storageRef.child(`uploads/${uploadId}`);
    const uploadTask = fileRef.put(file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.error("Upload Error:", error);
                reject(error);
            },
            async () => {
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                resolve({
                    filePath: fileRef.fullPath,
                    uploadId,
                    mimeType: file.type,
                    fileName: file.name,
                    fileUrl: downloadURL
                });
            }
        );
    });
};

export const uploadTextAsFile = async (text: string, fileName: string): Promise<FileUploadResult> => {
    const blob = new Blob([text], { type: 'text/plain' });
    const uploadId = `${Date.now()}-${fileName}`;
    const storageRef = storage.ref();
    const fileRef = storageRef.child(`uploads/${uploadId}`);
    await fileRef.put(blob);
    const downloadURL = await fileRef.getDownloadURL();
    return {
        filePath: fileRef.fullPath,
        uploadId,
        mimeType: 'text/plain',
        fileName,
        fileUrl: downloadURL,
    };
}

