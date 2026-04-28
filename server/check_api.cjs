
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dtwdrlxfqozoqmenhpih.supabase.co';
const supabaseKey = 'sb_publishable_tXT6WiXw0x1UELPP6XaVIg_FuoiAruG';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking profiles via API...');
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .limit(20);
    
    if (error) {
        console.error('API Error:', error.message);
    } else {
        console.log('Profiles:', data);
    }
}

check();
