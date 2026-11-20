import type { ModuleData } from '../data/bacse202Data';

export interface FilteredFormulaGroup {
  moduleId: ModuleData['id'];
  moduleNumber: number;
  moduleTitle: string;
  formulas: Array<{ label: string; value: string }>;
}

/**
 * Filters module keyFormulasAndRules by a free-text query across module title,
 * module code (e.g. "m2", "module 2"), formula label, and formula expression.
 */
export function filterModuleFormulas(
  modules: ModuleData[],
  query: string
): FilteredFormulaGroup[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return modules.map((mod) => ({
      moduleId: mod.id,
      moduleNumber: mod.number,
      moduleTitle: mod.title,
      formulas: mod.keyFormulasAndRules,
    }));
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const results: FilteredFormulaGroup[] = [];

  for (const mod of modules) {
    const moduleHaystack = `m${mod.number} module ${mod.number} ${mod.title}`.toLowerCase();
    const matchingFormulas = mod.keyFormulasAndRules.filter((item) => {
      const combined = `${moduleHaystack} ${item.label} ${item.value}`.toLowerCase();
      return tokens.every((t) => combined.includes(t));
    });

    if (matchingFormulas.length > 0) {
      results.push({
        moduleId: mod.id,
        moduleNumber: mod.number,
        moduleTitle: mod.title,
        formulas: matchingFormulas,
      });
    }
  }

  return results;
}

/**
 * Counts total formulas across filtered module groups.
 */
export function countFilteredFormulas(groups: FilteredFormulaGroup[]): number {
  return groups.reduce((acc, g) => acc + g.formulas.length, 0);
}

/**
 * Checks whether a KeyboardEvent corresponds to the Ctrl+K or Cmd+K shortcut.
 */
export function isFormulaToggleShortcut(event: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey?: boolean;
}): boolean {
  if (event.altKey) return false;
  return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
}
