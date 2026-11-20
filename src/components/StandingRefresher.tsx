import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Calculator, CheckSquare, FastForward } from 'lucide-react';
import { ModuleRefresher } from '../data/standingData';
import { MarkdownBlock, renderInlineMarkup } from './MarkdownBlock';

interface StandingRefresherProps {
  refresher: ModuleRefresher;
  moduleNumber: number;
  moduleHours: number;
  accentHex: string;
  onBack: () => void;
  onStartQuiz: () => void;
}

export const StandingRefresher: React.FC<StandingRefresherProps> = ({
  refresher,
  moduleNumber,
  moduleHours,
  accentHex,
  onBack,
  onStartQuiz,
}) => {
  return (
    <div className="space-y-6" data-testid="standing-refresher-view">
      {/* Top Action Strip: Back + Skip to Quiz always visible at top-right */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C5BEB0] pb-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#434038] hover:text-[#1C1B18] step-hinge whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Standing</span>
          </button>

          <button
            type="button"
            onClick={onStartQuiz}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold uppercase tracking-[0.05em] text-[#FAF7F0] bg-[#6B21A8] hover:bg-[#581C87] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
          >
            <FastForward className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Skip to Quiz →</span>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#6E695D] tabular-nums">
            <span
              className="w-2.5 h-2.5 rounded-[2px] border border-[#1C1B18] shrink-0"
              style={{ backgroundColor: accentHex }}
              aria-hidden="true"
            />
            <span>Step 1 of 3 · Quick Refresher</span>
            <span aria-hidden="true">·</span>
            <span>Module {moduleNumber} ({moduleHours} hrs)</span>
            <span aria-hidden="true">·</span>
            <span>~5 min cheat sheet</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[#1C1B18] leading-tight text-balance">
            Module {moduleNumber} Cheat Sheet: {refresher.title}
          </h1>
        </div>
      </div>

      {/* Two-Column High-Density Cheat Sheet: Concept Bullets + Key Formulas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Concept Map / Scannable Bullets */}
        <section className="lg:col-span-7 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1C1B18] pb-2.5">
            <h2 className="text-sm sm:text-base font-display font-extrabold text-[#1C1B18] inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#6B21A8]" aria-hidden="true" />
              <span>Core Concept Map</span>
            </h2>
            <span className="text-xs font-mono text-[#6E695D] tabular-nums">
              {refresher.conceptBullets.length} key points
            </span>
          </div>

          <ul className="space-y-2.5 text-sm text-[#2C2A25] leading-relaxed">
            {refresher.conceptBullets.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-baseline gap-2.5 pb-2 border-b border-[#EAE4D7] last:border-b-0 last:pb-0"
              >
                <span className="font-mono text-[11px] font-bold text-[#6E695D] w-5 shrink-0 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span>{renderInlineMarkup(bullet)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Highlighted Formula & Rule Strip */}
        <section className="lg:col-span-5 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1C1B18] pb-2.5">
            <h2 className="text-sm sm:text-base font-display font-extrabold text-[#1C1B18] inline-flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#6B21A8]" aria-hidden="true" />
              <span>Exam Formulas &amp; Rules</span>
            </h2>
            <span className="text-xs font-mono text-[#6E695D] tabular-nums">
              {refresher.keyFormulas.length} rules
            </span>
          </div>

          <div className="space-y-3">
            {refresher.keyFormulas.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FAF7F0] border border-[#C5BEB0] rounded-[4px] p-3.5 space-y-1"
              >
                <div className="text-xs font-mono font-bold text-[#6B21A8]">
                  {item.label}
                </div>
                <div className="font-mono text-xs sm:text-[13px] text-[#1C1B18] leading-relaxed tabular-nums">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 3 Worked Exam Patterns */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-display font-extrabold text-[#1C1B18]">
            3 High-Yield Worked Patterns
          </h2>
          <span className="text-xs font-mono text-[#6E695D]">
            Common BACSE202 FAT structures
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {refresher.workedExamples.map((ex, idx) => (
            <article
              key={idx}
              className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 flex flex-col gap-3.5"
            >
              <div className="space-y-1.5 border-b border-[#C5BEB0] pb-3">
                <h3 className="text-sm font-display font-extrabold text-[#1C1B18]">
                  {ex.title}
                </h3>
                <p className="text-xs text-[#434038] leading-relaxed">
                  {renderInlineMarkup(ex.problem)}
                </p>
              </div>
              <div className="flex-1 text-xs">
                <MarkdownBlock content={ex.solution} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom CTA Bar */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-sm font-display font-bold text-[#1C1B18] inline-flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#6B21A8]" aria-hidden="true" />
            <span>Ready to benchmark Module {moduleNumber}?</span>
          </div>
          <p className="text-xs text-[#6E695D]">
            30 questions across 3 progressive tiers (10 Foundation · 10 Application · 10 Analysis) with immediate explanations.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartQuiz}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#FAF7F0] bg-[#6B21A8] hover:bg-[#581C87] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
        >
          <span>I&apos;ve read this, start quiz →</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
