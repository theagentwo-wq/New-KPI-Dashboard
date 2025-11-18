// FIX: All firebase imports are changed to use the v8 compat library to match the errors provided.
// This requires rewriting all Firebase SDK calls to the v8 namespaced syntax.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
// FIX: Add missing type imports to resolve 'Cannot find name' errors.
import { Note, NoteCategory, View, DirectorProfile, DataMappingTemplate, Kpi, PerformanceData, StorePerformanceData, Budget, Goal, Period } from '../types';
// FIX: Add KPI_CONFIG import for use in new batchImportStructuredActuals function
import { DIRECTORS as fallbackDirectors, ALL_STORES, KPI_CONFIG } from '../constants';
// FIX: Correct import path for ALL_PERIODS. It is defined in dateUtils.ts.
import { ALL_PERIODS } from '../utils/dateUtils';

export type FirebaseStatus = 
  | { status: 'initializing' }
  | { status: 'connected' }
  | { status: 'error', message: string, rawValue?: string };

let app: firebase.app.App | null = null;
let db: firebase.firestore.Firestore | null = null;
let storage: firebase.storage.Storage | null = null;
let notesCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData> | null = null;
let directorsCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData> | null = null;
let actualsCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData> | null = null;
let budgetsCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData> | null = null;
let mappingsCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData> | null = null;
let goalsCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData> | null = null;


let isInitialized = false;

export const initializeFirebaseService = async (): Promise<FirebaseStatus> => {
    if (isInitialized) return { status: 'connected' };

    try {
        const response = await fetch('/.netlify/functions/firebase-config-proxy');
        if (!response.ok) {
             const errorBody = await response.json();
             const err = new Error(errorBody.error || 'Failed to fetch Firebase config');
             (err as any).cause = errorBody.rawValue;
             throw err;
        }
        const firebaseConfig = await response.json();
        
        if (Object.keys(firebaseConfig).length === 0) {
             const err = new Error("Received empty Firebase config from proxy. Ensure FIREBASE_CLIENT_CONFIG is set in Netlify.");
             (err as any).cause = JSON.stringify(firebaseConfig);
             throw err;
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
        
        isInitialized = true;
        console.log("Firebase service initialized successfully.");
        return { status: 'connected' };

    } catch (error: any) {
        console.error("Firebase Initialization Error:", error);
        isInitialized = false;
        return { 
            status: 'error', 
            message: `The config value from your Netlify settings is invalid and could not be parsed. Please carefully follow the updated instructions in the README.`,
            rawValue: error.cause || 'Could not retrieve raw value from server.'
        };
    }
};

// --- Data Mapping Template Functions ---

export const saveDataMappingTemplate = async (template: Omit<DataMappingTemplate, 'id'>): Promise<DataMappingTemplate> => {
    if (!mappingsCollection) throw new Error("Firebase not initialized.");
    const docRef = await mappingsCollection.add({ ...template, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    return { id: docRef.id, ...template };
};

export const getDataMappingTemplates = async (): Promise<DataMappingTemplate[]> => {
    if (!mappingsCollection) return [];
    const snapshot = await mappingsCollection.orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DataMappingTemplate));
};

export const deleteDataMappingTemplate = async (templateId: string): Promise<void> => {
    if (!db) throw new Error("Firebase not initialized.");
    await db.collection('data_mapping_templates').doc(templateId).delete();
};

// --- Data Import Functions ---

const storeNameMap = ALL_STORES.reduce((acc, name) => {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    acc[key] = name;
    
    // Add mapping for short name (e.g., "Asheville Downtown")
    const shortName = name.split(',')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if(!acc[shortName]) acc[shortName] = name;

    return acc;
}, {} as Record<string, string>);

// FIX: More robust name matching logic
const cleanAndMatchStoreName = (rawName: string): string | null => {
    if (!rawName) return null;
    
    // Try to match with a prefix like "01 - Asheville Downtown"
    const prefixMatch = rawName.match(/^\d+\s*-\s*(.*)/);
    const potentialName = prefixMatch ? prefixMatch[1].trim() : rawName.trim();

    // Generate a clean key for matching
    const key = potentialName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Direct match (e.g., 'ashevilledowntownnc' -> 'Downtown Asheville, NC')
    if (storeNameMap[key]) return storeNameMap[key];
    
    // Short name match (e.g., 'ashevilledowntown' -> 'Downtown Asheville, NC')
    const shortKey = potentialName.split(',')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if(storeNameMap[shortKey]) return storeNameMap[shortKey];

    // Final fallback: check if any of our keys are a substring of the input
    for (const mapKey in storeNameMap) {
        if(key.includes(mapKey)) return storeNameMap[mapKey];
    }
    
    return null;
}


export const batchImportActuals = async (data: any[], template: DataMappingTemplate): Promise<void> => {
    if (!db || !actualsCollection) throw new Error("Firebase not initialized.");
    const batch = db.batch();

    const storeNameHeader = Object.keys(template.mappings).find(h => template.mappings[h] === 'Store Name');
    const dateHeader = Object.keys(template.mappings).find(h => template.mappings[h] === 'Week Start Date');
    
    if (!storeNameHeader) throw new Error("Mapping template is invalid: missing 'Store Name' mapping.");
    if (!dateHeader) throw new Error("Mapping template is invalid: missing 'Week Start Date' mapping.");

    data.forEach(row => {
        const rawStoreName = row[storeNameHeader];
        const storeId = cleanAndMatchStoreName(rawStoreName);
        const rawDate = row[dateHeader];
        
        if (storeId && rawDate) {
            // Attempt to parse date. Supports standard formats via new Date()
            const weekStartDate = new Date(rawDate);
            if (isNaN(weekStartDate.getTime())) {
                 console.warn(`Invalid date found for store ${storeId}: ${rawDate}`);
                 return;
            }

            const performanceData: PerformanceData = {};
            for (const header in template.mappings) {
                const kpi = template.mappings[header];
                if (kpi !== 'ignore' && kpi !== 'Store Name' && kpi !== 'Week Start Date' && kpi !== 'Year' && kpi !== 'Month' && kpi in Kpi) {
                    let value = row[header];
                    if (typeof value === 'string') {
                        value = value.replace(/[\$,%]/g, '');
                    }
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                        // For percentages, store them as decimals
                        if(String(value).includes('%') || ['SOP', 'PrimeCost', 'FoodCost', 'VariableLabor'].includes(kpi)){
                             performanceData[kpi as Kpi] = numValue / 100;
                        } else {
                             performanceData[kpi as Kpi] = numValue;
                        }
                    }
                }
            }

            if (Object.keys(performanceData).length > 0) {
                 const docId = `${storeId}_${weekStartDate.toISOString().split('T')[0]}`;
                 const docRef = actualsCollection!.doc(docId);
                 batch.set(docRef, {
                    storeId,
                    weekStartDate: firebase.firestore.Timestamp.fromDate(weekStartDate),
                    data: performanceData
                }, { merge: true }); // Use merge:true to upsert
            }
        } else {
             console.warn(`Could not match store name or date: "${rawStoreName}", "${rawDate}"`);
        }
    });

    await batch.commit();
};

// FIX: Add missing 'batchImportStructuredActuals' function to handle importing data extracted by AI.
export const batchImportStructuredActuals = async (data: any[]): Promise<void> => {
    if (!db || !actualsCollection) throw new Error("Firebase not initialized.");
    const batch = db.batch();

    data.forEach(row => {
        const rawStoreName = row.storeName;
        const storeId = cleanAndMatchStoreName(rawStoreName);
        const weekStartDateStr = row.weekStartDate;

        if (storeId && weekStartDateStr) {
            const weekStartDate = new Date(`${weekStartDateStr}T12:00:00`);

            const performanceData: PerformanceData = {};
            
            for (const key in row) {
                if (Object.values(Kpi).includes(key as Kpi)) {
                    let value = row[key];
                    if (typeof value === 'string') {
                        value = String(value).replace(/[\$,%]/g, '').trim();
                    }
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                        const kpiConfig = KPI_CONFIG[key as Kpi];
                        // AI returns percentages as numbers (e.g., 21.6), so convert to decimal
                        if (kpiConfig.format === 'percent') {
                            performanceData[key as Kpi] = numValue / 100;
                        } else {
                            performanceData[key as Kpi] = numValue;
                        }
                    }
                }
            }

            if (Object.keys(performanceData).length > 0) {
                const docId = `${storeId}_${weekStartDate.toISOString().split('T')[0]}`;
                const docRef = actualsCollection!.doc(docId);
                batch.set(docRef, {
                    storeId,
                    weekStartDate: firebase.firestore.Timestamp.fromDate(weekStartDate),
                    data: performanceData
                }, { merge: true });
            }
        } else {
            console.warn(`Could not match store name or missing date for AI-extracted row:`, row);
        }
    });

    await batch.commit();
};

export const batchImportBudgets = async (data: any[]): Promise<void> => {
    if (!db || !budgetsCollection) throw new Error("Firebase not initialized.");
    const batch = db.batch();

    data.forEach(row => {
        const storeId = cleanAndMatchStoreName(row['Store Name']);
        const year = parseInt(row['Year']);
        const month = parseInt(row['Month']);
        
        if (storeId && !isNaN(year) && !isNaN(month)) {
            const targets: PerformanceData = {};
             for (const key in row) {
                if (key in Kpi) {
                    let value = row[key];
                    if (typeof value === 'string') {
                        value = value.replace(/[\$,%]/g, '');
                    }
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                        if(String(value).includes('%') || ['SOP', 'PrimeCost', 'FoodCost', 'VariableLabor'].includes(key)){
                             targets[key as Kpi] = numValue / 100;
                        } else {
                             targets[key as Kpi] = numValue;
                        }
                    }
                }
            }
            const docId = `${storeId}_${year}_${month}`;
            const docRef = budgetsCollection!.doc(docId);
            batch.set(docRef, { storeId, year, month, targets });
        }
    });
    
    await batch.commit();
};


// --- Data Fetching Functions ---
export const getPerformanceData = async (startDate: Date, endDate: Date): Promise<StorePerformanceData[]> => {
    if (!actualsCollection) return [];
    const q = actualsCollection.where('weekStartDate', '>=', startDate).where('weekStartDate', '<=', endDate);
    const snapshot = await q.get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            weekStartDate: (data.weekStartDate as firebase.firestore.Timestamp).toDate()
        } as StorePerformanceData
    });
};

export const getBudgets = async (year: number): Promise<Budget[]> => {
    if (!budgetsCollection) return [];
    const q = budgetsCollection.where('year', '==', year);
    const snapshot = await q.get();
    return snapshot.docs.map(doc => doc.data() as Budget);
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: (doc.data().createdAt as firebase.firestore.Timestamp).toDate().toISOString() } as Note));
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
            fallbackDirectors.forEach(director => batch.set(directorsCollection!.doc(director.id), director));
            await batch.commit();
            return fallbackDirectors;
        }
        return snapshot.docs.map(doc => doc.data() as DirectorProfile);
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

// --- Manual Data Entry Function ---
export const savePerformanceDataForPeriod = async (storeId: string, period: Period, data: PerformanceData): Promise<void> => {
    if (!db || !actualsCollection) throw new Error("Firebase not initialized.");
    
    if (Object.keys(data).length === 0) {
        throw new Error("No KPI data provided to save.");
    }
    
    // Find all the weeks that fall within the selected period
    const weeksInPeriod = ALL_PERIODS.filter(p => 
        p.type === 'Week' && 
        p.startDate >= period.startDate && 
        p.endDate <= period.endDate
    );

    if (weeksInPeriod.length === 0) {
        throw new Error(`Could not find any weeks within the selected period: ${period.label}`);
    }

    const batch = db.batch();
    const weekCount = weeksInPeriod.length;

    // Distribute the entered values across all weeks in the period
    weeksInPeriod.forEach(week => {
        const docId = `${storeId}_${week.startDate.toISOString().split('T')[0]}`;
        const docRef = actualsCollection!.doc(docId);
        
        const dataForThisWeek: PerformanceData = {};
        
        for (const key in data) {
            const kpi = key as Kpi;
            const value = data[kpi];
            if (value !== undefined) {
                const kpiConfig = KPI_CONFIG[kpi];
                // For currency KPIs, divide the total across the weeks.
                // For percentage/number KPIs, apply the same value to each week.
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