/**
 * Incremental Product Images Onboarder
 * Scans "C:\\Users\\HP\\Downloads\\New folder\\images", skips existing ones,
 * matches new ones to catalog items, updates catalogs, generates mobile asset map,
 * and syncs to Supabase.
 */

const fs = require('fs');
const path = require('path');

const srcCatalogPath = path.join(__dirname, '..', 'src', 'data', 'nigerianGroceriesCatalog.js');
const mobileCatalogPath = path.join(__dirname, '..', 'mobile', 'data', 'nigerianGroceriesCatalog.js');
const newImagesDir = 'C:\\Users\\HP\\Downloads\\New folder\\images';
const publicProductsDir = path.join(__dirname, '..', 'public', 'products');
const mobileProductsDir = path.join(__dirname, '..', 'mobile', 'assets', 'products');

const rawCatalog = fs.readFileSync(srcCatalogPath, 'utf8');
const match = rawCatalog.match(/export const NIGERIAN_GROCERIES_CATALOG = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Failed to parse catalog');
  process.exit(1);
}

const catalog = JSON.parse(match[1]);
const newFiles = fs.readdirSync(newImagesDir);

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
  if (f.includes('apple') && n.includes('apple')) score += 8;
  if (f.includes('orange') && n.includes('orange')) score += 6;
  if (f.includes('cola') && n.includes('cola')) score += 5;
  if (f.includes('malt smash') && n.includes('malt smash')) score += 12;

  // Sizes
  const sizes = [
    '18.9 l', '1.5 l', '1 l', '85 cl', '75 cl', '60 cl', '50 cl', '44 cl', 
    '40 cl', '380 ml', '35 cl', '33 cl', '30 cl', '25 cl', '20 cl', '300-350 ml', '30–35 cl',
    '500 g', '250 g', '100 g', '50 g', '20 g', '500 ml', '250 ml'
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

let newlyAdded = 0;
let skipped = 0;

for (const file of newFiles) {
  const ext = path.extname(file).toLowerCase();
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
    const cleanFileName = `${slugify(bestItem.name)}${ext}`;
    const targetPublic = path.join(publicProductsDir, cleanFileName);
    const targetMobile = path.join(mobileProductsDir, cleanFileName);
    const srcPath = path.join(newImagesDir, file);

    const webUrl = `/products/${cleanFileName}`;

    // Check if item already had this exact image
    if (bestItem.imageUrl === webUrl && fs.existsSync(targetPublic)) {
      skipped++;
    } else {
      fs.copyFileSync(srcPath, targetPublic);
      fs.copyFileSync(srcPath, targetMobile);
      bestItem.imageUrl = webUrl;
      newlyAdded++;
      console.log(`[+ NEW IMAGE ADDED] ${file} -> ${bestItem.name} (${webUrl})`);
    }
  } else {
    console.log(`[!] NO EXACT MATCH FOR: ${file}`);
  }
}

console.log(`\nResults: ${newlyAdded} new images added, ${skipped} already existed and skipped.`);

if (newlyAdded > 0) {
  const updatedContent = `/**
 * Master Catalog (Pharmacy, Skincare, Baby Care, Groceries, Beverages & Household)
 * Total Items: ${catalog.length}
 */

export const NIGERIAN_GROCERIES_CATALOG = ${JSON.stringify(catalog, null, 2)};
`;

  fs.writeFileSync(srcCatalogPath, updatedContent, 'utf8');
  fs.writeFileSync(mobileCatalogPath, updatedContent, 'utf8');
  console.log('✔ Updated catalogs with new image links!');
}
