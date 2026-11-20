import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { FLASHCARD_DECK, FlashcardModule } from '../utils/erFlashcardEngine';
import {
  buildStudyQueue,
  classifyCardStatus,
  computeRetentionForecast,
  computeSrsDeckMetrics,
  formatNextReviewPhrase,
  formatRelativeDue,
  formatReviewDateShort,
  previewRatingIntervals,
  SrsMode,
  SrsProgressMap,
  SrsQueueFilter,
  SrsRating,
} from '../utils/srsEngine';

interface RapidFlashcardDeckProps {
  srsProgress: SrsProgressMap;
  srsMode: SrsMode;
  onRateCard: (cardId: string, rating: SrsRating) => void;
  onChangeMode: (mode: SrsMode) => void;
  onResetSrs: () => void;
}

const MODULE_FILTERS: Array<{ id: 'all' | FlashcardModule; label: string }> = [
  { id: 'all', label: 'All (24)' },
  { id: 'm1', label: 'M1' },
  { id: 'm2', label: 'M2' },
  { id: 'm3', label: 'M3' },
  { id: 'm4', label: 'M4' },
  { id: 'm5', label: 'M5' },
];

const MODULE_BADGE_COLORS: Record<FlashcardModule, { hex: string; ink: string }> = {
  m1: { hex: '#E5B82E', ink: '#1C1B18' },
  m2: { hex: '#E06D2B', ink: '#1C1B18' },
  m3: { hex: '#4F8A3D', ink: '#FAF7F0' },
  m4: { hex: '#147E7B', ink: '#FAF7F0' },
  m5: { hex: '#22559C', ink: '#FAF7F0' },
};

const RATING_META: Array<{
  rating: SrsRating;
  keyHint: string;
  label: string;
  subtitle: string;
  accentBg: string;
  accentInk: string;
}> = [
  {
    rating: 'again',
    keyHint: '1',
    label: 'Again',
    subtitle: 'Reset · relearn now',
    accentBg: 'bg-[#A62B2B]',
    accentInk: 'text-[#FAF7F0]',
  },
  {
    rating: 'hard',
    keyHint: '2',
    label: 'Hard',
    subtitle: 'Slow spacing · EF↓',
    accentBg: 'bg-[#E06D2B]',
    accentInk: 'text-[#1C1B18]',
  },
  {
    rating: 'good',
    keyHint: '3',
    label: 'Good',
    subtitle: 'Optimal SM-2 step',
    accentBg: 'bg-[#4F8A3D]',
    accentInk: 'text-[#FAF7F0]',
  },
  {
    rating: 'easy',
    keyHint: '4',
    label: 'Easy',
    subtitle: 'Bonus jump · EF↑',
    accentBg: 'bg-[#22559C]',
    accentInk: 'text-[#FAF7F0]',
  },
];

export const RapidFlashcardDeck: React.FC<RapidFlashcardDeckProps> = ({
  srsProgress,
  srsMode,
  onRateCard,
  onChangeMode,
  onResetSrs,
}) => {
  const [moduleFilter, setModuleFilter] = useState<'all' | FlashcardModule>('all');
  const [queueFilter, setQueueFilter] = useState<SrsQueueFilter>('due');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  // Refresh clock every 30s so due cards surface automatically during study sessions
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const deck = useMemo(
    () =>
      buildStudyQueue(FLASHCARD_DECK, srsProgress, {
        moduleFilter,
        queueFilter,
        nowMs,
      }),
    [moduleFilter, queueFilter, srsProgress, nowMs]
  );

  const metrics = useMemo(
    () => computeSrsDeckMetrics(FLASHCARD_DECK, srsProgress, nowMs),
    [srsProgress, nowMs]
  );

  const forecastBuckets = useMemo(
    () => computeRetentionForecast(FLASHCARD_DECK, srsProgress, nowMs),
    [srsProgress, nowMs]
  );

  const moduleCards = useMemo(
    () =>
      moduleFilter === 'all'
        ? FLASHCARD_DECK
        : FLASHCARD_DECK.filter((c) => c.moduleId === moduleFilter),
    [moduleFilter]
  );

  const safeIdx = deck.length === 0 ? 0 : Math.min(cardIndex, deck.length - 1);
  const activeCard = deck[safeIdx] ?? null;
  const activeState = activeCard ? srsProgress[activeCard.id] : undefined;
  const activeStatus = activeCard ? classifyCardStatus(activeState, nowMs) : 'new';

  const ratingPreviews = useMemo(() => {
    if (!activeCard) {
      return { again: '2m', hard: '20m', good: '1h', easy: '4h' } as Record<SrsRating, string>;
    }
    return previewRatingIntervals(activeState, activeCard.id, srsMode);
  }, [activeCard, activeState, srsMode]);

  const handleModuleChange = (mod: 'all' | FlashcardModule) => {
    setModuleFilter(mod);
    setCardIndex(0);
    setFlipped(false);
  };

  const handleQueueFilterChange = (qf: SrsQueueFilter) => {
    setQueueFilter(qf);
    setCardIndex(0);
    setFlipped(false);
  };

  const handleStep = useCallback(
    (delta: number) => {
      if (deck.length === 0) return;
      setCardIndex((prev) => (prev + delta + deck.length) % deck.length);
      setFlipped(false);
    },
    [deck.length]
  );

  const handleRate = useCallback(
    (rating: SrsRating) => {
      if (!activeCard) return;
      const preview = ratingPreviews[rating];
      const ratingLabel = rating.charAt(0).toUpperCase() + rating.slice(1);
      onRateCard(activeCard.id, rating);
      setNowMs(Date.now());
      setFlipped(false);
      setLastFeedback(
        `${activeCard.moduleId.toUpperCase()} card rated ${ratingLabel} · next review in ${preview}`
      );
      if (queueFilter === 'all' && deck.length > 1) {
        setCardIndex((prev) => (prev + 1) % deck.length);
      } else {
        // In 'due' or 'weak' queues, the rated card usually drops off or re-sorts; keep index anchored at 0
        setCardIndex(0);
      }
    },
    [activeCard, deck.length, onRateCard, queueFilter, ratingPreviews]
  );

  // Keyboard shortcuts: Space/Enter flips; 1-4 rates when flipped; Left/Right steps
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!activeCard) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped((v) => !v);
      } else if (e.key === 'ArrowRight') {
        handleStep(1);
      } else if (e.key === 'ArrowLeft') {
        handleStep(-1);
      } else if (flipped) {
        if (e.key === '1') handleRate('again');
        else if (e.key === '2') handleRate('hard');
        else if (e.key === '3') handleRate('good');
        else if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeCard, flipped, handleRate, handleStep]);

  const dueAndNewTotal = metrics.dueCount + metrics.newCount;

  return (
    <section
      data-testid="flashcard-deck"
      aria-label="SM-2 Spaced Repetition Flashcards"
      className="space-y-4"
    >
      {/* Top SRS Control, Scheduling Mode & Telemetry Strip */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-extrabold text-[#1C1B18] flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#22559C] shrink-0" aria-hidden="true" />
              <span>SM-2 Spaced Repetition Flashcards</span>
            </h2>
            <p className="text-xs font-mono text-[#6E695D]">
              ADAPTIVE EASE-FACTOR SCHEDULING · PRIORITIZES OVERDUE &amp; WEAK CONCEPTS FOR MAXIMUM FAT RETENTION
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {/* Scheduling Mode Toggle */}
            <div
              role="group"
              aria-label="Spaced repetition schedule profile"
              className="inline-flex border border-[#1C1B18] rounded-[4px] overflow-hidden bg-[#F4EFE4]"
            >
              <button
                type="button"
                data-testid="srs-mode-fat48h"
                aria-pressed={srsMode === 'fat48h'}
                onClick={() => onChangeMode('fat48h')}
                className={`px-2.5 py-1.5 text-xs font-mono font-bold step-hinge whitespace-nowrap ${
                  srsMode === 'fat48h'
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#FAF7F0] text-[#434038] hover:bg-[#EAE4D7]'
                }`}
              >
                48h FAT Crunch
              </button>
              <button
                type="button"
                data-testid="srs-mode-longterm"
                aria-pressed={srsMode === 'longterm'}
                onClick={() => onChangeMode('longterm')}
                className={`px-2.5 py-1.5 text-xs font-mono font-bold border-l border-[#1C1B18] step-hinge whitespace-nowrap ${
                  srsMode === 'longterm'
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#FAF7F0] text-[#434038] hover:bg-[#EAE4D7]'
                }`}
              >
                Long-Term SM-2
              </button>
            </div>

            <span
              data-testid="flashcard-ready-count"
              className="px-2.5 py-1.5 rounded-[4px] border border-[#1C1B18] bg-[#4F8A3D] text-[#FAF7F0] font-mono text-xs font-bold tabular-nums whitespace-nowrap"
            >
              {metrics.retainedCount} / {metrics.totalCount} Retained ({metrics.retentionPct}%)
            </span>

            {metrics.reviewedCount > 0 && (
              <button
                type="button"
                data-testid="srs-reset-btn"
                onClick={() => {
                  onResetSrs();
                  setCardIndex(0);
                  setFlipped(false);
                  setLastFeedback('SRS schedule reset — all 24 cards queued as New.');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] text-[#1C1B18] whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset SRS</span>
              </button>
            )}
          </div>
        </div>

        {/* 5-Metric SM-2 Memory Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] px-3 py-2">
            <div className="text-[10px] font-mono uppercase text-[#6E695D]">Due + New Queue</div>
            <div
              data-testid="srs-due-count"
              className="text-base font-mono font-extrabold text-[#1C1B18] tabular-nums"
            >
              {dueAndNewTotal}
              <span className="text-[11px] font-normal text-[#6E695D] ml-1">
                ({metrics.dueCount} due · {metrics.newCount} new)
              </span>
            </div>
          </div>

          <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] px-3 py-2">
            <div className="text-[10px] font-mono uppercase text-[#6E695D]">In Learning</div>
            <div className="text-base font-mono font-extrabold text-[#22559C] tabular-nums">
              {metrics.learningCount}
              <span className="text-[11px] font-normal text-[#6E695D] ml-1">scheduled</span>
            </div>
          </div>

          <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] px-3 py-2">
            <div className="text-[10px] font-mono uppercase text-[#6E695D]">Mastered (2+ Reps)</div>
            <div
              data-testid="srs-mastered-count"
              className="text-base font-mono font-extrabold text-[#4F8A3D] tabular-nums"
            >
              {metrics.masteredCount} / {metrics.totalCount}
            </div>
          </div>

          <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] px-3 py-2">
            <div className="text-[10px] font-mono uppercase text-[#6E695D]">Weak / Lapsed</div>
            <div
              data-testid="srs-weak-count"
              className={`text-base font-mono font-extrabold tabular-nums ${
                metrics.weakCount > 0 ? 'text-[#A62B2B]' : 'text-[#1C1B18]'
              }`}
            >
              {metrics.weakCount}
              <span className="text-[11px] font-normal text-[#6E695D] ml-1">
                {metrics.weakCount === 1 ? 'card' : 'cards'}
              </span>
            </div>
          </div>

          <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] px-3 py-2 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-mono uppercase text-[#6E695D]">Avg Ease (EF)</div>
            <div
              data-testid="srs-avg-ef"
              className="text-base font-mono font-extrabold text-[#1C1B18] tabular-nums"
            >
              {metrics.avgEaseFactor.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Visual 4-Window SRS Review Horizon Timeline */}
        <div
          data-testid="srs-forecast-strip"
          className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3 space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <span className="font-bold uppercase text-[#1C1B18] flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-[#22559C]" aria-hidden="true" />
              <span>SRS Review Horizon (24 Cards)</span>
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#434038] tabular-nums">
              {forecastBuckets.map((b) => (
                <span key={b.id} className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-[2px] border border-[#1C1B18] shrink-0"
                    style={{ backgroundColor: b.hex }}
                    aria-hidden="true"
                  />
                  <span>
                    {b.label}: <strong className="text-[#1C1B18]">{b.count}</strong>
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div
            role="img"
            aria-label={`SRS review distribution: ${forecastBuckets
              .map((b) => `${b.label} ${b.count}`)
              .join(', ')}`}
            className="h-2.5 w-full rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] overflow-hidden flex"
          >
            {forecastBuckets.map((b) =>
              b.count > 0 ? (
                <div
                  key={b.id}
                  style={{
                    width: `${(b.count / metrics.totalCount) * 100}%`,
                    backgroundColor: b.hex,
                  }}
                  title={`${b.label}: ${b.count} cards (${b.pct}%)`}
                  className="h-full border-r last:border-r-0 border-[#1C1B18]/40"
                />
              ) : null
            )}
          </div>
        </div>

        {/* Module & Queue Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1C1B18]/15">
          <div className="flex flex-wrap gap-1.5">
            {MODULE_FILTERS.map((f) => {
              const active = moduleFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleModuleChange(f.id)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                    active
                      ? 'bg-[#E5B82E] text-[#1C1B18]'
                      : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              data-testid="srs-filter-due"
              aria-pressed={queueFilter === 'due'}
              onClick={() => handleQueueFilterChange('due')}
              className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                queueFilter === 'due'
                  ? 'bg-[#E5B82E] text-[#1C1B18]'
                  : 'bg-[#FAF7F0] text-[#434038] hover:bg-[#EAE4D7]'
              }`}
            >
              Smart Due Queue ({dueAndNewTotal})
            </button>
            <button
              type="button"
              data-testid="srs-filter-all"
              aria-pressed={queueFilter === 'all'}
              onClick={() => handleQueueFilterChange('all')}
              className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                queueFilter === 'all'
                  ? 'bg-[#E5B82E] text-[#1C1B18]'
                  : 'bg-[#FAF7F0] text-[#434038] hover:bg-[#EAE4D7]'
              }`}
            >
              All 24 Cards
            </button>
            <button
              type="button"
              data-testid="srs-filter-weak"
              aria-pressed={queueFilter === 'weak'}
              onClick={() => handleQueueFilterChange('weak')}
              className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                queueFilter === 'weak'
                  ? 'bg-[#E5B82E] text-[#1C1B18]'
                  : 'bg-[#FAF7F0] text-[#434038] hover:bg-[#EAE4D7]'
              }`}
            >
              Weak / Lapsed ({metrics.weakCount})
            </button>
          </div>
        </div>
      </div>

      {/* Last Rating Confirmation Banner */}
      {lastFeedback && (
        <div
          data-testid="srs-last-feedback"
          className="px-4 py-2 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] flex items-center justify-between gap-2 text-xs font-mono text-[#1C1B18]"
        >
          <span className="flex items-center gap-2">
            <CalendarClock className="w-3.5 h-3.5 text-[#4F8A3D] shrink-0" aria-hidden="true" />
            <span>{lastFeedback}</span>
          </span>
          <span className="text-[11px] text-[#6E695D] hidden sm:inline">
            Shortcuts: Space = Flip · 1–4 = Rate
          </span>
        </div>
      )}

      {/* Active Flashcard Surface */}
      {!activeCard ? (
        <div
          data-testid="srs-queue-empty"
          className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-8 text-center space-y-3"
        >
          <CheckCircle2 className="w-8 h-8 text-[#4F8A3D] mx-auto" aria-hidden="true" />
          <p className="text-base font-extrabold text-[#1C1B18]">
            {queueFilter === 'weak'
              ? 'Zero weak or lapsed cards in this module!'
              : 'All due flashcards in this filter are scheduled ahead!'}
          </p>
          <p className="text-xs font-mono text-[#6E695D]">
            {queueFilter === 'due' && metrics.nextDueAt
              ? `Next scheduled review opens ${formatRelativeDue(
                  {
                    cardId: '',
                    repetitions: 1,
                    easeFactor: 2.5,
                    intervalMinutes: 60,
                    dueAt: metrics.nextDueAt,
                    lastReviewedAt: nowMs,
                    lapses: 0,
                    totalReviews: 1,
                    lastRating: 'good',
                  },
                  nowMs
                ).toLowerCase()}.`
              : 'Switch to All 24 Cards if you want to review ahead before the FAT exam.'}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleQueueFilterChange('all')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold bg-[#E5B82E] hover:bg-[#d8aa22] text-[#1C1B18] border border-[#1C1B18] rounded-[4px] step-hinge"
            >
              <span>Review Ahead (Browse All Cards)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden">
          <div className="px-5 py-3 bg-[#EAE4D7] border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                style={{
                  backgroundColor: MODULE_BADGE_COLORS[activeCard.moduleId].hex,
                  color: MODULE_BADGE_COLORS[activeCard.moduleId].ink,
                }}
                className="px-2 py-0.5 rounded-[3px] border border-[#1C1B18] font-mono text-[11px] font-bold uppercase"
              >
                {activeCard.moduleId}
              </span>
              <span className="px-2 py-0.5 rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] text-[#1C1B18] font-mono text-[11px] font-bold">
                {activeCard.category}
              </span>
              <span
                data-testid="active-status-badge"
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] border border-[#1C1B18] font-mono text-[10px] font-bold uppercase ${
                  activeStatus === 'mastered'
                    ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                    : activeStatus === 'due'
                    ? 'bg-[#A62B2B] text-[#FAF7F0]'
                    : activeStatus === 'learning'
                    ? 'bg-[#22559C] text-[#FAF7F0]'
                    : 'bg-[#FAF7F0] text-[#434038]'
                }`}
              >
                {activeStatus === 'mastered' && (
                  <Award className="w-3 h-3" aria-hidden="true" />
                )}
                <span>
                  {activeStatus === 'new'
                    ? 'New'
                    : activeStatus === 'due'
                    ? 'Due Now'
                    : activeStatus === 'mastered'
                    ? 'Mastered'
                    : 'Learning'}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#434038] tabular-nums">
              <span data-testid="srs-card-meta">
                Reps: <strong className="text-[#1C1B18]">{activeState?.repetitions ?? 0}</strong> ·
                EF:{' '}
                <strong className="text-[#1C1B18]">
                  {(activeState?.easeFactor ?? 2.5).toFixed(2)}
                </strong>
                {activeState && activeState.lapses > 0 && (
                  <span className="text-[#A62B2B] font-bold ml-1.5">
                    · Lapses: {activeState.lapses}
                  </span>
                )}
              </span>
              <span className="font-bold text-[#1C1B18]">
                Queue {safeIdx + 1} / {deck.length}
              </span>
            </div>
          </div>

          {/* Dedicated Per-Card SRS Scheduling & Mastery Ribbon */}
          <div
            data-testid="active-card-schedule-banner"
            className="px-5 py-2.5 bg-[#F4EFE4] border-b border-[#1C1B18]/25 flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                data-testid="active-next-review"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border border-[#1C1B18] font-bold tabular-nums ${
                  activeStatus === 'mastered'
                    ? 'bg-[#4F8A3D]/15 text-[#1C1B18]'
                    : activeStatus === 'due'
                    ? 'bg-[#A62B2B]/15 text-[#A62B2B]'
                    : 'bg-[#FAF7F0] text-[#1C1B18]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{formatNextReviewPhrase(activeState, nowMs)}</span>
              </span>
              {activeState && activeState.totalReviews > 0 && activeState.dueAt > nowMs && (
                <span className="text-[11px] text-[#6E695D] tabular-nums">
                  Scheduled: {formatReviewDateShort(activeState.dueAt, nowMs)}
                </span>
              )}
            </div>

            <div
              className="flex items-center gap-2 text-[11px] text-[#434038]"
              aria-label={`Mastery stage ${Math.min(2, activeState?.repetitions ?? 0)} of 2`}
            >
              <span>Mastery:</span>
              <div className="flex items-center gap-1">
                {[1, 2].map((step) => {
                  const filled =
                    (activeState?.repetitions ?? 0) >= step &&
                    activeState?.lastRating !== 'again';
                  return (
                    <span
                      key={step}
                      className={`w-4 h-2 rounded-[2px] border border-[#1C1B18] ${
                        filled ? 'bg-[#4F8A3D]' : 'bg-[#FAF7F0]'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="font-bold text-[#1C1B18] tabular-nums">
                {activeStatus === 'mastered'
                  ? 'Mastered'
                  : `${Math.min(2, activeState?.repetitions ?? 0)}/2 reps`}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Prompt Side */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase text-[#6E695D]">
                Active Recall Prompt
              </div>
              <p
                data-testid="flashcard-prompt"
                className="text-lg sm:text-xl font-extrabold text-[#1C1B18] leading-snug"
              >
                {activeCard.frontPrompt}
              </p>
            </div>

            {/* Answer Side + 4 SM-2 Recall Quality Rating Buttons */}
            {flipped ? (
              <div className="space-y-4">
                <div
                  data-testid="flashcard-answer"
                  className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 space-y-3"
                >
                  <div className="text-[11px] font-mono font-bold uppercase text-[#22559C]">
                    Verified FAT Answer
                  </div>
                  <p className="text-sm font-mono text-[#1C1B18] leading-relaxed">
                    {activeCard.backAnswer}
                  </p>
                  <div className="pt-2 border-t border-[#1C1B18]/20 text-xs text-[#434038]">
                    <span className="font-bold text-[#1C1B18]">Exam Hint: </span>
                    {activeCard.examHint}
                  </div>
                </div>

                {/* SM-2 Rating Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono font-bold uppercase text-[#434038]">
                    <span>Rate Your Recall Honesty (SM-2 Scheduler)</span>
                    <span className="text-[#6E695D]">
                      Profile: {srsMode === 'fat48h' ? '48h FAT Crunch' : 'Long-Term SM-2'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {RATING_META.map((btn) => (
                      <button
                        key={btn.rating}
                        type="button"
                        data-testid={`srs-rate-${btn.rating}`}
                        onClick={() => handleRate(btn.rating)}
                        className="group bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] p-3 text-left flex flex-col justify-between gap-2 step-hinge"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-[3px] border border-[#1C1B18] font-mono text-xs font-extrabold ${btn.accentBg} ${btn.accentInk}`}
                          >
                            {btn.label}
                          </span>
                          <span className="font-mono text-xs font-extrabold text-[#1C1B18] tabular-nums">
                            {ratingPreviews[btn.rating]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#434038]">
                          <span>{btn.subtitle}</span>
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#EAE4D7] border border-[#1C1B18]/30 text-[10px] font-bold text-[#1C1B18]">
                            {btn.keyHint}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#F4EFE4]/60 border border-dashed border-[#1C1B18]/40 rounded-[4px] p-6 text-center space-y-2.5">
                <button
                  type="button"
                  data-testid="flashcard-flip-btn"
                  onClick={() => setFlipped(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-[#E5B82E] hover:bg-[#d6a920] text-[#1C1B18] border border-[#1C1B18] rounded-[4px] step-hinge"
                >
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  <span>Flip Answer</span>
                </button>
                <p className="text-[11px] font-mono text-[#6E695D]">
                  Recall the exact formula or rule mentally first, then press Space or Flip Answer to grade yourself (1–4).
                </p>
              </div>
            )}

            {/* Browse / Utility Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1C1B18]/20">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] text-[#1C1B18]"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] text-[#1C1B18]"
                >
                  <span>Skip / Next</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {flipped && (
                <button
                  type="button"
                  onClick={() => setFlipped(false)}
                  className="px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#FAF7F0] hover:bg-[#EAE4D7] text-[#1C1B18]"
                >
                  Hide Answer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SRS Retention & Review Schedule Matrix */}
      <div
        data-testid="srs-schedule-grid"
        className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C1B18]/20 pb-2.5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#E06D2B]" aria-hidden="true" />
            <h3 className="text-sm font-extrabold text-[#1C1B18]">
              SM-2 Retention Schedule ({moduleCards.length} Cards)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#6E695D]">
            Click any card to jump directly into review
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {moduleCards.map((card) => {
            const st = srsProgress[card.id];
            const status = classifyCardStatus(st, nowMs);
            const nextReviewLabel = formatNextReviewPhrase(st, nowMs);
            const isActive = activeCard?.id === card.id;
            const repSteps =
              st && st.lastRating !== 'again' ? Math.min(2, st.repetitions) : 0;

            return (
              <button
                key={card.id}
                type="button"
                data-testid={`schedule-card-${card.id}`}
                onClick={() => {
                  const idxInQueue = deck.findIndex((c) => c.id === card.id);
                  if (idxInQueue >= 0) {
                    setCardIndex(idxInQueue);
                    setFlipped(false);
                  } else {
                    const allQueue = buildStudyQueue(FLASHCARD_DECK, srsProgress, {
                      moduleFilter,
                      queueFilter: 'all',
                      nowMs,
                    });
                    const allIdx = allQueue.findIndex((c) => c.id === card.id);
                    setQueueFilter('all');
                    setCardIndex(Math.max(0, allIdx));
                    setFlipped(false);
                  }
                }}
                className={`p-3 rounded-[4px] border text-left space-y-2 step-hinge ${
                  isActive
                    ? 'bg-[#E5B82E]/25 border-[#1C1B18]'
                    : 'bg-[#F4EFE4] hover:bg-[#EAE4D7] border-[#1C1B18]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono font-bold">
                  <span className="uppercase text-[#1C1B18]">
                    {card.moduleId} · {card.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border border-[#1C1B18]/70 uppercase tabular-nums ${
                      status === 'mastered'
                        ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                        : status === 'due'
                        ? 'bg-[#A62B2B] text-[#FAF7F0]'
                        : status === 'learning'
                        ? 'bg-[#22559C] text-[#FAF7F0]'
                        : 'bg-[#FAF7F0] text-[#434038]'
                    }`}
                  >
                    {status === 'mastered' && (
                      <Award className="w-2.5 h-2.5" aria-hidden="true" />
                    )}
                    <span>
                      {status === 'mastered'
                        ? 'Mastered'
                        : status === 'due'
                        ? 'Due Now'
                        : status === 'learning'
                        ? 'Learning'
                        : 'New'}
                    </span>
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#1C1B18] line-clamp-1">
                  {card.frontPrompt}
                </div>

                <div className="pt-1.5 border-t border-[#1C1B18]/15 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                    <span
                      className={`font-bold ${
                        status === 'due'
                          ? 'text-[#A62B2B]'
                          : status === 'mastered'
                          ? 'text-[#2E5C22]'
                          : 'text-[#1C1B18]'
                      }`}
                    >
                      {nextReviewLabel}
                    </span>
                    <span className="flex items-center gap-0.5" aria-hidden="true">
                      {[1, 2].map((pip) => (
                        <span
                          key={pip}
                          className={`w-2.5 h-1.5 rounded-[1px] border border-[#1C1B18]/70 ${
                            repSteps >= pip ? 'bg-[#4F8A3D]' : 'bg-[#FAF7F0]'
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#6E695D] tabular-nums flex items-center justify-between gap-2">
                    <span>
                      {!st || st.totalReviews === 0
                        ? 'Not reviewed yet'
                        : st.dueAt > nowMs
                        ? formatReviewDateShort(st.dueAt, nowMs)
                        : 'Due immediately'}
                    </span>
                    <span>
                      {st && st.lapses > 0 ? (
                        <span className="text-[#A62B2B] font-bold">
                          {st.lapses} {st.lapses === 1 ? 'lapse' : 'lapses'} · EF{' '}
                          {st.easeFactor.toFixed(2)}
                        </span>
                      ) : (
                        `EF ${(st?.easeFactor ?? 2.5).toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
