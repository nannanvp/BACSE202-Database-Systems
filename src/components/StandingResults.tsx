import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  RotateCcw,
  Target,
} from 'lucide-react';
import {
  getPrescriptiveRecommendation,
  getStandingGrade,
  getTierStatusTone,
  ModuleId,
  ModuleStandingScore,
  TIER_META,
  WeakTopicEntry,
} from '../utils/standingEngine';
import { DivisionColorMeta, WeakTopicsPanel } from './WeakTopicsPanel';

interface StandingResultsProps {
  moduleId: ModuleId;
  moduleNumber: number;
  moduleTitle: string;
  accentHex: string;
  divisionColors: Record<ModuleId, DivisionColorMeta>;
  score: ModuleStandingScore;
  wrongCountInAttempt: number;
  weakTopics: WeakTopicEntry[];
  onReviewWeakTopic: (questionId: string) => void;
  onToggleWeakTopicResolved: (questionId: string) => void;
  onClearResolvedWeakTopics: () => void;
  onBackToLanding: () => void;
  onRetake: () => void;
  onGoToNotes: () => void;
  onGoToLabs: () => void;
  onGoToMock: () => void;
  onReviewWeakTopics: () => void;
}

const GRADE_STYLE: Record<'A' | 'B' | 'C' | 'D', { bg: string; text: string; label: string }> = {
  A: { bg: 'bg-emerald-600', text: 'text-[#FAF7F0]', label: 'Exam-Ready Band (25–30)' },
  B: { bg: 'bg-amber-500', text: 'text-[#1C1B18]', label: 'Solid Band (18–24)' },
  C: { bg: 'bg-[#E06D2B]', text: 'text-[#FAF7F0]', label: 'Developing Band (10–17)' },
  D: { bg: 'bg-rose-600', text: 'text-[#FAF7F0]', label: 'Needs Foundation (0–9)' },
};

const TONE_COLOR: Record<'green' | 'amber' | 'red', { bar: string; text: string; status: string }> = {
  green: { bar: 'bg-emerald-500', text: 'text-emerald-800', status: 'Strong' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-800', status: 'Moderate' },
  red: { bar: 'bg-rose-500', text: 'text-rose-800', status: 'Priority Gap' },
};

export const StandingResults: React.FC<StandingResultsProps> = ({
  moduleNumber,
  moduleTitle,
  accentHex,
  divisionColors,
  score,
  wrongCountInAttempt,
  weakTopics,
  onReviewWeakTopic,
  onToggleWeakTopicResolved,
  onClearResolvedWeakTopics,
  onBackToLanding,
  onRetake,
  onGoToNotes,
  onGoToLabs,
  onGoToMock,
  onReviewWeakTopics,
}) => {
  const [expandWeakPanelNonce, setExpandWeakPanelNonce] = useState(0);
  const total = score.foundation + score.application + score.analysis;
  const grade = getStandingGrade(total);
  const gradeStyle = GRADE_STYLE[grade];
  const advice = getPrescriptiveRecommendation(score);

  // Score count-up animation (compositor-friendly state tick over ~480ms)
  const [displayTotal, setDisplayTotal] = useState(0);
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || total === 0) {
      setDisplayTotal(total);
      return;
    }
    let rafId = 0;
    const durationMs = 480;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayTotal(Math.round(eased * total));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [total]);

  const tiers = [
    { key: 'foundation' as const, value: score.foundation },
    { key: 'application' as const, value: score.application },
    { key: 'analysis' as const, value: score.analysis },
  ];

  return (
    <div className="space-y-6" data-testid="standing-results-view">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#434038] hover:text-[#1C1B18] step-hinge whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>All Modules Overview</span>
        </button>

        <button
          type="button"
          onClick={onRetake}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Retake Diagnostic</span>
        </button>
      </div>

      {/* Hero Results Ledger */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1C1B18] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#6E695D]">
              <span
                className="w-2.5 h-2.5 rounded-[2px] border border-[#1C1B18] shrink-0"
                style={{ backgroundColor: accentHex }}
                aria-hidden="true"
              />
              <span>Step 3 of 3 · Diagnostic Results</span>
              <span aria-hidden="true">·</span>
              <span>Module {moduleNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[#1C1B18]">
              {moduleTitle}
            </h1>
            <p className="font-mono text-xs sm:text-sm font-semibold text-[#434038] tabular-nums">
              Foundation {score.foundation}/10 · Application {score.application}/10 · Analysis{' '}
              {score.analysis}/10
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#1C1B18] tabular-nums">
                {displayTotal}
                <span className="text-lg text-[#6E695D] font-semibold">/30</span>
              </div>
              <div className="text-xs font-mono text-[#6E695D]">{gradeStyle.label}</div>
            </div>
            <div
              className={`w-16 h-16 rounded-[4px] border-2 border-[#1C1B18] flex items-center justify-center font-display text-3xl font-extrabold ${gradeStyle.bg} ${gradeStyle.text}`}
              aria-label={`Standing Grade ${grade}`}
              data-testid="standing-grade-badge"
            >
              {grade}
            </div>
          </div>
        </div>

        {/* Stacked Horizontal Breakdown Bar (Color-coded green/amber/red per tier) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#434038]">
            <span className="font-bold text-[#1C1B18]">
              Combined 30-Point Standing Breakdown
            </span>
            <span className="tabular-nums">{Math.round((total / 30) * 100)}% overall</span>
          </div>

          <div
            className="h-5 w-full bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] overflow-hidden flex"
            role="img"
            aria-label={`Stacked score bar: Foundation ${score.foundation}/10, Application ${score.application}/10, Analysis ${score.analysis}/10`}
          >
            {tiers.map(({ key, value }) => {
              const tone = getTierStatusTone(value);
              const widthPct = (value / 30) * 100;
              return (
                <motion.div
                  key={key}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: `${widthPct}%`, transformOrigin: 'left' }}
                  className={`${TONE_COLOR[tone].bar} h-full border-r border-[#1C1B18]/40 last:border-r-0`}
                  title={`${TIER_META[key].shortLabel}: ${value}/10 (${TONE_COLOR[tone].status})`}
                />
              );
            })}
          </div>

          {/* 3-Column Tier Readout Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {tiers.map(({ key, value }) => {
              const meta = TIER_META[key];
              const tone = getTierStatusTone(value);
              const toneStyle = TONE_COLOR[tone];

              return (
                <div
                  key={key}
                  className="bg-[#F4EFE4] border border-[#C5BEB0] rounded-[4px] p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="font-bold text-[#1C1B18]">{meta.shortLabel}</span>
                    <span className={`font-bold ${toneStyle.text}`}>{toneStyle.status}</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-2xl font-extrabold text-[#1C1B18] tabular-nums">
                      {value}
                      <span className="text-sm text-[#6E695D] font-normal">/10</span>
                    </span>
                    <span className="text-xs font-mono text-[#434038]">{meta.stars}</span>
                  </div>

                  <div className="h-2 w-full bg-[#EAE4D7] rounded-[2px] overflow-hidden border border-[#C5BEB0]">
                    <div
                      className={`h-full ${toneStyle.bar}`}
                      style={{ width: `${value * 10}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prescriptive Recommendation */}
        <div
          className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-5 space-y-2"
          data-testid="standing-recommendation"
        >
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#6B21A8]">
            {advice.priorityTarget === 'ready' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            ) : (
              <Target className="w-4 h-4 text-[#6B21A8]" aria-hidden="true" />
            )}
            <span>Prescriptive Study Recommendation</span>
          </div>
          <h2 className="text-base sm:text-lg font-display font-extrabold text-[#1C1B18]">
            {advice.headline}
          </h2>
          <p className="text-sm text-[#434038] leading-relaxed">{advice.detail}</p>
        </div>

        {/* Weak Topics Integration Callout */}
        {wrongCountInAttempt > 0 && (
          <div
            className="bg-amber-500/12 border border-[#1C1B18] rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            data-testid="weak-topics-callout"
          >
            <div className="flex items-start sm:items-center gap-2.5 text-sm font-semibold text-[#1C1B18]">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <span>
                {wrongCountInAttempt}{' '}
                {wrongCountInAttempt === 1 ? 'question' : 'questions'} added to your Weak Topics list
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setExpandWeakPanelNonce((n) => n + 1);
                  window.requestAnimationFrame(() => {
                    document
                      .getElementById('standing-weak-topics-panel')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8aa22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
              >
                <span>Review Below ↓</span>
              </button>
              <button
                type="button"
                onClick={onReviewWeakTopics}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
              >
                <span>Open in Mock →</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Navigation Links (Pre-selects correct module) */}
        <div className="pt-2 border-t border-[#C5BEB0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onGoToNotes}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-bold border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0 ${
                advice.priorityTarget === 'notes'
                  ? 'bg-[#6B21A8] text-[#FAF7F0] hover:bg-[#581C87]'
                  : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Go to Notes →</span>
            </button>

            <button
              type="button"
              onClick={onGoToLabs}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-bold border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0 ${
                advice.priorityTarget === 'labs'
                  ? 'bg-[#6B21A8] text-[#FAF7F0] hover:bg-[#581C87]'
                  : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Go to Labs →</span>
            </button>

            <button
              type="button"
              onClick={onGoToMock}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-bold border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0 ${
                advice.priorityTarget === 'mock'
                  ? 'bg-[#6B21A8] text-[#FAF7F0] hover:bg-[#581C87]'
                  : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Go to Mock →</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* Collapsible Weak Topics Panel directly inside Standing Results */}
      <WeakTopicsPanel
        panelId="standing-weak-topics-panel"
        weakTopics={weakTopics}
        divisionColors={divisionColors}
        onReviewWeakTopic={onReviewWeakTopic}
        onToggleResolved={onToggleWeakTopicResolved}
        onClearAllResolved={onClearResolvedWeakTopics}
        defaultExpanded={wrongCountInAttempt > 0}
        externalExpandNonce={expandWeakPanelNonce}
        title="Weak Topics Tracker (Standing & Mock)"
        subtitle="Inspect missed questions from this diagnostic alongside FAT Mock misses, review full options & explanations, and resolve mastered items."
      />
    </div>
  );
};
