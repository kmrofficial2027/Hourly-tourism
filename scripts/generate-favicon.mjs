// Script to generate favicon.ico and PNG icons from the logo
// Run: node scripts/generate-favicon.mjs

import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const logoPath = join(root, 'public', 'images', 'logo-full.jpg');

async function generateFavicons() {
  console.log('Loading logo...');
  const img = await loadImage(logoPath);

  const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // White circular background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw logo centered (crop to square, focus on center)
    const srcSize = Math.min(img.width, img.height);
    const srcX = (img.width - srcSize) / 2;
    const srcY = (img.height - srcSize) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);
    ctx.restore();

    const pngBuffer = canvas.toBuffer('image/png');

    if (size === 32) {
      writeFileSync(join(root, 'src', 'app', 'favicon.png'), pngBuffer);
      console.log(`✓ favicon.png (${size}x${size})`);
    }
    if (size === 180) {
      writeFileSync(join(root, 'src', 'app', 'apple-icon.png'), pngBuffer);
      console.log(`✓ apple-icon.png (${size}x${size})`);
    }
    if (size === 192 || size === 512) {
      mkdirSync(join(root, 'public'), { recursive: true });
      writeFileSync(join(root, 'public', `icon-${size}.png`), pngBuffer);
      console.log(`✓ icon-${size}.png`);
    }
  }
  console.log('All favicons generated!');
}

generateFavicons().catch(console.error);

