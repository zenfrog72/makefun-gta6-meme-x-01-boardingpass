// Entry program for the "Leonida Air" boarding-pass meme
// (make.fun bounty gta6-meme-x-01, slot 3).
//
// The entry itself lives on X: the post carries the meme picture and
// POST.json names the post. This program is the hand-in step — it
// proves the two payload files are whole and well-formed, then copies
// them, untouched, into the output directory for the grader.
//
//   POST.json — a small JSON object naming the post. It must parse,
//     stay within the hand-in size cap, and carry a "url" string that
//     itself stays within the cap for an address.
//   meme.png  — the picture the post carries. It is checked as a PNG
//     from the outside in: signature first, then a walk over every
//     chunk verifying each CRC-32, ending exactly at IEND.
//
// Node standard library only.

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const POST_JSON_MAX_BYTES = 16_384;
const POST_URL_MAX_CHARS = 2_048;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

// --- CRC-32 (the PNG flavour: reflected, polynomial 0xEDB88320) ---

const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table.push(c >>> 0);
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// --- POST.json ---

function checkPostJson(path: string): string {
  let raw: Buffer;
  try {
    raw = readFileSync(path);
  } catch {
    fail(`POST.json is missing or unreadable at ${path}`);
  }
  if (raw.length > POST_JSON_MAX_BYTES) {
    fail(`POST.json is ${raw.length} bytes; the cap is ${POST_JSON_MAX_BYTES}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.toString('utf8'));
  } catch (err) {
    fail(`POST.json does not parse as JSON: ${(err as Error).message}`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    fail('POST.json must be a JSON object');
  }
  const url = (parsed as Record<string, unknown>)['url'];
  if (typeof url !== 'string' || url.length === 0) {
    fail('POST.json must carry a non-empty "url" string');
  }
  if (url.length > POST_URL_MAX_CHARS) {
    fail(`POST.json "url" is ${url.length} characters; the cap is ${POST_URL_MAX_CHARS}`);
  }
  return url;
}

// --- meme.png ---

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function checkPng(path: string): { width: number; height: number; chunks: number } {
  let data: Buffer;
  try {
    data = readFileSync(path);
  } catch {
    fail(`meme.png is missing or unreadable at ${path}`);
  }
  if (data.length < PNG_SIGNATURE.length || !data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    fail('meme.png does not start with the PNG signature');
  }

  let offset = PNG_SIGNATURE.length;
  let width = 0;
  let height = 0;
  let chunks = 0;
  let sawIend = false;

  while (offset < data.length) {
    if (offset + 8 > data.length) {
      fail(`meme.png is truncated inside a chunk header at byte ${offset}`);
    }
    const length = data.readUInt32BE(offset);
    const type = data.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const crcEnd = dataEnd + 4;
    if (crcEnd > data.length) {
      fail(`meme.png is truncated inside chunk ${type} at byte ${offset}`);
    }
    const storedCrc = data.readUInt32BE(dataEnd);
    const computedCrc = crc32(data.subarray(offset + 4, dataEnd));
    if (storedCrc !== computedCrc) {
      fail(`meme.png chunk ${type} at byte ${offset} fails its CRC-32 check`);
    }
    chunks++;

    if (chunks === 1) {
      if (type !== 'IHDR' || length !== 13) {
        fail(`meme.png must open with a 13-byte IHDR chunk, found ${type} (${length} bytes)`);
      }
      width = data.readUInt32BE(dataStart);
      height = data.readUInt32BE(dataStart + 4);
      if (width === 0 || height === 0) {
        fail('meme.png IHDR reports a zero-sized canvas');
      }
    }
    if (type === 'IEND') {
      sawIend = true;
      offset = crcEnd;
      break;
    }
    offset = crcEnd;
  }

  if (!sawIend) {
    fail('meme.png never reaches an IEND chunk');
  }
  if (offset !== data.length) {
    fail(`meme.png has ${data.length - offset} trailing byte(s) after IEND`);
  }
  return { width, height, chunks };
}

// --- hand-in ---

const postPath = join(HERE, 'POST.json');
const memePath = join(HERE, 'meme.png');

const url = checkPostJson(postPath);
const png = checkPng(memePath);

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
copyFileSync(memePath, join(OUTPUT_DIR, 'meme.png'));

console.log(`POST.json: ok — names the post at ${url} (${statSync(postPath).size} bytes)`);
console.log(
  `meme.png: ok — ${png.width}x${png.height}, ${png.chunks} chunks, every CRC-32 verified (${statSync(memePath).size} bytes)`,
);
console.log(`copied POST.json and meme.png to ${OUTPUT_DIR}`);
