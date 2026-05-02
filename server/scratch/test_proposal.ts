import pool from '../src/db/pool.ts';

async function testProposalCreation() {
    try {
        // 1. Get a valid JWT token by logging in
        const loginRes = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin.kpams@gmail.com', password: 'KpAms@2025' })
        });
        
        if (!loginRes.ok) {
            console.error('❌ Login failed:', loginRes.status, await loginRes.text());
            return;
        }
        
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Logged in successfully. Token obtained.');

        // 2. Get a valid client_id
        const clientsRes = await fetch('http://localhost:4000/api/clients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const clients = await clientsRes.json();
        if (!clients.length) {
            console.error('❌ No clients found in database');
            return;
        }
        const clientId = clients[0].id;
        console.log(`✅ Using client: ${clients[0].name} (${clientId})`);

        // 3. Get a valid partner UUID
        const partnersRes = await fetch('http://localhost:4000/api/users/partners', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const partners = await partnersRes.json();
        if (!partners.length) {
            console.error('❌ No partners found');
            return;
        }
        const partnerId = partners[0].id;
        console.log(`✅ Using partner: ${partners[0].full_name} (${partnerId})`);

        // 4. Get a valid manager UUID
        const managersRes = await fetch('http://localhost:4000/api/users/managers', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const managers = await managersRes.json();
        if (!managers.length) {
            console.error('❌ No managers found');
            return;
        }
        const managerId = managers[0].id;
        console.log(`✅ Using manager: ${managers[0].full_name} (${managerId})`);

        // 5. Create the proposal — this is what the frontend sends
        const payload = {
            client_id: clientId,
            proposal_type: 'new',
            assignment_type: 'internal_audit',
            quotation_amount: 50000,
            fiscal_year: '2025-26',
            scope_areas: 'Annual internal audit scope for testing',
            notes: '',
            responsible_partner: partnerId,
            manager_id: managerId
        };

        console.log('\n📤 Submitting proposal payload:', JSON.stringify(payload, null, 2));

        const createRes = await fetch('http://localhost:4000/api/proposals', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        const result = await createRes.json();
        
        if (createRes.ok) {
            console.log('\n✅ PROPOSAL CREATED SUCCESSFULLY!');
            console.log('Proposal:', JSON.stringify(result, null, 2));
        } else {
            console.error('\n❌ PROPOSAL CREATION FAILED!');
            console.error('Status:', createRes.status);
            console.error('Response:', JSON.stringify(result, null, 2));
        }

    } catch (err) {
        console.error('❌ Test failed:', err);
    } finally {
        await pool.end();
    }
}

testProposalCreation();
