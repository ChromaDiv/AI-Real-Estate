const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.resolve(__dirname, '../.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '');
        }
    });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking for leads table and tags column...');

    // Try to select tags from leads. 
    // If column doesn't exist, this should error or return null for that field depending on how strict the query is.
    // Actually, selecting a non-existent column in supabase usually throws an error.
    const { data, error } = await supabase
        .from('leads')
        .select('tags')
        .limit(1);

    if (error) {
        console.error('❌ Error querying leads:', error.message);
        console.log('Use the Supabase SQL Editor to run the migration.');
        process.exit(1);
    }

    console.log('✅ Success! `tags` column exists in `leads` table.');
}

checkSchema();
