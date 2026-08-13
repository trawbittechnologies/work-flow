const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to create a valid PNG file buffer from raw RGBA pixels
function createPNGBuffer(width, height, getPixelRGBA) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // Color type 6 (RGBA)
  ihdr.writeUInt8(0, 10); // Compression 0
  ihdr.writeUInt8(0, 11); // Filter 0
  ihdr.writeUInt8(0, 12); // Interlace 0

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk (raw image data)
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Simple CRC32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate FlowDesk Icon (#BFD437 background + white geometric logo mark)
const publicDir = path.join(__dirname, '..', 'public');

function drawFlowdeskIcon(x, y, width, height) {
  const normX = x / width;
  const normY = y / height;

  // Background: #BFD437 (R: 191, G: 212, B: 55) with rounded corners
  const radius = 0.2;
  const isCorner = 
    (normX < radius && normY < radius && Math.hypot(normX - radius, normY - radius) > radius) ||
    (normX > 1 - radius && normY < radius && Math.hypot(normX - (1 - radius), normY - radius) > radius) ||
    (normX < radius && normY > 1 - radius && Math.hypot(normX - radius, normY - (1 - radius)) > radius) ||
    (normX > 1 - radius && normY > 1 - radius && Math.hypot(normX - (1 - radius), normY - (1 - radius)) > radius);

  if (isCorner) return [0, 0, 0, 0]; // Transparent outside rounded corner

  // Check if inside white geometric mark squares (2x2 grid)
  const isSquare1 = normX >= 0.22 && normX <= 0.46 && normY >= 0.22 && normY <= 0.46;
  const isSquare2 = normX >= 0.54 && normX <= 0.78 && normY >= 0.22 && normY <= 0.46;
  const isSquare3 = normX >= 0.22 && normX <= 0.46 && normY >= 0.54 && normY <= 0.78;
  const isSquare4 = normX >= 0.54 && normX <= 0.78 && normY >= 0.54 && normY <= 0.78;

  if (isSquare1 || isSquare4) {
    return [255, 255, 255, 255]; // Solid White
  } else if (isSquare2 || isSquare3) {
    return [255, 255, 255, 216]; // Semi-transparent White
  }

  // Base FlowDesk Accent #BFD437
  return [191, 212, 55, 255];
}

// Generate monochrome status bar badge (White symbol on transparent)
function drawMonochromeBadge(x, y, width, height) {
  const normX = x / width;
  const normY = y / height;

  const isSquare1 = normX >= 0.2 && normX <= 0.45 && normY >= 0.2 && normY <= 0.45;
  const isSquare2 = normX >= 0.55 && normX <= 0.8 && normY >= 0.2 && normY <= 0.45;
  const isSquare3 = normX >= 0.2 && normX <= 0.45 && normY >= 0.55 && normY <= 0.8;
  const isSquare4 = normX >= 0.55 && normX <= 0.8 && normY >= 0.55 && normY <= 0.8;

  if (isSquare1 || isSquare2 || isSquare3 || isSquare4) {
    return [255, 255, 255, 255];
  }
  return [0, 0, 0, 0];
}

// Generate icon-192.png (192x192)
const icon192 = createPNGBuffer(192, 192, drawFlowdeskIcon);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
console.log('Created public/icon-192.png');

// Generate icon-512.png (512x512)
const icon512 = createPNGBuffer(512, 512, drawFlowdeskIcon);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
console.log('Created public/icon-512.png');

// Generate badge-72.png (72x72)
const badge72 = createPNGBuffer(72, 72, drawMonochromeBadge);
fs.writeFileSync(path.join(publicDir, 'badge-72.png'), badge72);
console.log('Created public/badge-72.png');

// Generate flowdesk-icon.png (192x192)
fs.writeFileSync(path.join(publicDir, 'flowdesk-icon.png'), icon192);
console.log('Created public/flowdesk-icon.png');
