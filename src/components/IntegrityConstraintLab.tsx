import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Play,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import {
  cloneIntegrityDb,
  compareReferentialActions,
  evaluateIntegrityOperation,
  INITIAL_INTEGRITY_DB,
  INTEGRITY_PRESETS,
  IntegrityDbState,
  IntegrityOperation,
  ReferentialAction,
} from '../utils/integrityEngine';

const REFERENTIAL_ACTIONS: Array<{ id: ReferentialAction; label: string }> = [
  { id: 'RESTRICT', label: 'RESTRICT' },
  { id: 'CASCADE', label: 'CASCADE' },
  { id: 'SET_NULL', label: 'SET NULL' },
  { id: 'SET_DEFAULT', label: 'SET DEFAULT (99)' },
];

interface HistoryEntry {
  id: number;
  sql: string;
  accepted: boolean;
  verdict: string;
}

export const IntegrityConstraintLab: React.FC = () => {
  const [db, setDb] = useState<IntegrityDbState>(() => cloneIntegrityDb(INITIAL_INTEGRITY_DB));
  const [activePresetId, setActivePresetId] = useState<string>(INTEGRITY_PRESETS[5].id);
  const [op, setOp] = useState<IntegrityOperation>(INTEGRITY_PRESETS[5].op);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const evaluation = useMemo(() => evaluateIntegrityOperation(db, op), [db, op]);

  const policyComparison = useMemo(() => {
    if (op.kind === 'DELETE_DEPT' || op.kind === 'UPDATE_DEPT_PK') {
      return compareReferentialActions(db, op);
    }
    return null;
  }, [db, op]);

  const handleSelectPreset = (presetId: string) => {
    const preset = INTEGRITY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    // If preset targets a parent row that was previously deleted in the sandbox, restore fresh baseline
    const presetOp = preset.op;
    if (
      (presetOp.kind === 'DELETE_DEPT' &&
        !db.departments.some((d) => d.dno === presetOp.dno)) ||
      (presetOp.kind === 'UPDATE_DEPT_PK' &&
        !db.departments.some((d) => d.dno === presetOp.oldDno))
    ) {
      setDb(cloneIntegrityDb(INITIAL_INTEGRITY_DB));
    }
    setOp({ ...presetOp });
  };

  const handleSwitchOpKind = (kind: IntegrityOperation['kind']) => {
    setActivePresetId('custom');
    if (kind === 'INSERT_EMP') {
      setOp({ kind: 'INSERT_EMP', empId: 106, name: 'Kavya', salary: 78000, dno: 10 });
    } else if (kind === 'DELETE_DEPT') {
      setOp({ kind: 'DELETE_DEPT', dno: db.departments[0]?.dno ?? 10, action: 'RESTRICT' });
    } else if (kind === 'UPDATE_DEPT_PK') {
      setOp({
        kind: 'UPDATE_DEPT_PK',
        oldDno: db.departments[0]?.dno ?? 10,
        newDno: 25,
        action: 'CASCADE',
      });
    } else {
      setOp({ kind: 'UPDATE_EMP_FK', empId: db.employees[0]?.empId ?? 101, newDno: 20 });
    }
  };

  const handleApplyToLiveDb = () => {
    setHistory((prev) => [
      {
        id: prev.length + 1,
        sql: evaluation.sqlPreview,
        accepted: evaluation.accepted,
        verdict: evaluation.verdictLabel,
      },
      ...prev.slice(0, 7),
    ]);
    if (evaluation.accepted) {
      const updatedDb = evaluation.nextDb;
      setDb(updatedDb);
      // Keep controlled <select> in sync with remaining rows after DELETE or PK UPDATE
      if (op.kind === 'DELETE_DEPT') {
        const nextDept = updatedDb.departments[0];
        if (nextDept) {
          setOp({ ...op, dno: nextDept.dno });
        }
      } else if (op.kind === 'UPDATE_DEPT_PK') {
        const nextDept = updatedDb.departments.find((d) => d.dno === op.newDno) ?? updatedDb.departments[0];
        if (nextDept) {
          setOp({ ...op, oldDno: nextDept.dno });
        }
      }
    }
  };

  const handleResetDb = () => {
    setDb(cloneIntegrityDb(INITIAL_INTEGRITY_DB));
    setHistory([]);
  };

  const highlightedEmpSet = useMemo(
    () => new Set(evaluation.affectedEmpIds),
    [evaluation.affectedEmpIds]
  );

  const highlightedDeptNo =
    op.kind === 'DELETE_DEPT'
      ? op.dno
      : op.kind === 'UPDATE_DEPT_PK'
      ? op.oldDno
      : op.kind === 'INSERT_EMP'
      ? op.dno
      : op.newDno;

  return (
    <div data-testid="integrity-lab" className="space-y-5">
      {/* Header */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18] tracking-tight">
            Module 1 · Integrity Constraint Violation &amp; Referential Action Tracer
          </h2>
          <p className="text-xs font-mono text-[#6E695D] mt-0.5">
            A1 Q2 · A2 Q2 — DOMAIN, KEY, ENTITY (NULL PK), REFERENTIAL INTEGRITY &amp; RESTRICT / CASCADE / SET NULL / SET DEFAULT
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="px-2.5 py-1 rounded-[4px] bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] font-mono text-[11px] font-bold whitespace-nowrap">
            M1 · INTEGRITY &amp; FK
          </span>
          <button
            type="button"
            onClick={handleResetDb}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] text-[#1C1B18] whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset Live DB
          </button>
        </div>
      </div>

      {/* 8 FAT Exam Presets */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
        <h3 className="text-sm font-extrabold text-[#1C1B18]">
          FAT Exam Presets (A1+TA1 Q2 &amp; A2+TA2 Q2 Scenarios)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {INTEGRITY_PRESETS.map((preset) => {
            const active = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-2.5 rounded-[4px] border border-[#1C1B18] text-left step-hinge ${
                  active
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                }`}
              >
                <div className="text-xs font-bold leading-snug">{preset.name}</div>
                <div className="text-[10px] font-mono text-[#434038] mt-1">{preset.examTag}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split: Operation Builder (Left) + Live Verdict & 4 Constraint Checks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Operation Builder */}
        <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-[#1C1B18]">Operation Type</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { kind: 'INSERT_EMP', label: 'INSERT Employee' },
                  { kind: 'DELETE_DEPT', label: 'DELETE Department' },
                  { kind: 'UPDATE_DEPT_PK', label: 'UPDATE Dept PK' },
                  { kind: 'UPDATE_EMP_FK', label: 'UPDATE Emp FK' },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.kind}
                  type="button"
                  onClick={() => handleSwitchOpKind(btn.kind)}
                  className={`px-2.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                    op.kind === btn.kind
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Operation-Specific Inputs */}
          {op.kind === 'INSERT_EMP' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-[#1C1B18] block">
                  EmpID [PK] (blank = NULL)
                </span>
                <input
                  type="text"
                  value={op.empId === null ? '' : String(op.empId)}
                  placeholder="NULL"
                  onChange={(e) => {
                    setActivePresetId('custom');
                    const raw = e.target.value.trim();
                    setOp({
                      ...op,
                      empId: raw === '' ? null : Number(raw),
                    });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px]"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-[#1C1B18] block">Name</span>
                <input
                  type="text"
                  value={op.name}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setOp({ ...op, name: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px]"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-[#1C1B18] block">
                  Salary (CHECK &gt; 0)
                </span>
                <input
                  type="number"
                  value={typeof op.salary === 'number' ? op.salary : Number(op.salary) || 0}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setOp({ ...op, salary: Number(e.target.value) });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px]"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-[#1C1B18] block">
                  Dno [FK] (blank = NULL)
                </span>
                <input
                  type="text"
                  value={op.dno === null ? '' : String(op.dno)}
                  placeholder="NULL"
                  onChange={(e) => {
                    setActivePresetId('custom');
                    const raw = e.target.value.trim();
                    setOp({
                      ...op,
                      dno: raw === '' ? null : Number(raw),
                    });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px]"
                />
              </label>
            </div>
          )}

          {op.kind === 'DELETE_DEPT' && (
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-[#1C1B18] block">
                  Target Parent Department (Dno)
                </span>
                <select
                  value={op.dno}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setOp({ ...op, dno: Number(e.target.value) });
                  }}
                  className="w-full px-2.5 py-2 text-xs font-mono bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px]"
                >
                  {db.departments.map((d) => (
                    <option key={d.dno} value={d.dno}>
                      Dno = {d.dno} ({d.dname})
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-[#1C1B18]">
                  SQL Referential Action (ON DELETE)
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {REFERENTIAL_ACTIONS.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setOp({ ...op, action: act.id })}
                      className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                        op.action === act.id
                          ? 'bg-[#E5B82E] text-[#1C1B18]'
                          : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {op.kind === 'UPDATE_DEPT_PK' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-[11px] font-bold text-[#1C1B18] block">
                    Old Dno (Parent PK)
                  </span>
                  <select
                    value={op.oldDno}
                    onChange={(e) => {
                      setActivePresetId('custom');
                      setOp({ ...op, oldDno: Number(e.target.value) });
                    }}
                    className="w-full px-2.5 py-2 text-xs font-mono bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px]"
                  >
                    {db.departments.map((d) => (
                      <option key={d.dno} value={d.dno}>
                        {d.dno} ({d.dname})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-[11px] font-bold text-[#1C1B18] block">
                    New Dno (blank = NULL)
                  </span>
                  <input
                    type="text"
                    value={op.newDno === null ? '' : String(op.newDno)}
                    placeholder="NULL"
                    onChange={(e) => {
                      setActivePresetId('custom');
                      const raw = e.target.value.trim();
                      setOp({ ...op, newDno: raw === '' ? null : Number(raw) });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px]"
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-[#1C1B18]">
                  SQL Referential Action (ON UPDATE)
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {REFERENTIAL_ACTIONS.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setOp({ ...op, action: act.id })}
                      className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                        op.action === act.id
                          ? 'bg-[#E5B82E] text-[#1C1B18]'
                          : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {op.kind === 'UPDATE_EMP_FK' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-[#1C1B18] block">Target Employee</span>
                <select
                  value={op.empId}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setOp({ ...op, empId: Number(e.target.value) });
                  }}
                  className="w-full px-2.5 py-2 text-xs font-mono bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px]"
                >
                  {db.employees.map((e) => (
                    <option key={e.empId} value={e.empId}>
                      {e.empId} ({e.name})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-[#1C1B18] block">
                  New Dno [FK] (blank = NULL)
                </span>
                <input
                  type="text"
                  value={op.newDno === null ? '' : String(op.newDno)}
                  placeholder="NULL"
                  onChange={(e) => {
                    setActivePresetId('custom');
                    const raw = e.target.value.trim();
                    setOp({ ...op, newDno: raw === '' ? null : Number(raw) });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px]"
                />
              </label>
            </div>
          )}

          {/* SQL Statement Preview & Apply CTA */}
          <div className="space-y-2.5 pt-2 border-t border-[#1C1B18]/15">
            <div className="bg-[#1C1B18] text-[#FAF7F0] rounded-[4px] p-3 font-mono text-[11px] leading-relaxed overflow-x-auto">
              {evaluation.sqlPreview}
            </div>
            <button
              type="button"
              data-testid="apply-integrity-op"
              onClick={handleApplyToLiveDb}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-extrabold uppercase tracking-wider bg-[#E5B82E] hover:bg-[#d6a920] text-[#1C1B18] border border-[#1C1B18] rounded-[4px] step-hinge"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {evaluation.accepted
                  ? 'Apply to Live Database Tables'
                  : 'Test & Log Rejected Operation'}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Verdict Banner + 4 Explicit Constraint Check Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div
            data-testid="integrity-verdict"
            className={`border border-[#1C1B18] rounded-[4px] p-4 space-y-2 ${
              evaluation.accepted
                ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                : 'bg-[#A62B2B] text-[#FAF7F0]'
            }`}
          >
            <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base">
              {evaluation.accepted ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
              ) : (
                <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
              )}
              <span>{evaluation.verdictLabel}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-95">{evaluation.explanation}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evaluation.checks.map((chk) => (
              <div
                key={chk.type}
                className={`border border-[#1C1B18] rounded-[4px] p-3.5 space-y-1 ${
                  chk.passed ? 'bg-[#FAF7F0]' : 'bg-[#FFF3F3]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#1C1B18]">{chk.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-[3px] border border-[#1C1B18] font-mono text-[10px] font-bold ${
                      chk.passed
                        ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                        : 'bg-[#A62B2B] text-[#FAF7F0]'
                    }`}
                  >
                    {chk.passed ? 'PASS' : 'VIOLATED'}
                  </span>
                </div>
                <p className="text-xs text-[#434038] leading-snug">{chk.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Policy Side-by-Side Referential Action Comparison Matrix */}
      {policyComparison && (
        <div
          data-testid="referential-action-matrix"
          className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-[#1C1B18]">
              Side-by-Side SQL Referential Action Comparison (RESTRICT vs. CASCADE vs. SET NULL vs. SET DEFAULT)
            </h3>
            <span className="font-mono text-[11px] text-[#6E695D]">
              Click any card to activate that policy
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {policyComparison.map((item) => {
              const isSelected =
                (op.kind === 'DELETE_DEPT' || op.kind === 'UPDATE_DEPT_PK') &&
                op.action === item.action;
              return (
                <button
                  key={item.action}
                  type="button"
                  onClick={() => {
                    if (op.kind === 'DELETE_DEPT' || op.kind === 'UPDATE_DEPT_PK') {
                      setOp({ ...op, action: item.action });
                    }
                  }}
                  className={`text-left border border-[#1C1B18] rounded-[4px] p-3.5 space-y-2 step-hinge ${
                    isSelected
                      ? 'bg-[#E5B82E]/25 ring-2 ring-[#1C1B18]'
                      : item.accepted
                      ? 'bg-[#F4EFE4] hover:bg-[#EAE4D7]'
                      : 'bg-[#FFF3F3] hover:bg-[#FDE6E6]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#1C1B18]">
                      {item.action.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-[3px] border border-[#1C1B18] font-mono text-[10px] font-bold ${
                        item.accepted
                          ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                          : 'bg-[#A62B2B] text-[#FAF7F0]'
                      }`}
                    >
                      {item.accepted ? 'ALLOWS' : 'REJECTS'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1C1B18]/85 leading-snug">{item.summary}</p>
                  <div className="text-[10px] font-mono text-[#6E695D] pt-1 border-t border-[#1C1B18]/15 tabular-nums">
                    Result: {item.resultingDeptCount} Depts · {item.resultingEmpCount} Emps
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Parent (DEPARTMENT) & Child (EMPLOYEE) Relational Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-[#1C1B18]">
              Parent Table: DEPARTMENT
            </h3>
            <span
              data-testid="dept-row-count"
              className="font-mono text-xs font-bold text-[#6E695D] tabular-nums"
            >
              {db.departments.length} rows
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-left">
                  <th className="py-1.5 px-2 font-bold">Dno [PK]</th>
                  <th className="py-1.5 px-2 font-bold">Dname</th>
                  <th className="py-1.5 px-2 font-bold">Location</th>
                </tr>
              </thead>
              <tbody>
                {db.departments.map((d) => {
                  const isTargeted = highlightedDeptNo === d.dno;
                  return (
                    <tr
                      key={d.dno}
                      className={`border-b border-[#1C1B18]/15 last:border-b-0 ${
                        isTargeted ? 'bg-[#E5B82E]/35 font-bold' : ''
                      }`}
                    >
                      <td className="py-1.5 px-2 font-bold tabular-nums">{d.dno}</td>
                      <td className="py-1.5 px-2">{d.dname}</td>
                      <td className="py-1.5 px-2 text-[#434038]">{d.location}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-[#1C1B18]">
              Child Table: EMPLOYEE (FK Dno → DEPARTMENT.Dno, DEFAULT 99)
            </h3>
            <span
              data-testid="emp-row-count"
              className="font-mono text-xs font-bold text-[#6E695D] tabular-nums"
            >
              {db.employees.length} rows
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-left">
                  <th className="py-1.5 px-2 font-bold">EmpID [PK]</th>
                  <th className="py-1.5 px-2 font-bold">Name</th>
                  <th className="py-1.5 px-2 font-bold text-right">Salary</th>
                  <th className="py-1.5 px-2 font-bold text-right">Dno [FK]</th>
                </tr>
              </thead>
              <tbody>
                {db.employees.map((e) => {
                  const isAffected = highlightedEmpSet.has(e.empId);
                  return (
                    <tr
                      key={e.empId}
                      className={`border-b border-[#1C1B18]/15 last:border-b-0 ${
                        isAffected ? 'bg-[#E06D2B]/25 font-bold' : ''
                      }`}
                    >
                      <td className="py-1.5 px-2 font-bold tabular-nums">{e.empId}</td>
                      <td className="py-1.5 px-2">{e.name}</td>
                      <td className="py-1.5 px-2 text-right tabular-nums">
                        {e.salary.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-2 text-right tabular-nums">
                        {e.dno === null ? (
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#EAE4D7] text-[#6E695D]">
                            NULL
                          </span>
                        ) : (
                          e.dno
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Operation Execution Log */}
      {history.length > 0 && (
        <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-2">
          <h3 className="text-xs font-mono font-extrabold uppercase text-[#6E695D]">
            Executed Operation Log
          </h3>
          <div className="space-y-1.5">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex flex-wrap items-center justify-between gap-2 bg-[#F4EFE4] border border-[#1C1B18]/25 rounded-[4px] px-3 py-2 text-xs font-mono"
              >
                <span className="truncate text-[#1C1B18]">{h.sql}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] border border-[#1C1B18] text-[10px] font-bold shrink-0 ${
                    h.accepted
                      ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                      : 'bg-[#A62B2B] text-[#FAF7F0]'
                  }`}
                >
                  {h.accepted ? (
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-3 h-3" aria-hidden="true" />
                  )}
                  {h.verdict}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
