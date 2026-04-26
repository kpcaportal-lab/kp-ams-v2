import pool from './src/db/pool.js';

async function fixSchema() {
    try {
        console.log('Running schema fix...');
        
        // Add missing columns to assignments table
        await pool.query(`
            ALTER TABLE assignments 
            ADD COLUMN IF NOT EXISTS file_url TEXT,
            ADD COLUMN IF NOT EXISTS scope_item TEXT,
            ADD COLUMN IF NOT EXISTS subcategory TEXT,
            ADD COLUMN IF NOT EXISTS amount_receipt NUMERIC(15, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS billed_amount NUMERIC(15, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id)
        `);
        console.log('✅ assignments table columns added');

        // Add reporting column to profiles if missing (for hierarchy)
        await pool.query(`
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS reports_to UUID REFERENCES profiles(id)
        `);
        console.log('✅ profiles table columns added');

        // Ensure net_amount, professional_fees, billed_amount exist in invoices
        await pool.query(`
            ALTER TABLE invoices
            ADD COLUMN IF NOT EXISTS professional_fees NUMERIC(15, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS out_of_pocket NUMERIC(15, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS billed_amount NUMERIC(15, 2) DEFAULT 0
        `);
        console.log('✅ invoices table columns added');

    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        process.exit();
    }
}

fixSchema();
