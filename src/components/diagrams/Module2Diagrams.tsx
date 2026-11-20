import React from 'react';
import {
  ChenAttr,
  ChenDiamond,
  ChenEntity,
  DiagramFrame,
  DoubleLine,
  SvgBox,
} from './DiagramPrimitives';

export const CardinalityMinMaxDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Cardinality Ratio (1:N) vs. Structural (min, max) Notation"
    caption={
      caption ??
      'Single line on GUEST shows partial participation (0..N); double line on BOOKING shows total participation (1..1).'
    }
    viewBox="0 0 700 194"
  >
    {/* GUEST entity */}
    <ChenEntity cx={115} cy={60} w={120} h={42} label="GUEST" tone="sky" />
    {/* Partial single line */}
    <line x1={175} y1={60} x2={290} y2={60} stroke="#334155" strokeWidth={1.6} />
    <text x={200} y={48} fontSize={10.5} fontWeight={700} fill="#0369a1">
      (0, N)
    </text>
    <text x={274} y={48} fontSize={11} fontWeight={700} fill="#0f172a">
      1
    </text>

    {/* MAKES diamond */}
    <ChenDiamond cx={350} cy={60} rx={58} ry={28} label="MAKES" tone="neutral" fontSize={10.5} />

    {/* Total double line */}
    <DoubleLine x1={408} y1={60} x2={522} y2={60} stroke="#059669" />
    <text x={422} y={48} fontSize={11} fontWeight={700} fill="#0f172a">
      N
    </text>
    <text x={482} y={48} fontSize={10.5} fontWeight={700} fill="#047857">
      (1, 1)
    </text>

    {/* BOOKING entity */}
    <ChenEntity cx={586} cy={60} w={128} h={42} label="BOOKING" tone="emerald" />

    {/* Captions beneath lines */}
    <text x={228} y={96} textAnchor="middle" fontSize={9.5} fill="#475569">
      Single line = Partial (min 0)
    </text>
    <text x={468} y={96} textAnchor="middle" fontSize={9.5} fill="#047857">
      Double line = Total (min 1)
    </text>

    {/* Rule of thumb box */}
    <rect x={28} y={114} width={644} height={64} rx={6} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={44} y={134} fontSize={10.5} fontWeight={700} fill="#0f172a">
      Rule of Thumb to Avoid Swapping 1 and N:
    </text>
    <text x={44} y={151} fontSize={10} fill="#334155">
      • Cardinality Ratio (1 : N): &quot;1 BOOKING has how many GUESTs?&quot; → 1 (write &apos;1&apos; on GUEST side)
    </text>
    <text x={44} y={166} fontSize={10} fill="#334155">
      • Structural (min, max) next to E: &quot;1 instance of E enters relationship how many times?&quot; → GUEST=(0,N), BOOKING=(1,1)
    </text>
  </DiagramFrame>
);

export const HotelEerDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Chen ER / EER Diagram — A2+TA2 Q3 Hotel Management System"
    caption={
      caption ??
      'Includes weak entity BED (double rectangle, dashed partial key), double total participation lines, and (d) total specialization.'
    }
    viewBox="0 0 760 430"
  >
    {/* GUEST & Attributes */}
    <ChenAttr cx={64} cy={30} rx={42} ry={12} label="Guest_ID" keyAttr />
    <ChenAttr cx={158} cy={30} rx={36} ry={12} label="Name" />
    <ChenAttr cx={64} cy={120} rx={34} ry={12} label="Phone" />
    <ChenAttr cx={158} cy={120} rx={34} ry={12} label="Email" />
    <line x1={64} y1={42} x2={96} y2={62} stroke="#64748b" strokeWidth={1.1} />
    <line x1={158} y1={42} x2={126} y2={62} stroke="#64748b" strokeWidth={1.1} />
    <line x1={64} y1={108} x2={96} y2={92} stroke="#64748b" strokeWidth={1.1} />
    <line x1={158} y1={108} x2={126} y2={92} stroke="#64748b" strokeWidth={1.1} />
    <ChenEntity cx={112} cy={76} w={96} h={34} label="GUEST" tone="sky" />

    {/* GUEST -- MAKES == BOOKING */}
    <line x1={160} y1={76} x2={228} y2={76} stroke="#334155" strokeWidth={1.4} />
    <text x={175} y={69} fontSize={10} fontWeight={700} fill="#0f172a">1</text>
    <ChenDiamond cx={274} cy={76} rx={46} ry={22} label="MAKES" />
    <DoubleLine x1={320} y1={76} x2={382} y2={76} stroke="#0f172a" />
    <text x={338} y={67} fontSize={10} fontWeight={700} fill="#0f172a">N</text>

    {/* BOOKING & Attributes */}
    <ChenAttr cx={402} cy={24} rx={44} ry={12} label="Booking_ID" keyAttr />
    <ChenAttr cx={506} cy={24} rx={50} ry={12} label="Booking_Date" />
    <ChenAttr cx={612} cy={40} rx={46} ry={12} label="Check_In" />
    <ChenAttr cx={612} cy={104} rx={48} ry={12} label="Check_Out" />
    <line x1={402} y1={36} x2={425} y2={58} stroke="#64748b" strokeWidth={1.1} />
    <line x1={506} y1={36} x2={465} y2={58} stroke="#64748b" strokeWidth={1.1} />
    <line x1={566} y1={42} x2={495} y2={68} stroke="#64748b" strokeWidth={1.1} />
    <line x1={564} y1={102} x2={495} y2={84} stroke="#64748b" strokeWidth={1.1} />
    <ChenEntity cx={440} cy={76} w={114} h={36} label="BOOKING" tone="sky" />

    {/* BOOKING == RESERVES -- ROOM */}
    <DoubleLine x1={465} y1={94} x2={520} y2={166} stroke="#0f172a" />
    <text x={476} y={136} fontSize={10} fontWeight={700} fill="#0f172a">M</text>
    <ChenDiamond cx={552} cy={186} rx={52} ry={22} label="RESERVES" />
    <line x1={604} y1={186} x2={644} y2={186} stroke="#334155" strokeWidth={1.4} />
    <text x={616} y={178} fontSize={10} fontWeight={700} fill="#0f172a">N</text>

    {/* ROOM & Attributes (clear of ROOM == HAS_BED vertical double line at x=692) */}
    <ChenAttr cx={632} cy={130} rx={42} ry={12} label="Room_No" keyAttr />
    <ChenAttr cx={718} cy={130} rx={32} ry={12} label="Tariff" />
    <ChenAttr cx={614} cy={236} rx={44} ry={12} label="Room_Type" />
    <line x1={636} y1={142} x2={672} y2={169} stroke="#64748b" strokeWidth={1.1} />
    <line x1={716} y1={142} x2={702} y2={169} stroke="#64748b" strokeWidth={1.1} />
    <line x1={624} y1={224} x2={668} y2={203} stroke="#64748b" strokeWidth={1.1} />
    <ChenEntity cx={692} cy={186} w={94} h={34} label="ROOM" tone="sky" />

    {/* BOOKING -- USES_SVC -- SERVICE (left-bottom) */}
    <line x1={396} y1={94} x2={318} y2={168} stroke="#334155" strokeWidth={1.4} />
    <text x={356} y={142} fontSize={10} fontWeight={700} fill="#0f172a">M</text>
    <ChenDiamond cx={286} cy={188} rx={52} ry={22} label="USES_SVC" />
    <ChenAttr cx={170} cy={170} rx={38} ry={12} label="Quantity" />
    <ChenAttr cx={170} cy={204} rx={46} ry={12} label="Service_Date" />
    <line x1={208} y1={174} x2={242} y2={182} stroke="#64748b" strokeWidth={1.1} />
    <line x1={216} y1={202} x2={244} y2={194} stroke="#64748b" strokeWidth={1.1} />
    <line x1={286} y1={210} x2={286} y2={252} stroke="#334155" strokeWidth={1.4} />
    <text x={294} y={236} fontSize={10} fontWeight={700} fill="#0f172a">N</text>

    {/* SERVICE */}
    <ChenEntity cx={286} cy={270} w={104} h={34} label="SERVICE" tone="sky" />
    <ChenAttr cx={180} cy={270} rx={42} ry={12} label="Service_ID" keyAttr />
    <ChenAttr cx={228} cy={320} rx={48} ry={12} label="Service_Name" />
    <ChenAttr cx={344} cy={320} rx={34} ry={12} label="Charge" />
    <line x1={222} y1={270} x2={234} y2={270} stroke="#64748b" strokeWidth={1.1} />
    <line x1={238} y1={308} x2={266} y2={287} stroke="#64748b" strokeWidth={1.1} />
    <line x1={332} y1={308} x2={308} y2={287} stroke="#64748b" strokeWidth={1.1} />

    {/* ROOM == HAS_BED == [[BED]] */}
    <DoubleLine x1={692} y1={203} x2={692} y2={264} stroke="#059669" />
    <text x={702} y={248} fontSize={10} fontWeight={700} fill="#047857">1</text>
    <ChenDiamond cx={692} cy={286} rx={52} ry={22} label="HAS_BED" identifying tone="emerald" fontSize={9.5} />
    <DoubleLine x1={640} y1={286} x2={582} y2={286} stroke="#059669" />
    <text x={614} y={276} fontSize={10} fontWeight={700} fill="#047857">N</text>

    {/* Weak Entity BED */}
    <ChenEntity cx={532} cy={286} w={98} h={38} label="BED" weak tone="emerald" />
    <ChenAttr cx={434} cy={286} rx={38} ry={12} label="Bed_No" partialKey />
    <line x1={472} y1={286} x2={483} y2={286} stroke="#64748b" strokeWidth={1.1} />

    {/* EER Disjoint Total Specialization on BED */}
    <DoubleLine x1={532} y1={305} x2={532} y2={336} stroke="#d97706" />
    <circle cx={532} cy={350} r={14} fill="#fffbeb" stroke="#d97706" strokeWidth={1.6} />
    <text x={532} y={354} textAnchor="middle" fontSize={12} fontWeight={700} fill="#92400e">
      d
    </text>
    <text x={604} y={348} fontSize={9.5} fontWeight={600} fill="#92400e">
      Disjoint + Total (==)
    </text>
    <line x1={520} y1={358} x2={466} y2={384} stroke="#334155" strokeWidth={1.4} />
    <line x1={544} y1={358} x2={600} y2={384} stroke="#334155" strokeWidth={1.4} />
    <ChenEntity cx={456} cy={402} w={112} h={30} label="SINGLE_BED" tone="amber" fontSize={10} />
    <ChenEntity cx={610} cy={402} w={116} h={30} label="DOUBLE_BED" tone="amber" fontSize={10} />
  </DiagramFrame>
);

export const EerAggregationLatticeDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="EER Aggregation (A1 Q3) vs. Shared Subclass Lattice (A2 Q9b)"
    caption={
      caption ??
      'Aggregation encapsulates a relationship + its entities into a composite event; a Lattice merges multiple superclasses via multiple inheritance.'
    }
    viewBox="0 0 740 245"
  >
    {/* Left Panel: Aggregation */}
    <rect x={14} y={14} width={368} height={218} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={28} y={32} fontSize={10.5} fontWeight={700} fill="#0f172a">
      1. EER Aggregation (Silberschatz / A1 Q3)
    </text>

    {/* Dashed Aggregation Boundary */}
    <rect x={28} y={42} width={340} height={96} rx={6} fill="#ffffff" stroke="#0284c7" strokeWidth={1.4} strokeDasharray="5 3" />
    <text x={40} y={56} fontSize={9} fontWeight={700} fill="#0369a1">
      AGGREGATED EVENT: AGRI_EXPERIMENT_EVENT
    </text>
    <ChenEntity cx={82} cy={80} w={92} h={28} label="AGRONOMIST" tone="neutral" fontSize={9.5} />
    <ChenEntity cx={314} cy={80} w={92} h={28} label="FARM_PARCEL" weak tone="emerald" fontSize={9.5} />
    <ChenDiamond cx={198} cy={80} rx={48} ry={18} label="FIELD_TRIALS" fontSize={8.5} />
    <line x1={128} y1={80} x2={150} y2={80} stroke="#334155" strokeWidth={1.3} />
    <line x1={246} y1={80} x2={268} y2={80} stroke="#334155" strokeWidth={1.3} />
    <line x1={198} y1={98} x2={198} y2={106} stroke="#334155" strokeWidth={1.3} />
    <ChenEntity cx={198} cy={120} w={74} h={26} label="CROP" tone="neutral" fontSize={9.5} />

    {/* Relationship from Aggregated Box */}
    <line x1={198} y1={138} x2={198} y2={150} stroke="#0284c7" strokeWidth={1.5} />
    <ChenDiamond cx={198} cy={168} rx={52} ry={18} label="ALLOCATED" tone="sky" fontSize={8.5} />
    <line x1={198} y1={186} x2={198} y2={195} stroke="#0284c7" strokeWidth={1.5} />
    <ChenEntity cx={198} cy={210} w={172} h={28} label="IRRIGATION_SCHEDULES" tone="sky" fontSize={9.5} />

    {/* Right Panel: Shared Subclass Lattice */}
    <rect x={398} y={14} width={328} height={218} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
    <text x={412} y={32} fontSize={10.5} fontWeight={700} fill="#0f172a">
      2. Shared Subclass / Lattice (Multiple Inheritance)
    </text>

    <ChenEntity cx={484} cy={76} w={112} h={34} label="CUSTOMER" tone="sky" fontSize={10.5} />
    <ChenEntity cx={640} cy={76} w={132} h={34} label="BUSINESS_SELLER" tone="sky" fontSize={10} />

    <line x1={484} y1={93} x2={542} y2={156} stroke="#059669" strokeWidth={1.7} markerEnd="url(#arrow-emerald)" />
    <line x1={640} y1={93} x2={582} y2={156} stroke="#059669" strokeWidth={1.7} markerEnd="url(#arrow-emerald)" />

    <text x={492} y={132} fontSize={9.5} fontWeight={700} fill="#047857">⊂</text>
    <text x={622} y={132} fontSize={9.5} fontWeight={700} fill="#047857">⊂</text>

    <SvgBox
      x={476}
      y={162}
      w={172}
      h={48}
      title="BUYER_SELLER"
      subtitle="Inherits attrs from BOTH!"
      tone="emerald"
      fontSize={11}
      subFontSize={9.5}
    />
  </DiagramFrame>
);

export const ArrmsEerDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Complete EER Diagram — A1+TA1 Q3 ARRMS (Agricultural Research System)"
    caption={
      caption ??
      'Combines Overlapping (o) Stakeholder, Total Disjoint (d) Crop, nested weak entities (FARM_PARCEL -> IOT_SOIL_SENSORS), and Ternary Aggregation.'
    }
    viewBox="0 0 760 400"
  >
    {/* Top Left: STAKEHOLDER hierarchy */}
    <ChenAttr cx={58} cy={24} rx={42} ry={11} label="National_ID" keyAttr fontSize={8.5} />
    <ChenAttr cx={180} cy={24} rx={58} ry={11} label="Assigned_Zones" multivalued fontSize={8.5} />
    <line x1={68} y1={35} x2={98} y2={48} stroke="#64748b" strokeWidth={1} />
    <line x1={164} y1={35} x2={132} y2={48} stroke="#64748b" strokeWidth={1} />
    <ChenEntity cx={116} cy={64} w={116} h={32} label="STAKEHOLDER" tone="sky" fontSize={10.5} />

    <line x1={116} y1={80} x2={116} y2={100} stroke="#334155" strokeWidth={1.4} />
    <circle cx={116} cy={113} r={13} fill="#fffbeb" stroke="#d97706" strokeWidth={1.5} />
    <text x={116} y={117} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#92400e">o</text>
    <text x={156} y={116} fontSize={8.5} fontWeight={600} fill="#92400e">Overlapping Partial</text>
    <line x1={105} y1={120} x2={68} y2={148} stroke="#334155" strokeWidth={1.3} />
    <line x1={127} y1={120} x2={172} y2={148} stroke="#334155" strokeWidth={1.3} />
    <ChenEntity cx={64} cy={164} w={100} h={30} label="FARM_OWNER" tone="neutral" fontSize={9.5} />
    <ChenEntity cx={182} cy={164} w={104} h={30} label="AGRONOMIST" tone="sky" fontSize={9.5} />

    {/* Bottom Left: Nested Weak Entities */}
    <ChenAttr cx={58} cy={236} rx={44} ry={11} label="Agri_Zone_ID" keyAttr fontSize={8.5} />
    <line x1={64} y1={247} x2={64} y2={258} stroke="#64748b" strokeWidth={1} />
    <ChenEntity cx={64} cy={274} w={96} h={32} label="AGRI_ZONE" tone="sky" fontSize={10} />
    <line x1={112} y1={274} x2={142} y2={274} stroke="#059669" strokeWidth={1.4} />
    <ChenDiamond cx={194} cy={274} rx={52} ry={20} label="LOCATED_IN" identifying tone="emerald" fontSize={8.5} />
    <DoubleLine x1={246} y1={274} x2={288} y2={274} stroke="#059669" />

    <ChenEntity cx={346} cy={274} w={116} h={36} label="FARM_PARCEL" weak tone="emerald" fontSize={10} />
    <ChenAttr cx={442} cy={232} rx={38} ry={11} label="Parcel_No" partialKey fontSize={8.5} />
    <line x1={420} y1={242} x2={394} y2={256} stroke="#64748b" strokeWidth={1} />

    <line x1={346} y1={292} x2={346} y2={308} stroke="#059669" strokeWidth={1.4} />
    <ChenDiamond cx={346} cy={326} rx={50} ry={18} label="MONITORS" identifying tone="emerald" fontSize={8.5} />
    <DoubleLine x1={296} y1={326} x2={228} y2={348} stroke="#059669" />
    <ChenEntity cx={162} cy={358} w={144} h={34} label="IOT_SOIL_SENSORS" weak tone="emerald" fontSize={9.5} />
    <ChenAttr cx={50} cy={358} rx={36} ry={11} label="Sensor_ID" partialKey fontSize={8.5} />
    <line x1={86} y1={358} x2={90} y2={358} stroke="#64748b" strokeWidth={1} />

    {/* Center Aggregation Box */}
    <rect x={294} y={40} width={250} height={162} rx={8} fill="#f8fafc" stroke="#0284c7" strokeWidth={1.5} strokeDasharray="5 3" />
    <text x={419} y={56} textAnchor="middle" fontSize={9} fontWeight={700} fill="#0369a1">
      AGGREGATION: AGRI_EXPERIMENT_EVENT
    </text>

    {/* Links into FIELD_TRIALS */}
    <line x1={234} y1={164} x2={364} y2={122} stroke="#334155" strokeWidth={1.4} />
    <line x1={358} y1={256} x2={406} y2={144} stroke="#334155" strokeWidth={1.4} />
    <line x1={598} y1={122} x2={474} y2={122} stroke="#334155" strokeWidth={1.4} />

    <ChenDiamond cx={418} cy={122} rx={58} ry={24} label="FIELD_TRIALS" tone="sky" fontSize={9.5} />

    {/* Aggregation -> ALLOCATED -> IRRIGATION_SCHEDULES (flush line from bottom of box to ALLOCATED top vertex) */}
    <line x1={504} y1={202} x2={548} y2={252} stroke="#0284c7" strokeWidth={1.6} />
    <ChenDiamond cx={548} cy={272} rx={52} ry={20} label="ALLOCATED" tone="sky" fontSize={9} />
    <line x1={548} y1={292} x2={548} y2={331} stroke="#0284c7" strokeWidth={1.6} />
    <ChenEntity cx={548} cy={348} w={176} h={34} label="IRRIGATION_SCHEDULES" tone="sky" fontSize={9.5} />

    {/* Right: CROP Disjoint + Total hierarchy */}
    <ChenAttr cx={654} cy={68} rx={36} ry={11} label="Crop_ID" keyAttr fontSize={8.5} />
    <line x1={654} y1={79} x2={654} y2={106} stroke="#64748b" strokeWidth={1} />
    <ChenEntity cx={654} cy={122} w={112} h={32} label="CROP" tone="sky" fontSize={10.5} />
    <DoubleLine x1={654} y1={138} x2={654} y2={170} stroke="#d97706" />
    <circle cx={654} cy={184} r={13} fill="#fffbeb" stroke="#d97706" strokeWidth={1.5} />
    <text x={654} y={188} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#92400e">d</text>
    <text x={706} y={180} fontSize={8.5} fontWeight={600} fill="#92400e">Disjoint</text>
    <text x={706} y={191} fontSize={8.5} fontWeight={600} fill="#92400e">+ Total</text>

    <line x1={643} y1={192} x2={602} y2={220} stroke="#334155" strokeWidth={1.3} />
    <line x1={665} y1={192} x2={704} y2={220} stroke="#334155" strokeWidth={1.3} />
    <ChenEntity cx={600} cy={236} w={92} h={30} label="FOOD_CROP" tone="amber" fontSize={9.5} />
    <ChenEntity cx={706} cy={236} w={96} h={30} label="INDUST_CROP" tone="amber" fontSize={9.5} />
  </DiagramFrame>
);

export const ShoppingLatticeDiagram: React.FC<{ caption?: string }> = ({ caption }) => (
  <DiagramFrame
    title="Shared Subclass EER Lattice Diagram — A2+TA2 Q9(b) Online Shopping"
    caption={
      caption ??
      'Shared Subclass BUYER_SELLER inherits from BOTH immediate superclasses CUSTOMER and BUSINESS_SELLER.'
    }
    viewBox="0 0 700 402"
  >
    {/* USERS */}
    <ChenAttr cx={180} cy={36} rx={36} ry={12} label="User_ID" keyAttr fontSize={9} />
    <ChenAttr cx={506} cy={24} rx={34} ry={12} label="Name" fontSize={9} />
    <ChenAttr cx={506} cy={52} rx={34} ry={12} label="Email" fontSize={9} />
    <line x1={216} y1={36} x2={290} y2={36} stroke="#64748b" strokeWidth={1.1} />
    <line x1={472} y1={26} x2={410} y2={34} stroke="#64748b" strokeWidth={1.1} />
    <line x1={472} y1={50} x2={410} y2={42} stroke="#64748b" strokeWidth={1.1} />
    <ChenEntity cx={350} cy={38} w={120} h={34} label="USERS" tone="sky" />

    {/* Single line Partial + (o) Overlapping */}
    <line x1={350} y1={55} x2={350} y2={82} stroke="#334155" strokeWidth={1.5} />
    <circle cx={350} cy={96} r={14} fill="#fffbeb" stroke="#d97706" strokeWidth={1.5} />
    <text x={350} y={100} textAnchor="middle" fontSize={12} fontWeight={700} fill="#92400e">o</text>
    <text x={374} y={99} fontSize={9.5} fontWeight={600} fill="#92400e">
      Single line = Partial · (o) Overlapping
    </text>

    <line x1={338} y1={103} x2={190} y2={138} stroke="#334155" strokeWidth={1.5} />
    <line x1={362} y1={103} x2={470} y2={138} stroke="#334155" strokeWidth={1.5} />

    {/* CUSTOMER & SELLER */}
    <ChenEntity cx={166} cy={156} w={128} h={34} label="CUSTOMER" tone="sky" />
    <ChenAttr cx={58} cy={156} rx={42} ry={12} label="Customer_ID" fontSize={8.5} />
    <line x1={100} y1={156} x2={102} y2={156} stroke="#64748b" strokeWidth={1.1} />

    <ChenEntity cx={492} cy={156} w={120} h={34} label="SELLER" tone="sky" />
    <ChenAttr cx={616} cy={156} rx={40} ry={12} label="Seller_ID" fontSize={8.5} />
    <line x1={552} y1={156} x2={576} y2={156} stroke="#64748b" strokeWidth={1.1} />

    {/* Double line Total + (d) under SELLER */}
    <DoubleLine x1={492} y1={173} x2={492} y2={198} stroke="#d97706" />
    <circle cx={492} cy={211} r={13} fill="#fffbeb" stroke="#d97706" strokeWidth={1.5} />
    <text x={492} y={215} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#92400e">d</text>
    <text x={514} y={214} fontSize={9.5} fontWeight={600} fill="#92400e">Total + Disjoint</text>

    <line x1={481} y1={219} x2={420} y2={244} stroke="#334155" strokeWidth={1.4} />
    <line x1={503} y1={219} x2={580} y2={244} stroke="#334155" strokeWidth={1.4} />

    <ChenEntity cx={400} cy={262} w={144} h={32} label="INDIVIDUAL_SELLER" tone="neutral" fontSize={9.5} />
    <ChenEntity cx={590} cy={262} w={148} h={32} label="BUSINESS_SELLER" tone="sky" fontSize={9.5} />

    {/* Shared Subclass Merge into BUYER_SELLER */}
    <path d="M 166 173 L 166 286 L 268 286" fill="none" stroke="#059669" strokeWidth={1.8} markerEnd="url(#arrow-emerald)" />
    <path d="M 590 278 L 590 296 L 446 296" fill="none" stroke="#059669" strokeWidth={1.8} markerEnd="url(#arrow-emerald)" />
    <text x={182} y={276} fontSize={9.5} fontWeight={700} fill="#047857">Multiple Inheritance</text>

    <SvgBox
      x={272}
      y={276}
      w={170}
      h={36}
      title="BUYER_SELLER (Shared)"
      subtitle="Buyer_Seller_ID, Business_Name"
      tone="emerald"
      fontSize={10.5}
      subFontSize={8.5}
    />

    {/* Total + (d) under BUYER_SELLER */}
    <DoubleLine x1={357} y1={312} x2={357} y2={332} stroke="#d97706" />
    <circle cx={357} cy={343} r={11.5} fill="#fffbeb" stroke="#d97706" strokeWidth={1.5} />
    <text x={357} y={347} textAnchor="middle" fontSize={11} fontWeight={700} fill="#92400e">d</text>
    <line x1={346} y1={350} x2={250} y2={364} stroke="#334155" strokeWidth={1.3} />
    <line x1={368} y1={350} x2={466} y2={364} stroke="#334155" strokeWidth={1.3} />

    <ChenEntity cx={230} cy={372} w={172} h={28} label="PREMIUM_BUYER_SELLER" tone="amber" fontSize={9.5} />
    <ChenEntity cx={486} cy={372} w={172} h={28} label="REGULAR_BUYER_SELLER" tone="amber" fontSize={9.5} />
  </DiagramFrame>
);
