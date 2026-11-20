import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES } from '../data/bacse202Data';
import {
  buildCheatSheetPrintHtml,
  DEFAULT_PRINT_DIVISION_COLORS,
  escapeHtml,
  formatCheatSheetDate,
} from './cheatSheetPrintEngine';

test('buildCheatSheetPrintHtml includes header, current date, @media print, two-column 10pt layout, page breaks, and auto window.print()', () => {
  const fixedDate = new Date('2026-11-20T10:30:00Z');
  const html = buildCheatSheetPrintHtml(MODULES, DEFAULT_PRINT_DIVISION_COLORS, fixedDate);
  const expectedDate = formatCheatSheetDate(fixedDate);

  // Header & date
  assert.ok(html.includes('BACSE202 Database Systems — Quick Reference'));
  assert.ok(html.includes(expectedDate));

  // Print CSS requirements: @media print, 2-column layout, 10pt font, page break, page numbers
  assert.ok(html.includes('@media print'));
  assert.ok(html.includes('grid-template-columns: 1fr 1fr'));
  assert.ok(html.includes('font-size: 10pt'));
  assert.ok(html.includes('page-break-before: always'));
  assert.ok(html.includes('counter(page)'));
  assert.ok(html.includes('Page 1 of 2'));
  assert.ok(html.includes('Page 2 of 2'));
  assert.ok(html.includes('window.print()'));
});

test('buildCheatSheetPrintHtml renders all 5 DIVISION_WHEEL colors, formulas, comparison tables, and likelyFatQuestions prompts', () => {
  const html = buildCheatSheetPrintHtml(MODULES, DEFAULT_PRINT_DIVISION_COLORS);

  for (const mod of MODULES) {
    const hex = DEFAULT_PRINT_DIVISION_COLORS[mod.id].hex;
    assert.ok(html.includes(hex), `Missing DIVISION_WHEEL hex ${hex} for ${mod.id}`);
    assert.ok(html.includes(`MODULE ${mod.number}`), `Missing header for module ${mod.number}`);

    for (const rule of mod.keyFormulasAndRules) {
      assert.ok(
        html.includes(escapeHtml(rule.label)),
        `Missing formula label "${rule.label}" for ${mod.id}`
      );
      assert.ok(
        html.includes(escapeHtml(rule.value)),
        `Missing formula value "${rule.value}" for ${mod.id}`
      );
    }

    assert.ok(
      html.includes(escapeHtml(mod.comparisonTable.title)),
      `Missing comparison table title for ${mod.id}`
    );
    for (const header of mod.comparisonTable.headers) {
      assert.ok(html.includes(escapeHtml(header)), `Missing table header "${header}"`);
    }
    for (const row of mod.comparisonTable.rows) {
      for (const cell of row) {
        assert.ok(html.includes(escapeHtml(cell)), `Missing table cell "${cell}"`);
      }
    }

    for (const prompt of mod.likelyFatQuestions) {
      assert.ok(
        html.includes(escapeHtml(prompt)),
        `Missing likely FAT question prompt for ${mod.id}`
      );
    }
  }
});
