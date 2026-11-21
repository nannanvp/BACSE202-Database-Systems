import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  GitCompareArrows,
  Layers,
  Merge,
  Target,
} from 'lucide-react';
import { MODULES } from '../data/bacse202Data';
import type { ModuleId } from '../utils/standingEngine';
import {
  A1_TO_A2_SHIFT_PATTERNS,
  ALPHA_D2_BLUEPRINT,
  BETA_D2_BLUEPRINT,
  buildTopicPredictionMatrix,
  computePredictionStats,
  filterPredictionMatrix,
  GAMMA_D2_BLUEPRINT,
  GAMMA_SYNTHESIS_ROWS,
  GammaConsensusType,
  PredictedD2Question,
  PredictionCoverageFilter,
  TopicPredictionEntry,
  VelloreQuestionLink,
} from '../utils/predictionEngine';
import { ConceptDiagram } from './ConceptDiagrams';
import { MarkdownBlock } from './MarkdownBlock';
import type { DivisionColorMeta } from './WeakTopicsPanel';

type PredictionLens = 'matrix' | 'alpha' | 'beta' | 'gamma';

const GAMMA_CONSENSUS_BADGE_CLASS: Record<GammaConsensusType, string> = {
  'Unanimous Lock': 'bg-[#4F8A3D] text-[#FAF7F0]',
  'Consensus + Split': 'bg-[#E5B82E] text-[#1C1B18]',
  'Arbitrated Anchor': 'bg-[#6B21A8] text-[#FAF7F0]',
};

interface PredictionViewProps {
  divisionColors: Record<ModuleId, DivisionColorMeta>;
  onNavigateToTopic: (moduleId: ModuleId, topicId: string) => void;
  onOpenFatPaper: (paperSet: 'd1' | 'a1' | 'a2', qRef?: string) => void;
}

const MODULE_TEXT_LIGHT: Record<ModuleId, boolean> = {
  m1: false,
  m2: false,
  m3: true,
  m4: true,
  m5: true,
};

const TOPIC_TITLE_BY_ID: Record<string, { moduleId: ModuleId; title: string }> = (() => {
  const map: Record<string, { moduleId: ModuleId; title: string }> = {};
  for (const mod of MODULES) {
    for (const t of mod.topics) {
      map[t.id] = { moduleId: mod.id, title: t.title };
    }
  }
  return map;
})();

const VelloreExpandableCard: React.FC<{
  link: VelloreQuestionLink;
  onOpenFatPaper: (paperSet: 'd1' | 'a1' | 'a2', qRef?: string) => void;
}> = ({ link, onOpenFatPaper }) => {
  const [promptOpen, setPromptOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);

  const isA1 = link.slot === 'A1+TA1';
  const slotBadgeClass = isA1
    ? 'bg-[#147E7B] text-[#FAF7F0]'
    : 'bg-[#22559C] text-[#FAF7F0]';

  return (
    <div
      className="border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] bg-[#F4EFE4] dark:bg-[#26231E] overflow-hidden"
      data-testid={`vellore-card-${link.id}`}
    >
      <button
        type="button"
        onClick={() => setPromptOpen((prev) => !prev)}
        aria-expanded={promptOpen}
        className="w-full px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-left hover:bg-[#EAE4D7] dark:hover:bg-[#2E2B25] transition-colors"
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span
            className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded-[2px] border border-[#1C1B18] dark:border-[#4A463E] whitespace-nowrap shrink-0 ${slotBadgeClass}`}
          >
            {isA1 ? 'A1 Vellore' : 'A2 Vellore'} · {link.displayRef.replace(/^A[12]\s+/, '')}
          </span>
          <span className="text-xs font-bold text-[#1C1B18] dark:text-[#E6E2DA] leading-snug">
            {link.option.label}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#1C1B18] dark:text-[#D8B048] whitespace-nowrap shrink-0">
          <span>{promptOpen ? 'Hide Question' : 'View Past Question'}</span>
          {promptOpen ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </span>
      </button>

      {promptOpen && (
        <div className="px-4 py-4 border-t border-[#1C1B18] dark:border-[#3A3731] bg-[#FAF7F0] dark:bg-[#1C1A16] space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#6E695D] dark:text-[#A39D91] tabular-nums">
            <span>
              VIT VELLORE {link.slot} · {link.qNo} · {link.marks}M · {link.co} · {link.bl}
            </span>
            <button
              type="button"
              onClick={() => onOpenFatPaper(isA1 ? 'a1' : 'a2', link.qNo)}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#1C1B18] dark:text-[#D8B048] underline underline-offset-4 hover:opacity-80"
            >
              <span>Open in Full {isA1 ? 'A1' : 'A2'} Paper</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>

          <p className="text-sm text-[#1C1B18] dark:text-[#E6E2DA] leading-relaxed">
            {link.option.promptIntro}
          </p>

          {link.option.schemaOrData && (
            <pre className="font-mono text-xs bg-[#26231E] text-[#FAF7F0] border border-[#1C1B18] dark:border-[#3A3731] p-3.5 rounded-[4px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {link.option.schemaOrData}
            </pre>
          )}

          <div className="divide-y divide-[#C5BEB0] dark:divide-[#3A3731] border-t border-b border-[#1C1B18] dark:border-[#3A3731]">
            {link.option.subQuestions.map((sq) => (
              <div
                key={sq.part}
                className="py-2.5 flex items-start justify-between gap-3 text-sm text-[#1C1B18] dark:text-[#E6E2DA]"
              >
                <div className="leading-relaxed">
                  <span className="font-mono font-bold mr-1.5">{sq.part}.</span>
                  {sq.text}
                </div>
                <span className="font-mono text-xs font-bold whitespace-nowrap shrink-0 tabular-nums">
                  [{sq.marks}M]
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSolutionOpen((prev) => !prev)}
              aria-expanded={solutionOpen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{solutionOpen ? 'Hide Worked Solution' : 'Show Worked Solution'}</span>
              {solutionOpen ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>

          {solutionOpen && (
            <div
              className="p-4 bg-[#F4EFE4] dark:bg-[#24211C] border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] space-y-3.5"
              data-testid={`vellore-solution-${link.id}`}
            >
              <div className="text-xs font-mono font-bold text-[#4F8A3D] dark:text-[#7BC465] uppercase tracking-wider">
                Worked Step-by-Step Solution ({link.slot} · {link.displayRef})
              </div>
              {link.option.diagramId && (
                <ConceptDiagram
                  id={link.option.diagramId}
                  caption={link.option.diagramCaption}
                />
              )}
              <div className="space-y-3">
                {link.option.solutionSteps.map((step, idx) => (
                  <MarkdownBlock key={idx} content={step} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BlueprintQuestionCard: React.FC<{
  item: PredictedD2Question;
  divisionColors: Record<ModuleId, DivisionColorMeta>;
  onNavigateToTopic: (moduleId: ModuleId, topicId: string) => void;
}> = ({ item, divisionColors, onNavigateToTopic }) => {
  const modMeta = divisionColors[item.moduleId];
  const modLightText = MODULE_TEXT_LIGHT[item.moduleId];

  return (
    <article
      className="bg-[#FAF7F0] dark:bg-[#201E1A] border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] p-5 space-y-4"
      data-testid={`blueprint-card-${item.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono tabular-nums">
            <span className="px-2 py-0.5 font-extrabold bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] rounded-[2px]">
              {item.qNo} · {item.marks}M
            </span>
            <span className="px-2 py-0.5 font-bold bg-[#1C1B18] text-[#FAF7F0] dark:bg-[#312E29] dark:text-[#E6E2DA] rounded-[2px]">
              {item.section}
            </span>
            <span
              style={{
                backgroundColor: modMeta.hex,
                color: modLightText ? '#FAF7F0' : '#1C1B18',
              }}
              className="px-2 py-0.5 font-bold border border-[#1C1B18] rounded-[2px]"
            >
              {modMeta.code}
            </span>
            <span className="text-[#6E695D] dark:text-[#A39D91]">
              {item.co} · {item.bl}
            </span>
            {item.betaMechanism && (
              <span
                className={`px-2 py-0.5 font-bold rounded-[2px] border border-[#1C1B18] ${
                  item.betaMechanism === 'Sibling Rotation'
                    ? 'bg-[#E06D2B] text-[#1C1B18]'
                    : 'bg-[#147E7B] text-[#FAF7F0]'
                }`}
              >
                {item.betaMechanism}
              </span>
            )}
            {item.gammaConsensusType && (
              <span
                className={`px-2 py-0.5 font-bold rounded-[2px] border border-[#1C1B18] ${GAMMA_CONSENSUS_BADGE_CLASS[item.gammaConsensusType]}`}
              >
                {item.gammaConsensusType}
              </span>
            )}
            {typeof item.confidencePct === 'number' && (
              <span className="px-2 py-0.5 font-bold rounded-[2px] border border-[#1C1B18] dark:border-[#4A463E] bg-[#F4EFE4] dark:bg-[#2B2822] text-[#1C1B18] dark:text-[#E6E2DA]">
                {item.confidencePct}% Match
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-[#1C1B18] dark:text-[#E6E2DA] leading-snug">
            {item.title}
          </h3>
        </div>

        {item.vellorePrecedentTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {item.vellorePrecedentTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#EAE4D7] dark:bg-[#2B2822] text-[#1C1B18] dark:text-[#E6E2DA] border border-[#1C1B18] dark:border-[#4A463E] rounded-[2px] whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* D1 Counterpart vs Prediction Mapping Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-[#F4EFE4] dark:bg-[#26231E] border border-[#C5BEB0] dark:border-[#3A3731] rounded-[4px] text-xs">
        <div className="space-y-1">
          <div className="font-mono font-bold uppercase tracking-wider text-[10px] text-[#6E695D] dark:text-[#A39D91]">
            What VIT Chennai D1+TD1 Asked
          </div>
          <p className="text-[#1C1B18] dark:text-[#E6E2DA] leading-relaxed">
            {item.d1Counterpart}
          </p>
        </div>
        <div className="space-y-1">
          <div className="font-mono font-bold uppercase tracking-wider text-[10px] text-[#6E695D] dark:text-[#A39D91]">
            {item.alphaVsBetaSummary
              ? 'Alpha vs. Beta ➔ Gamma Synthesis'
              : item.a1a2Precedent
                ? 'Empirical Vellore A1 → A2 Precedent'
                : 'D1-Negative Rationale'}
          </div>
          <p className="text-[#1C1B18] dark:text-[#E6E2DA] leading-relaxed">
            {item.alphaVsBetaSummary ?? item.a1a2Precedent ?? item.rationale}
          </p>
        </div>
      </div>

      {/* Sub-Questions */}
      <div className="divide-y divide-[#C5BEB0] dark:divide-[#3A3731] border-t border-b border-[#1C1B18] dark:border-[#3A3731]">
        {item.subQuestions.map((sq) => (
          <div
            key={sq.part}
            className="py-2.5 flex items-start justify-between gap-3 text-sm text-[#1C1B18] dark:text-[#E6E2DA]"
          >
            <div className="leading-relaxed">
              <span className="font-mono font-bold mr-1.5">{sq.part}</span>
              {sq.text}
            </div>
            <span className="font-mono text-xs font-bold whitespace-nowrap shrink-0 tabular-nums">
              [{sq.marks}M]
            </span>
          </div>
        ))}
      </div>

      {/* Rationale (when Beta or Gamma already showed mapping above) & Syllabus Jump Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {item.alphaVsBetaSummary ? (
          <p className="text-xs text-[#434038] dark:text-[#B8B2A6] leading-relaxed flex-1">
            <span className="font-bold text-[#1C1B18] dark:text-[#E6E2DA]">
              Why Gamma D2 predicts this:{' '}
            </span>
            {item.rationale}
          </p>
        ) : item.a1a2Precedent ? (
          <p className="text-xs text-[#434038] dark:text-[#B8B2A6] leading-relaxed flex-1">
            <span className="font-bold text-[#1C1B18] dark:text-[#E6E2DA]">
              Why Beta D2 predicts this:{' '}
            </span>
            {item.rationale}
          </p>
        ) : (
          <span className="text-xs font-mono text-[#6E695D] dark:text-[#A39D91]">
            Target Syllabus Topics:
          </span>
        )}

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {item.targetTopicIds.map((tid) => {
            const info = TOPIC_TITLE_BY_ID[tid];
            if (!info) return null;
            return (
              <button
                key={tid}
                type="button"
                onClick={() => onNavigateToTopic(info.moduleId, tid)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[3px] step-hinge whitespace-nowrap"
              >
                <span>{tid}</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
};

export const PredictionView: React.FC<PredictionViewProps> = ({
  divisionColors,
  onNavigateToTopic,
  onOpenFatPaper,
}) => {
  const [activeLens, setActiveLens] = useState<PredictionLens>('matrix');
  const [coverageFilter, setCoverageFilter] = useState<PredictionCoverageFilter>('all');
  const [moduleFilter, setModuleFilter] = useState<'all' | ModuleId>('all');

  const fullMatrix = useMemo(() => buildTopicPredictionMatrix(), []);
  const stats = useMemo(() => computePredictionStats(fullMatrix), [fullMatrix]);
  const filteredMatrix = useMemo(
    () => filterPredictionMatrix(fullMatrix, coverageFilter, moduleFilter),
    [fullMatrix, coverageFilter, moduleFilter]
  );

  const groupedByModule = useMemo(() => {
    const groups: Array<{
      moduleId: ModuleId;
      moduleNumber: number;
      moduleTitle: string;
      entries: TopicPredictionEntry[];
    }> = [];
    for (const mod of MODULES) {
      const entries = filteredMatrix.filter((e) => e.moduleId === mod.id);
      if (entries.length > 0) {
        groups.push({
          moduleId: mod.id,
          moduleNumber: mod.number,
          moduleTitle: mod.title,
          entries,
        });
      }
    }
    return groups;
  }, [filteredMatrix]);

  const renderBlueprintSections = (
    blueprint: PredictedD2Question[],
    model: 'alpha' | 'beta' | 'gamma'
  ) => {
    const sec1 = blueprint.filter((q) => q.marks === 10);
    const sec2 = blueprint.filter((q) => q.marks === 15);

    return (
      <div className="space-y-6" data-testid={`${model}-d2-blueprint`}>
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1C1B18] dark:border-[#3A3731]">
            <h2 className="text-base sm:text-lg font-extrabold text-[#1C1B18] dark:text-[#E6E2DA]">
              Section I — Answer All Questions (7 × 10 Marks = 70M)
            </h2>
            <span className="text-xs font-mono text-[#6E695D] dark:text-[#A39D91]">
              VIT CHENNAI FORMAT · ZERO INTERNAL OR CHOICES
            </span>
          </div>
          <div className="space-y-4">
            {sec1.map((q) => (
              <BlueprintQuestionCard
                key={q.id}
                item={q}
                divisionColors={divisionColors}
                onNavigateToTopic={onNavigateToTopic}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1C1B18] dark:border-[#3A3731]">
            <h2 className="text-base sm:text-lg font-extrabold text-[#1C1B18] dark:text-[#E6E2DA]">
              Section II — Answer All Questions (2 × 15 Marks = 30M)
            </h2>
            <span className="text-xs font-mono text-[#6E695D] dark:text-[#A39D91]">
              CAPSTONE DESIGN &amp; DISTRIBUTED / NOSQL QUESTIONS
            </span>
          </div>
          <div className="space-y-4">
            {sec2.map((q) => (
              <BlueprintQuestionCard
                key={q.id}
                item={q}
                divisionColors={divisionColors}
                onNavigateToTopic={onNavigateToTopic}
              />
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="space-y-6" data-testid="prediction-view">
      {/* Header + 4-Lens Switcher (h1 FIRST — zero eyebrow kicker above h1) */}
      <div className="bg-[#FAF7F0] dark:bg-[#201E1A] border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] p-5 sm:p-6 space-y-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1B18] dark:text-[#E6E2DA]">
            D2 Slot Exam Prediction &amp; D1 Negative Matrix
          </h1>
          <p className="text-xs font-mono text-[#6E695D] dark:text-[#A39D91]">
            PRIMARY: VIT CHENNAI D1+TD1 NEGATIVE (7×10M + 2×15M) · SECONDARY: VELLORE A1+TA1 &amp; A2+TA2 PROOF · ALPHA, BETA &amp; GAMMA D2 CONSENSUS FORECASTS
          </p>
        </div>

        {/* 4-Lens Segmented Control — Dedicated Full-Width Bar (Single-Line on Desktop) */}
        <div
          role="tablist"
          aria-label="Prediction view modes"
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeLens === 'matrix'}
            onClick={() => setActiveLens('matrix')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] dark:border-[#3A3731] step-hinge whitespace-nowrap shrink-0 ${
              activeLens === 'matrix'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] dark:bg-[#26231E] text-[#1C1B18] dark:text-[#E6E2DA] hover:bg-[#EAE4D7] dark:hover:bg-[#312E29]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Topic Matrix (M1–M5)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeLens === 'alpha'}
            onClick={() => setActiveLens('alpha')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] dark:border-[#3A3731] step-hinge whitespace-nowrap shrink-0 ${
              activeLens === 'alpha'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] dark:bg-[#26231E] text-[#1C1B18] dark:text-[#E6E2DA] hover:bg-[#EAE4D7] dark:hover:bg-[#312E29]'
            }`}
          >
            <Target className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Alpha D2 (D1-Negative)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeLens === 'beta'}
            onClick={() => setActiveLens('beta')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] dark:border-[#3A3731] step-hinge whitespace-nowrap shrink-0 ${
              activeLens === 'beta'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] dark:bg-[#26231E] text-[#1C1B18] dark:text-[#E6E2DA] hover:bg-[#EAE4D7] dark:hover:bg-[#312E29]'
            }`}
          >
            <GitCompareArrows className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Beta D2 (A1→A2 Pattern)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeLens === 'gamma'}
            onClick={() => setActiveLens('gamma')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] dark:border-[#3A3731] step-hinge whitespace-nowrap shrink-0 ${
              activeLens === 'gamma'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] dark:bg-[#26231E] text-[#1C1B18] dark:text-[#E6E2DA] hover:bg-[#EAE4D7] dark:hover:bg-[#312E29]'
            }`}
          >
            <Merge className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Gamma D2 (Consensus 100M)</span>
          </button>
        </div>

        {/* Live Computed KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#1C1B18] dark:border-[#3A3731]">
          <div className="min-w-0 p-3 bg-[#F4EFE4] dark:bg-[#26231E] border border-[#C5BEB0] dark:border-[#3A3731] rounded-[4px]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6E695D] dark:text-[#A39D91]">
              Untested in Chennai D1
            </div>
            <div className="mt-1 text-sm sm:text-xl font-extrabold font-mono text-[#E06D2B] tabular-nums whitespace-nowrap">
              {stats.untestedInD1} / {stats.totalTopics}
            </div>
            <div className="text-[11px] text-[#434038] dark:text-[#B8B2A6]">
              +{stats.partialInD1} partial gaps · {stats.testedInD1} fully tested
            </div>
          </div>

          <div className="min-w-0 p-3 bg-[#F4EFE4] dark:bg-[#26231E] border border-[#C5BEB0] dark:border-[#3A3731] rounded-[4px]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6E695D] dark:text-[#A39D91]">
              D1 Gaps Proven in A1/A2
            </div>
            <div className="mt-1 text-sm sm:text-xl font-extrabold font-mono text-[#147E7B] dark:text-[#55C7C3] tabular-nums whitespace-nowrap">
              {stats.untestedWithVelloreProof} Topics
            </div>
            <div className="text-[11px] text-[#434038] dark:text-[#B8B2A6]">
              +{stats.partialWithVelloreProof} partial topics with Vellore Qs
            </div>
          </div>

          <div className="min-w-0 p-3 bg-[#F4EFE4] dark:bg-[#26231E] border border-[#C5BEB0] dark:border-[#3A3731] rounded-[4px]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6E695D] dark:text-[#A39D91]">
              Alpha &amp; Beta Models
            </div>
            <div className="mt-1 text-sm sm:text-xl font-extrabold font-mono text-[#22559C] dark:text-[#78A6EC] tabular-nums whitespace-nowrap">
              {stats.alphaTotalMarks}M Each
            </div>
            <div className="text-[11px] text-[#434038] dark:text-[#B8B2A6]">
              D1-Neg · Beta {stats.betaRotationCount} Rot / {stats.betaRepeatCount} Rep
            </div>
          </div>

          <div className="min-w-0 p-3 bg-[#F4EFE4] dark:bg-[#26231E] border border-[#C5BEB0] dark:border-[#3A3731] rounded-[4px]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6E695D] dark:text-[#A39D91]">
              Gamma D2 Consensus
            </div>
            <div className="mt-1 text-sm sm:text-xl font-extrabold font-mono text-[#4F8A3D] dark:text-[#7BC465] tabular-nums whitespace-nowrap">
              {stats.gammaUnanimousCount} Locks · {stats.gammaTotalMarks}M
            </div>
            <div className="text-[11px] text-[#434038] dark:text-[#B8B2A6]">
              Alpha + Beta synthesis · {stats.gammaTopicCoverageCount} topics
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          LENS 1: ORDERED 30-TOPIC D1-NEGATIVE MATRIX (DEFAULT)
         ==================================================================== */}
      {activeLens === 'matrix' && (
        <div className="space-y-5" data-testid="prediction-topic-matrix">
          {/* Tag Legend + Filter Controls */}
          <div className="bg-[#FAF7F0] dark:bg-[#201E1A] border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-[#6E695D] dark:text-[#A39D91] uppercase text-[11px]">
                  Tag Key:
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#E06D2B] text-[#1C1B18] border border-[#1C1B18] rounded-[2px]">
                  NOT IN D1 · D2 GAP
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] rounded-[2px]">
                  PARTIAL IN D1
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#EAE4D7] dark:bg-[#312E29] text-[#1C1B18] dark:text-[#E6E2DA] border border-[#1C1B18] dark:border-[#4A463E] rounded-[2px]">
                  D1 CHENNAI
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#147E7B] text-[#FAF7F0] border border-[#1C1B18] rounded-[2px]">
                  A1 Vellore
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#22559C] text-[#FAF7F0] border border-[#1C1B18] rounded-[2px]">
                  A2 Vellore
                </span>
              </div>

              <span className="font-mono text-[11px] font-bold text-[#434038] dark:text-[#B8B2A6] tabular-nums">
                Showing {filteredMatrix.length} of {fullMatrix.length} syllabus topics
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#C5BEB0] dark:border-[#3A3731]">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: `All ${stats.totalTopics} Topics` },
                    { id: 'untested', label: `Not in D1 (${stats.untestedInD1})` },
                    {
                      id: 'untested_with_vellore',
                      label: `D1 Gaps in A1/A2 (${stats.untestedWithVelloreProof})`,
                    },
                    { id: 'partial', label: `Partial in D1 (${stats.partialInD1})` },
                    { id: 'tested', label: `Tested in D1 (${stats.testedInD1})` },
                  ] as Array<{ id: PredictionCoverageFilter; label: string }>
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCoverageFilter(f.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] dark:border-[#3A3731] step-hinge whitespace-nowrap shrink-0 tabular-nums ${
                      coverageFilter === f.id
                        ? 'bg-[#1C1B18] text-[#FAF7F0] dark:bg-[#E5B82E] dark:text-[#1C1B18]'
                        : 'bg-[#FAF7F0] dark:bg-[#26231E] text-[#1C1B18] dark:text-[#E6E2DA] hover:bg-[#EAE4D7] dark:hover:bg-[#312E29]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'm1', 'm2', 'm3', 'm4', 'm5'] as Array<'all' | ModuleId>).map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setModuleFilter(mod)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-[4px] border border-[#1C1B18] dark:border-[#3A3731] step-hinge whitespace-nowrap shrink-0 ${
                      moduleFilter === mod
                        ? 'bg-[#E5B82E] text-[#1C1B18]'
                        : 'bg-[#FAF7F0] dark:bg-[#26231E] text-[#1C1B18] dark:text-[#E6E2DA] hover:bg-[#EAE4D7] dark:hover:bg-[#312E29]'
                    }`}
                  >
                    {mod === 'all' ? 'All Mods' : `M${mod.slice(1)}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modules 1..5 in Exact Syllabus Order */}
          {groupedByModule.map((group) => {
            const divMeta = divisionColors[group.moduleId];
            const lightText = MODULE_TEXT_LIGHT[group.moduleId];
            const modUntestedCount = group.entries.filter((e) => e.d1Status === 'untested').length;

            return (
              <section
                key={group.moduleId}
                className="border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] bg-[#FAF7F0] dark:bg-[#201E1A] overflow-hidden"
                data-testid={`prediction-module-${group.moduleId}`}
              >
                {/* Module Division Header */}
                <div
                  style={{
                    backgroundColor: divMeta.hex,
                    color: lightText ? '#FAF7F0' : '#1C1B18',
                  }}
                  className="px-4 sm:px-5 py-3 border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-[2px] border border-current/40 bg-black/10">
                      Module {group.moduleNumber}
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                      {group.moduleTitle}
                    </h2>
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums">
                    {modUntestedCount} untested in D1 · {group.entries.length} shown
                  </span>
                </div>

                {/* Ordered Topics Inside Module */}
                <div className="divide-y divide-[#C5BEB0] dark:divide-[#3A3731]">
                  {group.entries.map((entry) => {
                    const isUntested = entry.d1Status === 'untested';
                    const isPartial = entry.d1Status === 'partial';

                    return (
                      <div
                        key={entry.topicId}
                        className="p-4 sm:p-5 space-y-3.5"
                        data-testid={`prediction-topic-${entry.topicId}`}
                      >
                        {/* Topic Top Line: Number, Title, Primary D1 Tag, Secondary A1/A2 Tags, Syllabus Link */}
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="font-mono text-xs font-extrabold text-[#6E695D] dark:text-[#A39D91] tabular-nums">
                                {String(entry.topicOrder).padStart(2, '0')} · {entry.topicId}
                              </span>
                              <h3 className="text-base font-extrabold text-[#1C1B18] dark:text-[#E6E2DA]">
                                {entry.topicTitle}
                              </h3>
                            </div>

                            {/* Primary D1 Tag + Secondary A1 / A2 Tags + Alpha/Beta Markers */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* PRIMARY TAG: VIT CHENNAI D1+TD1 */}
                              {isUntested ? (
                                <span className="px-2 py-0.5 text-[11px] font-mono font-extrabold bg-[#E06D2B] text-[#1C1B18] border border-[#1C1B18] rounded-[2px]">
                                  NOT IN D1 · D2 GAP
                                </span>
                              ) : isPartial ? (
                                <span className="px-2 py-0.5 text-[11px] font-mono font-extrabold bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] rounded-[2px]">
                                  PARTIAL IN D1 · {entry.d1Refs.join(', ')}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#EAE4D7] dark:bg-[#312E29] text-[#1C1B18] dark:text-[#E6E2DA] border border-[#1C1B18] dark:border-[#4A463E] rounded-[2px]">
                                  D1 CHENNAI · {entry.d1Refs.join(', ')}
                                </span>
                              )}

                              {/* SECONDARY TAGS: VELLORE A1+TA1 & A2+TA2 */}
                              {entry.velloreLinks.map((vl) => (
                                <span
                                  key={vl.id}
                                  className={`px-2 py-0.5 text-[11px] font-mono font-bold border border-[#1C1B18] rounded-[2px] ${
                                    vl.slot === 'A1+TA1'
                                      ? 'bg-[#147E7B] text-[#FAF7F0]'
                                      : 'bg-[#22559C] text-[#FAF7F0]'
                                  }`}
                                >
                                  {vl.slot === 'A1+TA1' ? 'A1 Vellore' : 'A2 Vellore'} ·{' '}
                                  {vl.displayRef.replace(/^A[12]\s+/, '')}
                                </span>
                              ))}

                              {/* ALPHA, BETA & GAMMA FORECAST TAGS */}
                              {entry.inAlphaD2 && entry.alphaD2SlotRef && (
                                <button
                                  type="button"
                                  onClick={() => setActiveLens('alpha')}
                                  className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#FAF7F0] dark:bg-[#171613] text-[#1C1B18] dark:text-[#E5B82E] border border-[#1C1B18] dark:border-[#E5B82E] rounded-[2px] hover:bg-[#EAE4D7] dark:hover:bg-[#2B2822]"
                                >
                                  {entry.alphaD2SlotRef}
                                </button>
                              )}
                              {entry.inBetaD2 && entry.betaD2SlotRef && (
                                <button
                                  type="button"
                                  onClick={() => setActiveLens('beta')}
                                  className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#FAF7F0] dark:bg-[#171613] text-[#6B21A8] dark:text-[#C084FC] border border-[#6B21A8] dark:border-[#C084FC] rounded-[2px] hover:bg-[#F3E8FF] dark:hover:bg-[#2B2036]"
                                >
                                  {entry.betaD2SlotRef}
                                </button>
                              )}
                              {entry.inGammaD2 && entry.gammaD2SlotRef && (
                                <button
                                  type="button"
                                  onClick={() => setActiveLens('gamma')}
                                  className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#FAF7F0] dark:bg-[#171613] text-[#4F8A3D] dark:text-[#7BC465] border border-[#4F8A3D] dark:border-[#7BC465] rounded-[2px] hover:bg-[#EAF5E5] dark:hover:bg-[#1D2B1A]"
                                >
                                  {entry.gammaD2SlotRef}
                                </button>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onNavigateToTopic(entry.moduleId, entry.topicId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-mono font-bold text-[#1C1B18] dark:text-[#E6E2DA] bg-[#F4EFE4] dark:bg-[#26231E] hover:bg-[#E5B82E] dark:hover:bg-[#312E29] border border-[#1C1B18] dark:border-[#4A463E] rounded-[4px] step-hinge whitespace-nowrap self-start shrink-0"
                          >
                            <span>Open in Syllabus</span>
                            <ArrowRight className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </div>

                        {/* D1 Coverage & Untested Gap Brief */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-[4px] bg-[#F4EFE4] dark:bg-[#26231E] border border-[#C5BEB0] dark:border-[#3A3731]">
                            <span className="font-mono font-bold uppercase text-[10px] tracking-wider text-[#6E695D] dark:text-[#A39D91] block mb-1">
                              VIT Chennai D1+TD1 Coverage
                            </span>
                            <p className="text-[#1C1B18] dark:text-[#E6E2DA] leading-relaxed">
                              {entry.d1TestedDetail}
                            </p>
                          </div>
                          <div className="p-3 rounded-[4px] bg-[#F4EFE4] dark:bg-[#26231E] border border-[#C5BEB0] dark:border-[#3A3731]">
                            <span className="font-mono font-bold uppercase text-[10px] tracking-wider text-[#6E695D] dark:text-[#A39D91] block mb-1">
                              {isUntested || isPartial
                                ? 'Remaining D2 Exposure / Untested Scope'
                                : 'D2 Angle (Repeat / Variation Scope)'}
                            </span>
                            <p className="text-[#1C1B18] dark:text-[#E6E2DA] leading-relaxed">
                              {entry.d1UntestedGap}
                            </p>
                          </div>
                        </div>

                        {/* Likely D2 Question Types (Prominently shown for Untested & Partial; compact for Tested) */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1C1B18] dark:text-[#D8B048] flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>
                              {isUntested || isPartial
                                ? 'Likely D2 Question Types They Can Ask'
                                : 'Possible D2 Variation / Repeat Angle'}
                            </span>
                          </div>
                          <ul className="space-y-1 text-xs sm:text-sm text-[#434038] dark:text-[#CBC5B9] list-disc pl-5">
                            {entry.d2QuestionTypes.map((qt, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {qt}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Expandable Vellore A1/A2 Question Cards (Inline Prompt + Toggleable Worked Solution) */}
                        {entry.velloreLinks.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6E695D] dark:text-[#A39D91]">
                              Vellore A1 / A2 Past Questions on This Topic ({entry.velloreLinks.length})
                            </div>
                            <div className="space-y-2">
                              {entry.velloreLinks.map((vl) => (
                                <VelloreExpandableCard
                                  key={vl.id}
                                  link={vl}
                                  onOpenFatPaper={onOpenFatPaper}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ====================================================================
          LENS 2: ALPHA D2 BLUEPRINT (PURE D1-NEGATIVE 100M FORECAST)
         ==================================================================== */}
      {activeLens === 'alpha' && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F0] dark:bg-[#201E1A] border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] p-5 space-y-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18] dark:text-[#E6E2DA]">
              Alpha D2 — Pure D1-Negative 100M Paper Prediction
            </h2>
            <p className="text-sm text-[#434038] dark:text-[#CBC5B9] leading-relaxed">
              <strong>Methodology:</strong> Takes VIT Chennai’s exact D1+TD1 paper structure (
              <strong>Section I: 7 × 10M + Section II: 2 × 15M = 100M, zero OR choices</strong>) and
              fills every slot strictly with the high-yield syllabus topics that D1+TD1 left completely
              untested or half-tested—prioritizing topics corroborated by VIT Vellore’s A1+TA1 and
              A2+TA2 FAT papers.
            </p>
          </div>

          {renderBlueprintSections(ALPHA_D2_BLUEPRINT, 'alpha')}
        </div>
      )}

      {/* ====================================================================
          LENS 3: BETA D2 BLUEPRINT (A1 -> A2 EMPIRICAL PATTERN 100M FORECAST)
         ==================================================================== */}
      {activeLens === 'beta' && (
        <div className="space-y-6">
          {/* Empirical Proof Table: Observed A1 -> A2 Vellore Shift Matrix */}
          <section
            className="bg-[#FAF7F0] dark:bg-[#201E1A] border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] p-5 space-y-4"
            data-testid="a1-to-a2-shift-matrix"
          >
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18] dark:text-[#E6E2DA]">
                Empirical Proof: Observed Vellore A1+TA1 ➔ A2+TA2 Slot Shift Pattern
              </h2>
              <p className="text-sm text-[#434038] dark:text-[#CBC5B9] leading-relaxed">
                Comparing VIT Vellore’s morning slot (A1) and afternoon slot (A2) reveals that VIT FAT
                setters do <em>not</em> invert 100% of topics. Instead, they combine{' '}
                <strong>Sibling Rotations</strong> (swapping closely related topics inside a module)
                with <strong>Domain-Shifted Core Anchor Repeats</strong> (re-testing Integrity Constraints,
                1NF→BCNF Normalization, Precedence Graphs, and CAP Theorem in fresh domains). Beta D2
                applies this exact A1→A2 mutation rule onto VIT Chennai’s D1+TD1 paper.
              </p>
            </div>

            <div className="overflow-x-auto border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EAE4D7] dark:bg-[#2A2722] border-b border-[#1C1B18] dark:border-[#3A3731] font-mono text-[11px] uppercase tracking-wider text-[#1C1B18] dark:text-[#E6E2DA]">
                    <th className="p-3 font-bold">Module &amp; Rule</th>
                    <th className="p-3 font-bold">Vellore A1+TA1</th>
                    <th className="p-3 font-bold">Vellore A2+TA2</th>
                    <th className="p-3 font-bold">Chennai D1 Anchor</th>
                    <th className="p-3 font-bold">Beta D2 Projection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5BEB0] dark:divide-[#3A3731]">
                  {A1_TO_A2_SHIFT_PATTERNS.map((row) => {
                    const modColor = divisionColors[row.moduleId];
                    const lightText = MODULE_TEXT_LIGHT[row.moduleId];
                    return (
                      <tr
                        key={row.id}
                        className="align-top bg-[#FAF7F0] dark:bg-[#201E1A] hover:bg-[#F4EFE4] dark:hover:bg-[#26231E]"
                      >
                        <td className="p-3 space-y-1.5 min-w-[150px]">
                          <span
                            style={{
                              backgroundColor: modColor.hex,
                              color: lightText ? '#FAF7F0' : '#1C1B18',
                            }}
                            className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold border border-[#1C1B18] rounded-[2px]"
                          >
                            {row.moduleLabel}
                          </span>
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-[2px] border border-[#1C1B18] ${
                                row.mechanism === 'Sibling Rotation'
                                  ? 'bg-[#E06D2B] text-[#1C1B18]'
                                  : 'bg-[#147E7B] text-[#FAF7F0]'
                              }`}
                            >
                              {row.mechanism}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-[#434038] dark:text-[#CBC5B9] leading-relaxed min-w-[165px]">
                          {row.a1Asked}
                        </td>
                        <td className="p-3 text-[#434038] dark:text-[#CBC5B9] leading-relaxed min-w-[165px]">
                          {row.a2Asked}
                        </td>
                        <td className="p-3 text-[#434038] dark:text-[#CBC5B9] leading-relaxed min-w-[175px]">
                          {row.d1ChennaiAnchor}
                        </td>
                        <td className="p-3 font-semibold text-[#1C1B18] dark:text-[#E6E2DA] leading-relaxed min-w-[190px]">
                          {row.betaD2Projection}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {renderBlueprintSections(BETA_D2_BLUEPRINT, 'beta')}
        </div>
      )}

      {/* ====================================================================
          LENS 4: GAMMA D2 BLUEPRINT (ENSEMBLE CONSENSUS OF ALPHA + BETA)
         ==================================================================== */}
      {activeLens === 'gamma' && (
        <div className="space-y-6">
          <section
            className="bg-[#FAF7F0] dark:bg-[#201E1A] border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px] p-5 space-y-4"
            data-testid="gamma-arbitration-matrix"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18] dark:text-[#E6E2DA]">
                  Gamma D2 — Ensemble Consensus Blueprint (Alpha + Beta Synthesis · 100M)
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono tabular-nums">
                  <span className="px-2 py-0.5 font-bold rounded-[2px] border border-[#1C1B18] bg-[#4F8A3D] text-[#FAF7F0]">
                    {stats.gammaUnanimousCount} Unanimous Locks
                  </span>
                  <span className="px-2 py-0.5 font-bold rounded-[2px] border border-[#1C1B18] bg-[#E5B82E] text-[#1C1B18]">
                    3 Consensus + Split
                  </span>
                  <span className="px-2 py-0.5 font-bold rounded-[2px] border border-[#1C1B18] bg-[#6B21A8] text-[#FAF7F0]">
                    1 Arbitrated Anchor
                  </span>
                </div>
              </div>
              <p className="text-sm text-[#434038] dark:text-[#CBC5B9] leading-relaxed">
                <strong>Synthesis Rule:</strong> Wherever <strong>Alpha D2</strong> (strict VIT
                Chennai D1-negative) and <strong>Beta D2</strong> (empirical Vellore A1→A2 slot
                mutation) independently select the same topic, Gamma locks it verbatim (
                <strong>5 of 9 slots</strong>). Where they diverge on sub-parts or Q7, Gamma
                arbitrates using 3-paper exam frequency and CO alignment so{' '}
                <strong>zero high-yield topic is dropped</strong>—keeping 1NF→BCNF Normalization in
                Q7 (CO2) while promoting CAP Theorem cleanly into Q9(i) (CO4).
              </p>
            </div>

            <div className="overflow-x-auto border border-[#1C1B18] dark:border-[#3A3731] rounded-[4px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EAE4D7] dark:bg-[#2A2722] border-b border-[#1C1B18] dark:border-[#3A3731] font-mono text-[11px] uppercase tracking-wider text-[#1C1B18] dark:text-[#E6E2DA]">
                    <th className="p-3 font-bold">Slot &amp; Status</th>
                    <th className="p-3 font-bold">Alpha D2 (D1-Negative)</th>
                    <th className="p-3 font-bold">Beta D2 (A1→A2 Pattern)</th>
                    <th className="p-3 font-bold">Gamma D2 Consensus Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5BEB0] dark:divide-[#3A3731]">
                  {GAMMA_SYNTHESIS_ROWS.map((row) => {
                    const modColor = divisionColors[row.moduleId];
                    const lightText = MODULE_TEXT_LIGHT[row.moduleId];
                    return (
                      <tr
                        key={row.id}
                        className="align-top bg-[#FAF7F0] dark:bg-[#201E1A] hover:bg-[#F4EFE4] dark:hover:bg-[#26231E]"
                      >
                        <td className="p-3 space-y-1.5 min-w-[165px]">
                          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] tabular-nums">
                            <span className="px-1.5 py-0.5 font-extrabold bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] rounded-[2px]">
                              {row.qNo} · {row.marks}M
                            </span>
                            <span
                              style={{
                                backgroundColor: modColor.hex,
                                color: lightText ? '#FAF7F0' : '#1C1B18',
                              }}
                              className="px-1.5 py-0.5 font-bold border border-[#1C1B18] rounded-[2px]"
                            >
                              {modColor.code}
                            </span>
                            <span className="font-bold text-[#1C1B18] dark:text-[#E6E2DA]">
                              {row.confidencePct}%
                            </span>
                          </div>
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-[2px] border border-[#1C1B18] ${GAMMA_CONSENSUS_BADGE_CLASS[row.consensusType]}`}
                            >
                              {row.consensusType}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-[#434038] dark:text-[#CBC5B9] leading-relaxed min-w-[185px]">
                          {row.alphaPick}
                        </td>
                        <td className="p-3 text-[#434038] dark:text-[#CBC5B9] leading-relaxed min-w-[185px]">
                          {row.betaPick}
                        </td>
                        <td className="p-3 font-semibold text-[#1C1B18] dark:text-[#E6E2DA] leading-relaxed min-w-[220px]">
                          {row.gammaDecision}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {renderBlueprintSections(GAMMA_D2_BLUEPRINT, 'gamma')}
        </div>
      )}
    </div>
  );
};
