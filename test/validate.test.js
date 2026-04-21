import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../app/validate.js';

function valid(overrides = {}) {
  return {
    name: 'Test Set',
    setNumber: '12345',
    storageKey: 'lego12345_counts',
    accentColor: '#4ab4e8',
    completionMessage: 'Done!',
    features: { subModels: false },
    subModelDefs: [],
    colors: { 11: { name: 'Black', hex: '#000' } },
    parts: [{ id: '3001-11', partNo: '3001', colorId: 11, qty: 2, name: 'Brick 2x4' }],
    ...overrides,
  };
}

test('valid SET produces no errors', () => {
  assert.deepEqual(validateSet(valid()), []);
});

test('MOC with setNumber null is valid', () => {
  assert.deepEqual(validateSet(valid({ setNumber: null, subtitle: 'MOC' })), []);
});

test('optional field subtitle is allowed', () => {
  assert.deepEqual(validateSet(valid({ subtitle: 'Sub' })), []);
});

for (const key of ['name', 'storageKey', 'accentColor', 'completionMessage']) {
  test(`missing "${key}" is an error`, () => {
    const SET = valid();
    delete SET[key];
    assert.ok(validateSet(SET).some(e => e.includes(`"${key}"`)));
  });
}

test('invalid accentColor format is an error', () => {
  assert.ok(validateSet(valid({ accentColor: 'blue' })).some(e => e.includes('accentColor')));
});

test('features.subModels not boolean is an error', () => {
  assert.ok(validateSet(valid({ features: { subModels: 'yes' } })).some(e => e.includes('subModels')));
});

test('subModelDefs empty when subModels:true is an error', () => {
  assert.ok(validateSet(valid({ features: { subModels: true }, subModelDefs: [] })).some(e => e.includes('subModelDefs')));
});

test('part colorId not in colors map is an error', () => {
  const SET = valid({ parts: [{ id: '3001-99', partNo: '3001', colorId: 99, qty: 1, name: 'Brick' }] });
  assert.ok(validateSet(SET).some(e => e.includes('colorId 99')));
});

test('part id mismatch is an error', () => {
  const SET = valid({ parts: [{ id: 'wrong-11', partNo: '3001', colorId: 11, qty: 1, name: 'Brick' }] });
  assert.ok(validateSet(SET).some(e => e.includes('"3001-11"')));
});

test('part qty less than 1 is an error', () => {
  const SET = valid({ parts: [{ id: '3001-11', partNo: '3001', colorId: 11, qty: 0, name: 'Brick' }] });
  assert.ok(validateSet(SET).some(e => e.includes('qty')));
});

test('empty parts array is an error', () => {
  assert.ok(validateSet(valid({ parts: [] })).some(e => e.includes('"parts"')));
});
