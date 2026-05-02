import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  try {
    const profile = await client.query('SELECT id FROM profiles LIMIT 1');
    const validId = profile.rows[0].id;

    const id = '3d5fe991-fb12-4582-92eb-87f2aaffe096';
    const reqBody = { amount_receipt: 9999 };
    
    const old = await client.query('SELECT * FROM assignments WHERE id=$1', [id]);
    
    const fields = ['category', 'scope_areas', 'total_fees', 'billing_cycle', 'partner_id',
            'manager_id', 'start_date', 'end_date', 'notes', 'gstn', 'subcategory', 'assessment_year', 'scope_item',
            'billed_amount', 'out_of_pocket', 'amount_receipt'];
    const updates: string[] = [];
    const params: any[] = [];
    const changedFields: any[] = [];

    for (const f of fields) {
        if (reqBody[f as keyof typeof reqBody] !== undefined && reqBody[f as keyof typeof reqBody] !== old.rows[0][f]) {
            changedFields.push({ field: f, old: old.rows[0][f], new: reqBody[f as keyof typeof reqBody] });
            params.push(reqBody[f as keyof typeof reqBody]);
            updates.push(`${f} = $${params.length}`);
        }
    }

    if (updates.length) {
        params.push(id);
        const q = `UPDATE assignments SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${params.length}`;
        console.log('QUERY:', q, 'PARAMS:', params);
        await client.query(q, params);
        
        for (const ch of changedFields) {
            await client.query(
                'INSERT INTO change_history (entity_type,entity_id,field_name,old_value,new_value,changed_by,reason) VALUES ($1,$2,$3,$4,$5,$6,$7)',
                ['assignment', id, ch.field, String(ch.old), String(ch.new), validId, null]
            );
        }
    }
    console.log('Success');
  } catch (err: any) {
    console.error('DB Error:', err);
  } finally {
    await client.end();
  }
}
run();
