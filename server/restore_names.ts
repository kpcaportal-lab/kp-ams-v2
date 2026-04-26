import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function restoreNames() {
  const users = [
    { email: 'milind.limaye@gmail.com', name: 'Milind Limaye', display: 'Milind L.' },
    { email: 'tanmay.bodhe@gmail.com', name: 'Tanmay Bodhe', display: 'Tanmay B.' },
    { email: 'rishabh.thakkar@gmail.com', name: 'Rishabh Thakkar', display: 'Rishabh T.' },
    { email: 'hamza.momin@kpis.co.in', name: 'Hamza Momin', display: 'Hamza M.' },
    { email: 'sanjeev.deshpande@gmail.com', name: 'Sanjeev Deshpande', display: 'Sanjeev D.' },
    { email: 'bhushan.patil@gmail.com', name: 'Bhushan Patil', display: 'Bhushan P.' },
    { email: 'mohit.joshi@gmail.com', name: 'Mohit Joshi', display: 'Mohit J.' },
    { email: 'vibhuti.narang@gmail.com', name: 'Vibhuti Narang', display: 'Vibhuti N.' },
    { email: 'dhanashree.dekhane@gmail.com', name: 'Dhanashree Dekhane', display: 'Dhanashree D.' },
    { email: 'admin.kpams@gmail.com', name: 'System Administrator', display: 'Admin' }
  ];

  try {
    for (const u of users) {
      await pool.query(
        'UPDATE profiles SET full_name = $1, display_name = $2 WHERE email = $3',
        [u.name, u.display, u.email]
      );
      console.log(`Restored: ${u.name}`);
    }
    console.log('✅ All names restored successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

restoreNames();
