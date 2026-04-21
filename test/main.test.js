import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSetHtml } from '../app/main.js';

const TMPL = '<script>const SET = __SET_CONFIG__;</script>';

const MINIMAL_SET = {
  name: 'Test Set',
  setNumber: '12345',
  storageKey: 'lego12345_counts',
  accentColor: '#4ab4e8',
  completionMessage: 'Done!',
  features: { subModels: false },
  subModelDefs: [],
  colors: { 11: { name: 'Black', hex: '#000' } },
  parts: [{ id: '3001-11', partNo: '3001', colorId: 11, qty: 2, name: 'Brick 2x4' }],
};

test('replaces __SET_CONFIG__ token with serialized SET', () => {
  const html = buildSetHtml(TMPL, MINIMAL_SET);
  assert.ok(html.includes('"name": "Test Set"'));
  assert.ok(!html.includes('__SET_CONFIG__'));
});

test('embeds valid JSON', () => {
  const html = buildSetHtml(TMPL, MINIMAL_SET);
  const match = html.match(/const SET = ({[\s\S]*?});/);
  assert.ok(match, 'SET JSON not found in output');
  assert.doesNotThrow(() => JSON.parse(match[1]));
});

test('preserves template content outside the token', () => {
  const html = buildSetHtml(TMPL, MINIMAL_SET);
  assert.ok(html.startsWith('<script>'));
  assert.ok(html.endsWith(';</script>'));
});
