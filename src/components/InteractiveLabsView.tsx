import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  Trash2,
} from 'lucide-react';
import {
  analyzeNormalForms,
  analyzeSchedule,
  BPlusNode,
  BPlusOp,
  computeClosure,
  decomposeBCNF,
  formatAttrList,
  parseAttributes,
  parseFDs,
  parseSchedule,
  runChaseLosslessTest,
  simulateBPlusOperations,
  synthesize3NF,
  traceBPlusSearch,
} from '../utils/dbEngine';
import { TimestampRecoveryLab } from './TimestampRecoveryLab';
import { HashingIndexLab } from './HashingIndexLab';
import { RelationalQueryLab } from './RelationalQueryLab';
import { LockingDeadlockLab } from './LockingDeadlockLab';
import { DdbmsProtocolLab } from './DdbmsProtocolLab';
import { ErMappingLab } from './ErMappingLab';
import { IntegrityConstraintLab } from './IntegrityConstraintLab';
import { NumericalDrillLab } from './NumericalDrillLab';

export type LabId =
  | 'exam_drill'
  | 'integrity'
  | 'er_mapping'
  | 'normalization'
  | 'serializability'
  | 'bplus'
  | 'hashing_index'
  | 'ra_trc_tree'
  | 'two_pl_deadlock'
  | 'timestamp_recovery'
  | 'ddbms_2pc'
  | 'cap_nosql';

interface InteractiveLabsViewProps {
  activeLab: LabId;
  onSelectLab: (lab: LabId) => void;
  drillSolvedCount?: number;
  drillBestStreak?: number;
  onRecordDrillResult?: (correct: boolean) => void;
  onResetDrillStats?: () => void;
}

const LAB_TABS: Array<{ id: LabId; label: string; moduleNote: string; hex: string; ink: string }> = [
  { id: 'exam_drill', label: '95+ Numerical Drill Arena', moduleNote: 'All M2–M5', hex: '#1C1B18', ink: '#FAF7F0' },
  { id: 'integrity', label: 'Integrity & FK Tracer', moduleNote: 'Module 1', hex: '#E5B82E', ink: '#1C1B18' },
  { id: 'er_mapping', label: 'ER/EER 7-Step Mapper', moduleNote: 'Module 2', hex: '#E06D2B', ink: '#1C1B18' },
  { id: 'normalization', label: 'FD & Normalization', moduleNote: 'Module 2', hex: '#E06D2B', ink: '#1C1B18' },
  { id: 'bplus', label: 'B+ Tree Splits & Deletes', moduleNote: 'Module 3', hex: '#4F8A3D', ink: '#FAF7F0' },
  { id: 'hashing_index', label: 'Hashing & Index I/O', moduleNote: 'Module 3', hex: '#4F8A3D', ink: '#FAF7F0' },
  { id: 'ra_trc_tree', label: 'RA, TRC & Query Trees', moduleNote: 'Module 3', hex: '#4F8A3D', ink: '#FAF7F0' },
  { id: 'serializability', label: 'Precedence Graph', moduleNote: 'Module 4', hex: '#147E7B', ink: '#FAF7F0' },
  { id: 'two_pl_deadlock', label: '2PL, WFG & Deadlocks', moduleNote: 'Module 4', hex: '#147E7B', ink: '#FAF7F0' },
  { id: 'timestamp_recovery', label: 'Timestamp & WAL Recovery', moduleNote: 'Module 4', hex: '#147E7B', ink: '#FAF7F0' },
  { id: 'ddbms_2pc', label: 'DDBMS, Semijoin & 2PC', moduleNote: 'Module 5', hex: '#22559C', ink: '#FAF7F0' },
  { id: 'cap_nosql', label: 'CAP & NoSQL', moduleNote: 'Module 5', hex: '#22559C', ink: '#FAF7F0' },
];

export const InteractiveLabsView: React.FC<InteractiveLabsViewProps> = ({
  activeLab,
  onSelectLab,
  drillSolvedCount = 0,
  drillBestStreak = 0,
  onRecordDrillResult = () => {},
  onResetDrillStats = () => {},
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1B18]">
          Database Systems Practice Labs
        </h1>
        <p className="text-xs font-mono text-[#6E695D]">
          12 INTERACTIVE EXAM SIMULATORS · 95+ NUMERICAL DRILL ARENA, INTEGRITY/FK, ER/EER, NORMALIZATION, B+ TREES, HASHING/INDEX I/O, RA/TRC/TREES, SERIALIZABILITY, 2PL/DEADLOCKS, TO/WAL, DDBMS/2PC &amp; CAP
        </p>
      </div>

      {/* Division Lab Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {LAB_TABS.map((tab) => {
          const active = activeLab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectLab(tab.id)}
              style={
                active
                  ? { backgroundColor: tab.hex, color: tab.ink }
                  : undefined
              }
              className={`px-3.5 py-2.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge flex items-center justify-between gap-2 whitespace-nowrap ${
                active
                  ? ''
                  : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#F4EFE4]'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-[#1C1B18] shrink-0"
                  style={{ backgroundColor: tab.hex }}
                  aria-hidden="true"
                />
                <span className="truncate">{tab.label}</span>
              </span>
              <span className="font-mono text-[11px] opacity-85 shrink-0">{tab.moduleNote}</span>
            </button>
          );
        })}
      </div>

      {activeLab === 'exam_drill' && (
        <NumericalDrillLab
          solvedCount={drillSolvedCount}
          bestStreak={drillBestStreak}
          onRecordResult={onRecordDrillResult}
          onResetDrillStats={onResetDrillStats}
          onJumpToLab={onSelectLab}
        />
      )}
      {activeLab === 'integrity' && <IntegrityConstraintLab />}
      {activeLab === 'er_mapping' && <ErMappingLab />}
      {activeLab === 'normalization' && <NormalizationLab />}
      {activeLab === 'bplus' && <BPlusTreeLab />}
      {activeLab === 'hashing_index' && <HashingIndexLab />}
      {activeLab === 'ra_trc_tree' && <RelationalQueryLab />}
      {activeLab === 'serializability' && <SerializabilityLab />}
      {activeLab === 'two_pl_deadlock' && <LockingDeadlockLab />}
      {activeLab === 'timestamp_recovery' && <TimestampRecoveryLab />}
      {activeLab === 'ddbms_2pc' && <DdbmsProtocolLab />}
      {activeLab === 'cap_nosql' && <CapNoSqlLab />}
    </div>
  );
};

// ============================================================================
// Lab 1: FD Closure, Candidate Keys, Minimal Cover & Normal Forms
// ============================================================================

const NORM_PRESETS = [
  {
    name: 'VIT FAT Multi-Key',
    attrs: 'A, B, C, D, E',
    fds: 'A -> BC; CD -> E; B -> D; E -> A',
    seedClosure: ['A'],
  },
  {
    name: '3NF Not BCNF (Lost FD)',
    attrs: 'A, B, C',
    fds: 'AB -> C; C -> B',
    seedClosure: ['A', 'B'],
  },
  {
    name: 'A1 Q4: PATIENT_DIAGNOSIS',
    attrs: 'Patient_ID, Appt_Date, Doctor_ID, Doctor_Name, Dept_Code, Dept_Head, Test_Name, Test_Result',
    fds: 'Patient_ID Appt_Date -> Doctor_ID; Doctor_ID -> Doctor_Name Dept_Code; Dept_Code -> Dept_Head; Patient_ID Appt_Date Test_Name -> Test_Result',
    seedClosure: ['PATIENT_ID', 'APPT_DATE'],
  },
  {
    name: 'A2 Q9(a): PROJECT_EVAL',
    attrs: 'Student_ID, Project_ID, Title, Guide_ID, Guide_Name, Department, Evaluation_Date, Marks',
    fds: 'Student_ID Project_ID -> Evaluation_Date Marks; Project_ID -> Title Guide_ID; Guide_ID -> Guide_Name Department',
    seedClosure: ['PROJECT_ID'],
  },
  {
    name: 'Model Q3: LIBRARY_ISSUE',
    attrs: 'IssueID, IssueDate, StudentID, StudentName, DeptID, DeptName, BookID, BookTitle, AuthorID, AuthorName, Publisher, QuantityIssued',
    fds: 'IssueID -> IssueDate StudentID; StudentID -> StudentName DeptID; DeptID -> DeptName; BookID -> BookTitle AuthorID Publisher; AuthorID -> AuthorName; IssueID BookID -> QuantityIssued',
    seedClosure: ['ISSUEID', 'BOOKID'],
  },
  {
    name: 'Partial Dep (1NF)',
    attrs: 'A, B, C, D',
    fds: 'AB -> C; B -> D',
    seedClosure: ['A', 'B'],
  },
];

type DecompTab = '3nf' | 'bcnf' | 'chase';
type ChaseTarget = '3nf' | 'bcnf' | 'custom';

function parseCustomDecomposition(
  raw: string,
  knownAttrs: string[]
): Array<{ name: string; attributes: string[] }> {
  const knownSet = new Set(knownAttrs);
  return raw
    .split(/[;\n]+/)
    .map((part) => part.replace(/[()]/g, '').trim())
    .filter(Boolean)
    .map((part, idx) => {
      const parsed = parseAttributes(part).filter((a) => knownSet.has(a));
      return { name: `R${idx + 1}`, attributes: parsed };
    })
    .filter((r) => r.attributes.length > 0);
}

const NormalizationLab: React.FC = () => {
  const [attrInput, setAttrInput] = useState(NORM_PRESETS[0].attrs);
  const [fdInput, setFdInput] = useState(NORM_PRESETS[0].fds);
  const [closureTarget, setClosureTarget] = useState<string[]>(NORM_PRESETS[0].seedClosure);
  const [decompTab, setDecompTab] = useState<DecompTab>('3nf');
  const [chaseTarget, setChaseTarget] = useState<ChaseTarget>('3nf');
  const [customDecompInput, setCustomDecompInput] = useState('(A, B); (C, D, E)');

  const attrs = useMemo(() => parseAttributes(attrInput), [attrInput]);
  const parsedFDs = useMemo(() => parseFDs(fdInput, attrs), [fdInput, attrs]);

  const analysis = useMemo(() => {
    if (attrs.length === 0 || parsedFDs.error || parsedFDs.fds.length === 0) return null;
    return analyzeNormalForms(attrs, parsedFDs.fds);
  }, [attrs, parsedFDs]);

  const threeNfResult = useMemo(() => {
    if (!analysis) return null;
    return synthesize3NF(attrs, parsedFDs.fds);
  }, [analysis, attrs, parsedFDs]);

  const bcnfResult = useMemo(() => {
    if (!analysis) return null;
    return decomposeBCNF(attrs, parsedFDs.fds);
  }, [analysis, attrs, parsedFDs]);

  const customRelations = useMemo(
    () => parseCustomDecomposition(customDecompInput, attrs),
    [customDecompInput, attrs]
  );

  const chaseResult = useMemo(() => {
    if (!analysis || !threeNfResult || !bcnfResult) return null;
    const targetRelations =
      chaseTarget === '3nf'
        ? threeNfResult.relations
        : chaseTarget === 'bcnf'
        ? bcnfResult.relations
        : customRelations;
    if (targetRelations.length === 0) return null;
    return runChaseLosslessTest(attrs, targetRelations, parsedFDs.fds);
  }, [analysis, threeNfResult, bcnfResult, chaseTarget, customRelations, attrs, parsedFDs]);

  const effectiveTarget = useMemo(
    () => closureTarget.filter((a) => attrs.includes(a)),
    [closureTarget, attrs]
  );

  const closureResult = useMemo(() => {
    if (parsedFDs.error || effectiveTarget.length === 0) return { closure: [], steps: [] };
    return computeClosure(effectiveTarget, parsedFDs.fds);
  }, [effectiveTarget, parsedFDs]);

  const toggleAttrInClosure = (attr: string) => {
    setClosureTarget((prev) =>
      prev.includes(attr) ? prev.filter((a) => a !== attr) : [...prev, attr]
    );
  };

  const makeLossySeed = () => {
    if (attrs.length < 2) return;
    const mid = Math.max(1, Math.floor(attrs.length / 2));
    setCustomDecompInput(`(${attrs.slice(0, mid).join(', ')}); (${attrs.slice(mid).join(', ')})`);
    setChaseTarget('custom');
  };

  return (
    <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 cols: Live Analysis Stage */}
      <div className="lg:col-span-7 space-y-5">
        {!analysis ? (
          <div className="bg-[#FAF7F0] border border-[#A62B2B] rounded-[4px] p-6 text-sm font-bold text-[#A62B2B]">
            {parsedFDs.error ?? 'Enter valid relation attributes and functional dependencies to compute normal forms.'}
          </div>
        ) : (
          <>
            {/* Verdict + Candidate Keys */}
            <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    {analysis.highestNormalForm === 'BCNF' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#4F8A3D]" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[#E06D2B]" aria-hidden="true" />
                    )}
                    <span className="text-2xl font-extrabold text-[#1C1B18]" data-testid="nf-verdict">
                      {analysis.highestNormalForm}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#6E695D]">Highest Satisfied Normal Form</div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-mono text-sm font-bold text-[#1C1B18]" data-testid="candidate-keys">
                    {analysis.candidateKeys
                      .map((k) => (k.some((a) => a.length > 1) && k.length > 1 ? `(${k.join(', ')})` : k.join('')))
                      .join(', ')}
                  </div>
                  <div className="text-xs font-mono text-[#6E695D]">Candidate Keys</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#C5BEB0] text-xs">
                <div>
                  <span className="text-[#6E695D] font-mono">PRIME ATTRIBUTES: </span>
                  <span className="font-mono font-bold text-[#1C1B18]">
                    {analysis.primeAttributes.length > 0 ? analysis.primeAttributes.join(', ') : 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6E695D] font-mono">NON-PRIME ATTRIBUTES: </span>
                  <span className="font-mono font-bold text-[#1C1B18]">
                    {analysis.nonPrimeAttributes.length > 0 ? analysis.nonPrimeAttributes.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Violations & Minimal Cover */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 space-y-3">
                <h2 className="text-base font-extrabold text-[#1C1B18] border-b border-[#1C1B18] pb-2">
                  Normal Form Violations
                </h2>
                {analysis.violations.length === 0 ? (
                  <p className="text-xs text-[#4F8A3D] font-bold">
                    Zero violations: every non-trivial FD has a superkey on the LHS (BCNF).
                  </p>
                ) : (
                  <ul className="divide-y divide-[#C5BEB0] text-xs">
                    {analysis.violations.map((v, idx) => (
                      <li key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex items-center justify-between font-mono font-bold text-[#1C1B18]">
                          <span>{v.fd}</span>
                          <span className="text-[#854D2B]">Fails {v.normalForm}</span>
                        </div>
                        <p className="text-[#434038] leading-relaxed">{v.reason}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 space-y-3">
                <h2 className="text-base font-extrabold text-[#1C1B18] border-b border-[#1C1B18] pb-2">
                  Minimal (Canonical) Cover
                </h2>
                <p className="text-xs text-[#434038]">
                  Singleton RHS, extraneous LHS removed, redundant FDs eliminated:
                </p>
                <div className="divide-y divide-[#C5BEB0] font-mono text-xs font-semibold text-[#1C1B18]">
                  {analysis.minimalCover.map((fd, idx) => (
                    <div key={idx} className="py-2 first:pt-0 last:pb-0">
                      {fd.raw}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Attribute Closure Trace */}
            <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C1B18] pb-3">
                <h2 className="text-base font-extrabold text-[#1C1B18]">
                  Interactive Attribute Closure (X+)
                </h2>
                <div className="font-mono text-xs text-[#1C1B18]">
                  ({formatAttrList(effectiveTarget) || '∅'})+ ={' '}
                  <span className="font-bold bg-[#E5B82E] px-1.5 py-0.5 rounded-[2px]">
                    {'{ '}
                    {closureResult.closure.join(', ') || '∅'}
                    {' }'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {attrs.map((attr) => {
                  const selected = effectiveTarget.includes(attr);
                  return (
                    <button
                      key={attr}
                      type="button"
                      onClick={() => toggleAttrInClosure(attr)}
                      aria-pressed={selected}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                        selected
                          ? 'bg-[#E5B82E] text-[#1C1B18]'
                          : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                      }`}
                    >
                      {attr}
                    </button>
                  );
                })}
              </div>

              {closureResult.steps.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[#C5BEB0] text-xs font-mono">
                  {closureResult.steps.map((s, idx) => (
                    <div key={idx} className="flex flex-wrap items-center justify-between gap-2 text-[#434038]">
                      <span>
                        Step {idx + 1}: apply <strong className="text-[#1C1B18]">{s.fd}</strong> (+{formatAttrList(s.added)})
                      </span>
                      <span className="text-[#1C1B18] font-bold">→ {`{${s.resultAfter.join(', ')}}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right 5 cols: Controls & Presets */}
      <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 space-y-5">
        <div className="border-b border-[#1C1B18] pb-3">
          <h2 className="text-base font-extrabold text-[#1C1B18]">Relation &amp; FD Input</h2>
          <p className="mt-1 text-xs text-[#434038]">
            Load a past VIT FAT pattern or edit attributes and dependencies directly.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {NORM_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setAttrInput(preset.attrs);
                setFdInput(preset.fds);
                setClosureTarget(preset.seedClosure);
              }}
              className="px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#EAE4D7] hover:bg-[#ded6c6] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="norm-attrs" className="block text-xs font-bold text-[#1C1B18]">
            Relation Attributes (comma-separated)
          </label>
          <input
            id="norm-attrs"
            type="text"
            value={attrInput}
            onChange={(e) => setAttrInput(e.target.value)}
            className="w-full h-10 px-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] focus:outline-none focus:bg-[#FAF7F0]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="norm-fds" className="block text-xs font-bold text-[#1C1B18]">
            Functional Dependencies (semicolon-separated; space-join multi-attr keys)
          </label>
          <textarea
            id="norm-fds"
            rows={4}
            value={fdInput}
            onChange={(e) => setFdInput(e.target.value)}
            className="w-full p-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] focus:outline-none focus:bg-[#FAF7F0]"
          />
        </div>

        <div className="pt-3 border-t border-[#1C1B18] text-xs text-[#434038] space-y-1.5">
          <div className="font-bold text-[#1C1B18]">Exam Checklist</div>
          <p>1. Find attributes missing from all FD RHS — they belong in every Candidate Key.</p>
          <p>2. Verify 2NF (no partial key → non-prime), 3NF (superkey LHS or prime RHS), then BCNF (superkey LHS).</p>
          <p>3. Use 3NF Synthesis when dependency preservation is mandatory; use BCNF when zero redundancy is prioritized.</p>
        </div>
      </div>
    </div>

      {/* Full-Width 3NF Synthesis, BCNF Decomposition Tree & Chase Lossless-Join Solver */}
      {analysis && threeNfResult && bcnfResult && (
        <section
          aria-label="3NF synthesis, BCNF decomposition, and Chase lossless-join solver"
          data-testid="decomposition-solver"
          className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden"
        >
          <div className="px-5 py-4 bg-[#EAE4D7] border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#1C1B18]">
                3NF Synthesis, BCNF Decomposition &amp; Chase Lossless-Join Solver
              </h2>
              <p className="text-xs font-mono text-[#434038]">
                ELMASRI &amp; NAVATHE ALGORITHMS 15.2 / 15.3 / 15.5 · LIVE SCHEMA GENERATOR &amp; TABLEAU PROOF
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  {
                    id: '3nf',
                    label: `3NF Synthesis (${threeNfResult.relations.length} ${threeNfResult.relations.length === 1 ? 'Table' : 'Tables'})`,
                  },
                  {
                    id: 'bcnf',
                    label: `BCNF Decomposition (${bcnfResult.relations.length} ${bcnfResult.relations.length === 1 ? 'Table' : 'Tables'})`,
                  },
                  { id: 'chase', label: 'Chase Tableau (Lossless Proof)' },
                ] as Array<{ id: DecompTab; label: string }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDecompTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
                    decompTab === tab.id
                      ? 'bg-[#E5B82E] text-[#1C1B18]'
                      : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#F4EFE4]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUB-TAB 1: 3NF SYNTHESIS */}
          {decompTab === '3nf' && (
            <div className="p-5 sm:p-6 space-y-5" data-testid="three-nf-panel">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span
                  className={`px-2.5 py-1 rounded-[2px] border border-[#1C1B18] font-bold ${
                    threeNfResult.isLossless
                      ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                      : 'bg-[#A62B2B] text-[#FAF7F0]'
                  }`}
                >
                  Lossless Join: {threeNfResult.isLossless ? 'GUARANTEED' : 'FAILED'}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-[2px] border border-[#1C1B18] font-bold ${
                    threeNfResult.isDependencyPreserving
                      ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                      : 'bg-[#A62B2B] text-[#FAF7F0]'
                  }`}
                >
                  Dependency Preserving: {threeNfResult.isDependencyPreserving ? 'YES (100%)' : 'NO'}
                </span>
                {threeNfResult.addedCandidateKeyRelation && (
                  <span className="px-2.5 py-1 rounded-[2px] border border-[#1C1B18] bg-[#E5B82E] text-[#1C1B18] font-bold">
                    + Added Candidate-Key Schema for Lossless Join
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {threeNfResult.relations.map((rel) => {
                  const pkSet = new Set(rel.primaryKey);
                  return (
                    <div
                      key={rel.name}
                      className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-[#C5BEB0] pb-2">
                        <span className="font-mono text-sm font-extrabold text-[#1C1B18]">
                          {rel.name}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#FAF7F0] border border-[#1C1B18] rounded-[2px] text-[#1C1B18]">
                          PK: {rel.primaryKey.join(', ')}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-[#1C1B18] leading-relaxed break-words">
                        {rel.name}(
                        {rel.attributes.map((a, i) => (
                          <span key={a}>
                            {i > 0 && ', '}
                            <span className={pkSet.has(a) ? 'underline font-extrabold' : ''}>
                              {a}
                            </span>
                          </span>
                        ))}
                        )
                      </div>
                      {rel.preservedFds.length > 0 && (
                        <div className="text-[11px] font-mono text-[#4F8A3D] font-semibold">
                          FDs: {rel.preservedFds.join('; ')}
                        </div>
                      )}
                      <p className="text-[11px] text-[#434038] leading-snug">{rel.reason}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-1.5 text-xs font-mono text-[#1C1B18]">
                <div className="font-bold text-[#434038] uppercase tracking-wider text-[11px]">
                  3NF Synthesis Trace (Write These 4 Steps in FAT)
                </div>
                {threeNfResult.steps.map((step, i) => (
                  <div key={i} className="leading-relaxed">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: BCNF DECOMPOSITION TREE */}
          {decompTab === 'bcnf' && (
            <div className="p-5 sm:p-6 space-y-5" data-testid="bcnf-panel">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span
                  className={`px-2.5 py-1 rounded-[2px] border border-[#1C1B18] font-bold ${
                    bcnfResult.isLossless
                      ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                      : 'bg-[#A62B2B] text-[#FAF7F0]'
                  }`}
                >
                  Lossless Join: {bcnfResult.isLossless ? 'GUARANTEED' : 'FAILED'}
                </span>
                <span
                  data-testid="bcnf-dep-status"
                  className={`px-2.5 py-1 rounded-[2px] border border-[#1C1B18] font-bold ${
                    bcnfResult.isDependencyPreserving
                      ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                      : 'bg-[#A62B2B] text-[#FAF7F0]'
                  }`}
                >
                  {bcnfResult.isDependencyPreserving
                    ? 'Dependency Preserving: YES (All FDs Preserved)'
                    : `Dependency Preserving: NO (${bcnfResult.lostFds.length} Lost FD)`}
                </span>
              </div>

              {bcnfResult.alreadyBCNF ? (
                <div className="p-4 bg-[#4F8A3D]/10 border border-[#4F8A3D] rounded-[4px] text-xs font-bold text-[#1C1B18]">
                  Relation R is already in BCNF — zero violating functional dependencies, no splits needed.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#434038]">
                    Step-by-Step BCNF Split Tree
                  </div>
                  <div className="space-y-2.5">
                    {bcnfResult.splits.map((sp) => (
                      <div
                        key={sp.stepNo}
                        className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                          <span className="font-extrabold text-[#1C1B18]">
                            Step {sp.stepNo}: Split {sp.parentName}({sp.parentAttrs.join(', ')})
                          </span>
                          <span className="px-2 py-0.5 bg-[#A62B2B] text-[#FAF7F0] rounded-[2px] font-bold">
                            Violating FD: {sp.violatingFd}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[3px] p-2.5">
                            <span className="font-bold text-[#4F8A3D]">{sp.leftName} (X ∪ Y): </span>
                            <span className="text-[#1C1B18]">({sp.leftAttrs.join(', ')})</span>
                          </div>
                          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[3px] p-2.5">
                            <span className="font-bold text-[#22559C]">{sp.rightName} ((S − Y) ∪ X): </span>
                            <span className="text-[#1C1B18]">({sp.rightAttrs.join(', ')})</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#434038]">{sp.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#434038]">
                  Final BCNF Schemas
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {bcnfResult.relations.map((rel) => {
                    const pkSet = new Set(rel.primaryKey);
                    return (
                      <div
                        key={rel.name}
                        className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-[#C5BEB0] pb-2">
                          <span className="font-mono text-sm font-extrabold text-[#1C1B18]">
                            {rel.name}
                          </span>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#FAF7F0] border border-[#1C1B18] rounded-[2px] text-[#1C1B18]">
                            PK: {rel.primaryKey.join(', ')}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-[#1C1B18] break-words">
                          {rel.name}(
                          {rel.attributes.map((a, i) => (
                            <span key={a}>
                              {i > 0 && ', '}
                              <span className={pkSet.has(a) ? 'underline font-extrabold' : ''}>
                                {a}
                              </span>
                            </span>
                          ))}
                          )
                        </div>
                        <p className="text-[11px] text-[#434038]">{rel.reason}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#4F8A3D]/10 border border-[#4F8A3D] rounded-[4px] p-3.5 space-y-1">
                  <div className="font-bold text-[#4F8A3D]">
                    Preserved Minimal-Cover FDs ({bcnfResult.preservedFds.length})
                  </div>
                  <div className="text-[#1C1B18]">
                    {bcnfResult.preservedFds.length > 0 ? bcnfResult.preservedFds.join(' · ') : 'None'}
                  </div>
                </div>
                <div
                  className={`rounded-[4px] p-3.5 space-y-1 border ${
                    bcnfResult.lostFds.length > 0
                      ? 'bg-[#A62B2B]/10 border-[#A62B2B]'
                      : 'bg-[#F4EFE4] border-[#C5BEB0]'
                  }`}
                >
                  <div
                    className={`font-bold ${
                      bcnfResult.lostFds.length > 0 ? 'text-[#A62B2B]' : 'text-[#434038]'
                    }`}
                  >
                    Lost FDs in BCNF ({bcnfResult.lostFds.length})
                  </div>
                  <div className="text-[#1C1B18]" data-testid="bcnf-lost-fds">
                    {bcnfResult.lostFds.length > 0
                      ? `${bcnfResult.lostFds.join(' · ')} — Enforcing these now requires cross-table joins (classic 3NF vs BCNF trade-off!).`
                      : 'None — this BCNF decomposition is both Lossless and Dependency Preserving.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: CHASE TABLEAU LOSSLESS-JOIN PROOF */}
          {decompTab === 'chase' && (
            <div className="p-5 sm:p-6 space-y-5" data-testid="chase-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: '3nf', label: 'Test 3NF Synthesis' },
                      { id: 'bcnf', label: 'Test BCNF Decomposition' },
                      { id: 'custom', label: 'Test Custom Decomposition' },
                    ] as Array<{ id: ChaseTarget; label: string }>
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setChaseTarget(opt.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                        chaseTarget === opt.id
                          ? 'bg-[#1C1B18] text-[#FAF7F0]'
                          : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={makeLossySeed}
                    className="px-3 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#A62B2B] text-[#A62B2B] bg-[#FAF7F0] hover:bg-[#A62B2B] hover:text-[#FAF7F0] step-hinge"
                  >
                    Try Lossy Split
                  </button>
                </div>

                {chaseResult && (
                  <span
                    data-testid="chase-verdict"
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-[3px] border border-[#1C1B18] ${
                      chaseResult.isLossless
                        ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                        : 'bg-[#A62B2B] text-[#FAF7F0]'
                    }`}
                  >
                    {chaseResult.isLossless
                      ? `LOSSLESS JOIN PROVED (${chaseResult.relationNames[chaseResult.winningRowIndex!]} = all a_j)`
                      : 'LOSSY JOIN — No all-a_j row reached'}
                  </span>
                )}
              </div>

              {chaseTarget === 'custom' && (
                <div className="space-y-1.5">
                  <label htmlFor="custom-chase-input" className="block text-xs font-bold text-[#1C1B18]">
                    Custom Decomposition Schemas (semicolon-separated attribute groups)
                  </label>
                  <input
                    id="custom-chase-input"
                    type="text"
                    value={customDecompInput}
                    onChange={(e) => setCustomDecompInput(e.target.value)}
                    placeholder="(A, B); (B, C)"
                    className="w-full h-10 px-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18]"
                  />
                </div>
              )}

              {chaseResult ? (
                <>
                  <div className="overflow-x-auto border border-[#1C1B18] rounded-[4px]">
                    <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                      <thead>
                        <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-[#1C1B18]">
                          <th className="py-2 px-3 font-extrabold border-r border-[#1C1B18] whitespace-nowrap">
                            Relation
                          </th>
                          {chaseResult.attributes.map((attr, cIdx) => (
                            <th
                              key={attr}
                              className="py-2 px-2.5 font-bold whitespace-nowrap border-r border-[#C5BEB0] last:border-r-0"
                            >
                              {attr}{' '}
                              <span className="text-[10px] text-[#6E695D]">(a{cIdx + 1})</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C5BEB0]">
                        {chaseResult.finalMatrix.map((row, rIdx) => {
                          const isWinner = chaseResult.winningRowIndex === rIdx;
                          return (
                            <tr
                              key={chaseResult.relationNames[rIdx]}
                              className={isWinner ? 'bg-[#4F8A3D]/20 font-bold' : 'bg-[#FAF7F0]'}
                            >
                              <td className="py-2 px-3 font-extrabold text-[#1C1B18] border-r border-[#1C1B18] whitespace-nowrap">
                                {chaseResult.relationNames[rIdx]}
                                {isWinner && (
                                  <span className="ml-1.5 px-1 py-0.5 text-[9px] bg-[#4F8A3D] text-[#FAF7F0] rounded-[2px]">
                                    ALL a
                                  </span>
                                )}
                              </td>
                              {row.map((cell, cIdx) => {
                                const isDistinguished = cell.startsWith('a');
                                const changedFromInit =
                                  chaseResult.initialMatrix[rIdx][cIdx] !== cell;
                                return (
                                  <td
                                    key={cIdx}
                                    className={`py-2 px-2.5 whitespace-nowrap border-r border-[#C5BEB0] last:border-r-0 ${
                                      changedFromInit
                                        ? 'bg-[#E5B82E]/35 text-[#1C1B18] font-extrabold'
                                        : isDistinguished
                                        ? 'text-[#4F8A3D] font-bold'
                                        : 'text-[#6E695D]'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-1.5 text-xs font-mono">
                    <div className="font-bold text-[#434038] uppercase tracking-wider text-[11px]">
                      Chase Transformation Steps (Highlighted cells changed from b → a)
                    </div>
                    {chaseResult.steps.length === 0 ? (
                      <div className="text-[#434038]">
                        {chaseResult.isLossless
                          ? 'Initial tableau already contains a full all-a_j row (single-table lossless relation).'
                          : 'No two rows agreed on the LHS of any FD — matrix halted without forming an all-a_j row (Lossy Join).'}
                      </div>
                    ) : (
                      chaseResult.steps.map((st) => (
                        <div key={st.stepNo} className="text-[#1C1B18] leading-relaxed">
                          <span className="font-bold">Step {st.stepNo}</span> (apply{' '}
                          <span className="px-1 py-0.5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[2px]">
                            {st.fd}
                          </span>{' '}
                          on rows{' '}
                          {st.matchedRows.map((i) => chaseResult.relationNames[i]).join(', ')}):{' '}
                          {st.updates.join('; ')}
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 text-xs font-mono text-[#A62B2B] bg-[#A62B2B]/10 border border-[#A62B2B] rounded-[4px]">
                  Enter at least one valid relation using attributes from R ({attrs.join(', ')}).
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

// ============================================================================
// Lab 2: Conflict Serializability & Precedence Graph
// ============================================================================

const SCHEDULE_PRESETS = [
  {
    name: 'Serializable (T1→T2→T3)',
    ops: 'R1(X) W1(X) C1 R2(X) W2(Y) C2 R3(Y) W3(Y) C3',
  },
  {
    name: 'Cycle (Not Serializable)',
    ops: 'R1(X) R2(X) W1(X) W2(X)',
  },
  {
    name: 'Dirty Read (Unrecoverable)',
    ops: 'W1(X) R2(X) C2 A1',
  },
];

const SerializabilityLab: React.FC = () => {
  const [scheduleInput, setScheduleInput] = useState(SCHEDULE_PRESETS[0].ops);

  const parsed = useMemo(() => parseSchedule(scheduleInput), [scheduleInput]);
  const analysis = useMemo(
    () => (parsed.error || parsed.ops.length === 0 ? null : analyzeSchedule(parsed.ops)),
    [parsed]
  );

  const graphLayout = useMemo(() => {
    if (!analysis) return { nodes: [], edges: [] };
    const count = analysis.transactions.length;
    const cx = 240;
    const cy = 140;
    const radius = 98;

    const posMap = new Map<string, { x: number; y: number }>();
    const nodes = analysis.transactions.map((tx, idx) => {
      if (count === 2) {
        const x = idx === 0 ? 135 : 345;
        const y = cy;
        posMap.set(tx, { x, y });
        return { tx, x, y };
      }
      const angle = (idx / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
      const x = count === 1 ? cx : cx + Math.cos(angle) * radius;
      const y = count === 1 ? cy : cy + Math.sin(angle) * radius;
      posMap.set(tx, { x, y });
      return { tx, x, y };
    });

    const cyclePairs = new Set<string>();
    if (analysis.cycle) {
      for (let i = 0; i < analysis.cycle.length - 1; i++) {
        cyclePairs.add(`${analysis.cycle[i]}->${analysis.cycle[i + 1]}`);
      }
    }

    const edges = analysis.uniqueEdges.map((edge) => {
      const fromPos = posMap.get(edge.from)!;
      const toPos = posMap.get(edge.to)!;
      const reverseExists = analysis.uniqueEdges.some(
        (other) => other.from === edge.to && other.to === edge.from
      );
      const isCycleEdge = cyclePairs.has(`${edge.from}->${edge.to}`);
      return { ...edge, fromPos, toPos, reverseExists, isCycleEdge };
    });

    return { nodes, edges };
  }, [analysis]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 cols: Precedence Graph + Serializability Status */}
      <div className="lg:col-span-7 space-y-5">
        {!analysis ? (
          <div className="bg-[#FAF7F0] border border-[#A62B2B] rounded-[4px] p-6 text-sm font-bold text-[#A62B2B]">
            {parsed.error ?? 'Enter schedule operations to generate a precedence graph.'}
          </div>
        ) : (
          <>
            <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {analysis.isConflictSerializable ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4F8A3D]" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#A62B2B]" aria-hidden="true" />
                  )}
                  <h2 className="text-lg font-extrabold text-[#1C1B18]" data-testid="serializability-verdict">
                    {analysis.isConflictSerializable
                      ? 'Conflict Serializable (Acyclic Graph)'
                      : `Not Conflict Serializable (Cycle: ${analysis.cycle?.join(' → ')})`}
                  </h2>
                </div>

                {analysis.serialOrder && (
                  <div className="font-mono text-xs font-bold text-[#1C1B18] bg-[#E5B82E] border border-[#1C1B18] px-3 py-1.5 rounded-[4px]">
                    Order: {analysis.serialOrder.join(' → ')}
                  </div>
                )}
              </div>

              {/* SVG Precedence Graph */}
              <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] overflow-hidden">
                <svg
                  viewBox="0 0 480 280"
                  className="w-full h-64"
                  role="img"
                  aria-label="Transaction Precedence Graph"
                  data-testid="precedence-graph-svg"
                >
                  <defs>
                    <marker
                      id="arrow-normal"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1C1B18" />
                    </marker>
                    <marker
                      id="arrow-cycle"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#A62B2B" />
                    </marker>
                  </defs>

                  {graphLayout.edges.map((edge, idx) => {
                    const dx = edge.toPos.x - edge.fromPos.x;
                    const dy = edge.toPos.y - edge.fromPos.y;
                    const len = Math.hypot(dx, dy) || 1;
                    const ux = dx / len;
                    const uy = dy / len;
                    const nodeR = 24;
                    const x1 = edge.fromPos.x + ux * nodeR;
                    const y1 = edge.fromPos.y + uy * nodeR;
                    const x2 = edge.toPos.x - ux * (nodeR + 4);
                    const y2 = edge.toPos.y - uy * (nodeR + 4);

                    const curveOffset = edge.reverseExists ? 36 : 0;
                    const mx = (x1 + x2) / 2 - uy * curveOffset;
                    const my = (y1 + y2) / 2 + ux * curveOffset;
                    // Quadratic Bezier point at t=0.5 stays clear of central cross-chords & opposing arcs
                    const lx = 0.25 * x1 + 0.5 * mx + 0.25 * x2;
                    const ly = 0.25 * y1 + 0.5 * my + 0.25 * y2;
                    const pathD = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
                    const strokeColor = edge.isCycleEdge ? '#A62B2B' : '#1C1B18';

                    return (
                      <g key={idx}>
                        <path
                          d={pathD}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={edge.isCycleEdge ? 2.5 : 2}
                          markerEnd={edge.isCycleEdge ? 'url(#arrow-cycle)' : 'url(#arrow-normal)'}
                        />
                        <text
                          x={lx}
                          y={ly}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-[11px] font-mono font-bold"
                          fill={edge.isCycleEdge ? '#A62B2B' : '#1C1B18'}
                          stroke="#F4EFE4"
                          strokeWidth={5}
                          strokeLinejoin="round"
                          style={{ paintOrder: 'stroke' }}
                        >
                          {edge.labels.join(', ')}
                        </text>
                      </g>
                    );
                  })}

                  {graphLayout.nodes.map((n) => (
                    <g key={n.tx} transform={`translate(${n.x}, ${n.y})`}>
                      <circle r="22" fill="#FAF7F0" stroke="#1C1B18" strokeWidth="2" />
                      <text
                        textAnchor="middle"
                        dy="0.35em"
                        className="text-xs font-mono font-bold"
                        fill="#1C1B18"
                      >
                        {n.tx}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Recoverability Hierarchy */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px]">
                  <div className="text-[#6E695D] font-mono">RECOVERABLE</div>
                  <div className={`mt-0.5 font-bold ${analysis.isRecoverable ? 'text-[#4F8A3D]' : 'text-[#A62B2B]'}`}>
                    {analysis.isRecoverable ? 'YES' : 'NO (Fails)'}
                  </div>
                </div>
                <div className="p-3 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px]">
                  <div className="text-[#6E695D] font-mono">CASCADELESS</div>
                  <div className={`mt-0.5 font-bold ${analysis.isCascadeless ? 'text-[#4F8A3D]' : 'text-[#854D2B]'}`}>
                    {analysis.isCascadeless ? 'YES' : 'NO'}
                  </div>
                </div>
                <div className="p-3 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px]">
                  <div className="text-[#6E695D] font-mono">STRICT</div>
                  <div className={`mt-0.5 font-bold ${analysis.isStrict ? 'text-[#4F8A3D]' : 'text-[#854D2B]'}`}>
                    {analysis.isStrict ? 'YES' : 'NO'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#434038]">{analysis.recoverabilityNote}</p>
            </div>

            {/* Conflicting Operations Table */}
            <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 space-y-3">
              <h3 className="text-base font-extrabold text-[#1C1B18] border-b border-[#1C1B18] pb-2">
                Conflicting Operation Pairs ({analysis.conflicts.length})
              </h3>
              {analysis.conflicts.length === 0 ? (
                <p className="text-xs text-[#6E695D]">No conflicting RW, WR, or WW pairs detected.</p>
              ) : (
                <table className="w-full text-left text-xs border-collapse tabular-nums">
                  <thead>
                    <tr className="border-b border-[#1C1B18] text-[#6E695D] font-mono">
                      <th className="py-2 pr-3 font-bold">Conflict Edge</th>
                      <th className="py-2 pr-3 font-bold">Type</th>
                      <th className="py-2 pr-3 font-bold">Data Item</th>
                      <th className="py-2 font-bold">Steps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C5BEB0] font-mono text-[#1C1B18]">
                    {analysis.conflicts.map((c, idx) => (
                      <tr key={idx}>
                        <td className="py-2 pr-3 font-bold">{c.from} → {c.to}</td>
                        <td className="py-2 pr-3">{c.conflictType}</td>
                        <td className="py-2 pr-3">{c.item}</td>
                        <td className="py-2 text-[#6E695D]">op #{c.fromStep} → op #{c.toStep}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right 5 cols: Schedule Controls */}
      <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 space-y-5">
        <div className="border-b border-[#1C1B18] pb-3">
          <h2 className="text-base font-extrabold text-[#1C1B18]">Concurrent Schedule Input</h2>
          <p className="mt-1 text-xs text-[#434038]">
            Enter operations using R1(X), W2(X), C1 (commit), or A1 (abort).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SCHEDULE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setScheduleInput(preset.ops)}
              className="px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#EAE4D7] hover:bg-[#ded6c6] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="schedule-ops" className="block text-xs font-bold text-[#1C1B18]">
            Schedule Sequence
          </label>
          <textarea
            id="schedule-ops"
            rows={4}
            value={scheduleInput}
            onChange={(e) => setScheduleInput(e.target.value)}
            className="w-full p-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] focus:outline-none focus:bg-[#FAF7F0]"
          />
        </div>

        <div className="pt-3 border-t border-[#1C1B18] text-xs text-[#434038] space-y-1.5">
          <div className="font-bold text-[#1C1B18]">Precedence Graph Rules</div>
          <p>Draw directed edge Ti → Tj whenever Ti executes before Tj on the same item X and at least one operation is a Write (RW, WR, WW).</p>
          <p>No cycles = Conflict Serializable. Topological order = equivalent serial execution.</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Lab 3: B+ Tree Order, Split, Deletion & Step Replay Visualizer
// ============================================================================

interface BPlusPreset {
  id: string;
  label: string;
  order: 3 | 4;
  ops: BPlusOp[];
  searchKey: string;
  note: string;
}

const BPLUS_PRESETS: BPlusPreset[] = [
  {
    id: 'default',
    label: 'Default (p = 3)',
    order: 3,
    ops: [10, 20, 5, 15, 25, 30, 35].map((key) => ({ type: 'insert' as const, key })),
    searchKey: '25',
    note: 'Clean 7-key order p=3 insert sequence showing leaf splits & root split.',
  },
  {
    id: 'model_q6',
    label: 'Model QP Q6(a)/(b) (p = 4)',
    order: 4,
    ops: [
      ...[24, 45, 11, 89, 55, 67, 49, 38, 7, 23, 12, 78, 97, 36, 21].map((key) => ({
        type: 'insert' as const,
        key,
      })),
      ...[38, 12, 89].map((key) => ({ type: 'delete' as const, key })),
    ],
    searchKey: '21',
    note: 'Official Model QP Q6: 15 inserts then Delete 38, 12, 89 (leaf borrow + Case II separator update).',
  },
  {
    id: 'a1_q5b',
    label: 'A1+TA1 Q5(b) (p = 3)',
    order: 3,
    ops: [
      ...[10, 20, 5, 15, 25, 30, 2].map((key) => ({ type: 'insert' as const, key })),
      ...[5, 20, 15].map((key) => ({ type: 'delete' as const, key })),
    ],
    searchKey: '25',
    note: 'Nov 2026 A1+TA1 Q5(b): inserts [10,20,5,15,25,30,2] followed by Delete 5, 20, 15.',
  },
  {
    id: 'a2_q10a',
    label: 'A2+TA2 Q10(a) (p = 3)',
    order: 3,
    ops: [
      ...[10, 20, 5, 15, 25].map((key) => ({ type: 'insert' as const, key })),
      { type: 'delete' as const, key: 10 },
      ...[30, 35, 40].map((key) => ({ type: 'insert' as const, key })),
      { type: 'delete' as const, key: 20 },
    ],
    searchKey: '25',
    note: 'Nov 2026 A2+TA2 Q10(a): height collapse on Delete 10, then further inserts + Delete 20.',
  },
];

const BPlusTreeLab: React.FC = () => {
  const [activePresetId, setActivePresetId] = useState<string>('default');
  const [order, setOrder] = useState<3 | 4>(3);
  const [ops, setOps] = useState<BPlusOp[]>(BPLUS_PRESETS[0].ops);
  const [activeStepIdx, setActiveStepIdx] = useState<number | 'final'>('final');
  const [newKeyInput, setNewKeyInput] = useState('12');
  const [deleteKeyInput, setDeleteKeyInput] = useState('20');
  const [searchKeyInput, setSearchKeyInput] = useState('25');

  const simulation = useMemo(() => simulateBPlusOperations(ops, order), [ops, order]);

  const resolvedStepIndex =
    simulation.steps.length === 0
      ? -1
      : activeStepIdx === 'final'
      ? simulation.steps.length - 1
      : Math.max(0, Math.min(activeStepIdx, simulation.steps.length - 1));

  const activeStep = resolvedStepIndex >= 0 ? simulation.steps[resolvedStepIndex] : null;
  const tree = activeStep ? activeStep.tree : simulation.finalTree;

  const searchTarget = parseInt(searchKeyInput, 10);
  const searchResult = useMemo(() => {
    if (!Number.isFinite(searchTarget)) return null;
    return traceBPlusSearch(tree, searchTarget);
  }, [tree, searchTarget]);

  const levels = useMemo(() => {
    const rows: BPlusNode[][] = [];
    let current: BPlusNode[] = [tree];
    while (current.length > 0) {
      rows.push(current);
      const next: BPlusNode[] = [];
      for (const n of current) {
        if (!n.isLeaf) next.push(...n.children);
      }
      current = next;
    }
    return rows;
  }, [tree]);

  const distinctKeyCount = useMemo(() => {
    const leafRow = levels[levels.length - 1] ?? [];
    return leafRow.reduce((sum, n) => sum + n.keys.length, 0);
  }, [levels]);

  const minLeafKeys = Math.ceil((order - 1) / 2);

  const handleApplyPreset = (preset: BPlusPreset) => {
    setActivePresetId(preset.id);
    setOrder(preset.order);
    setOps(preset.ops);
    setSearchKeyInput(preset.searchKey);
    setActiveStepIdx('final');
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(newKeyInput, 10);
    if (!Number.isFinite(val)) return;
    if (ops.length < 36) {
      setOps((prev) => [...prev, { type: 'insert', key: val }]);
      setActiveStepIdx('final');
      setActivePresetId('custom');
    }
    setNewKeyInput('');
  };

  const handleDeleteKey = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(deleteKeyInput, 10);
    if (!Number.isFinite(val)) return;
    if (ops.length < 36) {
      setOps((prev) => [...prev, { type: 'delete', key: val }]);
      setActiveStepIdx('final');
      setActivePresetId('custom');
    }
    setDeleteKeyInput('');
  };

  const visitedSet = useMemo(
    () => new Set(searchResult?.visitedNodeIds ?? []),
    [searchResult]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 cols: B+ Tree Hierarchy, Step Replay & Search Path */}
      <div className="lg:col-span-7 space-y-5">
        <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-[#1C1B18]">
                B+ Tree Structure (Order p = {order}, Max Keys = {order - 1})
              </h2>
              <p className="text-xs font-mono text-[#6E695D] tabular-nums">
                Height: {levels.length} level{levels.length === 1 ? '' : 's'} · {distinctKeyCount} keys · Min Leaf: {minLeafKeys}
              </p>
            </div>
            {searchResult && (
              <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-[4px] bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18]">
                {searchResult.found ? `FOUND ${searchTarget}` : `NOT FOUND (${searchTarget})`} · {searchResult.steps.length} Disk I/Os
              </div>
            )}
          </div>

          {/* Clean Hierarchical Tree Rendering */}
          <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-5 space-y-6 overflow-x-auto" data-testid="bplus-tree-stage">
            {levels.map((levelNodes, lvlIdx) => {
              const isLeafLevel = levelNodes[0]?.isLeaf;
              return (
                <div key={lvlIdx} className="space-y-1.5">
                  <div className="text-[11px] font-mono font-bold text-[#6E695D]">
                    {lvlIdx === 0 ? 'ROOT NODE' : isLeafLevel ? 'LEAF LEVEL (LINKED SEQUENTIALLY)' : `INTERNAL LEVEL ${lvlIdx}`}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {levelNodes.map((node, nIdx) => {
                      const highlighted = visitedSet.has(node.id);
                      return (
                        <React.Fragment key={node.id}>
                          <div
                            className={`inline-flex items-center border border-[#1C1B18] rounded-[4px] font-mono text-xs font-bold tabular-nums step-hinge ${
                              highlighted
                                ? 'bg-[#E5B82E] text-[#1C1B18]'
                                : node.isLeaf
                                ? 'bg-[#FAF7F0] text-[#1C1B18]'
                                : 'bg-[#EAE4D7] text-[#1C1B18]'
                            }`}
                          >
                            {node.keys.length === 0 ? (
                              <span className="px-3 py-1.5 text-[#6E695D]">empty</span>
                            ) : (
                              node.keys.map((k, kIdx) => (
                                <span
                                  key={k}
                                  className={`px-2.5 py-1.5 ${
                                    kIdx > 0 ? 'border-l border-[#1C1B18]' : ''
                                  }`}
                                >
                                  {k}
                                </span>
                              ))
                            )}
                          </div>
                          {isLeafLevel && nIdx < levelNodes.length - 1 && (
                            <span className="text-[#1C1B18] font-mono text-xs font-bold" aria-hidden="true">
                              →
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step-by-Step Replay Controls & Structural Event Log */}
          {simulation.steps.length > 0 && activeStep && (
            <div
              className="bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] p-4 space-y-3"
              data-testid="bplus-replay-controls"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-mono font-bold rounded-[2px] border border-[#1C1B18] ${
                      activeStep.op.type === 'delete'
                        ? 'bg-[#A62B2B] text-[#FAF7F0]'
                        : 'bg-[#4F8A3D] text-[#FAF7F0]'
                    }`}
                  >
                    {activeStep.actionSummary}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1C1B18] tabular-nums">
                    Step {resolvedStepIndex + 1} / {simulation.steps.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveStepIdx(0)}
                    disabled={resolvedStepIndex <= 0}
                    aria-label="First step"
                    className="p-1.5 rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] hover:bg-[#E5B82E] disabled:opacity-40 step-hinge"
                  >
                    <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStepIdx(Math.max(0, resolvedStepIndex - 1))}
                    disabled={resolvedStepIndex <= 0}
                    aria-label="Previous step"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] hover:bg-[#E5B82E] disabled:opacity-40 step-hinge"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveStepIdx(Math.min(simulation.steps.length - 1, resolvedStepIndex + 1))
                    }
                    disabled={resolvedStepIndex >= simulation.steps.length - 1}
                    aria-label="Next step"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] hover:bg-[#E5B82E] disabled:opacity-40 step-hinge"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStepIdx('final')}
                    disabled={resolvedStepIndex >= simulation.steps.length - 1}
                    aria-label="Final step"
                    className="p-1.5 rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] hover:bg-[#E5B82E] disabled:opacity-40 step-hinge"
                  >
                    <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <ul className="space-y-1 text-xs font-mono text-[#1C1B18] list-disc pl-4 marker:text-[#6E695D]">
                {activeStep.events.map((ev, eIdx) => (
                  <li key={eIdx}>{ev}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Search Path Trace */}
          {searchResult && (
            <div className="space-y-2 pt-2 border-t border-[#1C1B18]">
              <div className="text-xs font-bold text-[#1C1B18]">
                Search Trace for Key {searchTarget}
              </div>
              <ol className="space-y-1.5 text-xs font-mono text-[#1C1B18]">
                {searchResult.steps.map((step, idx) => (
                  <li key={idx} className="flex flex-wrap items-center justify-between gap-2 bg-[#F4EFE4] px-3 py-1.5 rounded-[4px] border border-[#C5BEB0]">
                    <span>
                      I/O #{idx + 1} [{step.isLeaf ? 'Leaf' : 'Internal'} {step.nodeId}: {step.keysChecked.join(', ')}]
                    </span>
                    <span className="font-bold text-[#1C1B18]">{step.decision}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Right 5 cols: B+ Tree Exam Presets & Insert/Delete Controls */}
      <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 space-y-5">
        <div className="border-b border-[#1C1B18] pb-3">
          <h2 className="text-base font-extrabold text-[#1C1B18]">Exam Presets &amp; Operations</h2>
          <p className="mt-1 text-xs text-[#434038]">
            Insert or delete keys sequentially and step through splits, borrows, merges, Case II separator updates, and root collapses.
          </p>
        </div>

        {/* FAT Exam Presets */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#1C1B18]">FAT Exam Presets</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {BPLUS_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-3 py-2 text-left text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                  activePresetId === preset.id
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#EAE4D7] text-[#1C1B18] hover:bg-[#FAF7F0]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {activePresetId !== 'custom' && (
            <p className="text-[11px] font-mono text-[#434038]">
              {BPLUS_PRESETS.find((p) => p.id === activePresetId)?.note}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="text-xs font-bold text-[#1C1B18]">Tree Order (p = max child pointers)</div>
          <div className="flex items-center gap-2">
            {([3, 4] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setOrder(p);
                  setActiveStepIdx('final');
                  setActivePresetId('custom');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                  order === p
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                }`}
              >
                Order p = {p} (max {p - 1} keys)
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form onSubmit={handleAddKey} className="space-y-1.5">
            <label htmlFor="bplus-insert" className="block text-xs font-bold text-[#1C1B18]">
              Insert Key
            </label>
            <div className="flex gap-1.5">
              <input
                id="bplus-insert"
                type="number"
                value={newKeyInput}
                onChange={(e) => setNewKeyInput(e.target.value)}
                placeholder="e.g. 18"
                className="w-full min-w-0 h-10 px-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] focus:outline-none focus:bg-[#FAF7F0]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 h-10 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] whitespace-nowrap shrink-0 step-hinge"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Insert</span>
              </button>
            </div>
          </form>

          <form onSubmit={handleDeleteKey} className="space-y-1.5">
            <label htmlFor="bplus-delete" className="block text-xs font-bold text-[#1C1B18]">
              Delete Key
            </label>
            <div className="flex gap-1.5">
              <input
                id="bplus-delete"
                type="number"
                value={deleteKeyInput}
                onChange={(e) => setDeleteKeyInput(e.target.value)}
                placeholder="e.g. 20"
                className="w-full min-w-0 h-10 px-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] focus:outline-none focus:bg-[#FAF7F0]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 h-10 text-xs font-bold text-[#FAF7F0] bg-[#A62B2B] hover:bg-[#8d2424] border border-[#1C1B18] rounded-[4px] whitespace-nowrap shrink-0 step-hinge"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bplus-search" className="block text-xs font-bold text-[#1C1B18]">
            Trace Key Lookup
          </label>
          <input
            id="bplus-search"
            type="number"
            value={searchKeyInput}
            onChange={(e) => setSearchKeyInput(e.target.value)}
            className="w-full h-10 px-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] focus:outline-none focus:bg-[#FAF7F0]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1C1B18]">Operation Timeline (click to replay)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleApplyPreset(BPLUS_PRESETS[0])}
                className="inline-flex items-center gap-1 font-bold text-[#434038] hover:text-[#1C1B18]"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOps([]);
                  setActiveStepIdx('final');
                  setActivePresetId('custom');
                }}
                className="font-bold text-[#A62B2B] hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3 flex flex-wrap gap-1.5">
            {ops.length === 0 ? (
              <span className="text-xs font-mono text-[#6E695D]">
                Empty tree — insert keys or pick a FAT preset above.
              </span>
            ) : (
              ops.map((op, idx) => {
                const isSelected = idx === resolvedStepIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStepIdx(idx)}
                    className={`px-2 py-0.5 font-mono text-xs font-bold rounded-[2px] border border-[#1C1B18] step-hinge tabular-nums ${
                      isSelected
                        ? 'bg-[#E5B82E] text-[#1C1B18] ring-1 ring-[#1C1B18]'
                        : op.type === 'delete'
                        ? 'bg-[#FAF7F0] text-[#A62B2B] hover:bg-[#EAE4D7]'
                        : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    {op.type === 'insert' ? `+${op.key}` : `-${op.key}`}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Lab 4: CAP Theorem & Distributed NoSQL Explorer
// ============================================================================

const NOSQL_MODELS = [
  {
    id: 'kv',
    name: 'Key-Value Store',
    examples: 'Redis · Amazon DynamoDB',
    capBias: 'AP (Tunable)',
    model: 'Opaque value stored against a hashed primary key.',
    bestFor: 'Session stores, shopping carts, rate limiters, ultra-low latency lookups.',
    sampleQuery: 'GET user:1042:cart  |  SET user:1042:cart "{items:[...]}" EX 3600',
  },
  {
    id: 'doc',
    name: 'Document Database',
    examples: 'MongoDB · Couchbase',
    capBias: 'CP (Primary-Replica)',
    model: 'Self-describing JSON/BSON aggregate documents grouped in collections.',
    bestFor: 'Product catalogs, CMS, user profiles with nested arrays without rigid joins.',
    sampleQuery: 'db.orders.find({ status: "SHIPPED", "total": { $gt: 1500 } })',
  },
  {
    id: 'col',
    name: 'Column-Family (Wide-Column)',
    examples: 'Apache Cassandra · HBase',
    capBias: 'AP (Cassandra) / CP (HBase)',
    model: 'Row key mapped to dynamic sparse column families sorted on disk (LSM + SSTables).',
    bestFor: 'Time-series telemetry, messaging logs, high write-throughput distributed clusters.',
    sampleQuery: "SELECT temp FROM sensor_readings WHERE device_id = 'VIT-04' AND ts > '2026-11-21'",
  },
  {
    id: 'graph',
    name: 'Graph Database',
    examples: 'Neo4j · Amazon Neptune',
    capBias: 'CP (ACID Traversals)',
    model: 'Property graph with labeled nodes, directed typed edges, and index-free adjacency.',
    bestFor: 'Fraud rings, social recommendations, supply-chain shortest path queries.',
    sampleQuery: 'MATCH (s:Student)-[:ENROLLED_IN]->(c:Course {code:"BACSE202"}) RETURN s.name',
  },
] as const;

const CapNoSqlLab: React.FC = () => {
  const [partitionActive, setPartitionActive] = useState(true);
  const [priority, setPriority] = useState<'C' | 'A'>('C');
  const [selectedFamily, setSelectedFamily] = useState<string>('kv');

  const activeNoSql = NOSQL_MODELS.find((m) => m.id === selectedFamily) ?? NOSQL_MODELS[0];

  const capOutcome = !partitionActive
    ? {
        badge: 'CA (No Partition)',
        summary: 'All nodes communicate freely. Both strict linearizable reads and 100% write availability hold.',
        systems: 'Single-node RDBMS (PostgreSQL / Oracle) or synchronous non-partitioned cluster',
      }
    : priority === 'C'
    ? {
        badge: 'CP (Consistency Chosen)',
        summary: 'Minority partition rejects writes/reads to prevent stale data. Consistency preserved at the cost of availability.',
        systems: 'MongoDB (majority write concern), HBase, Zookeeper, Google Spanner',
      }
    : {
        badge: 'AP (Availability Chosen)',
        summary: 'Both sides of the partition keep accepting reads and writes. Temporary divergence resolves via eventual consistency (BASE).',
        systems: 'Apache Cassandra, Amazon DynamoDB (default), Riak',
      };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 cols: CAP Simulator & Fragmentation Visual */}
      <div className="lg:col-span-7 space-y-5">
        <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#1C1B18]" data-testid="cap-outcome">
                Active Mode: {capOutcome.badge}
              </h2>
              <div className="text-xs font-mono text-[#6E695D]">Distributed CAP Theorem Simulator</div>
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-[4px] bg-[#EAE4D7] text-[#1C1B18] border border-[#1C1B18]">
              {partitionActive ? 'NETWORK PARTITIONED' : 'NETWORK HEALTHY'}
            </span>
          </div>

          {/* Visual 2-Node Cluster Diagram */}
          <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 text-center text-xs">
              <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-1">
                <div className="font-bold text-[#1C1B18]">Replica Node A (Majority)</div>
                <div className="font-mono text-[#434038]">balance = 500 → 700</div>
                <div className="font-bold text-[#4F8A3D]">ACCEPTS WRITES</div>
              </div>

              <div className="flex flex-col items-center justify-center gap-1 py-2">
                <div
                  className={`w-full border-t-2 border-dashed ${
                    partitionActive ? 'border-[#A62B2B]' : 'border-[#4F8A3D]'
                  }`}
                />
                <span className={`font-mono font-bold ${partitionActive ? 'text-[#A62B2B]' : 'text-[#4F8A3D]'}`}>
                  {partitionActive ? 'LINK BROKEN (P)' : 'SYNC OK'}
                </span>
              </div>

              <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-1">
                <div className="font-bold text-[#1C1B18]">Replica Node B (Minority)</div>
                <div className="font-mono text-[#434038]">
                  {partitionActive
                    ? priority === 'C'
                      ? 'balance = 500 (fenced / stale blocked)'
                      : 'balance = 500 (serves stale!)'
                    : 'balance = 700 (synced)'}
                </div>
                <div
                  className={`font-bold ${
                    partitionActive && priority === 'C' ? 'text-[#A62B2B]' : 'text-[#4F8A3D]'
                  }`}
                >
                  {partitionActive && priority === 'C'
                    ? 'REJECTS REQUESTS (503)'
                    : 'SERVES REQUESTS'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-[#434038]">
            <p className="prose-manual">{capOutcome.summary}</p>
            <p className="text-xs text-[#6E695D]">
              <strong className="text-[#1C1B18]">Representative Systems:</strong> {capOutcome.systems}
            </p>
          </div>
        </div>

        {/* Selected NoSQL Family Card (h3 FIRST — zero eyebrow above h3) */}
        <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 space-y-3">
          <div className="space-y-1 border-b border-[#1C1B18] pb-3">
            <h3 className="text-lg font-extrabold text-[#1C1B18]">{activeNoSql.name}</h3>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#6E695D]">
              <span>{activeNoSql.examples}</span>
              <span className="font-bold text-[#1C1B18]">Bias: {activeNoSql.capBias}</span>
            </div>
          </div>
          <p className="prose-manual">{activeNoSql.model}</p>
          <p className="text-xs text-[#434038]">
            <strong className="text-[#1C1B18]">Best Exam Use Case:</strong> {activeNoSql.bestFor}
          </p>
          <div className="font-mono text-xs bg-[#26231E] text-[#FAF7F0] border border-[#1C1B18] p-3 rounded-[4px] overflow-x-auto">
            {activeNoSql.sampleQuery}
          </div>
        </div>
      </div>

      {/* Right 5 cols: Controls */}
      <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 space-y-5">
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-[#1C1B18] border-b border-[#1C1B18] pb-2">
            CAP Partition Controls
          </h2>
          <label className="flex items-center justify-between p-3 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] cursor-pointer">
            <span className="text-xs font-bold text-[#1C1B18]">Simulate Network Partition (P)</span>
            <input
              type="checkbox"
              checked={partitionActive}
              onChange={(e) => setPartitionActive(e.target.checked)}
              className="w-4 h-4 rounded-[2px] border-[#1C1B18] accent-[#1C1B18]"
            />
          </label>

          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[#1C1B18]">Guarantee Priority During Partition</div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!partitionActive}
                onClick={() => setPriority('C')}
                className={`flex-1 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                  !partitionActive
                    ? 'opacity-50 cursor-not-allowed bg-[#EAE4D7] text-[#6E695D]'
                    : priority === 'C'
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                }`}
              >
                Consistency (CP)
              </button>
              <button
                type="button"
                disabled={!partitionActive}
                onClick={() => setPriority('A')}
                className={`flex-1 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                  !partitionActive
                    ? 'opacity-50 cursor-not-allowed bg-[#EAE4D7] text-[#6E695D]'
                    : priority === 'A'
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                }`}
              >
                Availability (AP)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#1C1B18] space-y-2.5">
          <div className="text-xs font-bold text-[#1C1B18]">Compare NoSQL Families</div>
          <div className="grid grid-cols-2 gap-2">
            {NOSQL_MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedFamily(m.id)}
                className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] text-left step-hinge ${
                  selectedFamily === m.id
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
