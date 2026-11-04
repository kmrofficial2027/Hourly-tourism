// Favicon generator for Hourly Tourism
// Image 1 (logo.jpg) = full logo with text -> used as logo on website
// Image 2 (favicon-source.jpg) = icon only (no text) -> used as favicon
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const faviconSrc = path.join(root, 'public', 'images', 'favicon-source.jpg'); // Icon only image
const logoSrc    = path.join(root, 'public', 'images', 'logo.jpg');           // Full logo with text
const publicDir  = path.join(root, 'public');

async function generate() {
  console.log('🎨 Generating favicons from favicon icon image...');

  // ── FAVICON FILES (from icon-only image) ──

  // favicon.ico (multi-size: 16, 32, 48)
  const sizes = [16, 32, 48];
  const pngBuffers = [];
  for (const size of sizes) {
    const buf = await sharp(faviconSrc)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    pngBuffers.push({ size, buf });
    console.log(`  Resized ${size}x${size} (${buf.length} bytes)`);
  }

  // Build ICO file header + directory + data
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // Reserved
  header.writeUInt16LE(1, 2);     // Type: 1 = ICO
  header.writeUInt16LE(count, 4); // Image count

  const directory = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  for (let i = 0; i < count; i++) {
    const { size, buf } = pngBuffers[i];
    const e = directory.slice(i * 16);
    e.writeUInt8(size === 256 ? 0 : size, 0); // Width
    e.writeUInt8(size === 256 ? 0 : size, 1); // Height
    e.writeUInt8(0, 2);                        // Colors
    e.writeUInt8(0, 3);                        // Reserved
    e.writeUInt16LE(1, 4);                     // Planes
    e.writeUInt16LE(32, 6);                    // Bit depth
    e.writeUInt32LE(buf.length, 8);            // Data size
    e.writeUInt32LE(offset, 12);               // Data offset
    offset += buf.length;
  }

  const icoBuffer = Buffer.concat([header, directory, ...pngBuffers.map(p => p.buf)]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log(`✅ public/favicon.ico (${icoBuffer.length} bytes)`);

  // favicon.png 32x32
  await sharp(faviconSrc)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✅ public/favicon.png (32x32)');

  // apple-icon.png 180x180
  await sharp(faviconSrc)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-icon.png'));
  console.log('✅ public/apple-icon.png (180x180)');

  // icon-192.png 192x192
  await sharp(faviconSrc)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✅ public/icon-192.png (192x192)');

  // icon-512.png 512x512
  await sharp(faviconSrc)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✅ public/icon-512.png (512x512)');

  // ── LOGO PNG (from full logo with text image) ──
  await sharp(logoSrc)
    .resize(800, null, { fit: 'inside' })
    .png()
    .toFile(path.join(publicDir, 'images', 'logo.png'));
  console.log('✅ public/images/logo.png (logo with text, 800px wide)');

  // og-image (social share) - logo on green background
  await sharp(logoSrc)
    .resize(900, 500, { fit: 'contain', background: { r: 22, g: 163, b: 74, alpha: 1 } })
    .extend({ top: 65, bottom: 65, left: 150, right: 150, background: { r: 22, g: 163, b: 74, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✅ public/og-image.png (1200x630 social share)');

  console.log('\n🎉 All files generated successfully!');
}

generate().catch(err => { console.error('❌', err.message); process.exit(1); });
