import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES } from '../data/bacse202Data';
import {
  A1_TO_A2_SHIFT_PATTERNS,
  ALPHA_D2_BLUEPRINT,
  BETA_D2_BLUEPRINT,
  buildTopicPredictionMatrix,
  computePredictionStats,
  filterPredictionMatrix,
} from './predictionEngine';

test('buildTopicPredictionMatrix returns all 30 syllabus topics in exact Module 1 -> Module 5 order', () => {
  const matrix = buildTopicPredictionMatrix();
  const expectedIds = MODULES.flatMap((m) => m.topics.map((t) => t.id));
  assert.equal(matrix.length, 30);
  assert.deepEqual(
    matrix.map((e) => e.topicId),
    expectedIds
  );

  matrix.forEach((entry, idx) => {
    assert.equal(entry.topicOrder, idx + 1);
    assert.ok(entry.d1TestedDetail.trim().length > 10, `Missing d1TestedDetail on ${entry.topicId}`);
    assert.ok(entry.d1UntestedGap.trim().length > 10, `Missing d1UntestedGap on ${entry.topicId}`);

    if (entry.d1Status === 'untested') {
      assert.equal(entry.d1Refs.length, 0, `Untested topic ${entry.topicId} should have no d1Refs`);
      assert.ok(
        entry.d2QuestionTypes.length >= 2,
        `Untested topic ${entry.topicId} should provide >=2 likely D2 question types`
      );
    } else {
      assert.ok(
        entry.d1Refs.length >= 1,
        `Tested/partial topic ${entry.topicId} must cite exact D1 reference(s)`
      );
    }

    for (const vl of entry.velloreLinks) {
      assert.ok(vl.option.promptIntro.trim().length > 15, `Missing promptIntro for ${vl.id}`);
      assert.ok(vl.option.subQuestions.length >= 1, `Missing subQuestions for ${vl.id}`);
      assert.ok(vl.option.solutionSteps.length >= 1, `Missing solutionSteps for ${vl.id}`);
    }
  });
});

test('computePredictionStats and filterPredictionMatrix partition all 30 topics accurately', () => {
  const matrix = buildTopicPredictionMatrix();
  const stats = computePredictionStats(matrix);

  assert.equal(stats.totalTopics, 30);
  assert.equal(stats.untestedInD1 + stats.partialInD1 + stats.testedInD1, 30);
  assert.equal(stats.untestedInD1, 16);
  assert.equal(stats.partialInD1, 6);
  assert.equal(stats.testedInD1, 8);
  assert.ok(stats.untestedWithVelloreProof >= 9, `Expected >=9 D1-untested topics with A1/A2 proof, got ${stats.untestedWithVelloreProof}`);

  assert.equal(filterPredictionMatrix(matrix, 'all', 'all').length, 30);
  assert.equal(filterPredictionMatrix(matrix, 'untested', 'all').length, stats.untestedInD1);
  assert.equal(
    filterPredictionMatrix(matrix, 'untested_with_vellore', 'all').length,
    stats.untestedWithVelloreProof
  );
  assert.equal(filterPredictionMatrix(matrix, 'partial', 'all').length, stats.partialInD1);
  assert.equal(filterPredictionMatrix(matrix, 'tested', 'all').length, stats.testedInD1);
  assert.equal(filterPredictionMatrix(matrix, 'all', 'm1').length, 6);
  assert.equal(filterPredictionMatrix(matrix, 'all', 'm5').length, 6);
});

test('Alpha D2 and Beta D2 blueprints strictly match VIT Chennai 100M format (7x10M + 2x15M = 100M) with valid syllabus topic IDs', () => {
  const validTopicIds = new Set(MODULES.flatMap((m) => m.topics.map((t) => t.id)));

  for (const [label, blueprint] of [
    ['ALPHA_D2_BLUEPRINT', ALPHA_D2_BLUEPRINT],
    ['BETA_D2_BLUEPRINT', BETA_D2_BLUEPRINT],
  ] as const) {
    assert.equal(blueprint.length, 9, `${label} must have 9 questions (Q1..Q9)`);
    assert.equal(
      blueprint.reduce((sum, q) => sum + q.marks, 0),
      100,
      `${label} must total 100 marks`
    );

    blueprint.forEach((q, idx) => {
      assert.equal(q.qNo, `Q${idx + 1}`, `${label} must be ordered Q1..Q9`);
      assert.equal(q.marks, idx < 7 ? 10 : 15, `${label} ${q.qNo} must match 7x10M + 2x15M`);
      const subSum = q.subQuestions.reduce((s, sq) => s + sq.marks, 0);
      assert.equal(subSum, q.marks, `${label} ${q.qNo} subQuestions must sum to ${q.marks}`);
      assert.ok(q.targetTopicIds.length >= 1, `${label} ${q.qNo} needs targetTopicIds`);
      for (const tid of q.targetTopicIds) {
        assert.ok(validTopicIds.has(tid), `${label} ${q.qNo} invalid topicId ${tid}`);
      }
      if (label === 'BETA_D2_BLUEPRINT') {
        assert.ok(
          q.betaMechanism === 'Sibling Rotation' || q.betaMechanism === 'Anchor Repeat',
          `Beta ${q.qNo} must declare betaMechanism`
        );
        assert.ok(q.a1a2Precedent && q.a1a2Precedent.length > 10, `Beta ${q.qNo} must cite A1->A2 precedent`);
      }
    });
  }

  // Empirical A1 -> A2 shift proof table covers all 5 modules
  assert.ok(A1_TO_A2_SHIFT_PATTERNS.length >= 6);
  const coveredModules = new Set(A1_TO_A2_SHIFT_PATTERNS.map((p) => p.moduleId));
  assert.deepEqual([...coveredModules].sort(), ['m1', 'm2', 'm3', 'm4', 'm5']);
});
