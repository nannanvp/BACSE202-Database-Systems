import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkGranularityCompatibility,
  getRequiredIntentionChain,
  GRANULARITY_COMPATIBILITY,
  GRANULARITY_MODES,
  parseLockSchedule,
  simulateTwoPL,
  TWO_PL_PRESETS,
} from './lockingEngine';

test('Classic 2-Tx Deadlock: WFG detects cycle, Wait-Die aborts younger T2, Wound-Wait wounds T2', () => {
  const preset = TWO_PL_PRESETS[0]; // R1(X) R2(Y) W2(X) W1(Y) C1 C2
  const parsed = parseLockSchedule(preset.schedule);
  assert.equal(parsed.error, undefined);

  // 1. Plain Strict 2PL + WFG -> Deadlock cycle T1 -> T2 -> T1
  const wfgRes = simulateTwoPL(parsed.ops, 'strict_2pl_wfg', preset.timestamps);
  assert.equal(wfgRes.deadlockDetected, true);
  assert.ok(wfgRes.deadlockCycle && wfgRes.deadlockCycle.length >= 3);
  assert.ok(wfgRes.deadlockCycle.includes('T1') && wfgRes.deadlockCycle.includes('T2'));

  // 2. Wait-Die (non-preemptive): T2 (TS=20) requests X(X) held by older T1 (TS=10) -> T2 dies!
  const wdRes = simulateTwoPL(parsed.ops, 'wait_die', preset.timestamps);
  assert.equal(wdRes.deadlockDetected, false);
  assert.deepEqual(wdRes.abortedTxs, ['T2']);
  assert.deepEqual(wdRes.committedTxs, ['T1']);

  // 3. Wound-Wait (preemptive): T2 waits on X, then older T1 (TS=10) requests X(Y) held by younger T2 (TS=20) -> T1 wounds T2!
  const wwRes = simulateTwoPL(parsed.ops, 'wound_wait', preset.timestamps);
  assert.equal(wwRes.deadlockDetected, false);
  assert.deepEqual(wwRes.abortedTxs, ['T2']);
  assert.deepEqual(wwRes.committedTxs, ['T1']);
  assert.equal(wwRes.woundedEvents, 1);
});

test('3-Tx Cycle Deadlock and Lock Upgrade Deadlock are accurately caught by WFG', () => {
  const p3 = parseLockSchedule(TWO_PL_PRESETS[1].schedule);
  const res3 = simulateTwoPL(p3.ops, 'strict_2pl_wfg', TWO_PL_PRESETS[1].timestamps);
  assert.equal(res3.deadlockDetected, true);
  assert.equal(res3.deadlockCycle?.length, 4); // T1 -> T2 -> T3 -> T1

  const up = parseLockSchedule(TWO_PL_PRESETS[2].schedule);
  const resUp = simulateTwoPL(up.ops, 'strict_2pl_wfg', TWO_PL_PRESETS[2].timestamps);
  assert.equal(resUp.deadlockDetected, true);

  const safe = parseLockSchedule(TWO_PL_PRESETS[3].schedule);
  const resSafe = simulateTwoPL(safe.ops, 'strict_2pl_wfg', TWO_PL_PRESETS[3].timestamps);
  assert.equal(resSafe.deadlockDetected, false);
  assert.deepEqual(resSafe.committedTxs, ['T1', 'T2']);
  assert.deepEqual(resSafe.abortedTxs, []);
});

test('Multiple Granularity (IS/IX/S/SIX/X) compatibility matrix matches Elmasri & Navathe specification', () => {
  // Symmetry check across all 25 pairs
  for (const m1 of GRANULARITY_MODES) {
    for (const m2 of GRANULARITY_MODES) {
      assert.equal(
        GRANULARITY_COMPATIBILITY[m1][m2],
        GRANULARITY_COMPATIBILITY[m2][m1],
        `Matrix symmetry mismatch for (${m1}, ${m2})`
      );
    }
  }
  // Key exam edge cases:
  assert.equal(checkGranularityCompatibility('SIX', 'IS').compatible, true);
  assert.equal(checkGranularityCompatibility('SIX', 'S').compatible, false);
  assert.equal(checkGranularityCompatibility('SIX', 'IX').compatible, false);
  assert.equal(checkGranularityCompatibility('IX', 'IX').compatible, true);
  assert.equal(checkGranularityCompatibility('IX', 'S').compatible, false);
  assert.equal(checkGranularityCompatibility('X', 'IS').compatible, false);

  // Top-down intention chain for X lock on Record (R1) requires IX/SIX on DB, Table, Page
  const chain = getRequiredIntentionChain('Record (R1)', 'X');
  assert.equal(chain.length, 4);
  assert.ok(chain[0].requiredLock.includes('IX or SIX'));
  assert.ok(chain[3].requiredLock.includes('X (Target Lock)'));
});
