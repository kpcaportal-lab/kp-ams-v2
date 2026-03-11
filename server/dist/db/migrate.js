import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function migrate() {
    console.log('🔧 Running database migrations...');
    try {
        console.log('🔧 Step 1: Schema migration...');
        const schemaSQL = fs.readFileSync(path.join(__dirname, '../../migrations/001_schema.sql'), 'utf8');
        await pool.query(schemaSQL);
        console.log('✅ Schema migration complete');
        console.log('🔧 Step 2: Seed data migration...');
        const seedSQL = fs.readFileSync(path.join(__dirname, '../../migrations/002_seed.sql'), 'utf8');
        await pool.query(seedSQL);
        console.log('✅ Seed data migration complete');
        console.log('🔧 Step 3: Work progress migration...');
        const workProgressSQL = fs.readFileSync(path.join(__dirname, '../../migrations/003_work_progress.sql'), 'utf8');
        await pool.query(workProgressSQL);
        console.log('✅ Work progress migration complete');
        console.log('🔧 Step 4: CA workflow migration...');
        const caWorkflowSQL = fs.readFileSync(path.join(__dirname, '../../migrations/004_ca_workflow.sql'), 'utf8');
        await pool.query(caWorkflowSQL);
        console.log('✅ CA workflow migration complete');
        console.log('🔧 Step 5: RBAC migration...');
        const rbacSQL = fs.readFileSync(path.join(__dirname, '../../migrations/005_rbac.sql'), 'utf8');
        await pool.query(rbacSQL);
        console.log('✅ RBAC migration complete');
        console.log('🔧 Step 6: Staff role migration...');
        const staffSQL = fs.readFileSync(path.join(__dirname, '../../migrations/006_staff_role.sql'), 'utf8');
        await pool.query(staffSQL);
        console.log('✅ Staff role migration complete');
    }
    catch (err) {
        console.error('❌ Migration failed:', err.message);
        if (err.stack)
            console.error(err.stack);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
migrate();
