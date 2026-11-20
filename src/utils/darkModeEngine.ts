export const DARK_MODE_STORAGE_KEY = 'bacse202_dark_mode_v1';

/**
 * Parses a stored dark-mode preference value from localStorage.
 * Returns null if missing or unrecognized so callers can fall back to system preference.
 */
export function parseStoredDarkMode(storedRaw: string | null): boolean | null {
  if (storedRaw === null) return null;
  const trimmed = storedRaw.trim().toLowerCase();
  if (trimmed === 'true' || trimmed === '1' || trimmed === 'dark' || trimmed === '"dark"') {
    return true;
  }
  if (trimmed === 'false' || trimmed === '0' || trimmed === 'light' || trimmed === '"light"') {
    return false;
  }
  try {
    const parsed: unknown = JSON.parse(storedRaw);
    if (typeof parsed === 'boolean') return parsed;
  } catch {
    // Unrecognized non-JSON value
  }
  return null;
}

/**
 * Resolves the initial dark-mode boolean:
 * 1. Explicit persisted user preference in localStorage ("bacse202_dark_mode_v1") wins.
 * 2. On first visit (no valid persisted value), respects system preference
 *    window.matchMedia('(prefers-color-scheme: dark)').matches.
 */
export function resolveInitialDarkMode(
  storedRaw: string | null,
  systemPrefersDark: boolean
): boolean {
  const stored = parseStoredDarkMode(storedRaw);
  return stored !== null ? stored : Boolean(systemPrefersDark);
}

/**
 * Serializes the boolean preference for localStorage persistence.
 */
export function serializeDarkModePreference(isDark: boolean): string {
  return JSON.stringify(Boolean(isDark));
}

/**
 * Applies or removes the 'dark' class on the root <html> element.
 */
export function applyDarkModeClass(
  rootElement: { classList: { toggle: (token: string, force?: boolean) => boolean | void } } | null,
  isDark: boolean
): void {
  if (!rootElement) return;
  rootElement.classList.toggle('dark', Boolean(isDark));
}
