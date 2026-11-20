import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACETATE_CONFETTI_PALETTE,
  buildMasteryMilestoneMessage,
  generateConfettiParticles,
  getBurstLifetimeMs,
} from './confettiEngine';

test('generateConfettiParticles produces deterministic, bounded particles using the manual palette', () => {
  const burstA = generateConfettiParticles({
    seed: 1024,
    accentHex: '#E5B82E',
    intensity: 'subtle',
  });
  const burstB = generateConfettiParticles({
    seed: 1024,
    accentHex: '#E5B82E',
    intensity: 'subtle',
  });

  assert.equal(burstA.length, 22);
  assert.deepEqual(burstA, burstB);

  const allowedColors = new Set<string>([...ACETATE_CONFETTI_PALETTE, '#E5B82E']);
  for (const p of burstA) {
    assert.ok(allowedColors.has(p.color), `Unexpected particle color: ${p.color}`);
    assert.ok(p.widthPx >= 4 && p.widthPx <= 10);
    assert.ok(p.heightPx >= 4 && p.heightPx <= 10);
    assert.ok(p.durationMs >= 720 && p.durationMs <= 1000);
    assert.ok(p.endY > p.midY, 'Particles should arc downward under gravity after apex');
  }
});

test('milestone intensity emits a fuller burst and downward cascade keeps particles below top bar', () => {
  const milestoneBurst = generateConfettiParticles({
    seed: 777,
    accentHex: '#147E7B',
    intensity: 'milestone',
  });
  assert.equal(milestoneBurst.length, 34);

  const lifetime = getBurstLifetimeMs(milestoneBurst);
  assert.ok(lifetime >= 1000 && lifetime <= 1400, `Unexpected burst lifetime: ${lifetime}ms`);

  const downwardBurst = generateConfettiParticles({
    seed: 42,
    accentHex: '#E5B82E',
    intensity: 'subtle',
    direction: 'down',
  });
  assert.equal(downwardBurst.length, 22);
  for (const p of downwardBurst) {
    assert.ok(p.midY > 0, `Expected positive midY for downward cascade, got ${p.midY}`);
    assert.ok(p.endY > p.midY, 'Downward cascade particles should continue falling smoothly');
  }
});

test('buildMasteryMilestoneMessage distinguishes topic, module completion, and full syllabus mastery', () => {
  const topicMsg = buildMasteryMilestoneMessage({
    topicTitle: 'Characteristics & Advantages of DBMS Approach',
    moduleNumber: 1,
    newModuleMasteredCount: 1,
    moduleTotalTopics: 6,
    newTotalMasteredCount: 1,
    totalSyllabusTopics: 30,
  });
  assert.equal(topicMsg.kind, 'topic');
  assert.equal(topicMsg.headline, 'Topic Mastered · M1 (1/6)');

  const moduleMsg = buildMasteryMilestoneMessage({
    topicTitle: 'Constraints & Handling Violations',
    moduleNumber: 1,
    newModuleMasteredCount: 6,
    moduleTotalTopics: 6,
    newTotalMasteredCount: 6,
    totalSyllabusTopics: 30,
  });
  assert.equal(moduleMsg.kind, 'module');
  assert.equal(moduleMsg.headline, 'Module 1 Complete (6/6)');

  const fullMsg = buildMasteryMilestoneMessage({
    topicTitle: 'MapReduce & Big Data Analytics',
    moduleNumber: 5,
    newModuleMasteredCount: 6,
    moduleTotalTopics: 6,
    newTotalMasteredCount: 30,
    totalSyllabusTopics: 30,
  });
  assert.equal(fullMsg.kind, 'syllabus');
  assert.equal(fullMsg.headline, 'Full Syllabus Mastered (30/30)');
});
