const fs = require('fs');
const path = require('path');

const srcCatalogPath = path.join(__dirname, '..', 'src', 'data', 'nigerianGroceriesCatalog.js');
const mobileCatalogPath = path.join(__dirname, '..', 'mobile', 'data', 'nigerianGroceriesCatalog.js');
const images3Dir = 'C:\\Users\\HP\\Downloads\\New folder\\images3';
const publicProductsDir = path.join(__dirname, '..', 'public', 'products');
const mobileProductsDir = path.join(__dirname, '..', 'mobile', 'assets', 'products');

const rawCatalog = fs.readFileSync(srcCatalogPath, 'utf8');
const match = rawCatalog.match(/export const NIGERIAN_GROCERIES_CATALOG = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Failed to parse catalog');
  process.exit(1);
}

const catalog = JSON.parse(match[1]);
const files = fs.readdirSync(images3Dir);

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Exact map between images3 filename and target item name
const EXACT_MATCHES = {
  '5 Alive - Pulpy Tropical - 85 cl.jpg': '5 Alive Pulpy Tropical (85 cl, PET bottle)',
  'Bigi - Bigi Tropical - 50 cl.jpg': 'Bigi Tropical (50 cl, PET bottle)',
  'Bournvita - Malted chocolate beverage - 250 g.jpg': 'Bournvita Malted chocolate beverage (250 g, Pouch / tin)',
  'Chi - Exotic - 250 ml.jpg': 'Chi Exotic (250 ml, Carton)',
  'Eva - Table water - 5 L.webp': 'Eva Premium Table Water (5 L, Bottle)',
  'Fearless - Energy drink - 40 cl.jpg': 'Fearless Energy Drink (40 cl, PET bottle)',
  'Hollandia - Yoghurt drink - 1 L.jpg': 'Hollandia Yoghurt drink (1 L, Bottle)',
  'Hollandia - Yoghurt drink - 180 ml.jpg': 'Hollandia Yoghurt drink (180 ml, Bottle)',
  'Hollandia - Yoghurt drink - 315 ml.jpg': 'Hollandia Yoghurt drink (315 ml, Bottle)',
  'Hollandia - Yoghurt drink - 500 ml.jpg': 'Hollandia Yoghurt drink (500 ml, Bottle)',
  'La Casera - Apple drink - 1 L.png': 'La Casera Apple drink (1 L, PET bottle)',
  'La Casera - Apple drink - 35 cl.png': 'La Casera Apple drink (35 cl, PET bottle)',
  'Local - in-house brand - Fura da nono - 35 cl.jpg': 'Fresh Fura da nono (35 cl, Sealed bottle)',
  'Local - in-house brand - Ginger drink - 35 cl.jpg': 'Fresh Ginger drink (35 cl, Sealed bottle)',
  'Local - in-house brand - Kunu drink - 35 cl.jpg': 'Fresh Kunu drink (35 cl, Sealed bottle)',
  'Local - in-house brand - Kunu drink - 50 cl.jpg': 'Fresh Kunu drink (50 cl, Sealed bottle)',
  'Local - in-house brand - Lemonade - 35 cl.jpg': 'Fresh Lemonade (35 cl, Sealed bottle)',
  'Local - in-house brand - Zobo drink - 35 cl.png': 'Fresh Zobo drink (35 cl, Sealed bottle)',
  'Local - in-house brand - Zobo drink - 50 cl.jpg': 'Fresh Zobo drink (50 cl, Sealed bottle)',
  'Loya - Milk powder - 250 g.jpg': 'Loya Milk powder (250 g, Pouch / tin)',
  'Maltonic - Malt - tonic drink - 33 cl.png': 'Maltonic Malt Tonic (33 cl, Can)',
  'Nutri Milk - Flavoured dairy - nutrition drink - 200 ml.png': 'Nutri Milk Flavoured dairy / nutrition drink (200 ml, Bottle)',
  'Peak - Evaporated milk - 160 g.png': 'Peak Evaporated milk (160 g, Tin)',
  'Table water (local brands) - Table water - 1.5 L.png': 'Pure Bottled Table Water (1.5 L, PET bottle)',
  'Table water (local brands) - Table water - 50 cl.jpg': 'Pure Bottled Table Water (50 cl, PET bottle)',
  'Table water (local brands) - Table water - 75 cl.jpg': 'Pure Bottled Table Water (75 cl, PET bottle)',
  'Viju - V-Cool cola - fruit drink - 50 cl.jpg': 'Viju V-Cool cola / fruit drink (50 cl, Bottle)',
};

let count = 0;

for (const file of files) {
  const targetName = EXACT_MATCHES[file];
  if (!targetName) {
    console.warn('No exact mapping configured for:', file);
    continue;
  }

  const item = catalog.find(p => p.name === targetName);
  if (!item) {
    console.warn('Item not found in catalog:', targetName);
    continue;
  }

  const ext = path.extname(file).toLowerCase();
  const cleanFileName = `${slugify(item.name)}${ext}`;
  const targetPublic = path.join(publicProductsDir, cleanFileName);
  const targetMobile = path.join(mobileProductsDir, cleanFileName);
  const srcPath = path.join(images3Dir, file);

  fs.copyFileSync(srcPath, targetPublic);
  fs.copyFileSync(srcPath, targetMobile);

  const webUrl = `/products/${cleanFileName}`;
  item.imageUrl = webUrl;
  count++;
  console.log(`[✔ LINKED ${count}/27] ${file} -> ${item.name} (${webUrl})`);
}

const updatedContent = `/**
 * Master Catalog (Pharmacy, Skincare, Baby Care, Groceries, Beverages & Household)
 * Total Items: ${catalog.length}
 */

export const NIGERIAN_GROCERIES_CATALOG = ${JSON.stringify(catalog, null, 2)};
`;

fs.writeFileSync(srcCatalogPath, updatedContent, 'utf8');
fs.writeFileSync(mobileCatalogPath, updatedContent, 'utf8');
console.log(`\n🎉 Successfully linked all ${count} images3 items to the catalog!`);
