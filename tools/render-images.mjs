// Redraws the share image and the icons with headless Chrome (puppeteer-core from ../vibe/pdf-text-remover).
//   node tools/render-images.mjs
// tools/og.html     -> assets/og.png (1200x630 share image)
// assets/favicon.svg -> apple-touch-icon.png (180px, iOS), favicon-96x96.png and favicon.ico (16/32/48px PNGs in an ICO).
// Google only shows favicons sized in multiples of 48px (or SVG), hence the 48 and 96.
import { writeFileSync } from 'node:fs';
const { default: puppeteer } = await import(new URL('../../vibe/pdf-text-remover/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js', import.meta.url));

const root = new URL('../', import.meta.url);
const file = (p) => new URL(p, root).pathname;
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--allow-file-access-from-files'], // lets og.html load the font from assets/ over file://
});
const page = await browser.newPage();

await page.setViewport({ width: 1200, height: 630 });
await page.goto(new URL('tools/og.html', root).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
if (!(await page.evaluate(() => document.fonts.check('112px "IBM Plex Sans"')))) throw new Error('IBM Plex Sans did not load; og.png would use a fallback font');
await page.screenshot({ path: file('assets/og.png') });

// iOS rounds the corners itself, so the icon sits on a full square of the favicon's background colour.
const icon = (size, bg) => page.setContent(`<body style="margin:0;background:${bg}"><img src="${new URL('assets/favicon.svg', root).href}" width="${size}" height="${size}" style="display:block"></body>`, { waitUntil: 'load' });
await page.setViewport({ width: 180, height: 180 });
await icon(180, '#0C0E0D');
await page.screenshot({ path: file('apple-touch-icon.png') });

const png = async (size) => {
  await page.setViewport({ width: size, height: size });
  await icon(size, 'transparent');
  return page.screenshot({ omitBackground: true });
};
writeFileSync(file('favicon-96x96.png'), await png(96));
// ICO: 6-byte header, one 16-byte directory entry per image, then the PNGs themselves.
const sizes = [16, 32, 48];
const images = [];
for (const size of sizes) images.push(await png(size));
const head = Buffer.alloc(6 + 16 * sizes.length);
head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let offset = head.length;
sizes.forEach((size, i) => {
  const e = 6 + 16 * i;
  head[e] = size; head[e + 1] = size; head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(images[i].length, e + 8); head.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
writeFileSync(file('favicon.ico'), Buffer.concat([head, ...images]));

await browser.close();
console.log('wrote assets/og.png, apple-touch-icon.png, favicon-96x96.png, favicon.ico');
