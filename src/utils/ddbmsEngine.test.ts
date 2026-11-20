import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSemijoinCost,
  SEMIJOIN_PRESETS,
  TWO_PC_SCENARIOS,
  validateHorizontalFragmentation,
  validateVerticalFragmentation,
  VERTICAL_PRESETS,
} from './ddbmsEngine';

test('Semijoin cost calculator computes exact byte savings and flags low-selectivity trap', () => {
  // A1 Q9: EMPLOYEE (10000*100 = 1,000,000B) vs Semijoin (10*4 + 500*100 = 50,040B)
  const a1 = calculateSemijoinCost(SEMIJOIN_PRESETS[0].input);
  assert.equal(a1.naiveShipRBytes, 1_000_000);
  assert.equal(a1.semijoinStep1Bytes, 40);
  assert.equal(a1.semijoinStep2Bytes, 50_000);
  assert.equal(a1.semijoinTotalBytes, 50_040);
  assert.ok(a1.savingsPctVsShipR > 94);

  // Model Q10: High-selectivity Semijoin beats BOTH Naive R and Naive S
  const model = calculateSemijoinCost(SEMIJOIN_PRESETS[1].input);
  assert.equal(model.winner, 'SEMIJOIN');
  assert.equal(model.semijoinTotalBytes, 200 * 8 + 600 * 120); // 73,600 < 160,000
  assert.ok(model.savingsBytes > 0);

  // Low-selectivity trap: Semijoin costs MORE than Naive ship
  const trap = calculateSemijoinCost(SEMIJOIN_PRESETS[2].input);
  assert.equal(trap.winner, 'NAIVE');
  assert.ok(trap.semijoinTotalBytes > trap.bestNaiveBytes);
});

test('Horizontal and Vertical fragmentation validators accurately test Completeness, Disjointness, and Reconstruction', () => {
  const hValid = validateHorizontalFragmentation('valid_dept');
  assert.equal(hValid.allValid, true);

  const hMiss = validateHorizontalFragmentation('broken_completeness');
  assert.equal(hMiss.completeness.passed, false);
  assert.equal(hMiss.reconstruction.passed, false);
  assert.ok(hMiss.completeness.detail.includes('E5'));

  const hOverlap = validateHorizontalFragmentation('broken_disjointness');
  assert.equal(hOverlap.completeness.passed, true);
  assert.equal(hOverlap.disjointness.passed, false);

  const vValid = validateVerticalFragmentation(VERTICAL_PRESETS.valid_pk_split.fragments);
  assert.equal(vValid.allValid, true);

  const vNoPk = validateVerticalFragmentation(VERTICAL_PRESETS.missing_pk.fragments);
  assert.equal(vNoPk.reconstruction.passed, false);
  assert.equal(vNoPk.allValid, false);

  const vDrop = validateVerticalFragmentation(VERTICAL_PRESETS.dropped_col.fragments);
  assert.equal(vDrop.completeness.passed, false);

  const vDup = validateVerticalFragmentation(VERTICAL_PRESETS.duplicate_nonkey.fragments);
  assert.equal(vDup.disjointness.passed, false);
});

test('2PC crash-recovery scenarios cover normal commit, abort, participant crashes, and coordinator blocking', () => {
  assert.equal(TWO_PC_SCENARIOS.normal_commit.finalOutcome, 'COMMITTED');
  assert.equal(TWO_PC_SCENARIOS.participant_abort.finalOutcome, 'ABORTED');
  assert.equal(TWO_PC_SCENARIOS.participant_crash_before_vote.finalOutcome, 'ABORTED');
  assert.equal(TWO_PC_SCENARIOS.participant_crash_after_ready.finalOutcome, 'COMMITTED');
  assert.equal(TWO_PC_SCENARIOS.coordinator_crash_blocking.finalOutcome, 'BLOCKED (UNCERTAIN)');

  const blockingLast =
    TWO_PC_SCENARIOS.coordinator_crash_blocking.steps[
      TWO_PC_SCENARIOS.coordinator_crash_blocking.steps.length - 1
    ];
  assert.equal(blockingLast.coordState, 'CRASHED');
  assert.equal(blockingLast.p1State, 'BLOCKED');
  assert.equal(blockingLast.p2State, 'BLOCKED');
  assert.equal(blockingLast.p3State, 'BLOCKED');
});
