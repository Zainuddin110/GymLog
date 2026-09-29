import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height) {
  // Simple uncompressed/filtered PNG generation
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // Dark blue-black gym background (#090d16) with blue barbell accent
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < width * 0.35 && dist > width * 0.30) {
        // Blue ring
        rawData[pixelOffset] = 59;     // R
        rawData[pixelOffset + 1] = 130; // G
        rawData[pixelOffset + 2] = 246; // B
        rawData[pixelOffset + 3] = 255; // A
      } else if (Math.abs(dy) < width * 0.04 && Math.abs(dx) < width * 0.28) {
        // Horizontal bar
        rawData[pixelOffset] = 96;
        rawData[pixelOffset + 1] = 165;
        rawData[pixelOffset + 2] = 250;
        rawData[pixelOffset + 3] = 255;
      } else if (Math.abs(dx - width * 0.2) < width * 0.03 && Math.abs(dy) < width * 0.15) {
        // Right weight plate
        rawData[pixelOffset] = 37;
        rawData[pixelOffset + 1] = 99;
        rawData[pixelOffset + 2] = 235;
        rawData[pixelOffset + 3] = 255;
      } else if (Math.abs(dx + width * 0.2) < width * 0.03 && Math.abs(dy) < width * 0.15) {
        // Left weight plate
        rawData[pixelOffset] = 37;
        rawData[pixelOffset + 1] = 99;
        rawData[pixelOffset + 2] = 235;
        rawData[pixelOffset + 3] = 255;
      } else {
        // Background #090d16
        rawData[pixelOffset] = 9;
        rawData[pixelOffset + 1] = 13;
        rawData[pixelOffset + 2] = 22;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

// Standard CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

const iconsDir = path.resolve('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPNG(180, 180));
console.log('Icons generated successfully in public/icons/');

