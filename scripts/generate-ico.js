// Generate a proper favicon.ico from the logo
// ICO format: contains 16x16, 32x32, and 48x48 PNG frames
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const logoPath = path.join(root, 'public', 'images', 'logo-full.jpg');

// ICO file format:
// - 6 byte header
// - N * 16 byte directory entries  
// - N PNG/BMP blobs

async function generateIco() {
  const sizes = [16, 32, 48];
  const pngBuffers = [];

  for (const size of sizes) {
    const buf = await sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    pngBuffers.push({ size, buf });
    console.log(`  Processed ${size}x${size} (${buf.length} bytes)`);
  }

  // Build ICO file
  const headerSize = 6;
  const directorySize = 16 * sizes.length;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);  // Reserved
  header.writeUInt16LE(1, 2);  // Type: 1 = ICO
  header.writeUInt16LE(sizes.length, 4);  // Count

  const directory = Buffer.alloc(directorySize);
  let offset = headerSize + directorySize;

  for (let i = 0; i < pngBuffers.length; i++) {
    const { size, buf } = pngBuffers[i];
    const entry = directory.slice(i * 16, (i + 1) * 16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);  // Width
    entry.writeUInt8(size === 256 ? 0 : size, 1);  // Height
    entry.writeUInt8(0, 2);  // Color count (0 = no palette)
    entry.writeUInt8(0, 3);  // Reserved
    entry.writeUInt16LE(1, 4);  // Planes
    entry.writeUInt16LE(32, 6);  // Bit count
    entry.writeUInt32LE(buf.length, 8);  // Size of image data
    entry.writeUInt32LE(offset, 12);  // Offset of image data
    offset += buf.length;
  }

  const icoBuffer = Buffer.concat([header, directory, ...pngBuffers.map(p => p.buf)]);
  
  // Write to both locations
  fs.writeFileSync(path.join(root, 'src', 'app', 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), icoBuffer);
  
  console.log(`✅ favicon.ico (${icoBuffer.length} bytes, contains 16x16, 32x32, 48x48)`);
}

console.log('🎨 Generating favicon.ico...');
generateIco()
  .then(() => console.log('🎉 favicon.ico created!'))
  .catch(err => { console.error('❌', err.message); process.exit(1); });

