import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getModuleRefresher,
  getModuleStandingQuestions,
  MODULE_REFRESHERS,
  STANDING_QUESTIONS,
} from '../data/standingData';
import { MODULES } from '../data/bacse202Data';
import {
  calculateAggregateStanding,
  calculateModuleStanding,
  computeRadarPoint,
  computeRadarPolygonPath,
  getPrescriptiveRecommendation,
  getStandingGrade,
  MODULE_ORDER,
  recordWeakTopicWrong,
  toggleWeakTopicResolved,
  WeakTopicEntry,
} from './standingEngine';

test('STANDING_QUESTIONS has exactly 150 unique syllabus questions (30 per module, 10 per tier) matching exact ID format', () => {
  assert.equal(STANDING_QUESTIONS.length, 150);

  const idRe = /^s_m([1-5])_([fan])_(0[1-9]|10)$/;
  const seenIds = new Set<string>();
  const tierCodeMap = { foundation: 'f', application: 'a', analysis: 'n' } as const;

  for (const q of STANDING_QUESTIONS) {
    assert.equal(seenIds.has(q.id), false, `Duplicate ID: ${q.id}`);
    seenIds.add(q.id);

    const m = q.id.match(idRe);
    assert.ok(m, `ID ${q.id} does not match s_m{1-5}_{f|a|n}_{01-10}`);
    assert.equal(`m${m[1]}`, q.moduleId, `ID module mismatch on ${q.id}`);
    assert.equal(m[2], tierCodeMap[q.tier], `ID tier mismatch on ${q.id}`);

    assert.equal(q.options.length, 4, `Expected 4 options on ${q.id}`);
    assert.equal(new Set(q.options.map((o) => o.trim())).size, 4, `Duplicate option on ${q.id}`);
    assert.ok(
      Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4,
      `Invalid correctIndex on ${q.id}`
    );
    assert.ok(q.prompt.trim().length >= 20, `Prompt too short on ${q.id}`);
    assert.ok(q.explanation.trim().length >= 40, `Explanation too short on ${q.id}`);
  }

  for (const modId of MODULE_ORDER) {
    const modQs = getModuleStandingQuestions(modId);
    assert.equal(modQs.length, 30, `Expected 30 questions for ${modId}`);
    assert.equal(modQs.filter((q) => q.tier === 'foundation').length, 10);
    assert.equal(modQs.filter((q) => q.tier === 'application').length, 10);
    assert.equal(modQs.filter((q) => q.tier === 'analysis').length, 10);
    // Ordering check: first 10 foundation, next 10 application, last 10 analysis
    assert.ok(modQs.slice(0, 10).every((q) => q.tier === 'foundation'));
    assert.ok(modQs.slice(10, 20).every((q) => q.tier === 'application'));
    assert.ok(modQs.slice(20, 30).every((q) => q.tier === 'analysis'));
  }
});

test('MODULE_REFRESHERS cover all 5 modules with 8-12 bullets, 3 worked examples, and formulas reused from MODULES', () => {
  assert.equal(MODULE_REFRESHERS.length, 5);
  for (const mod of MODULES) {
    const ref = getModuleRefresher(mod.id);
    assert.ok(
      ref.conceptBullets.length >= 8 && ref.conceptBullets.length <= 12,
      `${mod.id} bullets out of 8-12 range: ${ref.conceptBullets.length}`
    );
    assert.equal(ref.workedExamples.length, 3, `${mod.id} must have 3 worked examples`);
    assert.deepEqual(
      ref.keyFormulas,
      mod.keyFormulasAndRules,
      `${mod.id} refresher must reuse MODULES[].keyFormulasAndRules`
    );
    assert.ok(mod.recommendedLab, `${mod.id} must have a recommendedLab defined`);
  }
});

test('getStandingGrade and getPrescriptiveRecommendation enforce exact score thresholds', () => {
  assert.equal(getStandingGrade(30), 'A');
  assert.equal(getStandingGrade(25), 'A');
  assert.equal(getStandingGrade(24), 'B');
  assert.equal(getStandingGrade(18), 'B');
  assert.equal(getStandingGrade(17), 'C');
  assert.equal(getStandingGrade(10), 'C');
  assert.equal(getStandingGrade(9), 'D');
  assert.equal(getStandingGrade(0), 'D');

  assert.equal(
    getPrescriptiveRecommendation({ foundation: 6, application: 9, analysis: 9 }).headline,
    'Re-read the module notes first before attempting problems'
  );
  assert.equal(
    getPrescriptiveRecommendation({ foundation: 7, application: 5, analysis: 8 }).headline,
    'You know the theory — focus on Interactive Labs for hands-on practice'
  );
  assert.equal(
    getPrescriptiveRecommendation({ foundation: 8, application: 6, analysis: 5 }).headline,
    'Solid base — do FAT Mock Part B questions for multi-step reasoning'
  );
  assert.equal(
    getPrescriptiveRecommendation({ foundation: 8, application: 7, analysis: 7 }).headline,
    "You're exam-ready on this module! 🎯"
  );
});

test('calculateModuleStanding and calculateAggregateStanding compute tier breakdowns, radar threshold, and 4 verdict bands', () => {
  const m1Qs = getModuleStandingQuestions('m1');
  const answers: Record<string, number> = {};
  // Score: 9 Foundation, 6 Application, 4 Analysis = 19/30 (Grade B), 11 wrong
  m1Qs.forEach((q, idx) => {
    const inTierIdx = idx % 10;
    const shouldBeCorrect =
      (q.tier === 'foundation' && inTierIdx < 9) ||
      (q.tier === 'application' && inTierIdx < 6) ||
      (q.tier === 'analysis' && inTierIdx < 4);
    answers[q.id] = shouldBeCorrect ? q.correctIndex : (q.correctIndex + 1) % 4;
  });

  const breakdown = calculateModuleStanding('m1', m1Qs, answers);
  assert.equal(breakdown.foundation, 9);
  assert.equal(breakdown.application, 6);
  assert.equal(breakdown.analysis, 4);
  assert.equal(breakdown.total, 19);
  assert.equal(breakdown.grade, 'B');
  assert.equal(breakdown.wrongQuestionIds.length, 11);

  const oneAssessed = calculateAggregateStanding({
    m1: { foundation: 9, application: 6, analysis: 4, completedAt: '2026-11-20T00:00:00Z' },
  });
  assert.equal(oneAssessed.assessedCount, 1);
  assert.equal(oneAssessed.showRadar, false);
  assert.equal(oneAssessed.totalScore, 19);
  assert.equal(oneAssessed.verdict, 'Start from Module 1 notes and work through sequentially');

  const twoAssessed = calculateAggregateStanding({
    m1: { foundation: 9, application: 8, analysis: 7, completedAt: '2026-11-20T00:00:00Z' },
    m2: { foundation: 8, application: 7, analysis: 6, completedAt: '2026-11-20T00:00:00Z' },
  });
  assert.equal(twoAssessed.showRadar, true);
  assert.equal(twoAssessed.totalScore, 45);
  assert.equal(twoAssessed.verdict, 'Gaps to fill — follow the 48h sprint plan closely');

  const decent = calculateAggregateStanding({
    m1: { foundation: 10, application: 9, analysis: 8, completedAt: '2026-11-20T00:00:00Z' },
    m2: { foundation: 10, application: 9, analysis: 8, completedAt: '2026-11-20T00:00:00Z' },
    m3: { foundation: 10, application: 9, analysis: 8, completedAt: '2026-11-20T00:00:00Z' },
  });
  assert.equal(decent.totalScore, 81);
  assert.equal(decent.verdict, 'Decent base — targeted study will get you to 90+');

  const strong = calculateAggregateStanding({
    m1: { foundation: 9, application: 8, analysis: 8, completedAt: '2026-11-20T00:00:00Z' },
    m2: { foundation: 9, application: 8, analysis: 8, completedAt: '2026-11-20T00:00:00Z' },
    m3: { foundation: 9, application: 8, analysis: 8, completedAt: '2026-11-20T00:00:00Z' },
    m4: { foundation: 9, application: 8, analysis: 8, completedAt: '2026-11-20T00:00:00Z' },
    m5: { foundation: 8, application: 8, analysis: 8, completedAt: '2026-11-20T00:00:00Z' },
  });
  assert.equal(strong.totalScore, 124);
  assert.equal(strong.verdict, "Strong standing — focus on weak spots and you'll ace it");
});

test('recordWeakTopicWrong deduplicates by questionId, increments wrongCount on retake, and toggleWeakTopicResolved updates state', () => {
  let list: WeakTopicEntry[] = [];
  list = recordWeakTopicWrong(
    list,
    {
      questionId: 's_m2_n_03',
      moduleId: 'm2',
      tier: 'analysis',
      source: 'standing',
      prompt: 'Why is TEACHING in 3NF but not BCNF?',
    },
    '2026-11-20T10:00:00Z'
  );
  assert.equal(list.length, 1);
  assert.equal(list[0].wrongCount, 1);
  assert.equal(list[0].resolved, false);
  assert.equal(list[0].source, 'standing');

  // Resolve it
  list = toggleWeakTopicResolved(list, 's_m2_n_03', '2026-11-20T11:00:00Z');
  assert.equal(list[0].resolved, true);
  assert.equal(list[0].lastReviewedAt, '2026-11-20T11:00:00Z');

  // Miss same question again on retake -> increments wrongCount, reopens resolved=false, no duplicate
  list = recordWeakTopicWrong(
    list,
    {
      questionId: 's_m2_n_03',
      moduleId: 'm2',
      tier: 'analysis',
      source: 'standing',
      prompt: 'Why is TEACHING in 3NF but not BCNF?',
    },
    '2026-11-20T12:00:00Z'
  );
  assert.equal(list.length, 1);
  assert.equal(list[0].wrongCount, 2);
  assert.equal(list[0].resolved, false);
  assert.equal(list[0].lastWrongAt, '2026-11-20T12:00:00Z');
});

test('computeRadarPoint and computeRadarPolygonPath produce valid 5-axis SVG coordinates', () => {
  const top = computeRadarPoint(0, 5, 1, 100, 170, 170);
  assert.equal(top.x, 170);
  assert.equal(top.y, 70);

  const path = computeRadarPolygonPath([10, 8, 6, 4, 2], 100, 170, 170);
  assert.ok(path.startsWith('M170,70 L'));
  assert.ok(path.endsWith(' Z'));
});
