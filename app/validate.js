#!/usr/bin/env node
// Schema validator for data/*.js SET config objects.
// Usage: node app/validate.js

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Validator ─────────────────────────────────────────────────────────────────

export function validateSet(SET, label = 'SET') {
  const errors = [];
  const err = msg => errors.push(`${label}: ${msg}`);

  // Top-level required strings
  for (const key of ['name', 'storageKey', 'accentColor', 'completionMessage']) {
    if (typeof SET[key] !== 'string' || !SET[key])
      err(`"${key}" must be a non-empty string`);
  }

  // accentColor must be a hex color
  if (typeof SET.accentColor === 'string' && !/^#[0-9a-fA-F]{6}$/.test(SET.accentColor))
    err(`"accentColor" must be a 6-digit hex color (got "${SET.accentColor}")`);

  // setNumber: string or null
  if (SET.setNumber !== null && typeof SET.setNumber !== 'string')
    err(`"setNumber" must be a string or null`);

  // subtitle: optional string
  if ('subtitle' in SET && typeof SET.subtitle !== 'string')
    err(`"subtitle" must be a string`);

  // features
  if (!SET.features || typeof SET.features !== 'object')
    err(`"features" must be an object`);
  else if (typeof SET.features.subModels !== 'boolean')
    err(`"features.subModels" must be a boolean`);

  // subModelDefs
  if (!Array.isArray(SET.subModelDefs))
    err(`"subModelDefs" must be an array`);
  else {
    if (SET.features?.subModels && SET.subModelDefs.length === 0)
      err(`"subModelDefs" must be non-empty when features.subModels is true`);
    SET.subModelDefs.forEach((def, i) => {
      for (const key of ['id', 'label', 'color']) {
        if (typeof def[key] !== 'string' || !def[key])
          err(`subModelDefs[${i}].${key} must be a non-empty string`);
      }
    });
  }

  // colors
  if (!SET.colors || typeof SET.colors !== 'object' || Array.isArray(SET.colors))
    err(`"colors" must be an object`);
  else {
    for (const [colorId, color] of Object.entries(SET.colors)) {
      if (isNaN(Number(colorId)))
        err(`colors key "${colorId}" must be a numeric colorId`);
      if (typeof color.name !== 'string' || !color.name)
        err(`colors[${colorId}].name must be a non-empty string`);
      if (typeof color.hex !== 'string' || !color.hex)
        err(`colors[${colorId}].hex must be a non-empty string`);
    }
  }

  // parts
  if (!Array.isArray(SET.parts) || SET.parts.length === 0)
    err(`"parts" must be a non-empty array`);
  else {
    const colorIds = new Set(Object.keys(SET.colors ?? {}).map(Number));
    SET.parts.forEach((p, i) => {
      const loc = `parts[${i}]`;
      if (typeof p.id !== 'string' || !p.id)
        err(`${loc}.id must be a non-empty string`);
      if (typeof p.partNo !== 'string' || !p.partNo)
        err(`${loc}.partNo must be a non-empty string`);
      if (typeof p.colorId !== 'number')
        err(`${loc}.colorId must be a number`);
      else if (!colorIds.has(p.colorId))
        err(`${loc}.colorId ${p.colorId} not found in colors map`);
      if (typeof p.qty !== 'number' || p.qty < 1)
        err(`${loc}.qty must be a positive number`);
      if (typeof p.name !== 'string' || !p.name)
        err(`${loc}.name must be a non-empty string`);
      if ('sub' in p && typeof p.sub !== 'string')
        err(`${loc}.sub must be a string`);
      if ('isFig' in p && typeof p.isFig !== 'boolean')
        err(`${loc}.isFig must be a boolean`);

      const expectedId = `${p.partNo}-${p.colorId}`;
      if (p.id !== expectedId)
        err(`${loc}.id should be "${expectedId}" (got "${p.id}")`);
    });
  }

  return errors;
}

// ── CLI entry point ───────────────────────────────────────────────────────────

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const DATA_DIR  = path.join(__dirname, '..', 'data');

  const dataFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.js')).sort();

  let totalErrors = 0;

  for (const file of dataFiles) {
    const mod    = await import(path.join(DATA_DIR, file));
    const errors = validateSet(mod.default, file);

    if (errors.length) {
      console.error(`\n✗ ${file}`);
      errors.forEach(e => console.error(`    ${e}`));
      totalErrors += errors.length;
    } else {
      console.log(`  ✓ ${file}`);
    }
  }

  if (totalErrors) {
    console.error(`\n${totalErrors} error(s) found.`);
    process.exit(1);
  } else {
    console.log(`\nAll ${dataFiles.length} data files valid.`);
  }
}
