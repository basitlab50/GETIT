/**
 * Seed Script: Master Nigerian Groceries & Pharmacy Catalog (193 SKUs) into Supabase
 *
 * Uses native fetch for maximum Node.js compatibility across all environments.
 * Usage:
 *   node supabase/seed_catalog.cjs [SUPABASE_URL] [SUPABASE_ANON_OR_SERVICE_KEY]
 */

const fs = require('fs');
const path = require('path');

// 1. Resolve environment credentials
let supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.argv[2];
let supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.argv[3];

// Try reading from .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1].trim();
      const val = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
      if ((key === 'VITE_SUPABASE_URL' || key === 'SUPABASE_URL') && !supabaseUrl) supabaseUrl = val;
      if ((key === 'VITE_SUPABASE_ANON_KEY' || key === 'SUPABASE_KEY' || key === 'SUPABASE_SERVICE_ROLE_KEY') && !supabaseKey) supabaseKey = val;
    }
  });
}

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
  console.error('\x1b[31m[ERROR] Supabase credentials not found!\x1b[0m');
  console.log('\nPlease provide your credentials in one of these ways:');
  console.log('1. Pass them as arguments:');
  console.log('   node supabase/seed_catalog.cjs <YOUR_SUPABASE_URL> <YOUR_SUPABASE_KEY>');
  console.log('2. Or set them in a .env file at the project root:\n');
  process.exit(1);
}

// 2. Load catalog items from mobile/data/nigerianGroceriesCatalog.js
const catalogFile = path.join(__dirname, '..', 'mobile', 'data', 'nigerianGroceriesCatalog.js');
const rawCode = fs.readFileSync(catalogFile, 'utf8');

const match = rawCode.match(/export const NIGERIAN_GROCERIES_CATALOG = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Failed to parse NIGERIAN_GROCERIES_CATALOG array from file.');
  process.exit(1);
}

let catalogItems;
try {
  catalogItems = JSON.parse(match[1]);
} catch (e) {
  console.error('Failed to JSON parse catalog:', e.message);
  process.exit(1);
}

console.log(`\x1b[36mFound ${catalogItems.length} products to seed into Supabase public.master_catalog_products...\x1b[0m`);

async function seed() {
  const records = catalogItems.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory || null,
    brand: item.brand || null,
    icon: item.icon || '🛍️',
    suggested_price: item.suggestedPrice || 0,
    price_range: item.priceRange || null,
    description: item.description || null,
    image_url: item.imageUrl || null
  }));

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/master_catalog_products`;
  const chunkSize = 50;
  let totalInserted = 0;

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(chunk)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`\x1b[31mError upserting chunk ${i / chunkSize + 1} (${response.status}):\x1b[0m`, errText);
      if (errText.includes('PGRST205') || errText.includes('Could not find the table')) {
        console.log('\n\x1b[33mNOTE: The database table "public.master_catalog_products" does not exist yet.');
        console.log('Please copy and run supabase/schema.sql in your Supabase SQL Editor first!\x1b[0m\n');
        process.exit(1);
      }
    } else {
      totalInserted += chunk.length;
      console.log(`\x1b[32m✔ Inserted/Updated ${totalInserted}/${records.length} products\x1b[0m`);
    }
  }

  console.log(`\n\x1b[32m🎉 Success! All ${totalInserted} Nigerian groceries & pharmacy products seeded into Supabase!\x1b[0m`);
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
