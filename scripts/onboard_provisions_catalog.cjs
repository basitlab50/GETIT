/**
 * Complete Onboarding Script: Groceries and Food Provisions (843 items)
 */

const fs = require('fs');
const path = require('path');

const csvPath = 'C:\\Users\\HP\\Downloads\\New folder\\GETIT_Groceries_and_Food_Provisions_Product_Images\\GETIT_Groceries_and_Food_Provisions_Catalogue.csv';
const imagesDir = 'C:\\Users\\HP\\Downloads\\New folder\\GETIT_Groceries_and_Food_Provisions_Product_Images\\images';

const srcCatalogPath = path.join(__dirname, '..', 'src', 'data', 'nigerianGroceriesCatalog.js');
const mobileCatalogPath = path.join(__dirname, '..', 'mobile', 'data', 'nigerianGroceriesCatalog.js');
const publicProductsDir = path.join(__dirname, '..', 'public', 'products');
const mobileProductsDir = path.join(__dirname, '..', 'mobile', 'assets', 'products');

if (!fs.existsSync(publicProductsDir)) fs.mkdirSync(publicProductsDir, { recursive: true });
if (!fs.existsSync(mobileProductsDir)) fs.mkdirSync(mobileProductsDir, { recursive: true });

// Load existing catalog
const rawCatalog = fs.readFileSync(srcCatalogPath, 'utf8');
const match = rawCatalog.match(/export const NIGERIAN_GROCERIES_CATALOG = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Failed to parse catalog');
  process.exit(1);
}
const existingCatalog = JSON.parse(match[1]);
const existingIds = new Set(existingCatalog.map(item => item.id));

const availableImages = new Set(fs.readdirSync(imagesDir));

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CATEGORY_MAP = {
  'Breakfast cereals and custard': { icon: '🥣', category: 'Pantry', subcategory: 'Cereals & Custard' },
  'Milk powders and creamers': { icon: '🥛', category: 'Pantry', subcategory: 'Milk & Creamers' },
  'Sugar and sweeteners': { icon: '🍬', category: 'Pantry', subcategory: 'Sugar & Sweeteners' },
  'Snacks and confectionery': { icon: '🍿', category: 'Snacks', subcategory: 'Snacks & Confectionery' },
  'Sauces and condiments': { icon: '🥫', category: 'Pantry', subcategory: 'Sauces & Condiments' },
  'Cooking oils': { icon: '🫒', category: 'Pantry', subcategory: 'Cooking Oils' },
  'Pasta and noodles': { icon: '🍝', category: 'Pantry', subcategory: 'Pasta & Noodles' },
  'Seasonings and spices': { icon: '🧂', category: 'Pantry', subcategory: 'Seasonings & Spices' },
  'Rice and grains': { icon: '🍚', category: 'Pantry', subcategory: 'Rice & Grains' },
  'Canned foods': { icon: '🥫', category: 'Pantry', subcategory: 'Canned Foods' },
  'Swallow and meal flours': { icon: '🌾', category: 'Pantry', subcategory: 'Swallow & Flours' },
  'Baking ingredients and mixes': { icon: '🧁', category: 'Pantry', subcategory: 'Baking Ingredients' },
  'Spreads and preserves': { icon: '🍯', category: 'Pantry', subcategory: 'Spreads & Preserves' },
  'Biscuits and crackers': { icon: '🍪', category: 'Biscuits', subcategory: 'Biscuits & Crackers' },
  'Beans and dried cooking ingredients': { icon: '🫘', category: 'Pantry', subcategory: 'Beans & Ingredients' }
};

const fileLines = fs.readFileSync(csvPath, 'utf8').split('\n');
const header = parseCSVLine(fileLines[0]);

const newProducts = [];
let imagesCopied = 0;

for (let i = 1; i < fileLines.length; i++) {
  const line = fileLines[i].trim();
  if (!line) continue;

  const row = parseCSVLine(line);
  const sku = row[0]?.trim();
  const rawSubcat = row[2]?.trim() || 'General Provisions';
  const brand = row[3]?.trim() || '';
  const name = row[4]?.trim();
  const size = row[5]?.trim() || '';
  const priceTag = parseFloat(row[7]) || 1500;
  const imgFile = row[12]?.trim();

  if (!sku || !name) continue;

  // Don't re-add if already in catalog
  if (existingIds.has(sku)) continue;

  const mapping = CATEGORY_MAP[rawSubcat] || { icon: '🛍️', category: 'Pantry', subcategory: rawSubcat };

  let imageUrl = null;
  if (imgFile && availableImages.has(imgFile)) {
    const ext = path.extname(imgFile).toLowerCase();
    const cleanFileName = `${slugify(name)}-${sku.toLowerCase().replace(/[^a-z0-9]/g, '')}${ext}`;
    const srcPath = path.join(imagesDir, imgFile);
    const destPublic = path.join(publicProductsDir, cleanFileName);
    const destMobile = path.join(mobileProductsDir, cleanFileName);

    if (!fs.existsSync(destPublic)) {
      fs.copyFileSync(srcPath, destPublic);
    }
    if (!fs.existsSync(destMobile)) {
      fs.copyFileSync(srcPath, destMobile);
    }

    imageUrl = `/products/${cleanFileName}`;
    imagesCopied++;
  }

  // Price range estimate
  const minPrice = Math.round(priceTag * 0.9);
  const maxPrice = Math.round(priceTag * 1.15);
  const priceRange = `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`;

  newProducts.push({
    id: sku,
    name: name,
    category: mapping.category,
    subcategory: mapping.subcategory,
    brand: brand || null,
    icon: mapping.icon,
    suggestedPrice: Math.round(priceTag),
    priceRange: priceRange,
    description: `${name}${size ? ` (${size})` : ''}. Authentic provisions from Nigerian store retailers.`,
    imageUrl: imageUrl
  });
}

console.log(`Processed ${newProducts.length} new provision products from CSV.`);
console.log(`Copied ${imagesCopied} product photos.`);

// Merge into catalog
const combinedCatalog = [...existingCatalog, ...newProducts];

const updatedContent = `/**
 * Master Catalog (Pharmacy, Skincare, Baby Care, Groceries, Beverages, Food Provisions & Household)
 * Total Items: ${combinedCatalog.length}
 */

export const NIGERIAN_GROCERIES_CATALOG = ${JSON.stringify(combinedCatalog, null, 2)};
`;

fs.writeFileSync(srcCatalogPath, updatedContent, 'utf8');
fs.writeFileSync(mobileCatalogPath, updatedContent, 'utf8');
console.log(`✔ Master Catalog updated! Total products now: ${combinedCatalog.length}`);
