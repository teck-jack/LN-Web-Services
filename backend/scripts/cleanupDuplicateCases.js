/**
 * Database Cleanup Script
 * Removes duplicate or test cases to allow fresh enrollments
 * 
 * Usage: node scripts/cleanupDuplicateCases.js [userId] [serviceId]
 * 
 * Examples:
 * - Clean all test cases: node scripts/cleanupDuplicateCases.js
 * - Clean specific user+service: node scripts/cleanupDuplicateCases.js 69771cf2e911e00f16749978 6947fc71277415f2c40b0ed0
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Case = require('../models/Case');
const Payment = require('../models/Payment');

const cleanupCases = async (userId = null, serviceId = null) => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        let query = {};

        if (userId && serviceId) {
            // Clean specific user+service combination
            query = { endUserId: userId, serviceId };
            console.log(`\n🔍 Finding cases for user: ${userId}, service: ${serviceId}`);
        } else {
            // Clean all test/duplicate cases
            console.log('\n🔍 Finding all test cases...');
            query = {
                $or: [
                    { caseId: { $regex: /^CASE-.*-TEST/i } },
                    { status: 'cancelled' }
                ]
            };
        }

        const cases = await Case.find(query);
        console.log(`📋 Found ${cases.length} cases to clean`);

        if (cases.length === 0) {
            console.log('✅ No cases to clean');
            return;
        }

        // Show cases before deletion
        console.log('\n📊 Cases to be deleted:');
        cases.forEach((c, i) => {
            console.log(`  ${i + 1}. ${c.caseId} - Status: ${c.status}`);
        });

        // Delete associated payments first
        const caseIds = cases.map(c => c._id);
        const paymentsDeleted = await Payment.deleteMany({ caseId: { $in: caseIds } });
        console.log(`\n💰 Deleted ${paymentsDeleted.deletedCount} payments`);

        // Delete cases
        const casesDeleted = await Case.deleteMany(query);
        console.log(`📦 Deleted ${casesDeleted.deletedCount} cases`);

        console.log('\n✅ Cleanup complete!');
        console.log('\n💡 You can now try enrolling again.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

// Get command line arguments
const userId = process.argv[2];
const serviceId = process.argv[3];

cleanupCases(userId, serviceId);
