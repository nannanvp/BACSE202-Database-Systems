import React from 'react';
import { DiagramFrame, SvgBox } from './DiagramPrimitives';

export const SpannedUnspannedDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Physical Block Packing: Unspanned vs. Spanned Storage"
    caption={
      caption ??
      'Unspanned storage keeps every record intact inside 1 block (leaving B mod R unused); Spanned packs large records across blocks via pointer P.'
    }
    viewBox="0 0 700 206"
  >
    {/* Track 1: Unspanned */}
    <text x={18} y={24} fontSize={11} fontWeight={700} fill="#0f172a">
      1. Unspanned Storage (B = 1000 B, R = 80 B → bfr = floor(1000/80) = 12 rec/blk, 40 B unused)
    </text>
    <rect x={18} y={34} width={664} height={44} rx={6} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.5} />
    <rect x={24} y={40} width={118} height={32} rx={4} fill="#f0f9ff" stroke="#0284c7" strokeWidth={1.2} />
    <text x={83} y={60} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#0c4a6e">Rec 1 (80 B)</text>
    <rect x={148} y={40} width={118} height={32} rx={4} fill="#f0f9ff" stroke="#0284c7" strokeWidth={1.2} />
    <text x={207} y={60} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#0c4a6e">Rec 2 (80 B)</text>
    <rect x={272} y={40} width={132} height={32} rx={4} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 2" />
    <text x={338} y={60} textAnchor="middle" fontSize={11} fontWeight={600} fill="#64748b">· · · Rec 3..11 · · ·</text>
    <rect x={410} y={40} width={122} height={32} rx={4} fill="#f0f9ff" stroke="#0284c7" strokeWidth={1.2} />
    <text x={471} y={60} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#0c4a6e">Rec 12 (80 B)</text>
    <rect x={538} y={40} width={138} height={32} rx={4} fill="#fffbeb" stroke="#d97706" strokeWidth={1.2} />
    <text x={607} y={60} textAnchor="middle" fontSize={10} fontWeight={600} fill="#92400e">40 B Unused Gap</text>
    <text x={24} y={92} fontSize={9.5} fill="#475569">Disk Block i (1 block I/O per record)</text>

    {/* Track 2: Spanned */}
    <text x={18} y={120} fontSize={11} fontWeight={700} fill="#0f172a">
      2. Spanned Storage (Variable / Large Records — splits across boundary using Block Pointer P)
    </text>
    <rect x={18} y={130} width={330} height={44} rx={6} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.5} />
    <rect x={24} y={136} width={92} height={32} rx={4} fill="#ecfdf5" stroke="#059669" strokeWidth={1.2} />
    <text x={70} y={156} textAnchor="middle" fontSize={10} fontWeight={600} fill="#064e3b">Rec 1</text>
    <rect x={122} y={136} width={166} height={32} rx={4} fill="#ecfdf5" stroke="#059669" strokeWidth={1.2} />
    <text x={205} y={156} textAnchor="middle" fontSize={10} fontWeight={600} fill="#064e3b">Rec 2 (Part 1)</text>
    <rect x={294} y={136} width={48} height={32} rx={4} fill="#fef3c7" stroke="#d97706" strokeWidth={1.3} />
    <text x={318} y={156} textAnchor="middle" fontSize={10} fontWeight={700} fill="#92400e">P</text>

    <path d="M 342 152 L 386 152" fill="none" stroke="#d97706" strokeWidth={1.8} markerEnd="url(#arrow-amber)" />

    <rect x={392} y={130} width={290} height={44} rx={6} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.5} />
    <rect x={398} y={136} width={144} height={32} rx={4} fill="#ecfdf5" stroke="#059669" strokeWidth={1.2} />
    <text x={470} y={156} textAnchor="middle" fontSize={10} fontWeight={600} fill="#064e3b">Rec 2 (Part 2)</text>
    <rect x={548} y={136} width={128} height={32} rx={4} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={612} y={156} textAnchor="middle" fontSize={10} fontWeight={600} fill="#475569">Rec 3 ...</text>

    <text x={24} y={190} fontSize={9.5} fill="#475569">Disk Block i</text>
    <text x={398} y={190} fontSize={9.5} fill="#475569">Disk Block i + 1 (max 2 reads for split record)</text>
  </DiagramFrame>
);

export const HashingLayoutsDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Final Hash Layouts — A1+TA1 Q5(a) Static vs. Extendible MSB (c = 2)"
    caption={
      caption ??
      'Static hashing chains overflows on B1; Extendible hashing doubles directory to d=2 (MSB prefix) while Bucket_B stays shared at dp=1.'
    }
    viewBox="0 0 740 310"
  >
    {/* PART A */}
    <rect x={14} y={12} width={712} height={122} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={28} y={32} fontSize={11} fontWeight={700} fill="#0f172a">
      PART A: Static Hashing Overflow Chain (h = last 2 bits of key)
    </text>

    <SvgBox x={28} y={44} w={132} h={34} title="B0 (00): [ empty ]" tone="neutral" fontSize={10} />
    <SvgBox x={28} y={88} w={218} h={34} title="B1 (01): [ K1(0001), K2(1001) ]" tone="sky" fontSize={10} />
    <line x1={246} y1={105} x2={292} y2={105} stroke="#d97706" strokeWidth={1.8} markerEnd="url(#arrow-amber)" />
    <SvgBox x={296} y={88} w={224} h={34} title="B1_ov1: [ K3(0101), K5(1101) ]" tone="amber" fontSize={10} />

    <SvgBox x={546} y={44} w={164} h={34} title="B2 (10): [ K4(0010) ]" tone="emerald" fontSize={10} />
    <SvgBox x={546} y={88} w={164} h={34} title="B3 (11): [ empty ]" tone="neutral" fontSize={10} />

    {/* PART B */}
    <rect x={14} y={146} width={712} height={152} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={28} y={166} fontSize={11} fontWeight={700} fill="#0f172a">
      PART B: Extendible Dynamic Hashing — Final Directory (Global Depth d = 2, MSB Prefix)
    </text>

    {/* Directory Table */}
    <SvgBox x={36} y={178} w={118} h={26} title="Dir 00 (d=2)" tone="sky" fontSize={10.5} rx={4} />
    <SvgBox x={36} y={206} w={118} h={26} title="Dir 01 (d=2)" tone="sky" fontSize={10.5} rx={4} />
    <SvgBox x={36} y={234} w={118} h={26} title="Dir 10 (d=2)" tone="emerald" fontSize={10.5} rx={4} />
    <SvgBox x={36} y={262} w={118} h={26} title="Dir 11 (d=2)" tone="emerald" fontSize={10.5} rx={4} />

    {/* Directory -> Bucket Pointers */}
    <line x1={154} y1={191} x2={346} y2={191} stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />
    <line x1={154} y1={219} x2={346} y2={227} stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />
    <path d="M 154 247 L 240 247 L 240 264 L 346 264" fill="none" stroke="#059669" strokeWidth={1.6} markerEnd="url(#arrow-emerald)" />
    <path d="M 154 275 L 240 275 L 240 264" fill="none" stroke="#059669" strokeWidth={1.6} />

    {/* Buckets */}
    <SvgBox
      x={352}
      y={174}
      w={352}
      h={32}
      title="Bucket_A1 (dp = 2) :  [ K1(0001), K4(0010) ]"
      tone="sky"
      fontSize={10.5}
    />
    <SvgBox
      x={352}
      y={212}
      w={352}
      h={32}
      title="Bucket_A2 (dp = 2) :  [ K3(0101) ]"
      tone="sky"
      fontSize={10.5}
    />
    <SvgBox
      x={352}
      y={250}
      w={352}
      h={36}
      title="Bucket_B (dp = 1 — Shared!) :  [ K2(1001), K5(1101) ]"
      tone="emerald"
      fontSize={10.5}
    />
  </DiagramFrame>
);

export const BPlusSplitRulesDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="B+ Tree (Order m = 3) Split Mechanics: Leaf COPY vs. Internal MOVE"
    caption={
      caption ??
      'Leaves keep a copy of the middle separator so every key stays in the leaf level; internal nodes push the middle key upward cleanly.'
    }
    viewBox="0 0 700 210"
  >
    {/* Left: Leaf Split */}
    <rect x={14} y={14} width={328} height={182} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={28} y={34} fontSize={11} fontWeight={700} fill="#0c4a6e">
      1. Leaf Node Overflow (COPY b Up)
    </text>
    <SvgBox x={110} y={48} w={136} h={34} title="[ a ,  b ,  c ]" subtitle="3rd key overflows!" tone="amber" fontSize={11} subFontSize={9} />

    <line x1={178} y1={82} x2={178} y2={106} stroke="#059669" strokeWidth={1.6} markerEnd="url(#arrow-emerald)" />
    <text x={188} y={98} fontSize={9.5} fontWeight={700} fill="#047857">COPY b to parent</text>

    <SvgBox x={128} y={110} w={100} h={26} title="Parent: [ ... , b ]" tone="sky" fontSize={10} rx={4} />
    <line x1={154} y1={136} x2={98} y2={156} stroke="#334155" strokeWidth={1.4} />
    <line x1={202} y1={136} x2={258} y2={156} stroke="#334155" strokeWidth={1.4} />

    <SvgBox x={44} y={158} w={100} h={28} title="Leaf: [ a ]" tone="emerald" fontSize={10.5} rx={4} />
    <line x1={144} y1={172} x2={200} y2={172} stroke="#059669" strokeWidth={1.4} markerEnd="url(#arrow-emerald)" />
    <SvgBox x={204} y={158} w={110} h={28} title="Leaf: [ b , c ]" tone="emerald" fontSize={10.5} rx={4} />

    {/* Right: Internal Split */}
    <rect x={358} y={14} width={328} height={182} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={372} y={34} fontSize={11} fontWeight={700} fill="#0f172a">
      2. Internal Node Overflow (MOVE b Up)
    </text>
    <SvgBox x={454} y={48} w={136} h={34} title="[ a ,  b ,  c ]" subtitle="Internal node full!" tone="amber" fontSize={11} subFontSize={9} />

    <line x1={522} y1={82} x2={522} y2={106} stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />
    <text x={532} y={98} fontSize={9.5} fontWeight={700} fill="#0369a1">MOVE b to parent</text>

    <SvgBox x={472} y={110} w={100} h={26} title="Parent: [ ... , b ]" tone="sky" fontSize={10} rx={4} />
    <line x1={498} y1={136} x2={442} y2={156} stroke="#334155" strokeWidth={1.4} />
    <line x1={546} y1={136} x2={602} y2={156} stroke="#334155" strokeWidth={1.4} />

    <SvgBox x={388} y={158} w={104} h={28} title="Left: [ a ]" tone="neutral" fontSize={10.5} rx={4} />
    <SvgBox x={552} y={158} w={104} h={28} title="Right: [ c ]" tone="neutral" fontSize={10.5} rx={4} />
  </DiagramFrame>
);

export const LsmArchitectureDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="LSM Tree Architecture — Sequential Write Path & Bloom-Filtered Read Path"
    caption={
      caption ??
      'Writes buffer in RAM MemTable + sequential WAL and flush as immutable SSTables; Bloom filters prevent unnecessary SSTable disk reads.'
    }
    viewBox="0 0 740 242"
  >
    {/* Write Path Row */}
    <text x={18} y={24} fontSize={11} fontWeight={700} fill="#0284c7">
      WRITE PATH (Append-Only · No Random In-Place Disk Updates)
    </text>
    <SvgBox x={18} y={36} w={116} h={48} title="Put(K, V)" subtitle="Client Write" tone="sky" fontSize={11} />
    <path d="M 134 48 L 168 48" fill="none" stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <path d="M 134 72 L 152 72 L 152 102 L 168 102" fill="none" stroke="#d97706" strokeWidth={1.5} markerEnd="url(#arrow-amber)" />

    <SvgBox x={172} y={32} w={164} h={36} title="MemTable (RAM)" subtitle="Sorted SkipList / RB-Tree" tone="emerald" fontSize={10.5} subFontSize={9} />
    <SvgBox x={172} y={82} w={164} h={36} title="WAL Log (Disk)" subtitle="Sequential Durability" tone="amber" fontSize={10.5} subFontSize={9} />

    <line x1={336} y1={50} x2={376} y2={50} stroke="#059669" strokeWidth={1.6} markerEnd="url(#arrow-emerald)" />
    <text x={356} y={42} textAnchor="middle" fontSize={8.5} fill="#047857">Full</text>
    <SvgBox x={380} y={32} w={156} h={36} title="Immutable MemTable" subtitle="Frozen for Flush" tone="neutral" fontSize={10} subFontSize={9} />

    <line x1={536} y1={50} x2={576} y2={50} stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />
    <SvgBox x={580} y={32} w={144} h={36} title="Disk L0 SSTable" subtitle="Sorted Immutable File" tone="sky" fontSize={10} subFontSize={9} />

    {/* Divider */}
    <line x1={18} y1={134} x2={722} y2={134} stroke="#e2e8f0" strokeWidth={1.4} />

    {/* Read Path Row */}
    <text x={18} y={156} fontSize={11} fontWeight={700} fill="#0f172a">
      READ PATH (Newest → Oldest · Tombstones Shadow Deleted Keys)
    </text>
    <SvgBox x={18} y={170} w={92} h={42} title="Get(K)" tone="sky" fontSize={11} />
    <line x1={110} y1={191} x2={136} y2={191} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <SvgBox x={140} y={170} w={106} h={42} title="MemTable" subtitle="RAM Hit?" tone="emerald" fontSize={10.5} />
    <line x1={246} y1={191} x2={272} y2={191} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <SvgBox x={276} y={170} w={106} h={42} title="Immutable" subtitle="RAM Check" tone="neutral" fontSize={10.5} />
    <line x1={382} y1={191} x2={408} y2={191} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <SvgBox x={412} y={170} w={146} h={42} title="Bloom Filter Gate" subtitle="NO => Skip SSTable I/O!" tone="amber" fontSize={10} subFontSize={8.8} />
    <line x1={558} y1={191} x2={584} y2={191} stroke="#0284c7" strokeWidth={1.5} markerEnd="url(#arrow-sky)" />
    <SvgBox x={588} y={170} w={136} h={42} title="SSTables L0→L1→L2" subtitle="Compacted (STCS / LCS)" tone="sky" fontSize={10} subFontSize={8.8} />
  </DiagramFrame>
);

export const MultilevelIndexDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Multilevel Index Structure — A2+TA2 Q4 (STUDENT · 16,000 Records)"
    caption={
      caption ??
      '3 block accesses max via binary search on 2-block 2nd-level index (1) + 1st-level dense index block (1) + STUDENT data block (1).'
    }
    viewBox="0 0 720 270"
  >
    {/* Level 2 */}
    <text x={18} y={24} fontSize={10.5} fontWeight={700} fill="#0c4a6e">
      2nd-Level Sparse Index (b2 = ceil(160 / 100) = 2 blocks · 160 entries · bfr_i = 100)
    </text>
    <SvgBox x={100} y={34} w={224} h={40} title="Index Blk 1: [K1|P1 .. K100|P100]" tone="sky" fontSize={10.5} />
    <SvgBox x={380} y={34} w={224} h={40} title="Index Blk 2: [K101|P101 .. K160|P160]" tone="sky" fontSize={10.5} />

    {/* Arrows down to Level 1 */}
    <line x1={150} y1={74} x2={82} y2={114} stroke="#0284c7" strokeWidth={1.5} markerEnd="url(#arrow-sky)" />
    <line x1={270} y1={74} x2={342} y2={114} stroke="#0284c7" strokeWidth={1.5} markerEnd="url(#arrow-sky)" />
    <line x1={430} y1={74} x2={410} y2={114} stroke="#0284c7" strokeWidth={1.5} markerEnd="url(#arrow-sky)" />
    <line x1={560} y1={74} x2={618} y2={114} stroke="#0284c7" strokeWidth={1.5} markerEnd="url(#arrow-sky)" />

    {/* Level 1 */}
    <text x={18} y={108} fontSize={10.5} fontWeight={700} fill="#047857">
      1st-Level DENSE Primary Index (b1 = ceil(16,000 / 100) = 160 blocks · Ri = 4+6 = 10 B)
    </text>
    <SvgBox x={18} y={118} w={156} h={38} title="Blk 1 (100 dense ptrs)" tone="emerald" fontSize={9.5} />
    <text x={222} y={142} textAnchor="middle" fontSize={13} fontWeight={700} fill="#64748b">· · ·</text>
    <SvgBox x={264} y={118} w={172} h={38} title="Blk 101 (100 dense ptrs)" tone="emerald" fontSize={9.5} />
    <text x={486} y={142} textAnchor="middle" fontSize={13} fontWeight={700} fill="#64748b">· · ·</text>
    <SvgBox x={528} y={118} w={174} h={38} title="Blk 160 (100 dense ptrs)" tone="emerald" fontSize={9.5} />

    {/* Arrows down to Data File */}
    <line x1={96} y1={156} x2={96} y2={196} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <line x1={350} y1={156} x2={350} y2={196} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <line x1={615} y1={156} x2={615} y2={196} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />

    {/* Data File */}
    <text x={18} y={190} fontSize={10.5} fontWeight={700} fill="#0f172a">
      STUDENT Data File (b = ceil(16,000 / 12) = 1,334 unspanned blocks · R = 80 B · 40 B unused)
    </text>
    <SvgBox x={18} y={200} w={176} h={42} title="Data Blk 1" subtitle="Records 1..12" tone="neutral" fontSize={10.5} />
    <SvgBox x={262} y={200} w={180} h={42} title="Data Blk k" subtitle="12 records/block" tone="neutral" fontSize={10.5} />
    <SvgBox x={524} y={200} w={178} h={42} title="Data Blk 1334" subtitle="Records 15,997..16,000" tone="neutral" fontSize={10.5} />
  </DiagramFrame>
);

export const BPlusA1Q5bDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="B+ Tree (m = 3) After Insertions vs. Final State After Deletions — A1+TA1 Q5(b)"
    caption={
      caption ??
      'Insert [10,20,5,15,25,30,2] reaches 5 linked leaves; Delete 5, 20, 15 triggers leaf borrow (25) and merge (separator 25 dropped).'
    }
    viewBox="0 0 740 318"
  >
    {/* Top Tree: After Insertions */}
    <rect x={14} y={12} width={712} height={142} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={28} y={30} fontSize={10.5} fontWeight={700} fill="#0c4a6e">
      Phase 1: After Insertions [10, 20, 5, 15, 25, 30, 2]
    </text>
    <SvgBox x={316} y={36} w={108} h={24} title="Root: [ 15 ]" tone="sky" fontSize={10.5} rx={4} />
    <line x1={340} y1={60} x2={198} y2={76} stroke="#334155" strokeWidth={1.3} />
    <line x1={400} y1={60} x2={520} y2={76} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={136} y={76} w={116} h={24} title="[ 10 ]" tone="neutral" fontSize={10} rx={4} />
    <SvgBox x={450} y={76} w={140} h={24} title="[ 20 | 25 ]" tone="neutral" fontSize={10} rx={4} />

    {/* Edges to leaves */}
    <line x1={164} y1={100} x2={92} y2={116} stroke="#334155" strokeWidth={1.2} />
    <line x1={222} y1={100} x2={242} y2={116} stroke="#334155" strokeWidth={1.2} />
    <line x1={476} y1={100} x2={376} y2={116} stroke="#334155" strokeWidth={1.2} />
    <line x1={520} y1={100} x2={504} y2={116} stroke="#334155" strokeWidth={1.2} />
    <line x1={564} y1={100} x2={640} y2={116} stroke="#334155" strokeWidth={1.2} />

    {/* 5 Leaves */}
    <SvgBox x={42} y={118} w={96} h={24} title="[ 2 , 5 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={194} y={118} w={92} h={24} title="[ 10 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={330} y={118} w={92} h={24} title="[ 15 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={458} y={118} w={92} h={24} title="[ 20 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={586} y={118} w={106} h={24} title="[ 25 , 30 ]" tone="emerald" fontSize={10} rx={4} />

    <line x1={138} y1={130} x2={190} y2={130} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
    <line x1={286} y1={130} x2={326} y2={130} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
    <line x1={422} y1={130} x2={454} y2={130} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
    <line x1={550} y1={130} x2={582} y2={130} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />

    {/* Bottom Tree: After Deletions */}
    <rect x={14} y={164} width={712} height={142} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={28} y={182} fontSize={10.5} fontWeight={700} fill="#92400e">
      Phase 2: Final Tree After Delete 5 → Delete 20 (Borrow 25) → Delete 15 (Merge [15] + [25])
    </text>
    <SvgBox x={316} y={190} w={108} h={24} title="Root: [ 25 ]" tone="amber" fontSize={10.5} rx={4} />
    <line x1={340} y1={214} x2={208} y2={230} stroke="#334155" strokeWidth={1.3} />
    <line x1={400} y1={214} x2={530} y2={230} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={148} y={230} w={120} h={24} title="[ 10 ]" tone="neutral" fontSize={10} rx={4} />
    <SvgBox x={470} y={230} w={120} h={24} title="[ 30 ]" tone="neutral" fontSize={10} rx={4} />

    <line x1={182} y1={254} x2={128} y2={270} stroke="#334155" strokeWidth={1.2} />
    <line x1={234} y1={254} x2={288} y2={270} stroke="#334155" strokeWidth={1.2} />
    <line x1={504} y1={254} x2={450} y2={270} stroke="#334155" strokeWidth={1.2} />
    <line x1={556} y1={254} x2={610} y2={270} stroke="#334155" strokeWidth={1.2} />

    <SvgBox x={80} y={272} w={96} h={24} title="[ 2 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={240} y={272} w={96} h={24} title="[ 10 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={402} y={272} w={96} h={24} title="[ 25 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={562} y={272} w={96} h={24} title="[ 30 ]" tone="emerald" fontSize={10} rx={4} />

    <line x1={176} y1={284} x2={236} y2={284} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
    <line x1={336} y1={284} x2={398} y2={284} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
    <line x1={498} y1={284} x2={558} y2={284} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
  </DiagramFrame>
);

export const BPlusA2Q10aDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="B+ Tree (m = 3) Height-Shrink & Final State — A2+TA2 Q10(a)"
    caption={
      caption ??
      'Delete 10 collapses internal level (height 3 -> 2); subsequent inserts (30,35,40) grow back to height 3 and Delete 20 yields Root [30].'
    }
    viewBox="0 0 740 278"
  >
    {/* Top: Height Shrink after Delete 10 */}
    <rect x={14} y={12} width={712} height={106} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={28} y={30} fontSize={10.5} fontWeight={700} fill="#92400e">
      Key Milestone: After Delete 10 (Leaf Merge + Internal Collapse Shrinks Height 3 → 2)
    </text>
    <SvgBox x={294} y={38} w={152} h={24} title="Root: [ 15 | 20 ]" tone="amber" fontSize={10.5} rx={4} />
    <line x1={328} y1={62} x2={208} y2={80} stroke="#334155" strokeWidth={1.3} />
    <line x1={370} y1={62} x2={370} y2={80} stroke="#334155" strokeWidth={1.3} />
    <line x1={412} y1={62} x2={532} y2={80} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={156} y={82} w={104} h={24} title="[ 5 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={318} y={82} w={104} h={24} title="[ 15 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={480} y={82} w={116} h={24} title="[ 20 , 25 ]" tone="emerald" fontSize={10} rx={4} />
    <line x1={260} y1={94} x2={314} y2={94} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
    <line x1={422} y1={94} x2={476} y2={94} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />

    {/* Bottom: Final Tree */}
    <rect x={14} y={128} width={712} height={138} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={28} y={146} fontSize={10.5} fontWeight={700} fill="#0c4a6e">
      Final Tree (Height 3) After Ins 30, 35, 40 & Delete 20
    </text>
    <SvgBox x={316} y={154} w={108} h={24} title="Root: [ 30 ]" tone="sky" fontSize={10.5} rx={4} />
    <line x1={344} y1={178} x2={206} y2={192} stroke="#334155" strokeWidth={1.3} />
    <line x1={396} y1={178} x2={560} y2={192} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={142} y={192} w={128} h={24} title="[ 15 | 20 ]" tone="neutral" fontSize={10} rx={4} />
    <SvgBox x={504} y={192} w={112} h={24} title="[ 35 ]" tone="neutral" fontSize={10} rx={4} />

    <line x1={164} y1={216} x2={82} y2={230} stroke="#334155" strokeWidth={1.2} />
    <line x1={206} y1={216} x2={206} y2={230} stroke="#334155" strokeWidth={1.2} />
    <line x1={248} y1={216} x2={336} y2={230} stroke="#334155" strokeWidth={1.2} />
    <line x1={532} y1={216} x2={474} y2={230} stroke="#334155" strokeWidth={1.2} />
    <line x1={588} y1={216} x2={636} y2={230} stroke="#334155" strokeWidth={1.2} />

    <SvgBox x={36} y={232} w={92} h={24} title="[ 5 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={160} y={232} w={92} h={24} title="[ 15 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={290} y={232} w={92} h={24} title="[ 25 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={428} y={232} w={92} h={24} title="[ 30 ]" tone="emerald" fontSize={10} rx={4} />
    <SvgBox x={582} y={232} w={110} h={24} title="[ 35 , 40 ]" tone="emerald" fontSize={10} rx={4} />

    <line x1={128} y1={244} x2={156} y2={244} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
    <line x1={252} y1={244} x2={286} y2={244} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
    <line x1={382} y1={244} x2={424} y2={244} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
    <line x1={520} y1={244} x2={578} y2={244} stroke="#059669" strokeWidth={1.3} markerEnd="url(#arrow-emerald)" />
  </DiagramFrame>
);

export const QueryTreeA1Q6Diagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Heuristic Query Tree Optimization — A1+TA1 Q6 (Canonical → Optimized)"
    caption={
      caption ??
      'Pushing selections (σ) and projections (π) down toward leaves and replacing (× + σ) with Equi-Joins (⋈) minimizes intermediate tuples.'
    }
    viewBox="0 0 760 356"
  >
    {/* Left: Canonical Tree */}
    <rect x={14} y={12} width={302} height={332} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={28} y={32} fontSize={11} fontWeight={700} fill="#991b1b">
      PART A: Unoptimized Canonical Tree
    </text>
    <SvgBox x={56} y={48} w={218} h={30} title="π_{C.CName, A.Acc_No, T.Amount}" tone="neutral" fontSize={10} rx={4} />
    <line x1={165} y1={78} x2={165} y2={98} stroke="#334155" strokeWidth={1.4} />
    <SvgBox
      x={28}
      y={98}
      w={274}
      h={56}
      title="σ (5 Conjunctive AND Predicates)"
      subtitle="Join keys + Mumbai + Savings + Amt>100k"
      tone="rose"
      fontSize={10}
      subFontSize={8.8}
    />
    <line x1={165} y1={154} x2={165} y2={176} stroke="#334155" strokeWidth={1.4} />
    <circle cx={165} cy={190} r={14} fill="#ffffff" stroke="#334155" strokeWidth={1.5} />
    <text x={165} y={194} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">×</text>
    <line x1={154} y1={200} x2={106} y2={232} stroke="#334155" strokeWidth={1.3} />
    <line x1={176} y1={200} x2={244} y2={232} stroke="#334155" strokeWidth={1.3} />

    <circle cx={102} cy={244} r={14} fill="#ffffff" stroke="#334155" strokeWidth={1.5} />
    <text x={102} y={248} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">×</text>
    <SvgBox x={188} y={232} w={116} h={30} title="TRANSACTION (T)" tone="neutral" fontSize={9.5} rx={4} />

    <line x1={92} y1={255} x2={68} y2={292} stroke="#334155" strokeWidth={1.3} />
    <line x1={112} y1={255} x2={148} y2={292} stroke="#334155" strokeWidth={1.3} />
    <SvgBox x={22} y={294} w={104} h={30} title="CUSTOMER (C)" tone="neutral" fontSize={9.5} rx={4} />
    <SvgBox x={136} y={294} w={104} h={30} title="ACCOUNT (A)" tone="neutral" fontSize={9.5} rx={4} />

    {/* Right: Optimized Tree */}
    <rect x={332} y={12} width={414} height={332} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={346} y={32} fontSize={11} fontWeight={700} fill="#047857">
      PART B: Final Optimized Query Tree (Push σ, Convert ⋈, Push π)
    </text>

    <SvgBox x={428} y={44} w={222} h={28} title="π_{C.CName, A.Acc_No, T.Amount}" tone="sky" fontSize={10} rx={4} />
    <line x1={539} y1={72} x2={539} y2={88} stroke="#334155" strokeWidth={1.4} />
    <SvgBox x={460} y={88} w={158} h={26} title="⋈_{A.Acc_No = T.Acc_No}" tone="emerald" fontSize={10} rx={4} />

    <line x1={496} y1={114} x2={440} y2={132} stroke="#334155" strokeWidth={1.3} />
    <line x1={582} y1={114} x2={654} y2={132} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={368} y={132} w={144} h={24} title="π_{C.CName, A.Acc_No}" tone="sky" fontSize={9.5} rx={4} />
    <SvgBox x={586} y={132} w={144} h={24} title="π_{T.Acc_No, T.Amount}" tone="sky" fontSize={9.5} rx={4} />

    <line x1={440} y1={156} x2={440} y2={172} stroke="#334155" strokeWidth={1.3} />
    <line x1={658} y1={156} x2={658} y2={212} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={364} y={172} w={154} h={26} title="⋈_{C.Cust_ID = A.Cust_ID}" tone="emerald" fontSize={9.5} rx={4} />
    <SvgBox x={590} y={214} w={138} h={26} title="σ_{T.Amount > 100000}" tone="amber" fontSize={9.5} rx={4} />
    <line x1={658} y1={240} x2={658} y2={266} stroke="#334155" strokeWidth={1.3} />
    <SvgBox x={596} y={268} w={126} h={28} title="TRANSACTION (T)" tone="neutral" fontSize={9.5} rx={4} />

    <line x1={408} y1={198} x2={394} y2={214} stroke="#334155" strokeWidth={1.3} />
    <line x1={472} y1={198} x2={514} y2={214} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={342} y={214} w={108} h={24} title="π_{Cust_ID, CName}" tone="sky" fontSize={9} rx={4} />
    <SvgBox x={458} y={214} w={118} h={24} title="π_{Acc_No, Cust_ID}" tone="sky" fontSize={9} rx={4} />

    <line x1={396} y1={238} x2={396} y2={256} stroke="#334155" strokeWidth={1.3} />
    <line x1={517} y1={238} x2={517} y2={256} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={340} y={256} w={112} h={28} title="σ_{Branch='MUM01'}" tone="amber" fontSize={9} rx={4} />
    <SvgBox x={460} y={256} w={116} h={28} title="σ_{Type='Savings'}" tone="amber" fontSize={9} rx={4} />

    <line x1={396} y1={284} x2={396} y2={302} stroke="#334155" strokeWidth={1.3} />
    <line x1={518} y1={284} x2={518} y2={302} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={344} y={302} w={104} h={28} title="CUSTOMER (C)" tone="neutral" fontSize={9.5} rx={4} />
    <SvgBox x={466} y={302} w={104} h={28} title="ACCOUNT (A)" tone="neutral" fontSize={9.5} rx={4} />
  </DiagramFrame>
);

export const QueryTreeA2Q10bDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Final Optimized Query Tree — A2+TA2 Q10(b) (Online Shopping)"
    caption={
      caption ??
      'Leaf filter σ_{City=\'Chennai\'} shrinks CUSTOMER before joining ORDERS and PRODUCT; pushed π nodes retain join keys only until each join finishes.'
    }
    viewBox="0 0 680 330"
  >
    <SvgBox x={228} y={14} w={224} h={28} title="π_{C.Name, P.Product_Name}" tone="sky" fontSize={10.5} rx={4} />
    <line x1={340} y1={42} x2={340} y2={60} stroke="#334155" strokeWidth={1.4} />
    <SvgBox x={242} y={60} w={196} h={28} title="⋈_{O.Product_ID = P.Product_ID}" tone="emerald" fontSize={10} rx={4} />

    <line x1={296} y1={88} x2={220} y2={112} stroke="#334155" strokeWidth={1.3} />
    <line x1={396} y1={88} x2={528} y2={112} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={138} y={112} w={164} h={26} title="π_{C.Name, O.Product_ID}" tone="sky" fontSize={9.5} rx={4} />
    <SvgBox x={440} y={112} w={178} h={26} title="π_{Product_ID, Product_Name}" tone="sky" fontSize={9.5} rx={4} />

    <line x1={220} y1={138} x2={220} y2={158} stroke="#334155" strokeWidth={1.3} />
    <line x1={529} y1={138} x2={529} y2={208} stroke="#334155" strokeWidth={1.3} />
    <SvgBox x={464} y={208} w={130} h={30} title="PRODUCT (P)" tone="neutral" fontSize={10} rx={4} />

    <SvgBox x={134} y={158} w={172} h={28} title="⋈_{C.Cust_ID = O.Cust_ID}" tone="emerald" fontSize={9.5} rx={4} />
    <line x1={182} y1={186} x2={122} y2={208} stroke="#334155" strokeWidth={1.3} />
    <line x1={258} y1={186} x2={326} y2={208} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={50} y={208} w={144} h={26} title="π_{Cust_ID, Name}" tone="sky" fontSize={9.5} rx={4} />
    <SvgBox x={242} y={208} w={168} h={26} title="π_{Cust_ID, Product_ID}" tone="sky" fontSize={9.5} rx={4} />

    <line x1={122} y1={234} x2={122} y2={252} stroke="#334155" strokeWidth={1.3} />
    <line x1={326} y1={234} x2={326} y2={262} stroke="#334155" strokeWidth={1.3} />

    <SvgBox x={48} y={252} w={148} h={26} title="σ_{C.City = 'Chennai'}" tone="amber" fontSize={9.5} rx={4} />
    <SvgBox x={266} y={262} w={120} h={30} title="ORDERS (O)" tone="neutral" fontSize={10} rx={4} />

    <line x1={122} y1={278} x2={122} y2={290} stroke="#334155" strokeWidth={1.3} />
    <SvgBox x={56} y={290} w={132} h={28} title="CUSTOMER (C)" tone="neutral" fontSize={10} rx={4} />
  </DiagramFrame>
);
