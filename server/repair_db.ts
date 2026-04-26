import pool from './src/db/pool.ts';

async function repair() {
    console.log('🛠 Starting Database Repair...');
    try {
        // 1. Repair profiles table
        console.log('👤 Repairing profiles table...');
        await pool.query(`
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS reports_to UUID REFERENCES profiles(id),
            ADD COLUMN IF NOT EXISTS work_file_url TEXT
        `);
        console.log('✅ profiles table repaired');

        // 2. Repair assignments table
        console.log('📋 Repairing assignments table...');
        await pool.query(`
            ALTER TABLE assignments 
            ADD COLUMN IF NOT EXISTS billed_amount NUMERIC(14,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS amount_receipt NUMERIC(14,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS out_of_pocket NUMERIC(14,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id)
        `);
        console.log('✅ assignments table repaired');

        // 3. Backfill created_by if needed
        await pool.query(`
            UPDATE assignments 
            SET created_by = COALESCE(partner_id, manager_id) 
            WHERE created_by IS NULL
        `);
        console.log('✅ created_by backfilled');

        // 4. Ensure Hamza Momin has correct data
        console.log('👔 Ensuring Hamza Momin profile data...');
        await pool.query(`
            UPDATE profiles 
            SET role = 'manager',
                display_name = 'Hamza Momin',
                work_file_url = '/For Dev.xlsb',
                updated_at = NOW()
            WHERE email IN ('hamza.momin@kpis.co.in', 'hamza.momin@kirtanepandit.com') 
               OR full_name = 'Hamza Momin'
        `);
        console.log('✅ Hamza Momin profile updated');

        console.log('🚀 Database Repair Completed Successfully');
    } catch (err: any) {
        console.error('❌ Repair failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

repair();
