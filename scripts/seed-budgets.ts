
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch } from 'firebase/firestore';
import { STORES } from '../src/constants'; // Corrected Path
import { Kpi } from '../src/types'; // Corrected Path
import { firebaseConfig } from '../src/services/firebaseService'; // Corrected Path

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedBudgets = async () => {
  console.log('Seeding budgets for all stores...');

  const batch = writeBatch(db);
  const year = new Date().getFullYear();

  STORES.forEach(store => {
    for (let month = 0; month < 12; month++) {
      const budgetDocRef = collection(db, `stores/${store.id}/budgets`);
      
      // Simple mock budget data
      const budgetData = {
        [Kpi.Sales]: 80000 + Math.random() * 40000, // $80k - $120k
        [Kpi.Guests]: 3200 + Math.random() * 1000,
        [Kpi.Labor]: 0.22 + Math.random() * 0.06, // 22% - 28%
        [Kpi.SOP]: 0.9 + Math.random() * 0.08, // 90% - 98%
        [Kpi.AvgTicket]: 25 + Math.random() * 5,
        [Kpi.PrimeCost]: 0.55 + Math.random() * 0.1, // 55% - 65%
        [Kpi.AvgReviews]: 4.1 + Math.random() * 0.8,
      };

      batch.set(budgetDocRef, { year, month: month + 1, targets: budgetData });
    }
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded budgets for ${STORES.length} stores for the year ${year}.`);
  } catch (error) {
    console.error("Error seeding budgets: ", error);
  }
};

seedBudgets();
