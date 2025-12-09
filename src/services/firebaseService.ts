
import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { Firestore, collection, CollectionReference, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, writeBatch, initializeFirestore, memoryLocalCache } from 'firebase/firestore';
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
    Budget,
    FinancialLineItem
} from '../types';
import { DIRECTORS, STORE_DETAILS } from '../constants';

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

        // Check if Firebase is already initialized
        if (getApps().length > 0) {
            console.log("[Firebase Init] ⚠️ Firebase already initialized, skipping...");
            // Collections should already be set up, just return success
            if (db) {
                return { status: 'connected' };
            }
        }

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
        console.log("[Firebase Init] Firebase Config:", JSON.stringify(firebaseConfig, null, 2));
        console.log("[Firebase Init] Project ID:", firebaseConfig.projectId);
        console.log("[Firebase Init] API Key:", firebaseConfig.apiKey?.substring(0, 10) + "...");
        app = initializeApp(firebaseConfig);
        console.log("[Firebase Init] ✅ App initialized");

        console.log("[Firebase Init] Getting Firestore instance with MEMORY CACHE ONLY...");
        console.log("[Firebase Init] Connecting to database: 'firebaseapp'");

        // CRITICAL FIX: Use memory-only cache instead of IndexedDB persistence
        // Setting localCache to undefined was causing "client is offline" errors
        // CRITICAL FIX 2: Connect to 'firebaseapp' database instead of '(default)'
        // Data was imported to 'firebaseapp' database, not the default one
        // Database ID is passed as the third parameter
        db = initializeFirestore(app, {
            localCache: memoryLocalCache()
        }, 'firebaseapp');

        console.log("[Firebase Init] ✅ Firestore instance created (MEMORY CACHE ONLY)");

        // Access internal properties for debugging (using 'any' to bypass TypeScript)
        const dbAny = db as any;
        console.log("[Firebase Init] Database ID:", dbAny._databaseId?.database || '(default)');
        console.log("[Firebase Init] Project ID from DB:", dbAny._databaseId?.projectId);
        console.log("[Firebase Init] Database host:", dbAny._settings?.host || 'firestore.googleapis.com');

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

        console.log("[Firebase Init] All collections created.");
        // Removed automatic seeding to fix initialization errors
        // await seedInitialData();
        console.log("[Firebase Init] ✅ Initialization complete!");
        return { status: 'connected' };
    } catch (error) {
        console.error("[Firebase Init] ❌ ERROR:", error);
        console.error("[Firebase Init] Error stack:", (error as Error).stack);
        return { status: 'error', message: (error as Error).message, error: (error as Error).message };
    }
};

// --- Seeding ---
// Seeding removed from initialization to fix startup errors
// Can be called manually if needed
export const seedInitialData = async () => {
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
    try {
        console.log('[Firebase] addNote: Starting note creation...');
        console.log('[Firebase] addNote: Period:', monthlyPeriodLabel);
        console.log('[Firebase] addNote: Category:', category);
        console.log('[Firebase] addNote: Content:', content.substring(0, 50) + '...');
        console.log('[Firebase] addNote: Scope:', scope);
        console.log('[Firebase] addNote: Has image:', !!imageDataUrl);

        let imageRefUrl = '';
        if (imageDataUrl) {
            console.log('[Firebase] addNote: Uploading image to storage...');
            const imageRef = ref(storage, `notes_images/${new Date().toISOString()}.jpg`);
            const snapshot = await uploadString(imageRef, imageDataUrl, 'data_url');
            imageRefUrl = await getDownloadURL(snapshot.ref);
            console.log('[Firebase] addNote: Image uploaded successfully:', imageRefUrl);
        }

        // Build note object - only include imageUrl if it exists (Firestore doesn't support undefined)
        const newNote: Omit<Note, 'id'> = {
            monthlyPeriodLabel,
            category,
            content,
            scope,
            createdAt: new Date().toISOString(),
            ...(imageRefUrl && { imageUrl: imageRefUrl }), // Only add imageUrl if it exists
        };

        console.log('[Firebase] addNote: Writing to Firestore collection:', notesCollection.path);
        console.log('[Firebase] addNote: Note data:', newNote);
        const docRef = await addDoc(notesCollection, newNote);
        console.log('[Firebase] addNote: ✅ Note created successfully with ID:', docRef.id);

        return { id: docRef.id, ...newNote };
    } catch (error) {
        console.error('[Firebase] addNote: ❌ ERROR creating note:', error);
        throw error;
    }
};

export const getNotes = async (): Promise<Note[]> => {
    try {
        console.log('[Firebase] getNotes: Fetching notes from Firestore...');
        console.log('[Firebase] getNotes: Collection path:', notesCollection.path);
        const q = query(notesCollection, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        console.log('[Firebase] getNotes: Found', snapshot.size, 'notes');
        const notes = snapshot.docs.map(doc => {
            console.log('[Firebase] getNotes: Note ID:', doc.id, 'Data:', doc.data());
            return { id: doc.id, ...doc.data() } as Note;
        });
        console.log('[Firebase] getNotes: Returning', notes.length, 'notes');
        return notes;
    } catch (error) {
        console.error('[Firebase] getNotes: ERROR fetching notes:', error);
        return [];
    }
};

export const updateNoteContent = async (noteId: string, newContent: string, newCategory: NoteCategory, pinned?: boolean): Promise<void> => {
    try {
        console.log('[Firebase] updateNoteContent: Updating note ID:', noteId);
        console.log('[Firebase] updateNoteContent: New content:', newContent.substring(0, 50) + '...');
        console.log('[Firebase] updateNoteContent: New category:', newCategory);
        console.log('[Firebase] updateNoteContent: Pinned status:', pinned);
        const noteRef = doc(notesCollection, noteId);
        const updateData: any = { content: newContent, category: newCategory };
        if (pinned !== undefined) {
            updateData.pinned = pinned;
        }
        await updateDoc(noteRef, updateData);
        console.log('[Firebase] updateNoteContent: ✅ Note updated successfully');
    } catch (error) {
        console.error('[Firebase] updateNoteContent: ❌ ERROR updating note:', error);
        throw error;
    }
};

export const deleteNoteById = async (noteId: string): Promise<void> => {
    try {
        console.log('[Firebase] deleteNoteById: Deleting note ID:', noteId);
        const noteRef = doc(notesCollection, noteId);
        await deleteDoc(noteRef);
        console.log('[Firebase] deleteNoteById: ✅ Note deleted successfully');
    } catch (error) {
        console.error('[Firebase] deleteNoteById: ❌ ERROR deleting note:', error);
        throw error;
    }
};

// --- Performance Data Functions ---

export const checkExistingData = async (storeId: string, period: Period): Promise<PerformanceData | null> => {
    const docId = `${storeId}_${period.startDate.getFullYear()}-${String(period.startDate.getMonth() + 1).padStart(2, '0')}-${String(period.startDate.getDate()).padStart(2, '0')}`;
    const docRef = doc(actualsCollection, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data().data as PerformanceData;
    }
    return null;
};

export const clearPeriodData = async (period: Period, storeId?: string): Promise<number> => {
    try {
        const startDateStr = period.startDate.toISOString();
        const endDateStr = period.endDate.toISOString();

        // Query all documents within this period's date range
        const q = query(
            actualsCollection,
            where('workStartDate', '>=', startDateStr),
            where('workStartDate', '<=', endDateStr)
        );

        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        let deleteCount = 0;

        snapshot.docs.forEach(docSnap => {
            const docData = docSnap.data();
            // If storeId specified, only delete that store's data
            if (!storeId || docData.storeId === storeId) {
                batch.delete(docSnap.ref);
                deleteCount++;
            }
        });

        await batch.commit();
        console.log(`Cleared ${deleteCount} documents for period ${period.label}${storeId ? ` (store: ${storeId})` : ''}`);
        return deleteCount;
    } catch (error) {
        console.error('Error clearing period data:', error);
        throw error;
    }
};

export const savePerformanceDataForPeriod = async (storeId: string, period: Period, data: PerformanceData, pnl?: FinancialLineItem[]): Promise<void> => {
    const docId = `${storeId}_${period.startDate.getFullYear()}-${String(period.startDate.getMonth() + 1).padStart(2, '0')}-${String(period.startDate.getDate()).padStart(2, '0')}`;
    const docRef = doc(actualsCollection, docId);
    const docData: any = {
        storeId,
        workStartDate: period.startDate.toISOString(),
        data: data
    };

    // Include pnl array if provided
    if (pnl && pnl.length > 0) {
        docData.pnl = pnl;
    }

    await setDoc(docRef, docData, { merge: true });
};

export const getPerformanceData = async (): Promise<StorePerformanceData[]> => {
    console.log('[getPerformanceData] 🔍 Fetching all performance data from Firestore...');
    const snapshot = await getDocs(actualsCollection);
    console.log(`[getPerformanceData] ✅ Retrieved ${snapshot.size} documents from performance_actuals collection`);

    if (snapshot.size === 0) {
        console.warn('[getPerformanceData] ⚠️ No documents found in performance_actuals collection!');
        return [];
    }

    // Log first 3 document IDs to verify structure
    const docIds = snapshot.docs.slice(0, 3).map(d => d.id);
    console.log('[getPerformanceData] Sample document IDs:', docIds);

    const results = snapshot.docs.map(docSnap => {
        const docData = docSnap.data();
        const docId = docSnap.id;

        // ID format is "Store Name, ST_YYYY-MM-DD" or "Store_Name_ST_YYYY-MM-DD"
        const lastUnderscoreIndex = docId.lastIndexOf('_');
        const dateStr = docId.substring(lastUnderscoreIndex + 1); // "YYYY-MM-DD"

        const dateParts = dateStr.split('-').map(Number);
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];

        const result = {
            storeId: docData.storeId,
            year: year,
            month: month,
            day: day,
            data: docData.data as PerformanceData
        } as StorePerformanceData;

        // Log first document in detail
        if (docSnap.id === snapshot.docs[0].id) {
            console.log(`[getPerformanceData] First document details:`);
            console.log(`  Document ID: ${docId}`);
            console.log(`  Parsed date: ${year}-${month}-${day}`);
            console.log(`  Store ID: ${docData.storeId}`);
            console.log(`  Data keys:`, Object.keys(docData.data || {}));
            console.log(`  Sales value:`, docData.data?.['Sales']);
            console.log(`  COGS value:`, docData.data?.['COGS']);
        }

        return result;
    });

    console.log(`[getPerformanceData] ✅ Returning ${results.length} processed records`);
    return results;
};

export const getAggregatedPerformanceDataForPeriod = async (period: Period, storeId?: string): Promise<PerformanceData> => {
    try {
        // Import KPI_CONFIG to determine aggregation method
        const { KPI_CONFIG } = await import('../constants');

        // Convert dates to ISO strings for querying
        const startDateStr = period.startDate.toISOString();
        const endDateStr = period.endDate.toISOString();

        console.log(`[getAggregatedPerformanceDataForPeriod] Querying period ${period.label} (${startDateStr} to ${endDateStr})${storeId ? ` for store: ${storeId}` : ''}`);

        // Build query
        const q = query(
            actualsCollection,
            where('workStartDate', '>=', startDateStr),
            where('workStartDate', '<=', endDateStr)
        );

        const snapshot = await getDocs(q);

        console.log(`[getAggregatedPerformanceDataForPeriod] Found ${snapshot.size} total documents in date range`);

        // Log all document IDs found
        const docIds = snapshot.docs.map(d => d.id);
        console.log(`[getAggregatedPerformanceDataForPeriod] Document IDs:`, docIds);

        // Filter and aggregate
        const aggregated: PerformanceData = {};
        const kpiCounts: { [key: string]: number } = {}; // Track count for averaging
        let docCount = 0;

        snapshot.docs.forEach(docSnap => {
            const docData = docSnap.data();

            // Apply storeId filter if specified
            if (storeId && docData.storeId !== storeId) {
                console.log(`[getAggregatedPerformanceDataForPeriod] Skipping ${docSnap.id} - different store (${docData.storeId})`);
                return;
            }

            docCount++;
            console.log(`[getAggregatedPerformanceDataForPeriod] Processing document ${docCount}: ${docSnap.id}`);
            const data = docData.data as PerformanceData;

            // Log the data from this document
            if (data) {
                console.log(`[getAggregatedPerformanceDataForPeriod]   Data:`, data);
            }

            // Aggregate each KPI based on its aggregation type
            if (data) {
                Object.keys(data).forEach(kpi => {
                    const value = data[kpi as Kpi];
                    if (typeof value === 'number') {
                        if (!aggregated[kpi as Kpi]) {
                            aggregated[kpi as Kpi] = 0;
                            kpiCounts[kpi] = 0;
                        }

                        // Always sum first (we'll divide later for averages)
                        aggregated[kpi as Kpi]! += value;
                        kpiCounts[kpi]++;
                    }
                });
            }
        });

        // Now apply averaging for KPIs that need it
        Object.keys(aggregated).forEach(kpi => {
            const config = KPI_CONFIG[kpi as Kpi];
            const aggregationType = config?.aggregation || 'sum';

            if (aggregationType === 'avg' && kpiCounts[kpi] > 0) {
                const originalSum = aggregated[kpi as Kpi]!;
                aggregated[kpi as Kpi]! = originalSum / kpiCounts[kpi];
                console.log(`[getAggregatedPerformanceDataForPeriod] ${kpi}: Averaged ${originalSum} / ${kpiCounts[kpi]} = ${aggregated[kpi as Kpi]}`);
            } else {
                console.log(`[getAggregatedPerformanceDataForPeriod] ${kpi}: Summed = ${aggregated[kpi as Kpi]}`);
            }
        });

        console.log(`[getAggregatedPerformanceDataForPeriod] ✅ Aggregated ${docCount} documents for period ${period.label}${storeId ? ` (store: ${storeId})` : ''}`);
        console.log(`[getAggregatedPerformanceDataForPeriod] Final aggregated data:`, aggregated);
        return aggregated;
    } catch (error) {
        console.error('[getAggregatedPerformanceDataForPeriod] Error fetching aggregated performance data:', error);
        return {};
    }
}

// --- Director & Goals Functions ---

export const getDirectorProfiles = async (): Promise<DirectorProfile[]> => {
    const snapshot = await getDocs(directorsCollection);
    return snapshot.docs.map(docSnap => {
        const data = docSnap.data();

        // Extract firstName from name (or use name as firstName if no space)
        const firstName = data.name?.split(' ')[0] || data.name || '';

        // Get home store coordinates from STORE_DETAILS (based on homeLocation)
        let homeLat = data.homeLat || 0;
        let homeLon = data.homeLon || 0;

        if (data.homeLocation && STORE_DETAILS[data.homeLocation]) {
            homeLat = STORE_DETAILS[data.homeLocation].lat;
            homeLon = STORE_DETAILS[data.homeLocation].lon;
        }

        return {
            id: docSnap.id, // Use Firestore document ID
            name: data.name || '',
            firstName: firstName,
            lastName: data.lastName || '',
            title: data.title || '',
            photo: data.photo || '',
            stores: data.stores || [],
            email: data.email || '',
            phone: data.phone || '',
            homeLocation: data.homeLocation || '',
            homeLat: homeLat,
            homeLon: homeLon,
            yearlyTravelBudget: data.yearlyTravelBudget || 30000, // Default budget: $30k
            bio: data.bio || '',
        } as DirectorProfile;
    });
};

export const updateDirectorProfile = async (directorId: string, updates: Partial<DirectorProfile>): Promise<void> => {
    const directorRef = doc(directorsCollection, directorId);
    await updateDoc(directorRef, updates as any);
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

export const deleteGoal = async (goalId: string): Promise<void> => {
    const goalRef = doc(goalsCollection, goalId);
    await deleteDoc(goalRef);
};

// --- Deployments ---
export const getDeploymentsForDirector = async (directorId: string): Promise<Deployment[]> => {
    console.log('[Firebase] getDeploymentsForDirector called for:', directorId);

    try {
        // DEBUG: Try to read the specific test123 document we saw in console
        console.log('[Firebase] DEBUG: Attempting to read test123 document directly...');
        const testDocRef = doc(deploymentsCollection, 'test123');
        const testDoc = await getDoc(testDocRef);
        console.log('[Firebase] DEBUG: test123 exists?', testDoc.exists());
        if (testDoc.exists()) {
            console.log('[Firebase] DEBUG: test123 data:', testDoc.data());
        }

        // Get ALL deployments (no where clause to avoid query hang)
        console.log('[Firebase] Fetching all deployments...');
        console.log('[Firebase] Collection path:', deploymentsCollection.path);
        console.log('[Firebase] Database instance:', db ? 'exists' : 'null');
        const startTime = Date.now();

        const snapshot = await getDocs(deploymentsCollection);

        const elapsed = Date.now() - startTime;
        console.log('[Firebase] ✅ Query completed in', elapsed, 'ms');
        console.log('[Firebase] Snapshot size:', snapshot.size);
        console.log('[Firebase] Snapshot empty?:', snapshot.empty);
        console.log('[Firebase] Snapshot docs length:', snapshot.docs.length);

        // Filter client-side
        const allDeployments = snapshot.docs.map(docSnap => {
            console.log('[Firebase] Processing doc:', docSnap.id, docSnap.data());
            return { id: docSnap.id, ...docSnap.data() } as Deployment;
        });
        console.log('[Firebase] Raw deployments:', allDeployments);
        const filteredDeployments = allDeployments.filter(d => d.directorId === directorId);

        console.log('[Firebase] Found', allDeployments.length, 'total deployments,', filteredDeployments.length, 'for director', directorId);
        return filteredDeployments;
    } catch (error) {
        console.error('[Firebase] Error getting deployments:', error);
        // Return empty array instead of throwing, so UI doesn't break
        return [];
    }
};

export const createDeployment = async (deployment: Omit<Deployment, 'id'>): Promise<Deployment> => {
    console.log('[Firebase] createDeployment called with:', deployment);

    try {
        // Generate a unique ID manually
        const newId = `${deployment.directorId}_${Date.now()}`;
        console.log('[Firebase] Generated ID:', newId);

        const docRef = doc(deploymentsCollection, newId);
        console.log('[Firebase] Document reference created:', docRef.path);
        console.log('[Firebase] Collection path:', deploymentsCollection.path);
        console.log('[Firebase] Firestore instance:', db ? 'exists' : 'missing');

        const dataToWrite = {
            ...deployment,
            createdAt: new Date().toISOString()
        };
        console.log('[Firebase] Data to write:', JSON.stringify(dataToWrite, null, 2));

        console.log('[Firebase] Calling setDoc...');
        await setDoc(docRef, dataToWrite);
        console.log('[Firebase] ✅ setDoc completed without error');

        // Verify the write by reading it back immediately
        console.log('[Firebase] Verifying write by reading back...');
        const verifySnapshot = await getDocs(deploymentsCollection);
        console.log('[Firebase] Total documents after write:', verifySnapshot.size);
        console.log('[Firebase] All document IDs:', verifySnapshot.docs.map(d => d.id));

        console.log('[Firebase] ✅ Deployment created successfully with ID:', newId);
        return { id: newId, ...deployment };
    } catch (error) {
        console.error('[Firebase] ❌ ERROR in createDeployment:', error);
        console.error('[Firebase] Error name:', (error as Error).name);
        console.error('[Firebase] Error message:', (error as Error).message);
        console.error('[Firebase] Error stack:', (error as Error).stack);
        throw error;
    }
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

// Export storage instance for use in components
export { storage };
