const sharp = require('sharp');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

async function optimizeImages() {
  console.log('🖼️  Optimizing images...\n');

  // 1. Background image - Desktop WebP (1920px, quality 75)
  console.log('📸 Optimizing nz-background.jpg...');
  await sharp(path.join(publicDir, 'nz-background.jpg'))
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(path.join(publicDir, 'nz-background.webp'));

  const bgStats = await sharp(path.join(publicDir, 'nz-background.webp')).metadata();
  console.log(`   ✅ nz-background.webp created (${bgStats.width}x${bgStats.height})`);

  // 2. Background image - Mobile WebP (800px, quality 70)
  await sharp(path.join(publicDir, 'nz-background.jpg'))
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(path.join(publicDir, 'nz-background-mobile.webp'));

  console.log('   ✅ nz-background-mobile.webp created (800px)');

  // 3. Logo - Small for header (48x48)
  console.log('\n📸 Optimizing kiwi-van-logo.png...');
  await sharp(path.join(publicDir, 'kiwi-van-logo.png'))
    .resize(48, 48)
    .webp({ quality: 85 })
    .toFile(path.join(publicDir, 'kiwi-van-logo-48.webp'));

  console.log('   ✅ kiwi-van-logo-48.webp created (48x48)');

  // 4. Logo - Medium for footer (96x96)
  await sharp(path.join(publicDir, 'kiwi-van-logo.png'))
    .resize(96, 96)
    .webp({ quality: 85 })
    .toFile(path.join(publicDir, 'kiwi-van-logo-96.webp'));

  console.log('   ✅ kiwi-van-logo-96.webp created (96x96)');

  // 5. Logo - Retina for loader (128x128)
  await sharp(path.join(publicDir, 'kiwi-van-logo.png'))
    .resize(128, 128)
    .webp({ quality: 85 })
    .toFile(path.join(publicDir, 'kiwi-van-logo-128.webp'));

  console.log('   ✅ kiwi-van-logo-128.webp created (128x128)');

  // Print file sizes
  console.log('\n📊 File size comparison:');
  const fs = require('fs');

  const originalBg = fs.statSync(path.join(publicDir, 'nz-background.jpg')).size;
  const optimizedBg = fs.statSync(path.join(publicDir, 'nz-background.webp')).size;
  const mobileBg = fs.statSync(path.join(publicDir, 'nz-background-mobile.webp')).size;

  console.log(`   nz-background.jpg:        ${(originalBg / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   nz-background.webp:       ${(optimizedBg / 1024).toFixed(0)} KB (${Math.round((1 - optimizedBg/originalBg) * 100)}% smaller)`);
  console.log(`   nz-background-mobile.webp: ${(mobileBg / 1024).toFixed(0)} KB`);

  const originalLogo = fs.statSync(path.join(publicDir, 'kiwi-van-logo.png')).size;
  const logo48 = fs.statSync(path.join(publicDir, 'kiwi-van-logo-48.webp')).size;
  const logo96 = fs.statSync(path.join(publicDir, 'kiwi-van-logo-96.webp')).size;

  console.log(`\n   kiwi-van-logo.png:        ${(originalLogo / 1024).toFixed(0)} KB`);
  console.log(`   kiwi-van-logo-48.webp:    ${(logo48 / 1024).toFixed(1)} KB`);
  console.log(`   kiwi-van-logo-96.webp:    ${(logo96 / 1024).toFixed(1)} KB`);

  console.log('\n✅ Done! Images optimized successfully.');
}

optimizeImages().catch(console.error);
