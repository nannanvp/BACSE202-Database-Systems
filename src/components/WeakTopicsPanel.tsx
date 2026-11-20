import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownWideNarrow,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { ModuleId, WeakTopicEntry } from '../utils/standingEngine';
import {
  filterWeakTopicsBySource,
  formatRelativeTimestamp,
  getSourceBadgeLabel,
  getWrongCountSeverity,
  groupWeakTopicsByModule,
  isRecentlyReviewed,
  isReviewOverdue,
  resolveWeakQuestionDetail,
  WeakTopicSortMode,
  WeakTopicSourceFilter,
} from '../utils/weakTopicsEngine';

export interface DivisionColorMeta {
  hex: string;
  name: string;
  code: string;
  hours: number;
}

const DEFAULT_DIVISION_COLORS: Record<ModuleId, DivisionColorMeta> = {
  m1: { hex: '#E5B82E', name: 'Chrome Yellow', code: 'M1', hours: 7 },
  m2: { hex: '#E06D2B', name: 'Oxide Orange', code: 'M2', hours: 10 },
  m3: { hex: '#4F8A3D', name: 'Grass Green', code: 'M3', hours: 9 },
  m4: { hex: '#147E7B', name: 'Teal', code: 'M4', hours: 10 },
  m5: { hex: '#22559C', name: 'Ultramarine', code: 'M5', hours: 7 },
};

const MODULE_TEXT_LIGHT: Record<ModuleId, boolean> = {
  m1: false,
  m2: false,
  m3: true,
  m4: true,
  m5: true,
};

interface WeakTopicsPanelProps {
  weakTopics: WeakTopicEntry[];
  onReviewWeakTopic: (questionId: string) => void;
  onToggleResolved: (questionId: string) => void;
  onClearAllResolved: () => void;
  divisionColors?: Record<ModuleId, DivisionColorMeta>;
  defaultExpanded?: boolean;
  externalExpandNonce?: number;
  initialSourceFilter?: WeakTopicSourceFilter;
  title?: string;
  subtitle?: string;
  panelId?: string;
}

export const WeakTopicsPanel: React.FC<WeakTopicsPanelProps> = ({
  weakTopics,
  onReviewWeakTopic,
  onToggleResolved,
  onClearAllResolved,
  divisionColors = DEFAULT_DIVISION_COLORS,
  defaultExpanded = true,
  externalExpandNonce,
  initialSourceFilter = 'all',
  title = 'Weak Topics Tracker',
  subtitle = 'Wrong answers from Standing Diagnostics and FAT Mock MCQs are tracked here with automatic overdue prioritization.',
  panelId = 'weak-topics-panel',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [sourceFilter, setSourceFilter] = useState<WeakTopicSourceFilter>(initialSourceFilter);
  const [sortMode, setSortMode] = useState<WeakTopicSortMode>('wrongCount');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [expandedPrompts, setExpandedPrompts] = useState<Record<string, boolean>>({});
  const [reviewingIds, setReviewingIds] = useState<Record<string, boolean>>({});
  const [pinnedOrderModules, setPinnedOrderModules] = useState<ModuleId[]>([]);
  const [resolvedSectionOpen, setResolvedSectionOpen] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Tick every 60s so SRS overdue / recently reviewed badges stay fresh live
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Refresh clock whenever weakTopics updates (e.g. after Review Now)
  useEffect(() => {
    setNowMs(Date.now());
  }, [weakTopics]);

  useEffect(() => {
    if (externalExpandNonce && externalExpandNonce > 0) {
      setIsExpanded(true);
    }
  }, [externalExpandNonce]);

  const counts = useMemo(() => {
    let activeAll = 0;
    let activeStanding = 0;
    let activeMock = 0;
    let overdueAll = 0;
    let resolvedAll = 0;

    for (const entry of weakTopics) {
      if (entry.resolved) {
        resolvedAll += 1;
      } else {
        activeAll += 1;
        if (entry.source === 'standing') activeStanding += 1;
        else activeMock += 1;
        if (isReviewOverdue(entry, nowMs)) overdueAll += 1;
      }
    }

    return { activeAll, activeStanding, activeMock, overdueAll, resolvedAll };
  }, [weakTopics, nowMs]);

  const filteredEntries = useMemo(
    () => filterWeakTopicsBySource(weakTopics, sourceFilter),
    [weakTopics, sourceFilter]
  );

  const activeEntries = useMemo(
    () => filteredEntries.filter((e) => !e.resolved),
    [filteredEntries]
  );

  const resolvedEntries = useMemo(
    () =>
      filteredEntries
        .filter((e) => e.resolved)
        .sort((a, b) => (b.lastReviewedAt ?? b.lastWrongAt).localeCompare(a.lastReviewedAt ?? a.lastWrongAt)),
    [filteredEntries]
  );

  const moduleGroups = useMemo(() => {
    const groups = groupWeakTopicsByModule(activeEntries, sortMode, nowMs);
    if (pinnedOrderModules.length === 0) return groups;
    const pinnedSet = new Set(pinnedOrderModules);
    return [...groups].sort((a, b) => {
      const aPin = pinnedSet.has(a.moduleId) ? 1 : 0;
      const bPin = pinnedSet.has(b.moduleId) ? 1 : 0;
      if (aPin !== bPin) return bPin - aPin;
      return 0;
    });
  }, [activeEntries, sortMode, nowMs, pinnedOrderModules]);

  const handleToggleModuleGroup = (modId: ModuleId) => {
    setCollapsedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleToggleReview = (entry: WeakTopicEntry) => {
    const nextOpen = !reviewingIds[entry.questionId];
    setReviewingIds((prev) => ({ ...prev, [entry.questionId]: nextOpen }));
    if (nextOpen) {
      // Keep the module pinned in place if this entry was overdue so opening Review Now never jumps off-screen
      if (isReviewOverdue(entry, nowMs)) {
        setPinnedOrderModules((prev) =>
          prev.includes(entry.moduleId) ? prev : [entry.moduleId, ...prev]
        );
      }
      setExpandedPrompts((prev) => ({ ...prev, [entry.questionId]: true }));
      onReviewWeakTopic(entry.questionId);
    } else {
      // Release module pin once no entries in that module are actively open for review
      const stillOpenInMod = Object.entries(reviewingIds).some(
        ([qId, open]) =>
          open &&
          qId !== entry.questionId &&
          weakTopics.some((w) => w.questionId === qId && w.moduleId === entry.moduleId)
      );
      if (!stillOpenInMod) {
        setPinnedOrderModules((prev) => prev.filter((m) => m !== entry.moduleId));
      }
    }
  };

  const renderWrongCountBadge = (wrongCount: number) => {
    const severity = getWrongCountSeverity(wrongCount);
    const styles =
      severity === 'high'
        ? 'bg-rose-600 text-[#FAF7F0] border-[#1C1B18]'
        : severity === 'medium'
        ? 'bg-amber-500 text-[#1C1B18] border-[#1C1B18]'
        : 'bg-yellow-300 text-[#1C1B18] border-[#1C1B18]';

    return (
      <span
        data-testid={`wrong-count-badge-${severity}`}
        className={`px-2 py-0.5 text-[11px] font-mono font-extrabold rounded-[3px] border tabular-nums ${styles}`}
      >
        Missed {wrongCount}×
      </span>
    );
  };

  const renderEntryCard = (entry: WeakTopicEntry, isResolvedCard = false) => {
    const modColor = divisionColors[entry.moduleId] ?? DEFAULT_DIVISION_COLORS[entry.moduleId];
    const modLightText = MODULE_TEXT_LIGHT[entry.moduleId];
    const sourceBadge = getSourceBadgeLabel(entry);
    const overdue = isReviewOverdue(entry, nowMs);
    const recentlyReviewed = isRecentlyReviewed(entry, nowMs);
    const isPromptExpanded = Boolean(expandedPrompts[entry.questionId]);
    const isReviewOpen = Boolean(reviewingIds[entry.questionId]);
    const detail = isReviewOpen ? resolveWeakQuestionDetail(entry) : null;

    return (
      <motion.article
        key={entry.questionId}
        layout="position"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.16 }}
        data-testid={`weak-topic-entry-${entry.questionId}`}
        className={`rounded-[4px] border p-4 space-y-3 ${
          isResolvedCard
            ? 'bg-[#F4EFE4] border-[#C5BEB0] opacity-80'
            : overdue
            ? 'bg-[#FAF7F0] border-rose-700 ring-1 ring-rose-600/30'
            : 'bg-[#FAF7F0] border-[#1C1B18]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div className="space-y-2 min-w-0 flex-1">
            {/* Metadata Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono tabular-nums">
              {/* Module badge using DIVISION_WHEEL color */}
              <span
                style={{ backgroundColor: modColor.hex }}
                className={`px-2 py-0.5 font-extrabold rounded-[3px] border border-[#1C1B18] ${
                  modLightText ? 'text-[#FAF7F0]' : 'text-[#1C1B18]'
                }`}
              >
                {modColor.code}
              </span>

              {/* Source badge: Standing · Tier X or Mock · Part A/B */}
              <span
                className={`px-2 py-0.5 font-bold rounded-[3px] border ${
                  entry.source === 'standing'
                    ? 'bg-[#6B21A8]/12 text-[#6B21A8] border-[#6B21A8]/40'
                    : 'bg-[#854D2B]/12 text-[#854D2B] border-[#854D2B]/40'
                }`}
              >
                {sourceBadge}
              </span>

              {/* Wrong count color-coded badge */}
              {renderWrongCountBadge(entry.wrongCount)}

              {/* SRS Overdue pulsing badge */}
              {overdue && (
                <span
                  data-testid="review-overdue-badge"
                  className="inline-flex items-center gap-1 px-2 py-0.5 font-extrabold rounded-[3px] border border-[#1C1B18] bg-rose-600 text-white animate-pulse"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>Review overdue!</span>
                </span>
              )}

              {/* SRS Recently reviewed badge */}
              {!overdue && recentlyReviewed && (
                <span
                  data-testid="recently-reviewed-badge"
                  className="inline-flex items-center gap-1 px-2 py-0.5 font-bold rounded-[3px] border border-emerald-700/40 bg-emerald-500/15 text-emerald-900"
                >
                  <span>Recently reviewed ✓</span>
                </span>
              )}

              <span className="text-[#6E695D] inline-flex items-center gap-1 ml-0.5">
                <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>{formatRelativeTimestamp(entry.lastWrongAt, nowMs)}</span>
              </span>
            </div>

            {/* Question Prompt (2-line clamp by default, expandable only when actually clipped) */}
            <ClampedPrompt
              text={entry.prompt}
              expanded={isPromptExpanded || isReviewOpen}
              hideToggle={isReviewOpen}
              onToggle={() =>
                setExpandedPrompts((prev) => ({
                  ...prev,
                  [entry.questionId]: !isPromptExpanded,
                }))
              }
            />
          </div>

          {/* Entry Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleToggleReview(entry)}
              aria-expanded={isReviewOpen}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
                isReviewOpen
                  ? 'bg-[#1C1B18] text-[#FAF7F0]'
                  : 'bg-[#E5B82E] text-[#1C1B18] hover:bg-[#d8ab22]'
              }`}
            >
              {isReviewOpen ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Hide Review</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Review Now</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onToggleResolved(entry.questionId)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
                entry.resolved
                  ? 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                  : 'bg-emerald-600 text-[#FAF7F0] hover:bg-emerald-700'
              }`}
            >
              {entry.resolved ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Unresolve</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Mark Resolved</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expanded Review Now Drawer: Full Question, All 4 Options (Correct Highlighted), Explanation */}
        <AnimatePresence initial={false}>
          {isReviewOpen && (
            <motion.div
              key="review-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div
                className="pt-3 mt-1 border-t border-[#1C1B18] space-y-3"
                data-testid={`review-drawer-${entry.questionId}`}
              >
                {detail ? (
                  <>
                    {detail.codeOrSchema && (
                      <pre className="font-mono text-xs bg-[#26231E] text-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-3.5 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {detail.codeOrSchema}
                      </pre>
                    )}

                    <div className="space-y-2">
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6E695D]">
                        All 4 Options (Correct Answer Highlighted)
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {detail.options.map((opt, idx) => {
                          const isCorrect = idx === detail.correctIndex;
                          return (
                            <div
                              key={idx}
                              className={`px-3.5 py-2.5 rounded-[4px] border text-xs sm:text-sm flex items-start justify-between gap-3 ${
                                isCorrect
                                  ? 'bg-emerald-500/15 border-emerald-700 text-[#1C1B18] font-semibold'
                                  : 'bg-[#F4EFE4] border-[#C5BEB0] text-[#434038]'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="font-mono text-xs font-bold shrink-0 mt-0.5">
                                  {String.fromCharCode(65 + idx)}.
                                </span>
                                <span className="leading-relaxed">{opt}</span>
                              </div>
                              {isCorrect && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 shrink-0 whitespace-nowrap">
                                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                  <span>Correct</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3.5 space-y-1">
                      <div className="text-xs font-mono font-bold text-[#1C1B18]">
                        Worked Explanation
                      </div>
                      <p className="text-xs sm:text-sm text-[#2C2A25] leading-relaxed whitespace-pre-line">
                        {detail.explanation}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-[#6E695D] font-mono">
                    Full question options are unavailable for this archived ID ({entry.questionId}).
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    );
  };

  return (
    <section
      id={panelId}
      data-testid="weak-topics-panel"
      className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden"
    >
      {/* Collapsible Panel Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        className="w-full px-5 py-4 bg-[#F4EFE4] hover:bg-[#EAE4D7] border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-3 text-left transition-colors"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-[4px] border border-[#1C1B18] bg-[#6B21A8] text-[#FAF7F0] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <BookOpenCheck className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-display font-extrabold text-[#1C1B18]">
                {title}
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] text-[#1C1B18] tabular-nums">
                {counts.activeAll} Unresolved
              </span>
              {counts.overdueAll > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-extrabold rounded-[3px] border border-[#1C1B18] bg-rose-600 text-white animate-pulse tabular-nums">
                  <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                  <span>{counts.overdueAll} Overdue</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#434038] leading-snug">{subtitle}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#1C1B18] shrink-0">
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Collapsible Panel Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="panel-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-5">
              {/* Filter Tabs (All | Standing | Mock) & Sort Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#C5BEB0]">
                <div
                  role="tablist"
                  aria-label="Filter weak topics by source"
                  className="inline-flex flex-wrap items-center gap-1.5"
                >
                  {(
                    [
                      { id: 'all', label: 'All', count: counts.activeAll },
                      { id: 'standing', label: 'Standing', count: counts.activeStanding },
                      { id: 'mock', label: 'Mock', count: counts.activeMock },
                    ] as const
                  ).map((tab) => {
                    const active = sourceFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSourceFilter(tab.id)}
                        className={`px-3 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap tabular-nums ${
                          active
                            ? 'bg-[#6B21A8] text-[#FAF7F0]'
                            : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    );
                  })}
                </div>

                {/* Sort Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#6E695D]">
                    <ArrowDownWideNarrow className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Sort:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSortMode('wrongCount')}
                    aria-pressed={sortMode === 'wrongCount'}
                    className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
                      sortMode === 'wrongCount'
                        ? 'bg-[#1C1B18] text-[#FAF7F0]'
                        : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    Most Missed
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortMode('lastWrongAt')}
                    aria-pressed={sortMode === 'lastWrongAt'}
                    className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
                      sortMode === 'lastWrongAt'
                        ? 'bg-[#1C1B18] text-[#FAF7F0]'
                        : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    Most Recent
                  </button>
                </div>
              </div>

              {/* Active Weak Topics Grouped by Module */}
              {moduleGroups.length === 0 ? (
                <div className="bg-[#F4EFE4] border border-[#C5BEB0] rounded-[4px] p-8 text-center space-y-1.5">
                  <p className="text-sm font-bold text-[#1C1B18]">
                    {counts.activeAll === 0
                      ? 'Zero unresolved weak topics — clean slate!'
                      : `No unresolved weak topics from ${
                          sourceFilter === 'standing' ? 'Standing Diagnostics' : 'FAT Mock'
                        }.`}
                  </p>
                  <p className="text-xs text-[#6E695D]">
                    Wrong answers from either Standing quizzes or FAT Mock MCQs appear here automatically for spaced review.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moduleGroups.map((group) => {
                    const modColor =
                      divisionColors[group.moduleId] ?? DEFAULT_DIVISION_COLORS[group.moduleId];
                    const modLightText = MODULE_TEXT_LIGHT[group.moduleId];
                    const isModCollapsed = Boolean(collapsedModules[group.moduleId]);

                    return (
                      <div
                        key={group.moduleId}
                        data-testid={`weak-module-group-${group.moduleId}`}
                        className="border border-[#1C1B18] rounded-[4px] overflow-hidden bg-[#F4EFE4]"
                      >
                        {/* Collapsible Module Section Header */}
                        <button
                          type="button"
                          onClick={() => handleToggleModuleGroup(group.moduleId)}
                          aria-expanded={!isModCollapsed}
                          className="w-full px-4 py-3 bg-[#EAE4D7] hover:bg-[#E2DAC9] flex flex-wrap items-center justify-between gap-2 text-left border-b border-[#1C1B18]/80 transition-colors"
                        >
                          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                            <span
                              style={{ backgroundColor: modColor.hex }}
                              className={`px-2 py-0.5 text-xs font-mono font-extrabold rounded-[3px] border border-[#1C1B18] shrink-0 ${
                                modLightText ? 'text-[#FAF7F0]' : 'text-[#1C1B18]'
                              }`}
                            >
                              {modColor.code}
                            </span>
                            <span className="text-sm font-display font-extrabold text-[#1C1B18] truncate">
                              {group.moduleTitle}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#434038] tabular-nums">
                              ({group.entries.length}{' '}
                              {group.entries.length === 1 ? 'topic' : 'topics'})
                            </span>
                            {group.overdueCount > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono font-extrabold rounded-[2px] bg-rose-600 text-white border border-[#1C1B18] animate-pulse tabular-nums">
                                {group.overdueCount} Overdue
                              </span>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#434038] shrink-0">
                            <span>{isModCollapsed ? 'Show' : 'Hide'}</span>
                            {isModCollapsed ? (
                              <ChevronDown className="w-4 h-4" aria-hidden="true" />
                            ) : (
                              <ChevronUp className="w-4 h-4" aria-hidden="true" />
                            )}
                          </span>
                        </button>

                        {!isModCollapsed && (
                          <div className="p-3.5 space-y-3">
                            {group.entries.map((entry) => renderEntryCard(entry, false))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Collapsed Resolved Section at Bottom + Clear All Resolved */}
              {counts.resolvedAll > 0 && (
                <div
                  className="border border-[#C5BEB0] rounded-[4px] overflow-hidden bg-[#F4EFE4]"
                  data-testid="resolved-weak-topics-section"
                >
                  <div className="px-4 py-3 bg-[#EAE4D7] flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setResolvedSectionOpen((v) => !v)}
                      aria-expanded={resolvedSectionOpen}
                      className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#1C1B18] hover:text-[#6B21A8]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                      <span>
                        Resolved ({resolvedEntries.length}
                        {sourceFilter !== 'all' ? ` in ${sourceFilter}` : ''})
                      </span>
                      {resolvedSectionOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={onClearAllResolved}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-rose-800 bg-[#FAF7F0] hover:bg-rose-50 border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Clear All Resolved</span>
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {resolvedSectionOpen && (
                      <motion.div
                        key="resolved-list"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden border-t border-[#C5BEB0]"
                      >
                        <div className="p-3.5 space-y-2.5">
                          {resolvedEntries.length === 0 ? (
                            <p className="text-xs font-mono text-[#6E695D] text-center py-2">
                              No resolved items in this source filter.
                            </p>
                          ) : (
                            resolvedEntries.map((entry) => renderEntryCard(entry, true))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

interface ClampedPromptProps {
  text: string;
  expanded: boolean;
  hideToggle: boolean;
  onToggle: () => void;
}

const ClampedPrompt: React.FC<ClampedPromptProps> = ({
  text,
  expanded,
  hideToggle,
  onToggle,
}) => {
  const ref = React.useRef<HTMLParagraphElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const check = () => {
      setIsTruncated(el.scrollHeight > el.clientHeight + 2);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [text, expanded]);

  return (
    <div className="space-y-1">
      <p
        ref={ref}
        className={`text-sm font-semibold text-[#1C1B18] leading-relaxed ${
          !expanded ? 'line-clamp-2' : ''
        }`}
      >
        {text}
      </p>
      {!hideToggle && (isTruncated || expanded) && (
        <button
          type="button"
          onClick={onToggle}
          className="text-xs font-mono font-bold text-[#6B21A8] hover:underline"
        >
          {expanded ? 'Show less' : 'Expand full question'}
        </button>
      )}
    </div>
  );
};
