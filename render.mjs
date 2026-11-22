// Render the two new meme concepts (HTML -> 1600x1600 PNG) with puppeteer.
import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const jobs = [
  ['concept1.html', 'concept1_boardingpass.png'],
  ['concept2.html', 'concept2_birth.png'],
];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
});
for (const [html, png] of jobs) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1600, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(dir, html), { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(dir, png) });
  console.log('wrote', png);
  await page.close();
}
await browser.close();
