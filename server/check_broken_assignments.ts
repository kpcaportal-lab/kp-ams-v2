import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function checkBrokenLinks() {
  try {
    console.log('Checking for broken links in assignments...');
    
    const partnerCheck = await pool.query(`
      SELECT a.id, a.client_id, a.partner_id 
      FROM assignments a 
      LEFT JOIN profiles p ON a.partner_id = p.id 
      WHERE p.id IS NULL AND a.partner_id IS NOT NULL
    `);
    console.log(`Broken Partner IDs: ${partnerCheck.rows.length}`);
    if (partnerCheck.rows.length > 0) console.table(partnerCheck.rows);

    const managerCheck = await pool.query(`
      SELECT a.id, a.client_id, a.manager_id 
      FROM assignments a 
      LEFT JOIN profiles p ON a.manager_id = p.id 
      WHERE p.id IS NULL AND a.manager_id IS NOT NULL
    `);
    console.log(`Broken Manager IDs: ${managerCheck.rows.length}`);
    if (managerCheck.rows.length > 0) console.table(managerCheck.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkBrokenLinks();
