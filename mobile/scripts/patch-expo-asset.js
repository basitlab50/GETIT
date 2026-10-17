const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'expo-asset', 'build', 'ExpoAsset.js');
if (fs.existsSync(target)) {
  const content = fs.readFileSync(target, 'utf8');
  if (content.includes("requireNativeModule('ExpoAsset')")) {
    const patched = `import { requireOptionalNativeModule } from 'expo-modules-core';
const AssetModule = (() => {
  try {
    return requireOptionalNativeModule('ExpoAsset');
  } catch (e) {
    return null;
  }
})();

export async function downloadAsync(url, md5Hash, type) {
  if (AssetModule && typeof AssetModule.downloadAsync === 'function') {
    return AssetModule.downloadAsync(url, md5Hash, type);
  }
  return url;
}
`;
    fs.writeFileSync(target, patched, 'utf8');
    console.log('✅ Successfully patched expo-asset to prevent ExpoAsset crash in Expo Go.');
  }
}
