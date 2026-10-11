const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'mobile', 'assets', 'products');
const files = fs.readdirSync(dir).filter(f => !f.includes(' ') && f.match(/\.(png|jpg|webp)$/i));

console.log('Clean slug files count:', files.length);

const entries = files.map(f => {
  const key = `/products/${f}`;
  return `  ${JSON.stringify(key)}: require('./products/${f}'),`;
});

const code = `// Auto-generated Product Images Map for React Native / Expo
export const PRODUCT_IMAGES = {
${entries.join('\n')}
};

export function getProductImageSource(imageUrl) {
  if (!imageUrl) return null;
  if (PRODUCT_IMAGES[imageUrl]) return PRODUCT_IMAGES[imageUrl];
  if (typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('file:') || imageUrl.startsWith('data:'))) {
    return { uri: imageUrl };
  }
  return null;
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'mobile', 'assets', 'productImages.js'), code, 'utf8');
console.log(`✔ Generated mobile/assets/productImages.js with ${files.length} clean image requires!`);
