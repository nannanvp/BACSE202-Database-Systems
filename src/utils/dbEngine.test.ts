import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAttributes,
  parseFDs,
  computeClosure,
  findCandidateKeys,
  analyzeNormalForms,
  computeMinimalCover,
  parseSchedule,
  analyzeSchedule,
  buildBPlusTree,
  simulateBPlusOperations,
  traceBPlusSearch,
  calculateSprintStats,
  calculateTopicMasteryStats,
  simulateTimestampOrdering,
  parseWalLog,
  simulateLogRecovery,
  simulateExtendibleHashing,
  simulateLinearHashing,
  calculateMultilevelIndexMetrics,
  synthesize3NF,
  decomposeBCNF,
  runChaseLosslessTest,
} from './dbEngine';
import { FAT_QUESTIONS, MODULES } from '../data/bacse202Data';
import { TOPIC_NOTES } from '../data/topicNotes';
import {
  A1_TA1_PAPER,
  A2_TA2_PAPER,
  GENERATED_SLOT_PAPER,
  OFFICIAL_MODEL_PAPER,
  SLOT_PAPER_FORENSICS,
} from '../data/slotPaperAnalysis';

test('FD closure and candidate key detection', () => {
  const attrs = parseAttributes('A, B, C, D, E');
  const parsed = parseFDs('A -> BC; CD -> E; B -> D; E -> A', attrs);
  assert.equal(parsed.error, undefined);

  const { closure } = computeClosure(['A'], parsed.fds);
  assert.deepEqual(closure, ['A', 'B', 'C', 'D', 'E']);

  const keys = findCandidateKeys(attrs, parsed.fds);
  const keyStrings = keys.map((k) => k.join(''));
  assert.ok(keyStrings.includes('A'));
  assert.ok(keyStrings.includes('E'));
  assert.ok(keyStrings.includes('BC'));
});

test('Normal form classification: detects 1NF partial dependency, 2NF transitive, 3NF non-superkey, and BCNF', () => {
  // Partial dependency -> 1NF
  const attrs1 = parseAttributes('A, B, C, D');
  const fds1 = parseFDs('AB -> C, B -> D', attrs1).fds;
  const res1 = analyzeNormalForms(attrs1, fds1);
  assert.equal(res1.highestNormalForm, '1NF');
  assert.ok(res1.violations.some((v) => v.normalForm === '2NF'));

  // Transitive dependency -> 2NF
  const attrs2 = parseAttributes('A, B, C');
  const fds2 = parseFDs('A -> B, B -> C', attrs2).fds;
  const res2 = analyzeNormalForms(attrs2, fds2);
  assert.equal(res2.highestNormalForm, '2NF');

  // 3NF but not BCNF (AB -> C, C -> B)
  const attrs3 = parseAttributes('A, B, C');
  const fds3 = parseFDs('AB -> C, C -> B', attrs3).fds;
  const res3 = analyzeNormalForms(attrs3, fds3);
  assert.equal(res3.highestNormalForm, '3NF');

  // BCNF
  const attrs4 = parseAttributes('A, B, C');
  const fds4 = parseFDs('A -> BC', attrs4).fds;
  const res4 = analyzeNormalForms(attrs4, fds4);
  assert.equal(res4.highestNormalForm, 'BCNF');
});

test('Minimal cover removes redundant FDs and extraneous attributes', () => {
  const attrs = parseAttributes('A, B, C');
  const fds = parseFDs('A -> BC, B -> C, A -> B, AB -> C', attrs).fds;
  const min = computeMinimalCover(fds).map((f) => f.raw);
  assert.deepEqual(min.sort(), ['A -> B', 'B -> C']);
});

test('Schedule analyzer detects conflict serializable schedule, topological order, and strictness', () => {
  const strictSched = parseSchedule('R1(X) W1(X) C1 R2(X) W2(X) C2');
  assert.equal(strictSched.error, undefined);
  const strictAnalysis = analyzeSchedule(strictSched.ops);
  assert.equal(strictAnalysis.isConflictSerializable, true);
  assert.equal(strictAnalysis.cycle, null);
  assert.deepEqual(strictAnalysis.serialOrder, ['T1', 'T2']);
  assert.equal(strictAnalysis.isStrict, true);
  assert.equal(strictAnalysis.isCascadeless, true);
  assert.equal(strictAnalysis.isRecoverable, true);

  const recOnly = parseSchedule('R1(X) W1(X) R2(X) W2(X) C1 C2');
  const recAnalysis = analyzeSchedule(recOnly.ops);
  assert.equal(recAnalysis.isConflictSerializable, true);
  assert.equal(recAnalysis.isRecoverable, true);
  assert.equal(recAnalysis.isCascadeless, false);
  assert.equal(recAnalysis.isStrict, false);
});

test('Schedule analyzer detects cycle in non-serializable schedule and dirty read non-recoverability', () => {
  const parsed = parseSchedule('R1(X) R2(X) W1(X) W2(X)');
  const analysis = analyzeSchedule(parsed.ops);
  assert.equal(analysis.isConflictSerializable, false);
  assert.ok(analysis.cycle !== null && analysis.cycle.length >= 3);

  const dirty = parseSchedule('W1(X) R2(X) C2 C1');
  const dirtyAnalysis = analyzeSchedule(dirty.ops);
  assert.equal(dirtyAnalysis.isRecoverable, false);
  assert.equal(dirtyAnalysis.isCascadeless, false);
});

test('B+ tree insertion and search trace locate inserted keys accurately', () => {
  const tree = buildBPlusTree([10, 20, 5, 15, 25, 30, 35], 3);
  assert.equal(tree.isLeaf, false);

  const hit = traceBPlusSearch(tree, 25);
  assert.equal(hit.found, true);
  assert.ok(hit.steps.length >= 2);

  const miss = traceBPlusSearch(tree, 99);
  assert.equal(miss.found, false);

  // Verify A1+TA1 Q5(b) (order 3) exact structure after [10,20,5,15,25,30,2]
  const a1q5b = buildBPlusTree([10, 20, 5, 15, 25, 30, 2], 3);
  assert.deepEqual(a1q5b.keys, [15]);
  assert.deepEqual(a1q5b.children[0].keys, [10]);
  assert.deepEqual(a1q5b.children[1].keys, [20, 25]);
  assert.deepEqual(a1q5b.children[0].children.map((l) => l.keys), [[2, 5], [10]]);
  assert.deepEqual(a1q5b.children[1].children.map((l) => l.keys), [[15], [20], [25, 30]]);

  // Verify Official Model QP Q6(a) (order 4) exact structure after 15 insertions
  const modelQ6a = buildBPlusTree([24, 45, 11, 89, 55, 67, 49, 38, 7, 23, 12, 78, 97, 36, 21], 4);
  assert.deepEqual(modelQ6a.keys, [45]);
  assert.deepEqual(modelQ6a.children[0].keys, [12, 24]);
  assert.deepEqual(modelQ6a.children[1].keys, [67, 89]);
  assert.deepEqual(modelQ6a.children[0].children.map((l) => l.keys), [[7, 11], [12, 21, 23], [24, 36, 38]]);
  assert.deepEqual(modelQ6a.children[1].children.map((l) => l.keys), [[45, 49, 55], [67, 78], [89, 97]]);
});

test('Sprint progress stats calculate completion accurately', () => {
  const stats = calculateSprintStats(
    [
      { id: 'b1', day: 'Nov 21', syllabusHours: 7 },
      { id: 'b2', day: 'Nov 22', syllabusHours: 10 },
    ],
    ['b1']
  );
  assert.equal(stats.completedCount, 1);
  assert.equal(stats.totalCount, 2);
  assert.equal(stats.completedHours, 7);
  assert.equal(stats.totalHours, 17);
  assert.equal(stats.percentComplete, 50);
});

test('Every BACSE202 syllabus topic across Modules 1-5 has complete study notes', () => {
  const allTopics = MODULES.flatMap((m) => m.topics);
  assert.equal(allTopics.length, 30);
  for (const topic of allTopics) {
    const note = TOPIC_NOTES[topic.id];
    assert.ok(note, `Missing note for ${topic.id} (${topic.title})`);
    assert.ok(note.summary.length > 20, `Summary too short for ${topic.id}`);
    assert.ok(note.keyPoints.length >= 2, `Need >=2 key points for ${topic.id}`);
    assert.ok(note.exampleBody.length > 10, `Missing example for ${topic.id}`);
    assert.ok(note.examTip.length > 10, `Missing exam tip for ${topic.id}`);
    assert.ok(note.sourceDecks.length >= 1, `Missing sourceDecks attribution for ${topic.id}`);
  }
});

test('Slot paper forensics cover all 3 official papers (A1+TA1, A2+TA2, MODEL_QP = 100M each) and both 100M papers match 10x10=100M blueprint', () => {
  const a1Items = SLOT_PAPER_FORENSICS.filter((i) => i.slot === 'A1+TA1');
  const a2Items = SLOT_PAPER_FORENSICS.filter((i) => i.slot === 'A2+TA2');
  const modelItems = SLOT_PAPER_FORENSICS.filter((i) => i.slot === 'MODEL_QP');
  assert.equal(a1Items.length, 10);
  assert.equal(a2Items.length, 10);
  assert.equal(modelItems.length, 10);
  assert.equal(a1Items.reduce((s, i) => s + i.marks, 0), 100);
  assert.equal(a2Items.reduce((s, i) => s + i.marks, 0), 100);
  assert.equal(modelItems.reduce((s, i) => s + i.marks, 0), 100);

  for (const paper of [OFFICIAL_MODEL_PAPER, GENERATED_SLOT_PAPER]) {
    assert.equal(paper.length, 10);
    const totalPaperMarks = paper.reduce((s, q) => s + q.marks, 0);
    assert.equal(totalPaperMarks, 100);

    for (const q of paper) {
      const primarySum = q.primary.subQuestions.reduce((s, sq) => s + sq.marks, 0);
      assert.equal(primarySum, 10, `Primary sub-marks mismatch on ${q.qNo}`);
      assert.ok(q.primary.solutionSteps.length >= 1, `Missing solution on ${q.qNo}`);
      if (q.orOption) {
        const orSum = q.orOption.subQuestions.reduce((s, sq) => s + sq.marks, 0);
        assert.equal(orSum, 10, `OR option sub-marks mismatch on ${q.qNo}`);
        assert.ok(q.orOption.solutionSteps.length >= 1, `Missing OR solution on ${q.qNo}`);
      }
    }
  }

  // Verify Q4 COURSE_OFFERING normalization solution mathematically
  const attrs = parseAttributes('Course_Code, Semester, Faculty_ID, Faculty_Name, Faculty_Dept, Dept_Building, Classroom_No, Capacity, Enrolled_Count');
  const fds = parseFDs(
    'Course_Code Semester -> Faculty_ID Classroom_No Enrolled_Count; Faculty_ID -> Faculty_Name Faculty_Dept; Faculty_Dept -> Dept_Building; Classroom_No -> Capacity',
    attrs
  ).fds;
  const nf = analyzeNormalForms(attrs, fds);
  assert.equal(nf.highestNormalForm, '2NF');
  assert.equal(nf.candidateKeys.length, 1);

  // Verify Q7 S1 and S2 schedule analysis solutions mathematically
  const q7s1 = analyzeSchedule(parseSchedule('R1(A) W1(A) R2(B) W2(B) R3(A) R2(A) W3(A) C1 C3 C2').ops);
  assert.equal(q7s1.isConflictSerializable, true);
  assert.deepEqual(q7s1.serialOrder, ['T1', 'T2', 'T3']);
  assert.equal(q7s1.isRecoverable, true);
  assert.equal(q7s1.isCascadeless, false);

  const q7s2 = analyzeSchedule(parseSchedule('R1(X) W1(X) R2(X) W2(X) R3(Y) W2(Y) R1(Y) W3(Y) W1(Y) C1 C2 C3').ops);
  assert.equal(q7s2.isConflictSerializable, false);
  assert.equal(q7s2.isRecoverable, false);
});

test('Module 5 enhanced notes include deep study sections, A1/A2 + Official Model QP Q10 solving methods, and >=16 valid self-check MCQs across all 6 topics', () => {
  const m5 = MODULES.find((m) => m.id === 'm5');
  assert.ok(m5, 'Module 5 missing');
  assert.equal(m5.topics.length, 6);

  let totalSelfChecks = 0;
  for (const t of m5.topics) {
    const note = TOPIC_NOTES[t.id];
    assert.ok(note.deepDiveSections && note.deepDiveSections.length >= 2, `Need deepDiveSections for ${t.id}`);
    assert.ok(note.fatQuestionMethods && note.fatQuestionMethods.length >= 1, `Need fatQuestionMethods for ${t.id}`);
    assert.ok(note.selfChecks && note.selfChecks.length >= 2, `Expected >=2 selfChecks for ${t.id}`);
    for (const sc of note.selfChecks ?? []) {
      totalSelfChecks += 1;
      assert.ok(sc.options.length >= 2);
      assert.ok(sc.correctIndex >= 0 && sc.correctIndex < sc.options.length);
      assert.ok(sc.explanation.length > 10);
    }
  }
  assert.equal(totalSelfChecks, 17, 'Expected 17 revision MCQs across Module 5 topics');

  // Verify A1+TA1 Q9, A1+TA1 Q10, A2+TA2 Q7, A2+TA2 Q8, and Official Model QP Q10(a)/(b) mapped to exact topics
  assert.ok(TOPIC_NOTES['m5-t1'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q9')));
  assert.ok(TOPIC_NOTES['m5-t2'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q9')));
  assert.ok(TOPIC_NOTES['m5-t4'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q10')));
  assert.ok(TOPIC_NOTES['m5-t4'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q7')));
  assert.ok(TOPIC_NOTES['m5-t4'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q10(a)')));
  assert.ok(TOPIC_NOTES['m5-t6'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q8')));
  assert.ok(TOPIC_NOTES['m5-t6'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q10(b)')));

  // Verify zero raw HTML tags (<u>, <br>, <i>) leak into Module 5 rendered note text
  const RAW_HTML_RE = /<\/?(?:u|br|i|b|p|div|span)\b[^>]*>/i;
  for (const t of m5.topics) {
    const note = TOPIC_NOTES[t.id];
    assert.equal(RAW_HTML_RE.test(note.summary), false, `Raw HTML in ${t.id} summary`);
    assert.equal(RAW_HTML_RE.test(note.exampleBody), false, `Raw HTML in ${t.id} exampleBody`);
    note.deepDiveSections?.forEach((s, i) => {
      assert.equal(RAW_HTML_RE.test(s.markdownBlock ?? ''), false, `Raw HTML in ${t.id} sec[${i}]`);
    });
    note.fatQuestionMethods?.forEach((f, i) => {
      assert.equal(RAW_HTML_RE.test(f.solvingMethod.join('\n')), false, `Raw HTML in ${t.id} fat[${i}]`);
    });
  }

  // Verify Module 5 FAT MCQs (existing q17-q20 + extended m5_q5..m5_q19)
  const m5FatMcqs = FAT_QUESTIONS.filter((q) => q.moduleId === 'm5');
  assert.ok(m5FatMcqs.length >= 19, `Expected >=19 M5 FAT MCQs, got ${m5FatMcqs.length}`);
  for (const q of m5FatMcqs) {
    assert.ok(q.options.length === 4);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
    assert.ok(q.explanation.length > 15);
  }
});

test('Module 4 enhanced notes include deep sections, A1/A2 + Official Model QP Q5/Q7/Q9 solving methods, 12 self-check MCQs, and verified FAT & abort schedule solutions', () => {
  const m4 = MODULES.find((m) => m.id === 'm4');
  assert.ok(m4, 'Module 4 missing');
  assert.equal(m4.topics.length, 6);

  let totalSelfChecks = 0;
  for (const t of m4.topics) {
    const note = TOPIC_NOTES[t.id];
    assert.ok(note.deepDiveSections && note.deepDiveSections.length >= 2, `Need deepDiveSections for ${t.id}`);
    assert.ok(note.fatQuestionMethods && note.fatQuestionMethods.length >= 1, `Need fatQuestionMethods for ${t.id}`);
    assert.ok(note.selfChecks && note.selfChecks.length >= 2, `Expected >=2 selfChecks for ${t.id}`);
    for (const sc of note.selfChecks ?? []) {
      totalSelfChecks += 1;
      assert.ok(sc.options.length >= 2);
      assert.ok(sc.correctIndex >= 0 && sc.correctIndex < sc.options.length);
      assert.ok(sc.explanation.length > 10);
    }
  }
  assert.equal(totalSelfChecks, 12, 'Expected 12 revision MCQs across Module 4 topics');

  // Verify A1+TA1 Q7, A1+TA1 Q8(a), A1+TA1 Q8(b), A2+TA2 Q5(a), A2+TA2 Q5(b), A2+TA2 Q6, and Model QP Q5/Q7/Q9 mappings
  assert.ok(TOPIC_NOTES['m4-t1'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q5(a)')));
  assert.ok(TOPIC_NOTES['m4-t2'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q8(a)')));
  assert.ok(TOPIC_NOTES['m4-t2'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q7')));
  assert.ok(TOPIC_NOTES['m4-t3'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q7')));
  assert.ok(TOPIC_NOTES['m4-t3'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q5(b)')));
  assert.ok(TOPIC_NOTES['m4-t3'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q5(a) & Q5(b)')));
  assert.ok(TOPIC_NOTES['m4-t4'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q8(a)')));
  assert.ok(TOPIC_NOTES['m4-t4'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q6')));
  assert.ok(TOPIC_NOTES['m4-t4'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q7')));
  assert.ok(TOPIC_NOTES['m4-t5'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q9(a) & Q9(b)')));
  assert.ok(TOPIC_NOTES['m4-t6'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q8(b)')));

  // Mathematically verify Official Fall 2026-27 Model Question Paper Q5(a) schedule
  const modelQ5a = analyzeSchedule(
    parseSchedule('R1(A) R2(B) W1(B) R3(A) W2(A) R4(B) W3(C) W4(B) R2(C) C1 C2 C3 C4').ops
  );
  assert.equal(modelQ5a.isConflictSerializable, false);
  assert.ok(modelQ5a.cycle && modelQ5a.cycle.length >= 3);
  assert.equal(modelQ5a.uniqueEdges.length, 5);

  // Mathematically verify FAT A1+TA1 Q7 Wallet X/Y schedule
  const a1q7 = analyzeSchedule(parseSchedule('R1(X) W1(X) R2(X) W2(X) R1(Y) R2(Y) W1(Y) C1 C2').ops);
  assert.equal(a1q7.conflicts.length, 4);
  assert.equal(a1q7.isConflictSerializable, false);
  assert.equal(a1q7.isRecoverable, true);
  assert.equal(a1q7.isCascadeless, false);
  assert.equal(a1q7.isStrict, false);

  // Mathematically verify FAT A2+TA2 Q5(b) S1 and S2 schedules
  const a2q5s1 = analyzeSchedule(
    parseSchedule('R1(X) R2(Z) R1(Z) R3(X) R3(Y) W1(X) C1 W3(Y) C3 R2(Y) W2(Z) W2(Y) C2').ops
  );
  assert.equal(a2q5s1.isConflictSerializable, true);
  assert.deepEqual(a2q5s1.serialOrder, ['T3', 'T1', 'T2']);

  const a2q5s2 = analyzeSchedule(
    parseSchedule('R1(X) W1(X) R2(X) W2(X) R2(Y) W2(Y) R3(Y) W3(Y) R3(Z) W3(Z) R1(Z) W1(Z)').ops
  );
  assert.equal(a2q5s2.isConflictSerializable, false);
  assert.ok(a2q5s2.cycle && a2q5s2.cycle.length >= 4);

  // Verify Abort (A_i) semantics: abort-before-access stays Strict; commit after dirty read from aborted writer is Irrecoverable
  const abortBeforeRead = analyzeSchedule(parseSchedule('W1(X) A1 R2(X) W2(X) C2').ops);
  assert.equal(abortBeforeRead.isStrict, true);
  assert.equal(abortBeforeRead.isCascadeless, true);
  assert.equal(abortBeforeRead.isRecoverable, true);

  const commitDirtyAbortLater = analyzeSchedule(parseSchedule('W1(X) R2(X) C2 A1').ops);
  assert.equal(commitDirtyAbortLater.isRecoverable, false);
  assert.equal(commitDirtyAbortLater.isCascadeless, false);
  assert.equal(commitDirtyAbortLater.isStrict, false);
});

test('Module 3 enhanced notes include deep sections, A1/A2 + Official Model QP Q6/Q8 solving methods, >=12 self-check MCQs, and verified A2 Q4 index math', () => {
  const m3 = MODULES.find((m) => m.id === 'm3');
  assert.ok(m3, 'Module 3 missing');
  assert.equal(m3.topics.length, 6);

  let totalSelfChecks = 0;
  for (const t of m3.topics) {
    const note = TOPIC_NOTES[t.id];
    assert.ok(note.deepDiveSections && note.deepDiveSections.length >= 2, `Need deepDiveSections for ${t.id}`);
    assert.ok(note.fatQuestionMethods && note.fatQuestionMethods.length >= 1, `Need fatQuestionMethods for ${t.id}`);
    assert.ok(note.selfChecks && note.selfChecks.length >= 2, `Expected >=2 selfChecks for ${t.id}`);
    for (const sc of note.selfChecks ?? []) {
      totalSelfChecks += 1;
      assert.ok(sc.options.length >= 2);
      assert.ok(sc.correctIndex >= 0 && sc.correctIndex < sc.options.length);
      assert.ok(sc.explanation.length > 10);
    }
  }
  assert.equal(totalSelfChecks, 12, 'Expected 12 revision MCQs across Module 3 topics');

  // Verify A1+TA1 Q5(a), Q5(b), Q6, A2+TA2 Q4, Q10(a), Q10(b), and Official Model QP Q6 & Q8 mappings
  assert.ok(TOPIC_NOTES['m3-t2'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q5(a)')));
  assert.ok(TOPIC_NOTES['m3-t3'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q4')));
  assert.ok(TOPIC_NOTES['m3-t3'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q5(b)')));
  assert.ok(TOPIC_NOTES['m3-t3'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q10(a)')));
  assert.ok(TOPIC_NOTES['m3-t3'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q6(a) & Q6(b)')));
  assert.ok(TOPIC_NOTES['m3-t4'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q8(i)–(v)')));
  assert.ok(TOPIC_NOTES['m3-t6'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q6')));
  assert.ok(TOPIC_NOTES['m3-t6'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q10(b)')));

  // Mathematically verify FAT A2+TA2 Q4 STUDENT multilevel index figures
  const r = 16000;
  const B = 1000;
  const R = 80;
  const Ri = 4 + 6;
  const bfr = Math.floor(B / R);
  const dataBlocks = Math.ceil(r / bfr);
  const bfrIndex = Math.floor(B / Ri);
  const lvl1Blocks = Math.ceil(r / bfrIndex);
  const lvl2Blocks = Math.ceil(lvl1Blocks / bfrIndex);
  assert.equal(bfr, 12);
  assert.equal(dataBlocks, 1334);
  assert.equal(bfrIndex, 100);
  assert.equal(lvl1Blocks, 160);
  assert.equal(lvl2Blocks, 2);
});

test('Module 2 enhanced notes include deep sections, A1/A2 + Official Model QP Q1/Q3/Q4 solving methods, >=13 self-check MCQs, and verified FAT NF proofs', () => {
  const m2 = MODULES.find((m) => m.id === 'm2');
  assert.ok(m2, 'Module 2 missing');
  assert.equal(m2.topics.length, 6);

  let totalSelfChecks = 0;
  for (const t of m2.topics) {
    const note = TOPIC_NOTES[t.id];
    assert.ok(note.deepDiveSections && note.deepDiveSections.length >= 2, `Need deepDiveSections for ${t.id}`);
    assert.ok(note.fatQuestionMethods && note.fatQuestionMethods.length >= 1, `Need fatQuestionMethods for ${t.id}`);
    assert.ok(note.selfChecks && note.selfChecks.length >= 2, `Expected >=2 selfChecks for ${t.id}`);
    for (const sc of note.selfChecks ?? []) {
      totalSelfChecks += 1;
      assert.ok(sc.options.length >= 2);
      assert.ok(sc.correctIndex >= 0 && sc.correctIndex < sc.options.length);
      assert.ok(sc.explanation.length > 10);
    }
  }
  assert.equal(totalSelfChecks, 13, 'Expected 13 revision MCQs across Module 2 topics');

  // Verify A1+TA1 Q2(B), Q3, Q4, A2+TA2 Q3, Q9(a), Q9(b), and Official Model QP Q1, Q3, Q4 mappings
  assert.ok(TOPIC_NOTES['m2-t1'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q3')));
  assert.ok(TOPIC_NOTES['m2-t1'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q1')));
  assert.ok(TOPIC_NOTES['m2-t2'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q3')));
  assert.ok(TOPIC_NOTES['m2-t2'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q9(b)')));
  assert.ok(TOPIC_NOTES['m2-t3'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q4')));
  assert.ok(TOPIC_NOTES['m2-t4'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q2(B)')));
  assert.ok(TOPIC_NOTES['m2-t5'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q4')));
  assert.ok(TOPIC_NOTES['m2-t5'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q9(a)')));
  assert.ok(TOPIC_NOTES['m2-t5'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q3(a) & Q3(b)')));

  // Mathematically verify Official Fall 2026-27 Model Question Paper Q3 LIBRARY_ISSUE
  const modelQ3Attrs = parseAttributes(
    'IssueID, IssueDate, StudentID, StudentName, DeptID, DeptName, BookID, BookTitle, AuthorID, AuthorName, Publisher, QuantityIssued'
  );
  const modelQ3Fds = parseFDs(
    'IssueID -> IssueDate StudentID; StudentID -> StudentName DeptID; DeptID -> DeptName; BookID -> BookTitle AuthorID Publisher; AuthorID -> AuthorName; IssueID BookID -> QuantityIssued',
    modelQ3Attrs
  ).fds;
  const modelQ3Nf = analyzeNormalForms(modelQ3Attrs, modelQ3Fds);
  assert.equal(modelQ3Nf.candidateKeys.length, 1);
  assert.deepEqual(modelQ3Nf.candidateKeys[0], ['BOOKID', 'ISSUEID']);
  assert.equal(modelQ3Nf.highestNormalForm, '1NF');
  assert.ok(modelQ3Nf.violations.some((v) => v.normalForm === '2NF'));
  assert.ok(modelQ3Nf.violations.some((v) => v.normalForm === '3NF'));

  // Mathematically verify FAT A1+TA1 Q4 PATIENT_DIAGNOSIS
  const a1q4Attrs = parseAttributes(
    'Patient_ID, Appt_Date, Doctor_ID, Doctor_Name, Dept_Code, Dept_Head, Test_Name, Test_Result'
  );
  const a1q4Fds = parseFDs(
    'Patient_ID Appt_Date -> Doctor_ID; Doctor_ID -> Doctor_Name Dept_Code; Dept_Code -> Dept_Head; Patient_ID Appt_Date Test_Name -> Test_Result',
    a1q4Attrs
  ).fds;
  const a1q4Nf = analyzeNormalForms(a1q4Attrs, a1q4Fds);
  assert.equal(a1q4Nf.candidateKeys.length, 1);
  assert.deepEqual(a1q4Nf.candidateKeys[0], ['APPT_DATE', 'PATIENT_ID', 'TEST_NAME']);
  assert.equal(a1q4Nf.highestNormalForm, '1NF');
  assert.ok(a1q4Nf.violations.some((v) => v.normalForm === '2NF'));

  // Mathematically verify FAT A2+TA2 Q9(a) PROJECT_EVALUATION
  const a2q9aAttrs = parseAttributes(
    'Student_ID, Project_ID, Title, Guide_ID, Guide_Name, Department, Evaluation_Date, Marks'
  );
  const a2q9aFds = parseFDs(
    'Student_ID Project_ID -> Evaluation_Date Marks; Project_ID -> Title Guide_ID; Guide_ID -> Guide_Name Department',
    a2q9aAttrs
  ).fds;
  const a2q9aNf = analyzeNormalForms(a2q9aAttrs, a2q9aFds);
  assert.equal(a2q9aNf.candidateKeys.length, 1);
  assert.deepEqual(a2q9aNf.candidateKeys[0], ['PROJECT_ID', 'STUDENT_ID']);
  assert.equal(a2q9aNf.highestNormalForm, '1NF');
});

test('Module 1 enhanced notes include deep sections, A1/A2 + Official Model QP Q2 solving methods, and >=14 self-check MCQs', () => {
  const m1 = MODULES.find((m) => m.id === 'm1');
  assert.ok(m1, 'Module 1 missing');
  assert.equal(m1.topics.length, 6);

  let totalSelfChecks = 0;
  for (const t of m1.topics) {
    const note = TOPIC_NOTES[t.id];
    assert.ok(note.deepDiveSections && note.deepDiveSections.length >= 2, `Need deepDiveSections for ${t.id}`);
    assert.ok(note.fatQuestionMethods && note.fatQuestionMethods.length >= 1, `Need fatQuestionMethods for ${t.id}`);
    assert.ok(note.selfChecks && note.selfChecks.length >= 2, `Expected >=2 selfChecks for ${t.id}`);
    for (const sc of note.selfChecks ?? []) {
      totalSelfChecks += 1;
      assert.ok(sc.options.length >= 2);
      assert.ok(sc.correctIndex >= 0 && sc.correctIndex < sc.options.length);
      assert.ok(sc.explanation.length > 10);
    }
  }
  assert.equal(totalSelfChecks, 14, 'Expected 14 revision MCQs across Module 1 topics');

  // Verify A1+TA1 Q1, A1+TA1 Q2, A2+TA2 Q1, A2+TA2 Q2, and Official Model QP Q2(a) & Q2(b) mappings
  assert.ok(TOPIC_NOTES['m1-t3'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q1')));
  assert.ok(TOPIC_NOTES['m1-t3'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('Model Question Paper · Q2(a) & Q2(b)')));
  assert.ok(TOPIC_NOTES['m1-t4'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q1')));
  assert.ok(TOPIC_NOTES['m1-t6'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A1+TA1 · Q2')));
  assert.ok(TOPIC_NOTES['m1-t6'].fatQuestionMethods?.some((f) => f.sourcePaper.includes('A2+TA2 · Q2')));
});

test('All study notes across Modules 1-5 render cleanly via SVG diagrams or Markdown without raw ASCII box-art dumps', async () => {
  const { DIAGRAM_REGISTRY } = await import('../components/ConceptDiagrams');
  const registeredIds = new Set(Object.keys(DIAGRAM_REGISTRY));
  assert.equal(registeredIds.size, 32, 'Expected 32 registered concept SVGs');

  const ASCII_BOX_RE = /[┌┐└┘│─═║►▼▲◄╔╗╚╝╦╩╠╣╬⟪⟫]|\+-{2,}\+/;
  const usedIds = new Set<string>();

  for (const [tid, note] of Object.entries(TOPIC_NOTES)) {
    assert.equal(ASCII_BOX_RE.test(note.exampleBody), false, `${tid} exampleBody still contains ASCII box art`);
    if (note.exampleDiagramId) {
      assert.ok(registeredIds.has(note.exampleDiagramId), `Missing diagram ${note.exampleDiagramId} in ${tid}`);
      usedIds.add(note.exampleDiagramId);
    }

    note.deepDiveSections?.forEach((sec, idx) => {
      if (sec.diagramId) {
        assert.ok(registeredIds.has(sec.diagramId), `Missing diagram ${sec.diagramId} in ${tid} sec[${idx}]`);
        usedIds.add(sec.diagramId);
      }
      if (sec.codeOrDiagram) {
        assert.ok(sec.codeLanguage, `${tid} sec[${idx}] codeOrDiagram must declare codeLanguage`);
        assert.equal(ASCII_BOX_RE.test(sec.codeOrDiagram), false, `${tid} sec[${idx}] codeOrDiagram has ASCII box art`);
      }
      if (sec.markdownBlock) {
        assert.equal(ASCII_BOX_RE.test(sec.markdownBlock), false, `${tid} sec[${idx}] markdownBlock has ASCII box art`);
      }
    });

    note.fatQuestionMethods?.forEach((fm, idx) => {
      if (fm.codeBlock?.diagramId) {
        assert.ok(
          registeredIds.has(fm.codeBlock.diagramId),
          `Missing diagram ${fm.codeBlock.diagramId} in ${tid} fat[${idx}]`
        );
        usedIds.add(fm.codeBlock.diagramId);
      }
      if (fm.codeBlock?.content) {
        assert.equal(
          ASCII_BOX_RE.test(fm.codeBlock.content),
          false,
          `${tid} fat[${idx}] codeBlock.content still contains ASCII box art`
        );
      }
    });
  }

  assert.equal(usedIds.size, 32, 'Every registered SVG diagram should be actively referenced in TOPIC_NOTES');
});

test('simulateBPlusOperations accurately verifies Model QP Q6, A1+TA1 Q5(b), and A2+TA2 Q10(a) deletions & replay', () => {
  const collectLeaves = (root: ReturnType<typeof simulateBPlusOperations>['finalTree']): number[][] => {
    const leaves: ReturnType<typeof simulateBPlusOperations>['finalTree'][] = [];
    const dfs = (node: ReturnType<typeof simulateBPlusOperations>['finalTree']) => {
      if (node.isLeaf) {
        leaves.push(node);
        return;
      }
      for (const child of node.children) dfs(child);
    };
    dfs(root);
    for (let i = 0; i < leaves.length - 1; i++) {
      assert.equal(leaves[i].nextLeafId, leaves[i + 1].id, 'Leaf nextLeafId chain must stay contiguous');
    }
    return leaves.map((l) => l.keys);
  };

  // 1. Official Model QP Q6(a)/(b) (p = 4): 15 inserts then Delete 38, 12, 89
  const modelOps = [
    ...[24, 45, 11, 89, 55, 67, 49, 38, 7, 23, 12, 78, 97, 36, 21].map((key) => ({
      type: 'insert' as const,
      key,
    })),
    ...[38, 12, 89].map((key) => ({ type: 'delete' as const, key })),
  ];
  const modelSim = simulateBPlusOperations(modelOps, 4);
  assert.equal(modelSim.steps.length, 18);
  assert.deepEqual(modelSim.finalTree.keys, [45]);
  assert.deepEqual(modelSim.finalTree.children[0].keys, [21, 24]);
  assert.deepEqual(modelSim.finalTree.children[1].keys, [67]);
  assert.deepEqual(collectLeaves(modelSim.finalTree), [
    [7, 11],
    [21, 23],
    [24, 36],
    [45, 49, 55],
    [67, 78, 97],
  ]);
  for (const k of [7, 21, 24, 36, 45, 67, 97]) {
    assert.equal(traceBPlusSearch(modelSim.finalTree, k).found, true, `Expected ${k} in Model Q6 tree`);
  }
  for (const k of [38, 12, 89]) {
    assert.equal(traceBPlusSearch(modelSim.finalTree, k).found, false, `Expected ${k} deleted from Model Q6 tree`);
  }

  // 2. A1+TA1 Q5(b) (p = 3): inserts [10, 20, 5, 15, 25, 30, 2] then Delete 5, 20, 15
  const a1Ops = [
    ...[10, 20, 5, 15, 25, 30, 2].map((key) => ({ type: 'insert' as const, key })),
    ...[5, 20, 15].map((key) => ({ type: 'delete' as const, key })),
  ];
  const a1Sim = simulateBPlusOperations(a1Ops, 3);
  assert.equal(a1Sim.steps.length, 10);
  assert.deepEqual(a1Sim.finalTree.keys, [25]);
  assert.deepEqual(a1Sim.finalTree.children[0].keys, [10]);
  assert.deepEqual(a1Sim.finalTree.children[1].keys, [30]);
  assert.deepEqual(collectLeaves(a1Sim.finalTree), [[2], [10], [25], [30]]);

  // 3. A2+TA2 Q10(a) (p = 3): Ins 10,20,5,15,25 -> Del 10 (collapses height 3->2) -> Ins 30,35,40 -> Del 20
  const a2Ops = [
    ...[10, 20, 5, 15, 25].map((key) => ({ type: 'insert' as const, key })),
    { type: 'delete' as const, key: 10 },
    ...[30, 35, 40].map((key) => ({ type: 'insert' as const, key })),
    { type: 'delete' as const, key: 20 },
  ];
  const a2Sim = simulateBPlusOperations(a2Ops, 3);
  assert.equal(a2Sim.steps.length, 10);
  const afterDel10 = a2Sim.steps[5];
  assert.equal(afterDel10.height, 2, 'Delete 10 should collapse height from 3 to 2');
  assert.deepEqual(afterDel10.tree.keys, [15, 20]);
  assert.deepEqual(a2Sim.finalTree.keys, [30]);
  assert.deepEqual(a2Sim.finalTree.children[0].keys, [15, 20]);
  assert.deepEqual(a2Sim.finalTree.children[1].keys, [35]);
  assert.deepEqual(collectLeaves(a2Sim.finalTree), [[5], [15], [25], [30], [35, 40]]);
});

test('A1_TA1_PAPER, A2_TA2_PAPER, OFFICIAL_MODEL_PAPER, and GENERATED_SLOT_PAPER cover Q1-Q10 in exact order with topic tags and valid diagrams', async () => {
  const { DIAGRAM_REGISTRY } = await import('../components/ConceptDiagrams');
  const registeredIds = new Set(Object.keys(DIAGRAM_REGISTRY));
  const topicIds = new Set(Object.keys(TOPIC_NOTES));

  const papers = [
    { name: 'A1_TA1_PAPER', items: A1_TA1_PAPER },
    { name: 'A2_TA2_PAPER', items: A2_TA2_PAPER },
    { name: 'OFFICIAL_MODEL_PAPER', items: OFFICIAL_MODEL_PAPER },
    { name: 'GENERATED_SLOT_PAPER', items: GENERATED_SLOT_PAPER },
  ];

  for (const paper of papers) {
    assert.equal(paper.items.length, 10, `${paper.name} must have 10 questions`);
    const totalMarks = paper.items.reduce((sum, q) => sum + q.marks, 0);
    assert.equal(totalMarks, 100, `${paper.name} must total 100 marks`);

    paper.items.forEach((q, idx) => {
      assert.match(q.qNo, new RegExp(`^Q${idx + 1}(?:\\s|$)`), `${paper.name} must be ordered Q1..Q10 (got ${q.qNo})`);
      assert.ok(topicIds.has(q.topicId), `${paper.name} ${q.qNo} invalid topicId ${q.topicId}`);
      assert.ok(q.topicTitle.trim().length > 0, `${paper.name} ${q.qNo} missing topicTitle`);

      const primarySum = q.primary.subQuestions.reduce((s, sq) => s + sq.marks, 0);
      assert.equal(primarySum, 10, `${paper.name} ${q.qNo} primary subQuestions must sum to 10`);
      assert.ok(q.primary.solutionSteps.length >= 1, `${paper.name} ${q.qNo} primary missing solutionSteps`);
      if (q.primary.diagramId) {
        assert.ok(
          registeredIds.has(q.primary.diagramId),
          `${paper.name} ${q.qNo} primary invalid diagramId ${q.primary.diagramId}`
        );
      }

      if (q.orOption) {
        const orSum = q.orOption.subQuestions.reduce((s, sq) => s + sq.marks, 0);
        assert.equal(orSum, 10, `${paper.name} ${q.qNo} orOption subQuestions must sum to 10`);
        assert.ok(q.orOption.solutionSteps.length >= 1, `${paper.name} ${q.qNo} orOption missing solutionSteps`);
        if (q.orTopicId) {
          assert.ok(topicIds.has(q.orTopicId), `${paper.name} ${q.qNo} invalid orTopicId ${q.orTopicId}`);
        }
        if (q.orOption.diagramId) {
          assert.ok(
            registeredIds.has(q.orOption.diagramId),
            `${paper.name} ${q.qNo} orOption invalid diagramId ${q.orOption.diagramId}`
          );
        }
      }
    });
  }
});

test('Timestamp Ordering simulator distinguishes Basic TO abort vs Thomas Write Rule obsolete-write ignore', () => {
  const parsed = parseSchedule('R1(X) W2(X) W1(X) C1 C2');
  assert.equal(parsed.error, undefined);

  const basic = simulateTimestampOrdering(parsed.ops, { T1: 10, T2: 20 }, 'basic');
  assert.deepEqual(basic.abortedTxs, ['T1']);
  assert.equal(basic.ignoredWrites, 0);
  assert.equal(basic.steps[2].status, 'aborted');

  const thomas = simulateTimestampOrdering(parsed.ops, { T1: 10, T2: 20 }, 'thomas');
  assert.deepEqual(thomas.abortedTxs, []);
  assert.equal(thomas.ignoredWrites, 1);
  assert.equal(thomas.steps[2].status, 'ignored');

  // Younger write followed by older read must abort under BOTH Basic TO and Thomas Write Rule
  const rwConflict = parseSchedule('W2(X) R1(X) C1 C2');
  assert.deepEqual(simulateTimestampOrdering(rwConflict.ops, { T1: 10, T2: 20 }, 'basic').abortedTxs, ['T1']);
  assert.deepEqual(simulateTimestampOrdering(rwConflict.ops, { T1: 10, T2: 20 }, 'thomas').abortedTxs, ['T1']);
});

test('WAL Log Recovery simulator accurately compares Deferred (NO-UNDO/REDO) vs Immediate (UNDO/REDO) crash recovery', () => {
  const walText = `
[Start, T1]
[Write, T1, A, 2000, 2400]
[Commit, T1]
[Checkpoint]
[Start, T2]
[Write, T2, A, 2400, 2100]
[Start, T3]
[Write, T3, C, 1500, 1800]
[Commit, T3]
[Start, T4]
[Write, T4, B, 5000, 4200]
--- SYSTEM CRASH ---
  `.trim();

  const parsed = parseWalLog(walText);
  assert.equal(parsed.error, undefined);
  assert.equal(parsed.entries.length, 11);

  const init = { A: 2000, B: 5000, C: 1500 };

  const deferred = simulateLogRecovery(init, parsed.entries, 'deferred');
  assert.deepEqual(deferred.committedBeforeCheckpoint, ['T1']);
  assert.deepEqual(deferred.undoList, []);
  assert.deepEqual(deferred.redoList, ['T3']);
  assert.deepEqual(deferred.finalValues, { A: 2400, B: 5000, C: 1800 });

  const immediate = simulateLogRecovery(init, parsed.entries, 'immediate');
  assert.deepEqual(immediate.committedBeforeCheckpoint, ['T1']);
  assert.deepEqual(immediate.undoList, ['T2', 'T4']);
  assert.deepEqual(immediate.redoList, ['T3']);
  assert.deepEqual(immediate.diskBeforeRecovery, { A: 2100, B: 4200, C: 1800 });
  assert.deepEqual(immediate.finalValues, { A: 2400, B: 5000, C: 1800 });
});

test('Extendible Hashing and Linear Hashing preserve all inserted keys across directory doublings and linear splits', () => {
  const keys = [4, 12, 32, 16, 1, 5, 21, 10, 15];

  const ext = simulateExtendibleHashing(keys, 2, 16);
  assert.equal(ext.steps.length, keys.length);
  assert.ok(ext.finalState !== null);
  assert.ok(ext.finalState!.globalDepth >= 2, 'Directory must double at least once');
  const extAllKeys = ext.finalState!.buckets.flatMap((b) => b.keys).sort((a, b) => a - b);
  assert.deepEqual(extAllKeys, [...keys].sort((a, b) => a - b));

  const lin = simulateLinearHashing(keys, 2, 2);
  assert.equal(lin.steps.length, keys.length);
  assert.ok(lin.finalState !== null);
  assert.ok(lin.finalState!.buckets.length > 2, 'Linear hashing must split and grow buckets');
  const linAllKeys = lin.finalState!.buckets
    .flatMap((b) => [...b.primaryKeys, ...b.overflowKeys])
    .sort((a, b) => a - b);
  assert.deepEqual(linAllKeys, [...keys].sort((a, b) => a - b));
});

test('Multilevel Index Disk I/O calculator matches exact FAT A2+TA2 Q4 primary and STUDENT dense index answers', () => {
  // Classic Elmasri / A2+TA2 Q4 primary index calculation
  const primary = calculateMultilevelIndexMetrics({
    numRecords: 30000,
    blockSize: 1024,
    recordSize: 100,
    keySize: 9,
    blockPointerSize: 6,
    indexType: 'primary',
  });
  assert.equal(primary.error, undefined);
  assert.equal(primary.bfr, 10);
  assert.equal(primary.dataBlocks, 3000);
  assert.equal(primary.bfrIndex, 68);
  assert.deepEqual(primary.levels, [
    { level: 1, entries: 3000, blocks: 45 },
    { level: 2, entries: 45, blocks: 1 },
  ]);
  assert.equal(primary.totalIndexLevels, 2);
  assert.equal(primary.multilevelSearchIO, 3);
  assert.equal(primary.singleLevelBinarySearchIO, 7);

  // FAT A2+TA2 Q4 STUDENT dense secondary index (r=16000, B=1000, R=80, V=4, P=6)
  const dense = calculateMultilevelIndexMetrics({
    numRecords: 16000,
    blockSize: 1000,
    recordSize: 80,
    keySize: 4,
    blockPointerSize: 6,
    indexType: 'secondary_dense',
  });
  assert.equal(dense.bfr, 12);
  assert.equal(dense.dataBlocks, 1334);
  assert.equal(dense.bfrIndex, 100);
  assert.deepEqual(dense.levels, [
    { level: 1, entries: 16000, blocks: 160 },
    { level: 2, entries: 160, blocks: 2 },
    { level: 3, entries: 2, blocks: 1 },
  ]);
  assert.equal(dense.multilevelSearchIO, 4);
});

test('3NF synthesis, BCNF decomposition, dependency preservation, and Chase tableau handle classic 3NF-not-BCNF, FAT schemas, and lossy splits', () => {
  // 1. Classic 3NF-not-BCNF: R(A,B,C), AB -> C, C -> B
  const attrs1 = parseAttributes('A, B, C');
  const fds1 = parseFDs('AB -> C; C -> B', attrs1).fds;

  const syn1 = synthesize3NF(attrs1, fds1);
  assert.equal(syn1.isLossless, true);
  assert.equal(syn1.isDependencyPreserving, true);
  assert.equal(syn1.relations.length, 1);
  assert.deepEqual(syn1.relations[0].attributes, ['A', 'B', 'C']);

  const bcnf1 = decomposeBCNF(attrs1, fds1);
  assert.equal(bcnf1.alreadyBCNF, false);
  assert.equal(bcnf1.isLossless, true);
  assert.equal(bcnf1.isDependencyPreserving, false);
  assert.ok(bcnf1.lostFds.some((fd) => fd.includes('AB -> C')));
  assert.equal(bcnf1.relations.length, 2);

  // Chase tableau proves BCNF split is lossless AND detects a deliberate lossy split (A,B); (C)
  const chaseBcnf = runChaseLosslessTest(attrs1, bcnf1.relations, fds1);
  assert.equal(chaseBcnf.isLossless, true);
  assert.notEqual(chaseBcnf.winningRowIndex, null);

  const chaseLossy = runChaseLosslessTest(
    attrs1,
    [
      { name: 'R1', attributes: ['A', 'B'] },
      { name: 'R2', attributes: ['C'] },
    ],
    fds1
  );
  assert.equal(chaseLossy.isLossless, false);
  assert.equal(chaseLossy.winningRowIndex, null);

  // 2. FAT A1+TA1 Q4 PATIENT_DIAGNOSIS -> 4 lossless, dependency-preserving tables in both 3NF & BCNF
  const a1Attrs = parseAttributes(
    'Patient_ID, Appt_Date, Doctor_ID, Doctor_Name, Dept_Code, Dept_Head, Test_Name, Test_Result'
  );
  const a1Fds = parseFDs(
    'Patient_ID Appt_Date -> Doctor_ID; Doctor_ID -> Doctor_Name Dept_Code; Dept_Code -> Dept_Head; Patient_ID Appt_Date Test_Name -> Test_Result',
    a1Attrs
  ).fds;
  const a1Syn = synthesize3NF(a1Attrs, a1Fds);
  assert.equal(a1Syn.relations.length, 4);
  assert.equal(a1Syn.isLossless, true);
  assert.equal(a1Syn.isDependencyPreserving, true);

  const a1Bcnf = decomposeBCNF(a1Attrs, a1Fds);
  assert.equal(a1Bcnf.relations.length, 4);
  assert.equal(a1Bcnf.isLossless, true);
  assert.equal(a1Bcnf.isDependencyPreserving, true);

  // 3. FAT Model QP Q3 LIBRARY_ISSUE -> 6 lossless, dependency-preserving tables in 3NF Synthesis
  const q3Attrs = parseAttributes(
    'IssueID, IssueDate, StudentID, StudentName, DeptID, DeptName, BookID, BookTitle, AuthorID, AuthorName, Publisher, QuantityIssued'
  );
  const q3Fds = parseFDs(
    'IssueID -> IssueDate StudentID; StudentID -> StudentName DeptID; DeptID -> DeptName; BookID -> BookTitle AuthorID Publisher; AuthorID -> AuthorName; IssueID BookID -> QuantityIssued',
    q3Attrs
  ).fds;
  const q3Syn = synthesize3NF(q3Attrs, q3Fds);
  assert.equal(q3Syn.relations.length, 6);
  assert.equal(q3Syn.isLossless, true);
  assert.equal(q3Syn.isDependencyPreserving, true);
});

test('calculateTopicMasteryStats accurately computes overall and per-module syllabus mastery percentages', () => {
  const empty = calculateTopicMasteryStats(MODULES, []);
  assert.equal(empty.totalTopics, 30);
  assert.equal(empty.masteredCount, 0);
  assert.equal(empty.percentComplete, 0);
  assert.equal(empty.perModule.length, 5);
  assert.ok(empty.perModule.every((m) => m.totalTopics === 6 && m.masteredCount === 0 && m.percentComplete === 0));

  // Partial mastery (3 in M1 + all 6 in M2 + duplicate & unknown IDs ignored) -> 9 / 30 = 30%
  const m1FirstThree = MODULES[0].topics.slice(0, 3).map((t) => t.id);
  const m2All = MODULES[1].topics.map((t) => t.id);
  const partial = calculateTopicMasteryStats(MODULES, [
    ...m1FirstThree,
    ...m2All,
    m1FirstThree[0],
    'non-existent-topic',
  ]);
  assert.equal(partial.masteredCount, 9);
  assert.equal(partial.totalTopics, 30);
  assert.equal(partial.percentComplete, 30);
  assert.equal(partial.perModule[0].masteredCount, 3);
  assert.equal(partial.perModule[0].percentComplete, 50);
  assert.equal(partial.perModule[1].masteredCount, 6);
  assert.equal(partial.perModule[1].percentComplete, 100);
  assert.equal(partial.perModule[2].masteredCount, 0);

  // Full mastery -> 30 / 30 = 100%
  const allIds = MODULES.flatMap((m) => m.topics.map((t) => t.id));
  const full = calculateTopicMasteryStats(MODULES, allIds);
  assert.equal(full.masteredCount, 30);
  assert.equal(full.percentComplete, 100);
  assert.ok(full.perModule.every((m) => m.percentComplete === 100));
});




