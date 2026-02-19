const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars from .env.local
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
} catch (e) {
    console.warn('Warning: Could not read .env.local', e);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials. Ensure .env.local exists with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing connection to Supabase...');
    console.log(`URL: ${supabaseUrl}`);

    // Try to select from properties table
    const { data, error } = await supabase.from('properties').select('*').limit(1);

    if (error) {
        console.error('❌ Connection failed or table missing:', error.message);
        if (error.code === '42P01') { // undefined_table
            console.error('\n⚠️  CRITICAL ERROR: The table "properties" does not exist.');
            console.error('👉 ACTION REQUIRED: Run the SQL in "supabase/schema.sql" in your Supabase Dashboard SQL Editor.');
        }
        process.exit(1);
    }

    console.log('✅ Success! Connected to Supabase and "properties" table exists.');
}

testConnection();
