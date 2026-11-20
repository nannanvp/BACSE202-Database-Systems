import test from 'node:test';
import assert from 'node:assert/strict';
import { FAT_QUESTIONS } from './bacse202Data';
import { EXTENDED_FAT_QUESTIONS } from './fatQuestionsExtended';

test('FAT_QUESTIONS combines 20 base items and 90 extended syllabus-aligned items (110 total)', () => {
  assert.equal(EXTENDED_FAT_QUESTIONS.length, 90);
  assert.equal(FAT_QUESTIONS.length, 110);

  const ids = new Set<string>();
  for (const q of FAT_QUESTIONS) {
    assert.ok(q.id.trim().length > 0, 'Empty question ID');
    assert.equal(ids.has(q.id), false, `Duplicate question ID found: ${q.id}`);
    ids.add(q.id);
  }
});

test('EXTENDED_FAT_QUESTIONS matches official BACSE202 module distribution and Part B quotas', () => {
  const countsByMod: Record<string, number> = { m1: 0, m2: 0, m3: 0, m4: 0, m5: 0 };
  const partBByMod: Record<string, number> = { m1: 0, m2: 0, m3: 0, m4: 0, m5: 0 };

  for (const q of EXTENDED_FAT_QUESTIONS) {
    countsByMod[q.moduleId] += 1;
    if (q.part === 'Part B (Analytical)') {
      partBByMod[q.moduleId] += 1;
    }
  }

  // Syllabus-weighted distribution: M1=16, M2=22, M3=17, M4=20, M5=15 (sum = 90)
  assert.deepEqual(countsByMod, { m1: 16, m2: 22, m3: 17, m4: 20, m5: 15 });

  // Part B (10-mark Analytical) quotas: M1=3, M2=4, M3=3, M4=4, M5=3 (sum = 17)
  assert.deepEqual(partBByMod, { m1: 3, m2: 4, m3: 3, m4: 4, m5: 3 });
});

test('Every FAT question has valid structure, 4 unique options, matching marks, and detailed explanations', () => {
  for (const q of FAT_QUESTIONS) {
    assert.ok(['m1', 'm2', 'm3', 'm4', 'm5'].includes(q.moduleId), `Invalid moduleId on ${q.id}`);
    assert.ok(
      q.part === 'Part A (Short)' || q.part === 'Part B (Analytical)',
      `Invalid part on ${q.id}`,
    );
    assert.equal(
      q.marks,
      q.part === 'Part A (Short)' ? 2 : 10,
      `Marks mismatch on ${q.id}: ${q.part} should have ${q.part === 'Part A (Short)' ? 2 : 10} marks`,
    );
    assert.ok(q.prompt.trim().length >= 20, `Prompt too short on ${q.id}`);
    assert.equal(q.options.length, 4, `Expected 4 options on ${q.id}`);
    assert.ok(
      Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4,
      `Invalid correctIndex on ${q.id}`,
    );

    const uniqueOpts = new Set(q.options.map((o) => o.trim()));
    assert.equal(uniqueOpts.size, 4, `Duplicate or empty option on ${q.id}`);
    for (const opt of q.options) {
      assert.ok(opt.trim().length > 0, `Empty option on ${q.id}`);
    }
    assert.ok(q.explanation.trim().length >= 40, `Explanation too short on ${q.id}`);
  }
});

test('EXTENDED_FAT_QUESTIONS provide rich 3+ sentence explanations, multi-step Part B solutions, and >=20 numerical/trace questions', () => {
  let numericalOrCodeCount = 0;

  for (const q of EXTENDED_FAT_QUESTIONS) {
    assert.ok(
      q.explanation.length >= 160,
      `Extended explanation too brief on ${q.id} (${q.explanation.length} chars)`,
    );

    if (q.part === 'Part B (Analytical)') {
      assert.ok(
        q.explanation.includes('Step 1') && q.explanation.includes('Step 2'),
        `Part B question ${q.id} must have multi-step worked solution (Step 1, Step 2, ...)`,
      );
      assert.ok(
        q.explanation.length >= 350,
        `Part B explanation on ${q.id} should be a full multi-step solution`,
      );
    }

    if (q.codeOrSchema || /\d+\s*(bytes?|KB|MB|blocks?|records?|buckets?|tuples?|keys?|sites?|nodes?)/i.test(q.prompt)) {
      numericalOrCodeCount += 1;
    }
  }

  assert.ok(
    numericalOrCodeCount >= 20,
    `Expected >=20 numerical/code-trace questions in EXTENDED_FAT_QUESTIONS, found ${numericalOrCodeCount}`,
  );
});
