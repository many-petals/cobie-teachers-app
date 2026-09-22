const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(require.resolve('../app/data/milestones.ts'), 'utf8');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: exportsObject });
const { getObservationLabel, OBSERVATION_LABELS } = exportsObject;

test('historical value 4 never becomes observed consistently', () => {
  for (const scale_version of [undefined, null, 1]) {
    assert.equal(getObservationLabel({ rating: 4, scale_version }).label, 'Exceeding (previous scale)');
  }
});
test('new records use all four approved meanings', () => {
  const expected = ['Not yet observed', 'Observed with support', 'Observed independently', 'Observed consistently'];
  expected.forEach((label, i) => assert.equal(getObservationLabel({ rating: i + 1, scale_version: 2 }).label, label));
  assert.equal(OBSERVATION_LABELS.length, 4);
});
test('missing observation is different from not yet observed', () => {
  assert.equal(getObservationLabel({ rating: 0, scale_version: 2 }), null);
  assert.equal(getObservationLabel({ rating: 1, scale_version: 2 }).label, 'Not yet observed');
});
