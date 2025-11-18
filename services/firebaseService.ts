// FIX: All firebase imports are changed to use the v8 compat library to match the errors provided.
// This requires rewriting all Firebase SDK calls to the v8 namespaced syntax.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
// FIX: Add missing type imports to resolve 'Cannot find name' errors.
import { Note, NoteCategory, View, DirectorProfile, DataMappingTemplate, Kpi, PerformanceData, StorePerformanceData, Budget } from '../types';
import { DIRECTORS as fallbackDirectors, ALL_STORES } from '../constants';

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

let isInitialized = false;

export const initializeFirebaseService = async (): Promise<FirebaseStatus> => {
    if (isInitialized) return { status: 'connected' };

    try {
        const response = await fetch('/.netlify/functions/firebase-config-proxy');
        if (!response.ok) { /* ... error handling ... */ }
        const firebaseConfig = await response.json();
        
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
        
        isInitialized = true;
        console.log("Firebase service initialized successfully.");
        return { status: 'connected' };

    } catch (error: any) {
        console.error("Firebase Initialization Error:", error);
        isInitialized = false;
        return { 
            status: 'error', 
            message: `The config value from your Netlify settings is invalid and could not be parsed. Please carefully follow the updated instructions in the README.`,
            rawValue: error.rawValue || 'Could not retrieve raw value from server.'
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
    
    const shortName = name.split(',')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if(!acc[shortName]) acc[shortName] = name;

    const prefixMatch = name.match(/\d+\s*-\s*(.*)/);
    if(prefixMatch) {
        const prefixKey = prefixMatch[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
         if(!acc[prefixKey]) acc[prefixKey] = name;
    }

    return acc;
}, {} as Record<string, string>);

const cleanAndMatchStoreName = (rawName: string): string | null => {
    if (!rawName) return null;
    const key = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const prefixMatch = rawName.match(/\d+\s*-\s*(.*)/);
    const prefixKey = prefixMatch ? prefixMatch[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '') : null;

    return storeNameMap[key] || (prefixKey ? storeNameMap[prefixKey] : null) || null;
}


export const batchImportActuals = async (data: any[], template: DataMappingTemplate, weekStartDate: Date): Promise<void> => {
    if (!db || !actualsCollection) throw new Error("Firebase not initialized.");
    const batch = db.batch();

    const storeNameHeader = Object.keys(template.mappings).find(h => template.mappings[h] === 'Store Name');
    if (!storeNameHeader) throw new Error("Mapping template is invalid: missing 'Store Name' mapping.");
    
    data.forEach(row => {
        const rawStoreName = row[storeNameHeader];
        const storeId = cleanAndMatchStoreName(rawStoreName);
        
        if (storeId) {
            const performanceData: PerformanceData = {};
            for (const header in template.mappings) {
                const kpi = template.mappings[header];
                if (kpi !== 'ignore' && kpi !== 'Store Name' && kpi !== 'Week Start Date' && kpi in Kpi) {
                    let value = row[header];
                    if (typeof value === 'string') {
                        value = value.replace(/[\$,%]/g, '');
                    }
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                        performanceData[kpi as Kpi] = numValue;
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
             console.warn(`Could not match store name: "${rawStoreName}"`);
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
                    const numValue = parseFloat(row[key]);
                    if (!isNaN(numValue)) {
                        targets[key as Kpi] = numValue;
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