let firebase: any = null;

import { Note, NoteCategory, View, DirectorProfile, Kpi, PerformanceData, StorePerformanceData, Budget, Goal, Period, Deployment, FinancialLineItem, FileUploadResult } from '../types';
import { DIRECTORS as fallbackDirectors, ALL_STORES, KPI_CONFIG } from '../constants';
import { ALL_PERIODS } from '../utils/dateUtils';

export type FirebaseStatus = 
  | { status: 'initializing'; error?: null; }
  | { status: 'connected'; error?: null; }
  | { status: 'error'; error: string; };

let app: any = null;
let db: any = null;
let storage: any = null;
let notesCollection: any = null;
let directorsCollection: any = null;
let actualsCollection: any = null;
let budgetsCollection: any = null;
let goalsCollection: any = null;
let deploymentsCollection: any = null;

let isInitialized = false;

export const initializeFirebaseService = async (): Promise<FirebaseStatus> => {
    if (isInitialized) return { status: 'connected' };

    try {
        const firebaseConfig = {
            apiKey: "AIzaSyCKoWG5R0H7WPeTZ50P8lHrUiOYQyuTfu4",
            authDomain: "operations-kpi-dashboard.firebaseapp.com",
            projectId: "operations-kpi-dashboard",
            storageBucket: "operations-kpi-dashboard.firebasestorage.app",
            messagingSenderId: "888247978360",
            appId: "1:888247978360:web:58ee0decf65dbf83fb208d"
        };
        
        if (!firebase) {
            try {
                const compat = await import('firebase/compat/app');
                firebase = (compat && (compat as any).default) || compat;
                await import('firebase/compat/firestore');
                await import('firebase/compat/storage');
            } catch (e) {
                console.error('Failed to dynamically import Firebase compat SDK:', e);
                throw new Error('Client failed to load Firebase SDK.');
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
        goalsCollection = db.collection('goals');
        deploymentsCollection = db.collection('deployments');
        
        isInitialized = true;
        console.log("Firebase service initialized successfully.");
        return { status: 'connected' };

    } catch (error: any) {
        console.error("Firebase Initialization Error:", error);
        isInitialized = false;
        return { 
            status: 'error',
            error: `Firebase initialization failed. Please check your Firebase configuration in services/firebaseService.ts and ensure all placeholder values have been replaced with your actual project credentials.`
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

export const uploadFile = async (file: File): Promise<FileUploadResult> => {
    if (!storage) throw new Error("Firebase Storage not initialized.");
    const uploadId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const uniqueFileName = `${uploadId}-${file.name}`;
    const filePath = `imports/${uniqueFileName}`;
    const storageRef = storage.ref(filePath);
    await storageRef.put(file);
    const fileUrl = await storageRef.getDownloadURL();
    return { uploadId, fileUrl, filePath, fileName: file.name, mimeType: file.type };
};

export const uploadTextAsFile = async (text: string, chunkName: string): Promise<FileUploadResult> => {
    if (!storage) throw new Error("Firebase Storage not initialized.");
    const blob = new Blob([text], { type: 'text/plain' });
    const uploadId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const uniqueFileName = `${uploadId}-${chunkName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    const filePath = `imports/${uniqueFileName}`;
    const storageRef = storage.ref(filePath);
    await storageRef.put(blob);
    const fileUrl = await storageRef.getDownloadURL();
    return { uploadId, fileUrl, filePath, fileName: chunkName, mimeType: 'text/plain' };
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

            const performanceData: PerformanceData = {};
            for (const key in row) {
                const kpi = key as Kpi;
                if (Object.values(Kpi).includes(kpi)) {
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
                if (Object.values(Kpi).includes(kpi)) {
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

export const getGoalsForDirector = async (directorId: string, period: Period): Promise<Goal[]> => {
    if (!goalsCollection) return [];
    const q = goalsCollection.where('directorId', '==', directorId).where('year', '==', period.year).where('quarter', '==', period.quarter);
    const snapshot = await q.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Goal));
};

export const addGoal = async (directorId: string, quarter: number, year: number, kpi: Kpi, target: number): Promise<Goal> => {
    if (!goalsCollection) throw new Error("Firebase not initialized.");
    const newGoal = { directorId, quarter, year, kpi, target };
    const docRef = await goalsCollection.add(newGoal);
    return { id: docRef.id, ...newGoal };
};

export const getNotes = async (): Promise<Note[]> => {
    if (!notesCollection) return [];
    const q = notesCollection.orderBy('createdAt', 'desc');
    const snapshot = await q.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data(), createdAt: (doc.data().createdAt as any).toDate().toISOString() } as Note));
};

export const addNote = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string): Promise<Note> => {
    if (!notesCollection || !db) throw new Error("Firebase not initialized.");
    const createdAtTimestamp = firebase.firestore.Timestamp.now();
    const newNoteData: any = { monthlyPeriodLabel, category, content, scope, createdAt: createdAtTimestamp };
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

export const savePerformanceDataForPeriod = async (storeId: string, period: Period, data: PerformanceData): Promise<void> => {
    if (!db || !actualsCollection) throw new Error("Firebase not initialized.");
    
    if (Object.keys(data).length === 0) {
        throw new Error("No KPI data provided to save.");
    }
    
    const weeksInPeriod = ALL_PERIODS.filter((p: Period) => 
        p.type === 'weekly' && 
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
                if (kpiConfig.aggregation === 'sum') {
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

export const getDeploymentsForDirector = async (directorId: string): Promise<Deployment[]> => {
    if (!deploymentsCollection) return [];
    const q = deploymentsCollection.where('directorId', '==', directorId);
    const snapshot = await q.get();
    return snapshot.docs.map((doc: any) => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString()
     } as Deployment));
};