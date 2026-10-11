const fs = require('fs');
const readline = require('readline');
const path = require('path');

const csvPath = 'C:\\Users\\HP\\Downloads\\New folder\\GETIT_Groceries_and_Food_Provisions_Product_Images\\GETIT_Groceries_and_Food_Provisions_Catalogue.csv';
const imagesDir = 'C:\\Users\\HP\\Downloads\\New folder\\GETIT_Groceries_and_Food_Provisions_Product_Images\\images';

const imageFiles = new Set(fs.readdirSync(imagesDir));

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

const rl = readline.createInterface({
  input: fs.createReadStream(csvPath),
  crlfDelay: Infinity
});

let header = null;
const subcats = {};
let total = 0;
let withImageSpecified = 0;
let fileActuallyExists = 0;
let withoutImage = 0;
const sampleProducts = [];

rl.on('line', (line) => {
  if (!header) {
    header = parseCSVLine(line);
    return;
  }
  if (!line.trim()) return;
  total++;
  const row = parseCSVLine(line);
  const sku = row[0];
  const subcat = row[2] || 'Uncategorized';
  const brand = row[3];
  const name = row[4];
  const size = row[5];
  const price = row[7];
  const imgFile = row[12];

  subcats[subcat] = (subcats[subcat] || 0) + 1;

  if (imgFile && imgFile.trim()) {
    withImageSpecified++;
    if (imageFiles.has(imgFile.trim())) {
      fileActuallyExists++;
    }
  } else {
    withoutImage++;
  }

  if (total <= 6) {
    sampleProducts.push({ sku, subcat, brand, name, size, price, imgFile, exists: imageFiles.has((imgFile || '').trim()) });
  }
});

rl.on('close', () => {
  console.log('SUMMARY:');
  console.log('- Total Catalog Products:', total);
  console.log('- Products with Image specified:', withImageSpecified);
  console.log('- Images actually found on disk:', fileActuallyExists);
  console.log('- Total Unique Images in folder:', imageFiles.size);
  console.log('- Products without Image (will use default category icons):', withoutImage);
  console.log('\nSUBCATEGORIES:');
  for (const [k, v] of Object.entries(subcats)) {
    console.log(`  * ${k}: ${v} items`);
  }
  console.log('\nSAMPLE ITEMS:', JSON.stringify(sampleProducts, null, 2));
});
