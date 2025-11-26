
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
        const response = await fetch('/__/firebase/init.json');
        if (!response.ok) {
            throw new Error(`Firebase config not found at ${response.url}`);
        }
        const firebaseConfig = await response.json();

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        db = firebase.firestore();
        storage = firebase.storage();

        // Initialize collections after db is set
        notesCollection = db.collection('notes');
        actualsCollection = db.collection('performance_actuals');
        goalsCollection = db.collection('goals');
        deploymentsCollection = db.collection('deployments');
        directorsCollection = db.collection('directors');
        budgetsCollection = db.collection('budgets');

        await seedInitialData();
        return { status: 'connected' };
    } catch (error) {
        console.error("Firebase initialization error:", error);
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
    // This is a placeholder implementation. A real implementation would query and aggregate data from Firestore.
    console.log('Fetching aggregated data for', period, storeId);
    return {};
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
    const q = query(deploymentsCollection, where("directorId", "==", directorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: firebase.firestore.DocumentData) => ({ id: doc.id, ...doc.data() } as Deployment));
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

// Helper to avoid Firestore/Firebase SDK references in components that don't need it.
// This is a placeholder for a more robust solution.
const query = (collection: any, ...constraints: any): any => {
    return firebase.firestore().collection(collection.path).where(constraints[0], constraints[1], constraints[2]);
}
const where = (field: string, op: any, value: any) => {
    return [field, op, value];
}
const getDocs = async (query: any) => {
    return await query;
}
