// This script is designed to be run from the command line to seed the database with budget data.
// Usage: npm run seed:budgets (or 'netlify env:exec npm run seed:budgets' for cloud keys)

import * as fs from 'node:fs';
import * as path from 'node:path';
import { config } from 'dotenv';
import process from 'node:process';

console.log(`\n--- Environment Setup ---`);

// 1. Check if already loaded (e.g. via 'netlify env:exec')
if (process.env.FIREBASE_CLIENT_CONFIG) {
    console.log(`✅ FIREBASE_CLIENT_CONFIG detected in environment.`);
} else {
    // 2. If not, try to find .env.local
    const envPath = path.resolve(process.cwd(), '.env.local');
    console.log(`Environment variable not found. Looking for config at: ${envPath}`);

    if (fs.existsSync(envPath)) {
        console.log(`✅ Found .env.local`);
        config({ path: envPath });
    } else {
        console.warn(`⚠️  .env.local NOT found. Trying default .env...`);
        config(); 
    }
}

// 3. Final Verification
if (!process.env.FIREBASE_CLIENT_CONFIG) {
    console.error(`❌ FIREBASE_CLIENT_CONFIG is MISSING.`);
    console.error(`   If running locally without a file, use: netlify env:exec npm run seed:budgets`);
    process.exit(1);
}
console.log(`-------------------------\n`);

import { initializeFirebaseService } from '../services/firebaseService';
import { Kpi } from '../types';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// --- CONFIGURATION ---
// To prevent timeouts if you add a lot of data later, use this to filter by year.
// Leave empty to seed all years.
const YEARS_TO_SEED: number[] = []; 
// Example: const YEARS_TO_SEED = [2025];

// Manually transcribed data from the user's provided image for Downtown Asheville, October 2025
const budgetData = [
  {
    storeId: 'Downtown Asheville, NC',
    year: 2025,
    month: 10, // October
    targets: {
      [Kpi.Sales]: 414472,
      [Kpi.FoodCost]: 95008 / 414472, // From 'Total COGS' Volume Adjusted Budget and Budget Net Sales
      [Kpi.VariableLabor]: 144905 / 414472, // From 'Total Store Labor Expenses' Volume Adjusted Budget and Budget Net Sales
      [Kpi.PrimeCost]: (95008 + 144905) / 414472,
      [Kpi.SOP]: 101340 / 414472, // From 'Store Operating Profit'
    }
  }
];

const seedBudgets = async () => {
    console.log("Connecting to Firebase for budget seeding...");
    const status = await initializeFirebaseService();
    if (status.status === 'error') {
        console.error("Failed to connect to Firebase:", status.message);
        process.exit(1);
    }
    console.log("Firebase connected.");

    // Filter data based on configuration
    const filteredData = YEARS_TO_SEED.length > 0 
        ? budgetData.filter(b => YEARS_TO_SEED.includes(b.year))
        : budgetData;

    if (filteredData.length === 0) {
        console.log(`No budget data found${YEARS_TO_SEED.length > 0 ? ` for years ${YEARS_TO_SEED.join(', ')}` : ''}. Exiting.`);
        return;
    }

    const db = firebase.firestore();
    const budgetsCollection = db.collection('budgets');
    const batch = db.batch();
    
    console.log(`Preparing to write ${filteredData.length} budget document(s) to Firestore...`);

    filteredData.forEach(budget => {
        const docId = `${budget.storeId}_${budget.year}_${budget.month}`;
        const docRef = budgetsCollection.doc(docId);
        
        console.log(`  - Staging budget for ${budget.storeId} for ${budget.month}/${budget.year}`);
        
        batch.set(docRef, {
            storeId: budget.storeId,
            year: budget.year,
            month: budget.month,
            targets: budget.targets
        }, { merge: true });
    });

    try {
        await batch.commit();
        console.log("\n\x1b[32m%s\x1b[0m", "✅ Budget data seeding completed successfully!");
    } catch (error) {
        console.error("\n\x1b[31m%s\x1b[0m", "❌ An error occurred during budget data seeding:");
        console.error(error);
        process.exit(1);
    }
};

seedBudgets();