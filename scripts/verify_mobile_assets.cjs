const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'mobile', 'assets', 'productImages.js'), 'utf8');
const regex = /require\(['"](\.\/products\/[^'"]+)['"]\)/g;
let match;
let missing = [];
let found = 0;

while ((match = regex.exec(content)) !== null) {
  const reqPath = match[1];
  const fullPath = path.join(__dirname, '..', 'mobile', 'assets', reqPath);
  if (!fs.existsSync(fullPath)) {
    missing.push(reqPath);
  } else {
    found++;
  }
}

console.log('Total verified found:', found);
console.log('Missing count:', missing.length);
if (missing.length > 0) {
  console.log('Missing list:', missing);
}
