
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, CollectionReference, doc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { getStorage, FirebaseStorage, ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
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

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

// Define collections
let notesCollection: CollectionReference;
let actualsCollection: CollectionReference;
let goalsCollection: CollectionReference;
let deploymentsCollection: CollectionReference;
let directorsCollection: CollectionReference;
let budgetsCollection: CollectionReference;

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
        app = initializeApp(firebaseConfig);
        console.log("[Firebase Init] ✅ App initialized");

        console.log("[Firebase Init] Getting Firestore instance...");
        db = getFirestore(app);
        console.log("[Firebase Init] Firestore instance created");

        console.log("[Firebase Init] Getting Storage instance...");
        storage = getStorage(app);

        console.log("[Firebase Init] Creating collection references...");
        // Initialize collections after db is set
        notesCollection = collection(db, 'notes');
        actualsCollection = collection(db, 'performance_actuals');
        goalsCollection = collection(db, 'goals');
        deploymentsCollection = collection(db, 'deployments');
        directorsCollection = collection(db, 'directors');
        budgetsCollection = collection(db, 'budgets');

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
    const directorsSnapshot = await getDocs(directorsCollection);
    if (directorsSnapshot.empty) {
        console.log("Directors collection is empty. Seeding initial data...");
        const batch = writeBatch(db);
        DIRECTORS.forEach(director => {
            const docRef = doc(directorsCollection, director.id);
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
        const imageRef = ref(storage, `notes_images/${new Date().toISOString()}.jpg`);
        const snapshot = await uploadString(imageRef, imageDataUrl, 'data_url');
        imageRefUrl = await getDownloadURL(snapshot.ref);
    }

    const newNote: Omit<Note, 'id'> = {
        monthlyPeriodLabel,
        category,
        content,
        scope,
        createdAt: new Date().toISOString(),
        imageUrl: imageRefUrl || undefined,
    };
    const docRef = await addDoc(notesCollection, newNote);
    return { id: docRef.id, ...newNote };
};

export const getNotes = async (): Promise<Note[]> => {
    const q = query(notesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
};

export const updateNoteContent = async (noteId: string, newContent: string, newCategory: NoteCategory): Promise<void> => {
    const noteRef = doc(notesCollection, noteId);
    await updateDoc(noteRef, { content: newContent, category: newCategory });
};

export const deleteNoteById = async (noteId: string): Promise<void> => {
    const noteRef = doc(notesCollection, noteId);
    await deleteDoc(noteRef);
};

// --- Performance Data Functions ---

export const savePerformanceDataForPeriod = async (storeId: string, period: Period, data: PerformanceData): Promise<void> => {
    const docId = `${storeId}_${period.startDate.getFullYear()}-${String(period.startDate.getMonth() + 1).padStart(2, '0')}-${String(period.startDate.getDate()).padStart(2, '0')}`;
    const docRef = doc(actualsCollection, docId);
    await setDoc(docRef, {
        storeId,
        workStartDate: period.startDate.toISOString(),
        data: data
    }, { merge: true });
};

export const getPerformanceData = async (): Promise<StorePerformanceData[]> => {
    const snapshot = await getDocs(actualsCollection);
    return snapshot.docs.map(docSnap => {
        const docData = docSnap.data();
        const docId = docSnap.id;

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
        const q = query(
            actualsCollection,
            where('workStartDate', '>=', startDateStr),
            where('workStartDate', '<=', endDateStr)
        );

        const snapshot = await getDocs(q);

        // Filter and aggregate
        const aggregated: PerformanceData = {};
        let docCount = 0;

        snapshot.docs.forEach(docSnap => {
            const docData = docSnap.data();

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
    const snapshot = await getDocs(directorsCollection);
    return snapshot.docs.map(docSnap => docSnap.data() as DirectorProfile);
};

export const addGoal = async (directorId: string, quarter: number, year: number, kpi: Kpi, target: number): Promise<Goal> => {
    const newGoal = { directorId, quarter, year, kpi, target, status: 'On Track' };
    const docRef = await addDoc(goalsCollection, newGoal);
    return { id: docRef.id, ...newGoal } as Goal;
};

export const getGoals = async (directorId: string): Promise<Goal[]> => {
    const q = query(goalsCollection, where('directorId', '==', directorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }) as Goal);
};

export const updateGoal = async (goalId: string, newTarget: number, newStatus: string): Promise<void> => {
    const goalRef = doc(goalsCollection, goalId);
    await updateDoc(goalRef, { target: newTarget, status: newStatus });
};

// --- Deployments ---
export const getDeploymentsForDirector = async (directorId: string): Promise<Deployment[]> => {
    const q = query(deploymentsCollection, where('directorId', '==', directorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Deployment));
};

export const createDeployment = async (deployment: Omit<Deployment, 'id'>): Promise<Deployment> => {
    const docRef = await addDoc(deploymentsCollection, {
        ...deployment,
        createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...deployment };
};

export const updateDeployment = async (id: string, deployment: Partial<Deployment>): Promise<void> => {
    const deploymentRef = doc(deploymentsCollection, id);
    await updateDoc(deploymentRef, deployment);
};

export const deleteDeployment = async (id: string): Promise<void> => {
    const deploymentRef = doc(deploymentsCollection, id);
    await deleteDoc(deploymentRef);
};

// --- Budgets ---
export const getBudgets = async (year: number): Promise<Budget[]> => {
    const q = query(budgetsCollection, where('year', '==', year));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => docSnap.data() as Budget);
};

export const saveBudgets = async (budgets: Budget[]): Promise<void> => {
    const batch = writeBatch(db);
    budgets.forEach(budget => {
        const docId = `${budget.storeId}_${budget.year}_${budget.month}`;
        const docRef = doc(budgetsCollection, docId);
        batch.set(docRef, budget);
    });
    await batch.commit();
};

// --- File Uploads ---

export const uploadFile = async (file: File, onProgress: (progress: number) => void): Promise<FileUploadResult> => {
    const uploadId = `${Date.now()}-${file.name}`;
    const fileRef = ref(storage, `uploads/${uploadId}`);

    // Note: Firebase v9+ doesn't have observable upload progress in the same way
    // We'll upload directly
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Call onProgress with 100% since we can't track it incrementally easily with modular SDK
    onProgress(100);

    return {
        filePath: fileRef.fullPath,
        uploadId,
        mimeType: file.type,
        fileName: file.name,
        fileUrl: downloadURL
    };
};

export const uploadTextAsFile = async (text: string, fileName: string): Promise<FileUploadResult> => {
    const blob = new Blob([text], { type: 'text/plain' });
    const uploadId = `${Date.now()}-${fileName}`;
    const fileRef = ref(storage, `uploads/${uploadId}`);
    await uploadBytes(fileRef, blob);
    const downloadURL = await getDownloadURL(fileRef);
    return {
        filePath: fileRef.fullPath,
        uploadId,
        mimeType: 'text/plain',
        fileName,
        fileUrl: downloadURL,
    };
}
