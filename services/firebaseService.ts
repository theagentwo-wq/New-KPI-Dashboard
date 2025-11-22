// NOTE: Firebase SDK is dynamically imported inside `initializeFirebaseService`.
// Avoid top-level imports to prevent Netlify function module-load crashes (502s).
let firebase: any = null;

import { Note, NoteCategory, View, DirectorProfile, DataMappingTemplate, Kpi, PerformanceData, StorePerformanceData, Budget, Goal, Period, Deployment, FinancialLineItem } from '../types';
import { DIRECTORS as fallbackDirectors, ALL_STORES, KPI_CONFIG } from '../constants';
import { ALL_PERIODS } from '../utils/dateUtils';

export type FirebaseStatus = 
  | { status: 'initializing' }
  | { status: 'connected' }
  | { status: 'error', message: string, rawValue?: string };

let app: any = null;
let db: any = null;
let storage: any = null;
let notesCollection: any = null;
let directorsCollection: any = null;
let actualsCollection: any = null;
let budgetsCollection: any = null;
let mappingsCollection: any = null;
let goalsCollection: any = null;
let analysisJobsCollection: any = null;
let importJobsCollection: any = null;
let deploymentsCollection: any = null;


let isInitialized = false;

// Helper to determine if we are in a server-side (Node) environment
const isServer = typeof window === 'undefined';

export const initializeFirebaseService = async (): Promise<FirebaseStatus> => {
    if (isInitialized) return { status: 'connected' };

    try {
        let firebaseConfig;

        if (isServer) {
            // SERVER-SIDE: read directly from environment variables.
            const configStr = process.env.FIREBASE_CLIENT_CONFIG;
            if (!configStr) {
                throw new Error("FIREBASE_CLIENT_CONFIG environment variable is not set on the server.");
            }
            let cleanedConfigStr = configStr.trim();
            if ((cleanedConfigStr.startsWith("'") && cleanedConfigStr.endsWith("'")) || (cleanedConfigStr.startsWith('"') && cleanedConfigStr.endsWith('"'))) {
                cleanedConfigStr = cleanedConfigStr.substring(1, cleanedConfigStr.length - 1);
            }
            try {
                firebaseConfig = JSON.parse(cleanedConfigStr);
            } catch (jsonError) {
                // Specific error handling for server-side JSON parsing failure
                const err = new Error("Your FIREBASE_CLIENT_CONFIG is not valid JSON. Please ensure it is a single-line, correctly formatted JSON string.");
                (err as any).cause = cleanedConfigStr; // Attach the problematic string for debugging
                throw err;
            }
        } else {
            // CLIENT-SIDE: fetch from the secure proxy.
            const response = await fetch('/.netlify/functions/firebase-config-proxy');
            const data = await response.json();
            if (!response.ok) {
                 const err = new Error(data.error || 'Failed to fetch Firebase config');
                 (err as any).cause = data.rawValue;
                 throw err;
            }
            firebaseConfig = data;
        }
        
        if (Object.keys(firebaseConfig).length === 0) {
             const err = new Error("Received empty Firebase config. Ensure FIREBASE_CLIENT_CONFIG is set correctly.");
             (err as any).cause = JSON.stringify(firebaseConfig);
             throw err;
        }
        
        // Dynamically import the Firebase compat SDK at runtime to avoid
        // loading browser-only modules during Netlify function module initialization.
        if (!firebase) {
            try {
                const compat = await import('firebase/compat/app');
                // compat may expose default or named export depending on bundler
                firebase = (compat && (compat as any).default) || compat;
                // load firestore + storage side-effects
                await import('firebase/compat/firestore');
                await import('firebase/compat/storage');
            } catch (e) {
                console.error('Failed to dynamically import Firebase compat SDK:', e);
                throw new Error('Server failed to load Firebase SDK.');
            }
        }

        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }
        
        db = app.firestore();
        storage = app.storage();
        notesCollection = db.collection('notes');
        directorsCollection = db.collection('directors');
        actualsCollection = db.collection('performance_actuals');
        budgetsCollection = db.collection('budgets');
        mappingsCollection = db.collection('data_mapping_templates');
        goalsCollection = db.collection('goals');
        analysisJobsCollection = db.collection('analysis_jobs');
        importJobsCollection = db.collection('import_jobs');
        deploymentsCollection = db.collection('deployments');
        
        isInitialized = true;
        console.log("Firebase service initialized successfully.");
        return { status: 'connected' };

    } catch (error: any) {
        console.error("Firebase Initialization Error:", error);
        isInitialized = false;
        // Use the custom error message if available, otherwise a generic one.
        // Include rawValue only if it's available for client-side display.
        const errorMessage = error.message.includes("FIREBASE_CLIENT_CONFIG is not valid JSON") 
            ? error.message
            : `Firebase initialization failed: The config value from your Netlify settings is invalid and could not be parsed. Please carefully follow the updated instructions in the README.`;

        return { 
            status: 'error', 
            message: errorMessage,
            rawValue: error.cause || (isServer ? (process.env.FIREBASE_CLIENT_CONFIG || 'Config string not found in environment.') : 'Could not retrieve raw value from client.')
        };
    }
};

const storeNameMap = ALL_STORES.reduce((acc: Record<string, string>, name: string) => {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    acc[key] = name;
    
    const shortName = name.split(',')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if(!acc[shortName]) acc[shortName] = name;

    return acc;
}, {} as Record<string, string>);

const cleanAndMatchStoreName = (rawName: string): string | null => {
    if (!rawName) return null;
    
    const prefixMatch = rawName.match(/^\d+\s*-\s*(.*)/);
    const potentialName = prefixMatch ? prefixMatch[1].trim() : rawName.trim();
    const key = potentialName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (storeNameMap[key]) return storeNameMap[key];
    
    const shortKey = potentialName.split(',')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if(storeNameMap[shortKey]) return storeNameMap[shortKey];

    for (const mapKey in storeNameMap) {
        if(key.includes(mapKey)) return storeNameMap[mapKey];
    }
    
    return null;
}

export const uploadFile = async (file: File): Promise<{ fileUrl: string, filePath: string }> => {
    if (!storage) throw new Error("Firebase Storage not initialized.");
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name}`;
    const filePath = `imports/${uniqueFileName}`;
    const storageRef = storage.ref(filePath);
    await storageRef.put(file);
    const fileUrl = await storageRef.getDownloadURL();
    return { fileUrl, filePath };
};

export const uploadTextAsFile = async (text: string, chunkName: string): Promise<{ fileUrl: string, filePath: string }> => {
    if (!storage) throw new Error("Firebase Storage not initialized.");
    const blob = new Blob([text], { type: 'text/plain' });
    const uniqueFileName = `${Date.now()}-${chunkName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    const filePath = `imports/${uniqueFileName}`;
    const storageRef = storage.ref(filePath);
    await storageRef.put(blob);
    const fileUrl = await storageRef.getDownloadURL();
    return { fileUrl, filePath };
};

export const deleteFileByPath = async (filePath: string): Promise<void> => {
    if (!storage) {
        console.warn("Firebase Storage not initialized, skipping file deletion.");
        return;
    }
    try {
        const storageRef = storage.ref(filePath);
        await storageRef.delete();
    } catch (error) {
        console.error(`Failed to delete temporary file: ${filePath}`, error);
        // Don't throw, as this is a non-critical cleanup step
    }
};

export const batchImportActualsData = async (data: any[]): Promise<void> => {
    if (!db || !actualsCollection) throw new Error("Firebase not initialized.");
    const batch = db.batch();

    data.forEach((row: any) => {
        const storeId = cleanAndMatchStoreName(row['Store Name']);
        const rawDate = row['Week Start Date'];
        
        if (storeId && rawDate) {
            const weekStartDate = new Date(rawDate);
            if (isNaN(weekStartDate.getTime())) {
                 console.warn(`Invalid date found for store ${storeId}: ${rawDate}`);
                 return;
            }

            // Extract standard KPIs for the Dashboard
            const performanceData: PerformanceData = {};
            for (const key in row) {
                const kpi = key as Kpi;
                if (kpi in Kpi) {
                    let value = row[key];
                    if (typeof value === 'string') {
                        value = value.replace(/[\$,%]/g, '');
                    }
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                        const kpiConfig = KPI_CONFIG[kpi];
                        if (kpiConfig && kpiConfig.format === 'percent') {
                            performanceData[kpi] = numValue / 100;
                        } else {
                            performanceData[kpi] = numValue;
                        }
                    }
                }
            }

            // NEW: Handle detailed P&L data if present
            const pnlData: FinancialLineItem[] = [];
            if (row.pnl && Array.isArray(row.pnl)) {
                row.pnl.forEach((item: any) => {
                    if (item.name && (item.actual !== undefined || item.budget !== undefined)) {
                         pnlData.push({
                             name: item.name,
                             actual: typeof item.actual === 'string' ? parseFloat(item.actual.replace(/[\$,]/g, '')) : (item.actual || 0),
                             budget: typeof item.budget === 'string' ? parseFloat(item.budget.replace(/[\$,]/g, '')) : (item.budget || 0),
                             category: item.category || 'Other',
                             indent: item.indent || 0
                         });
                    }
                });
            }

            if (Object.keys(performanceData).length > 0 || pnlData.length > 0) {
                 const docId = `${storeId}_${weekStartDate.toISOString().split('T')[0]}`;
                 const docRef = actualsCollection!.doc(docId);
                 
                 const updateData: any = {
                    storeId,
                    weekStartDate: firebase.firestore.Timestamp.fromDate(weekStartDate),
                    data: performanceData
                 };
                 
                 if (pnlData.length > 0) {
                     updateData.pnl = pnlData;
                 }

                 batch.set(docRef, updateData, { merge: true });
            }
        } else {
             console.warn(`AI output for Actuals missing 'Store Name' or 'Week Start Date'. Row: ${JSON.stringify(row)}`);
        }
    });

    await batch.commit();
};

export const batchImportBudgetData = async (data: any[]): Promise<void> => {
    if (!db || !budgetsCollection) throw new Error("Firebase not initialized.");
    const batch = db.batch();

    data.forEach((row: any) => {
        const storeId = cleanAndMatchStoreName(row['Store Name']);
        const year = parseInt(row['Year']);
        const month = parseInt(row['Month']);
        
        if (storeId && !isNaN(year) && !isNaN(month)) {
            const targets: PerformanceData = {};
            for (const key in row) {
                const kpi = key as Kpi;
                if (kpi in Kpi) {
                     let value = row[key];
                    if (typeof value === 'string') {
                        value = value.replace(/[\$,%]/g, '');
                    }
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                        const kpiConfig = KPI_CONFIG[kpi];
                        if (kpiConfig && kpiConfig.format === 'percent') {
                            targets[kpi] = numValue / 100;
                        } else {
                            targets[kpi] = numValue;
                        }
                    }
                }
            }
             if (Object.keys(targets).length > 0) {
                const docId = `${storeId}_${year}_${month}`;
                const docRef = budgetsCollection!.doc(docId);
                batch.set(docRef, { storeId, year, month, targets }, { merge: true });
            }
        } else {
             console.warn(`AI output for Budget missing 'Store Name', 'Year', or 'Month'. Row: ${JSON.stringify(row)}`);
        }
    });
    
    await batch.commit();
};


// --- Data Fetching Functions ---
export const getPerformanceData = async (startDate: Date, endDate: Date): Promise<StorePerformanceData[]> => {
    if (!actualsCollection) return [];
    const q = actualsCollection.where('weekStartDate', '>=', startDate).where('weekStartDate', '<=', endDate);
    const snapshot = await q.get();
    return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
            ...data,
            weekStartDate: (data.weekStartDate as any).toDate()
        } as StorePerformanceData
    });
};

export const getBudgets = async (year: number): Promise<Budget[]> => {
    if (!budgetsCollection) return [];
    const q = budgetsCollection.where('year', '==', year);
    const snapshot = await q.get();
    return snapshot.docs.map((doc: any) => doc.data() as Budget);
};

export const updateBudget = async (storeId: string, year: number, month: number, kpi: Kpi, target: number): Promise<void> => {
    if (!budgetsCollection) throw new Error("Firebase not initialized.");
    const docId = `${storeId}_${year}_${month}`;
    const docRef = budgetsCollection.doc(docId);
    
    const budgetData = {
        storeId,
        year,
        month,
        targets: { [kpi]: target }
    };
    
    await docRef.set(budgetData, { merge: true });
};

// --- Goal Functions ---
export const getGoals = async (): Promise<Goal[]> => {
    if (!goalsCollection) return [];
    const snapshot = await goalsCollection.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Goal));
};

export const addGoal = async (directorId: View, quarter: number, year: number, kpi: Kpi, target: number): Promise<Goal> => {
    if (!goalsCollection) throw new Error("Firebase not initialized.");
    const newGoal = { directorId, quarter, year, kpi, target };
    const docRef = await goalsCollection.add(newGoal);
    return { id: docRef.id, ...newGoal };
};

// --- Existing Functions (Notes, Directors) ---
export const getNotes = async (): Promise<Note[]> => {
    if (!notesCollection) return [];
    const q = notesCollection.orderBy('createdAt', 'desc');
    const snapshot = await q.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data(), createdAt: (doc.data().createdAt as any).toDate().toISOString() } as Note));
};

export const addNote = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string): Promise<Note> => {
    if (!notesCollection || !db) throw new Error("Firebase not initialized.");
    const createdAtTimestamp = firebase.firestore.Timestamp.now();
    const newNoteData: any = { monthlyPeriodLabel, category, content, view: scope.view, createdAt: createdAtTimestamp };
    if (scope.storeId) newNoteData.storeId = scope.storeId;
    const docRef = await notesCollection.add(newNoteData);
    let finalImageUrl: string | undefined = undefined;
    if (imageDataUrl) {
        finalImageUrl = await uploadNoteAttachment(docRef.id, imageDataUrl);
        await db.collection('notes').doc(docRef.id).update({ imageUrl: finalImageUrl });
    }
    return { id: docRef.id, ...newNoteData, createdAt: createdAtTimestamp.toDate().toISOString(), imageUrl: finalImageUrl };
};

export const uploadNoteAttachment = async (noteId: string, imageDataUrl: string): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage not initialized.");
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const storageRef = storage.ref(`note_attachments/${noteId}/${Date.now()}`);
    await storageRef.put(blob);
    return storageRef.getDownloadURL();
};

export const updateNoteContent = async (noteId: string, newContent: string, newCategory: NoteCategory): Promise<void> => {
     if (!db) throw new Error("Firebase not initialized.");
    await db.collection('notes').doc(noteId).update({ content: newContent, category: newCategory });
};

export const deleteNoteById = async (noteId: string): Promise<void> => {
    if (!db) throw new Error("Firebase not initialized.");
    await db.collection('notes').doc(noteId).delete();
};

export const getDirectorProfiles = async (): Promise<DirectorProfile[]> => {
    if (!directorsCollection || !db) return fallbackDirectors;
    try {
        const snapshot = await directorsCollection.get();
        if (snapshot.empty) {
            const batch = db.batch();
            fallbackDirectors.forEach((director: DirectorProfile) => batch.set(directorsCollection!.doc(director.id), director));
            await batch.commit();
            return fallbackDirectors;
        }
        return snapshot.docs.map((doc: any) => doc.data() as DirectorProfile);
    } catch (e) {
        return fallbackDirectors;
    }
};

export const uploadDirectorPhoto = async (directorId: string, file: File): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage not initialized.");
    const storageRef = storage.ref(`director_photos/${directorId}/${file.name}`);
    await storageRef.put(file);
    return storageRef.getDownloadURL();
};

export const updateDirectorPhotoUrl = async (directorId: string, photoUrl: string): Promise<void> => {
    if (!db) throw new Error("Firebase not initialized.");
    await db.collection('directors').doc(directorId).update({ photo: photoUrl });
};

export const updateDirectorContactInfo = async (directorId: string, contactInfo: { email: string; phone: string }): Promise<void> => {
    if (!db) throw new Error("Firebase not initialized.");
    await db.collection('directors').doc(directorId).update(contactInfo);
};


// --- Manual Data Entry Function ---
export const savePerformanceDataForPeriod = async (storeId: string, period: Period, data: PerformanceData): Promise<void> => {
    if (!db || !actualsCollection) throw new Error("Firebase not initialized.");
    
    if (Object.keys(data).length === 0) {
        throw new Error("No KPI data provided to save.");
    }
    
    const weeksInPeriod = ALL_PERIODS.filter((p: Period) => 
        p.type === 'Week' && 
        p.startDate >= period.startDate && 
        p.endDate <= period.endDate
    );

    if (weeksInPeriod.length === 0) {
        throw new Error(`Could not find any weeks within the selected period: ${period.label}`);
    }

    const batch = db.batch();
    const weekCount = weeksInPeriod.length;

    weeksInPeriod.forEach((week: Period) => {
        const docId = `${storeId}_${week.startDate.toISOString().split('T')[0]}`;
        const docRef = actualsCollection!.doc(docId);
        
        const dataForThisWeek: PerformanceData = {};
        
        for (const key in data) {
            const kpi = key as Kpi;
            const value = data[kpi];
            if (value !== undefined) {
                const kpiConfig = KPI_CONFIG[kpi];
                if (kpiConfig.format === 'currency') {
                    dataForThisWeek[kpi] = value / weekCount;
                } else {
                    dataForThisWeek[kpi] = value;
                }
            }
        }

        const documentData = {
            storeId,
            weekStartDate: firebase.firestore.Timestamp.fromDate(week.startDate),
            data: dataForThisWeek
        };

        batch.set(docRef, documentData, { merge: true });
    });

    await batch.commit();
};

export const getAggregatedPerformanceDataForPeriod = async (storeId: string, period: Period): Promise<PerformanceData | null> => {
    if (!actualsCollection) throw new Error("Firebase not initialized.");

    const storeDataSnapshot = await actualsCollection
        .where('storeId', '==', storeId)
        .get();

    if (storeDataSnapshot.empty) {
        return null;
    }
    
    const weeklyData: PerformanceData[] = storeDataSnapshot.docs
        .map((doc: any) => {
            const data = doc.data();
            return {
                ...data,
                weekStartDate: (data.weekStartDate as any).toDate()
            } as StorePerformanceData;
        })
        .filter((item: StorePerformanceData) => 
            item.weekStartDate >= period.startDate && 
            item.weekStartDate <= period.endDate
        )
        .map((item: StorePerformanceData) => item.data);

    if (weeklyData.length === 0) {
        return null;
    }

    const aggregatedData: PerformanceData = {};
    const kpiCounts: Partial<{ [key in Kpi]: number }> = {};

    weeklyData.forEach((week: PerformanceData) => {
        for (const key in week) {
            const kpi = key as Kpi;
            const value = week[kpi];

            if (value !== undefined && !isNaN(value)) {
                if (aggregatedData[kpi] === undefined) {
                    aggregatedData[kpi] = 0;
                    kpiCounts[kpi] = 0;
                }
                aggregatedData[kpi]! += value;
                kpiCounts[kpi]! += 1;
            }
        }
    });

    for (const key in aggregatedData) {
        const kpi = key as Kpi;
        const kpiConfig = KPI_CONFIG[kpi];
        const count = kpiCounts[kpi]!;

        if (kpiConfig.format !== 'currency' && count > 0) {
            aggregatedData[kpi]! /= count;
        }
    }

    return aggregatedData;
};

// --- Analysis Job Functions ---
export const createAnalysisJob = async (payload: { fileUrl: string, filePath: string, mimeType: string, fileName: string }): Promise<string> => {
    if (!analysisJobsCollection) throw new Error("Firebase not initialized for analysis jobs.");
    const docRef = await analysisJobsCollection.add({
        ...payload,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
};

export const updateAnalysisJob = async (jobId: string, data: any): Promise<void> => {
    if (!analysisJobsCollection) throw new Error("Firebase not initialized for analysis jobs.");
    await analysisJobsCollection.doc(jobId).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
};

export const listenToAnalysisJob = (jobId: string, callback: (data: any) => void): (() => void) => {
    if (!analysisJobsCollection) throw new Error("Firebase not initialized for analysis jobs.");
    return analysisJobsCollection.doc(jobId).onSnapshot((doc: any) => {
        if (doc.exists) {
            callback({ id: doc.id, ...doc.data() });
        }
    });
};

export const cancelAnalysisJob = async (jobId: string): Promise<void> => {
    if (!analysisJobsCollection) throw new Error("Firebase not initialized for analysis jobs.");
    // We don't truly stop the background function, but we mark it as cancelled
    // so the frontend can stop listening and move on.
    await updateAnalysisJob(jobId, { status: 'cancelled' });
};


// --- Import Job Functions ---
export const createImportJob = async (payload: any): Promise<string> => {
    if (!importJobsCollection) throw new Error("Firebase not initialized for import jobs.");
    const docRef = await importJobsCollection.add({
        ...payload,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
};

export const updateImportJob = async (jobId: string, data: any): Promise<void> => {
    if (!importJobsCollection) throw new Error("Firebase not initialized for import jobs.");
    await importJobsCollection.doc(jobId).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
};

export const listenToImportJob = (jobId: string, callback: (data: any) => void): (() => void) => {
    if (!importJobsCollection) throw new Error("Firebase not initialized for import jobs.");
    return importJobsCollection.doc(jobId).onSnapshot((doc: any) => {
        if (doc.exists) {
            callback({ id: doc.id, ...doc.data() });
        }
    });
};

// --- Deployment Planner Functions ---
export const getDeployments = async (): Promise<Deployment[]> => {
    if (!deploymentsCollection) return [];
    const snapshot = await deploymentsCollection.orderBy('startDate', 'desc').get();
    return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as any).toDate().toISOString()
    } as Deployment));
};

export const addDeployment = async (deploymentData: Omit<Deployment, 'id' | 'createdAt'>): Promise<Deployment> => {
    if (!deploymentsCollection) throw new Error("Firebase not initialized for deployments.");
    const createdAtTimestamp = firebase.firestore.Timestamp.now();
    const newDeploymentData = { ...deploymentData, createdAt: createdAtTimestamp };
    const docRef = await deploymentsCollection.add(newDeploymentData);
    return { id: docRef.id, ...newDeploymentData, createdAt: createdAtTimestamp.toDate().toISOString() };
};

export const updateDeployment = async (deploymentId: string, updates: Partial<Omit<Deployment, 'id' | 'createdAt'>>): Promise<void> => {
    if (!deploymentsCollection) throw new Error("Firebase not initialized for deployments.");
    await deploymentsCollection.doc(deploymentId).update(updates);
};

export const deleteDeployment = async (deploymentId: string): Promise<void> => {
    if (!deploymentsCollection) throw new Error("Firebase not initialized for deployments.");
    await deploymentsCollection.doc(deploymentId).delete();
};


// Note: saveDataMappingTemplate, getDataMappingTemplates, deleteDataMappingTemplate are kept but unused by the main flow.
// They could be used for a future "manual mapping" feature.
export const saveDataMappingTemplate = async (template: Omit<DataMappingTemplate, 'id'>): Promise<DataMappingTemplate> => {
    if (!mappingsCollection) throw new Error("Firebase not initialized.");
    const docRef = await mappingsCollection.add({ ...template, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    return { id: docRef.id, ...template };
};

export const getDataMappingTemplates = async (): Promise<DataMappingTemplate[]> => {
    if (!mappingsCollection) return [];
    const snapshot = await mappingsCollection.orderBy('name').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as DataMappingTemplate));
};

export const deleteDataMappingTemplate = async (templateId: string): Promise<void> => {
    if (!db) throw new Error("Firebase not initialized.");
    await db.collection('data_mapping_templates').doc(templateId).delete();
};