import React from 'react';
import { DbCylinder, DiagramFrame, SvgBox } from './DiagramPrimitives';

export const RahulConcurrencyDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="DBMS Characteristic Check — Rahul ₹10,000 Concurrent Withdrawal"
    caption={
      caption ??
      'ACID locking serializes simultaneous debits so both updates apply cleanly without lost-update corruption.'
    }
    viewBox="0 0 700 220"
  >
    {/* Initial Balance */}
    <SvgBox
      x={16}
      y={72}
      w={136}
      h={72}
      title="Initial Balance"
      subtitle="Account = ₹10,000"
      tone="sky"
    />

    {/* Fork arrows */}
    <path d="M 152 96 L 182 96 L 182 56 L 206 56" fill="none" stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />
    <path d="M 152 120 L 182 120 L 182 156 L 206 156" fill="none" stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />

    {/* Concurrent users */}
    <SvgBox
      x={210}
      y={26}
      w={166}
      h={58}
      title="User A (ATM)"
      subtitle="Withdraw ₹2,000"
      tone="neutral"
    />
    <SvgBox
      x={210}
      y={128}
      w={166}
      h={58}
      title="User B (Mobile)"
      subtitle="Transfer ₹3,000"
      tone="neutral"
    />

    {/* Merge arrows */}
    <path d="M 376 56 L 398 56 L 398 96 L 418 96" fill="none" stroke="#d97706" strokeWidth={1.6} markerEnd="url(#arrow-amber)" />
    <path d="M 376 156 L 398 156 L 398 118 L 418 118" fill="none" stroke="#d97706" strokeWidth={1.6} markerEnd="url(#arrow-amber)" />

    {/* Serialized Lock */}
    <SvgBox
      x={422}
      y={68}
      w={138}
      h={78}
      title="ACID Lock Mgr"
      subtitle="Serialized: A -> B"
      tone="amber"
    />

    {/* Arrow to Result */}
    <line x1={560} y1={107} x2={588} y2={107} stroke="#059669" strokeWidth={1.8} markerEnd="url(#arrow-emerald)" />

    {/* Final Result */}
    <SvgBox
      x={592}
      y={64}
      w={94}
      h={86}
      title="₹5,000"
      subtitle="Consistent!"
      tone="emerald"
      fontSize={14}
    />

    {/* Bottom Warning Note */}
    <rect x={16} y={196} width={670} height={18} rx={4} fill="#fef2f2" stroke="#fecaca" strokeWidth={1} />
    <text x={351} y={208.5} textAnchor="middle" fontSize={10} fontWeight={600} fill="#991b1b">
      Without ACID isolation: lost update overwrites one debit, leaving invalid ₹7,000 or ₹8,000!
    </text>
  </DiagramFrame>
);

export const ThreeSchemaDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="ANSI/SPARC Three-Schema Architecture & Data Independence Mappings"
    caption={
      caption ??
      'Mappings absorb changes at lower levels so upper schemas and user applications continue running unmodified.'
    }
    viewBox="0 0 700 326"
  >
    {/* External Tier */}
    <rect x={22} y={14} width={436} height={66} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.4} />
    <text x={34} y={30} fontSize={9.5} fontWeight={700} fill="#475569">
      EXTERNAL LEVEL (END USERS)
    </text>
    <SvgBox x={36} y={38} w={194} h={34} title="External View 1: Student" tone="neutral" fontSize={11} />
    <SvgBox x={250} y={38} w={194} h={34} title="External View 2: Finance" tone="neutral" fontSize={11} />

    {/* Mapping 1 */}
    <line x1={133} y1={80} x2={133} y2={122} stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />
    <line x1={347} y1={80} x2={347} y2={122} stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />
    <rect x={168} y={91} width={144} height={20} rx={4} fill="#ffffff" stroke="#bae6fd" strokeWidth={1} />
    <text x={240} y={104.5} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="#0369a1">
      External / Conceptual Map
    </text>
    <line x1={312} y1={101} x2={474} y2={101} stroke="#0284c7" strokeWidth={1.3} strokeDasharray="3 2" />
    <SvgBox
      x={476}
      y={81}
      w={204}
      h={40}
      title="Logical Data Independence"
      subtitle="Insulates Views from table splits"
      tone="sky"
      fontSize={11}
      subFontSize={9.5}
    />

    {/* Conceptual Tier */}
    <SvgBox
      x={22}
      y={125}
      w={436}
      h={52}
      title="CONCEPTUAL SCHEMA (LOGICAL LEVEL)"
      subtitle="All Enterprise Entities, Relationships, Keys & Integrity Constraints"
      tone="sky"
      fontSize={12}
      subFontSize={10}
    />

    {/* Mapping 2 */}
    <line x1={240} y1={177} x2={240} y2={219} stroke="#059669" strokeWidth={1.6} markerEnd="url(#arrow-emerald)" />
    <rect x={166} y={188} width={148} height={20} rx={4} fill="#ffffff" stroke="#a7f3d0" strokeWidth={1} />
    <text x={240} y={201.5} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="#047857">
      Conceptual / Internal Map
    </text>
    <line x1={314} y1={198} x2={474} y2={198} stroke="#059669" strokeWidth={1.3} strokeDasharray="3 2" />
    <SvgBox
      x={476}
      y={178}
      w={204}
      h={40}
      title="Physical Data Independence"
      subtitle="Insulates SQL from index/SSD shifts"
      tone="emerald"
      fontSize={11}
      subFontSize={9.5}
    />

    {/* Internal Tier */}
    <SvgBox
      x={22}
      y={222}
      w={436}
      h={48}
      title="INTERNAL SCHEMA (PHYSICAL LEVEL)"
      subtitle="Disk Pages, B+ Tree / Hash Indexes, Compression & Block Pointers"
      tone="neutral"
      fontSize={11.5}
      subFontSize={10}
    />

    {/* Stored DB */}
    <line x1={240} y1={270} x2={240} y2={281} stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />
    <DbCylinder cx={240} y={283} w={172} h={38} label="Stored Database" tone="dark" />
  </DiagramFrame>
);

export const DbmsComponentsDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Overall DBMS Component Modules (Elmasri Fig. 2.3 · A1+TA1 Q1 Blueprint)"
    caption={
      caption ??
      'Traces all four user entry paths through compilers and the Runtime DB Processor down to disk and catalog storage.'
    }
    viewBox="0 0 760 404"
  >
    {/* Row 1: 4 Actors */}
    <SvgBox x={16} y={12} w={132} h={42} title="DBA" subtitle="Schema & Grants" tone="amber" fontSize={11.5} subFontSize={9.5} />
    <SvgBox x={178} y={12} w={156} h={42} title="Casual Users" subtitle="Ad-hoc SQL" tone="neutral" fontSize={11.5} subFontSize={9.5} />
    <SvgBox x={364} y={12} w={184} h={42} title="App Programmers" subtitle="Host + Embedded DML" tone="neutral" fontSize={11.5} subFontSize={9.5} />
    <SvgBox x={580} y={12} w={164} h={42} title="Naive Users" subtitle="Canned Forms / Params" tone="neutral" fontSize={11.5} subFontSize={9.5} />

    {/* Arrows Row 1 -> Row 2 */}
    <line x1={82} y1={54} x2={82} y2={78} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <text x={90} y={70} fontSize={9} fill="#475569">DDL</text>
    <line x1={256} y1={54} x2={256} y2={78} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <text x={264} y={70} fontSize={9} fill="#475569">SQL</text>
    <line x1={456} y1={54} x2={456} y2={78} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <text x={464} y={70} fontSize={9} fill="#475569">DML</text>

    {/* Naive Users straight down to Compiled Txns */}
    <line x1={662} y1={54} x2={662} y2={204} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <text x={670} y={132} fontSize={9} fill="#475569">Params</text>

    {/* Row 2: Compilers */}
    <SvgBox x={16} y={82} w={132} h={42} title="DDL Compiler" tone="sky" fontSize={11} />
    <SvgBox x={178} y={82} w={156} h={42} title="Query Compiler" tone="sky" fontSize={11} />
    <SvgBox x={364} y={82} w={184} h={42} title="DML Precompiler" tone="sky" fontSize={11} />

    {/* Row 2 -> Row 3 */}
    <line x1={256} y1={124} x2={256} y2={144} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <line x1={456} y1={124} x2={456} y2={144} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />

    {/* Row 3: Optimizer & Host Compiler */}
    <SvgBox x={178} y={148} w={156} h={42} title="Query Optimizer" tone="sky" fontSize={11} />
    <SvgBox x={364} y={148} w={184} h={42} title="Host Compiler" tone="neutral" fontSize={11} />

    {/* DDL Compiler -> System Catalog */}
    <line x1={82} y1={124} x2={82} y2={220} stroke="#d97706" strokeWidth={1.6} markerEnd="url(#arrow-amber)" />

    {/* Host Compiler -> Compiled Txns */}
    <line x1={456} y1={190} x2={456} y2={204} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />

    {/* Row 4: System Catalog & Compiled Txns */}
    <SvgBox x={16} y={224} w={132} h={88} title="System Catalog" subtitle="(Metadata & Stats)" tone="amber" fontSize={11} subFontSize={9.5} />
    <SvgBox x={364} y={208} w={380} h={38} title="Compiled Transactions (Object Code)" tone="neutral" fontSize={11} />

    {/* Arrows to Runtime DB Processor */}
    <line x1={256} y1={190} x2={256} y2={264} stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />
    <line x1={554} y1={246} x2={554} y2={264} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />

    {/* System Catalog <-> Query Optimizer & Runtime Processor */}
    <line x1={148} y1={288} x2={174} y2={288} stroke="#d97706" strokeWidth={1.5} markerStart="url(#arrow-amber)" markerEnd="url(#arrow-amber)" />
    <path d="M 148 242 L 164 242 L 164 169 L 174 169" fill="none" stroke="#d97706" strokeWidth={1.3} strokeDasharray="3 2" markerEnd="url(#arrow-amber)" />

    {/* Row 5: Runtime DB Processor */}
    <SvgBox
      x={178}
      y={268}
      w={566}
      h={44}
      title="Runtime Database Processor / Database Manager"
      subtitle="Coordinates Catalog checks, Transaction Execution & Query Plans"
      tone="sky"
      fontSize={12}
      subFontSize={9.5}
    />

    {/* Row 5 -> Row 6 */}
    <line x1={364} y1={312} x2={364} y2={334} stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />

    {/* Row 6: Storage / Txn Subsystems & Stored DB */}
    <SvgBox
      x={178}
      y={338}
      w={372}
      h={48}
      title="Concurrency Control · Recovery · File & Buffer Mgr"
      subtitle="Locks, WAL Logs, Page Replacement & OS Disk I/O"
      tone="neutral"
      fontSize={11}
      subFontSize={9.5}
    />
    <line x1={550} y1={362} x2={590} y2={362} stroke="#0284c7" strokeWidth={1.8} markerEnd="url(#arrow-sky)" />
    <DbCylinder cx={668} y={336} w={144} h={52} label="Stored Database" tone="dark" />
  </DiagramFrame>
);
