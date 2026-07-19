const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgBuffer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="12" fill="url(#bg)"/>
  <text x="32" y="44" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">い</text>
</svg>`);

const publicDir = path.join(__dirname, '../public');

async function generateFavicons() {
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name));
    console.log(`Generated: ${name}`);
  }

  // Generate favicon.ico (multi-size)
  const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  
  // Simple ICO file format (header + directory entries + PNG data)
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // Type: ICO
  icoHeader.writeUInt16LE(3, 4); // Number of images

  const createDirEntry = (size, offset, dataSize) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // Width
    entry.writeUInt8(size === 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(dataSize, 8); // Data size
    entry.writeUInt32LE(offset, 12); // Data offset
    return entry;
  };

  const dataOffset = 6 + (3 * 16); // Header + 3 directory entries
  const entry1 = createDirEntry(16, dataOffset, ico16.length);
  const entry2 = createDirEntry(32, dataOffset + ico16.length, ico32.length);
  const entry3 = createDirEntry(48, dataOffset + ico16.length + ico32.length, ico48.length);

  const icoFile = Buffer.concat([icoHeader, entry1, entry2, entry3, ico16, ico32, ico48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoFile);
  console.log('Generated: favicon.ico');
}

generateFavicons().catch(console.error);