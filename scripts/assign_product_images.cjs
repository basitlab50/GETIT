/**
 * Assign Real Product Images to Nigerian Groceries Catalog
 * 1. Matches 73 beverage images to catalog SKUs
 * 2. Renames to web-safe slugs in public/products/ and mobile/assets/products/
 * 3. Updates src/data/nigerianGroceriesCatalog.js and mobile/data/nigerianGroceriesCatalog.js
 * 4. Syncs image_url to Supabase public.master_catalog_products
 */

const fs = require('fs');
const path = require('path');

const srcCatalogPath = path.join(__dirname, '..', 'src', 'data', 'nigerianGroceriesCatalog.js');
const mobileCatalogPath = path.join(__dirname, '..', 'mobile', 'data', 'nigerianGroceriesCatalog.js');
const imagesDir = 'C:\\Users\\HP\\Downloads\\images';
const publicProductsDir = path.join(__dirname, '..', 'public', 'products');
const mobileProductsDir = path.join(__dirname, '..', 'mobile', 'assets', 'products');

if (!fs.existsSync(publicProductsDir)) fs.mkdirSync(publicProductsDir, { recursive: true });
if (!fs.existsSync(mobileProductsDir)) fs.mkdirSync(mobileProductsDir, { recursive: true });

const rawCatalog = fs.readFileSync(srcCatalogPath, 'utf8');
const match = rawCatalog.match(/export const NIGERIAN_GROCERIES_CATALOG = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Failed to parse catalog');
  process.exit(1);
}

const catalog = JSON.parse(match[1]);
const files = fs.readdirSync(imagesDir);

function scoreMatch(file, item) {
  const f = file.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const n = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const b = (item.brand || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (b && !f.includes(b)) return -1;
  
  let score = 0;
  
  // Specific variants
  if (f.includes('zero') && n.includes('zero')) score += 10;
  if (f.includes('zero') && !n.includes('zero')) return -1;
  if (!f.includes('zero') && n.includes('zero')) return -1;

  if (f.includes('chapman') && n.includes('chapman')) score += 10;
  if (f.includes('bitter lemon') && n.includes('bitter lemon')) score += 10;
  if (f.includes('tonic') && n.includes('tonic')) score += 10;
  if (f.includes('pulpy') && n.includes('pulpy')) score += 10;
  if (f.includes('exotic') && n.includes('exotic')) score += 10;
  if (f.includes('zest') && n.includes('zest')) score += 10;
  if (f.includes('citrus') && n.includes('citrus')) score += 10;
  if (f.includes('vanilla') && n.includes('vanilla')) score += 10;
  if (f.includes('pineapple') && n.includes('pineapple')) score += 10;
  if (f.includes('orange') && n.includes('orange')) score += 6;
  if (f.includes('cola') && n.includes('cola')) score += 5;

  // Sizes
  const sizes = [
    '18.9 l', '1.5 l', '1 l', '85 cl', '75 cl', '60 cl', '50 cl', '44 cl', 
    '40 cl', '380 ml', '35 cl', '33 cl', '30 cl', '25 cl', '20 cl', 
    '500 g', '250 g', '100 g', '50 g', '20 g'
  ];
  for (const s of sizes) {
    const normS = s.replace(/\s+/g, '');
    const hasInFile = f.includes(s) || f.includes(normS);
    const hasInItem = n.includes(s) || n.includes(normS);
    if (hasInFile && hasInItem) score += 15;
    else if (hasInFile && !hasInItem) score -= 3;
  }

  // Packages
  const pkgs = ['can', 'pet bottle', 'carton', 'pouch', 'sachet', 'jar', 'glass bottle', 'bottle'];
  for (const p of pkgs) {
    if (f.includes(p) && n.includes(p)) score += 5;
  }

  return score;
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const assigned = new Map();

for (const file of files) {
  let bestItem = null;
  let bestScore = -1;

  for (const item of catalog) {
    const sc = scoreMatch(file, item);
    if (sc > bestScore) {
      bestScore = sc;
      bestItem = item;
    }
  }

  if (bestItem && bestScore > 0) {
    const ext = path.extname(file).toLowerCase();
    const cleanFileName = `${slugify(bestItem.name)}${ext}`;
    
    // Copy to public/products and mobile/assets/products
    const srcPath = path.join(imagesDir, file);
    fs.copyFileSync(srcPath, path.join(publicProductsDir, cleanFileName));
    fs.copyFileSync(srcPath, path.join(mobileProductsDir, cleanFileName));

    const webUrl = `/products/${cleanFileName}`;
    bestItem.imageUrl = webUrl;
    assigned.set(bestItem.id, { item: bestItem, webUrl, file });
    console.log(`[LINKED] ${file} -> ${bestItem.name} (${webUrl})`);
  }
}

console.log(`\nSuccessfully assigned images to ${assigned.size} products!`);

// Write updated catalog to src and mobile
const updatedContent = `/**
 * Master Catalog (Pharmacy, Skincare, Baby Care, Groceries, Beverages & Household)
 * Total Items: ${catalog.length}
 */

export const NIGERIAN_GROCERIES_CATALOG = ${JSON.stringify(catalog, null, 2)};
`;

fs.writeFileSync(srcCatalogPath, updatedContent, 'utf8');
fs.writeFileSync(mobileCatalogPath, updatedContent, 'utf8');
console.log('✔ Updated src/data/nigerianGroceriesCatalog.js and mobile/data/nigerianGroceriesCatalog.js');

// Sync to Supabase
async function syncToSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://pqekoqryvpfomexmptik.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZWtvcXJ5dnBmb21leG1wdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MzA0ODIsImV4cCI6MjEwNzIwNjQ4Mn0.r32Ax0I_rW9EkmkyDSIbUc7lSUU0P51StmpDhsXf7G8';

  const updates = Array.from(assigned.values()).map(({ item, webUrl }) => ({
    id: item.id,
    image_url: webUrl
  }));

  console.log(`Updating ${updates.length} image URLs in Supabase...`);
  for (let i = 0; i < updates.length; i += 25) {
    const chunk = updates.slice(i, i + 25);
    const res = await fetch(`${supabaseUrl}/rest/v1/master_catalog_products`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(chunk)
    });
    if (!res.ok) {
      console.warn('Chunk update error:', await res.text());
    }
  }
  console.log('✔ Supabase master_catalog_products images synced successfully!');
}

syncToSupabase().catch(console.error);
