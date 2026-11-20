import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DRILL_CATEGORIES,
  EXAM_HALL_PACING,
  EXAM_TRAP_BUSTERS,
  EXAMINER_BLUEPRINTS,
  generateNumericalProblem,
  gradeDrillAnswer,
} from './numericalDrillEngine';

test('Procedural numerical drill generator creates valid, self-consistent exam problems across all 6 archetypes and multiple seeds', () => {
  assert.equal(DRILL_CATEGORIES.length, 6);

  for (const cat of DRILL_CATEGORIES) {
    const p1 = generateNumericalProblem(cat.id, 1);
    const p2 = generateNumericalProblem(cat.id, 7);
    const p1Repeat = generateNumericalProblem(cat.id, 1);

    // Deterministic for same seed
    assert.deepEqual(p1, p1Repeat);

    // Every problem has non-empty prompt, expectedAnswer, and marking-scheme rubric steps
    assert.ok(p1.title.length > 5);
    assert.ok(p1.givenBlock.length > 10);
    assert.ok(p1.expectedAnswer.length > 0);
    assert.ok(p1.rubricSteps.length >= 3, `Expected >=3 rubric steps for ${cat.id}`);
    assert.ok(p2.expectedAnswer.length > 0);

    // Submitting expectedAnswer always grades as correct
    const exactGrade = gradeDrillAnswer(p1, p1.expectedAnswer);
    assert.equal(exactGrade.correct, true, `Exact answer failed for ${cat.id}`);
  }
});

test('Numerical drill grader normalizes commas/units for numbers and order-insensitive sets for WAL UNDO/REDO lists', () => {
  const idxProb = generateNumericalProblem('index_io', 3);
  const formattedWithComma = `${Number(idxProb.expectedAnswer).toLocaleString()} blocks`;
  assert.equal(gradeDrillAnswer(idxProb, formattedWithComma).correct, true);
  assert.equal(gradeDrillAnswer(idxProb, '99999999').correct, false);
  assert.equal(gradeDrillAnswer(idxProb, '   ').correct, false);

  // Test order-insensitive set matching on WAL UNDO list (seed 1 produces immediate update UNDO T2, T4)
  let walTextProb = generateNumericalProblem('wal_recovery', 1);
  for (let s = 1; s <= 15; s++) {
    const cand = generateNumericalProblem('wal_recovery', s);
    if (cand.inputKind === 'text' && cand.expectedAnswer.includes(',')) {
      walTextProb = cand;
      break;
    }
  }
  assert.equal(walTextProb.inputKind, 'text');
  const reversed = walTextProb.expectedAnswer.split(',').map((t) => t.trim()).reverse().join(' ');
  assert.equal(gradeDrillAnswer(walTextProb, reversed.toLowerCase()).correct, true);
  assert.equal(gradeDrillAnswer(walTextProb, 'T99').correct, false);
});

test('Examiner blueprints (Q1-Q10), 20 Trap Busters, and 3-hour pacing schedule cover all 5 modules completely', () => {
  assert.equal(EXAMINER_BLUEPRINTS.length, 10);
  assert.equal(EXAM_TRAP_BUSTERS.length, 20);
  assert.equal(EXAM_HALL_PACING.length, 7);

  for (const modId of ['m1', 'm2', 'm3', 'm4', 'm5'] as const) {
    assert.ok(
      EXAMINER_BLUEPRINTS.some((b) => b.moduleId === modId),
      `Missing examiner blueprint for ${modId}`
    );
    assert.ok(
      EXAM_TRAP_BUSTERS.filter((t) => t.moduleId === modId).length >= 3,
      `Need >=3 trap busters for ${modId}`
    );
  }
});
