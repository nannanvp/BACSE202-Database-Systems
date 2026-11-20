import type { TopicNote } from './noteTypes';

export const MODULE_2_NOTES: Record<string, TopicNote> = {
  'm2-t1': {
    summary:
      'Entity-Relationship (ER) Modeling is a top-down conceptual database design blueprint built before physical SQL tables. Mastering entity types (strong vs. weak), attribute semantics (composite, multivalued, derived, keys), cardinality ratios, and participation constraints prevents downstream structural flaws.',
    sourceDecks: [
      'Module 2. Relational Model and E-R Modeling.pptx (Slides 1–85)',
      'Module-2-Consolidated.ppt (Slides 1–88)',
    ],
    keyPoints: [
      {
        heading: 'Strong Entities vs. Weak Entities & Partial Keys',
        text: 'A **Strong (Regular) Entity** owns an independent primary key (underlined oval). A **Weak Entity** (double rectangle) lacks enough attributes to form its own key, must have **Total participation** (double line) in an **Identifying Relationship** (double diamond) with its **Identifying Owner**, and relies on a **Partial Key / Discriminator** (dashed underline).',
      },
      {
        heading: 'Six Attribute Classifications & Standard ER Symbols',
        text: '**Simple/Atomic** vs. **Composite** (oval branching into sub-ovals, e.g., `Name -> First, Last`), **Single-valued** vs. **Multivalued** (**double oval**, e.g., `{Phone_Nos}`), **Stored** vs. **Derived** (**dashed oval**, e.g., `Age` computed from `DOB`), and **Key** (**solid underline**) vs. **Partial Key** (**dashed underline**).',
      },
      {
        heading: 'Relationship Degree, Cardinality & Participation (`(min, max)`)',
        text: '**Degree** = number of participating entities (Unary/Recursive e.g. `SUPERVISES(Employee)`, Binary, Ternary). **Cardinality** (`1:1`, `1:N`, `M:N`) limits max links; **Participation** specifies minimum (`Total ==` means `min >= 1`, `Partial —` means `min = 0`). Structural `(min, max)` pairs place `(min, max)` next to each entity edge.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Complete Chen ER Diagram Notation Reference',
        body: 'VIT FAT rubric keys award direct marks for drawing the exact Chen notation symbols alongside keys and constraints:',
        table: {
          headers: ['Concept', 'Chen ER Symbol', 'Example from Lectures / FAT'],
          rows: [
            ['Strong Entity', 'Single Rectangle', 'GUEST, ROOM, BOOKING, PATIENT'],
            ['Weak Entity', 'Double Rectangle', 'BED (within ROOM), DEPENDENT, IOT_SOIL_SENSORS'],
            ['Key / Partial Key', 'Solid Underline / Dashed Underline', 'Guest_ID (solid) / Bed_No (dashed)'],
            ['Composite Attribute', 'Oval with sub-ovals', 'Name -> (First_Name, Last_Name)'],
            ['Multivalued Attribute', 'Double-line Oval', '{Assigned_Agri_Zones}, {Contact_Numbers}'],
            ['Derived Attribute', 'Dashed-line Oval', 'Age (from DOB), Total_Fee'],
            ['Relationship / Identifying Rel.', 'Single Diamond / Double Diamond', 'MAKES (Guest-Booking) / HAS_BED (Room-Bed)'],
            ['Total vs. Partial Participation', 'Double Line (==) vs. Single Line (—)', 'BED == HAS_BED (every Bed needs a Room)'],
            ['Relationship Attributes', 'Oval attached directly to Diamond', 'Quantity, Service_Date on USES (M:N)'],
          ],
        },
      },
      {
        title: '2. Cardinality Ratio vs. `(min, max)` Structural Constraints',
        body: 'Be careful not to swap sides! In **Cardinality Ratio (`1:N`)**, the `1` sits on the entity that appears at most once per counterpart; in **`(min, max)` notation**, the numbers next to entity `E` count how many times **one instance of `E`** enters the relationship diamond:',
        diagramId: 'm2-cardinality-minmax',
        diagramCaption:
          'Always verify both ratio direction (1:N) and structural participation (single partial line vs. double total line).',
        bullets: [
          '**4-Step ER Design Method (`College Case Study`, Slides 66–73):** (1) Identify entity sets (`DEPARTMENT, STUDENT, COURSE, INSTRUCTOR`), (2) Assign primary keys, (3) Attach simple/composite/multivalued/derived attributes, (4) Link via named relationships with cardinalities and participations (`DEPARTMENT —1:N— OFFERS — COURSE`, `STUDENT —M:N— ENROLLS — COURSE`).',
          '**Ternary vs. Multiple Binary Relationships:** Use a **Ternary Diamond** (`AGRONOMIST`, `CROP`, `FARM_PARCEL` in `FIELD_TRIALS`) whenever knowing *(A, B)*, *(B, C)*, and *(A, C)* separately cannot reconstruct which specific `(a, b, c)` combination happened together!',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q3 [10M, CO5, BL3 / BL6]',
        questionPrompt:
          'Q3: Hotel Management System: GUEST(Guest_ID [PK], Name, Phone, Email); ROOM(Room_No [PK], Room_Type, Tariff); BOOKING(Booking_ID [PK], Booking_Date, Check_In_Date, Check_Out_Date); SERVICE(Service_ID [PK], Service_Name, Charge). A Guest makes >=0 Bookings, each Booking belongs to exactly 1 Guest, and includes >=1 Room (Rooms have multiple Bookings over time). Guests use multiple Services during a Booking (record Quantity, Service_Date). Each Room has >=1 Beds; a Bed is identified by Bed_No unique only within its Room, and each bed is Single or Double. Draw a complete ER/EER diagram showing keys, attributes, cardinalities, participations, and EER features. [10M]',
        solvingMethod: [
          'Step 1 — Entities & Keys [2.5M]: Draw rectangles for `GUEST` (`Guest_ID`), `BOOKING` (`Booking_ID`), `ROOM` (`Room_No`), `SERVICE` (`Service_ID`), and a **double rectangle** for weak entity `BED` (`Bed_No` dashed-underlined).',
          'Step 2 — Binary & Ternary/M:N Relationships [3M]: `GUEST —(1:N)— MAKES == BOOKING` (Booking total, Guest partial); `BOOKING ==(M:N)— RESERVES — ROOM` (Booking total `>=1`, Room partial); `BOOKING — SERVICE` (or Ternary `GUEST–BOOKING–SERVICE`, best modeled as M:N `USES` between `BOOKING` and `SERVICE` since each Booking already uniquely identifies 1 Guest!) carrying relationship attributes `Quantity` and `Service_Date`.',
          'Step 3 — Weak Entity `BED` [2.5M]: Connect `ROOM` to weak entity `BED` via **double diamond** `CONTAINS_BED` (`1:N`), with double-line **Total participation** on BOTH `ROOM` ("contains one or more Beds") and `BED` ("belongs to a Room").',
          'Step 4 — EER Specialization on `BED` [2M]: Draw a **`(d)` Disjoint + Double-Line Total** specialization circle beneath `BED` branching into subclasses `SINGLE_BED` and `DOUBLE_BED` ("each bed is of type single or double").',
        ],
        codeBlock: {
          title: 'Chen ER / EER Diagram — A2+TA2 Q3 Hotel Management System',
          diagramId: 'm2-hotel-eer',
          diagramCaption:
            'Strong entities, weak entity BED (double box + dashed partial key), identifying relationship HAS_BED (double diamond), and Disjoint Total specialization (d).',
        },
        commonPitfalls:
          'Missing the **Total (double-line) participation** on `BOOKING` in `RESERVES` ("must include at least one Room") and on `ROOM` in `HAS_BED` ("each Room contains one or more Beds"), or forgetting the **EER `(d)` Disjoint + Total specialization** on `BED -> {SINGLE_BED, DOUBLE_BED}`!',
      },
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q1 [10M, CO2]',
        questionPrompt:
          'Q1: Create an E-R diagram for a car dealership. The dealership sells both new and used cars, and it operates a service facility. Base your design on the following business rules:\n• A salesperson may sell many cars, but each car is sold by only one salesperson.\n• A customer may buy many cars, but each car is sold to only one customer.\n• A salesperson writes a single invoice for each car he or she sells.\n• A customer gets an invoice for each car he or she buys.\n• A customer may come in just to have his or her car serviced, that is, one need not buy a car to be classified as a customer.\n• When a customer takes one or more cars in for repair or service, one service ticket is written for each car.\n• The car dealership maintains a service history for each of the cars serviced. The service records are referenced by the car’s serial number.\n• A car brought in for service can be worked on by many mechanics, and each mechanic may work on many cars.\n• A car that is serviced may or may not need parts. (For example, adjusting a carburetor or cleaning a fuel injector nozzle does not require the use of parts). [10M]',
        solvingMethod: [
          'Step 1 — Identify Core Entity Sets & Primary Keys [2.5M]: Define strong entities **`SALESPERSON`** (<u>`Salesperson_ID`</u>, `Name`, `Phone`), **`CUSTOMER`** (<u>`Customer_ID`</u>, `Name`, `Phone`, `Address`), **`CAR`** (<u>`Serial_No`</u>, `Make`, `Model`, `Year`, `Condition_Type {"New","Used"}`, `For_Sale_Flag`), **`INVOICE`** (<u>`Invoice_No`</u>, `Invoice_Date`, `Amount`), **`SERVICE_TICKET`** (<u>`Ticket_No`</u>, `Date_Received`, `Date_Returned`, `Service_Comments`), **`MECHANIC`** (<u>`Mechanic_ID`</u>, `Name`, `Specialization`), **`PARTS`** (<u>`Part_No`</u>, `Description`, `Unit_Price`), and weak/history entity **`SERVICE_RECORD`** (<u>`Record_No`</u> partial key, `Service_Date`, `Work_Done`) owned by `CAR(Serial_No)`.',
          'Step 2 — Sales & Invoice Relationships + Participation Rules [2.5M]:\n  1) `SALESPERSON —(1:N)— SELLS — CAR` (**Partial** on both sides: a new salesperson may have sold `0` cars; a car brought in *only* for service was not sold by the dealership!).\n  2) `CUSTOMER —(1:N)— BUYS — CAR` (**Partial** on `CUSTOMER` because *"a customer may come in just to have his or her car serviced"*; **Partial** on `CAR` for external service-only cars).\n  3) `SALESPERSON —(1:N)— WRITES == INVOICE`, `CUSTOMER —(1:N)— RECEIVES == INVOICE`, and `CAR —(1:1)— GENERATES == INVOICE` (**Total `==`** on `INVOICE` for all three, since every invoice must belong to 1 salesperson, 1 customer, and 1 sold car).',
          'Step 3 — Service Facility, Mechanics (`M:N`) & Optional Parts (`0..N`) [3M]:\n  1) `CUSTOMER —(1:N)— BRINGS_FOR_SERVICE == SERVICE_TICKET` and `CAR —(1:N)— HAS_TICKET == SERVICE_TICKET` ("one service ticket is written for each car brought in").\n  2) `CAR ==(1:N)== MAINTAINS_HISTORY == [[SERVICE_RECORD]]` referenced by `CAR.Serial_No`.\n  3) `SERVICE_TICKET (or CAR) ==(M:N)— WORKED_ON_BY — MECHANIC` carrying relationship attribute `Hours_Worked` ("worked on by many mechanics, and each mechanic may work on many cars").\n  4) `SERVICE_TICKET —(M:N, 0..N Partial)— USES_PARTS — PARTS` carrying `Quantity_Used` (**Single-line Partial participation** on `SERVICE_TICKET` because *"a car that is serviced may or may not need parts"*!).',
          'Step 4 — Summary Table of Cardinalities & Participations [2M]: Present a neat verification table listing all 8 relationships, their `1:1 / 1:N / M:N` ratios, and `Total (==)` vs. `Partial (—)` justifications.',
        ],
        codeBlock: {
          title: 'Model QP Q1 — Car Dealership ER Relationship & Participation Matrix',
          language: 'markdown',
          content:
`| Relationship Diamond | Entities Connected | Ratio | Participation (\`min..max\`) & Business Rule Justification |
| :--- | :--- | :--- | :--- |
| **SELLS** | \`SALESPERSON\` — \`CAR\` | \`1 : N\` | \`(0,N)\` Salesperson, \`(0,1)\` Car *(service-only cars not sold here)* |
| **BUYS** | \`CUSTOMER\` — \`CAR\` | \`1 : N\` | \`(0,N)\` Customer *(service-only customers buy 0 cars!)*, \`(0,1)\` Car |
| **WRITES_INV** | \`SALESPERSON\` == \`INVOICE\` | \`1 : N\` | \`(0,N)\` Salesperson, \`(1,1)\` **Total** on \`INVOICE\` |
| **GETS_INV** | \`CUSTOMER\` == \`INVOICE\` | \`1 : N\` | \`(0,N)\` Customer, \`(1,1)\` **Total** on \`INVOICE\` |
| **FOR_CAR** | \`CAR\` == \`INVOICE\` | \`1 : 1\` | \`(0,1)\` Car, \`(1,1)\` **Total** on \`INVOICE\` *(1 invoice per sold car)* |
| **OPENS_TICKET** | \`CUSTOMER\` / \`CAR\` == \`SERVICE_TICKET\` | \`1 : N\` | \`(1,1)\` **Total** on \`SERVICE_TICKET\` *(1 ticket per car visit)* |
| **HAS_HISTORY** | \`CAR\` == \`[[SERVICE_RECORD]]\` | \`1 : N\` | Weak entity identified by \`CAR(Serial_No)\` + \`Record_No\` |
| **WORKS_ON** | \`MECHANIC\` — \`SERVICE_TICKET\` | \`M : N\` | \`(0,N)\` Mechanic, \`(1,N)\` Ticket + attr \`Hours_Worked\` |
| **USES_PARTS** | \`SERVICE_TICKET\` — \`PARTS\` | \`M : N\` | **Partial \`(0,N)\` on Ticket** *(carburetor tune-up needs 0 parts!)* |`,
        },
        commonPitfalls:
          'Drawing Total (`==`) participation on `CUSTOMER` in `BUYS` (violating rule 5: *"one need not buy a car to be classified as a customer"*) or drawing Total (`==`) participation on `SERVICE_TICKET` in `USES_PARTS` (violating rule 9: *"a car that is serviced may or may not need parts"*).',
      },
    ],
    exampleTitle: 'Weak Entity Identification Checklist (Lecture Slides 57–64)',
    exampleBody:
`Every Weak Entity \`W\` **MUST** display 5 visual markers on the exam sheet:
1. **Double-lined Rectangle** for \`W\` (e.g., \`DEPENDENT\` or \`BED\`).
2. **Dashed underline** on \`W\`'s Partial Key (e.g., \`First_Name\` or \`Bed_No\`).
3. **Double-lined Diamond** for the Identifying Relationship (e.g., \`HAS_BED\`).
4. **Double-line Total Participation** connecting \`W\` into its double diamond.
5. **Composite Primary Key** upon SQL mapping = \`(Owner_PK, Partial_Key)\`.`,
    examTip:
      'Always double-check whether a prompt says "each X must have at least one Y"—any "at least one / every" phrasing translates directly into a **double line (Total participation)** in your diagram.',
    selfChecks: [
      {
        question:
          'In Chen ER notation, which four visual elements ALWAYS characterize a Weak Entity such as BED(Bed_No) belonging to ROOM(Room_No)?',
        options: [
          'Single rectangle, solid key underline, single diamond, dashed participation line',
          'Double rectangle, dashed partial key underline, double-diamond identifying relationship, double-line total participation',
          'Double oval, disjoint circle (d), dashed rectangle, partial line',
          'Dashed rectangle, solid underline, ternary diamond, overlapping circle (o)',
        ],
        correctIndex: 1,
        explanation:
          'Weak entities lack an independent PK, so they use a double rectangle, dashed partial key, double-diamond identifying relationship, and mandatory double-line total participation toward their owner entity.',
      },
      {
        question:
          'One DEPARTMENT employs many FACULTY, and every FACULTY must belong to exactly one DEPARTMENT (some new departments have 0 faculty temporarily). Using (min, max) notation, what pair sits next to FACULTY?',
        options: [
          '(0, N)',
          '(1, 1)',
          '(0, 1)',
          '(1, N)',
        ],
        correctIndex: 1,
        explanation:
          '(min, max) next to entity E counts how many times ONE instance of E participates. Each faculty belongs to minimum 1 and maximum 1 department -> (1, 1), while DEPARTMENT has (0, N).',
      },
      {
        question:
          'In the Model QP Q1 Car Dealership ER diagram, why must CUSTOMER have Partial (single-line) participation in the BUYS relationship and SERVICE_TICKET have Partial participation in USES_PARTS?',
        options: [
          'Because a customer can visit solely for car service without buying a car, and a service job (like cleaning a fuel injector) may require zero replacement parts',
          'Because every customer must buy at least two cars',
          'Because PARTS is a superclass of CUSTOMER',
          'Because M:N relationships never allow total participation',
        ],
        correctIndex: 0,
        explanation:
          'Business rule 5 states a customer need not buy a car (service-only customers), and rule 9 states a serviced car may or may not need parts—both require Partial (0..N) participation.',
      },
    ],
  },

  'm2-t2': {
    summary:
      'Extended ER (EER) Modeling extends basic ER diagrams with object-oriented abstractions: Superclass/Subclass **IS-A** hierarchies, **Specialization & Generalization** constraints (`Disjoint (d)` vs. `Overlapping (o)`, `Total` vs. `Partial`), **Multiple Inheritance (Shared Subclass / Lattice)**, and **Aggregation** of relationship sets.',
    sourceDecks: [
      'Module 2. Relational Model and E-R Modeling.pptx (Slides 86–112)',
      'Module-2-Consolidated.ppt (Slides 89–120)',
    ],
    keyPoints: [
      {
        heading: 'Superclass / Subclass & Attribute/Relationship Inheritance',
        text: 'An **IS-A** hierarchy connects a general **Superclass** to specialized **Subclasses** (e.g., `DOCTOR IS-A STAFF`). Every subclass **inherits all attributes and relationships** of its superclass while adding subclass-specific attributes and relationships.',
      },
      {
        heading: 'Specialization (Top-Down) vs. Generalization (Bottom-Up)',
        text: '**Specialization** breaks one entity into distinct sub-groupings (`EMPLOYEE -> {SECRETARY, ENGINEER}`). **Generalization** abstracts shared features of existing entities upward into one superclass (`CAR, TRUCK -> VEHICLE`). Both draw identically in EER!',
      },
      {
        heading: 'Four Mandatory EER Constraints + Shared Subclass & Aggregation',
        text: '**Disjoint `(d)`** (member of at most 1 subclass) vs. **Overlapping `(o)`** (may belong to >=2 subclasses); **Total (`==`)** (every superclass entity must enter a subclass) vs. **Partial (`—`)** (optional). A **Shared Subclass (Lattice)** inherits from >=2 superclasses. **Aggregation** wraps a relationship diamond so the composite event links to another entity.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Four Combinations of Specialization Constraints (`d/o` × `Total/Partial`)',
        body: 'In every EER diagram problem, explicitly label the circle (`d` or `o`) AND the top line from the superclass (`double ==` for Total, `single —` for Partial):',
        table: {
          headers: ['Combination', 'Notation', 'Meaning', 'Real Exam Example'],
          rows: [
            [
              'Disjoint + Total',
              'Double line (==) + Circle (d)',
              'Every superclass tuple MUST be in EXACTLY ONE subclass.',
              'A1 Q3: CROP -> {FOOD_CROP, INDUSTRIAL_CROP}',
            ],
            [
              'Disjoint + Partial',
              'Single line (—) + Circle (d)',
              'A superclass tuple belongs to AT MOST ONE subclass (or none).',
              'VEHICLE -> {TWOWHEELER, FOURWHEELER} (trucks excluded)',
            ],
            [
              'Overlapping + Total',
              'Double line (==) + Circle (o)',
              'Every superclass tuple belongs to AT LEAST ONE subclass (>=1).',
              'PERSON -> {STUDENT, EMPLOYEE} in a university-only roster',
            ],
            [
              'Overlapping + Partial',
              'Single line (—) + Circle (o)',
              'May belong to 0, 1, or multiple subclasses simultaneously.',
              'A1 Q3: STAKEHOLDER -> {FARM_OWNER, AGRONOMIST}; A2 Q9b: USERS',
            ],
          ],
        },
        bullets: [
          '**Predicate-Defined vs. User-Defined:** If a superclass attribute value decides the subclass (e.g., `JobType = \'Salaried\'`), write the condition on the edge (**Attribute-Defined**); otherwise membership is assigned manually (**User-Defined**).',
        ],
      },
      {
        title: '2. Multiple Inheritance (Shared Subclass / Lattice) & EER Aggregation',
        body: 'Both **Nov 2026 FAT papers** explicitly test these two advanced EER constructs—Aggregation in **`A1 Q3`** and Shared Subclass in **`A2 Q9(b)`**:',
        diagramId: 'm2-aggregation-lattice',
        diagramCaption:
          'Left: EER Aggregation wraps ternary FIELD_TRIALS so IRRIGATION_SCHEDULES links to the experiment event. Right: Multiple inheritance lattice into BUYER_SELLER.',
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q3 [10M, CO5, BL6]',
        questionPrompt:
          'Q3: Agricultural Research & Resource Management System (ARRMS):\n• STAKEHOLDER(National_ID [PK], Name, Primary_Contact, {Assigned_Agri_Zones}); specialized into FARM_OWNER(Ownership_License_No, Total_Land_Area) and AGRONOMIST(Degree_Specialization, Research_Institute) — a person can be BOTH simultaneously.\n• CROP(Crop_ID [PK], Botanical_Name, Optimal_pH_Range) classified into EITHER FOOD_CROP(Nutritional_Grade, Storage_Life_Days) OR INDUSTRIAL_CROP(Processing_Industry_Type, Extraction_Yield_Pct) — must belong to exactly one.\n• FARM_PARCEL(Parcel_No [partial key]) weak within AGRI_ZONE(Agri_Zone_ID [PK], Climatic_Region).\n• IOT_SOIL_SENSORS(Sensor_ID [partial key], Moisture_Level, Nitrate_Content) weak within FARM_PARCEL.\n• Ternary FIELD_TRIALS(AGRONOMIST, CROP, FARM_PARCEL) -> aggregated as AGRI_EXPERIMENT_EVENT -> linked to IRRIGATION_SCHEDULES(Water_Volume_Liters, Frequency). Draw complete EER. [10M]',
        solvingMethod: [
          'Step 1 — Specialization Hierarchies [3M]: `STAKEHOLDER` (`National_ID*`, `{Assigned_Agri_Zones}` double oval) -> **`(o)` Overlapping** circle into `FARM_OWNER` and `AGRONOMIST`. `CROP` (`Crop_ID*`) -> **Double-line Total + `(d)` Disjoint** circle into `FOOD_CROP` and `INDUSTRIAL_CROP`.',
          'Step 2 — Nested Weak Entities [3M]: `AGRI_ZONE` (`Agri_Zone_ID*`) ==⟪LOCATED_IN⟫== `[[FARM_PARCEL]]` (`Parcel_No` dashed) ==⟪MONITORS⟫== `[[IOT_SOIL_SENSORS]]` (`Sensor_ID` dashed, `Moisture_Level`, `Nitrate_Content`). Notice `IOT_SOIL_SENSORS` is a **nested weak entity** owned by `FARM_PARCEL`!',
          'Step 3 — Ternary Relationship + Aggregation [4M]: Connect `AGRONOMIST`, `CROP`, and `FARM_PARCEL` to ternary diamond `FIELD_TRIALS`. Surround `FIELD_TRIALS` and its 3 entities inside a dashed/box **Aggregation boundary** (`AGRI_EXPERIMENT_EVENT`), then draw a binary relationship `<ALLOCATED>` linking that box to `IRRIGATION_SCHEDULES` (`Water_Volume_Liters`, `Frequency`).',
        ],
        codeBlock: {
          title: 'Complete EER Diagram — A1+TA1 Q3 ARRMS',
          diagramId: 'm2-arrms-eer',
          diagramCaption:
            'Overlapping (o) Stakeholder, nested weak entities FARM_PARCEL & IOT_SOIL_SENSORS, Disjoint Total (d) Crop, and Aggregation around FIELD_TRIALS.',
        },
        commonPitfalls:
          'Missing **Aggregation** (`AGRI_EXPERIMENT_EVENT` box around ternary `FIELD_TRIALS` linking to `IRRIGATION_SCHEDULES`) or forgetting to draw **double rectangles + dashed partial keys** on BOTH `FARM_PARCEL` and nested `IOT_SOIL_SENSORS`!',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q9(b) [10M, CO5, BL3]',
        questionPrompt:
          'Q9(b): Online Shopping EER: USERS(User_ID [PK], Name, Email). A user may be CUSTOMER(Customer_ID), SELLER(Seller_ID), or both (participation NOT mandatory). Every SELLER is either INDIVIDUAL_SELLER or BUSINESS_SELLER. A BUSINESS_SELLER can also be a CUSTOMER -> called BUYER_SELLER(Buyer_Seller_ID, Business_Name). Every BUYER_SELLER is either PREMIUM_BUYER_SELLER or REGULAR_BUYER_SELLER. Identify the shared subclass & its superclasses, and draw the complete EER showing disjointness and completeness. [10M]',
        solvingMethod: [
          'Part 1 — Explicitly Identify Shared Subclass & Superclasses [2M]: Write in text right at the top: **Shared Subclass = `BUYER_SELLER`**; its **two immediate Superclasses = `CUSTOMER` and `BUSINESS_SELLER`** (forms an EER Lattice / Multiple Inheritance).',
          'Part 2 — Level 1 Specialization (`USERS`) [2.5M]: Draw **Single-line Partial + `(o)` Overlapping** circle from `USERS` (`User_ID*`, `Name`, `Email`) into `CUSTOMER` (`Customer_ID`) and `SELLER` (`Seller_ID`), because users "may be Customer, Seller, or both; not mandatory".',
          'Part 3 — Level 2 Specialization (`SELLER`) [2M]: Draw **Double-line Total + `(d)` Disjoint** circle from `SELLER` into `INDIVIDUAL_SELLER` and `BUSINESS_SELLER` ("every SELLER is classified as either...").',
          'Part 4 — Shared Subclass & Level 4 Specialization [3.5M]: Connect BOTH `CUSTOMER` and `BUSINESS_SELLER` downward with subset (`⊂` / IS-A) lines into `BUYER_SELLER` (`Buyer_Seller_ID`, `Business_Name`), then draw **Double-line Total + `(d)` Disjoint** circle from `BUYER_SELLER` into `PREMIUM_BUYER_SELLER` and `REGULAR_BUYER_SELLER`.',
        ],
        codeBlock: {
          title: 'Shared Subclass EER Lattice Diagram — A2+TA2 Q9(b)',
          diagramId: 'm2-shopping-lattice',
          diagramCaption:
            'Shared Subclass BUYER_SELLER inherits from CUSTOMER and BUSINESS_SELLER, then specializes totally and disjointly (d).',
        },
        commonPitfalls:
          'Using `(d)` instead of `(o)` under `USERS` (users can be BOTH Customer & Seller!), using a single line instead of double line on `SELLER` and `BUYER_SELLER` ("Every SELLER / Every BUYER_SELLER..."), or forgetting to state the shared subclass and its two superclasses explicitly in words.',
      },
    ],
    exampleTitle: 'EER Constraint Annotation Formula',
    exampleBody:
`Always check **TWO independent axes** per specialization hierarchy:
- **Axis 1 (Disjointness):** \`(d)\` Disjoint (\`≤ 1\` subclass) **vs.** \`(o)\` Overlapping (\`≥ 1\` subclasses simultaneously)
- **Axis 2 (Completeness):** **Double line \`==\`** Total (mandatory) **vs.** **Single line \`—\`** Partial (optional)

> **Key Rule:** *Generalization* (bottom-up) and *Specialization* (top-down) use the **exact same circle & line notation** in EER diagrams.`,
    examTip:
      'Whenever you draw a specialization circle, write both `(d)` or `(o)` inside the circle AND clearly double-line any Total constraint so graders can check every constraint at a glance.',
    selfChecks: [
      {
        question:
          'In an EER diagram for a Hospital, a STAFF member is specialized into {DOCTOR, NURSE, ADMIN} where every staff member MUST hold at least one role and a Doctor can also serve in Admin. Which constraints apply?',
        options: [
          'Disjoint (d) and Partial (single line)',
          'Overlapping (o) and Total (double line)',
          'Disjoint (d) and Total (double line)',
          'Overlapping (o) and Partial (single line)',
        ],
        correctIndex: 1,
        explanation:
          'Because a person can hold more than one subclass simultaneously (Doctor + Admin), it is Overlapping (o); because every STAFF member must hold at least one role, participation is Total (double line).',
      },
      {
        question:
          'In A2+TA2 Q9(b) (Online Shopping EER), why is BUYER_SELLER called a "Shared Subclass" (Lattice)?',
        options: [
          'It is a weak entity shared across multiple rooms',
          'It inherits attributes and relationships from MORE THAN ONE superclass (both CUSTOMER and BUSINESS_SELLER)',
          'It uses an aggregation boundary around a ternary diamond',
          'It stores multivalued attributes in a single oval',
        ],
        correctIndex: 1,
        explanation:
          'A shared subclass occurs whenever a subclass has multiple immediate superclasses (multiple inheritance), creating a lattice rather than a strict hierarchy.',
      },
    ],
  },

  'm2-t3': {
    summary:
      'Translating an ER/EER conceptual diagram into a Relational Database Schema follows Elmasri & Navathe’s deterministic **7-Step ER Mapping Algorithm** plus **4 EER Inheritance Mapping Options (8A–8D)**—preserving primary keys, foreign keys, composite/multivalued columns, and referential integrity.',
    sourceDecks: [
      'Module 2. Relational Model and E-R Modeling.pptx (Slides 80–90)',
      'Module 2. Part 1 Relational Database Design.pptx (Slides 1–12)',
      'Module-2-Consolidated.ppt (Slides 121–150)',
    ],
    keyPoints: [
      {
        heading: '7-Step ER-to-Relational Mapping Algorithm',
        text: '**Step 1:** Strong entities -> tables (flatten composite attrs!). **Step 2:** Weak entities -> table + Owner PK as FK, composite PK = `(Owner_PK, Partial_Key)`. **Step 3:** Binary `1:1` -> FK in total-side table (or merge). **Step 4:** Binary `1:N` -> FK (`1`-side PK) on `N`-side table + rel attrs. **Step 5:** `M:N` -> new Junction table with both PKs + rel attrs. **Step 6:** Multivalued attr -> `(Owner_PK, Val)` table. **Step 7:** N-ary (`>=3`) -> new table with all entity PKs + rel attrs.',
      },
      {
        heading: 'Weak Entity Mapping & Total Participation Enforcement',
        text: 'When mapping weak entity `W(b1_partial, b2)` owned by `E(a1*)`, create table `W(a1 [FK -> E.a1 ON DELETE CASCADE], b1_partial, b2)` with composite primary key `(a1, b1_partial)`. Never make `a1` nullable!',
      },
      {
        heading: 'Four EER Superclass/Subclass Mapping Options (8A–8D)',
        text: '**8A (Multiple Tables: Superclass + Subclasses):** Works for ALL (`d/o`, `total/partial`). **8B (Subclasses Only):** Duplicate superclass cols in each subclass table (requires **Disjoint + Total**!). **8C (Single Table + `Type` Discriminator):** Good for **Disjoint** (`NULL`s on unused subclass cols). **8D (Single Table + Boolean Flags `Is_A, Is_B`):** Best for **Overlapping**.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Complete 7-Step ER-to-Relational Mapping Reference Table',
        body: 'Memorize how every ER diagram construct maps cleanly to relational schemas and Primary/Foreign Keys:',
        table: {
          headers: ['Step & ER Construct', 'Resulting Table(s)', 'Primary Key (PK)', 'Foreign Key (FK) & Rule'],
          rows: [
            ['1. Strong Entity E(k*, a, Comp(c1,c2))', 'E(k, a, c1, c2)', 'k', 'Flatten composite attrs into simple columns'],
            ['2. Weak Entity W(p_partial, b) of E(k*)', 'W(k, p_partial, b)', '(k, p_partial)', 'k -> E(k) NOT NULL ON DELETE CASCADE'],
            ['3. Binary 1:1 (E1 — E2, attr)', 'Add FK to total-side (or merge if both total)', 'Host entity PK', 'E_other(PK) as UNIQUE FK in host table'],
            ['4. Binary 1:N (E1 1 — N E2, attr)', 'Put E1.k inside N-side table E2', 'E2.k2', 'E1.k -> E1(k) (+ move rel attr to E2)'],
            ['5. Binary M:N (E1 M — N E2, attr)', 'New Junction R(k1, k2, attr)', '(k1, k2)', 'k1 -> E1(k1), k2 -> E2(k2)'],
            ['6. Multivalued Attr {M} on E(k*)', 'New Table E_M(k, M)', '(k, M)', 'k -> E(k) ON DELETE CASCADE'],
            ['7. N-ary (n >= 3) Rel(E1..En, attr)', 'New Table R(k1, k2, ..., kn, attr)', 'Subset/all of (k1..kn)', 'Each ki -> Ei(ki); exclude 1-side if cardinality 1'],
          ],
        },
      },
      {
        title: '2. EER Subclass Mapping Matrix (Options 8A, 8B, 8C, 8D)',
        body: 'Choosing the wrong EER mapping option breaks constraints or generates spurious NULLs:',
        table: {
          headers: ['Option', 'Tables Created', 'Best For Constraint', 'Key Pros & Cons'],
          rows: [
            ['8A', 'Superclass L(k, a...) + each Subclass S_i(k, s_i...)', 'Universal (ANY d/o, total/partial)', 'Zero NULLs; requires a JOIN to assemble full subclass view'],
            ['8B', 'Subclass tables S_i(k, a..., s_i...) ONLY (no Super table)', 'Disjoint + Total ONLY!', 'No joins needed for subclass query; fails if overlapping (duplicates data!) or partial'],
            ['8C', 'One table T(k, a..., Type, s1..., s2...)', 'Disjoint (d)', 'Zero joins; produces NULLs in columns of non-matching subclasses'],
            ['8D', 'One table T(k, a..., Flag1, s1..., Flag2, s2...)', 'Overlapping (o)', 'Supports belonging to multiple subclasses simultaneously; more NULLs if many subclasses'],
          ],
        },
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q4 [10M, CO2]',
        questionPrompt:
          'Q4: Convert the given Entity-Relationship (ER) diagram into a Relational Database Schema:\n• Strong Entity Student: StudentID (PK), composite name(FirstName, LastName), composite class(year, semester, section).\n• Strong Entity LabSection: composite key class(year, semester, section), LabInstructor.\n• Strong Entity Team: TeamID (PK), TeamName.\n• Weak Entity DragExpRun (identified by Conduct under owner Team): partial key (Date, Trial), DragF, Mass, Vel, Accel.\n• Relationships: Student —(M:N)— Member-of —(0..N)— Team; LabSection —(1:N)— Made-of —(1..1)— Team; Team —(1:N)— Conduct == [[DragExpRun]]. [10M]',
        solvingMethod: [
          'Step 1 — Map Strong Entities & Flatten Composite Attributes [3M]:\n  • `STUDENT`: Flatten composite `name(FirstName, LastName)` and `class(year, semester, section)` -> **`STUDENT(`<u>`StudentID`</u>`, FirstName, LastName, year, semester, section)`**.\n  • `LAB_SECTION`: Flatten composite PK `class(year, semester, section)` + `LabInstructor` -> **`LAB_SECTION(`<u>`year`</u>`, `<u>`semester`</u>`, `<u>`section`</u>`, LabInstructor)`**.\n  • `TEAM`: **`TEAM(`<u>`TeamID`</u>`, TeamName, SectionYear, SectionSemester, SectionNo)`** (receiving `LAB_SECTION` FK in Step 2).',
          'Step 2 — Map Binary `1:N` Relationship `Made-of (LabSection 1 — N Team)` [2M]: Place `LAB_SECTION`\'s composite primary key `(year, semester, section)` as a composite Foreign Key **`(SectionYear, SectionSemester, SectionNo)`** inside the `N`-side table `TEAM` referencing `LAB_SECTION(year, semester, section)`.',
          'Step 3 — Map Weak Entity `DragExpRun` via Identifying Relationship `Conduct` (`Team 1 — N DragExpRun`) [2.5M]: Pull owner `TEAM`\'s PK (`TeamID`) into `DRAG_EXP_RUN` as a `NOT NULL` Foreign Key (`ON DELETE CASCADE`) and combine with partial key `(Date, Trial)` -> **`DRAG_EXP_RUN(`<u>`TeamID`</u>`, `<u>`Date`</u>`, `<u>`Trial`</u>`, DragF, Mass, Vel, Accel)`**.',
          'Step 4 — Map Binary `M:N` Relationship `Member-of (Student M — N Team)` [2.5M]: Create a dedicated junction relation **`MEMBER_OF(`<u>`StudentID`</u>`, `<u>`TeamID`</u>`)`** where `StudentID` references `STUDENT(StudentID)` and `TeamID` references `TEAM(TeamID)`.',
        ],
        codeBlock: {
          title: 'Final Mapped Relational Schema — Official Model QP Q4',
          language: 'markdown',
          content:
`| Step | Relation Name | Attributes (<u>Primary Key</u> Underlined) | Foreign Keys & Mapping Rule |
| :--- | :--- | :--- | :--- |
| **Step 1** | **STUDENT** | (<u>StudentID</u>, FirstName, LastName, year, semester, section) | Composite \`name\` and \`class\` flattened into atomic columns |
| **Step 1** | **LAB_SECTION** | (<u>year</u>, <u>semester</u>, <u>section</u>, LabInstructor) | Composite PK \`class(year, semester, section)\` flattened |
| **Steps 1 & 4** | **TEAM** | (<u>TeamID</u>, TeamName, SectionYear, SectionSemester, SectionNo) | \`(SectionYear, SectionSemester, SectionNo)\` FK → \`LAB_SECTION\` (\`1:N Made-of\`) |
| **Step 2** | **DRAG_EXP_RUN** | (<u>TeamID</u>, <u>Date</u>, <u>Trial</u>, DragF, Mass, Vel, Accel) | \`TeamID\` FK → \`TEAM\` (\`ON DELETE CASCADE\`); Weak partial key \`(Date, Trial)\` |
| **Step 5** | **MEMBER_OF** | (<u>StudentID</u>, <u>TeamID</u>) | \`StudentID\` → \`STUDENT\`, \`TeamID\` → \`TEAM\` (\`M:N Member-of\`) |`,
        },
        commonPitfalls:
          'Using `(Date, Trial)` alone as the primary key of `DRAG_EXP_RUN` without including owner key `TeamID`, or forgetting to flatten composite attributes `name(FirstName, LastName)` and `class(year, semester, section)`.',
      },
      {
        sourcePaper: 'Exam Pattern Method · Mapping ER / EER Diagrams (e.g. A2 Q3 Hotel & A1 Q3 ARRMS) [CO5, BL3]',
        questionPrompt:
          'Typical Exam Requirement: Convert an ER/EER diagram (including Weak Entities, M:N Relationships with Attributes, Multivalued Attributes, and Specialization Hierarchies) into Relational Schemas stating Primary Keys and Foreign Keys.',
        solvingMethod: [
          'Step 1 — Map Strong Entities (`Step 1`) & Multivalued Attributes (`Step 6`): Create base tables flattening composite attributes, and split any `{Multivalued}` oval into `(Owner_PK, Value)` with composite PK.',
          'Step 2 — Map Weak Entities (`Step 2`): Pull Owner PK into Weak table as `NOT NULL` FK and underline `(Owner_PK, Partial_Key)` together as composite PK (e.g., `BED(Room_No, Bed_No, Bed_Type)`).',
          'Step 3 — Map Relationships (`Steps 3–5, 7`): `1:N` absorbs parent PK into `N`-side (`BOOKING` gets `Guest_ID` FK); `M:N` & `Ternary` create dedicated junction tables holding all participating PKs + relationship attributes (`USES_SERVICE(Booking_ID, Service_ID, Service_Date, Quantity)`).',
          'Step 4 — Map EER Hierarchies (`Options 8A–8D`): Pick **8A** whenever partial/overlapping (`STAKEHOLDER`, `FARM_OWNER`, `AGRONOMIST`) or **8B/8C** for disjoint+total (`CROP -> FOOD_CROP | INDUSTRIAL_CROP` or `BED(Room_No, Bed_No, Bed_Type)` via 8C!).',
        ],
        codeBlock: {
          title: 'Complete Relational Mapping of A2 Q3 Hotel ER/EER Schema',
          language: 'markdown',
          content:
`| Relation | Attributes (<u>Primary Key</u> Underlined) | Foreign Keys & EER Mapping Note |
| :--- | :--- | :--- |
| **GUEST** | (<u>Guest_ID</u>, Name, Phone, Email) | Strong entity (Step 1) |
| **ROOM** | (<u>Room_No</u>, Room_Type, Tariff) | Strong entity (Step 1) |
| **BOOKING** | (<u>Booking_ID</u>, Guest_ID, Booking_Date, Check_In, Check_Out) | \`Guest_ID\` FK → \`GUEST\` (\`1:N\` Step 4) |
| **BOOKING_RM** | (<u>Booking_ID</u>, <u>Room_No</u>) | Both PK cols are FKs → \`BOOKING\`, \`ROOM\` (\`M:N\` Step 5) |
| **SERVICE** | (<u>Service_ID</u>, Service_Name, Charge) | Strong entity (Step 1) |
| **BOOK_SVC** | (<u>Booking_ID</u>, <u>Service_ID</u>, <u>Service_Date</u>, Quantity) | FKs → \`BOOKING\`, \`SERVICE\` (\`M:N\` + rel attrs Step 5) |
| **BED** | (<u>Room_No</u>, <u>Bed_No</u>, Bed_Type) | \`Room_No\` FK → \`ROOM\`; Weak Step 2 + EER Option **8C** |`,
        },
        commonPitfalls:
          'Putting a single `1:N` FK inside `ROOM` for `BOOKING` when the relationship is `M:N` ("Booking includes >=1 Room AND a Room has multiple Bookings over time")—`M:N` ALWAYS needs a separate junction table `BOOKING_ROOM`!',
      },
    ],
    exampleTitle: 'PPT Rule Summary: ER Diagram -> Relational Tables (Slides 85–90)',
    exampleBody:
`- **Strong Entity** \`E(\`<u>\`a1\`</u>\`, a2, {mv})\`: → \`E(\`<u>\`a1\`</u>\`, a2)\` + \`E_MV(\`<u>\`a1\`</u>\`, \`<u>\`mv\`</u>\`)\` (\`a1\` FK → \`E\`)
- **Weak Entity \`W(b1_part, b2)\` of \`E\`:** → \`W(\`<u>\`a1\`</u>\`, \`<u>\`b1_part\`</u>\`, b2)\` (\`a1\` \`NOT NULL\` FK → \`E\`)
- **Binary \`1:N\` (\`E1 1 — N E2, r\`):** → Absorb \`E1.PK\` as FK + \`r\` directly inside \`E2\`
- **Binary \`M:N\` (\`E1 M — N E2, r\`):** → Junction \`R(\`<u>\`E1.PK\`</u>\`, \`<u>\`E2.PK\`</u>\`, r)\` with both FKs`,
    examTip:
      'Always state explicitly WHICH EER option (`8A`, `8B`, `8C`, or `8D`) you chose and WHY (e.g., "`8A` chosen because hierarchy is Overlapping, avoiding duplicate superclass tuples").',
    selfChecks: [
      {
        question:
          'When mapping a Weak Entity DEPENDENT(Dep_Name, Age) owned by EMPLOYEE(SSN), what is the correct Primary Key of the resulting DEPENDENT table?',
        options: [
          'Dep_Name alone',
          'SSN alone',
          '(SSN, Dep_Name) composite Primary Key, where SSN is a Foreign Key referencing EMPLOYEE(SSN)',
          'A newly generated Surrogate_ID without referencing EMPLOYEE',
        ],
        correctIndex: 2,
        explanation:
          'Step 2 of the ER-to-Relational mapping algorithm combines the identifying owner\'s PK (SSN) with the weak entity\'s partial key (Dep_Name) to form the composite PK (SSN, Dep_Name).',
      },
      {
        question:
          'Under what specialization constraint MUST EER Mapping Option 8B (creating subclass tables only, omitting the superclass table) NOT be used because it duplicates inherited superclass data across rows?',
        options: [
          'Disjoint and Total',
          'Overlapping (o)',
          'Predicate-defined Disjoint',
          'Binary 1:1 weak mapping',
        ],
        correctIndex: 1,
        explanation:
          'Option 8B copies all superclass attributes into every subclass table. If subclasses are Overlapping (o), an entity belonging to two subclasses has its superclass attributes duplicated inconsistently in two tables; Partial hierarchies would also lose superclass-only instances.',
      },
    ],
  },

  'm2-t4': {
    summary:
      'Functional Dependencies (`X -> Y`) formally capture attribute constraints and reveal **Insertion, Deletion, and Update anomalies**. Mastering **Armstrong’s Axioms**, **Attribute Closure (`X+`)**, Candidate Key discovery, and the **3-Step Minimal Cover** algorithm prepares every input for BCNF/3NF normalization.',
    sourceDecks: [
      'Module 2. Part 2 Functional dependencies.pptx (Slides 1–31)',
      'Module-2-Consolidated.ppt (Slides 151–175)',
    ],
    keyPoints: [
      {
        heading: 'Three Data Modification Anomalies (A1 Q2-B)',
        text: 'Mixing two independent entity facts in one unnormalized table (`PROJECT_GRANT` or `EMP_PROJ`) creates: **Insertion Anomaly** (cannot insert a new PI without inventing a fake Project), **Deletion Anomaly** (deleting the last project wipes out the PI’s details), and **Update Anomaly** (updating `PI_Name` requires editing multiple rows or creates inconsistency).',
      },
      {
        heading: 'Armstrong’s Axioms (Sound & Complete) + Derived Inference Rules',
        text: '**IR1 Reflexivity:** `Y ⊆ X => X -> Y` (trivial FD). **IR2 Augmentation:** `X -> Y => XZ -> YZ`. **IR3 Transitivity:** `X -> Y ∧ Y -> Z => X -> Z`. Derived rules: **Union** (`X->Y, X->Z => X->YZ`), **Decomposition** (`X->YZ => X->Y, X->Z`), **Pseudotransitivity** (`X->Y, WY->Z => WX->Z`).',
      },
      {
        heading: 'Attribute Closure (`X+`), Candidate Keys & 3-Step Minimal Cover (`Fc`)',
        text: '`X+` collects all attributes implied by `X` under `F`. An attribute **never appearing on any RHS** MUST belong to every Candidate Key (`L`-only!). **Minimal Cover `Fc`:** (1) Split RHS to singletons, (2) Remove extraneous LHS attributes, (3) Drop redundant FDs.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Formal FD Types, Inference Rules & `L / LR / R` Key Shortcut',
        body: 'In any relation `R`, `X -> Y` holds iff whenever two tuples agree on `X`, they must agree on `Y`. Before computing keys blindly across all subsets of attributes, classify every attribute of `R`:',
        table: {
          headers: ['Bucket', 'Appears in FDs As...', 'Candidate Key Membership Rule'],
          rows: [
            ['L (Left-Only / Neither)', 'Only on LHS, OR never in any FD', 'MUST belong to EVERY Candidate Key (essential!)'],
            ['R (Right-Only)', 'ONLY on RHS (never on LHS)', 'CANNOT help determine anything -> exclude from minimal keys'],
            ['LR (Both Sides)', 'On both LHS and RHS', 'Test `L+` first; only if `L+ != R`, append combinations from `LR`'],
          ],
        },
        bullets: [
          '**Trivial FD (`X -> Y`, `Y ⊆ X`):** Always holds (`{Stud_ID, Name} -> Name`). **Non-Trivial:** At least one attribute of `Y` is not in `X`. **Completely Non-Trivial:** `X ∩ Y = ∅`.',
          '**Equivalence of FD Sets (`E ≡ F`):** `E` covers `F` if every FD `X -> Y` in `F` satisfies `Y ⊆ (X+)_E`. Two FD sets are equivalent iff `E` covers `F` AND `F` covers `E`.',
        ],
      },
      {
        title: '2. The 3-Step Minimal (Canonical) Cover Algorithm (`Fc`) & Slide Closure Walkthrough',
        body: 'Always execute the 3 Minimal Cover steps in **exact order**—and trace attribute closures iteration-by-iteration as shown in `M2_Part2_FD.pptx` (Slides 19–27):',
        markdownBlock:
`#### Slide Classification of Functional Dependencies (\`M2_Part2_FD.pptx\`, Slides 19–21)
| FD Category | Formal Condition (\`X → Y\`) | Slide Example (\`EMP(emp_id, emp_name, emp_address, emp_salary)\`) |
| :--- | :--- | :--- |
| **Trivial FD** | \`Y ⊆ X\` (RHS is a subset of LHS) | \`{emp_id, emp_name} → emp_name\` |
| **Non-Trivial (Semi-Trivial) FD** | At least 1 element of \`Y\` is not in \`X\` (\`Y − X ≠ ∅\`) | \`{emp_id, emp_name} → {emp_name, emp_address}\` |
| **Completely Non-Trivial FD** | \`X ∩ Y = ∅\` (zero overlap between LHS and RHS) | \`emp_id → emp_address\` · \`{emp_id, emp_name} → {emp_address, emp_salary}\` |

#### Slide Attribute Closure Trace (\`EMP_PROJ\`, Slides 24–26)
- **Schema:** \`EMP_PROJ(SSN, PNUMBER, HOURS, ENAME, PNAME, PLOCATION)\`
- **FDs:** \`F = { SSN → ENAME,  PNUMBER → {PNAME, PLOCATION},  {SSN, PNUMBER} → HOURS }\`
  1. \`{SSN}+ = {SSN} → {SSN, ENAME}\` *(not a superkey)*
  2. \`{PNUMBER}+ = {PNUMBER} → {PNUMBER, PNAME, PLOCATION}\` *(not a superkey)*
  3. \`{SSN, PNUMBER}+ = {SSN, PNUMBER, ENAME, PNAME, PLOCATION, HOURS}\` = **All 6 attributes → Superkey & Candidate Key!**

#### Minimal Cover Walkthrough (\`F = { A → BC, B → C, A → B, AB → C }\`)
1. **Step 1 (Singleton RHS — Decomposition Rule):** \`F1 = { A → B, A → C, B → C, AB → C }\`
2. **Step 2 (Remove Extraneous LHS Attributes):** Test \`AB → C\`: under \`F1\`, \`A+ = {A, B, C}\` already contains \`C\`, so \`B\` is **extraneous**! Replace \`AB → C\` with \`A → C\` and deduplicate: \`F2 = { A → B, A → C, B → C }\`.
3. **Step 3 (Remove Redundant FDs):** Test dropping \`A → C\`: in \`{ A → B, B → C }\`, \`A+ = {A, B, C}\` still implies \`C\`! Drop \`A → C\`.
> **Minimal Cover:** \`Fc = { A → B, B → C }\``,
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q2(B) [6M of 10M, CO1, BL2]',
        questionPrompt:
          'Q2(B): Consider PROJECT_GRANT(Project_ID, Project_Title, Principal_Investigator_SSN, PI_Name, Sponsor_Agency, Budget_Amount), where each project has 1 PI and 1 Sponsor Agency, and a PI can lead multiple projects. Briefly distinguish the three modification anomalies with respect to PROJECT_GRANT: (1) Insertion Anomaly, (2) Deletion Anomaly, (3) Update (Modification) Anomaly. [6M]',
        solvingMethod: [
          'Step 1 — Diagnose Root Cause [1M]: Explain that `PROJECT_GRANT` combines two distinct facts in one table (`Project` attributes + repeating `PI_Name` via `Principal_Investigator_SSN -> PI_Name`), causing redundancy whenever one PI leads multiple projects.',
          'Step 2 — Insertion Anomaly [1.5M]: Cannot insert a newly hired Principal Investigator (SSN + `PI_Name`) until they are assigned at least one active `Project_ID` (leaving `Project_ID` NULL violates Entity Integrity PK)!',
          'Step 3 — Deletion Anomaly [1.5M]: If a PI leads only one project (`P105`) and we `DELETE` project `P105` after completion, all information about that PI (`PI_Name`, `SSN`) is unintentionally lost from the database.',
          'Step 4 — Update (Modification) Anomaly [2M]: If a PI leads 5 projects and changes their legal `PI_Name`, we must update all 5 rows; updating only 1 row leaves conflicting `PI_Name` values for the same `Principal_Investigator_SSN`.',
        ],
        commonPitfalls:
          'Giving generic textbook definitions using `EMP_DEPT` instead of concrete `PROJECT_GRANT` attributes (`Project_ID`, `Principal_Investigator_SSN`, `PI_Name`)—the rubric explicitly asks for examples *with respect to the given `PROJECT_GRANT` relation*!',
      },
      {
        sourcePaper: 'Exam Pattern Method · Candidate Keys (`L/LR/R`) & Minimal Cover Proof [CO5, BL3]',
        questionPrompt:
          'Standard Numerical: Given R(A,B,C,D,E) and F = { A -> BC, CD -> E, B -> D, E -> A }, find all Candidate Keys and prove key minimality.',
        solvingMethod: [
          'Step 1 — Partition Attributes (`L`, `LR`, `R`): Notice ALL 5 attributes appear on both LHS and RHS (`L = ∅`, `LR = {A,B,C,D,E}`, `R = ∅`).',
          'Step 2 — Compute Single-Attribute Closures: `A+ = {A,B,C,D,E}` (**CK1 = `A`**!), `E -> A => E+ = {E,A,B,C,D}` (**CK2 = `E`**!). Meanwhile `B+ = {B,D}`, `C+ = {C}`, `D+ = {D}` (not keys alone).',
          'Step 3 — Test 2-Attribute Combinations Excluding Superkeys (`A`, `E`): Test `{B,C}+ = {B,C,D,E,A}` (**CK3 = `BC`**!), `{C,D}+ = {C,D,E,A,B}` (**CK4 = `CD`**!), `{B,D}+ = {B,D}`. No proper subset of `BC` or `CD` is a superkey.',
          'Step 4 — Conclude: Candidate Keys = **`{A}, {E}, {BC}, {CD}`**; Prime = `{A,B,C,D,E}` (all 5!).',
        ],
        commonPitfalls:
          'Stopping after finding the first Candidate Key `{A}`! Always trace `Y -> X` chains backward (like `E -> A` and `CD -> E` and `B -> D`) to catch ALL candidate keys so you never misclassify a Prime attribute as Non-Prime.',
      },
    ],
    exampleTitle: 'Six Armstrong Inference Rules Cheat Sheet (Slides 15–16)',
    exampleBody:
`### Primary Axioms (Sound & Complete)
- **IR1 Reflexivity:** \`Y ⊆ X ⇒ X → Y\`
- **IR2 Augmentation:** \`X → Y ⇒ XZ → YZ\`
- **IR3 Transitivity:** \`X → Y ∧ Y → Z ⇒ X → Z\`

### Derived Inference Rules
- **Union:** \`X → Y ∧ X → Z ⇒ X → YZ\`
- **Decomposition:** \`X → YZ ⇒ X → Y\` and \`X → Z\`
- **Pseudotransitivity:** \`X → Y ∧ WY → Z ⇒ WX → Z\``,
    examTip:
      'Memorize **Pseudotransitivity (`X->Y, WY->Z => WX->Z`)**—it is the single most tested derived rule in short questions because people often mistake it for simple transitivity.',
    selfChecks: [
      {
        question:
          'Given R(A, B, C, D) with FDs { AB -> C, C -> D, D -> A }, which set lists ALL Candidate Keys of R?',
        options: [
          '{AB} only',
          '{AB}, {BC}, {BD}',
          '{AB}, {CD}, {AD}',
          '{A}, {B}, {C}, {D}',
        ],
        correctIndex: 1,
        explanation:
          'B never appears on any RHS (L-only -> B is in every key!). Check closures: AB+ = ABCD, BC+ -> D -> A = ABCD, BD+ -> A -> C = ABCD. Hence all three are {AB}, {BC}, {BD}.',
      },
      {
        question:
          'In the 3-Step Minimal Cover algorithm, why MUST removing extraneous LHS attributes (Step 2) happen BEFORE checking redundant FDs (Step 3)?',
        options: [
          'Because Step 2 adds new attributes to the RHS',
          'Because eliminating an extraneous LHS attribute can turn an FD into an exact duplicate or make another FD redundant under Step 3',
          'Because Armstrong\'s Reflexivity only applies after Step 3',
          'Order does not matter; Step 3 and Step 2 are commutative',
        ],
        correctIndex: 1,
        explanation:
          'Reducing AB -> C to A -> C can expose redundancies (or merges duplicates) with other FDs like A -> B and B -> C that would otherwise be missed.',
      },
    ],
  },

  'm2-t5': {
    summary:
      'Normalization systematically eliminates data redundancy and anomalies by progressing through **1NF → 2NF → 3NF → BCNF (3.5NF)**, ensuring every decomposition satisfies **Lossless (Non-Additive) Join** (zero spurious tuples) and, through 3NF, **Dependency Preservation**.',
    sourceDecks: [
      'Module 2. Part 1 Relational Database Design.pptx (Slides 13–26)',
      'Module-2-Consolidated.ppt (Slides 163–206)',
    ],
    keyPoints: [
      {
        heading: '1NF (Atomicity) & 2NF (Zero Partial Dependency)',
        text: '**1NF:** Every attribute holds atomic values (no multivalued lists or nested tables), homogeneous column domains, unique column names. **2NF:** In 1NF + **NO Partial Dependency** — no proper subset of ANY candidate key determines a non-prime attribute.',
      },
      {
        heading: '3NF (Zero Transitive / Non-Key Dependency)',
        text: 'In 2NF + **NO Transitive Dependency**. Formal 3NF test: for every non-trivial FD `X -> Y`, EITHER **`X` is a superkey** OR **`Y` is a subset of prime attributes**. **3NF always guarantees BOTH Lossless Join AND Dependency Preservation.**',
      },
      {
        heading: 'BCNF (Boyce-Codd NF / 3.5NF) & Lossless Join Test',
        text: 'For every non-trivial FD `X -> Y`, **`X` MUST be a Superkey** (drops the prime-attribute exception of 3NF!). Decomposition `R -> (R1, R2)` is **Lossless** iff `(R1 ∩ R2) -> R1` OR `(R1 ∩ R2) -> R2` holds in `F+` (avoids **spurious tuples**).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Four Design Goodness Guidelines, Spurious Tuples & 5 Advantages of Normalization',
        body: 'From `Module 2. Part 1 Relational Database Design.pptx` (Slides 4–25):',
        bullets: [
          '**Guideline 1 (Semantics):** Do not combine attributes from two entity types (`EMPLOYEE` + `DEPARTMENT`) in one relation.',
          '**Guideline 2 (Redundancy):** Eliminate duplicate copies that cause Insertion, Deletion, and Update anomalies.',
          '**Guideline 3 (Minimize NULLs):** Move frequently NULL attributes into their own table rather than bloating sparse rows.',
          '**Guideline 4 (No Spurious Tuples — Slides 21–24):** Splitting `EMP_PROJ` into `EMP_LOCS(Ename, Plocation)` and `EMP_PROJ1(Ssn, Pnumber, Hours, Pname, Plocation)` and joining on non-key `Plocation` generates **spurious tuples** (more rows than the original table!). Joining on **Primary Key / Foreign Key equality** (`(R1 ∩ R2) -> R1` or `R2`) guarantees **Non-Additive (Lossless) Join** (a strict requirement that *cannot* be sacrificed, whereas Dependency Preservation is desirable but may occasionally be sacrificed for BCNF).',
          '**5 Advantages of Normalization (Slide 25):** (1) Smaller database size by eliminating duplicate data; (2) Faster sequential scans and shorter passes over compact tables; (3) Narrower tables (fewer columns) pack more records per disk page; (4) Fewer indexes per table speed up `INSERT/UPDATE` maintenance; (5) Queries join only the specific tables needed.',
        ],
      },
      {
        title: '2. Exact Normal Form Decision Matrix (1NF → BCNF)',
        body: 'Check FDs top-to-bottom in **exact order** when an exam asks *"Identify the highest Normal Form currently satisfied"*: ',
        table: {
          headers: ['Normal Form', 'Formal Condition on Non-Trivial X -> Y', 'Common Failure Example', 'Trade-Off'],
          rows: [
            ['1NF', 'All attributes atomic (no repeating groups)', 'Courses = "DBMS, OS" in 1 cell', 'Base relational requirement'],
            ['2NF', 'No (Proper Subset of any CK) -> Non-Prime Attr', 'CK={PID, Date}; {PID, Date}->Doc_ID', 'Always lossless & FD-preserving'],
            ['3NF', 'X is Superkey  OR  each A in Y is Prime', 'Non-key Doc_ID -> Doc_Name (non-prime)', 'Always lossless & FD-preserving'],
            ['BCNF', 'X MUST be a Superkey (strictest!)', 'AB -> C, C -> B (C->B fails BCNF, OK in 3NF)', 'Always lossless; may LOSE FD preservation'],
          ],
        },
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q3(a) & Q3(b) [3M + 7M = 10M, CO2]',
        questionPrompt:
          'Q3: LIBRARY_ISSUE(IssueID, IssueDate, StudentID, StudentName, DeptID, DeptName, BookID, BookTitle, AuthorID, AuthorName, Publisher, QuantityIssued)\nFunctional Dependencies:\n• FD1: IssueID → IssueDate, StudentID\n• FD2: StudentID → StudentName, DeptID\n• FD3: DeptID → DeptName\n• FD4: BookID → BookTitle, AuthorID, Publisher\n• FD5: AuthorID → AuthorName\n• FD6: (IssueID, BookID) → QuantityIssued\na) Identify the candidate key(s) for the relation LIBRARY_ISSUE. [3 Marks]\nb) Analyze the table for violations of 2NF, 3NF, and BCNF, and decompose the relation into BCNF relations, clearly indicating primary and foreign keys. [7 Marks]',
        solvingMethod: [
          'Part (a) — Candidate Key Identification & Justification [3M]: Partition attributes into `L` (left-only) and `LR/R`: **`IssueID` and `BookID` never appear on the RHS of any FD (`FD1..FD6`)**, so `{IssueID, BookID}` MUST belong to every candidate key. Compute `{IssueID, BookID}+`: FD1 adds `{IssueDate, StudentID}`; FD2 adds `{StudentName, DeptID}`; FD3 (`DeptID -> DeptName`) adds `DeptName`; FD4 adds `{BookTitle, AuthorID, Publisher}`; FD5 (`AuthorID -> AuthorName`) adds `AuthorName`; FD6 adds `QuantityIssued`. Thus `{IssueID, BookID}+` covers **all 12 attributes**! Since neither `{IssueID}+` nor `{BookID}+` alone covers all 12 attributes, the unique **Candidate Key is `(IssueID, BookID)`**. Prime = `{IssueID, BookID}`; Non-Prime = remaining 10 attributes.',
          'Part (b) Step 1 — Audit All Normal Form Violations by FD [2M]:\n  • **2NF Violations (Partial Dependencies — proper subset of CK `(IssueID, BookID)` determines non-prime attributes):**\n    - **`FD1: IssueID → IssueDate, StudentID`** (`IssueID ⊂ {IssueID, BookID}`)\n    - **`FD4: BookID → BookTitle, AuthorID, Publisher`** (`BookID ⊂ {IssueID, BookID}`)\n  • **3NF Violations (Transitive Dependencies — non-superkey determines non-prime attributes):**\n    - **`FD2: StudentID → StudentName, DeptID`** (via `IssueID -> StudentID`)\n    - **`FD3: DeptID → DeptName`** (via `IssueID -> StudentID -> DeptID -> DeptName`)\n    - **`FD5: AuthorID → AuthorName`** (via `BookID -> AuthorID -> AuthorName`)\n  • **BCNF Violations:** `FD1`, `FD2`, `FD3`, `FD4`, and `FD5` all have determinants that are **NOT superkeys** of `LIBRARY_ISSUE` (only `FD6` has superkey `(IssueID, BookID)` as its LHS). Highest NF currently satisfied = **`1NF`**.',
          'Part (b) Step 2 — Lossless 6-Table BCNF Decomposition [5M]: Decompose iteratively on violating FDs:\n  • **1. `DEPARTMENT(`<u>`DeptID`</u>`, DeptName)`** [FD3, CK = `DeptID` -> BCNF]\n  • **2. `STUDENT(`<u>`StudentID`</u>`, StudentName, DeptID [FK → DEPARTMENT])`** [FD2, CK = `StudentID` -> BCNF]\n  • **3. `AUTHOR(`<u>`AuthorID`</u>`, AuthorName)`** [FD5, CK = `AuthorID` -> BCNF]\n  • **4. `BOOK(`<u>`BookID`</u>`, BookTitle, AuthorID [FK → AUTHOR], Publisher)`** [FD4, CK = `BookID` -> BCNF]\n  • **5. `ISSUE_HEADER(`<u>`IssueID`</u>`, IssueDate, StudentID [FK → STUDENT])`** [FD1, CK = `IssueID` -> BCNF]\n  • **6. `ISSUE_LINE(`<u>`IssueID`</u>` [FK → ISSUE_HEADER], `<u>`BookID`</u>` [FK → BOOK], QuantityIssued)`** [FD6, CK = `(IssueID, BookID)` -> BCNF].',
        ],
        codeBlock: {
          title: 'Final 6-Table Lossless & FD-Preserving BCNF Schema — Official Model QP Q3',
          language: 'markdown',
          content:
`| Relation | Attributes (<u>Primary Key</u> Underlined) | Foreign Keys | Active FD & BCNF Check |
| :--- | :--- | :--- | :--- |
| **DEPARTMENT** | (<u>DeptID</u>, DeptName) | — | \`DeptID → DeptName\` (\`DeptID\` is Superkey) |
| **STUDENT** | (<u>StudentID</u>, StudentName, DeptID) | \`DeptID → DEPARTMENT\` | \`StudentID → StudentName, DeptID\` (\`StudentID\` is Superkey) |
| **AUTHOR** | (<u>AuthorID</u>, AuthorName) | — | \`AuthorID → AuthorName\` (\`AuthorID\` is Superkey) |
| **BOOK** | (<u>BookID</u>, BookTitle, AuthorID, Publisher) | \`AuthorID → AUTHOR\` | \`BookID → BookTitle, AuthorID, Publisher\` (\`BookID\` is Superkey) |
| **ISSUE_HEADER** | (<u>IssueID</u>, IssueDate, StudentID) | \`StudentID → STUDENT\` | \`IssueID → IssueDate, StudentID\` (\`IssueID\` is Superkey) |
| **ISSUE_LINE** | (<u>IssueID</u>, <u>BookID</u>, QuantityIssued) | \`IssueID → ISSUE_HEADER\`, \`BookID → BOOK\` | \`(IssueID, BookID) → QuantityIssued\` (Superkey) |`,
        },
        commonPitfalls:
          'Missing the transitive chains inside `Student` and `Book` (`FD3: DeptID -> DeptName` and `FD5: AuthorID -> AuthorName`), which leaves `STUDENT` or `BOOK` stuck in 2NF instead of achieving true BCNF!',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q4 [10M, CO5, BL3]',
        questionPrompt:
          'Q4: PATIENT_DIAGNOSIS(Patient_ID, Appt_Date, Doctor_ID, Doctor_Name, Dept_Code, Dept_Head, Test_Name, Test_Result).\nFDs:\n• FD1: Patient_ID, Appt_Date -> Doctor_ID\n• FD2: Doctor_ID -> Doctor_Name, Dept_Code\n• FD3: Dept_Code -> Dept_Head\n• FD4: Patient_ID, Appt_Date, Test_Name -> Test_Result\nA. What is the highest normal form satisfied by PATIENT_DIAGNOSIS? [4M]\nB. Decompose PATIENT_DIAGNOSIS into BCNF. [6M]',
        solvingMethod: [
          'Part A Step 1 — Candidate Key & Prime/Non-Prime [2M]: `Patient_ID`, `Appt_Date`, `Test_Name` never appear on any RHS (`L`-only!). Compute `{Patient_ID, Appt_Date, Test_Name}+`: FD1 adds `Doctor_ID` -> FD2 adds `Doctor_Name, Dept_Code` -> FD3 adds `Dept_Head` -> FD4 adds `Test_Result` -> covers all 8 attributes! Only Candidate Key = **`{Patient_ID, Appt_Date, Test_Name}`**. Prime = `{Patient_ID, Appt_Date, Test_Name}`; Non-Prime = remaining 5 attributes.',
          'Part A Step 2 — Identify Highest Normal Form [2M]: Atomic domains -> **Satisfies 1NF**. Test 2NF: Look at **FD1 (`Patient_ID, Appt_Date -> Doctor_ID`)**! Its LHS `{Patient_ID, Appt_Date}` is a **proper subset of the Candidate Key** and its RHS `Doctor_ID` is **non-prime** -> **Partial Dependency** -> **FAILS 2NF!** Therefore, Highest Normal Form = **`1NF`**. (Also note FD2 & FD3 are transitive dependencies).',
          'Part B — Step-by-Step Lossless BCNF Decomposition [6M]: Decompose on violating FDs (non-superkey LHS) one by one:',
          '  1) Split on `Dept_Code -> Dept_Head` (FD3): **`R4(Dept_Code, Dept_Head)`** [CK: `Dept_Code` -> BCNF] & remaining `R_rem1(Patient_ID, Appt_Date, Doctor_ID, Doctor_Name, Dept_Code, Test_Name, Test_Result)`.',
          '  2) Split on `Doctor_ID -> Doctor_Name, Dept_Code` (FD2): **`R3(Doctor_ID, Doctor_Name, Dept_Code)`** [CK: `Doctor_ID` -> BCNF] & `R_rem2(Patient_ID, Appt_Date, Doctor_ID, Test_Name, Test_Result)`.',
          '  3) Split on `Patient_ID, Appt_Date -> Doctor_ID` (FD1): **`R2(Patient_ID, Appt_Date, Doctor_ID)`** [CK: `(Patient_ID, Appt_Date)` -> BCNF] & **`R1(Patient_ID, Appt_Date, Test_Name, Test_Result)`** [CK: `(Patient_ID, Appt_Date, Test_Name)` -> BCNF].',
        ],
        codeBlock: {
          title: 'Final BCNF Schema & Lossless Verification — A1+TA1 Q4',
          language: 'markdown',
          content:
`| Relation | Attributes (<u>Candidate Key</u>) | Determinant Check |
| :--- | :--- | :--- |
| **R1** | (<u>Patient_ID</u>, <u>Appt_Date</u>, <u>Test_Name</u>, Test_Result) | \`(Patient_ID, Appt_Date, Test_Name)\` = Superkey |
| **R2** | (<u>Patient_ID</u>, <u>Appt_Date</u>, Doctor_ID) | \`(Patient_ID, Appt_Date)\` = Superkey |
| **R3** | (<u>Doctor_ID</u>, Doctor_Name, Dept_Code) | \`Doctor_ID\` = Superkey |
| **R4** | (<u>Dept_Code</u>, Dept_Head) | \`Dept_Code\` = Superkey |

> **BCNF Verdict:** Every FD's LHS in \`R1..R4\` is its relation's Superkey — **ALL 4 tables are Lossless, FD-Preserving & BCNF!**`,
        },
        commonPitfalls:
          'Mistakenly reporting highest NF = `2NF` because students only glance at `Doctor_ID -> Dept_Code` and forget to test **FD1 (`{Patient_ID, Appt_Date} -> Doctor_ID`)**, which is a **Partial Dependency** on the 3-attribute CK `{Patient_ID, Appt_Date, Test_Name}`!',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q9(a) [10M, CO5, BL3]',
        questionPrompt:
          'Q9(a): PROJECT_EVALUATION(Student_ID, Project_ID, Title, Guide_ID, Guide_Name, Department, Evaluation_Date, Marks).\nFDs:\n• Student_ID, Project_ID -> Evaluation_Date, Marks\n• Project_ID -> Title, Guide_ID\n• Guide_ID -> Guide_Name, Department\nAssume a student can work on multiple projects, and a project has 1 guide. Identify candidate key(s), normalize up to 3NF showing relations & keys at each stage, and determine whether final relations satisfy BCNF with justification. [10M]',
        solvingMethod: [
          'Step 1 — Candidate Key & Initial NF [2.5M]: `Student_ID` and `Project_ID` never appear on any RHS (`L`-only!). `{Student_ID, Project_ID}+` reaches `Evaluation_Date, Marks` -> `Title, Guide_ID` -> `Guide_Name, Department` = all 8 attributes! Only Candidate Key = **`{Student_ID, Project_ID}`**. Because `Project_ID -> Title, Guide_ID` is a Partial Dependency on proper subset `Project_ID`, original relation is only in **`1NF`** (fails 2NF).',
          'Step 2 — 1NF to 2NF (Eliminate Partial Dependency `Project_ID -> Title, Guide_ID`) [2.5M]: Separate `Project_ID` and everything transitively determined by it (`Title, Guide_ID, Guide_Name, Department`): `EVALUATION(Student_ID, Project_ID, Evaluation_Date, Marks)` [PK: `(Student_ID, Project_ID)`] and `PROJECT_GUIDE(Project_ID, Title, Guide_ID, Guide_Name, Department)` [PK: `Project_ID`].',
          'Step 3 — 2NF to 3NF (Eliminate Transitive Dependency `Project_ID -> Guide_ID -> Guide_Name, Department`) [2.5M]: Decompose `PROJECT_GUIDE` on `Guide_ID -> Guide_Name, Department`: **`PROJECT(Project_ID, Title, Guide_ID)`** [PK: `Project_ID`, FK: `Guide_ID`] and **`GUIDE(Guide_ID, Guide_Name, Department)`** [PK: `Guide_ID`].',
          'Step 4 — BCNF Justification [2.5M]: Check active FDs in all 3 tables: `(Student_ID, Project_ID) -> Evaluation_Date, Marks` (LHS = PK of `EVALUATION`); `Project_ID -> Title, Guide_ID` (LHS = PK of `PROJECT`); `Guide_ID -> Guide_Name, Department` (LHS = PK of `GUIDE`). Since EVERY determinant is a Superkey, **ALL 3 relations satisfy BCNF!**',
        ],
        codeBlock: {
          title: 'Stage-by-Stage 1NF -> 2NF -> 3NF -> BCNF Proof — A2+TA2 Q9(a)',
          language: 'markdown',
          content:
`1. **Stage 1 (1NF):** \`PROJECT_EVALUATION(\`<u>\`Student_ID\`</u>\`, \`<u>\`Project_ID\`</u>\`, Title, Guide_ID, Guide_Name, Department, Evaluation_Date, Marks)\`
2. **Stage 2 (2NF):**
   - \`EVALUATION(\`<u>\`Student_ID\`</u>\`, \`<u>\`Project_ID\`</u>\`, Evaluation_Date, Marks)\`
   - \`PROJECT_GUIDE(\`<u>\`Project_ID\`</u>\`, Title, Guide_ID, Guide_Name, Department)\`
3. **Stage 3 (3NF):**
   - \`EVALUATION(\`<u>\`Student_ID\`</u>\`, \`<u>\`Project_ID\`</u>\`, Evaluation_Date, Marks)\`
   - \`PROJECT(\`<u>\`Project_ID\`</u>\`, Title, Guide_ID [FK → GUIDE])\`
   - \`GUIDE(\`<u>\`Guide_ID\`</u>\`, Guide_Name, Department)\`

> **BCNF Verdict:** **YES** — every FD's determinant is a Candidate Key of its relation.`,
        },
        commonPitfalls:
          'Putting `Title` in `EVALUATION` instead of moving it out to `PROJECT` in 2NF, or forgetting to state the final **BCNF check** for each of the 3 resulting tables (`EVALUATION`, `PROJECT`, `GUIDE`).',
      },
    ],
    exampleTitle: 'Professor’s R(P, Q, R, S, T, U) Running BCNF Check (Slides 195–203)',
    exampleBody:
`> **Given:** \`F = { P → Q, Q → R, R → S, PQ → T }\` · **Candidate Key:** \`PU\` (*U never appears on RHS!*)

1. **Violates 2NF?** **YES** — \`P → Q\` (\`P ⊂ PU\`), and \`Q → R, R → S, PQ → T\` also violate BCNF.
2. **Split on \`P → Q\`:** \`R1(\`<u>\`P\`</u>\`, Q)\` [BCNF] & \`R2(P, R, S, T, U)\` (\`PQ → T\` drops).
3. **Split \`R2\` on \`R → S\`:** \`R3(\`<u>\`R\`</u>\`, S)\` [BCNF] & \`R4(\`<u>\`P\`</u>\`, \`<u>\`R\`</u>\`, T, \`<u>\`U\`</u>\`)\` [no FDs → BCNF].

> **Final Lossless BCNF Schema:** \`R1(P, Q)\`, \`R3(R, S)\`, \`R4(P, R, T, U)\``,
    examTip:
      'To test **3NF vs. BCNF** fast: first check if the relation is in 3NF using `Y is Prime`; then drop that exception to check BCNF (`LHS must be a Superkey`).',
    selfChecks: [
      {
        question:
          'Relation PATIENT_DIAGNOSIS (A1 Q4) has Candidate Key {Patient_ID, Appt_Date, Test_Name} and FD1: {Patient_ID, Appt_Date} -> Doctor_ID. Why does it FAIL 2NF?',
        options: [
          'Because Doctor_ID is a prime attribute',
          'Because {Patient_ID, Appt_Date} is a proper subset of the Candidate Key determining non-prime attribute Doctor_ID (Partial Dependency)',
          'Because Appt_Date is not atomic',
          'Because Test_Name -> Test_Result is a transitive dependency',
        ],
        correctIndex: 1,
        explanation:
          '2NF forbids any proper subset of a candidate key from functionally determining a non-prime attribute. Dropping Test_Name leaves a proper subset determining Doctor_ID -> Partial Dependency -> stays in 1NF.',
      },
      {
        question:
          'What critical failure distinguishes 3NF from BCNF in the classic relation R(A, B, C) with FDs { AB -> C, C -> B }?',
        options: [
          'R fails 3NF because B is non-prime',
          'R satisfies 3NF (because B in C -> B is Prime), yet FAILS BCNF because C is NOT a superkey',
          'R fails 2NF because AB is composite',
          'Decomposition into R1(C, B) and R2(A, C) is lossy',
        ],
        correctIndex: 1,
        explanation:
          'In R(A,B,C), CKs are {AB} and {AC}, so all attributes A, B, C are Prime. C -> B passes 3NF via the prime-attribute RHS exception, but violates BCNF because C is not a superkey.',
      },
    ],
  },

  'm2-t6': {
    summary:
      'Even a table strictly in **BCNF** can still store redundant Cartesian-product rows when one key independently determines two or more unrelated multi-valued sets (**4NF — Multivalued Dependencies**) or participates in cyclic multi-way business constraints (**5NF / PJNF — Join Dependencies**).',
    sourceDecks: [
      'Module-2-Consolidated.ppt (Slides 185–194: 4NF & 5NF / PJNF)',
    ],
    keyPoints: [
      {
        heading: 'Multivalued Dependency (`X ↠ Y`) & Fourth Normal Form (4NF)',
        text: 'An **MVD (`X ↠ Y`)** exists when `X` determines an independent set of `Y` values unrelated to other attributes `Z = R − (X ∪ Y)`, forcing `|Y| × |Z|` row combinations! A relation is in **4NF** iff it is in BCNF and has **no non-trivial MVD `X ↠ Y` where `X` is not a superkey**.',
      },
      {
        heading: 'Join Dependency `*(R1, R2, ..., Rn)` & Fifth Normal Form (5NF / PJNF)',
        text: 'Also called **Project-Join Normal Form (PJNF)**. A relation is in **5NF** iff it is in 4NF and contains **no non-trivial Join Dependency**—every lossless join decomposition `(R1 ⋈ R2 ⋈ ... ⋈ Rn = R)` must be implied solely by the candidate keys of `R`.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Why BCNF Still Fails: 4NF Independent Sets vs. 5NF Cyclic Joins',
        body: 'Compare the exact structural patterns that force a valid BCNF table (`all-key` relation) to decompose further into **4NF** or **5NF**:',
        table: {
          headers: ['Normal Form', 'Redundancy Source', 'Formal Test Condition', 'Canonical Example'],
          rows: [
            ['4NF', 'Two independent multivalued facts mixed in 1 table (`|Y| × |Z|` rows)', 'For every non-trivial `X ↠ Y`, `X` is a superkey', 'COURSE_INFO(Course, Prof, Book): `Course ↠ Prof | Book`'],
            ['5NF (PJNF)', 'Cyclic 3-way symmetry rule: `(A,B), (B,C), (C,A)` hold together', 'Every non-trivial Join Dependency `*(R1..Rn)` implied by CKs of `R`', '`SUPPLIER–PART–PROJECT`: if S supplies P, P used in J, & S supplies J => `(S,P,J)` exists'],
          ],
        },
        bullets: [
          '**Trivial MVD Rule:** `X ↠ Y` is **trivial** only when `Y ⊆ X` OR `X ∪ Y = R` (meaning no independent third attribute `Z` exists!).',
          '**All-Key BCNF Tables:** A 3-column table `R(Course, Prof, Book)` with **no non-trivial FDs** has `CK = (Course, Prof, Book)`, so it automatically passes 1NF, 2NF, 3NF, AND BCNF—making **4NF/5NF** the only defenses against its duplication!',
        ],
      },
      {
        title: '2. Complete `4NF` Decomposition vs. `5NF` Three-Way Decomposition',
        body: 'Trace the exact row counts before and after decomposition:',
        markdownBlock:
`### 4NF Example (Course C-100: \`{Prof. X, Prof. Y} × {Book T1, Book T2}\`)
- **Unnormalized BCNF (Cartesian \`2 × 2 = 4\` rows):** \`(C-100, X, T1)\`, \`(C-100, X, T2)\`, \`(C-100, Y, T1)\`, \`(C-100, Y, T2)\`
- **4NF Split into 2 Independent Tables:**
  - \`COURSE_PROF(\`<u>\`Course\`</u>\`, \`<u>\`Prof\`</u>\`)\` → \`{(C-100, X), (C-100, Y)}\`
  - \`COURSE_BOOK(\`<u>\`Course\`</u>\`, \`<u>\`Book\`</u>\`)\` → \`{(C-100, T1), (C-100, T2)}\`

### 5NF (PJNF) Example — \`AGENT_COMPANY_PRODUCT\` (All-Key Table)
- Cannot decompose into only 2 projections (\`R1 ⋈ R2\` creates spurious rows).
- Decompose into **all three** binary projections: \`R1(Agent, Company) ⋈ R2(Company, Product) ⋈ R3(Agent, Product) = R\``,
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Exam Pattern Method · Proving 4NF Violation (MVD) vs. 5NF (PJNF) [CO5, BL4]',
        questionPrompt:
          'Typical Exam Question: Given an all-key table STUDENT_ACT(Sid, Course, Hobby) or AGENT_COMP_PROD(Agent, Company, Product), prove why it is already in BCNF, identify whether it violates 4NF or 5NF, and decompose it cleanly.',
        solvingMethod: [
          'Step 1 — Prove BCNF First [2M]: Show there are no non-trivial FDs (`Sid` determines multiple Courses and multiple Hobbies -> only Candidate Key is `{Sid, Course, Hobby}`). Because zero non-trivial FDs exist, **BCNF is trivially satisfied**!',
          'Step 2 — Check MVD (`4NF` Test) [4M]: Ask: "Are `Course` and `Hobby` completely independent?" Yes (`Sid ↠ Course` and `Sid ↠ Hobby` non-trivially, and `Sid` is NOT a superkey!). Decompose into two binary tables `STUDENT_COURSE(Sid, Course)` and `STUDENT_HOBBY(Sid, Hobby)`.',
          'Step 3 — Check Join Dependency (`5NF / PJNF` Test) [4M]: When attributes form a cyclic dependency (`Agent–Company–Product`) where binary join `R1 ⋈ R2` creates spurious rows, prove **4NF holds** (no MVD!) yet **5NF (PJNF) fails**, and decompose into 3 binary projections `R1 ⋈ R2 ⋈ R3 = R`.',
        ],
        commonPitfalls:
          'Writing `X -> Y` (functional arrow) instead of `X ↠ Y` (double-headed MVD arrow) in 4NF questions, or forgetting the full name of 5NF: **Project-Join Normal Form (PJNF)**.',
      },
    ],
    exampleTitle: 'Module 2 Master Progression: 1NF → 5NF Checklist',
    exampleBody:
`1. **1NF:** Atomic columns only (split multi-valued cells into separate rows)
2. **2NF:** Remove **Partial Dependencies** (proper subset of CK → non-prime)
3. **3NF:** Remove **Transitive Dependencies** (non-superkey → non-prime)
4. **BCNF:** Require **EVERY determinant** (LHS of every FD) to be a **Superkey**
5. **4NF:** Remove independent **MVDs** (\`X ↠ Y\` where \`X\` is not a superkey)
6. **5NF (PJNF):** Remove non-trivial **Join Dependencies** \`*(R1, R2, ..., Rn)\``,
    examTip:
      'In a 4NF justification, ALWAYS prove **"No non-trivial FDs exist, so the table is already in BCNF"** before decomposing the `X ↠ Y | Z` Cartesian product.',
    selfChecks: [
      {
        question:
          'A table FACULTY_DUTY(Fac_ID, Subject, Lab_Equip) stores independent sets of Subjects taught and Lab Equipment used by each faculty member, with Candidate Key (Fac_ID, Subject, Lab_Equip). What is its highest Normal Form?',
        options: [
          '1NF only',
          '2NF only',
          'BCNF (it fails 4NF due to Fac_ID ↠ Subject | Lab_Equip)',
          '5NF (PJNF)',
        ],
        correctIndex: 2,
        explanation:
          'Because there are no non-trivial FDs (every column participates in the single all-attribute candidate key), it satisfies 1NF, 2NF, 3NF, and BCNF—yet fails 4NF due to independent multivalued dependencies Fac_ID ↠ Subject and Fac_ID ↠ Lab_Equip.',
      },
      {
        question:
          'What is the formal alternative name for Fifth Normal Form (5NF), and what kind of dependency does it eliminate?',
        options: [
          'Boyce-Codd Normal Form (BCNF); eliminates Partial Dependencies',
          'Project-Join Normal Form (PJNF); eliminates non-trivial Join Dependencies *(R1, R2, ..., Rn)',
          'Domain-Key Normal Form; eliminates Trivial FDs',
          'Multivalued Normal Form; eliminates Transitive Dependencies',
        ],
        correctIndex: 1,
        explanation:
          '5NF is known as Project-Join Normal Form (PJNF) and ensures a relation cannot be non-trivially decomposed into n projections whose natural join equals the original relation unless driven by candidate keys.',
      },
    ],
  },
};
