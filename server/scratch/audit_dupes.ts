import pool from '../src/db/pool.ts';

async function auditDuplicateData() {
    try {
        const duplicates = [
            { lower: 'bhushan.patil@gmail.com', upper: 'BHUSHAN.PATIL@GMAIL.COM' },
            { lower: 'dhanashree.dekhane@gmail.com', upper: 'DHANASHREE.DEKHANE@GMAIL.COM' },
            { lower: 'mohit.joshi@gmail.com', upper: 'MOHIT.JOSHI@GMAIL.COM' },
            { lower: 'sanjeev.deshpande@gmail.com', upper: 'SANJEEV.DESHPANDE@GMAIL.COM' }
        ];

        for (const duo of duplicates) {
            const res = await pool.query(`
                SELECT email, id, 
                (SELECT COUNT(*) FROM assignments WHERE manager_id = profiles.id OR partner_id = profiles.id) as assign_count,
                (SELECT COUNT(*) FROM proposals WHERE prepared_by = profiles.id OR responsible_partner = profiles.id) as prop_count
                FROM profiles 
                WHERE email IN ($1, $2)
            `, [duo.lower, duo.upper]);
            
            console.log(`Audit for ${duo.lower}:`);
            console.log(JSON.stringify(res.rows, null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

auditDuplicateData();
