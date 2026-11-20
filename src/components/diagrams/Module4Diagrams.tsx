import React from 'react';
import { DiagramFrame, SvgBox } from './DiagramPrimitives';

export const TxnStatesDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Five-State Transaction Lifecycle & Commit Point Transitions"
    caption={
      caption ??
      'Partially Committed branches to Committed once [commit, T] flushes to stable WAL, or to Failed if checks/logging fail.'
    }
    viewBox="0 0 720 250"
  >
    {/* Begin -> Active */}
    <text x={18} y={66} fontSize={10.5} fontWeight={600} fill="#0369a1">Begin_Txn</text>
    <line x1={76} y1={62} x2={112} y2={62} stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />

    <SvgBox x={116} y={40} w={118} h={44} title="Active" subtitle="Read / Write" tone="sky" />
    {/* Self loop READ/WRITE */}
    <path d="M 150 40 C 150 12, 200 12, 200 40" fill="none" stroke="#0284c7" strokeWidth={1.4} markerEnd="url(#arrow-sky)" />
    <text x={175} y={14} textAnchor="middle" fontSize={9} fontWeight={600} fill="#0369a1">read / write</text>

    {/* Active -> Partially Committed */}
    <line x1={234} y1={62} x2={316} y2={62} stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />
    <text x={275} y={53} textAnchor="middle" fontSize={9.5} fill="#475569">End_Txn</text>
    <SvgBox x={320} y={38} w={152} h={48} title="Partially Committed" subtitle="Final checks & WAL prep" tone="amber" fontSize={11} />

    {/* Partially Committed -> Committed */}
    <line x1={472} y1={62} x2={568} y2={62} stroke="#059669" strokeWidth={1.7} markerEnd="url(#arrow-emerald)" />
    <text x={520} y={48} textAnchor="middle" fontSize={9} fontWeight={700} fill="#047857">WAL Flushed</text>
    <text x={520} y={58} textAnchor="middle" fontSize={8.5} fill="#047857">(Commit Point)</text>
    <SvgBox x={572} y={40} w={124} h={44} title="Committed" subtitle="Durable in WAL" tone="emerald" />

    {/* Active / Partially Committed -> Failed */}
    <line x1={175} y1={84} x2={175} y2={140} stroke="#dc2626" strokeWidth={1.6} markerEnd="url(#arrow-rose)" />
    <text x={122} y={116} textAnchor="middle" fontSize={9.5} fill="#b91c1c">Error / Abort</text>
    <path d="M 396 86 L 396 164 L 242 164" fill="none" stroke="#dc2626" strokeWidth={1.6} markerEnd="url(#arrow-rose)" />
    <text x={322} y={156} textAnchor="middle" fontSize={9.5} fill="#b91c1c">Log / Check Fails</text>

    <SvgBox x={116} y={144} w={122} h={42} title="Failed" subtitle="Execution halted" tone="rose" />

    {/* Failed -> Aborted */}
    <line x1={238} y1={172} x2={346} y2={172} stroke="#dc2626" strokeWidth={1.6} markerEnd="url(#arrow-rose)" />
    <text x={292} y={190} textAnchor="middle" fontSize={9} fontWeight={600} fill="#b91c1c">Rollback / UNDO</text>
    <SvgBox x={350} y={150} w={122} h={42} title="Aborted" subtitle="State restored" tone="rose" />

    {/* Committed & Aborted -> Terminated */}
    <line x1={634} y1={84} x2={634} y2={148} stroke="#059669" strokeWidth={1.6} markerEnd="url(#arrow-emerald)" />
    <line x1={472} y1={171} x2={568} y2={171} stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />
    <SvgBox x={572} y={150} w={124} h={42} title="Terminated" subtitle="Resources freed" tone="dark" />
  </DiagramFrame>
);

export const RecoverabilityVennDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Schedule Containment Hierarchy: Strict ⊂ Cascadeless (ACA) ⊂ Recoverable"
    caption={
      caption ??
      'Strict schedules avoid both dirty reads and premature overwrites, enabling simple BFIM rollback and cascading-abort freedom.'
    }
    viewBox="0 0 700 228"
  >
    <rect x={20} y={14} width={660} height={200} rx={12} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.5} />
    <text x={36} y={34} fontSize={11} fontWeight={700} fill="#334155">
      All Concurrent Schedules (includes Irrecoverable: W1(X); R2(X); C2; C1)
    </text>

    <rect x={44} y={46} width={612} height={154} rx={10} fill="#fffbeb" stroke="#d97706" strokeWidth={1.5} />
    <text x={60} y={66} fontSize={11} fontWeight={700} fill="#92400e">
      Recoverable: If Tj reads from Ti, then Commit(Ti) &lt; Commit(Tj)
    </text>

    <rect x={68} y={78} width={564} height={108} rx={8} fill="#f0f9ff" stroke="#0284c7" strokeWidth={1.5} />
    <text x={84} y={98} fontSize={11} fontWeight={700} fill="#0c4a6e">
      Cascadeless (ACA): Reads ONLY committed data (Zero Dirty Reads / No WR before Commit)
    </text>

    <rect x={96} y={112} width={508} height={58} rx={6} fill="#ecfdf5" stroke="#059669" strokeWidth={1.7} />
    <text x={350} y={136} textAnchor="middle" fontSize={12} fontWeight={700} fill="#064e3b">
      Strict Schedules (Strict 2PL Gold Standard)
    </text>
    <text x={350} y={154} textAnchor="middle" fontSize={10} fill="#047857">
      Tj may neither Read NOR Write X modified by Ti until Ti commits or aborts
    </text>
  </DiagramFrame>
);

export const PrecedenceA1Q7Diagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Conflict Precedence Graph — A1+TA1 Q7 (Cycle T1 → T2 → T1)"
    caption={
      caption ??
      'Three conflicts on X force T1 -> T2 while R2(Y) -> W1(Y) forces T2 -> T1, creating a 2-cycle (NOT Conflict Serializable).'
    }
    viewBox="0 0 700 184"
  >
    {/* Left conflict summary */}
    <rect x={16} y={16} width={356} height={152} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={30} y={36} fontSize={10.5} fontWeight={700} fill="#0f172a">
      Indexed Conflicting Pairs (1..9)
    </text>
    <text x={30} y={56} fontSize={10} fill="#0369a1">• Op 1 R1(X) vs Op 4 W2(X) [RW] → T1 → T2</text>
    <text x={30} y={76} fontSize={10} fill="#0369a1">• Op 2 W1(X) vs Op 3 R2(X) [WR] → T1 → T2 (Dirty)</text>
    <text x={30} y={96} fontSize={10} fill="#0369a1">• Op 2 W1(X) vs Op 4 W2(X) [WW] → T1 → T2</text>
    <text x={30} y={116} fontSize={10} fill="#b91c1c">• Op 6 R2(Y) vs Op 7 W1(Y) [RW] → T2 → T1</text>
    <text x={30} y={142} fontSize={9.5} fill="#475569">Note: Op 5 R1(Y) vs Op 6 R2(Y) is RR (NO conflict)</text>

    {/* Right graph */}
    <rect x={390} y={16} width={294} height={152} rx={8} fill="#fff" stroke="#fecaca" strokeWidth={1.4} />
    <circle cx={454} cy={84} r={24} fill="#fef2f2" stroke="#dc2626" strokeWidth={1.8} />
    <text x={454} y={88} textAnchor="middle" fontSize={13} fontWeight={700} fill="#7f1d1d">T1</text>

    <circle cx={620} cy={84} r={24} fill="#fef2f2" stroke="#dc2626" strokeWidth={1.8} />
    <text x={620} y={88} textAnchor="middle" fontSize={13} fontWeight={700} fill="#7f1d1d">T2</text>

    <path d="M 476 70 Q 537 32 598 70" fill="none" stroke="#dc2626" strokeWidth={1.8} markerEnd="url(#arrow-rose)" />
    <text x={537} y={42} textAnchor="middle" fontSize={10} fontWeight={700} fill="#991b1b">X (RW, WR, WW)</text>

    <path d="M 598 98 Q 537 136 476 98" fill="none" stroke="#dc2626" strokeWidth={1.8} markerEnd="url(#arrow-rose)" />
    <text x={537} y={132} textAnchor="middle" fontSize={10} fontWeight={700} fill="#991b1b">Y (RW)</text>

    <text x={537} y={158} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#991b1b">
      Cycle Detected → NOT Conflict Serializable
    </text>
  </DiagramFrame>
);

export const PrecedenceA2Q5bDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Precedence Graphs — A2+TA2 Q5(b): Schedule S1 (Acyclic) vs. S2 (3-Cycle)"
    caption={
      caption ??
      'S1 yields topological serial order T3 -> T1 -> T2; S2 locks T1 -> T2 -> T3 -> T1 in a 3-node cycle.'
    }
    viewBox="0 0 720 212"
  >
    {/* Left: S1 Acyclic */}
    <rect x={14} y={12} width={336} height={188} rx={8} fill="#ecfdf5" stroke="#a7f3d0" strokeWidth={1.4} />
    <text x={28} y={32} fontSize={11} fontWeight={700} fill="#064e3b">
      Schedule S1: Acyclic → Serializable
    </text>

    <circle cx={96} cy={76} r={22} fill="#ffffff" stroke="#059669" strokeWidth={1.8} />
    <text x={96} y={81} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#064e3b">T3</text>

    <circle cx={268} cy={76} r={22} fill="#ffffff" stroke="#059669" strokeWidth={1.8} />
    <text x={268} y={81} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#064e3b">T1</text>

    <circle cx={182} cy={146} r={22} fill="#ffffff" stroke="#059669" strokeWidth={1.8} />
    <text x={182} y={151} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#064e3b">T2</text>

    <line x1={118} y1={76} x2={242} y2={76} stroke="#059669" strokeWidth={1.7} markerEnd="url(#arrow-emerald)" />
    <text x={182} y={68} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#047857">X</text>

    <line x1={112} y1={92} x2={164} y2={132} stroke="#059669" strokeWidth={1.7} markerEnd="url(#arrow-emerald)" />
    <text x={125} y={122} fontSize={9.5} fontWeight={700} fill="#047857">Y</text>

    <line x1={252} y1={92} x2={200} y2={132} stroke="#059669" strokeWidth={1.7} markerEnd="url(#arrow-emerald)" />
    <text x={236} y={122} fontSize={9.5} fontWeight={700} fill="#047857">Z</text>

    <text x={182} y={188} textAnchor="middle" fontSize={10} fontWeight={700} fill="#064e3b">
      Unique Serial Order: T3 → T1 → T2
    </text>

    {/* Right: S2 3-Cycle */}
    <rect x={370} y={12} width={336} height={188} rx={8} fill="#fef2f2" stroke="#fecaca" strokeWidth={1.4} />
    <text x={384} y={32} fontSize={11} fontWeight={700} fill="#7f1d1d">
      Schedule S2: 3-Node Cycle → NOT Serializable
    </text>

    <circle cx={452} cy={76} r={22} fill="#ffffff" stroke="#dc2626" strokeWidth={1.8} />
    <text x={452} y={81} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#7f1d1d">T1</text>

    <circle cx={624} cy={76} r={22} fill="#ffffff" stroke="#dc2626" strokeWidth={1.8} />
    <text x={624} y={81} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#7f1d1d">T2</text>

    <circle cx={538} cy={146} r={22} fill="#ffffff" stroke="#dc2626" strokeWidth={1.8} />
    <text x={538} y={151} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#7f1d1d">T3</text>

    <line x1={474} y1={76} x2={598} y2={76} stroke="#dc2626" strokeWidth={1.7} markerEnd="url(#arrow-rose)" />
    <text x={538} y={68} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#991b1b">X</text>

    <line x1={608} y1={92} x2={556} y2={132} stroke="#dc2626" strokeWidth={1.7} markerEnd="url(#arrow-rose)" />
    <text x={592} y={122} fontSize={9.5} fontWeight={700} fill="#991b1b">Y</text>

    <line x1={520} y1={132} x2={468} y2={92} stroke="#dc2626" strokeWidth={1.7} markerEnd="url(#arrow-rose)" />
    <text x={482} y={122} fontSize={9.5} fontWeight={700} fill="#991b1b">Z</text>

    <text x={538} y={188} textAnchor="middle" fontSize={10} fontWeight={700} fill="#7f1d1d">
      Cycle: T1 → T2 → T3 → T1 (No Blind Writes)
    </text>
  </DiagramFrame>
);

export const TwoPlPhasesDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Two-Phase Locking (2PL) — Growing Phase, Lock Point & Shrinking Phase"
    caption={
      caption ??
      'All lock acquisitions (and S -> X upgrades) occur before the first unlock at the Lock Point; serialization order matches Lock Point timestamps.'
    }
    viewBox="0 0 700 205"
  >
    {/* Axes */}
    <line x1={58} y1={24} x2={58} y2={170} stroke="#334155" strokeWidth={1.6} />
    <line x1={58} y1={170} x2={404} y2={170} stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />
    <text x={48} y={32} textAnchor="end" fontSize={10} fontWeight={600} fill="#334155">Locks</text>
    <text x={48} y={44} textAnchor="end" fontSize={10} fontWeight={600} fill="#334155">Held</text>
    <text x={392} y={186} textAnchor="end" fontSize={10} fontWeight={600} fill="#334155">Execution Time →</text>

    {/* Growing / Plateau / Shrinking Curve */}
    <path
      d="M 64 166 L 194 48 L 246 48 L 368 166 Z"
      fill="#e0f2fe"
      fillOpacity={0.55}
      stroke="#0284c7"
      strokeWidth={2}
    />
    <line x1={220} y1={48} x2={220} y2={170} stroke="#d97706" strokeWidth={1.5} strokeDasharray="4 3" />
    <circle cx={220} cy={48} r={4.5} fill="#d97706" />
    <text x={220} y={34} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#92400e">
      Lock Point (LP)
    </text>

    <text x={144} y={142} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0c4a6e">Growing</text>
    <text x={294} y={142} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0369a1">Shrinking</text>

    {/* Rules summary on right */}
    <rect x={420} y={20} width={268} height={72} rx={8} fill="#f0f9ff" stroke="#0284c7" strokeWidth={1.6} />
    <text x={554} y={40} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0c4a6e">
      1. Growing Phase (Before LP)
    </text>
    <text x={554} y={58} textAnchor="middle" fontSize={9.5} fill="#0369a1">
      Acquire S/X locks or upgrade S → X.
    </text>
    <text x={554} y={74} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="#0369a1">
      Zero unlock() calls allowed.
    </text>

    <rect x={420} y={104} width={268} height={72} rx={8} fill="#fffbeb" stroke="#d97706" strokeWidth={1.6} />
    <text x={554} y={124} textAnchor="middle" fontSize={11} fontWeight={700} fill="#78350f">
      2. Shrinking Phase (After LP)
    </text>
    <text x={554} y={142} textAnchor="middle" fontSize={9.5} fill="#b45309">
      Release S/X locks (hold X in Strict 2PL).
    </text>
    <text x={554} y={158} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="#b45309">
      Zero new lock() requests allowed.
    </text>
  </DiagramFrame>
);

export const WfgA2Q6Diagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Wait-For Graph (WFG) Deadlock Cycle — A2+TA2 Q6"
    caption={
      caption ??
      'Directed edges Ti -> Tj indicate Ti waits for a lock held by Tj: T1 -> T3 -> T2 -> T1 confirms deadlock.'
    }
    viewBox="0 0 700 180"
  >
    <circle cx={150} cy={72} r={26} fill="#fef2f2" stroke="#dc2626" strokeWidth={1.8} />
    <text x={150} y={76} textAnchor="middle" fontSize={13} fontWeight={700} fill="#7f1d1d">T1</text>
    <text x={150} y={110} textAnchor="middle" fontSize={9.5} fill="#475569">Holds S(A)</text>

    <circle cx={350} cy={72} r={26} fill="#fef2f2" stroke="#dc2626" strokeWidth={1.8} />
    <text x={350} y={76} textAnchor="middle" fontSize={13} fontWeight={700} fill="#7f1d1d">T3</text>
    <text x={350} y={110} textAnchor="middle" fontSize={9.5} fill="#475569">Holds S(C)</text>

    <circle cx={550} cy={72} r={26} fill="#fef2f2" stroke="#dc2626" strokeWidth={1.8} />
    <text x={550} y={76} textAnchor="middle" fontSize={13} fontWeight={700} fill="#7f1d1d">T2</text>
    <text x={550} y={110} textAnchor="middle" fontSize={9.5} fill="#475569">Holds X(B) [Wrote B]</text>

    <line x1={176} y1={72} x2={320} y2={72} stroke="#dc2626" strokeWidth={1.8} markerEnd="url(#arrow-rose)" />
    <text x={248} y={63} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#991b1b">waits X(C)</text>

    <line x1={376} y1={72} x2={520} y2={72} stroke="#dc2626" strokeWidth={1.8} markerEnd="url(#arrow-rose)" />
    <text x={448} y={63} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#991b1b">waits X(B)</text>

    <path d="M 550 46 L 550 18 L 150 18 L 150 42" fill="none" stroke="#dc2626" strokeWidth={1.8} markerEnd="url(#arrow-rose)" />
    <text x={350} y={32} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#991b1b">
      T2 waits for X(A) held by T1
    </text>

    <rect x={24} y={130} width={652} height={40} rx={6} fill="#fffbeb" stroke="#fcd34d" strokeWidth={1.3} />
    <text x={350} y={146} textAnchor="middle" fontSize={10} fontWeight={700} fill="#78350f">
      Victim Selection: Abort T3 (0 writes, minimum rollback) → frees S(C)
    </text>
    <text x={350} y={162} textAnchor="middle" fontSize={9.5} fill="#92400e">
      Resolution Order: T1 acquires X(C) &amp; commits → T2 acquires X(A) &amp; commits → T3 restarts
    </text>
  </DiagramFrame>
);

export const MglHierarchyDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Multiple Granularity Locking (MGL) Hierarchy & Lock/Unlock Direction"
    caption={
      caption ??
      'Transactions acquire Intention locks (IS, IX, SIX) strictly top-down from Database root to record, and release locks bottom-up.'
    }
    viewBox="0 0 700 245"
  >
    {/* Root */}
    <SvgBox x={240} y={14} w={132} h={34} title="Database" tone="sky" fontSize={11.5} />
    <line x1={276} y1={48} x2={180} y2={72} stroke="#334155" strokeWidth={1.4} />
    <line x1={336} y1={48} x2={410} y2={72} stroke="#334155" strokeWidth={1.4} />

    {/* Areas */}
    <SvgBox x={112} y={72} w={128} h={32} title="File / Area 1" tone="neutral" fontSize={10.5} />
    <SvgBox x={354} y={72} w={128} h={32} title="File / Area 2" tone="neutral" fontSize={10.5} />

    {/* Tables */}
    <line x1={144} y1={104} x2={92} y2={132} stroke="#334155" strokeWidth={1.3} />
    <line x1={208} y1={104} x2={252} y2={132} stroke="#334155" strokeWidth={1.3} />
    <SvgBox x={36} y={132} w={110} h={30} title="Table_1" tone="sky" fontSize={10.5} />
    <SvgBox x={200} y={132} w={110} h={30} title="Table_2" tone="neutral" fontSize={10.5} />

    {/* Pages */}
    <line x1={74} y1={162} x2={58} y2={182} stroke="#334155" strokeWidth={1.3} />
    <line x1={108} y1={162} x2={166} y2={182} stroke="#334155" strokeWidth={1.3} />
    <SvgBox x={18} y={182} w={84} h={24} title="Page 1" tone="neutral" fontSize={9.5} rx={4} />
    <SvgBox x={124} y={182} w={84} h={24} title="Page 2" tone="neutral" fontSize={9.5} rx={4} />

    {/* Records */}
    <line x1={44} y1={206} x2={34} y2={218} stroke="#334155" strokeWidth={1.2} />
    <line x1={76} y1={206} x2={90} y2={218} stroke="#334155" strokeWidth={1.2} />
    <SvgBox x={12} y={218} w={46} h={20} title="r1" tone="emerald" fontSize={9.5} rx={4} />
    <SvgBox x={66} y={218} w={46} h={20} title="r2" tone="emerald" fontSize={9.5} rx={4} />

    {/* Direction Annotations */}
    <line x1={520} y1={26} x2={520} y2={218} stroke="#0284c7" strokeWidth={1.8} markerEnd="url(#arrow-sky)" />
    <text x={534} y={84} fontSize={10.5} fontWeight={700} fill="#0c4a6e">Lock Top-Down</text>
    <text x={534} y={100} fontSize={9.5} fill="#0369a1">IS / IX / SIX on ancestors</text>

    <line x1={676} y1={218} x2={676} y2={26} stroke="#059669" strokeWidth={1.8} markerEnd="url(#arrow-emerald)" />
    <text x={664} y={156} textAnchor="end" fontSize={10.5} fontWeight={700} fill="#047857">Unlock Bottom-Up</text>
    <text x={664} y={172} textAnchor="end" fontSize={9.5} fill="#047857">Release leaf → root</text>
  </DiagramFrame>
);

export const CheckpointTimelineDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Fuzzy / Consistent Checkpoint Recovery Timeline (Immediate Update)"
    caption={
      caption ??
      'T1 flushed before Checkpoint is ignored; committed T2 & T4 are REDOne forward; uncommitted T3 is UNDOne backward.'
    }
    viewBox="0 0 740 222"
  >
    {/* Timeline Axis */}
    <line x1={26} y1={196} x2={704} y2={196} stroke="#334155" strokeWidth={2} />
    <text x={26} y={212} fontSize={9.5} fill="#475569">Time →</text>

    {/* Checkpoint marker */}
    <line x1={230} y1={38} x2={230} y2={196} stroke="#d97706" strokeWidth={2} strokeDasharray="4 3" />
    <SvgBox x={172} y={10} w={116} h={28} title="[ CHECKPOINT ]" tone="amber" fontSize={10.5} rx={4} />

    {/* Crash marker */}
    <line x1={660} y1={38} x2={660} y2={196} stroke="#dc2626" strokeWidth={2} />
    <SvgBox x={612} y={10} w={96} h={28} title="CRASH!" tone="rose" fontSize={10.5} rx={4} />

    {/* Row 1 Left: T1 */}
    <rect x={44} y={48} width={148} height={24} rx={4} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.4} />
    <text x={118} y={64} textAnchor="middle" fontSize={10} fontWeight={600} fill="#334155">T1 (Commit & Flush)</text>
    <text x={118} y={84} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#475569">Ignore (Safe)</text>

    {/* Row 1 Right: T4 */}
    <rect x={422} y={48} width={190} height={24} rx={4} fill="#ecfdf5" stroke="#059669" strokeWidth={1.4} />
    <text x={517} y={64} textAnchor="middle" fontSize={10} fontWeight={600} fill="#064e3b">T4 (Starts & Commits)</text>
    <text x={517} y={84} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#047857">REDO (Forward)</text>

    {/* Row 2: T2 */}
    <rect x={162} y={96} width={226} height={24} rx={4} fill="#ecfdf5" stroke="#059669" strokeWidth={1.4} />
    <text x={275} y={112} textAnchor="middle" fontSize={10} fontWeight={600} fill="#064e3b">T2 (Commits after Ckpt)</text>
    <text x={275} y={132} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#047857">REDO (Forward)</text>

    {/* Row 3: T3 */}
    <rect x={198} y={144} width={462} height={24} rx={4} fill="#fef2f2" stroke="#dc2626" strokeWidth={1.4} />
    <text x={429} y={160} textAnchor="middle" fontSize={10} fontWeight={600} fill="#7f1d1d">
      T3 (Active across Checkpoint — Uncommitted at Crash)
    </text>
    <text x={429} y={180} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#b91c1c">
      UNDO (Backward via BFIM)
    </text>
  </DiagramFrame>
);
