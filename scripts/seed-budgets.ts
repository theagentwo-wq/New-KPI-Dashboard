// This script is designed to be run from the command line to seed the database with budget data.
// Usage: npm run seed:budgets

import 'node:process'; // FIX: Add import for node process types
import 'dotenv/config'; // Load environment variables from .env.local
import { initializeFirebaseService } from '../services/firebaseService';
import { Kpi } from '../types';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

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

    if (budgetData.length === 0) {
        console.log("No budget data to seed. Exiting.");
        return;
    }

    const db = firebase.firestore();
    const budgetsCollection = db.collection('budgets');
    const batch = db.batch();
    
    console.log(`Preparing to write ${budgetData.length} budget document(s) to Firestore...`);

    budgetData.forEach(budget => {
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
