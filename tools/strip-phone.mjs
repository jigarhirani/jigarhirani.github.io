// Removes the phone number from page 1 of a resume PDF, using Scrub's core (../vibe/pdf-text-remover),
// and refuses to save if a phone number is left on any page.
//   node tools/strip-phone.mjs "<source.pdf>" assets/Jigar-Hirani-Resume.pdf
import { readFileSync, writeFileSync } from 'node:fs';
const { ScrubDocument } = await import(new URL('../../vibe/pdf-text-remover/src/core/doc.js', import.meta.url));

const [src, out] = process.argv.slice(2);
const pageText = (d, i = 0) => d.page(i).runs.map((r) => r.text).join('');
const allText = (d) => Array.from({ length: d.pageCount }, (_, i) => pageText(d, i)).join('\n');
const doc = await ScrubDocument.load(readFileSync(src));
const runs = doc.page(0).runs;

// Map each character of the page text back to its (run, glyph).
const map = [];
for (const r of runs) r.glyphs.forEach((g, k) => { for (let c = 0; c < g.chars; c++) map.push([r, k]); });
const m = pageText(doc).match(/\+91[\s\d]+\|\s*/);
if (!m) throw new Error('phone number not found on page 1');

const byRun = new Map();
for (let i = m.index; i < m.index + m[0].length; i++) {
  const [r, k] = map[i];
  const e = byRun.get(r) || { page: 0, key: r.streamKey, op: r.opIndex, glyphs: [] };
  if (!e.glyphs.includes(k)) e.glyphs.push(k);
  byRun.set(r, e);
}
const { bytes } = await doc.export([...byRun.values()]);

const after = allText(await ScrubDocument.load(bytes));
// Any +91, or a 10-digit Indian mobile number with or without a space, on any page.
if (/\+91|\b[6-9]\d{4}\s?\d{5}\b/.test(after) || !after.includes('@gmail.com')) throw new Error('check failed: phone still present or email lost');
writeFileSync(out, bytes);
console.log('removed', JSON.stringify(m[0]), '->', out);
