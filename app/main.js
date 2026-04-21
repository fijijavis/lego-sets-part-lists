#!/usr/bin/env node
// Build script: data/*.js + template/checklist.html → dist/*.html + dist/index.html
// Usage: node app/main.js
// Requires Node 24+ (uses ES module dynamic import)

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildIndex } from './index-page.js';

export function buildSetHtml(tmpl, SET) {
  return tmpl.replace('__SET_CONFIG__', JSON.stringify(SET, null, 2));
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const ROOT      = path.resolve(__dirname, '..');
  const DATA_DIR  = path.join(ROOT, 'data');
  const DIST_DIR  = path.join(ROOT, 'dist');
  const TEMPLATE  = path.join(ROOT, 'template', 'checklist.html');

  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

  const tmpl = fs.readFileSync(TEMPLATE, 'utf8');

  const dataFiles = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();

  const sets = [];

  for (const file of dataFiles) {
    const mod = await import(path.join(DATA_DIR, file));
    const SET = mod.default;

    const outName = file.replace(/\.js$/, '.html');
    fs.writeFileSync(path.join(DIST_DIR, outName), buildSetHtml(tmpl, SET), 'utf8');
    console.log(`  built: dist/${outName} (${SET.parts.length} parts)`);

    sets.push({ file: outName, SET });
  }

  buildIndex(DIST_DIR, sets);
  console.log(`  built: dist/index.html (${sets.length} sets)`);
  console.log(`\nDone — ${sets.length + 1} files written to dist/`);
}
