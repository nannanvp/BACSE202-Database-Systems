import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyDarkModeClass,
  DARK_MODE_STORAGE_KEY,
  parseStoredDarkMode,
  resolveInitialDarkMode,
  serializeDarkModePreference,
} from './darkModeEngine';

test('DARK_MODE_STORAGE_KEY matches required localStorage key', () => {
  assert.equal(DARK_MODE_STORAGE_KEY, 'bacse202_dark_mode_v1');
});

test('resolveInitialDarkMode respects system prefers-color-scheme on first visit', () => {
  assert.equal(resolveInitialDarkMode(null, true), true);
  assert.equal(resolveInitialDarkMode(null, false), false);
  assert.equal(resolveInitialDarkMode('corrupted-value', true), true);
  assert.equal(resolveInitialDarkMode('', false), false);
});

test('resolveInitialDarkMode prioritizes explicit stored preference over system preference', () => {
  assert.equal(resolveInitialDarkMode('true', false), true);
  assert.equal(resolveInitialDarkMode('false', true), false);
  assert.equal(resolveInitialDarkMode('"dark"', false), true);
  assert.equal(resolveInitialDarkMode('"light"', true), false);
  assert.equal(parseStoredDarkMode('1'), true);
  assert.equal(parseStoredDarkMode('0'), false);
});

test('serializeDarkModePreference and applyDarkModeClass toggle dark class cleanly', () => {
  assert.equal(serializeDarkModePreference(true), 'true');
  assert.equal(serializeDarkModePreference(false), 'false');

  const classes = new Set<string>();
  const mockRoot = {
    classList: {
      toggle(token: string, force?: boolean) {
        if (force === undefined) {
          if (classes.has(token)) {
            classes.delete(token);
            return false;
          }
          classes.add(token);
          return true;
        }
        if (force) classes.add(token);
        else classes.delete(token);
        return force;
      },
    },
  };

  applyDarkModeClass(mockRoot, true);
  assert.equal(classes.has('dark'), true);

  applyDarkModeClass(mockRoot, false);
  assert.equal(classes.has('dark'), false);

  // Safe no-op on null
  applyDarkModeClass(null, true);
});
