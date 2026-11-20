import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { MODULES } from '../data/bacse202Data';
import {
  countFilteredFormulas,
  filterModuleFormulas,
  isFormulaToggleShortcut,
} from '../utils/formulaQuickRefEngine';

type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

interface FormulaQuickRefProps {
  divisionColors: Record<ModuleId, { hex: string; name: string; code: string; hours: number }>;
}

const LIGHT_HEADER_INK: Record<ModuleId, boolean> = {
  m1: false,
  m2: false,
  m3: true,
  m4: true,
  m5: true,
};

export const FormulaQuickRef: React.FC<FormulaQuickRefProps> = ({ divisionColors }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedModules, setExpandedModules] = useState<Record<ModuleId, boolean>>({
    m1: true,
    m2: true,
    m3: false,
    m4: false,
    m5: false,
  });

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Global Ctrl+K / Cmd+K toggle + Escape to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFormulaToggleShortcut(event)) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus search input cleanly when panel opens
  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const filteredGroups = useMemo(
    () => filterModuleFormulas(MODULES, searchQuery),
    [searchQuery]
  );

  const totalMatches = useMemo(
    () => countFilteredFormulas(filteredGroups),
    [filteredGroups]
  );

  const isSearching = searchQuery.trim().length > 0;

  const toggleModuleGroup = (moduleId: ModuleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const allExpanded = MODULES.every((m) => expandedModules[m.id]);

  const handleToggleAllGroups = () => {
    const nextState = !allExpanded;
    setExpandedModules({
      m1: nextState,
      m2: nextState,
      m3: nextState,
      m4: nextState,
      m5: nextState,
    });
  };

  return (
    <div
      className="no-print fixed bottom-4 right-4 xl:right-14 z-40 flex flex-col items-end gap-2.5 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="formula-quickref-panel"
            id="formula-quickref-panel"
            data-testid="formula-quickref-panel"
            role="dialog"
            aria-label="Quick Formula Reference"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto formula-glass-panel w-[350px] max-w-[calc(100vw-2rem)] max-h-[60vh] flex flex-col rounded-xl backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-[#C5BEB0] dark:border-[#3A3731] shadow-2xl overflow-hidden"
          >
            {/* Panel Header */}
            <div className="px-3.5 py-2.5 border-b border-[#C5BEB0]/80 dark:border-[#33302B] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span aria-hidden="true" className="text-sm leading-none">
                  📐
                </span>
                <h2 className="text-xs font-display font-bold tracking-[0.04em] uppercase text-[#1C1B18] dark:text-[#E6E2DA] truncate">
                  Formula Quick Ref
                </h2>
                <span className="text-[11px] font-mono text-[#6E695D] dark:text-[#8F897D] tabular-nums shrink-0">
                  · {totalMatches}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isSearching && (
                  <button
                    type="button"
                    onClick={handleToggleAllGroups}
                    className="px-2 py-0.5 text-[10px] font-mono font-semibold text-[#434038] dark:text-[#B9B3A7] hover:text-[#1C1B18] dark:hover:text-[#E6E2DA] rounded transition-colors"
                  >
                    {allExpanded ? 'Collapse all' : 'Expand all'}
                  </button>
                )}
                <button
                  type="button"
                  data-testid="formula-quickref-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Formula Quick Ref"
                  className="p-1 text-[#434038] dark:text-[#B9B3A7] hover:text-[#1C1B18] dark:hover:text-[#E6E2DA] rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Search / Filter Input */}
            <div className="px-3.5 py-2 border-b border-[#C5BEB0]/60 dark:border-[#33302B] shrink-0">
              <div className="relative flex items-center">
                <Search
                  className="w-3.5 h-3.5 text-[#6E695D] dark:text-[#8F897D] absolute left-2.5 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  data-testid="formula-quickref-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter formulas (e.g. BCNF, B+, 2PL, CAP)..."
                  aria-label="Search formulas"
                  className="w-full pl-8 pr-7 py-1.5 text-xs font-mono rounded-lg bg-[#FAF7F0]/90 dark:bg-[#141311]/90 text-[#1C1B18] dark:text-[#E6E2DA] placeholder:text-[#6E695D] dark:placeholder:text-[#8F897D] border border-[#C5BEB0] dark:border-[#3A3731] focus:outline-none focus:ring-1 focus:ring-[#E5B82E]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear formula search"
                    className="absolute right-2 p-0.5 text-[#6E695D] dark:text-[#8F897D] hover:text-[#1C1B18] dark:hover:text-[#E6E2DA]"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Module Formula Groups */}
            <div
              data-testid="formula-quickref-list"
              className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2"
            >
              {filteredGroups.length === 0 ? (
                <div className="py-8 px-3 text-center space-y-1.5">
                  <p className="text-xs font-mono font-semibold text-[#1C1B18] dark:text-[#E6E2DA]">
                    No formulas match &ldquo;{searchQuery.trim()}&rdquo;
                  </p>
                  <p className="text-[11px] text-[#6E695D] dark:text-[#8F897D]">
                    Try keywords like BCNF, Division, Wait-Die, CAP, or M3.
                  </p>
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const accent = divisionColors[group.moduleId];
                  const isGroupOpen = isSearching ? true : expandedModules[group.moduleId];
                  const useLightText = LIGHT_HEADER_INK[group.moduleId];

                  return (
                    <div
                      key={group.moduleId}
                      data-testid={`formula-group-${group.moduleId}`}
                      className="rounded-lg border border-[#C5BEB0]/80 dark:border-[#33302B] overflow-hidden bg-[#FAF7F0]/70 dark:bg-[#1B1916]/75"
                    >
                      <button
                        type="button"
                        onClick={() => toggleModuleGroup(group.moduleId)}
                        aria-expanded={isGroupOpen}
                        style={{
                          backgroundColor: accent.hex,
                          color: useLightText ? '#FAF7F0' : '#1C1B18',
                        }}
                        className="module-accent-bar w-full px-2.5 py-1.5 flex items-center justify-between gap-2 text-left transition-opacity hover:opacity-95"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isGroupOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          )}
                          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.04em] truncate">
                            {accent.code} · {group.moduleTitle}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] font-bold opacity-85 tabular-nums shrink-0">
                          {group.formulas.length}
                        </span>
                      </button>

                      {isGroupOpen && (
                        <ul className="divide-y divide-[#C5BEB0]/60 dark:divide-[#2D2A25]">
                          {group.formulas.map((formula) => (
                            <li
                              key={`${group.moduleId}-${formula.label}`}
                              className="px-2.5 py-2 space-y-0.5"
                            >
                              <div className="text-[11px] font-semibold text-[#1C1B18] dark:text-[#E6E2DA] leading-snug">
                                {formula.label}
                              </div>
                              <div className="font-mono text-[11px] text-[#434038] dark:text-[#B9B3A7] leading-relaxed break-words">
                                {formula.value}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quiet Keyboard Hint Footer */}
            <div className="px-3.5 py-1.5 border-t border-[#C5BEB0]/60 dark:border-[#33302B] flex items-center justify-between text-[10px] font-mono text-[#6E695D] dark:text-[#8F897D] shrink-0">
              <span>Toggle anytime</span>
              <span>Ctrl+K / ⌘K · Esc to close</span>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Collapsible Floating Action Button */}
      <button
        type="button"
        data-testid="formula-quickref-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="formula-quickref-panel"
        aria-label={isOpen ? 'Collapse Formulas quick reference' : 'Open Formulas quick reference (Ctrl+K)'}
        title="Toggle Formula Quick Reference (Ctrl+K / Cmd+K)"
        className="pointer-events-auto formula-glass-fab inline-flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/80 dark:bg-slate-900/80 text-[#1C1B18] dark:text-[#E6E2DA] border border-[#1C1B18]/80 dark:border-[#45413A] shadow-lg hover:shadow-xl transition-all duration-150 cursor-pointer"
      >
        <span className="text-xs font-mono font-bold tracking-[0.03em] whitespace-nowrap">
          📐 Formulas
        </span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#6E695D] dark:text-[#8F897D] border border-[#C5BEB0] dark:border-[#3A3731] rounded">
          ⌘K
        </kbd>
      </button>
    </div>
  );
};
