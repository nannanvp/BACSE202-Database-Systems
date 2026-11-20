import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTriageSummary,
  computeFlashcardStats,
  ER_MAPPING_DRILLS,
  evaluateErQuizScore,
  filterFlashcards,
  filterSprintBlocks,
  FLASHCARD_DECK,
  recommendEerMappingOptions,
  TRIAGE_HIGH_YIELD_BLOCK_IDS,
} from './erFlashcardEngine';
import { SPRINT_BLOCKS } from '../data/bacse202Data';

test('ER/EER 7-Step & 8A-8D drill bank has 10 valid questions and accurate scoring', () => {
  assert.equal(ER_MAPPING_DRILLS.length, 10);
  for (const q of ER_MAPPING_DRILLS) {
    assert.ok(q.options.length >= 4, `${q.id} should have 4 options`);
    assert.ok(
      q.correctIndex >= 0 && q.correctIndex < q.options.length,
      `${q.id} correctIndex out of range`
    );
    assert.ok(q.mappedSchema.length > 5);
  }

  const perfectSelections: Record<string, number> = {};
  for (const q of ER_MAPPING_DRILLS) {
    perfectSelections[q.id] = q.correctIndex;
  }
  const perfect = evaluateErQuizScore(perfectSelections);
  assert.equal(perfect.answeredCount, 10);
  assert.equal(perfect.correctCount, 10);
  assert.equal(perfect.accuracyPct, 100);

  const partial = evaluateErQuizScore({
    'er-step-1': ER_MAPPING_DRILLS[0].correctIndex,
    'er-step-2': (ER_MAPPING_DRILLS[1].correctIndex + 1) % 4,
  });
  assert.equal(partial.answeredCount, 2);
  assert.equal(partial.correctCount, 1);
  assert.equal(partial.accuracyPct, 50);
});

test('EER Option 8A-8D recommender enforces exact Elmasri disjoint/overlapping & total/partial rules', () => {
  const totalDisjoint = recommendEerMappingOptions('disjoint', 'total');
  const mapTD = Object.fromEntries(totalDisjoint.map((o) => [o.optionId, o.status]));
  assert.equal(mapTD['8A'], 'VALID');
  assert.equal(mapTD['8B'], 'RECOMMENDED');
  assert.equal(mapTD['8C'], 'VALID');
  assert.equal(mapTD['8D'], 'VALID');

  const partialDisjoint = recommendEerMappingOptions('disjoint', 'partial');
  const mapPD = Object.fromEntries(partialDisjoint.map((o) => [o.optionId, o.status]));
  assert.equal(mapPD['8A'], 'RECOMMENDED');
  assert.equal(mapPD['8B'], 'INVALID');
  assert.equal(mapPD['8C'], 'VALID');

  const partialOverlapping = recommendEerMappingOptions('overlapping', 'partial');
  const mapPO = Object.fromEntries(partialOverlapping.map((o) => [o.optionId, o.status]));
  assert.equal(mapPO['8A'], 'RECOMMENDED');
  assert.equal(mapPO['8B'], 'INVALID');
  assert.equal(mapPO['8C'], 'INVALID');
  assert.equal(mapPO['8D'], 'RECOMMENDED');

  const totalOverlapping = recommendEerMappingOptions('overlapping', 'total');
  const mapTO = Object.fromEntries(totalOverlapping.map((o) => [o.optionId, o.status]));
  assert.equal(mapTO['8B'], 'INVALID');
  assert.equal(mapTO['8C'], 'INVALID');
  assert.equal(mapTO['8D'], 'RECOMMENDED');
});

test('48h High-Yield 80/20 Triage filters to 6 core blocks and computes baseline hours accurately', () => {
  assert.equal(TRIAGE_HIGH_YIELD_BLOCK_IDS.size, 6);
  const filtered = filterSprintBlocks(SPRINT_BLOCKS, {
    dayFilter: 'All',
    hideCompleted: false,
    highYieldOnly: true,
    completedBlockIds: [],
  });
  assert.equal(filtered.length, 6);
  assert.ok(filtered.every((b) => TRIAGE_HIGH_YIELD_BLOCK_IDS.has(b.id)));

  const summary = calculateTriageSummary(SPRINT_BLOCKS, ['sb-2', 'sb-3', 'sb-4']);
  assert.equal(summary.coreBlockCount, 6);
  assert.equal(summary.completedCoreCount, 3);
  assert.equal(summary.corePercent, 50);
  assert.ok(summary.estimatedPrepHours > 14 && summary.estimatedPrepHours < 18);
});

test('Morning Rapid-Fire Flashcard Deck covers Modules 1-5 with 24 cards and filters cleanly', () => {
  assert.equal(FLASHCARD_DECK.length, 24);
  for (const mod of ['m1', 'm2', 'm3', 'm4', 'm5'] as const) {
    const modCards = filterFlashcards(FLASHCARD_DECK, mod, false, []);
    assert.ok(modCards.length >= 4, `Module ${mod} should have >= 4 flashcards`);
  }

  const known = ['fc-m1-1', 'fc-m2-1', 'fc-m3-1'];
  const practiceOnly = filterFlashcards(FLASHCARD_DECK, 'all', true, known);
  assert.equal(practiceOnly.length, 21);

  const stats = computeFlashcardStats(FLASHCARD_DECK, known);
  assert.equal(stats.knownCount, 3);
  assert.equal(stats.totalCount, 24);
  assert.equal(stats.readyPct, 13);
});
