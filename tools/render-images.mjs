// Redraws the share image and the icons with headless Chrome (puppeteer-core from ../vibe/pdf-text-remover).
//   node tools/render-images.mjs
// tools/og.html     -> assets/og.png (1200x630 share image)
// assets/favicon.svg -> apple-touch-icon.png (180px, iOS) and favicon.ico (32px, PNG inside an ICO)
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
if (!(await page.evaluate(() => document.fonts.check('112px Inter')))) throw new Error('Inter did not load; og.png would use a fallback font');
await page.screenshot({ path: file('assets/og.png') });

// iOS rounds the corners itself, so the icon sits on a full square of the favicon's background colour.
const icon = (size, bg) => page.setContent(`<body style="margin:0;background:${bg}"><img src="${new URL('assets/favicon.svg', root).href}" width="${size}" height="${size}" style="display:block"></body>`, { waitUntil: 'load' });
await page.setViewport({ width: 180, height: 180 });
await icon(180, '#0C0E0D');
await page.screenshot({ path: file('apple-touch-icon.png') });

await page.setViewport({ width: 32, height: 32 });
await icon(32, 'transparent');
const png = await page.screenshot({ omitBackground: true });
// ICO header (6 bytes) + one directory entry (16 bytes) pointing at the PNG that follows.
const head = Buffer.alloc(22);
head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head[6] = 32; head[7] = 32; head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
writeFileSync(file('favicon.ico'), Buffer.concat([head, png]));

await browser.close();
console.log('wrote assets/og.png, apple-touch-icon.png, favicon.ico');
