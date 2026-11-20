import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  HelpCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react';
import { MODULES } from '../data/bacse202Data';
import { TOPIC_NOTES } from '../data/topicNotes';
import { MarkdownBlock, renderInlineMarkup } from './MarkdownBlock';
import { ConceptDiagram } from './ConceptDiagrams';
import {
  buildMasteryMilestoneMessage,
  generateConfettiParticles,
  getBurstLifetimeMs,
  MasteryMilestone,
} from '../utils/confettiEngine';
import {
  ConfettiBurstInstance,
  MasteryConfettiOverlay,
} from './MasteryConfettiOverlay';

import { LabId } from './InteractiveLabsView';

interface SyllabusViewProps {
  activeModuleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  onSelectModule: (id: 'm1' | 'm2' | 'm3' | 'm4' | 'm5') => void;
  masteredTopicIds: string[];
  onToggleTopicMastered: (topicId: string) => void;
  onNavigateToLab: (lab: LabId) => void;
  selfCheckSelections: Record<string, number>;
  onSelectSelfCheck: (key: string, optionIdx: number) => void;
  onResetTopicSelfChecks: (topicId: string, count: number) => void;
  onResetAllSelfChecks: () => void;
  focusedTopicId?: string | null;
  onClearFocusedTopic?: () => void;
  openMissedQueueSignal?: number;
}

const MODULE_DIVISION_PALETTE: Record<
  'm1' | 'm2' | 'm3' | 'm4' | 'm5',
  { hex: string; ink: string; name: string }
> = {
  m1: { hex: '#E5B82E', ink: '#1C1B18', name: 'DIV 01 · ARCHITECTURE & MODELS' },
  m2: { hex: '#E06D2B', ink: '#1C1B18', name: 'DIV 02 · ER & NORMALIZATION' },
  m3: { hex: '#4F8A3D', ink: '#FAF7F0', name: 'DIV 03 · STORAGE & QUERYING' },
  m4: { hex: '#147E7B', ink: '#FAF7F0', name: 'DIV 04 · TRANSACTIONS & RECOVERY' },
  m5: { hex: '#22559C', ink: '#FAF7F0', name: 'DIV 05 · DISTRIBUTED & NOSQL' },
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderHighlightedText(text: string, query: string): React.ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, idx) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark
        key={idx}
        className="bg-[#E5B82E] text-[#1C1B18] px-0.5 rounded-[2px] font-semibold"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
}

function extractMatchSnippet(text: string, query: string, radius = 65): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${suffix}`;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({
  activeModuleId,
  onSelectModule,
  masteredTopicIds,
  onToggleTopicMastered,
  onNavigateToLab,
  selfCheckSelections,
  onSelectSelfCheck,
  onResetTopicSelfChecks,
  onResetAllSelfChecks,
  focusedTopicId,
  onClearFocusedTopic,
  openMissedQueueSignal = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHighlightTerm, setActiveHighlightTerm] = useState('');
  const [showMissedQueue, setShowMissedQueue] = useState(false);
  const [expandedTopicIds, setExpandedTopicIds] = useState<string[]>(['m1-t1']);
  const [fullScreenTopicId, setFullScreenTopicId] = useState<string | null>(null);
  const [confettiBursts, setConfettiBursts] = useState<ConfettiBurstInstance[]>([]);
  const [celebrationToast, setCelebrationToast] = useState<{
    id: number;
    milestone: MasteryMilestone;
  } | null>(null);
  const [recentlyMasteredId, setRecentlyMasteredId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const burstSeqRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);
  const popTimerRef = useRef<number | null>(null);
  const burstTimersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      if (popTimerRef.current !== null) window.clearTimeout(popTimerRef.current);
      for (const timerId of burstTimersRef.current) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  const masteredSet = useMemo(() => new Set(masteredTopicIds), [masteredTopicIds]);
  const expandedSet = useMemo(() => new Set(expandedTopicIds), [expandedTopicIds]);

  const totalTopics = useMemo(
    () => MODULES.reduce((sum, m) => sum + m.topics.length, 0),
    []
  );

  // Aggregate all 68 topic self-check MCQs across Modules 1-5
  const allSelfChecks = useMemo(() => {
    const items: Array<{
      key: string;
      moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
      moduleNumber: number;
      topicId: string;
      topicTitle: string;
      scIdx: number;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }> = [];
    for (const mod of MODULES) {
      for (const topic of mod.topics) {
        const note = TOPIC_NOTES[topic.id];
        note?.selfChecks?.forEach((sc, scIdx) => {
          items.push({
            key: `${topic.id}-sc-${scIdx}`,
            moduleId: mod.id,
            moduleNumber: mod.number,
            topicId: topic.id,
            topicTitle: topic.title,
            scIdx,
            question: sc.question,
            options: sc.options,
            correctIndex: sc.correctIndex,
            explanation: sc.explanation,
          });
        });
      }
    }
    return items;
  }, []);

  const selfCheckStats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    const missed: typeof allSelfChecks = [];
    for (const item of allSelfChecks) {
      const chosen = selfCheckSelections[item.key];
      if (chosen !== undefined) {
        answered += 1;
        if (chosen === item.correctIndex) {
          correct += 1;
        } else {
          missed.push(item);
        }
      }
    }
    return { total: allSelfChecks.length, answered, correct, missed };
  }, [allSelfChecks, selfCheckSelections]);

  // Open missed queue when requested from Sprint Planner checklist
  useEffect(() => {
    if (openMissedQueueSignal > 0) {
      setSearchQuery('');
      setShowMissedQueue(true);
    }
  }, [openMissedQueueSignal]);

  // Focus & expand specific topic when navigated from FAT Mock solution tags
  useEffect(() => {
    if (!focusedTopicId) return;
    setSearchQuery('');
    setShowMissedQueue(false);
    setExpandedTopicIds((prev) =>
      prev.includes(focusedTopicId) ? prev : [...prev, focusedTopicId]
    );
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`topic-card-${focusedTopicId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    onClearFocusedTopic?.();
  }, [focusedTopicId, onClearFocusedTopic]);

  // Press '/' anywhere (outside inputs) to focus syllabus search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    return MODULES.flatMap((mod) =>
      mod.topics.flatMap((t) => {
        const note = TOPIC_NOTES[t.id];
        const jumpTargets: Array<{ label: string; anchorId: string; snippet: string }> = [];

        if (
          t.title.toLowerCase().includes(q) ||
          t.detail.toLowerCase().includes(q) ||
          mod.title.toLowerCase().includes(q)
        ) {
          jumpTargets.push({
            label: 'Topic Overview',
            anchorId: `topic-card-${t.id}`,
            snippet: extractMatchSnippet(`${t.title} — ${t.detail}`, q),
          });
        }

        if (note) {
          if (note.summary.toLowerCase().includes(q)) {
            jumpTargets.push({
              label: 'Executive Summary',
              anchorId: `topic-card-${t.id}`,
              snippet: extractMatchSnippet(note.summary, q),
            });
          }
          note.keyPoints.forEach((kp) => {
            if (kp.heading.toLowerCase().includes(q) || kp.text.toLowerCase().includes(q)) {
              jumpTargets.push({
                label: `Key Point: ${kp.heading.slice(0, 36)}`,
                anchorId: `topic-card-${t.id}`,
                snippet: extractMatchSnippet(`${kp.heading}: ${kp.text}`, q),
              });
            }
          });
          note.deepDiveSections?.forEach((sec, sIdx) => {
            const combined = [
              sec.title,
              sec.body,
              sec.codeOrDiagram ?? '',
              sec.markdownBlock ?? '',
              ...(sec.bullets ?? []),
              ...(sec.table?.rows.flat() ?? []),
            ].join(' ');
            if (combined.toLowerCase().includes(q)) {
              jumpTargets.push({
                label: `Deep Dive: ${sec.title.slice(0, 42)}`,
                anchorId: `sec-${t.id}-${sIdx}`,
                snippet: extractMatchSnippet(combined, q),
              });
            }
          });
          note.fatQuestionMethods?.forEach((fm, fIdx) => {
            const combined = [
              fm.sourcePaper,
              fm.questionPrompt,
              fm.codeBlock?.content ?? '',
              ...fm.solvingMethod,
            ].join(' ');
            if (combined.toLowerCase().includes(q)) {
              jumpTargets.push({
                label: `FAT Method: ${fm.sourcePaper.slice(0, 34)}`,
                anchorId: `fat-${t.id}-${fIdx}`,
                snippet: extractMatchSnippet(combined, q),
              });
            }
          });
          note.selfChecks?.forEach((sc, scIdx) => {
            const combined = `${sc.question} ${sc.explanation}`;
            if (combined.toLowerCase().includes(q)) {
              jumpTargets.push({
                label: `Self-Check Q${scIdx + 1}`,
                anchorId: `sc-${t.id}-${scIdx}`,
                snippet: extractMatchSnippet(combined, q),
              });
            }
          });
          if (
            note.examTip.toLowerCase().includes(q) ||
            note.exampleBody.toLowerCase().includes(q) ||
            note.sourceDecks.some((d) => d.toLowerCase().includes(q))
          ) {
            if (jumpTargets.length === 0) {
              jumpTargets.push({
                label: 'Exam Tip / Worked Trace',
                anchorId: `topic-card-${t.id}`,
                snippet: extractMatchSnippet(`${note.exampleBody} ${note.examTip}`, q),
              });
            }
          }
        }

        if (jumpTargets.length === 0) return [];
        return [{ mod, topic: t, jumpTargets: jumpTargets.slice(0, 4) }];
      })
    );
  }, [searchQuery]);

  const activeModule = useMemo(
    () => MODULES.find((m) => m.id === activeModuleId) ?? MODULES[0],
    [activeModuleId]
  );

  const activePalette = MODULE_DIVISION_PALETTE[activeModule.id];
  const moduleMasteredCount = activeModule.topics.filter((t) => masteredSet.has(t.id)).length;
  const allModuleTopicsExpanded = activeModule.topics.every((t) => expandedSet.has(t.id));

  // Close full-screen reader on Escape key & lock body scroll while open
  useEffect(() => {
    if (!fullScreenTopicId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullScreenTopicId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [fullScreenTopicId]);

  const toggleTopicNotes = (topicId: string) => {
    setExpandedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleExpandCollapseAll = () => {
    const modTopicIds = activeModule.topics.map((t) => t.id);
    if (allModuleTopicsExpanded) {
      setExpandedTopicIds((prev) => prev.filter((id) => !modTopicIds.includes(id)));
    } else {
      setExpandedTopicIds((prev) => Array.from(new Set([...prev, ...modTopicIds])));
    }
  };

  const handleSelectModuleWithSeed = (modId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5') => {
    onSelectModule(modId);
    const targetMod = MODULES.find((m) => m.id === modId);
    const firstTopicId = targetMod?.topics[0]?.id;
    if (firstTopicId && !expandedSet.has(firstTopicId)) {
      setExpandedTopicIds((prev) => [...prev, firstTopicId]);
    }
  };

  const jumpToTopicCard = (topicId: string) => {
    setExpandedTopicIds((prev) => (prev.includes(topicId) ? prev : [...prev, topicId]));
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`topic-card-${topicId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const openFullScreenTopic = (topicId: string) => {
    setExpandedTopicIds((prev) => (prev.includes(topicId) ? prev : [...prev, topicId]));
    setFullScreenTopicId(topicId);
  };

  const handleMasteryClick = (
    topicId: string,
    topicTitle: string,
    moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5',
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const wasMastered = masteredSet.has(topicId);
    onToggleTopicMastered(topicId);

    // Only celebrate when transitioning unmastered -> mastered
    if (wasMastered) return;

    const targetMod = MODULES.find((m) => m.id === moduleId) ?? activeModule;
    const prevModCount = targetMod.topics.filter((t) => masteredSet.has(t.id)).length;
    const newModCount = prevModCount + 1;
    const newTotalCount = masteredTopicIds.length + 1;

    const milestone = buildMasteryMilestoneMessage({
      topicTitle,
      moduleNumber: targetMod.number,
      newModuleMasteredCount: newModCount,
      moduleTotalTopics: targetMod.topics.length,
      newTotalMasteredCount: newTotalCount,
      totalSyllabusTopics: totalTopics,
    });

    const seq = ++burstSeqRef.current;
    const accentHex = MODULE_DIVISION_PALETTE[moduleId].hex;

    // Brief tactile pop on the mastered check button
    setRecentlyMasteredId(topicId);
    if (popTimerRef.current !== null) window.clearTimeout(popTimerRef.current);
    popTimerRef.current = window.setTimeout(() => {
      setRecentlyMasteredId((curr) => (curr === topicId ? null : curr));
    }, 340);

    // Non-blocking positive reinforcement status banner (accessible under reduced motion too)
    setCelebrationToast({ id: seq, milestone });
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setCelebrationToast((curr) => (curr && curr.id === seq ? null : curr));
    }, 2600);

    // Respect prefers-reduced-motion for particle motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const particles = generateConfettiParticles({
      seed: Date.now() ^ (seq * 2654435761),
      accentHex,
      intensity: milestone.kind === 'topic' ? 'subtle' : 'milestone',
      direction: originY < 110 ? 'down' : 'up',
    });

    const burst: ConfettiBurstInstance = {
      id: seq,
      originX,
      originY,
      particles,
      accentHex,
    };

    setConfettiBursts((prev) => [...prev.slice(-3), burst]);

    const lifetimeMs = getBurstLifetimeMs(particles);
    const cleanupId = window.setTimeout(() => {
      setConfettiBursts((prev) => prev.filter((b) => b.id !== seq));
      burstTimersRef.current = burstTimersRef.current.filter((id) => id !== cleanupId);
    }, lifetimeMs);
    burstTimersRef.current.push(cleanupId);
  };

  const renderTopicNoteContent = (topicId: string) => {
    const note = TOPIC_NOTES[topicId];
    if (!note) return null;

    return (
      <div
        className="space-y-8 text-sm text-[#1C1B18]"
        data-testid={`topic-notes-${topicId}`}
      >
        {/* Executive Summary & Ingested Sources */}
        <div className="space-y-2.5">
          <p className="prose-manual">
            {renderInlineMarkup(note.summary)}
          </p>
          <div className="text-xs font-mono text-[#6E695D]">
            <span className="font-semibold text-[#434038]">FOLIO SOURCES: </span>
            {note.sourceDecks.join(' · ')}
          </div>
        </div>

        {/* Core Pillars (Hairline Manual Specification Grid — No decorative 01. numbers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-5 pt-2">
          {note.keyPoints.map((kp, idx) => (
            <div key={idx} className="border-t border-[#1C1B18] pt-3.5 space-y-1.5">
              <div className="text-xs sm:text-sm font-bold text-[#1C1B18] tracking-tight">
                {renderInlineMarkup(kp.heading)}
              </div>
              <p className="text-xs sm:text-sm text-[#434038] leading-relaxed">
                {renderInlineMarkup(kp.text)}
              </p>
            </div>
          ))}
        </div>

        {/* Complete Study Notes & Reference Tables */}
        {note.deepDiveSections && note.deepDiveSections.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-[#1C1B18]" data-testid={`deep-dive-${topicId}`}>
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-base font-bold text-[#1C1B18] tracking-tight">
                Complete Study Notes &amp; Reference Tables
              </h4>
              <span className="text-xs font-mono text-[#6E695D] tabular-nums">
                {note.deepDiveSections.length} SECTION{note.deepDiveSections.length === 1 ? '' : 'S'}
              </span>
            </div>

            <div className="divide-y divide-[#C5BEB0]">
              {note.deepDiveSections.map((sec, sIdx) => {
                const sectionMatchesHighlight =
                  Boolean(activeHighlightTerm) &&
                  `${sec.title} ${sec.body} ${(sec.bullets ?? []).join(' ')} ${sec.markdownBlock ?? ''}`
                    .toLowerCase()
                    .includes(activeHighlightTerm.toLowerCase());
                return (
                  <div
                    key={sIdx}
                    id={`sec-${topicId}-${sIdx}`}
                    className={`py-5 first:pt-1 last:pb-0 space-y-3.5 scroll-mt-24 ${
                      sectionMatchesHighlight
                        ? 'bg-[#E5B82E]/15 -mx-3 px-3 rounded-[4px] border-l-4 border-[#E5B82E]'
                        : ''
                    }`}
                  >
                    <h5 className="text-sm sm:text-base font-bold text-[#1C1B18]">
                      {activeHighlightTerm
                        ? renderHighlightedText(sec.title, activeHighlightTerm)
                        : renderInlineMarkup(sec.title)}
                    </h5>
                    <p className="prose-manual">
                      {activeHighlightTerm
                        ? renderHighlightedText(sec.body, activeHighlightTerm)
                        : renderInlineMarkup(sec.body)}
                    </p>

                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-[#1C1B18] leading-relaxed marker:text-[#1C1B18] prose-measure">
                      {sec.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{renderInlineMarkup(bullet)}</li>
                      ))}
                    </ul>
                  )}

                  {sec.table && (
                    <div className="overflow-x-auto border border-[#1C1B18] rounded-[4px] bg-[#FAF7F0]">
                      <table className="w-full text-left border-collapse text-xs sm:text-[13px] tabular-nums">
                        <thead>
                          <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-[#1C1B18]">
                            {sec.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="py-2.5 px-3.5 font-bold whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C5BEB0] text-[#1C1B18]">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#F4EFE4] transition-colors">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-2.5 px-3.5 align-top leading-relaxed ${
                                    cIdx === 0 ? 'font-semibold text-[#1C1B18]' : 'text-[#434038]'
                                  }`}
                                >
                                  {renderInlineMarkup(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {sec.diagramId && (
                    <ConceptDiagram
                      id={sec.diagramId}
                      caption={sec.diagramCaption}
                    />
                  )}

                  {sec.markdownBlock && (
                    <MarkdownBlock content={sec.markdownBlock} />
                  )}

                  {sec.codeOrDiagram && (
                    <div className="rounded-[4px] border border-[#1C1B18] bg-[#26231E] overflow-hidden">
                      {sec.codeLanguage && (
                        <div className="px-3.5 py-1.5 bg-[#1C1B18] border-b border-[#434038] text-[11px] font-mono text-[#E5B82E]">
                          {sec.codeLanguage}
                        </div>
                      )}
                      <pre className="font-mono text-xs text-[#FAF7F0] p-4 overflow-x-auto whitespace-pre leading-relaxed">
                        {sec.codeOrDiagram}
                      </pre>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Worked Trace / Concrete Example */}
        <div className="pt-6 border-t border-[#1C1B18] space-y-3">
          <h4 className="text-sm sm:text-base font-bold text-[#1C1B18]">
            {renderInlineMarkup(note.exampleTitle)}
          </h4>
          {note.exampleDiagramId && (
            <ConceptDiagram
              id={note.exampleDiagramId}
              caption={note.exampleDiagramCaption}
            />
          )}
          <MarkdownBlock content={note.exampleBody} />
        </div>

        {/* FAT Exam Question-Solving Method */}
        {note.fatQuestionMethods && note.fatQuestionMethods.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#1C1B18]" data-testid={`fat-methods-${topicId}`}>
            <div className="flex items-center gap-2 text-base font-bold text-[#1C1B18]">
              <FileCheck2 className="w-4 h-4 text-[#1C1B18] shrink-0" aria-hidden="true" />
              <h4>FAT Exam Question-Solving Method</h4>
            </div>

            <div className="space-y-4">
              {note.fatQuestionMethods.map((fm, fIdx) => (
                <div
                  key={fIdx}
                  id={`fat-${topicId}-${fIdx}`}
                  className="border border-[#1C1B18] rounded-[4px] bg-[#F4EFE4] p-4 sm:p-5 space-y-4 scroll-mt-24"
                >
                  <div className="space-y-2 border-b border-[#C5BEB0] pb-3.5">
                    <div className="text-xs sm:text-sm font-semibold text-[#1C1B18] whitespace-pre-line leading-relaxed prose-measure">
                      {renderInlineMarkup(fm.questionPrompt)}
                    </div>
                    <div className="text-xs font-mono font-semibold text-[#434038] tabular-nums">
                      SOURCE PAPER: {fm.sourcePaper}
                    </div>
                  </div>

                  <ol className="space-y-2 text-xs sm:text-sm text-[#1C1B18] leading-relaxed prose-measure">
                    {fm.solvingMethod.map((step, stepIdx) => (
                      <li key={stepIdx} className="whitespace-pre-wrap">
                        {renderInlineMarkup(step)}
                      </li>
                    ))}
                  </ol>

                  {fm.codeBlock && (
                    <div className="space-y-2.5 pt-2">
                      <div className="text-xs sm:text-sm font-bold text-[#1C1B18]">
                        {renderInlineMarkup(fm.codeBlock.title)}
                      </div>
                      {fm.codeBlock.diagramId && (
                        <ConceptDiagram
                          id={fm.codeBlock.diagramId}
                          caption={fm.codeBlock.diagramCaption}
                        />
                      )}
                      {fm.codeBlock.content && (
                        fm.codeBlock.language && fm.codeBlock.language !== 'markdown' ? (
                          <div className="rounded-[4px] border border-[#1C1B18] bg-[#26231E] overflow-hidden">
                            <div className="px-3.5 py-1.5 bg-[#1C1B18] border-b border-[#434038] text-[11px] font-mono text-[#E5B82E]">
                              {fm.codeBlock.language}
                            </div>
                            <pre className="font-mono text-xs text-[#FAF7F0] p-4 overflow-x-auto whitespace-pre leading-relaxed">
                              {fm.codeBlock.content}
                            </pre>
                          </div>
                        ) : (
                          <MarkdownBlock content={fm.codeBlock.content} />
                        )
                      )}
                    </div>
                  )}

                  {fm.commonPitfalls && (
                    <div className="pt-3 border-t border-[#C5BEB0] text-xs text-[#1C1B18] leading-relaxed prose-measure">
                      <span className="font-bold text-[#854D2B]">SCORING &amp; PITFALL WATCH: </span>
                      {renderInlineMarkup(fm.commonPitfalls)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Self-Check Revision Practice */}
        {note.selfChecks && note.selfChecks.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#1C1B18]" data-testid={`self-checks-${topicId}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-base font-bold text-[#1C1B18]">
                <HelpCircle className="w-4 h-4 text-[#1C1B18] shrink-0" aria-hidden="true" />
                <h4>Self-Check Revision Practice ({note.selfChecks.length})</h4>
              </div>
              {note.selfChecks.some((_, idx) => selfCheckSelections[`${topicId}-sc-${idx}`] !== undefined) && (
                <button
                  type="button"
                  onClick={() => onResetTopicSelfChecks(topicId, note.selfChecks?.length ?? 0)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#434038] hover:text-[#1C1B18]"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {note.selfChecks.map((sc, scIdx) => {
                const key = `${topicId}-sc-${scIdx}`;
                const chosen = selfCheckSelections[key];
                const answered = chosen !== undefined;
                const isCorrect = answered && chosen === sc.correctIndex;

                return (
                  <div
                    key={key}
                    id={`sc-${topicId}-${scIdx}`}
                    className="border border-[#1C1B18] rounded-[4px] p-4 space-y-3 bg-[#F4EFE4] flex flex-col justify-between scroll-mt-24"
                  >
                    <div className="space-y-3">
                      <div className="text-xs sm:text-sm font-bold text-[#1C1B18] leading-relaxed">
                        Q{scIdx + 1}. {renderInlineMarkup(sc.question)}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {sc.options.map((opt, oIdx) => {
                          const selectedThis = chosen === oIdx;
                          const rightOption = oIdx === sc.correctIndex;
                          let btnStyle =
                            'bg-[#FAF7F0] border-[#C5BEB0] text-[#1C1B18] hover:border-[#1C1B18] hover:bg-[#EAE4D7]';
                          if (answered) {
                            if (rightOption) {
                              btnStyle = 'bg-[#4F8A3D]/15 border-[#4F8A3D] text-[#1C1B18] font-bold';
                            } else if (selectedThis) {
                              btnStyle = 'bg-[#A62B2B]/15 border-[#A62B2B] text-[#1C1B18]';
                            } else {
                              btnStyle = 'bg-[#FAF7F0] border-[#C5BEB0] text-[#6E695D]';
                            }
                          }
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => onSelectSelfCheck(key, oIdx)}
                              className={`w-full text-left px-3 py-2 text-xs rounded-[4px] border step-hinge flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span>
                                <span className="font-mono font-bold mr-2">
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                {renderInlineMarkup(opt)}
                              </span>
                              {answered && rightOption && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#4F8A3D] shrink-0" aria-hidden="true" />
                              )}
                              {answered && selectedThis && !rightOption && (
                                <XCircle className="w-3.5 h-3.5 text-[#A62B2B] shrink-0" aria-hidden="true" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {answered && (
                      <div
                        className={`text-xs rounded-[4px] p-3 border leading-relaxed ${
                          isCorrect
                            ? 'bg-[#FAF7F0] border-[#4F8A3D] text-[#1C1B18]'
                            : 'bg-[#FAF7F0] border-[#1C1B18] text-[#1C1B18]'
                        }`}
                      >
                        <span className="font-bold">
                          {isCorrect ? 'Correct: ' : `Answer ${String.fromCharCode(65 + sc.correctIndex)}: `}
                        </span>
                        {renderInlineMarkup(sc.explanation)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Exam Tip Footer */}
        <div className="pt-4 border-t border-[#1C1B18] text-xs sm:text-sm text-[#1C1B18] leading-relaxed prose-measure">
          <span className="font-bold text-[#1C1B18] bg-[#E5B82E] px-1.5 py-0.5 rounded-[2px] mr-2">
            FAT EXAM TIP
          </span>
          {renderInlineMarkup(note.examTip)}
        </div>
      </div>
    );
  };

  // Resolve full-screen topic metadata across active module (or any module)
  const fullScreenContext = useMemo(() => {
    if (!fullScreenTopicId) return null;
    for (const mod of MODULES) {
      const idx = mod.topics.findIndex((t) => t.id === fullScreenTopicId);
      if (idx !== -1) {
        return {
          mod,
          topic: mod.topics[idx],
          prevTopic: idx > 0 ? mod.topics[idx - 1] : null,
          nextTopic: idx < mod.topics.length - 1 ? mod.topics[idx + 1] : null,
          index: idx,
        };
      }
    }
    return null;
  }, [fullScreenTopicId]);

  return (
    <div className="space-y-6 w-full">
      {/* Header + Search + Persisted Self-Check Queue Toggle (h1 FIRST — zero eyebrow above h1) */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1B18]">
              BACSE202 Syllabus &amp; Topic Notes
            </h1>
            <p className="text-xs font-mono text-[#6E695D] tabular-nums">
              MODULES 1–5 · {masteredTopicIds.length} / {totalTopics} TOPICS MASTERED · {selfCheckStats.answered} / {selfCheckStats.total} SELF-CHECKS SAVED · PRESS [/] TO SEARCH
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <label htmlFor="syllabus-search" className="sr-only">
              Search syllabus topics and notes
            </label>
            <Search
              className="w-4 h-4 text-[#6E695D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="syllabus-search"
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) setShowMissedQueue(false);
              }}
              placeholder="Search BCNF, Thomas, LSM, 2PL... (/)"
              className="w-full h-10 pl-10 pr-4 text-sm bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] placeholder:text-[#6E695D] focus:outline-none focus:bg-[#FAF7F0]"
            />
          </div>
        </div>

        {/* Persisted Self-Check Progress & Cross-Topic Missed Queue Bar */}
        <div className="pt-3 border-t border-[#C5BEB0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
            <span
              data-testid="self-check-progress-pill"
              className="px-2.5 py-1 bg-[#EAE4D7] border border-[#1C1B18] rounded-[3px] font-bold text-[#1C1B18]"
            >
              Topic MCQs: {selfCheckStats.correct} correct / {selfCheckStats.answered} attempted ({selfCheckStats.total} total)
            </span>
            {activeHighlightTerm && !searchQuery && (
              <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E5B82E] border border-[#1C1B18] rounded-[3px] font-bold text-[#1C1B18]">
                <span>Highlighting: &quot;{activeHighlightTerm}&quot;</span>
                <button
                  type="button"
                  onClick={() => setActiveHighlightTerm('')}
                  className="underline"
                >
                  Clear
                </button>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowMissedQueue((v) => !v);
              }}
              data-testid="missed-queue-toggle"
              className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap tabular-nums ${
                showMissedQueue
                  ? 'bg-[#1C1B18] text-[#FAF7F0]'
                  : selfCheckStats.missed.length > 0
                  ? 'bg-[#A62B2B] text-[#FAF7F0] hover:bg-[#8d2424]'
                  : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
              }`}
            >
              {showMissedQueue
                ? 'Back to Module Notes'
                : `Missed-Question Queue (${selfCheckStats.missed.length})`}
            </button>
            {selfCheckStats.answered > 0 && (
              <button
                type="button"
                onClick={onResetAllSelfChecks}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#434038] bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] step-hinge"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>Reset All 68</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cross-Topic Missed-Question Queue View */}
      {showMissedQueue && !searchResults ? (
        <section className="space-y-4" data-testid="missed-question-queue">
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-[#1C1B18]">
                Cross-Topic Missed-Question Queue ({selfCheckStats.missed.length})
              </h2>
              <p className="text-xs font-mono text-[#6E695D]">
                PERSISTED ACROSS ALL 5 MODULES · RE-ANSWER CORRECTLY TO CLEAR FROM QUEUE
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMissedQueue(false)}
              className="px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] border border-[#1C1B18] rounded-[4px] step-hinge"
            >
              Return to Syllabus
            </button>
          </div>

          {selfCheckStats.missed.length === 0 ? (
            <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-10 text-center space-y-2">
              <p className="text-sm font-bold text-[#1C1B18]">
                Zero missed self-check questions right now.
              </p>
              <p className="text-xs text-[#6E695D]">
                Practice self-check MCQs inside any topic card; any wrong answer is automatically queued here for targeted revision.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selfCheckStats.missed.map((item) => {
                const palette = MODULE_DIVISION_PALETTE[item.moduleId];
                const chosen = selfCheckSelections[item.key];
                return (
                  <div
                    key={item.key}
                    className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span
                          style={{ backgroundColor: palette.hex, color: palette.ink }}
                          className="px-2 py-0.5 font-bold rounded-[2px] border border-[#1C1B18]"
                        >
                          Module {item.moduleNumber}
                        </span>
                        <span className="font-bold text-[#1C1B18]">{item.topicTitle}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectModule(item.moduleId);
                          setShowMissedQueue(false);
                          jumpToTopicCard(item.topicId);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#EAE4D7] hover:bg-[#E5B82E] border border-[#1C1B18] rounded-[3px] step-hinge"
                      >
                        <span>Open Topic Notes</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="text-sm font-bold text-[#1C1B18] leading-relaxed">
                      {renderInlineMarkup(item.question)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {item.options.map((opt, oIdx) => {
                        const isPickedWrong = chosen === oIdx && oIdx !== item.correctIndex;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => onSelectSelfCheck(item.key, oIdx)}
                            className={`text-left px-3 py-2 text-xs rounded-[4px] border step-hinge ${
                              isPickedWrong
                                ? 'bg-[#A62B2B]/15 border-[#A62B2B] text-[#1C1B18]'
                                : 'bg-[#F4EFE4] border-[#1C1B18] text-[#1C1B18] hover:bg-[#E5B82E]/30'
                            }`}
                          >
                            <span className="font-mono font-bold mr-2">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            {renderInlineMarkup(opt)}
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-xs bg-[#F4EFE4] border border-[#C5BEB0] rounded-[4px] p-3 text-[#434038] leading-relaxed">
                      <span className="font-bold text-[#1C1B18]">Explanation: </span>
                      {renderInlineMarkup(item.explanation)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : searchResults ? (
        <section className="space-y-3" aria-label="Search results" data-testid="syllabus-search-results">
          <div className="flex items-center justify-between text-xs font-mono text-[#434038]">
            <span className="tabular-nums">
              {searchResults.length} MATCHING TOPIC{searchResults.length === 1 ? '' : 'S'} FOR &quot;{searchQuery}&quot;
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveHighlightTerm('');
              }}
              className="text-[#1C1B18] underline font-bold"
            >
              Clear search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-8 text-center text-sm text-[#434038]">
              No syllabus topics matched &quot;{searchQuery}&quot;. Try keywords like &quot;Integrity&quot;, &quot;Minimal Cover&quot;, &quot;Thomas&quot;, &quot;LSM&quot;, or &quot;2PC&quot;.
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map(({ mod, topic, jumpTargets }) => {
                const palette = MODULE_DIVISION_PALETTE[mod.id];
                const jumpToMatchAnchor = (anchorId: string) => {
                  const term = searchQuery.trim();
                  setActiveHighlightTerm(term);
                  onSelectModule(mod.id);
                  setExpandedTopicIds((prev) =>
                    prev.includes(topic.id) ? prev : [...prev, topic.id]
                  );
                  setSearchQuery('');
                  window.setTimeout(() => {
                    const el = document.getElementById(anchorId) ?? document.getElementById(`topic-card-${topic.id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 60);
                };

                return (
                  <div
                    key={topic.id}
                    className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <h2 className="text-base font-bold text-[#1C1B18]">
                          {renderHighlightedText(topic.title, searchQuery)}
                        </h2>
                        <p className="text-sm text-[#434038]">
                          {renderHighlightedText(topic.detail, searchQuery)}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#6E695D]">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-[#1C1B18] inline-block"
                            style={{ backgroundColor: palette.hex }}
                            aria-hidden="true"
                          />
                          <span>Module {mod.number}</span>
                          <span aria-hidden="true">·</span>
                          <span>{topic.fatWeight}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => jumpToMatchAnchor(`topic-card-${topic.id}`)}
                        className="px-3 py-2 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] whitespace-nowrap shrink-0 step-hinge"
                      >
                        Open Notes
                      </button>
                    </div>

                    {/* Matched Deep-Dive Snippets & Sub-Section Jump Badges */}
                    <div className="pt-2.5 border-t border-[#C5BEB0] space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {jumpTargets.map((jt, jIdx) => (
                          <button
                            key={jIdx}
                            type="button"
                            onClick={() => jumpToMatchAnchor(jt.anchorId)}
                            className="px-2 py-1 text-[11px] font-mono font-bold text-[#1C1B18] bg-[#EAE4D7] hover:bg-[#E5B82E] border border-[#1C1B18] rounded-[3px] step-hinge"
                          >
                            Jump → {jt.label}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {jumpTargets.slice(0, 2).map((jt, jIdx) => (
                          <p
                            key={jIdx}
                            className="text-xs text-[#434038] bg-[#F4EFE4] border border-[#C5BEB0] rounded-[3px] px-3 py-1.5 leading-relaxed"
                          >
                            <span className="font-mono font-bold text-[#1C1B18] mr-1.5">
                              [{jt.label}]
                            </span>
                            {renderHighlightedText(jt.snippet, searchQuery)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Module Division Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {MODULES.map((mod) => {
              const active = mod.id === activeModule.id;
              const palette = MODULE_DIVISION_PALETTE[mod.id];
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModuleWithSeed(mod.id)}
                  style={
                    active
                      ? { backgroundColor: palette.hex, color: palette.ink }
                      : undefined
                  }
                  className={`px-3.5 py-2.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge flex items-center justify-between gap-2 tabular-nums ${
                    active
                      ? ''
                      : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#F4EFE4]'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-[#1C1B18] shrink-0"
                      style={{ backgroundColor: palette.hex }}
                      aria-hidden="true"
                    />
                    <span className="truncate">Module {mod.number}</span>
                  </span>
                  <span className="font-mono text-[11px] opacity-85 shrink-0">{mod.hours}h</span>
                </button>
              );
            })}
          </div>

          {/* Full-Screen Width Syllabus & Topic Notes */}
          <div className="space-y-4 w-full" data-testid="syllabus-full-width-notes">
            <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden">
              {/* Division Color Band */}
              <div
                className="px-5 py-2 border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold"
                style={{ backgroundColor: activePalette.hex, color: activePalette.ink }}
              >
                <span>
                  {activePalette.name} · MODULE {activeModule.number} ({activeModule.hours} LECTURE HOURS)
                </span>
                <span className="tabular-nums">
                  {moduleMasteredCount} / {activeModule.topics.length} TOPICS MASTERED
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1B18] tracking-tight">
                      {activeModule.title}
                    </h2>
                    <p className="prose-manual">{activeModule.examFocus}</p>
                    <div className="text-xs font-mono text-[#6E695D] tabular-nums pt-1">
                      Module {activeModule.number} · {activeModule.hours} Lecture Hours · {moduleMasteredCount}/{activeModule.topics.length} Mastered
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleExpandCollapseAll}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#EAE4D7] hover:bg-[#ded6c6] border border-[#1C1B18] rounded-[4px] whitespace-nowrap step-hinge"
                    >
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{allModuleTopicsExpanded ? 'Collapse All Notes' : 'Expand All Notes'}</span>
                    </button>
                    {activeModule.recommendedLab && (
                      <button
                        type="button"
                        onClick={() => onNavigateToLab(activeModule.recommendedLab!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] whitespace-nowrap step-hinge"
                      >
                        <span>Practice Lab</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Topic Jump Bar */}
                <div
                  aria-label="Module topic jump bar"
                  className="pt-3 border-t border-[#C5BEB0] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
                >
                  <span className="font-mono font-bold text-[#6E695D]">INDEX:</span>
                  {activeModule.topics.map((t, idx) => {
                    const isOpen = expandedSet.has(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => jumpToTopicCard(t.id)}
                        className={`inline-flex items-center gap-1.5 font-semibold step-hinge ${
                          isOpen
                            ? 'text-[#1C1B18]'
                            : 'text-[#434038] hover:text-[#1C1B18]'
                        }`}
                      >
                        <span className="font-mono text-[11px] text-[#6E695D] tabular-nums">
                          {activeModule.number}.{idx + 1}
                        </span>
                        <span className="underline decoration-[#1C1B18] underline-offset-4">
                          {t.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {activeModule.topics.map((topic, tIdx) => {
                const isMastered = masteredSet.has(topic.id);
                const isExpanded = expandedSet.has(topic.id);
                const note = TOPIC_NOTES[topic.id];

                return (
                  <div
                    key={topic.id}
                    id={`topic-card-${topic.id}`}
                    className={`border border-[#1C1B18] rounded-[4px] p-5 sm:p-7 scroll-mt-20 ${
                      isMastered ? 'bg-[#F4EFE4]' : 'bg-[#FAF7F0]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={(e) =>
                            handleMasteryClick(topic.id, topic.title, activeModule.id, e)
                          }
                          aria-label={isMastered ? `Unmark "${topic.title}"` : `Mark "${topic.title}" mastered`}
                          aria-pressed={isMastered}
                          className={`mt-0.5 w-6 h-6 rounded-full border border-[#1C1B18] flex items-center justify-center shrink-0 step-hinge ${
                            isMastered
                              ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                              : 'bg-[#FAF7F0] hover:bg-[#EAE4D7] text-transparent'
                          } ${recentlyMasteredId === topic.id ? 'mastery-check-pop' : ''}`}
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-extrabold text-[#1C1B18] tracking-tight">
                            {topic.title}
                          </h3>
                          <p className="prose-manual">{topic.detail}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#6E695D] tabular-nums pt-0.5">
                            <span>
                              Topic {activeModule.number}.{tIdx + 1}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-bold text-[#1C1B18]">{topic.fatWeight}</span>
                            {isMastered && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-bold text-[#4F8A3D]">MASTERED</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {note && (
                        <div className="flex items-center gap-2 shrink-0 pl-9.5 sm:pl-0">
                          <button
                            type="button"
                            onClick={() => openFullScreenTopic(topic.id)}
                            aria-label={`Open full screen notes for ${topic.title}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#EAE4D7] hover:bg-[#ded6c6] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                          >
                            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Full Screen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleTopicNotes(topic.id)}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? `Hide notes for ${topic.title}` : `Read notes for ${topic.title}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                          >
                            <span>{isExpanded ? 'Hide Notes' : 'Read Notes'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {isExpanded && note && (
                      <div className="mt-6 pt-6 border-t border-[#1C1B18]">
                        {renderTopicNoteContent(topic.id)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Distraction-Free Full Screen Note Reader */}
      {fullScreenContext && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Full screen notes: ${fullScreenContext.topic.title}`}
          data-testid="fullscreen-note-reader"
          className="fixed inset-0 z-50 bg-[#EAE4D7] overflow-y-auto"
        >
          <div className="sticky top-0 z-10 bg-[#FAF7F0] border-b border-[#1C1B18] px-4 sm:px-8 lg:px-12 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-[#1C1B18] truncate">
                {fullScreenContext.topic.title}
              </h2>
              <div className="text-xs font-mono text-[#6E695D] tabular-nums">
                Module {fullScreenContext.mod.number} · Topic {fullScreenContext.index + 1} of{' '}
                {fullScreenContext.mod.topics.length} · {fullScreenContext.topic.fatWeight}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={!fullScreenContext.prevTopic}
                onClick={() =>
                  fullScreenContext.prevTopic && openFullScreenTopic(fullScreenContext.prevTopic.id)
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] hover:bg-[#EAE4D7] disabled:opacity-40 disabled:pointer-events-none step-hinge"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={!fullScreenContext.nextTopic}
                onClick={() =>
                  fullScreenContext.nextTopic && openFullScreenTopic(fullScreenContext.nextTopic.id)
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] hover:bg-[#EAE4D7] disabled:opacity-40 disabled:pointer-events-none step-hinge"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) =>
                  handleMasteryClick(
                    fullScreenContext.topic.id,
                    fullScreenContext.topic.title,
                    fullScreenContext.mod.id,
                    e
                  )
                }
                aria-pressed={masteredSet.has(fullScreenContext.topic.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                  masteredSet.has(fullScreenContext.topic.id)
                    ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                    : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                } ${recentlyMasteredId === fullScreenContext.topic.id ? 'mastery-check-pop' : ''}`}
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {masteredSet.has(fullScreenContext.topic.id) ? 'Mastered' : 'Mark Mastered'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFullScreenTopicId(null)}
                aria-label="Exit full screen notes"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#FAF7F0] bg-[#1C1B18] hover:bg-[#26231E] rounded-[4px] step-hinge"
              >
                <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Exit Full Screen</span>
              </button>
            </div>
          </div>

          <div className="w-full px-4 sm:px-8 lg:px-14 py-6 sm:py-8">
            <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 sm:p-10 space-y-6">
              <p className="prose-manual">
                {fullScreenContext.topic.detail}
              </p>
              <div className="pt-5 border-t border-[#1C1B18]">
                {renderTopicNoteContent(fullScreenContext.topic.id)}
              </div>
            </div>
          </div>
        </div>
      )}

      <MasteryConfettiOverlay bursts={confettiBursts} toast={celebrationToast} />
    </div>
  );
};
