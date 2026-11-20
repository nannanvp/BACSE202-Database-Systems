import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES } from '../data/bacse202Data';
import {
  countFilteredFormulas,
  filterModuleFormulas,
  isFormulaToggleShortcut,
} from './formulaQuickRefEngine';

test('filterModuleFormulas returns all 5 modules and all 20 formulas when query is empty', () => {
  const groups = filterModuleFormulas(MODULES, '   ');
  assert.equal(groups.length, 5);
  assert.equal(countFilteredFormulas(groups), 20);
});

test('filterModuleFormulas matches formula labels, expressions, and module tokens', () => {
  const bcnf = filterModuleFormulas(MODULES, 'BCNF');
  assert.equal(bcnf.length, 1);
  assert.equal(bcnf[0].moduleId, 'm2');
  assert.ok(bcnf[0].formulas.some((f) => f.label.includes('BCNF')));

  const ts = filterModuleFormulas(MODULES, 'write_TS');
  assert.equal(ts.length, 1);
  assert.equal(ts[0].moduleId, 'm4');

  const mod3 = filterModuleFormulas(MODULES, 'm3 B+');
  assert.equal(mod3.length, 1);
  assert.equal(mod3[0].moduleId, 'm3');
  assert.equal(mod3[0].formulas.length, 2);

  const none = filterModuleFormulas(MODULES, 'nonexistent_xyz_formula');
  assert.equal(none.length, 0);
  assert.equal(countFilteredFormulas(none), 0);
});

test('isFormulaToggleShortcut matches Ctrl+K and Cmd+K regardless of case and ignores Alt combos', () => {
  assert.equal(isFormulaToggleShortcut({ key: 'k', ctrlKey: true, metaKey: false }), true);
  assert.equal(isFormulaToggleShortcut({ key: 'K', ctrlKey: false, metaKey: true }), true);
  assert.equal(isFormulaToggleShortcut({ key: 'k', ctrlKey: false, metaKey: false }), false);
  assert.equal(
    isFormulaToggleShortcut({ key: 'k', ctrlKey: true, metaKey: false, altKey: true }),
    false
  );
  assert.equal(isFormulaToggleShortcut({ key: 'j', ctrlKey: true, metaKey: false }), false);
});
