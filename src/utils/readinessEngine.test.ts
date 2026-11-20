import test from 'node:test';
import assert from 'node:assert/strict';
import { FAT_QUESTIONS, MODULES, SPRINT_BLOCKS } from '../data/bacse202Data';
import { TOPIC_NOTES } from '../data/topicNotes';
import { FLASHCARD_DECK } from './erFlashcardEngine';
import { EXAM_TRAP_BUSTERS } from './numericalDrillEngine';
import { calculateExamReadiness } from './readinessEngine';

function buildSelfCheckList() {
  const items: Array<{
    key: string;
    moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
    correctIndex: number;
  }> = [];
  for (const mod of MODULES) {
    for (const t of mod.topics) {
      TOPIC_NOTES[t.id]?.selfChecks?.forEach((sc, idx) => {
        items.push({
          key: `${t.id}-sc-${idx}`,
          moduleId: mod.id,
          correctIndex: sc.correctIndex,
        });
      });
    }
  }
  return items;
}

test('calculateExamReadiness reports 0% baseline, identifies M2/M4 high-weight weak module, and prioritizes missed self-checks first', () => {
  const selfCheckItems = buildSelfCheckList();

  const fresh = calculateExamReadiness({
    modules: MODULES,
    sprintBlocks: SPRINT_BLOCKS,
    completedBlockIds: [],
    masteredTopicIds: [],
    selfCheckItems,
    selfCheckSelections: {},
    fatQuestions: FAT_QUESTIONS,
    mockAnswers: {},
    rubricScores: {},
    knownFlashcardIds: [],
    drillSolvedCount: 0,
    lockedTrapIds: [],
  });

  assert.equal(fresh.overallScore, 0);
  assert.equal(fresh.projectedBand, '< 55 / 100');
  assert.equal(fresh.weakestModule.hours, 10); // Tie-breaker prioritizes 10h FAT modules (M2/M4)
  assert.equal(fresh.nextActions.length, 3);

  // Inject 2 wrong self-checks -> CRITICAL missed queue action must jump to slot #1
  const wrongSelections: Record<string, number> = {
    [selfCheckItems[0].key]: (selfCheckItems[0].correctIndex + 1) % 4,
    [selfCheckItems[1].key]: (selfCheckItems[1].correctIndex + 1) % 4,
  };
  const withMisses = calculateExamReadiness({
    modules: MODULES,
    sprintBlocks: SPRINT_BLOCKS,
    completedBlockIds: [],
    masteredTopicIds: [],
    selfCheckItems,
    selfCheckSelections: wrongSelections,
    fatQuestions: FAT_QUESTIONS,
    mockAnswers: {},
    rubricScores: {},
    knownFlashcardIds: [],
    drillSolvedCount: 0,
    lockedTrapIds: [],
  });

  assert.equal(withMisses.counts.selfCheckMissed, 2);
  assert.equal(withMisses.nextActions[0].id, 'fix-missed-self-checks');
  assert.equal(withMisses.nextActions[0].priority, 'CRITICAL');
});

test('calculateExamReadiness reaches 95-100 Topper Ready when topics, blocks, active recall, paper rubric, drills, cards, and traps are completed', () => {
  const selfCheckItems = buildSelfCheckList();
  const perfectSelfChecks: Record<string, number> = {};
  for (const sc of selfCheckItems) perfectSelfChecks[sc.key] = sc.correctIndex;

  const perfectMock: Record<string, number> = {};
  for (const q of FAT_QUESTIONS) perfectMock[q.id] = q.correctIndex;

  const topper = calculateExamReadiness({
    modules: MODULES,
    sprintBlocks: SPRINT_BLOCKS,
    completedBlockIds: SPRINT_BLOCKS.map((b) => b.id),
    masteredTopicIds: MODULES.flatMap((m) => m.topics.map((t) => t.id)),
    selfCheckItems,
    selfCheckSelections: perfectSelfChecks,
    fatQuestions: FAT_QUESTIONS,
    mockAnswers: perfectMock,
    rubricScores: { 'a1:Q1:0': 96 },
    knownFlashcardIds: FLASHCARD_DECK.map((c) => c.id),
    drillSolvedCount: 14,
    lockedTrapIds: EXAM_TRAP_BUSTERS.map((t) => t.id),
  });

  assert.ok(topper.overallScore >= 98, `Expected >=98 overallScore, got ${topper.overallScore}`);
  assert.equal(topper.projectedBand, '95 – 100 / 100');
  assert.equal(topper.counts.bestPaperScore, 96);
  assert.equal(topper.counts.selfCheckMissed, 0);
});
