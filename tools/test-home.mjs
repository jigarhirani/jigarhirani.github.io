// End-to-end checks for the home page: the QR's contact card, the three easter eggs (one at a time), layout.
// Start a server first (python3 -m http.server 8765), then: node tools/test-home.mjs [base-url]
// Uses headless Chrome via puppeteer-core from ../vibe/pdf-text-remover, like render-images.mjs.
const { default: p } = await import(new URL('../../vibe/pdf-text-remover/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js', import.meta.url));
const BASE = process.argv[2] || 'http://localhost:8765';
// The QR on the badge must decode to exactly this contact card (vCard 3.0, CRLF line endings).
const vcard = "BEGIN:VCARD\r\nVERSION:3.0\r\nN:Hirani;Jigar;;;\r\nFN:Jigar Hirani\r\nTITLE:Splunk / Cribl / SIEM Engineer\r\nEMAIL;TYPE=INTERNET:hirani.jigar117@gmail.com\r\nURL:https://jigarhirani.tech\r\nEND:VCARD\r\n";
const b = await p.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const pg = await b.newPage();
const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? 'pass' : 'FAIL') + ': ' + m); };
const go = async (w, dpr = 2, mobile = false) => { await pg.setViewport({ width: w, height: 900, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile }); await pg.goto(BASE + '/?t=' + Date.now(), { waitUntil: 'networkidle0' }); };
const decode = async () => { const s = await (await pg.$('.qr svg')).screenshot({ encoding: 'base64' }); return pg.evaluate(async (x) => { const i = new Image(); i.src = 'data:image/png;base64,' + x; await i.decode(); return (await new BarcodeDetector({ formats: ['qr_code'] }).detect(i)).map((r) => r.rawValue); }, s); };

for (const dpr of [1, 2]) { await go(1280, dpr); const got = await decode(); ok(got.length === 1 && got[0] === vcard, `QR at ${dpr}x decodes to the exact vCard (${got[0]?.length ?? 0} bytes)`); }

await go(1280);
await pg.click('.qr'); await wait(250);
ok(!!(await pg.$('.egg-canvas')), 'snake: clicking the QR opens Snake');
await pg.keyboard.press('/'); await wait(150);
ok(!(await pg.$('.spl-in')) && !!(await pg.$('.egg-canvas')), 'one at a time: "/" is ignored while Snake is open');
await pg.keyboard.press('ArrowUp'); await wait(5000);
ok((await pg.$eval('.egg-msg', (m) => m.textContent)).startsWith('Index full'), 'snake: hitting the wall ends the game');
await pg.keyboard.press(' '); await wait(200);
ok((await pg.$eval('.egg-msg', (m) => m.textContent)).startsWith('Arrow keys'), 'snake: Space restarts');
await pg.keyboard.press('Escape'); await wait(200);
ok(!!(await pg.$('.qr')) && !!(await pg.$('.focus')), 'snake: Esc restores the badge');
await wait(600);

await pg.click('.focus li:nth-child(3)'); await wait(200);
ok((await pg.$$('.hosts button')).length === 9, 'defend: Detections opens nine hosts');
for (let i = 0; i < 3; i++) { await pg.click('.b-head svg'); await wait(80); }
ok(!(await pg.$('.spl-in')), 'one at a time: J-logo taps are ignored while Defender is open');
let hot = null; for (let i = 0; i < 20 && !hot; i++) { await wait(250); hot = await pg.$('.hosts button.hot'); }
if (hot) await hot.click(); await wait(100);
ok(await pg.$eval('.egg-blocked', (e) => e.textContent) === '1', 'defend: blocking an attacked host counts 1');
await pg.click('.egg-x'); await wait(200);
ok(!!(await pg.$('.focus')), 'defend: x restores the badge');
await wait(1200); // timers must be gone: no errors after closing

await pg.keyboard.press('/'); await wait(200);
ok(!!(await pg.$('.spl-in input')), 'spl: "/" opens the console');
for (const q of ['whoami', '| table certs', '| foo', 'sudo make me admin']) { await pg.type('.spl-in input', q); await pg.keyboard.press('Enter'); await wait(60); }
const out = await pg.$eval('.spl-out', (o) => o.innerText);
ok(out.includes('role=power') && out.includes('Power User        Nov 2026') && out.includes("Unknown search command 'foo'") && out.includes('Permission denied'), 'spl: commands answer correctly');
await pg.type('.spl-in input', 'exit'); await pg.keyboard.press('Enter'); await wait(150);
ok(!!(await pg.$('.focus')), 'spl: exit restores the badge');
await pg.click('.qr'); await wait(200);
ok(!!(await pg.$('.egg-canvas')), 'snake opens again after the console closed');
await pg.keyboard.press('Escape');
ok((await pg.$eval('footer', (f) => f.innerText)).includes('Press / to search'), 'desktop shows the "Press / to search" hint');

await go(390, 2, true);
ok(await pg.$eval('.page-hint', (h) => getComputedStyle(h).display) === 'none', 'phone hides the "/" hint');
for (let i = 0; i < 3; i++) { await pg.tap('.b-head svg'); await wait(100); }
ok(!!(await pg.$('.spl-in input')), 'phone: three taps on the J logo open the console');

let layout = 0;
for (const s of ['light', 'dark']) for (const w of [320, 360, 390, 768, 1024, 1280, 1440]) {
  await pg.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: s }]); await go(w, 1);
  const r = await pg.evaluate(() => { const bb = document.querySelector('.badge').getBoundingClientRect(), q = document.querySelector('.qr').getBoundingClientRect(); return { o: document.documentElement.scrollWidth - innerWidth, inside: q.right <= bb.right + 1 && q.left >= bb.left - 1, square: Math.abs(document.querySelector('.qr svg').getBoundingClientRect().width - document.querySelector('.qr svg').getBoundingClientRect().height) < 1 }; });
  if (r.o > 0 || !r.inside || !r.square) { layout++; console.log('LAYOUT', s, w, JSON.stringify(r)); }
}
ok(layout === 0, 'layout: no overflow, QR square and inside the badge (7 widths x 2 themes)');
await pg.setViewport({ width: 1366, height: 768 }); await pg.goto(BASE + '/', { waitUntil: 'networkidle0' });
ok(await pg.evaluate(() => document.querySelector('.badge').getBoundingClientRect().bottom <= innerHeight), 'badge fits a 1366x768 laptop screen without scrolling');
ok(errs.length === 0, 'no JavaScript errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
console.log(fails ? fails + ' FAILED' : 'ALL PASS');
await b.close();
process.exitCode = fails ? 1 : 0;
