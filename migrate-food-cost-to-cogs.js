/**
 * Migration Script: Rename "Food Cost" to "COGS" in all Firestore documents
 *
 * Run this once to update all existing performance_actuals documents
 * Usage: node migrate-food-cost-to-cogs.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

// Your Firebase config - UPDATE THIS with your actual config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateFoodCostToCOGS() {
  console.log('🔄 Starting migration: Food Cost → COGS');

  const actualsCollection = collection(db, 'performance_actuals');
  const snapshot = await getDocs(actualsCollection);

  console.log(`📊 Found ${snapshot.size} documents to check`);

  let updatedCount = 0;
  let batchCount = 0;
  let batch = writeBatch(db);

  snapshot.docs.forEach((docSnap) => {
    const docData = docSnap.data();
    const data = docData.data;

    // Check if this document has "Food Cost" KPI
    if (data && data['Food Cost'] !== undefined) {
      const newData = { ...data };

      // Rename Food Cost to COGS
      newData['COGS'] = data['Food Cost'];
      delete newData['Food Cost'];

      // Update document
      batch.update(docSnap.ref, { data: newData });
      updatedCount++;
      batchCount++;

      console.log(`  ✓ ${docSnap.id}: Food Cost (${data['Food Cost']}) → COGS`);

      // Firestore batch limit is 500 operations
      if (batchCount >= 500) {
        console.log('  💾 Committing batch...');
        batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
  });

  // Commit remaining updates
  if (batchCount > 0) {
    console.log('  💾 Committing final batch...');
    await batch.commit();
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Updated ${updatedCount} documents`);
  console.log(`   Skipped ${snapshot.size - updatedCount} documents (no Food Cost field)`);
}

migrateFoodCostToCOGS()
  .then(() => {
    console.log('\n✅ Done! You can now close this script.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
