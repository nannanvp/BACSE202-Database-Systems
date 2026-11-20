import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQueryTreeOptimizationStages,
  DEFAULT_DATASET,
  evaluateRAQuery,
  evaluateTRCQuery,
  toggleEnrollmentTuple,
} from './relationalEngine';

test('RA Division (÷) computes exact T1, T2, and T1 - T2 and reacts to live enrollment toggles', () => {
  const res = evaluateRAQuery('division', DEFAULT_DATASET, {
    dept: 'CSE',
    minCgpa: 8.5,
    minCredits: 4,
  });
  assert.deepEqual(res.divisionProof?.divisorCourses, ['CS301', 'CS302', 'CS303']);
  assert.deepEqual(res.divisionProof?.finalSids, ['S1', 'S2']);
  assert.equal(res.rows.length, 2);

  // Enroll S3 in CS303 -> S3 now satisfies ALL CSE courses
  const updatedEnrollments = toggleEnrollmentTuple(DEFAULT_DATASET.enrollments, 'S3', 'CS303', 'A');
  const resAfterAdd = evaluateRAQuery(
    'division',
    { ...DEFAULT_DATASET, enrollments: updatedEnrollments },
    { dept: 'CSE', minCgpa: 8.5, minCredits: 4 }
  );
  assert.deepEqual(resAfterAdd.divisionProof?.finalSids, ['S1', 'S2', 'S3']);

  // Remove S2 from CS302 -> S2 is disqualified
  const updatedEnrollments2 = toggleEnrollmentTuple(updatedEnrollments, 'S2', 'CS302');
  const resAfterRemove = evaluateRAQuery(
    'division',
    { ...DEFAULT_DATASET, enrollments: updatedEnrollments2 },
    { dept: 'CSE', minCgpa: 8.5, minCredits: 4 }
  );
  assert.deepEqual(resAfterRemove.divisionProof?.finalSids, ['S1', 'S3']);
});

test('RA selection, natural join, set difference, and self-join max CGPA return exact rows', () => {
  const selProj = evaluateRAQuery('selection_projection', DEFAULT_DATASET, {
    dept: 'CSE',
    minCgpa: 8.5,
    minCredits: 4,
  });
  assert.deepEqual(
    selProj.rows.map((r) => r.Sid),
    ['S1', 'S2']
  );

  const diff = evaluateRAQuery('set_difference', DEFAULT_DATASET, {
    dept: 'CSE',
    minCgpa: 8.5,
    minCredits: 4,
  });
  assert.deepEqual(
    diff.rows.map((r) => r.Sid),
    ['S5']
  );

  const maxCgpa = evaluateRAQuery('max_cgpa_self_join', DEFAULT_DATASET, {
    dept: 'CSE',
    minCgpa: 8.5,
    minCredits: 4,
  });
  assert.deepEqual(
    maxCgpa.rows.map((r) => r.Sid),
    ['S1', 'S3']
  );

  const joinRes = evaluateRAQuery('natural_join', DEFAULT_DATASET, {
    dept: 'AI',
    minCgpa: 8.5,
    minCredits: 4,
  });
  assert.equal(joinRes.rows.length, 2);
});

test('TRC quantifier evaluator matches RA Division (∀), Set Difference (¬∃), and Max CGPA (∀)', () => {
  const trcForAll = evaluateTRCQuery('forall_all_dept_courses', DEFAULT_DATASET, 'CSE');
  const raDiv = evaluateRAQuery('division', DEFAULT_DATASET, {
    dept: 'CSE',
    minCgpa: 8.5,
    minCredits: 4,
  });
  assert.deepEqual(
    trcForAll.witnesses.filter((w) => w.satisfies).map((w) => w.sid),
    raDiv.rows.map((r) => r.Sid)
  );
  assert.equal(trcForAll.safetyStatus, 'SAFE');

  const trcNotExists = evaluateTRCQuery('not_exists_unenrolled', DEFAULT_DATASET, 'CSE');
  assert.deepEqual(
    trcNotExists.witnesses.filter((w) => w.satisfies).map((w) => w.sid),
    ['S5']
  );

  const trcMax = evaluateTRCQuery('forall_max_cgpa', DEFAULT_DATASET, 'CSE');
  assert.deepEqual(
    trcMax.witnesses.filter((w) => w.satisfies).map((w) => w.sid),
    ['S1', 'S3']
  );

  const trcExists = evaluateTRCQuery('exists_s_grade', DEFAULT_DATASET, 'CSE');
  assert.deepEqual(
    trcExists.witnesses.filter((w) => w.satisfies).map((w) => w.sid),
    ['S1', 'S2', 'S3']
  );
});

test('Heuristic Query-Tree optimizer reduces intermediate tuples and KB across all 5 stages', () => {
  const stages = buildQueryTreeOptimizationStages('model_q8');
  assert.equal(stages.length, 5);
  assert.ok(stages[0].totalIntermediateTuples > 1_000_000_000);
  assert.ok(stages[2].totalIntermediateTuples < stages[0].totalIntermediateTuples);
  assert.ok(stages[3].totalIntermediateTuples < stages[2].totalIntermediateTuples);
  assert.ok(stages[3].reductionVsStage1Pct > 99.9);
  assert.ok(stages[4].totalIntermediateKB < stages[3].totalIntermediateKB);

  const elmasriStages = buildQueryTreeOptimizationStages('a1_q6_elmasri');
  assert.equal(elmasriStages.length, 5);
  assert.ok(elmasriStages[4].totalIntermediateKB < elmasriStages[3].totalIntermediateKB);
});
