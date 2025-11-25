
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch } from 'firebase/firestore';
import { STORES, DIRECTORS } from '../src/constants'; // Corrected Path
import { Kpi } from '../src/types'; // Corrected Path
import { firebaseConfig } from '../src/services/firebaseService'; // Corrected Path

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedDatabase = async () => {
  console.log('Starting database seed process...');

  const batch = writeBatch(db);

  // 1. Seed Stores
  console.log(`Seeding ${STORES.length} stores...`);
  const storesCollection = collection(db, 'stores');
  STORES.forEach(store => {
    const storeDoc = {
      name: store.name,
      director: store.director,
      region: store.region,
      latitude: store.latitude,
      longitude: store.longitude,
    };
    batch.set(storesCollection.doc(store.id), storeDoc);
  });

  // 2. Seed Directors
  console.log(`Seeding ${DIRECTORS.length} directors...`);
  const directorsCollection = collection(db, 'directors');
  DIRECTORS.forEach(director => {
    batch.set(directorsCollection.doc(director.id), director);
  });

  // Commit the first batch of core data
  await batch.commit();

  // 3. Seed Performance Data (in a new batch)
  console.log('Seeding performance data for all stores...');
  const perfBatch = writeBatch(db);
  const today = new Date();

  STORES.forEach(store => {
    const performanceDocRef = collection(db, `stores/${store.id}/performance`);
    const performanceData = {
        [Kpi.Sales]: 50000 + Math.random() * 20000, // $50k - $70k
        [Kpi.Guests]: 2000 + Math.random() * 500,
        [Kpi.Labor]: 0.25 + Math.random() * 0.05, // 25% - 30%
        [Kpi.SOP]: 0.92 + Math.random() * 0.05, // 92% - 97%
        [Kpi.AvgTicket]: 25 + Math.random() * 2,
        [Kpi.PrimeCost]: 0.60 + Math.random() * 0.05, // 60% - 65%
        [Kpi.AvgReviews]: 4.3 + Math.random() * 0.4,
    };

    perfBatch.set(performanceDocRef.doc(today.toISOString().slice(0, 10)), performanceData);
  });

  try {
    await perfBatch.commit();
    console.log('Database seeding complete!');
  } catch (error) {
    console.error("Error writing to database: ", error);
  }
};

seedDatabase();
