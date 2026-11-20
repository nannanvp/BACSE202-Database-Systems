import React from 'react';
import { DbCylinder, DiagramFrame, SvgBox } from './DiagramPrimitives';

export const DdbConceptDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Conceptual View of a Distributed Database System (DDBMS)"
    caption={
      caption ??
      'Global applications query a single logical database while the DDBMS routes fragments across networked sites invisibly.'
    }
    viewBox="0 0 700 245"
  >
    <SvgBox
      x={230}
      y={14}
      w={240}
      h={44}
      title="Global User / Application"
      subtitle="Sees ONE logical database"
      tone="sky"
    />
    <line x1={350} y1={58} x2={350} y2={88} stroke="#0284c7" strokeWidth={1.7} markerEnd="url(#arrow-sky)" />

    <SvgBox
      x={96}
      y={92}
      w={508}
      h={42}
      title="Communication Network & DDBMS Coordinator"
      subtitle="Enforces Location, Fragmentation & Replication Transparency"
      tone="neutral"
    />

    <line x1={160} y1={134} x2={160} y2={166} stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />
    <line x1={350} y1={134} x2={350} y2={166} stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />
    <line x1={540} y1={134} x2={540} y2={166} stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />

    <DbCylinder cx={160} y={170} w={132} h={58} label="Site 1 (DB_1)" tone="emerald" />
    <DbCylinder cx={350} y={170} w={132} h={58} label="Site 2 (DB_2)" tone="emerald" />
    <DbCylinder cx={540} y={170} w={132} h={58} label="Site 3 (DB_3)" tone="emerald" />
  </DiagramFrame>
);

export const HardwareArchDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Hardware Memory-Sharing Architectures (Shared Memory vs. Disk vs. Nothing)"
    caption={
      caption ??
      'Shared-Nothing eliminates memory-bus and disk-interconnect contention by giving every node private CPU, RAM, and Disk.'
    }
    viewBox="0 0 740 245"
  >
    {/* 1. Shared Memory */}
    <rect x={14} y={14} width={226} height={216} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={127} y={34} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">
      1. Shared Memory (Oracle 11g)
    </text>
    {[34, 88, 142, 196].map((x, idx) => (
      <g key={idx}>
        <SvgBox x={x - 16} y={48} w={32} h={24} title="P" tone="sky" fontSize={10.5} rx={4} />
        <line x1={x} y1={72} x2={x} y2={92} stroke="#334155" strokeWidth={1.3} />
      </g>
    ))}
    <line x1={34} y1={92} x2={196} y2={92} stroke="#0284c7" strokeWidth={2.2} />
    <line x1={115} y1={92} x2={115} y2={114} stroke="#334155" strokeWidth={1.5} />
    <SvgBox x={50} y={114} w={130} h={30} title="Global RAM (M)" tone="amber" fontSize={10.5} rx={4} />
    <line x1={115} y1={144} x2={115} y2={164} stroke="#334155" strokeWidth={1.5} />
    <DbCylinder cx={75} y={166} w={60} h={42} label="Disk" tone="neutral" />
    <DbCylinder cx={162} y={166} w={60} h={42} label="Disk" tone="neutral" />

    {/* 2. Shared Disk */}
    <rect x={256} y={14} width={228} height={216} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={370} y={34} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">
      2. Shared Disk (Oracle RAC)
    </text>
    {[290, 344, 398, 452].map((x, idx) => (
      <g key={idx}>
        <SvgBox x={x - 16} y={48} w={32} h={24} title="P" tone="sky" fontSize={10.5} rx={4} />
        <line x1={x} y1={72} x2={x} y2={92} stroke="#334155" strokeWidth={1.3} />
        <SvgBox x={x - 16} y={92} w={32} h={24} title="M" tone="amber" fontSize={10.5} rx={4} />
        <line x1={x} y1={116} x2={x} y2={140} stroke="#334155" strokeWidth={1.3} />
      </g>
    ))}
    <line x1={290} y1={140} x2={452} y2={140} stroke="#0284c7" strokeWidth={2.2} />
    <line x1={330} y1={140} x2={330} y2={164} stroke="#334155" strokeWidth={1.4} />
    <line x1={412} y1={140} x2={412} y2={164} stroke="#334155" strokeWidth={1.4} />
    <DbCylinder cx={330} y={166} w={66} h={42} label="Disk" tone="neutral" />
    <DbCylinder cx={412} y={166} w={66} h={42} label="Disk" tone="neutral" />

    {/* 3. Shared Nothing */}
    <rect x={500} y={14} width={226} height={216} rx={8} fill="#ecfdf5" stroke="#a7f3d0" strokeWidth={1.4} />
    <text x={613} y={34} textAnchor="middle" fontSize={11} fontWeight={700} fill="#064e3b">
      3. Shared Nothing (NoSQL Scale-Out)
    </text>
    <line x1={532} y1={60} x2={694} y2={60} stroke="#059669" strokeWidth={2.2} />
    {[532, 586, 640, 694].map((x, idx) => (
      <g key={idx}>
        <SvgBox x={x - 16} y={48} w={32} h={24} title="P" tone="sky" fontSize={10.5} rx={4} />
        <line x1={x} y1={72} x2={x} y2={92} stroke="#334155" strokeWidth={1.3} />
        <SvgBox x={x - 16} y={92} w={32} h={24} title="M" tone="amber" fontSize={10.5} rx={4} />
        <line x1={x} y1={116} x2={x} y2={138} stroke="#334155" strokeWidth={1.3} />
        <DbCylinder cx={x} y={140} w={38} h={42} label="D" tone="emerald" />
      </g>
    ))}
    <text x={613} y={208} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="#047857">
      P = Processor · M = Memory · D = Disk
    </text>
  </DiagramFrame>
);

export const TwoPcSequenceDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Two-Phase Commit (2PC) Atomic Protocol Sequence"
    caption={
      caption ??
      'Coordinator crash after participants log <ready T> leaves participants uncertain and BLOCKED holding locks until recovery.'
    }
    viewBox="0 0 700 264"
  >
    {/* Lifelines */}
    <SvgBox x={110} y={12} w={150} h={34} title="Coordinator (C)" tone="sky" />
    <SvgBox x={440} y={12} w={156} h={34} title="Participants (P_i)" tone="emerald" />
    <line x1={185} y1={46} x2={185} y2={248} stroke="#64748b" strokeWidth={1.8} strokeDasharray="4 3" />
    <line x1={518} y1={46} x2={518} y2={248} stroke="#64748b" strokeWidth={1.8} strokeDasharray="4 3" />

    {/* Phase labels */}
    <rect x={16} y={58} width={80} height={82} rx={6} fill="#f0f9ff" stroke="#bae6fd" strokeWidth={1} />
    <text x={56} y={96} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0369a1">PHASE 1</text>
    <text x={56} y={110} textAnchor="middle" fontSize={9} fill="#0369a1">(Prepare)</text>

    <rect x={16} y={150} width={80} height={94} rx={6} fill="#ecfdf5" stroke="#a7f3d0" strokeWidth={1} />
    <text x={56} y={194} textAnchor="middle" fontSize={10} fontWeight={700} fill="#047857">PHASE 2</text>
    <text x={56} y={208} textAnchor="middle" fontSize={9} fill="#047857">(Decision)</text>

    {/* 1. PREPARE */}
    <line x1={185} y1={76} x2={512} y2={76} stroke="#0284c7" strokeWidth={1.7} markerEnd="url(#arrow-sky)" />
    <text x={352} y={68} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#0c4a6e">1. PREPARE</text>
    <text x={530} y={80} fontSize={9.5} fill="#334155">Force-write UNDO/REDO to WAL</text>

    {/* 2. VOTE */}
    <line x1={518} y1={120} x2={191} y2={120} stroke="#0284c7" strokeWidth={1.7} markerEnd="url(#arrow-sky)" />
    <text x={352} y={112} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#0c4a6e">
      2. VOTE-COMMIT / VOTE-ABORT
    </text>
    <text x={530} y={124} fontSize={9.5} fill="#92400e">Force-log &lt;ready T&gt; (Uncertain!)</text>

    {/* Coordinator Force-write */}
    <rect x={106} y={144} width={158} height={28} rx={4} fill="#fffbeb" stroke="#d97706" strokeWidth={1.3} />
    <text x={185} y={162} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#92400e">
      Force-log COMMIT / ABORT
    </text>

    {/* 3. GLOBAL DECISION */}
    <line x1={185} y1={194} x2={512} y2={194} stroke="#059669" strokeWidth={1.7} markerEnd="url(#arrow-emerald)" />
    <text x={352} y={186} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#064e3b">
      3. GLOBAL-COMMIT / GLOBAL-ABORT
    </text>
    <text x={530} y={198} fontSize={9.5} fill="#334155">Apply & release locks</text>

    {/* 4. ACK */}
    <line x1={518} y1={234} x2={191} y2={234} stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />
    <text x={352} y={226} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#0f172a">4. ACK</text>
    <text x={530} y={238} fontSize={9.5} fill="#334155">Write END record to WAL</text>
  </DiagramFrame>
);

export const CapTriangleDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Brewer's CAP Theorem Geometry (Pick 2 — Partition P Forces CP vs. AP)"
    caption={
      caption ??
      'When network partitions (P) happen in distributed systems, engines either preserve Consistency (CP) or Availability (AP).'
    }
    viewBox="0 0 720 264"
  >
    {/* Triangle */}
    <polygon
      points="360,46 218,224 502,224"
      fill="#f8fafc"
      stroke="#334155"
      strokeWidth={2}
    />

    {/* Vertices */}
    <SvgBox x={282} y={14} w={156} h={38} title="Consistency (C)" subtitle="Linearizable latest read" tone="sky" fontSize={11.5} subFontSize={9} />
    <SvgBox x={136} y={214} w={162} h={38} title="Availability (A)" subtitle="Non-error response" tone="emerald" fontSize={11.5} subFontSize={9} />
    <SvgBox x={422} y={214} w={172} h={38} title="Partition Tolerance (P)" subtitle="Survives dropped links" tone="amber" fontSize={11.5} subFontSize={9} />

    {/* Edge Callouts */}
    <SvgBox
      x={18}
      y={94}
      w={198}
      h={72}
      title="CA (Single-Node / No P)"
      subtitle="MySQL, PostgreSQL, SQL Server, MariaDB"
      tone="neutral"
      fontSize={11}
      subFontSize={9.5}
    />
    <SvgBox
      x={504}
      y={94}
      w={198}
      h={72}
      title="CP (Rejects Stale Reads)"
      subtitle="MongoDB, HBase, Redis, Google Bigtable"
      tone="sky"
      fontSize={11}
      subFontSize={9.5}
    />
    <rect x={282} y={168} width={156} height={42} rx={6} fill="#ecfdf5" stroke="#059669" strokeWidth={1.3} />
    <text x={360} y={185} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#064e3b">
      AP (Eventual Sync)
    </text>
    <text x={360} y={200} textAnchor="middle" fontSize={9} fill="#047857">
      Cassandra, DynamoDB, CouchDB
    </text>

    {/* Center text */}
    <text x={360} y={136} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569">
      Pick at most 2
    </text>
    <text x={360} y={150} textAnchor="middle" fontSize={9.5} fill="#64748b">
      (Networks partition ⇒ CP or AP)
    </text>
  </DiagramFrame>
);

export const MongodbShardingDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Sharded Primary-Replica Architecture (MongoDB Router + Replicated Shards)"
    caption={
      caption ??
      'Sharding partitions storage & writes horizontally across shards while each shard runs a Replica Set for high availability.'
    }
    viewBox="0 0 700 250"
  >
    <SvgBox x={245} y={14} w={210} h={38} title="Client Application" tone="neutral" fontSize={11.5} />
    <line x1={350} y1={52} x2={350} y2={76} stroke="#334155" strokeWidth={1.6} markerEnd="url(#arrow-slate)" />

    <SvgBox
      x={210}
      y={80}
      w={280}
      h={44}
      title="Query Router (mongos)"
      subtitle="Routes requests using Shard Key"
      tone="sky"
    />

    <path d="M 350 124 L 350 144 L 122 144 L 122 164" fill="none" stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />
    <line x1={350} y1={124} x2={350} y2={164} stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />
    <path d="M 350 144 L 578 144 L 578 164" fill="none" stroke="#0284c7" strokeWidth={1.6} markerEnd="url(#arrow-sky)" />

    <SvgBox
      x={32}
      y={168}
      w={180}
      h={66}
      title="Shard 1 (IDs 1–1000)"
      subtitle="Replica Set (Pri + 2 Sec)"
      tone="emerald"
      fontSize={11}
      subFontSize={9.5}
    />
    <SvgBox
      x={260}
      y={168}
      w={180}
      h={66}
      title="Shard 2 (IDs 1001–2000)"
      subtitle="Replica Set (Pri + 2 Sec)"
      tone="emerald"
      fontSize={11}
      subFontSize={9.5}
    />
    <SvgBox
      x={488}
      y={168}
      w={180}
      h={66}
      title="Shard 3 (IDs 2001–3000)"
      subtitle="Replica Set (Pri + 2 Sec)"
      tone="emerald"
      fontSize={11}
      subFontSize={9.5}
    />
  </DiagramFrame>
);

export const MapReducePipelineDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="MapReduce Parallel Execution Pipeline (Map → Shuffle & Sort → Reduce)"
    caption={
      caption ??
      'JobTracker schedules Map tasks locally on shards; Partitioner groups identical keys before Reducers compute final aggregates.'
    }
    viewBox="0 0 740 200"
  >
    {/* Headers */}
    <text x={82} y={24} textAnchor="middle" fontSize={10} fontWeight={700} fill="#475569">INPUT CHUNKS</text>
    <text x={256} y={24} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0369a1">MAP</text>
    <text x={450} y={24} textAnchor="middle" fontSize={10} fontWeight={700} fill="#92400e">SHUFFLE &amp; SORT</text>
    <text x={644} y={24} textAnchor="middle" fontSize={10} fontWeight={700} fill="#047857">REDUCE OUTPUT</text>

    {/* Input */}
    <SvgBox x={16} y={44} w={132} h={42} title="Chunk 1" subtitle='"CSE, ECE"' tone="neutral" fontSize={10.5} />
    <SvgBox x={16} y={118} w={132} h={42} title="Chunk 2" subtitle='"CSE, IT"' tone="neutral" fontSize={10.5} />

    {/* Map */}
    <line x1={148} y1={65} x2={182} y2={65} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />
    <line x1={148} y1={139} x2={182} y2={139} stroke="#334155" strokeWidth={1.5} markerEnd="url(#arrow-slate)" />

    <SvgBox x={186} y={38} w={140} h={52} title="Mapper 1" subtitle='("CSE",1), ("ECE",1)' tone="sky" fontSize={10.5} />
    <SvgBox x={186} y={112} w={140} h={52} title="Mapper 2" subtitle='("CSE",1), ("IT",1)' tone="sky" fontSize={10.5} />

    {/* Shuffle routing */}
    <line x1={326} y1={52} x2={364} y2={52} stroke="#d97706" strokeWidth={1.4} markerEnd="url(#arrow-amber)" />
    <line x1={326} y1={74} x2={364} y2={106} stroke="#d97706" strokeWidth={1.4} markerEnd="url(#arrow-amber)" />
    <line x1={326} y1={126} x2={364} y2={60} stroke="#d97706" strokeWidth={1.4} markerEnd="url(#arrow-amber)" />
    <line x1={326} y1={148} x2={364} y2={156} stroke="#d97706" strokeWidth={1.4} markerEnd="url(#arrow-amber)" />

    {/* Shuffle & Sort */}
    <SvgBox x={368} y={36} w={164} h={34} title='("CSE", [1, 1])' tone="amber" fontSize={10.5} rx={5} />
    <SvgBox x={368} y={90} w={164} h={34} title='("ECE", [1])' tone="amber" fontSize={10.5} rx={5} />
    <SvgBox x={368} y={142} w={164} h={34} title='("IT", [1])' tone="amber" fontSize={10.5} rx={5} />

    {/* Reduce */}
    <line x1={532} y1={53} x2={566} y2={53} stroke="#059669" strokeWidth={1.5} markerEnd="url(#arrow-emerald)" />
    <line x1={532} y1={107} x2={566} y2={107} stroke="#059669" strokeWidth={1.5} markerEnd="url(#arrow-emerald)" />
    <line x1={532} y1={159} x2={566} y2={159} stroke="#059669" strokeWidth={1.5} markerEnd="url(#arrow-emerald)" />

    <SvgBox x={570} y={36} w={148} h={34} title='("CSE", 2)' tone="emerald" fontSize={11} rx={5} />
    <SvgBox x={570} y={90} w={148} h={34} title='("ECE", 1)' tone="emerald" fontSize={11} rx={5} />
    <SvgBox x={570} y={142} w={148} h={34} title='("IT", 1)' tone="emerald" fontSize={11} rx={5} />
  </DiagramFrame>
);

export const ConsistentHashRingDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Consistent Hashing Ring [0 .. 2³² − 1] (Amazon Dynamo / Voldemort)"
    caption={
      caption ??
      'Adding Node D only splits keys on its immediate clockwise/preceding arc instead of rehashing the entire cluster.'
    }
    viewBox="0 0 700 226"
  >
    {/* Hash Ring */}
    <circle cx={190} cy={114} r={72} fill="none" stroke="#cbd5e1" strokeWidth={8} />
    <circle cx={190} cy={114} r={72} fill="none" stroke="#0284c7" strokeWidth={1.6} strokeDasharray="6 4" />
    <text x={190} y={108} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">Hash Ring</text>
    <text x={190} y={124} textAnchor="middle" fontSize={9.5} fill="#475569">[0 .. 2³² − 1]</text>

    {/* Nodes on ring */}
    <circle cx={190} cy={42} r={16} fill="#f0f9ff" stroke="#0284c7" strokeWidth={1.8} />
    <text x={190} y={46} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0c4a6e">A</text>

    <circle cx={262} cy={114} r={16} fill="#f0f9ff" stroke="#0284c7" strokeWidth={1.8} />
    <text x={262} y={118} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0c4a6e">B</text>

    <circle cx={156} cy={178} r={16} fill="#f0f9ff" stroke="#0284c7" strokeWidth={1.8} />
    <text x={156} y={182} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0c4a6e">C</text>

    <circle cx={124} cy={82} r={16} fill="#ecfdf5" stroke="#059669" strokeWidth={2} />
    <text x={124} y={86} textAnchor="middle" fontSize={11} fontWeight={700} fill="#064e3b">D</text>
    <text x={98} y={85} textAnchor="end" fontSize={9.5} fontWeight={700} fill="#047857">New Node D</text>

    {/* Key examples */}
    <SvgBox
      x={314}
      y={26}
      w={368}
      h={52}
      title="Clockwise Key Assignment"
      subtitle="Keys in arc 1 → Node A · arc 2 → Node B · arc 3 → Node C"
      tone="sky"
      fontSize={11}
      subFontSize={9.5}
    />
    <SvgBox
      x={314}
      y={94}
      w={368}
      h={52}
      title="Minimal Disruption on Scale-Out"
      subtitle="Adding Node D only splits its adjacent arc (zero full rehash)"
      tone="emerald"
      fontSize={11}
      subFontSize={9.5}
    />
    <SvgBox
      x={314}
      y={162}
      w={368}
      h={44}
      title="Virtual Nodes (vnodes)"
      subtitle="High-capacity servers take extra arcs for even workload balance"
      tone="neutral"
      fontSize={10.5}
      subFontSize={9.5}
    />
  </DiagramFrame>
);
