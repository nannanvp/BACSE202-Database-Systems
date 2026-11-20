import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Award, Download, ExternalLink, Layers, Printer } from 'lucide-react';
import { COURSE_META, MODULES } from '../data/bacse202Data';
import { PROFESSOR_PPT_FOLDERS, PROFESSOR_SITE_LINKS } from '../data/professorMaterials';
import { RapidFlashcardDeck } from './RapidFlashcardDeck';
import { ExaminerPlaybookView } from './ExaminerPlaybookView';
import { FLASHCARD_DECK } from '../utils/erFlashcardEngine';
import {
  computeSrsDeckMetrics,
  SrsMode,
  SrsProgressMap,
  SrsRating,
} from '../utils/srsEngine';
import {
  openPrintableCheatSheet,
  PrintDivisionColor,
} from '../utils/cheatSheetPrintEngine';

interface ReferenceViewProps {
  activeModuleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  divisionColors?: Record<'m1' | 'm2' | 'm3' | 'm4' | 'm5', PrintDivisionColor>;
  onSelectModule: (id: 'm1' | 'm2' | 'm3' | 'm4' | 'm5') => void;
  onNavigateToSyllabus: (id: 'm1' | 'm2' | 'm3' | 'm4' | 'm5') => void;
  openFlashcardsSignal: number;
  openPlaybookSignal: number;
  srsProgress: SrsProgressMap;
  srsMode: SrsMode;
  onRateFlashcard: (cardId: string, rating: SrsRating) => void;
  onChangeSrsMode: (mode: SrsMode) => void;
  onResetFlashcards: () => void;
  lockedTrapIds: string[];
  onToggleTrap: (trapId: string) => void;
  onResetTraps: () => void;
}

const MODULE_DIVISION_PALETTE: Record<
  'm1' | 'm2' | 'm3' | 'm4' | 'm5',
  { hex: string; ink: string }
> = {
  m1: { hex: '#E5B82E', ink: '#1C1B18' },
  m2: { hex: '#E06D2B', ink: '#1C1B18' },
  m3: { hex: '#4F8A3D', ink: '#FAF7F0' },
  m4: { hex: '#147E7B', ink: '#FAF7F0' },
  m5: { hex: '#22559C', ink: '#FAF7F0' },
};

type ReferenceMode = 'appendix' | 'cheatsheet' | 'flashcards' | 'playbook';

export const ReferenceView: React.FC<ReferenceViewProps> = ({
  activeModuleId,
  divisionColors,
  onSelectModule,
  onNavigateToSyllabus,
  openFlashcardsSignal,
  openPlaybookSignal,
  srsProgress,
  srsMode,
  onRateFlashcard,
  onChangeSrsMode,
  onResetFlashcards,
  lockedTrapIds,
  onToggleTrap,
  onResetTraps,
}) => {
  const [viewMode, setViewMode] = useState<ReferenceMode>('appendix');

  const dueFlashcardCount = useMemo(() => {
    const m = computeSrsDeckMetrics(FLASHCARD_DECK, srsProgress, Date.now());
    return m.dueCount + m.newCount;
  }, [srsProgress]);

  useEffect(() => {
    if (openFlashcardsSignal > 0) {
      setViewMode('flashcards');
    }
  }, [openFlashcardsSignal]);

  useEffect(() => {
    if (openPlaybookSignal > 0) {
      setViewMode('playbook');
    }
  }, [openPlaybookSignal]);

  const activeModule = useMemo(
    () => MODULES.find((m) => m.id === activeModuleId) ?? MODULES[0],
    [activeModuleId]
  );

  const folder = PROFESSOR_PPT_FOLDERS[activeModule.id];
  const activePalette = MODULE_DIVISION_PALETTE[activeModule.id];

  const handlePrintCheatSheet = () => {
    openPrintableCheatSheet(MODULES, divisionColors);
  };

  return (
    <div className="space-y-6">
      {/* Header (h1 FIRST — zero eyebrow kicker above h1) */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 flex flex-col md:flex-row md:items-end justify-between gap-4 print-card">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1B18]">
            {viewMode === 'cheatsheet'
              ? 'BACSE202 All-Module Formula Cheat Sheet'
              : viewMode === 'flashcards'
              ? 'SM-2 Spaced Repetition Flashcards'
              : viewMode === 'playbook'
              ? '95+ Examiner Answer Playbook & Trap Buster'
              : 'Reference & Course Materials'}
          </h1>
          <p className="text-xs font-mono text-[#6E695D] tabular-nums">
            MODULES 1–5 · PROFESSOR DECKS, FORMULAS, 95+ MARKING RUBRICS, TRAP BUSTERS &amp; SM-2 SRS FLASHCARDS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto no-print">
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'playbook' ? 'appendix' : 'playbook'))}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
              viewMode === 'playbook'
                ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                : 'bg-[#E5B82E] text-[#1C1B18] hover:bg-[#d8ab22]'
            }`}
          >
            <Award className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {viewMode === 'playbook' ? 'Back to Appendix' : '95+ Examiner Playbook'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'flashcards' ? 'appendix' : 'flashcards'))}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
              viewMode === 'flashcards'
                ? 'bg-[#22559C] text-[#FAF7F0]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {viewMode === 'flashcards'
                ? 'Back to Appendix'
                : dueFlashcardCount > 0
                ? `SRS Flashcards (${dueFlashcardCount} due)`
                : 'SRS Flashcards (All Set)'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'cheatsheet' ? 'appendix' : 'cheatsheet'))}
            className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
              viewMode === 'cheatsheet'
                ? 'bg-[#1C1B18] text-[#FAF7F0]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            {viewMode === 'cheatsheet' ? 'Back to Module Appendix' : 'All-5-Module Cheat Sheet'}
          </button>
          {viewMode === 'cheatsheet' && (
            <button
              type="button"
              onClick={handlePrintCheatSheet}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Print Cheat Sheet</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigateToSyllabus(activeModule.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
          >
            <span>Open Module {activeModule.number} Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {viewMode === 'playbook' ? (
        <ExaminerPlaybookView
          lockedTrapIds={lockedTrapIds}
          onToggleTrap={onToggleTrap}
          onResetTraps={onResetTraps}
        />
      ) : viewMode === 'flashcards' ? (
        <RapidFlashcardDeck
          srsProgress={srsProgress}
          srsMode={srsMode}
          onRateCard={onRateFlashcard}
          onChangeMode={onChangeSrsMode}
          onResetSrs={onResetFlashcards}
        />
      ) : viewMode === 'cheatsheet' ? (
        <div className="space-y-6" data-testid="printable-cheat-sheet">
          {MODULES.map((mod) => {
            const palette = MODULE_DIVISION_PALETTE[mod.id];
            return (
              <section
                key={mod.id}
                className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden print-card"
              >
                <div
                  className="px-5 py-2 border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold"
                  style={{ backgroundColor: palette.hex, color: palette.ink }}
                >
                  <span>MODULE {mod.number} · {mod.title.toUpperCase()}</span>
                  <span>{mod.hours} HOURS</span>
                </div>
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6 space-y-2.5">
                    <h2 className="text-sm font-extrabold text-[#1C1B18] border-b border-[#1C1B18] pb-1.5">
                      Critical Rules &amp; Formulas
                    </h2>
                    <dl className="divide-y divide-[#C5BEB0]">
                      {mod.keyFormulasAndRules.map((item, idx) => (
                        <div key={idx} className="py-2 first:pt-0 last:pb-0 space-y-0.5">
                          <dt className="text-xs font-bold text-[#434038]">{item.label}</dt>
                          <dd className="text-xs font-mono text-[#1C1B18] leading-relaxed">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="lg:col-span-6 space-y-2.5 overflow-x-auto">
                    <h2 className="text-sm font-extrabold text-[#1C1B18] border-b border-[#1C1B18] pb-1.5">
                      {mod.comparisonTable.title}
                    </h2>
                    <table className="w-full text-left border-collapse text-xs tabular-nums">
                      <thead>
                        <tr className="border-b border-[#1C1B18] bg-[#EAE4D7] text-[#1C1B18]">
                          {mod.comparisonTable.headers.map((h, idx) => (
                            <th key={idx} className="py-1.5 px-2.5 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C5BEB0] text-[#1C1B18]">
                        {mod.comparisonTable.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-1.5 px-2.5 align-top leading-snug ${
                                  cIdx === 0 ? 'font-bold text-[#1C1B18]' : 'text-[#434038]'
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <>
          {/* Module Selector Tabs + Print Cheat Sheet Action */}
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-2 no-print">
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MODULES.map((mod) => {
                const active = mod.id === activeModule.id;
                const palette = MODULE_DIVISION_PALETTE[mod.id];
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => onSelectModule(mod.id)}
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

            <button
              type="button"
              data-testid="print-cheat-sheet-btn"
              onClick={handlePrintCheatSheet}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.04em] text-[#FAF7F0] bg-[#1C1B18] hover:bg-[#2C2A25] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Print Cheat Sheet</span>
            </button>
          </div>

      {/* Active Module Context Banner (h2 FIRST — zero eyebrow above h2) */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden">
        <div
          className="px-5 py-2 border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold"
          style={{ backgroundColor: activePalette.hex, color: activePalette.ink }}
        >
          <span>MODULE {activeModule.number} REFERENCE APPENDIX</span>
          <span>{activeModule.hours} LECTURE HOURS</span>
        </div>
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18]">
              {activeModule.title}
            </h2>
            <p className="text-xs font-mono text-[#6E695D] tabular-nums">
              Module {activeModule.number} · {activeModule.hours} Lecture Hours
            </p>
          </div>
          <div className="text-xs font-mono text-[#434038]">
            Primary Textbook: {COURSE_META.textbook}
          </div>
        </div>
      </div>

      {/* 2-Column Reference Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 6 cols: Professor PPT Decks + Critical Rules & Formulas */}
        <div className="lg:col-span-6 space-y-6">
          {/* Professor PPT Decks */}
          <div
            className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4"
            data-testid="professor-ppts-card"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#1C1B18] pb-3">
              <h3 className="text-base font-extrabold text-[#1C1B18]">
                Professor PPT Decks ({folder.folderName})
              </h3>
              <a
                href={folder.folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1C1B18] underline underline-offset-4 whitespace-nowrap"
              >
                <span>Open Folder</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>

            <ul className="divide-y divide-[#C5BEB0]">
              {folder.files.map((file) => (
                <li
                  key={file.fileId}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <span className="text-xs sm:text-[13px] font-semibold text-[#1C1B18] leading-snug break-all">
                    {file.title}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={file.viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${file.title}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#1C1B18] bg-[#EAE4D7] hover:bg-[#ded6c6] border border-[#1C1B18] rounded-[4px] whitespace-nowrap step-hinge"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Download ${file.title}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] whitespace-nowrap step-hinge"
                    >
                      <Download className="w-3 h-3" aria-hidden="true" />
                      <span>Get</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-[#1C1B18] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#434038]">
              <a
                href={PROFESSOR_SITE_LINKS.pptRootFolder}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#1C1B18] underline underline-offset-2 font-bold"
              >
                All Modules PPT Root
              </a>
              <a
                href={PROFESSOR_SITE_LINKS.modelQuestionPaper.viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#1C1B18] underline underline-offset-2 font-bold"
              >
                Model FAT Question Paper (PDF)
              </a>
            </div>
          </div>

          {/* Critical Rules & Formulas */}
          <div
            className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4"
            data-testid="critical-rules-card"
          >
            <h3 className="text-base font-extrabold text-[#1C1B18] border-b border-[#1C1B18] pb-3">
              Critical Rules &amp; Formulas
            </h3>
            <dl className="divide-y divide-[#C5BEB0]">
              {activeModule.keyFormulasAndRules.map((item, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <dt className="text-xs font-bold text-[#434038]">{item.label}</dt>
                  <dd className="text-xs sm:text-[13px] font-mono text-[#1C1B18] leading-relaxed">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Right 6 cols: Comparison Table + Expected VIT FAT Exam Prompts */}
        <div className="lg:col-span-6 space-y-6">
          {/* Comparison Table */}
          <div
            className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4 overflow-x-auto"
            data-testid="comparison-table-card"
          >
            <h3 className="text-base font-extrabold text-[#1C1B18] border-b border-[#1C1B18] pb-3">
              {activeModule.comparisonTable.title}
            </h3>
            <table className="w-full text-left border-collapse text-xs sm:text-[13px] tabular-nums">
              <thead>
                <tr className="border-b border-[#1C1B18] bg-[#EAE4D7] text-[#1C1B18]">
                  {activeModule.comparisonTable.headers.map((h, idx) => (
                    <th key={idx} className="py-2 px-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5BEB0] text-[#1C1B18]">
                {activeModule.comparisonTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#F4EFE4]">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-2.5 px-3 align-top leading-relaxed ${
                          cIdx === 0 ? 'font-bold text-[#1C1B18]' : 'text-[#434038]'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expected VIT FAT Exam Prompts */}
          <div
            className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4"
            data-testid="expected-prompts-card"
          >
            <h3 className="text-base font-extrabold text-[#1C1B18] border-b border-[#1C1B18] pb-3">
              Expected VIT FAT Exam Prompts
            </h3>
            <ol className="space-y-3 text-sm text-[#1C1B18]">
              {activeModule.likelyFatQuestions.map((q, idx) => (
                <li key={idx} className="flex items-baseline gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#1C1B18] bg-[#E5B82E] px-1.5 py-0.5 rounded-[2px] tabular-nums shrink-0">
                    Q{idx + 1}.
                  </span>
                  <span className="leading-relaxed prose-manual">{q}</span>
                </li>
              ))}
            </ol>
            <div className="pt-3 border-t border-[#1C1B18] text-xs font-mono text-[#6E695D]">
              Primary Textbook: {COURSE_META.textbook}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
