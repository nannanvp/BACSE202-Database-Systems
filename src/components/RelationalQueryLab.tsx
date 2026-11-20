import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SkipBack,
  SkipForward,
  XCircle,
} from 'lucide-react';
import {
  buildQueryTreeOptimizationStages,
  DEFAULT_DATASET,
  EnrollmentTuple,
  evaluateRAQuery,
  evaluateTRCQuery,
  QUERY_TREE_PRESETS,
  QueryTreeCatalog,
  QueryTreeNode,
  QueryTreePresetId,
  RAQueryId,
  toggleEnrollmentTuple,
  TRCQueryId,
} from '../utils/relationalEngine';

type SubLabTab = 'ra' | 'trc' | 'query_tree';

const RA_PRESETS: Array<{ id: RAQueryId; label: string; shortTag: string }> = [
  { id: 'division', label: 'Division (÷) — Enrolled in ALL', shortTag: 'FAT Classic' },
  { id: 'selection_projection', label: 'Selection & Projection (σ + π)', shortTag: 'Unary Ops' },
  { id: 'natural_join', label: '3-Way Natural Join (⋈)', shortTag: 'Model Q8' },
  { id: 'set_difference', label: 'Set Difference (−) — Unenrolled', shortTag: 'Anti-Join' },
  { id: 'max_cgpa_self_join', label: 'Max CGPA Self-Join (ρ + × + −)', shortTag: 'FAT Trick' },
  { id: 'high_credit_join', label: 'High-Credit Courses (A1 Q6)', shortTag: 'A1 Q6' },
];

const TRC_PRESETS: Array<{ id: TRCQueryId; label: string; tag: string }> = [
  { id: 'forall_all_dept_courses', label: 'Universal (∀) — ALL Dept Courses', tag: '≡ RA Division ÷' },
  { id: 'exists_s_grade', label: "Existential (∃) — Has 'S' Grade", tag: '≡ RA Join ⋈' },
  { id: 'not_exists_unenrolled', label: 'Negated (¬∃) — Zero Enrollments', tag: '≡ RA Diff −' },
  { id: 'forall_max_cgpa', label: 'Universal (∀) — Highest CGPA', tag: '≡ Self-Join Max' },
];

function formatCompactTuples(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function getNodeStyle(node: QueryTreeNode): { fill: string; stroke: string; text: string } {
  if (node.kind === 'cross') {
    return { fill: '#FDE8E8', stroke: '#A62B2B', text: '#A62B2B' };
  }
  if (node.kind === 'join') {
    return { fill: '#E3F2DF', stroke: '#4F8A3D', text: '#1C1B18' };
  }
  if (node.kind === 'sel') {
    return node.highlight
      ? { fill: '#FDF3D0', stroke: '#1C1B18', text: '#1C1B18' }
      : { fill: '#FAF7F0', stroke: '#1C1B18', text: '#1C1B18' };
  }
  if (node.kind === 'proj') {
    return node.highlight
      ? { fill: '#E3EFFC', stroke: '#22559C', text: '#1C1B18' }
      : { fill: '#FAF7F0', stroke: '#1C1B18', text: '#1C1B18' };
  }
  return { fill: '#EAE4D7', stroke: '#1C1B18', text: '#1C1B18' };
}

export const RelationalQueryLab: React.FC = () => {
  const [subTab, setSubTab] = useState<SubLabTab>('ra');

  // Shared live editable STUDENT/COURSE/ENROLLMENT state for RA & TRC
  const [enrollments, setEnrollments] = useState<EnrollmentTuple[]>(DEFAULT_DATASET.enrollments);
  const [raQueryId, setRaQueryId] = useState<RAQueryId>('division');
  const [deptFilter, setDeptFilter] = useState<'CSE' | 'ECE' | 'AI'>('CSE');
  const [minCgpa, setMinCgpa] = useState<number>(8.5);
  const [minCredits, setMinCredits] = useState<number>(4);

  const [trcQueryId, setTrcQueryId] = useState<TRCQueryId>('forall_all_dept_courses');

  // Heuristic Query-Tree Optimizer state
  const [treePreset, setTreePreset] = useState<QueryTreePresetId>('model_q8');
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [customCatalog, setCustomCatalog] = useState<QueryTreeCatalog>(
    QUERY_TREE_PRESETS.model_q8.catalog
  );

  const liveDataset = useMemo(
    () => ({
      students: DEFAULT_DATASET.students,
      courses: DEFAULT_DATASET.courses,
      enrollments,
    }),
    [enrollments]
  );

  const raResult = useMemo(
    () =>
      evaluateRAQuery(raQueryId, liveDataset, {
        dept: deptFilter,
        minCgpa,
        minCredits,
      }),
    [raQueryId, liveDataset, deptFilter, minCgpa, minCredits]
  );

  const trcResult = useMemo(
    () => evaluateTRCQuery(trcQueryId, liveDataset, deptFilter),
    [trcQueryId, liveDataset, deptFilter]
  );

  const treeStages = useMemo(
    () => buildQueryTreeOptimizationStages(treePreset, customCatalog),
    [treePreset, customCatalog]
  );

  const currentStage = treeStages[stageIdx] ?? treeStages[0];
  const stage1 = treeStages[0];

  const handleToggleEnrollment = (sid: string, cid: string) => {
    setEnrollments((prev) => toggleEnrollmentTuple(prev, sid, cid, 'A'));
  };

  const handleResetDataset = () => {
    setEnrollments(DEFAULT_DATASET.enrollments);
    setDeptFilter('CSE');
    setMinCgpa(8.5);
    setMinCredits(4);
  };

  const handleSelectTreePreset = (presetId: QueryTreePresetId) => {
    setTreePreset(presetId);
    setCustomCatalog(QUERY_TREE_PRESETS[presetId].catalog);
    setStageIdx(0);
  };

  const enrollmentLookup = useMemo(() => {
    const map = new Map<string, EnrollmentTuple['grade']>();
    for (const e of enrollments) {
      map.set(`${e.sid}|${e.cid}`, e.grade);
    }
    return map;
  }, [enrollments]);

  return (
    <div className="space-y-6" data-testid="ra-trc-tree-lab">
      {/* Header & Sub-Lab Switcher */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden">
        <div className="px-5 py-4 bg-[#EAE4D7] border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#1C1B18]">
              Relational Algebra, TRC &amp; Heuristic Query-Tree Sandbox
            </h2>
            <p className="text-xs font-mono text-[#434038]">
              MODULE 3B · LIVE σ/π/⋈/÷ EVALUATOR, QUANTIFIER WITNESS VERIFIER &amp; 5-STAGE QUERY OPTIMIZER (A1 Q6 · MODEL Q8)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ra', label: 'Relational Algebra (σ, π, ⋈, ÷)' },
                { id: 'trc', label: 'TRC Quantifier Verifier (∃ / ∀)' },
                { id: 'query_tree', label: 'Heuristic Query-Tree Optimizer' },
              ] as Array<{ id: SubLabTab; label: string }>
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
                  subTab === t.id
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#F4EFE4]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shared Interactive Enrollment Matrix for RA & TRC */}
        {(subTab === 'ra' || subTab === 'trc') && (
          <div className="p-5 border-b border-[#1C1B18] bg-[#F4EFE4] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1B18]">
                  Live Editable Database: Click Cells to Toggle ENROLLMENT(Sid, Cid)
                </h3>
                <p className="text-xs text-[#434038]">
                  5 Students · 5 Courses · {enrollments.length} Active Enrollments — toggling any cell recomputes RA Division (÷) &amp; TRC (∀/∃) live.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className="text-[#434038] font-bold">Target Dept:</span>
                  {(['CSE', 'AI', 'ECE'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDeptFilter(d)}
                      aria-pressed={deptFilter === d}
                      className={`px-2 py-1 text-[11px] font-bold rounded-[3px] border border-[#1C1B18] step-hinge ${
                        deptFilter === d
                          ? 'bg-[#1C1B18] text-[#FAF7F0]'
                          : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleResetDataset}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[3px] step-hinge"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  Reset Data
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#1C1B18] rounded-[4px] bg-[#FAF7F0]">
              <table className="w-full text-xs font-mono border-collapse min-w-[540px]">
                <thead>
                  <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-left">
                    <th className="px-3 py-2 font-extrabold text-[#1C1B18] border-r border-[#1C1B18]">
                      STUDENT (Sid · Name · Dept · CGPA)
                    </th>
                    {liveDataset.courses.map((c) => {
                      const isTargetDept = c.dept === deptFilter;
                      return (
                        <th
                          key={c.cid}
                          className={`px-2.5 py-2 text-center border-r last:border-r-0 border-[#C5BEB0] ${
                            isTargetDept ? 'bg-[#E5B82E]/30' : ''
                          }`}
                        >
                          <div className="font-extrabold text-[#1C1B18]">{c.cid}</div>
                          <div className="text-[10px] text-[#434038]">
                            {c.cname} · {c.dept} · {c.credits}cr
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5BEB0]">
                  {liveDataset.students.map((st) => (
                    <tr key={st.sid} className="hover:bg-[#F4EFE4]/60">
                      <td className="px-3 py-2 border-r border-[#1C1B18] whitespace-nowrap">
                        <span className="font-extrabold text-[#1C1B18]">{st.sid}</span>{' '}
                        <span className="text-[#434038]">{st.sname}</span>{' '}
                        <span className="text-[10px] text-[#6E695D]">
                          ({st.dept}, {st.cgpa.toFixed(1)})
                        </span>
                      </td>
                      {liveDataset.courses.map((c) => {
                        const grade = enrollmentLookup.get(`${st.sid}|${c.cid}`);
                        const enrolled = Boolean(grade);
                        return (
                          <td
                            key={c.cid}
                            className="px-2 py-1.5 text-center border-r last:border-r-0 border-[#C5BEB0]"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleEnrollment(st.sid, c.cid)}
                              aria-pressed={enrolled}
                              aria-label={`Toggle enrollment for ${st.sid} ${st.sname} in ${c.cid}`}
                              data-testid={`enroll-${st.sid}-${c.cid}`}
                              className={`w-full py-1 px-2 text-[11px] font-bold rounded-[3px] border step-hinge ${
                                enrolled
                                  ? 'bg-[#4F8A3D] text-[#FAF7F0] border-[#1C1B18]'
                                  : 'bg-[#FAF7F0] text-[#6E695D] border-[#C5BEB0] hover:border-[#1C1B18]'
                              }`}
                            >
                              {enrolled ? `✓ (${grade})` : '—'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SUB-TAB 1: RELATIONAL ALGEBRA EVALUATOR                          */}
        {/* ================================================================ */}
        {subTab === 'ra' && (
          <div className="p-5 sm:p-6 space-y-5" data-testid="ra-panel">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              {RA_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setRaQueryId(preset.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                    raQueryId === preset.id
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'bg-[#EAE4D7] text-[#1C1B18] hover:bg-[#ded6c6]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Optional Parameter Controls */}
            {raQueryId === 'selection_projection' && (
              <div className="flex flex-wrap items-center gap-4 p-3.5 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-xs font-mono">
                <label htmlFor="ra-min-cgpa" className="font-bold text-[#1C1B18]">
                  Min CGPA Threshold: <span className="text-[#4F8A3D]">{minCgpa.toFixed(1)}</span>
                </label>
                <input
                  id="ra-min-cgpa"
                  type="range"
                  min={7.0}
                  max={9.5}
                  step={0.1}
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(Number(e.target.value))}
                  className="w-44 accent-[#1C1B18]"
                />
              </div>
            )}

            {raQueryId === 'high_credit_join' && (
              <div className="flex flex-wrap items-center gap-4 p-3.5 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-xs font-mono">
                <span className="font-bold text-[#1C1B18]">Min Course Credits:</span>
                {[3, 4].map((cr) => (
                  <button
                    key={cr}
                    type="button"
                    onClick={() => setMinCredits(cr)}
                    className={`px-2.5 py-1 rounded-[3px] border border-[#1C1B18] font-bold ${
                      minCredits === cr ? 'bg-[#E5B82E] text-[#1C1B18]' : 'bg-[#FAF7F0] text-[#1C1B18]'
                    }`}
                  >
                    &gt;= {cr} Credits
                  </button>
                ))}
              </div>
            )}

            {/* Formal RA Expression + SQL Equivalent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="font-bold uppercase tracking-wider text-[#434038]">
                    Relational Algebra Expression
                  </span>
                  <span className="px-2 py-0.5 bg-[#4F8A3D] text-[#FAF7F0] rounded-[2px] font-bold">
                    {raResult.examTag}
                  </span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-extrabold text-[#1C1B18] break-words leading-relaxed">
                  {raResult.raFormula}
                </div>
              </div>

              <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-1.5">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#434038]">
                  Equivalent SQL Query
                </div>
                <div className="font-mono text-xs text-[#1C1B18] break-words leading-relaxed">
                  {raResult.sqlEquivalent}
                </div>
              </div>
            </div>

            {/* Division 3-Step Proof Card */}
            {raResult.divisionProof && (
              <div
                data-testid="division-proof-card"
                className="bg-[#FAF7F0] border-2 border-[#4F8A3D] rounded-[4px] p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C5BEB0] pb-2">
                  <h3 className="text-sm font-extrabold text-[#1C1B18]">
                    Relational Division (R ÷ S) 3-Step Primitive Expansion Proof
                  </h3>
                  <span className="font-mono text-xs font-bold text-[#4F8A3D]">
                    Divisor S = {`{${raResult.divisionProof.divisorCourses.join(', ')}}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3 space-y-1">
                    <div className="font-bold text-[#1C1B18]">1. T1 = π_Sid(R)</div>
                    <div className="text-[#434038]">All candidate students:</div>
                    <div className="font-extrabold text-[#1C1B18]">
                      {`{ ${raResult.divisionProof.t1Candidates.join(', ') || '∅'} }`}
                    </div>
                  </div>
                  <div className="bg-[#A62B2B]/10 border border-[#A62B2B] rounded-[4px] p-3 space-y-1">
                    <div className="font-bold text-[#A62B2B]">2. T2 = π_Sid((T1 × S) − R)</div>
                    <div className="text-[#434038]">Disqualified (missing &gt;= 1 course):</div>
                    {raResult.divisionProof.t2Disqualified.length === 0 ? (
                      <div className="font-bold text-[#4F8A3D]">None disqualified</div>
                    ) : (
                      <ul className="space-y-0.5 text-[#1C1B18]">
                        {raResult.divisionProof.t2Disqualified.map((d) => (
                          <li key={d.sid}>
                            <strong>{d.sid}</strong> ({d.sname}): missing {d.missingCourses.join(', ')}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="bg-[#4F8A3D]/15 border border-[#4F8A3D] rounded-[4px] p-3 space-y-1">
                    <div className="font-bold text-[#4F8A3D]">3. Result = T1 − T2</div>
                    <div className="text-[#434038]">Enrolled in ALL {deptFilter} courses:</div>
                    <div
                      className="text-sm font-extrabold text-[#1C1B18]"
                      data-testid="division-final-sids"
                    >
                      {`{ ${raResult.divisionProof.finalSids.join(', ') || '∅'} }`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Output Table + Step Trace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#1C1B18]">
                    Query Output Relation
                  </h3>
                  <span
                    data-testid="ra-result-count"
                    className="px-2 py-0.5 text-xs font-mono font-bold bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] rounded-[2px]"
                  >
                    {raResult.rows.length} {raResult.rows.length === 1 ? 'Tuple' : 'Tuples'}
                  </span>
                </div>
                <div className="overflow-x-auto border border-[#1C1B18] rounded-[4px] bg-[#FAF7F0]">
                  <table className="w-full text-xs font-mono border-collapse">
                    <thead>
                      <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-left">
                        {raResult.columns.map((col) => (
                          <th key={col} className="px-3 py-2 font-extrabold text-[#1C1B18]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5BEB0]">
                      {raResult.rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={raResult.columns.length}
                            className="px-3 py-4 text-center text-[#6E695D]"
                          >
                            Empty set (∅) — zero tuples satisfy this relational algebra query.
                          </td>
                        </tr>
                      ) : (
                        raResult.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#F4EFE4]">
                            {raResult.columns.map((col) => (
                              <td key={col} className="px-3 py-2 text-[#1C1B18] font-semibold">
                                {String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-2">
                <h3 className="text-sm font-extrabold text-[#1C1B18]">
                  Step-by-Step Evaluation Trace
                </h3>
                <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] divide-y divide-[#C5BEB0] text-xs font-mono">
                  {raResult.steps.map((st) => (
                    <div key={st.stepNo} className="p-3 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-extrabold text-[#1C1B18]">
                          Step {st.stepNo}: {st.opName}
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[2px] text-[11px] font-bold">
                          {st.tupleCount} {st.tupleCount === 1 ? 'row' : 'rows'}
                        </span>
                      </div>
                      <div className="text-[#22559C] font-semibold break-words">{st.formula}</div>
                      <div className="text-[#434038]">{st.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SUB-TAB 2: TRC QUANTIFIER (∃ / ∀) VERIFIER                       */}
        {/* ================================================================ */}
        {subTab === 'trc' && (
          <div className="p-5 sm:p-6 space-y-5" data-testid="trc-panel">
            <div className="flex flex-wrap gap-2">
              {TRC_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setTrcQueryId(preset.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                    trcQueryId === preset.id
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'bg-[#EAE4D7] text-[#1C1B18] hover:bg-[#ded6c6]'
                  }`}
                >
                  {preset.label}{' '}
                  <span className="font-mono text-[10px] opacity-80">({preset.tag})</span>
                </button>
              ))}
            </div>

            <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#434038]">
                  Tuple Relational Calculus Expression ({trcResult.quantifierTag})
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#4F8A3D] text-[#FAF7F0] border border-[#1C1B18] rounded-[2px]">
                  DOMAIN SAFETY: {trcResult.safetyStatus}
                </span>
              </div>
              <div className="font-mono text-xs sm:text-sm font-extrabold text-[#1C1B18] break-words leading-relaxed">
                {trcResult.trcFormula}
              </div>
              <div className="pt-2 border-t border-[#C5BEB0] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-mono font-bold text-[#434038]">Equivalent RA: </span>
                  <span className="font-mono font-semibold text-[#22559C]">{trcResult.equivalentRA}</span>
                </div>
                <div className="text-[#434038]">
                  <strong className="text-[#1C1B18]">Why Safe: </strong>
                  {trcResult.safetyReason}
                </div>
              </div>
            </div>

            {/* Tuple-by-Tuple Witness Table */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-[#1C1B18]">
                  Tuple-by-Tuple Quantifier Evaluation &amp; Witness / Counterexample Proof
                </h3>
                <span
                  data-testid="trc-passing-count"
                  className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] rounded-[2px]"
                >
                  {trcResult.passingCount} / {trcResult.witnesses.length} Satisfy Formula
                </span>
              </div>

              <div className="overflow-x-auto border border-[#1C1B18] rounded-[4px] bg-[#FAF7F0]">
                <table className="w-full text-xs font-mono border-collapse min-w-[540px]">
                  <thead>
                    <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-left">
                      <th className="px-3 py-2 font-extrabold text-[#1C1B18]">Tuple s</th>
                      <th className="px-3 py-2 font-extrabold text-[#1C1B18]">Verdict</th>
                      <th className="px-3 py-2 font-extrabold text-[#1C1B18]">
                        Quantifier Witness / Counterexample Proof
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C5BEB0]">
                    {trcResult.witnesses.map((w) => (
                      <tr
                        key={w.sid}
                        className={w.satisfies ? 'bg-[#4F8A3D]/10' : 'bg-[#FAF7F0]'}
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap font-bold text-[#1C1B18]">
                          {w.sid} · {w.sname}{' '}
                          <span className="text-[#6E695D] font-normal">
                            ({w.dept}, {w.cgpa.toFixed(1)})
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {w.satisfies ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#4F8A3D] text-[#FAF7F0] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              TRUE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#EAE4D7] text-[#A62B2B] border border-[#A62B2B] font-bold">
                              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                              FALSE
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-[#1C1B18]">{w.witnessDetail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SUB-TAB 3: HEURISTIC QUERY-TREE PUSHDOWN OPTIMIZER               */}
        {/* ================================================================ */}
        {subTab === 'query_tree' && (
          <div className="p-5 sm:p-6 space-y-5" data-testid="query-tree-panel">
            {/* Preset Selector & Stepper Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {(['model_q8', 'a1_q6_elmasri'] as QueryTreePresetId[]).map((pid) => {
                  const preset = QUERY_TREE_PRESETS[pid];
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => handleSelectTreePreset(pid)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                        treePreset === pid
                          ? 'bg-[#1C1B18] text-[#FAF7F0]'
                          : 'bg-[#EAE4D7] text-[#1C1B18] hover:bg-[#ded6c6]'
                      }`}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStageIdx(0)}
                  disabled={stageIdx === 0}
                  aria-label="Jump to Stage 1 Canonical Tree"
                  className="p-1.5 rounded-[4px] border border-[#1C1B18] bg-[#FAF7F0] disabled:opacity-40 hover:bg-[#EAE4D7]"
                >
                  <SkipBack className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setStageIdx((i) => Math.max(0, i - 1))}
                  disabled={stageIdx === 0}
                  aria-label="Previous optimization stage"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#FAF7F0] disabled:opacity-40 hover:bg-[#EAE4D7]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  Prev
                </button>
                <span
                  data-testid="query-tree-stage-badge"
                  className="px-2.5 py-1.5 text-xs font-mono font-bold bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] rounded-[4px] whitespace-nowrap shrink-0"
                >
                  Stage {currentStage.stageNo} / 5
                </span>
                <button
                  type="button"
                  onClick={() => setStageIdx((i) => Math.min(treeStages.length - 1, i + 1))}
                  disabled={stageIdx === treeStages.length - 1}
                  aria-label="Next optimization stage"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#FAF7F0] disabled:opacity-40 hover:bg-[#EAE4D7]"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setStageIdx(treeStages.length - 1)}
                  disabled={stageIdx === treeStages.length - 1}
                  aria-label="Jump to Stage 5 Fully Optimized Tree"
                  className="p-1.5 rounded-[4px] border border-[#1C1B18] bg-[#FAF7F0] disabled:opacity-40 hover:bg-[#EAE4D7]"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Stage Selector Pills (1..5) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {treeStages.map((st, idx) => (
                <button
                  key={st.stageNo}
                  type="button"
                  onClick={() => setStageIdx(idx)}
                  className={`p-2 text-left rounded-[4px] border border-[#1C1B18] step-hinge ${
                    idx === stageIdx
                      ? 'bg-[#E5B82E] text-[#1C1B18]'
                      : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                  }`}
                >
                  <div className="font-mono text-[10px] font-bold uppercase">
                    Stage {st.stageNo}
                  </div>
                  <div className="text-[11px] font-extrabold leading-tight line-clamp-2 mt-0.5">
                    {st.title}
                  </div>
                </button>
              ))}
            </div>

            {/* SQL Banner + Cost Reduction Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-1.5">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#434038]">
                  SQL Query Being Optimized · {QUERY_TREE_PRESETS[treePreset].examTag}
                </div>
                <div className="font-mono text-xs text-[#1C1B18] leading-relaxed">
                  {QUERY_TREE_PRESETS[treePreset].sql}
                </div>
                <div className="pt-2 border-t border-[#C5BEB0] text-xs">
                  <span className="font-mono font-bold text-[#22559C]">{currentStage.ruleApplied}</span>
                  <p className="text-[#434038] mt-1">{currentStage.explanation}</p>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-3.5 flex flex-col justify-between">
                  <div className="text-[10px] font-mono uppercase text-[#6E695D]">
                    Intermediate Tuples
                  </div>
                  <div
                    data-testid="query-tree-tuples"
                    className={`text-xl sm:text-2xl font-mono font-extrabold tabular-nums mt-1 ${
                      currentStage.stageNo >= 4 ? 'text-[#4F8A3D]' : 'text-[#A62B2B]'
                    }`}
                  >
                    {formatCompactTuples(currentStage.totalIntermediateTuples)}
                  </div>
                  <div className="text-[11px] font-mono text-[#434038] mt-1">
                    vs Stage 1: {formatCompactTuples(stage1.totalIntermediateTuples)}
                  </div>
                </div>

                <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-3.5 flex flex-col justify-between">
                  <div className="text-[10px] font-mono uppercase text-[#6E695D]">
                    Intermediate Volume
                  </div>
                  <div
                    data-testid="query-tree-kb"
                    className="text-xl sm:text-2xl font-mono font-extrabold tabular-nums text-[#1C1B18] mt-1"
                  >
                    {currentStage.totalIntermediateKB >= 1024
                      ? `${(currentStage.totalIntermediateKB / 1024).toFixed(1)} MB`
                      : `${currentStage.totalIntermediateKB.toLocaleString()} KB`}
                  </div>
                  <div
                    data-testid="query-tree-reduction"
                    className={`text-[11px] font-mono font-bold mt-1 ${
                      currentStage.reductionVsStage1Pct > 90 ? 'text-[#4F8A3D]' : 'text-[#434038]'
                    }`}
                  >
                    {currentStage.reductionVsStage1Pct > 0
                      ? `-${currentStage.reductionVsStage1Pct}% tuple cost`
                      : 'Unoptimized baseline'}
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Query Tree Canvas */}
            <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 overflow-x-auto">
              <svg
                viewBox="0 0 760 340"
                className="w-full min-w-[600px] max-w-[880px] mx-auto h-auto"
                role="img"
                aria-label={`Query Tree Stage ${currentStage.stageNo}: ${currentStage.title}`}
              >
                {/* Edges */}
                {currentStage.edges.map((edge, idx) => {
                  const fromNode = currentStage.nodes.find((n) => n.id === edge.from);
                  const toNode = currentStage.nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  const midX = (fromNode.x + toNode.x) / 2;
                  const midY = (fromNode.y + toNode.y) / 2;
                  return (
                    <g key={idx}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y + 18}
                        x2={toNode.x}
                        y2={toNode.y - 18}
                        stroke="#1C1B18"
                        strokeWidth={1.5}
                      />
                      <rect
                        x={midX - 28}
                        y={midY - 8}
                        width={56}
                        height={15}
                        rx={2}
                        fill="#FAF7F0"
                        stroke="#C5BEB0"
                        strokeWidth={1}
                      />
                      <text
                        x={midX}
                        y={midY + 3}
                        textAnchor="middle"
                        fontSize={9}
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill={edge.edgeTuples > 100_000 ? '#A62B2B' : '#4F8A3D'}
                      >
                        {formatCompactTuples(edge.edgeTuples)}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {currentStage.nodes.map((node) => {
                  const st = getNodeStyle(node);
                  const boxW = Math.max(118, Math.min(230, node.label.length * 6.5 + 22));
                  const boxH = 34;
                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                      <rect
                        x={-boxW / 2}
                        y={-boxH / 2}
                        width={boxW}
                        height={boxH}
                        rx={4}
                        fill={st.fill}
                        stroke={st.stroke}
                        strokeWidth={node.highlight ? 2.2 : 1.3}
                      />
                      <text
                        x={0}
                        y={-2}
                        textAnchor="middle"
                        fontSize={10}
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill={st.text}
                      >
                        {node.label}
                      </text>
                      <text
                        x={0}
                        y={11}
                        textAnchor="middle"
                        fontSize={8.5}
                        fontFamily="monospace"
                        fill="#434038"
                      >
                        {formatCompactTuples(node.tuples)} rows · {node.rowBytes}B/row
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Catalog Cardinality Sliders */}
            <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1B18]">
                Adjust Catalog Table Sizes &amp; Predicate Selectivity (Live Cost Recalculation)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <label className="space-y-1 block">
                  <span className="flex justify-between font-bold text-[#1C1B18]">
                    <span>|{QUERY_TREE_PRESETS[treePreset].relA}|</span>
                    <span>{customCatalog.studentTuples.toLocaleString()}</span>
                  </span>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={500}
                    value={customCatalog.studentTuples}
                    onChange={(e) =>
                      setCustomCatalog((c) => ({ ...c, studentTuples: Number(e.target.value) }))
                    }
                    className="w-full accent-[#1C1B18]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="flex justify-between font-bold text-[#1C1B18]">
                    <span>|{QUERY_TREE_PRESETS[treePreset].relB}|</span>
                    <span>{customCatalog.enrollmentTuples.toLocaleString()}</span>
                  </span>
                  <input
                    type="range"
                    min={1000}
                    max={50000}
                    step={1000}
                    value={customCatalog.enrollmentTuples}
                    onChange={(e) =>
                      setCustomCatalog((c) => ({ ...c, enrollmentTuples: Number(e.target.value) }))
                    }
                    className="w-full accent-[#1C1B18]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="flex justify-between font-bold text-[#1C1B18]">
                    <span>Selectivity ({QUERY_TREE_PRESETS[treePreset].predC})</span>
                    <span>{Math.round(customCatalog.deptSelectivity * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={Math.round(customCatalog.deptSelectivity * 100)}
                    onChange={(e) =>
                      setCustomCatalog((c) => ({
                        ...c,
                        deptSelectivity: Number(e.target.value) / 100,
                      }))
                    }
                    className="w-full accent-[#1C1B18]"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
