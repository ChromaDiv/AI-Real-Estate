const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.resolve(__dirname, '../.env.local');
let env = {};
try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            const key = parts[0]?.trim();
            const value = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '');
            if (key && value) {
                env[key] = value;
            }
        });
    }
} catch (e) { }

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyLeads() {
    console.log('Verifying leads table...');

    // Try to insert a dummy lead
    const dummy = {
        name: 'Verification Lead',
        phone: '555-0100',
        category: 'WARM',
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('leads').insert(dummy).select();

    if (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    }

    console.log('✅ Lead inserted successfully:', data[0]);

    // Clean up
    await supabase.from('leads').delete().eq('id', data[0].id);
    console.log('✅ Cleanup successful.');

    // Final check of counts
    const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    console.log(`Current leads count: ${count}`);
}

verifyLeads();
