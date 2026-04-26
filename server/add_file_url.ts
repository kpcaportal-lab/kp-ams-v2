import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function addFileUrl() {
  try {
    // Add file_url to assignments
    await pool.query('ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_url TEXT');
    console.log('✅ Added file_url to assignments');
    
    // Stub some data for Mahindra assignments so the user sees something in the Vault
    const mahindraFiles = [
      { name: 'Mahindra Logistics Ltd', url: 'https://dtwdrlxfqozoqmenhpih.supabase.co/storage/v1/object/public/documents/mahindra_logistics_wp.pdf' },
      { name: 'Mahindra Accelo Ltd', url: 'https://dtwdrlxfqozoqmenhpih.supabase.co/storage/v1/object/public/documents/mahindra_accelo_wp.pdf' }
    ];

    for (const file of mahindraFiles) {
      await pool.query(`
        UPDATE assignments 
        SET file_url = $1 
        FROM clients 
        WHERE assignments.client_id = clients.id AND clients.name = $2
      `, [file.url, file.name]);
      console.log(`Updated file_url for ${file.name}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

addFileUrl();
