import type { TopicNote } from './noteTypes';

export const MODULE_1_NOTES: Record<string, TopicNote> = {
  'm1-t1': {
    summary:
      'A Database Management System (DBMS) is a collection of interrelated programs enabling users to define, construct, manipulate, and share persistent data. Grounded in Dr. Swaminathan’s **Module 0 (Data Prerequisite)** and **Module 1** lectures, the database approach solves flat-file redundancy, inconsistency, and rigid program-data coupling.',
    sourceDecks: [
      'Module_0_DATA_(Pre_Requiste).pptx (Slides 1–21)',
      'Module 1. Database Systems Concepts and Architecture..pptx (Slides 1–42, 62–71)',
    ],
    keyPoints: [
      {
        heading: 'Data -> Information -> Knowledge Hierarchy & Measurement Scales (Mod 0)',
        text: '**Data** = raw recorded facts (`Marks = 5`); **Information** = processed context (`$5` / Average = `84.3`), feeding `Knowledge -> Experience -> Wisdom`. Scales: **Nominal** (labels: Dept), **Ordinal** (ranks: Grade), **Interval** (Arbitrary Zero: Celsius), **Ratio** (Absolute Zero: Kelvin/Marks). Storage terms: **Dataset**, **Dataspace** (heterogeneous sources), **Data Center**, **Data Cube**.',
      },
      {
        heading: 'Self-Describing Nature (Metadata Catalog) & Multiple Views',
        text: 'Unlike legacy flat files (`Student.txt`, `Faculty.txt`, `Course.txt`), a DBMS stores its own schema definitions inside a **System Catalog (Metadata)**, enabling one generic DBMS engine to serve diverse databases and present tailored **Multiple Views** (`Student`, `Faculty`, `Finance`) from shared data.',
      },
      {
        heading: 'Program-Data Independence, Atomicity & Concurrency Without Anomalies',
        text: '**Program-Data Independence** allows adding a column (e.g., `Email` to `Student`) without rewriting existing application programs. **ACID Concurrency & Atomicity** guarantees multi-user updates (e.g., Rahul’s `₹10,000` balance hit by simultaneous `₹2,000` ATM + `₹3,000` mobile transfer -> `₹5,000`) execute all-or-nothing without race errors.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Traditional File Processing System vs. DBMS Approach',
        body: 'Before the 1970s, organizations kept isolated text/binary files per department, creating five structural failures that motivate every DBMS feature:',
        table: {
          headers: ['Dimension', 'Flat File System (Pre-1970)', 'Database Management System (DBMS)'],
          rows: [
            ['Metadata Storage', 'Structure hardcoded inside C/COBOL programs', 'Self-describing System Catalog separated from code'],
            ['Data Redundancy', 'Same Student copied in Hostel, Exam & Fee files', 'Controlled sharing via normalized single source of truth'],
            ['Data Inconsistency', 'Address updated in Exam file but stale in Library', 'Central update + integrity rules enforce consistency'],
            ['Program-Data Coupling', 'Adding 1 field forces recompiling every app file', 'Program-Data Independence insulates applications'],
            ['Concurrency & Crash Safety', 'No locking or rollback; partial writes corrupt files', 'ACID Transactions prevent lost updates & partial crashes'],
          ],
        },
      },
      {
        title: '2. Module 0 Prerequisite Matrix: NOIR Measurement Scales (Slides 7–13)',
        body: 'Memorize Dr. Swaminathan’s **Module 0 (`DATA - A Prerequisite to any Domain`)** 4-scale classification (`Nominal`, `Ordinal`, `Interval`, `Ratio`) and **Arbitrary vs. Absolute Zero** for Part-A and MCQ distinctions:',
        table: {
          headers: ['Feature', 'Nominal Data', 'Ordinal Data', 'Interval Data', 'Ratio Data'],
          rows: [
            ['Definition', 'Naming or labeling categories only', 'Categories with meaningful order / ranking', 'Numeric with equal intervals, no true zero', 'Numeric with equal intervals + true absolute zero'],
            ['Nature of Data', 'Qualitative (categorical)', 'Qualitative with ranking', 'Quantitative', 'Quantitative'],
            ['Order / Ranking', 'No order', 'Ordered (`1st > 2nd > 3rd`)', 'Ordered', 'Ordered'],
            ['Equal Intervals', 'Not applicable', 'Not necessarily equal', 'Equal (`20°C->30°C = 30°C->40°C`)', 'Equal'],
            ['True Zero Point', 'No (categorical)', 'No', 'No — **Arbitrary Zero** (`0°C` = water freezing)', 'Yes — **Absolute Zero** (`0 K = -273.15°C`)'],
            ['Arithmetic Ops', 'None (`= / ≠` count only)', 'Comparison (`< , >`) only', 'Addition & Subtraction (`+ , −`) only; ratios invalid', 'All operations valid (`+ , − , × , ÷` & ratios)'],
            ['Slide Examples', 'Gender, Blood Group, Religion, Dept (`CSE`)', 'Class Rank, Grade (`S, A, B`), Satisfaction', 'Temperature (`°C`, `°F`), IQ Score', 'Temperature (`Kelvin`), Height, Weight, Age, Marks'],
            ['Statistical Measures', '`Mode`', '`Median`, `Mode`', '`Mean`, `Median`, `Mode`, `SD`', '`Mean`, `Median`, `Mode`, `SD`, `Geometric Mean (GM)`'],
          ],
        },
        diagramId: 'm1-rahul-concurrency',
        diagramCaption:
          'User A (ATM ₹2,000) and User B (Mobile ₹3,000) execute concurrently; ACID lock serialization guarantees final balance ₹5,000 (never ₹7,000 or ₹8,000).',
      },
      {
        title: '3. Authoritative Definitions, Arbitrary vs. Absolute Zero & Data Ecosystem (Slides 3–20)',
        body: 'Dr. Swaminathan’s Module 0 deck highlights classic textbook definitions and five foundational data infrastructure concepts:',
        markdownBlock:
`#### Classic Textbook Definitions (Slides 4 & 18)
- **C. J. Date:** *"Data are representations of facts."* · *"A database is a collection of persistent data used by the application systems of some given enterprise."*
- **Peter Rob & Carlos Coronel:** *"Data are raw facts about people, places, objects, and events."*
- **Abraham Silberschatz:** *"Data are known facts that can be recorded and have implicit meaning."* · *"A database is a collection of interrelated data."*
- **Data vs. Information (Slides 5–6):** Raw student scores (\`Ravi = 85\`, \`Priya = 90\`, \`Arun = 78\`) are **Data** (unprocessed input); summarizing them into \`Average Marks = 84.3\` produces **Information** (organized insight used for decision-making).

| Ecosystem Term | Slide Definition (Slides 9–17) | Key Distinction / Practical Role |
| :--- | :--- | :--- |
| **Arbitrary Zero** | Zero point chosen by convention (\`0 °C\` freezing of water, \`0 °F\` salt–ice mix) | Values can go negative (e.g. \`-10 °C\`); does **not** mean absence of thermal energy |
| **Absolute Zero** | Physical lower limit of nature (\`0 K = -273.15 °C = -459.67 °F\`) | Complete absence of thermal energy; cannot go below zero in classical thermodynamics |
| **Dataset** | Structured collection of related data organized for a specific task | Scoped to a single analysis, report, or ML model (e.g. CSV exam sheet) |
| **Dataspace** | Collection of data across **multiple, diverse, independent sources** | Provides unified access **without requiring upfront full schema integration** (data stays in original format/location) |
| **Data Cube** | Multidimensional representation of data for **Data Warehousing & OLAP** | Analyzes measures across multiple dimensions (\`Time × Product × Region\`) beyond 2D tables |
| **Data Center** | Physical facility housing servers, storage, networks, backup power, cooling & security | Ensures high-availability hardware infrastructure for enterprise databases |`,
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Core CO1 Exam Method · Advantages & Characteristics of DBMS vs. Flat Files [CO1, BL1/BL2]',
        questionPrompt:
          'Standard Theory Question: Contrast Traditional File Processing Systems with the DBMS Approach, explaining Metadata, Program-Data Independence, Multiple Views, and Multiuser Concurrency Control.',
        solvingMethod: [
          'Step 1 — Define DBMS & Persistent Data [2M]: Quote Silberschatz (*"collection of interrelated data + set of programs to access those data"*), mentioning **Define, Construct, Manipulate, Share**.',
          'Step 2 — Contrast 4+ File System Problems [4M]: Explicitly contrast **Data Redundancy & Inconsistency**, **Difficulty Accessing Data / Data Isolation**, **Program-Data Dependence**, and **Concurrent Access Anomalies**.',
          'Step 3 — Give Concrete DBMS Illustrations [4M]: Show how **Metadata Catalog** decouples table layout (`Student` + `Email` column), how **Multiple Views** filter columns per role (`Student` sees Grades; `Finance` sees Fees), and how **Transaction Atomicity** serializes concurrent bank debits.',
        ],
        commonPitfalls:
          'Listing generic bullet words ("fast, secure, easy") without tying each point to **Metadata (Self-Describing)**, **Program-Data Independence**, or an explicit concrete failure in file systems.',
      },
    ],
    exampleTitle: 'Flat File Problem vs. DBMS Concurrency Walkthrough',
    exampleBody:
`- **Pre-1970 Flat Files:** Separate \`Student.txt\`, \`Faculty.txt\`, and \`Course.txt\` files caused **data redundancy**, **update inconsistency**, and rigid COBOL/C program coupling.
- **DBMS Solution:** A shared **System Catalog** + role-based **Views** + **ACID Locking**:
  - Adding \`Email\` to the \`Student\` schema leaves existing \`StudentPortal\` programs untouched (*Program-Data Independence*).
  - Concurrent \`₹2,000\` ATM withdrawal + \`₹3,000\` mobile transfer safely serialize to **\`₹5,000\`**.`,
    examTip:
      'Always anchor Part-A answers in **Silberschatz / Elmasri / C. J. Date definitions** plus the 4 signature pillars: **Self-Describing Catalog**, **Program-Data Independence**, **Multiple Views**, and **ACID Concurrency**.',
    selfChecks: [
      {
        question:
          'Why is a DBMS described as having a "Self-Describing Nature" compared to a flat file system?',
        options: [
          'It automatically generates UI forms without code',
          'It stores complete structural definitions, data types, and constraints (Metadata) inside a System Catalog alongside the data',
          'It prohibits more than one user from querying a table at once',
          'It stores all values strictly on the Interval measurement scale',
        ],
        correctIndex: 1,
        explanation:
          'A DBMS records its schema definitions and constraints inside the System Catalog (metadata), allowing generic DBMS software to interpret and manage different databases without hardcoding file layouts.',
      },
      {
        question:
          'In Module 0 Measurement Scales, which scale features an Absolute Zero where ratios such as "twice as large" and the Geometric Mean (GM) are mathematically valid?',
        options: [
          'Nominal Scale',
          'Ordinal Scale',
          'Interval Scale (e.g., Celsius)',
          'Ratio Scale (e.g., Kelvin, Marks, Salary)',
        ],
        correctIndex: 3,
        explanation:
          'Ratio scales have an absolute true zero (0 Kelvin or 0 marks means total absence), supporting all arithmetic operations (+, -, ×, ÷) and Geometric Mean.',
      },
      {
        question:
          'According to Module 0 (Slide 15), how does a Dataspace differ from a traditional Database?',
        options: [
          'A Dataspace only stores numeric Ratio data',
          'A Dataspace integrates and provides unified access across multiple heterogeneous, independent sources without requiring full upfront schema integration',
          'A Dataspace is a physical building with cooling and power backup',
          'A Dataspace requires all data to be normalized into BCNF tables before querying',
        ],
        correctIndex: 1,
        explanation:
          'Unlike a traditional DBMS which requires strict upfront schema integration before querying, a Dataspace manages co-existing heterogeneous sources in their native formats while offering unified search and pay-as-you-go integration.',
      },
    ],
  },

  'm1-t2': {
    summary:
      'Elmasri & Navathe categorize database people into **"Actors on the Scene"** (who interact with or administer DB content daily) and **"Workers Behind the Scene"** (who engineer DBMS internals and tools), alongside historical and modern **DBMS Classifications**.',
    sourceDecks: [
      'Module 1. Database Systems Concepts and Architecture..pptx (Slides 8–26, 43–52)',
    ],
    keyPoints: [
      {
        heading: 'Actors on the Scene (4 Primary Roles)',
        text: '**1) DBA (Database Administrator):** Authorizes access, defines/modifies schemas via DDL, monitors performance, schedules backups/recovery. **2) Database Designers:** Identify entities, relationships & integrity constraints. **3) End Users:** **Naive/Parametric** (canned forms like ATM/bank tellers), **Casual** (occasional ad-hoc SQL), **Sophisticated** (analysts/engineers), **Specialized** (CAD/GIS/multimedia). **4) Application Programmers / System Analysts**.',
      },
      {
        heading: 'Workers Behind the Scene (Infrastructure Engineers)',
        text: 'Users never directly interact with these hidden teams: **DBMS System Designers & Implementers** (build query optimizer, concurrency, buffer modules), **Tool Developers** (ER modeling, tuning & reporting packages), and **Operators & Maintenance Personnel** (hardware/OS/network uptime).',
      },
      {
        heading: 'History & 8-Category DBMS Classification',
        text: 'Evolution: **1960s Charles Bachman (IDS — Network model)** & **Hierarchical (IMS tree)** -> **1970 Dr. E. F. Codd (Relational Model)**. Classification: By data model (`Hierarchical`, `Network`, `Relational`, `Object-Oriented`, `NoSQL`), user count (`Single-user` vs. `Multi-user`), site count (`Centralized` vs. `Distributed`), and hosting (`Cloud` vs. `On-Prem`).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Complete Taxonomy of Database Users & Engineers',
        body: 'Be ready to classify any real-world persona (ATM customer, professor running custom SQL, backend developer, database kernel coder) cleanly into the textbook buckets:',
        table: {
          headers: ['Category & Role', 'Interaction Mechanism', 'Real-World Example (Slides 44–52)'],
          rows: [
            ['Actor: DBA', 'DDL, DCL (`GRANT`), tuning & backup tools', 'Grants Student table read access; monitors locks'],
            ['Actor: Database Designer', 'ER/EER diagrams & Normalization schemas', 'Designs `STUDENT`, `COURSE`, `ENROLLMENT` schemas'],
            ['Actor: Naive / Parametric End User', 'Pre-tested canned transactions / forms', 'Bank teller, ATM user, airline booking clerk'],
            ['Actor: Casual End User', 'Occasional ad-hoc high-level queries', 'Middle/senior manager querying monthly sales once'],
            ['Actor: Sophisticated End User', 'Complex SQL, analytics, ML/BI tools', 'Data scientist, engineer, business analyst'],
            ['Actor: Application Programmer', 'Host language (Java/Python) + embedded DML', 'Backend developer writing student portal APIs'],
            ['Behind Scene: System Implementer', 'Builds DBMS engine modules in C/C++/Rust', 'Engineer coding PostgreSQL B+ Tree & lock manager'],
          ],
        },
      },
      {
        title: '2. Evolution & Classification of DBMS Software',
        body: 'Understand why the 1970 Relational revolution replaced legacy Hierarchical and Network engines:',
        bullets: [
          '**Hierarchical DBMS:** Parent-child tree structure (`1:N` only); duplicating children required across multiple parents; rigid pointer navigation.',
          '**Network DBMS (`IDS` by Charles Bachman, 1960s):** Graph/CODASYL structure allowing `M:N` owner-member links, yet programmers still had to manually traverse record pointers.',
          '**Relational DBMS (`E. F. Codd`, 1970):** Separates logical tables from physical pointers—users write declarative SQL (`WHAT` to fetch, not `HOW` to traverse disks).',
          '**Modern Specializations:** Single-user desktop (`SQLite`) vs. Multi-user enterprise (`Oracle`, `PostgreSQL`), Centralized vs. Distributed, Object-Oriented, and `NoSQL` (`MongoDB`, `Cassandra`, `Neo4j`).',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Core CO1 Exam Method · Classifying Users & Contrasting Legacy vs. Relational Models [CO1, BL1/BL2]',
        questionPrompt:
          'Standard Theory Question: Distinguish "Actors on the Scene" from "Workers Behind the Scene", giving all 4 End-User subtypes and specific DBA responsibilities.',
        solvingMethod: [
          'Step 1 — Split Scene vs. Behind-Scene [2M]: Explicitly define **Actors on the Scene** (use/control database content) vs. **Workers Behind the Scene** (build/operate the DBMS engine itself).',
          'Step 2 — Detail the 4 Actors + 4 End-User Subtypes [5M]: Contrast **DBA**, **Database Designers**, **System Analysts & Application Programmers**, and expand End Users into **Naive/Parametric**, **Casual**, **Sophisticated**, and **Specialized** with concrete examples.',
          'Step 3 — Explain Workers Behind the Scene & History Hook [3M]: List **System Implementers**, **Tool Developers**, and **Operators**, and note how Codd (1970) abstracted pointer navigation away from users.',
        ],
        commonPitfalls:
          'Confusing **Naive (Parametric)** users with **Casual** users: Naive users execute *repetitive canned transactions* daily (ATMs, ticket counters), whereas Casual users write *unscripted ad-hoc queries* occasionally.',
      },
    ],
    exampleTitle: 'Actor-to-DBMS Entry Mapping (Slides 86–98)',
    exampleBody:
`| Actor | Entry Interface | Compiler / Processor | Target Output |
| :--- | :--- | :--- | :--- |
| **Naive / Parametric User** | Canned Application Forms | Runtime Library Calls | Compiled Transactions |
| **Application Programmer** | Host Language + Embedded DML | **DML Precompiler** → Host Compiler | Object Code / Compiled Txns |
| **Sophisticated / Casual User** | Ad-hoc Interactive SQL | **Query Compiler** → **Query Optimizer** | Execution Plan |
| **DBA** | DDL / DCL Statements | **DDL Compiler** | **System Catalog** (Metadata) |`,
    examTip:
      'Remember the exact distinction for Part-A: **Charles Bachman** pioneered the 1960s `IDS` (Network) DBMS, while **Dr. E. F. Codd** published the Relational Model in **1970**.',
    selfChecks: [
      {
        question:
          'Which category of End Users regularly executes pre-written, thoroughly tested "canned transactions" such as ATM cash withdrawals or railway ticket bookings?',
        options: [
          'Casual End Users',
          'Naive / Parametric End Users',
          'DBMS System Implementers',
          'Tool Developers',
        ],
        correctIndex: 1,
        explanation:
          'Naive (Parametric) end users interact through rigid, pre-tested forms and canned transactions without writing custom SQL or understanding database internals.',
      },
      {
        question:
          'Who belongs to "Workers Behind the Scene" rather than "Actors on the Scene"?',
        options: [
          'Database Administrator (DBA)',
          'Database Designer',
          'DBMS System Designers & Implementers who code the query optimizer and buffer manager',
          'Application Programmers building university portals',
        ],
        correctIndex: 2,
        explanation:
          'DBMS System Designers & Implementers, Tool Developers, and Operators build and maintain the DBMS software/hardware environment itself and do not use database application content directly.',
      },
    ],
  },

  'm1-t3': {
    summary:
      'Proposed by the ANSI/SPARC architecture, the **Three-Schema Architecture** separates user views (**External**), enterprise logical tables (**Conceptual**), and disk storage structures (**Internal**) to achieve **Logical** and **Physical Data Independence**—directly tested in **`Nov 2026 FAT A2+TA2 · Q1`**.',
    sourceDecks: [
      'Module 1. Database Systems Concepts and Architecture..pptx (Slides 53–67, 78–85, 137–147)',
    ],
    keyPoints: [
      {
        heading: 'Database Schema (Intension) vs. Instance (Extension / State)',
        text: '**Database Schema:** Overall logical blueprint defined by DBA via DDL (rarely changes; e.g., house floorplan). **Database Instance (State):** Actual set of rows stored at a specific instant (changes constantly with `INSERT`/`UPDATE`/`DELETE`; e.g., bricks & furniture inside the built house).',
      },
      {
        heading: 'The Three Schema Levels (Hospital & University Examples, Slides 141–147)',
        text: '**1) External Schema (View Level):** Customized views hiding sensitive fields (`Student Login` sees attendance/CGPA; `Patient` sees prescription). **2) Conceptual Schema (Logical Level):** Hides physical disk details; defines ALL tables, columns, relationships, and integrity constraints. **3) Internal Schema (Physical Level):** Disk blocks, heap/B+ Tree indexes, hashing, compression.',
      },
      {
        heading: 'Data Independence & Client-Server Tiers (1-Tier, 2-Tier, 3-Tier)',
        text: '**Logical Data Independence:** Change Conceptual Schema without breaking External views/apps (harder!). **Physical Data Independence:** Change Internal storage/indexes without altering Conceptual Schema. **Client-Server:** 1-Tier (direct local DB), 2-Tier (Client API -> DB Server), 3-Tier (Client UI -> App Server -> DB Server).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Three-Schema Levels & Data Independence Mappings',
        body: 'Always draw BOTH intermediate mapping arrows (`External–Conceptual` and `Conceptual–Internal`) so the grader sees *where* each independence lives:',
        diagramId: 'm1-three-schema',
        diagramCaption:
          'Logical Data Independence lives at the External/Conceptual Mapping; Physical Data Independence lives at the Conceptual/Internal Mapping.',
        table: {
          headers: ['Independence Type', 'Which Boundary Insulates?', 'Real-World Modification Example'],
          rows: [
            ['Logical Data Independence', 'External <-> Conceptual', 'Split `Employee(ID, Name, Sal)` into 2 tables or add `Email` while keeping existing View queries working unchanged'],
            ['Physical Data Independence', 'Conceptual <-> Internal', 'Move table from Heap file to B+ Tree index or migrate from HDD to SSD without changing any SQL table/query'],
          ],
        },
      },
      {
        title: '2. Centralized vs. 1-Tier, 2-Tier & 3-Tier Client-Server Architectures',
        body: 'Prepared for upcoming slot variations pairing Three-Schema with Client-Server tiers (`Slides 78–85`):',
        table: {
          headers: ['Tier Model', 'Architecture Layers', 'Use Case & Security Profile'],
          rows: [
            ['1-Tier', 'User sits directly on machine running DBMS', 'Local SQLite / MySQL Workbench development'],
            ['2-Tier', 'Client UI + API (ODBC/JDBC) <--> DB Server', 'Desktop banking/campus tools inside trusted LAN'],
            ['3-Tier', 'Client Browser <-> Application Server <-> DB Server', 'Web/Mobile portals (`VTOP`): hides DB credentials, enforces business rules cleanly'],
          ],
        },
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q1 [10M, CO1, BL1]',
        questionPrompt:
          'Q1: Explain the Three-Schema Architecture with a neat block diagram. Describe the functions of each schema level and explain how the architecture provides data independence. Illustrate each type of data independence with one suitable real-world database example. [10M]',
        solvingMethod: [
          'Step 1 — Neat Block Diagram [3M]: Draw all 3 levels top-to-bottom (**External Views 1..n -> Conceptual Schema -> Internal Schema -> Stored DB**) and clearly label BOTH **External/Conceptual Mapping** and **Conceptual/Internal Mapping** arrows.',
          'Step 2 — Explain All 3 Schema Functions [3M]: Detail **External (View)** (tailored security & abstraction), **Conceptual (Logical)** (global entities, datatypes, keys, constraints independent of storage), and **Internal (Physical)** (file orgs, B+ Tree/hash indexes, compression, disk pages).',
          'Step 3 — Define & Explain Data Independence Mechanism [2M]: Show that **Mappings** absorb schema changes: modifying the lower schema only updates the mapping rules rather than rewriting upper layers.',
          'Step 4 — Concrete Examples for BOTH [2M]: **Physical Data Independence:** Adding a B+ Tree index on `Student(RegNo)` or moving disk blocks from HDD to NVMe SSD changes zero conceptual tables or SQL queries. **Logical Data Independence:** Adding `Email` to `Student` or splitting `Account` into `Savings`/`Current` while rewriting the view mapping leaves existing External portals working unchanged.',
        ],
        commonPitfalls:
          'Drawing the 3 boxes WITHOUT labeling the **Mapping layers** (the actual mechanism that provides data independence!), or giving generic abstract definitions without the concrete real-world examples asked by the prompt.',
      },
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q2(a) & Q2(b) [6M + 4M = 10M, CO1]',
        questionPrompt:
          'Q2: A retail company uses a centralized database across multiple branches. Different users interact with the system:\n• Sales staff view only billing and product prices.\n• Store managers access sales summaries and inventory reports.\n• Database administrators manage table structures and storage details.\n• System upgrades are planned at the storage level without affecting user applications.\na) Identify and explain the suitable database architecture that supports these requirements. Illustrate with a neat diagram and justify how the system ensures minimal impact during upgrades. [6 Marks]\nb) Explain the centralized and client/server architectures for DBMS. [4 Marks]',
        solvingMethod: [
          'Part (a) Step 1 — Three-Schema Diagram & Role Mapping [3M]: Identify the **ANSI/SPARC Three-Schema Architecture** (`External -> Conceptual -> Internal -> Stored DB` with both mappings): **(1) External / View Level** supports customized role views—**Sales Staff View** (`POS_Billing_View`: only product prices & billing lines, hiding supplier cost) and **Store Manager View** (`Branch_Summary_View`: aggregated branch sales & stock reorder alerts); **(2) Conceptual / Logical Level** (managed by the **DBA**) defines unified tables (`BRANCH`, `PRODUCT`, `INVENTORY`, `INVOICE`) & integrity constraints; **(3) Internal / Physical Level** (managed by the **DBA**) configures disk blocks, B+ Tree/hash indexes, and file layouts.',
          'Part (a) Step 2 — Zero-Downtime Upgrades via Data Independence [3M]: Planned **storage-level upgrades** (e.g., migrating HDDs to NVMe SSDs, re-partitioning data files, or adding B+ Tree indexes on `SKU`) alter only the **Internal Schema** and the **Conceptual/Internal Mapping**. By **Physical Data Independence**, the Conceptual Schema, External Views, and branch POS applications continue operating with zero code changes. **Logical Data Independence** insulates External Views when DBAs evolve Conceptual tables via the **External/Conceptual Mapping**.',
          'Part (b) Step 1 — Centralized vs. 2-Tier Client/Server [2M]: **Centralized DBMS Architecture** runs all DBMS software, application programs, and display formatting on a single central host/mainframe accessed via dumb terminals (simple administration, but central bottleneck/SPOF). **2-Tier Client/Server** runs UI and business logic on clients connecting directly to the DB Server over `ODBC/JDBC` (query shipping instead of raw file shipping).',
          'Part (b) Step 2 — 3-Tier Client/Server Architecture [2M]: Inserts a middle **Application / Web Server Tier** (`Client UI <-> Application Server <-> Database Server`) that handles business validation, connection pooling across branches, and credential isolation so branch/web clients never connect directly to the database engine.',
        ],
        commonPitfalls:
          'Skipping **Centralized DBMS** in Part (b) when the prompt explicitly asks for *"centralized and client/server architectures"*, or failing to tie **Sales Staff, Store Managers, DBAs, and storage upgrades** to the Three-Schema levels in Part (a)!',
      },
    ],
    exampleTitle: 'House Blueprint Analogy: Schema vs. Instance (Slides 139–140)',
    exampleBody:
`- **House Blueprint** (3 Bedrooms, 1 Kitchen, 2 Baths) → **Database Schema (Intension)**: structural definition created via DDL.
- **Actual Furniture & Occupants Today** → **Database Instance (State)**: live tuples snapshot at a specific moment.

> **Conceptual Schema:** \`Student(\`<u>\`RegNo\`</u>\`, Name, Dept, CGPA, Email [UNIQUE])\`
> **External Views:** \`StudentLogin(RegNo, Marks)\` · \`PlacementView(RegNo, Email)\``,
    examTip:
      'Explain *why* **Logical Data Independence is harder to achieve** than Physical Data Independence: application programs heavily depend on the logical table/column names they query, whereas almost no application knows physical disk block addresses.',
    selfChecks: [
      {
        question:
          'A DBA creates a new B+ Tree index on Student(CGPA) and compresses archive blocks on SSD to double query speed. Existing SQL queries and Student Portal views run without any modification. Which property is demonstrated?',
        options: [
          'Logical Data Independence',
          'Physical Data Independence',
          'Referential Integrity Enforcement',
          '3-Tier Application Insulation',
        ],
        correctIndex: 1,
        explanation:
          'Changing indexes, file organizations, or compression affects only the Internal Schema; keeping the Conceptual Schema and queries intact demonstrates Physical Data Independence.',
      },
      {
        question:
          'Which statement accurately contrasts Database Schema and Database Instance?',
        options: [
          'Schema changes on every INSERT/DELETE while Instance stays fixed',
          'Schema is the structural blueprint defined by DDL (rarely changes), whereas Instance is the actual snapshot of tuples at a moment in time',
          'Schema lives only in the Internal level while Instance lives in External views',
          'Schema stores only numeric indexes while Instance stores metadata',
        ],
        correctIndex: 1,
        explanation:
          'The schema (intension) describes table structure, datatypes, and constraints; the instance (extension/state) is the populated data snapshot changing continuously during transactions.',
      },
      {
        question:
          'In the Model QP Q2 retail scenario, why is a 3-Tier Client/Server architecture preferred over a 2-Tier architecture when thousands of branch and web users connect over a WAN?',
        options: [
          '3-Tier eliminates the Conceptual Schema completely',
          '3-Tier introduces an intermediate Application Server that enforces business logic, pools database connections, and hides direct database credentials from client devices',
          '2-Tier cannot execute SQL SELECT statements',
          '3-Tier stores the entire database inside each client browser',
        ],
        correctIndex: 1,
        explanation:
          'In a 3-Tier architecture, the middle Application Server manages connection pooling, business validation, and security so client machines never hold direct database credentials or exhaust DB server connections.',
      },
    ],
  },

  'm1-t4': {
    summary:
      'The **Database System Environment** connects users (`DBA`, `Application Programmers`, `Casual`, `Naive`) through dedicated compilers (`DDL Compiler`, `DML Precompiler`, `Query Processor`) down to `Database/Buffer/File Managers`—directly tested in **`Nov 2026 FAT A1+TA1 · Q1`**—and spans **8 modern data model paradigms**.',
    sourceDecks: [
      'Module 1. Database Systems Concepts and Architecture..pptx (Slides 72–77, 86–136)',
    ],
    keyPoints: [
      {
        heading: 'Overall DBMS Component Modules (Elmasri Fig. 2.3, Slides 86–99)',
        text: 'Four entry paths compile into low-level execution: **DBA** (`DDL Commands -> DDL Compiler -> System Catalog`), **Application Programmers** (`Host Code + DML -> DML Precompiler -> Host Compiler -> Compiled Txns`), **Casual/Sophisticated Users** (`Interactive Query -> Query Compiler -> Query Optimizer`), and **Naive Users** (`Canned Txns`) -> feeding **Runtime DB Processor -> Stored Data / Buffer / Concurrency / File Managers**.',
      },
      {
        heading: 'SQL 4th-Generation Sub-Languages (Slides 100–101)',
        text: '**DDL** (`CREATE, ALTER, DROP, RENAME, TRUNCATE, COMMENT`), **DML** (`INSERT, UPDATE, DELETE`), **DCL** (`GRANT, REVOKE`), **TCL** (`COMMIT, ROLLBACK, SAVEPOINT`), and **DQL** (`SELECT`).',
      },
      {
        heading: '8 Database Models & Distributed vs. Cloud DB Distinction (Slides 117–136)',
        text: '1) **Relational** (SQL, ACID), 2) **Semi-Structured** (`JSON/XML` — `MongoDB`), 3) **Graph** (Nodes + Edges — `Neo4j` avoids expensive social joins), 4) **Vector** (AI embeddings similarity), 5) **Time-Series** (timestamped telemetry), 6) **Unstructured** (PDF/media), 7) **Distributed DB** (*WHERE data lives* across SBI Chennai/Delhi/Mumbai), 8) **Cloud DB** (*WHERE hosted*: Google Cloud/RDS).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Complete DBMS Component Modules Diagram (A1+TA1 Q1 Blueprint)',
        body: 'Memorize the top-to-bottom signal flow from all 4 user types through compilers down to disk:',
        diagramId: 'm1-dbms-components',
        diagramCaption:
          'Complete A1+TA1 Q1 block diagram: connect System Catalog bidirectionally to both the DDL Compiler and Query Optimizer / Runtime DB Processor.',
        table: {
          headers: ['Subsystem Layer', 'Core Sub-Module', 'Exact Runtime Responsibility (Slides 88–99)'],
          rows: [
            ['Query Processor', '**DDL Interpreter / Compiler**', 'Parses schema definitions (`CREATE/ALTER`) and records metadata tables in the **Data Dictionary (System Catalog)**'],
            ['Query Processor', '**DML Compiler & Query Optimizer**', 'Translates high-level SQL/DML into relational algebra plans and picks the lowest-cost execution plan using Catalog stats'],
            ['Query Processor', '**DML Precompiler**', 'Extracts embedded SQL from host code (`Java/C++`) and converts it into host procedure calls'],
            ['Query Processor', '**Runtime DB Processor (Evaluation Engine)**', 'Executes low-level instructions generated by the Query Optimizer or Compiled Transactions'],
            ['Storage Manager', '**Authorization & Integrity Manager**', 'Checks user privileges (`GRANT/REVOKE`) and enforces Domain, Entity, and Referential Integrity constraints'],
            ['Storage Manager', '**Transaction Manager**', 'Ensures ACID atomicity, concurrency control (locking/timestamps), and crash recovery (`UNDO/REDO` logs)'],
            ['Storage Manager', '**File Manager**', 'Manages allocation of disk space and data structures representing pages/blocks on secondary storage'],
            ['Storage Manager', '**Buffer Manager**', 'Fetches disk pages into main-memory RAM buffer pool and manages page replacement (`LRU / Clock`) and pinning'],
            ['Disk Structures', '**Data Files + Data Dictionary + Indices + Stats**', 'Stores actual user tuples, System Catalog metadata, B+ Tree / Hash access paths, and optimizer histograms'],
          ],
        },
      },
      {
        title: '2. Workload-to-Database Selection Matrix & Distributed vs. Cloud',
        body: 'From Dr. Swaminathan’s slides comparing 8 modern database types (`Slides 104–136`):',
        table: {
          headers: ['Workload / Scenario', 'Best Database Type', 'Core Data Structure & Advantage'],
          rows: [
            ['Bank / Campus ERP', 'Relational DB (`Oracle`, `MySQL`)', 'Fixed tables, strict ACID & SQL joins'],
            ['Evolving Product Catalog / Profiles', 'Semi-Structured (`MongoDB`)', 'Self-describing JSON/XML with missing fields OK'],
            ['Facebook Friends-of-Friends', 'Graph DB (`Neo4j`)', 'Nodes + edges + properties -> fast k-hop traversal'],
            ['ChatGPT / RAG Document Search', 'Vector DB (`Pinecone`, `Milvus`)', 'High-dimensional embeddings + ANN cosine similarity'],
            ['IoT Weather / Server Telemetry', 'Time-Series DB (`InfluxDB`)', 'Timestamp-indexed append streams & window rollups'],
            ['SBI Branches (Chennai, Delhi, Mumbai)', 'Distributed DB', 'Spread across physical sites for locality & fault tolerance'],
          ],
        },
        bullets: [
          '**Classical 4 Data Model Categories (`Slides 72–77`):** 1) **Relational Data Model** (Codd, 1970 — tables/tuples), 2) **Entity-Relationship (ER) Data Model** (conceptual entities & relationships), 3) **Object-Based Data Model** (ER + methods, encapsulation, object identity), and 4) **Semi-Structured Data Model** (`XML`/`JSON` where items of the same type may have varying attribute sets).',
          '**Distributed vs. Cloud Memory Trick (`Slide 136`):** *Distributed* = **where data is stored** (multiple physical network sites). *Cloud* = **where DB is hosted** (on-demand cloud infra). Note: A Cloud DB can be Distributed (multi-AZ RDS), a Distributed DB can be Cloud or On-Prem, and a Cloud DB need not be Distributed (single-instance VM).',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q1 [10M, CO1, BL1]',
        questionPrompt:
          'Q1: Draw a block diagram showing the overall component modules of a Database System Environment. Briefly explain how it works. [10M]',
        solvingMethod: [
          'Step 1 — Draw Complete Stratified Block Diagram [4M]: Top row = 4 user groups (**DBA**, **Casual Users**, **Application Programmers**, **Naive Users**); Middle row = **DDL Compiler**, **Query Compiler + Query Optimizer**, **DML Precompiler + Host Language Compiler -> Compiled Transactions**; Lower row = **System Catalog**, **Runtime Database Processor / Database Manager**, **Concurrency Control / Backup-Recovery / Buffer-File Manager**, and **Stored Database**.',
          'Step 2 — Trace DDL Path (Schema Setup) [1.5M]: Explain how the **DBA** writes `CREATE TABLE`/privilege commands compiled by the **DDL Compiler** into **Metadata** saved inside the **System Catalog**.',
          'Step 3 — Trace Ad-Hoc & Application Execution Paths [3M]: Contrast **Casual Users** (high-level SQL parsed by **Query Compiler**, tuned by **Query Optimizer** using Catalog stats, executed by **Runtime DB Processor**) vs. **Application Programmers** (**DML Precompiler** extracts embedded SQL/DML into procedure calls, compiled with host code into **Compiled Transactions** invoked repeatedly by **Naive Users**).',
          'Step 4 — Explain Storage, Buffer & Transaction Control [1.5M]: Describe how **Runtime DB Processor** calls **Stored Data / File Manager** and **Buffer Manager** (using OS disk I/O), while **Concurrency Control** and **Recovery Managers** guarantee ACID serializability and crash durability.',
        ],
        commonPitfalls:
          'Omitting the **System Catalog** feedback links, forgetting the **DML Precompiler -> Host Compiler** split for Application Programmers, or only drawing the boxes without explaining the runtime flow of a query vs. compiled transaction.',
      },
    ],
    exampleTitle: 'Distributed vs. Cloud Venn Relationship (Slides 130–136)',
    exampleBody:
`- **Can a Cloud DB be Distributed?** → **YES** (e.g., Amazon RDS Multi-AZ / Google Cloud Spanner).
- **Can a Distributed DB NOT be Cloud?** → **YES** (e.g., On-premises SBI banking servers across Chennai, Delhi, Mumbai).

| Dimension | Core Question Answered | Meaning |
| :--- | :--- | :--- |
| **Distributed DB** | **WHERE** is data stored? | Split across physically separated networked sites |
| **Cloud DB** | **WHERE** is DB hosted? | Rented on-demand managed cloud infrastructure |`,
    examTip:
      'In **A1+TA1 Q1** style diagrams, always connect **System Catalog** to BOTH **DDL Compiler** (writes metadata) AND **Query Optimizer / Runtime DB Processor** (reads table/index stats).',
    selfChecks: [
      {
        question:
          'In the Overall DBMS Component Architecture, which module extracts embedded SQL statements from a host language program (Java/C++) and replaces them with DBMS runtime calls before host compilation?',
        options: [
          'DDL Compiler',
          'DML Precompiler',
          'Query Optimizer',
          'Buffer Manager',
        ],
        correctIndex: 1,
        explanation:
          'The DML Precompiler extracts DML statements embedded in application source code so the host language compiler can build Compiled Transactions alongside runtime library calls.',
      },
      {
        question:
          'Why is a Graph Database (e.g., Neo4j) preferred over a Relational Database for finding 4-hop "friends-of-friends" across 3 billion social profiles?',
        options: [
          'Graph DBs enforce fixed rigid table schemas',
          'Graph DBs represent entities as nodes and relationships as explicit edges, avoiding expensive multi-way relational self-joins',
          'Graph DBs only support Interval measurement scales',
          'Relational DBs cannot store string names',
        ],
        correctIndex: 1,
        explanation:
          'Multi-hop relationship queries require repeated self-joins in RDBMS, whereas Graph DBs store direct edge pointers between nodes for fast O(1)-per-hop traversals.',
      },
    ],
  },

  'm1-t5': {
    summary:
      'Proposed by **Dr. E. F. Codd (1970)**, the Relational Model organizes enterprise data into mathematical relations (tables) characterized by **Degree** and **Cardinality**, strict adherence to **Codd’s 7 Validity Characteristics**, and exact **three-valued NULL semantics**.',
    sourceDecks: [
      'Module 1. Database Systems Concepts and Architecture..pptx (Slides 105–116, 168–170)',
    ],
    keyPoints: [
      {
        heading: 'Core Relational Terminology (Schema vs. State)',
        text: '**Relation** = Table; **Tuple** = Row; **Attribute** = Column; **Domain** = valid atomic value set (`GPA ∈ [0.0, 10.0]`); **Degree (Arity)** = number of columns; **Cardinality** = current number of rows; **Relation Schema** `R(A1..An)` = blueprint; **Relation State `r(R)`** = subset of Cartesian product `dom(A1) × ... × dom(An)`.',
      },
      {
        heading: 'Codd’s 7 Characteristics of a Valid Relation (Slides 110–116)',
        text: '1) **Unique relation name** (`Student`, `Faculty`). 2) **Unique attribute names** inside a table. 3) **Atomic cell values** (no `"Rahul, Priya"` list in one cell — 1NF rule!). 4) **Same domain per column** (no `"ABC"` inside `CGPA`). 5) **No duplicate tuples** (set semantics!). 6) **Tuple order is irrelevant**. 7) **Attribute order is irrelevant**.',
      },
      {
        heading: 'Three Meanings of NULL (Never 0, Blank `""`, or `false`)',
        text: '**1) Unknown:** Value exists but isn’t entered yet (`Employee.Salary`). **2) Missing:** User chose not to provide (`Student.Phone`). **3) Not Applicable:** Attribute doesn’t apply (`UnmarriedEmployee.SpouseName`). Remember: `NULL = NULL` evaluates to `UNKNOWN`, NOT `TRUE`!',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Relation Mathematical Formalism & Characteristics Audit',
        body: 'Check every candidate table against Codd’s 7 rules from Dr. Swaminathan’s slides (`110–116`):',
        table: {
          headers: ['#', 'Characteristic', 'Valid Example', 'Violation Example'],
          rows: [
            ['1', 'Unique relation name', '`Student`, `Course`', 'Two tables both named `Student` in same schema'],
            ['2', 'Unique attribute names', '`RegNo, Name, CGPA`', '`Name, Name, CGPA` in one table'],
            ['3', 'Atomic cell values (1NF)', '101 -> `Rahul` (1 value)', '101 -> `"Rahul, Priya"` in single Name cell'],
            ['4', 'Homogeneous column domain', '`CGPA`: `8.5, 9.2, 7.8`', '`CGPA`: `8.5, "ABC", 9.0`'],
            ['5', 'No duplicate tuples', 'Unique rows guaranteed by PK', 'Two identical `(101, Rahul, 8.5)` rows'],
            ['6', 'Row ordering irrelevant', 'Swap row 1 & row 2 -> identical `r(R)`', 'Relying on "row #3" without `ORDER BY`'],
            ['7', 'Column ordering irrelevant', '`Student(RegNo, Name)` ≡ `(Name, RegNo)`', 'Assuming fixed positional index in set theory'],
          ],
        },
      },
      {
        title: '2. Degree vs. Cardinality & Three-Valued NULL SQL Traps',
        body: 'Distinguish schema structure (`Degree`) from live data count (`Cardinality`) and avoid `NULL` comparison mistakes:',
        markdownBlock:
`> **Schema:** \`Student(\`<u>\`RegNo\`</u>\`, Name, CGPA, Phone)\` · **Degree (Arity) = 4 columns** · **Cardinality = 2 tuples**

| RegNo | Name | CGPA | Phone | Note |
| :--- | :--- | :--- | :--- | :--- |
| \`101\` | Rahul | \`8.5\` | \`'9876543210'\` | Complete tuple |
| \`102\` | Priya | \`9.2\` | \`NULL\` | Missing / Unknown phone |

\`\`\`sql
WHERE Phone = NULL   -- Always evaluates to UNKNOWN (returns 0 rows!)
WHERE Phone IS NULL  -- Correctly matches row 102 ('Priya')
\`\`\``,
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Core CO1 Exam Method · Auditing Relation Validity, Degree/Cardinality & NULL Semantics [CO1, BL2]',
        questionPrompt:
          'Standard Theory/Applied Question: Define Relation, Tuple, Domain, Degree, Cardinality. State Codd’s characteristics of relations and explain the three interpretations of NULL values with SQL examples.',
        solvingMethod: [
          'Step 1 — Formal Definitions [3M]: Define `Relation Schema R(A1, A2, ..., An)`, `Domain`, `Tuple`, **Degree = `n`**, and **Cardinality = `|r|`** using a clean sample table like `Student(RegNo, Name, CGPA)`.',
          'Step 2 — Enumerate All 7 Characteristics [4M]: List Unique relation name, Unique column names, Atomicity (no repeating groups), Same domain, No duplicate tuples, Tuple-order irrelevance, Attribute-order irrelevance—illustrate at least 2 violations.',
          'Step 3 — Three NULL Cases + SQL Warning [3M]: State **Unknown**, **Missing**, **Not Applicable**, emphasize **`NULL ≠ 0 ≠ ""`**, and show why queries must use `IS NULL` rather than `= NULL`.',
        ],
        commonPitfalls:
          'Swapping **Degree** (number of columns/attributes) with **Cardinality** (number of rows/tuples), or forgetting the **set property** that a true mathematical relation cannot contain duplicate rows.',
      },
    ],
    exampleTitle: 'Student Relation Metrics & Violation Check (Slide 109)',
    exampleBody:
`> **Relation:** \`Student(\`<u>\`RegNo\`</u>\`, Name, CGPA)\` · Tuples: \`(101, Rahul, 8.5)\` and \`(102, Priya, 9.2)\`
> **Metrics:** **Degree** = \`3\` attributes · **Cardinality** = \`2\` tuples

- **Violation Check 1:** Cell \`Name = "Rahul, Priya"\` breaks **Atomicity** (*Characteristic #3*).
- **Violation Check 2:** Cell \`CGPA = "ABC"\` breaks **Domain Uniformity** (*Characteristic #4*).`,
    examTip:
      'Memory trick: **D**egree = **D**imensions (columns), **C**ardinality = **C**ount of tuples (rows). Mention explicitly that `NULL` means Unknown, Missing, or Not Applicable.',
    selfChecks: [
      {
        question:
          'A relation COURSE_ENROLL(RegNo, CourseCode, Grade, Semester, Instructor) currently stores 1,420 student enrollment rows. What are its Degree and Cardinality?',
        options: [
          'Degree = 1420, Cardinality = 5',
          'Degree = 5, Cardinality = 1420',
          'Degree = 4, Cardinality = 1420',
          'Degree = 5, Cardinality = 5',
        ],
        correctIndex: 1,
        explanation:
          'Degree is the number of attributes/columns (5: RegNo, CourseCode, Grade, Semester, Instructor), and Cardinality is the number of rows/tuples currently stored (1,420).',
      },
      {
        question:
          'Which of the following violates Characteristic #3 (Atomicity) of a valid relation?',
        options: [
          'Swapping the order of two rows during display',
          'Storing NULL for an unmarried employee\'s SpouseName',
          'Storing "DBMS, Operating Systems" inside a single cell of the CourseNames column',
          'Having 500 rows with the same Department code "CSE"',
        ],
        correctIndex: 2,
        explanation:
          'Characteristic #3 requires every cell to hold a single indivisible (atomic) value; comma-separated lists inside one cell violate atomicity (and 1NF).',
      },
    ],
  },

  'm1-t6': {
    summary:
      'Database **Integrity Constraints** (`Domain`, `Key`, `NULL`, `Entity Integrity`, `Referential Integrity`) act like traffic rules preventing invalid inserts, duplicates, NULL PKs, and orphan foreign keys—heavily tested in **BOTH `A1+TA1 · Q2` and `A2+TA2 · Q2`** across the Nov 2026 FAT papers.',
    sourceDecks: [
      'Module 1. Database Systems Concepts and Architecture..pptx (Slides 148–170)',
    ],
    keyPoints: [
      {
        heading: 'Key Hierarchy: Super Key -> Candidate Key -> Primary / Alternate / Foreign Key',
        text: '**Super Key:** Any attribute set uniquely identifying every tuple (`{RegNo}`, `{RegNo, Name}`). **Candidate Key (CK):** Minimal Super Key (`{RegNo}`, `{Email}`). **Primary Key (PK):** Chosen CK (`RegNo`). **Alternate Key:** Unchosen CKs (`Email`). **Foreign Key (FK):** Attribute referring to PK/UNIQUE key of parent table.',
      },
      {
        heading: 'The 5 Relational Integrity Constraints (Slides 151–155)',
        text: '**1) Domain Constraint:** Values must obey column datatype & range (`CHECK (age BETWEEN 1 AND 120)`). **2) Key Constraint:** No duplicate non-NULL values (`UNIQUE` / `PRIMARY KEY`). **3) NULL Constraint (`NOT NULL`):** Mandatory attribute. **4) Entity Integrity:** **PK attribute(s) MUST NOT be `NULL`**. **5) Referential Integrity (`FOREIGN KEY`):** Child FK must either match an existing parent PK OR be `NULL`.',
      },
      {
        heading: 'Four DBMS Actions on Parent DELETE / UPDATE Violation (Slides 156–161)',
        text: 'When deleting a parent tuple (`Student` or `PROJECT_GRANT`) referenced by a child FK (`Attendance` or `Budget_Alloc`), DBMS applies: **1) `RESTRICT / REJECT`** (default — block delete), **2) `ON DELETE CASCADE`** (auto-delete child rows), **3) `ON DELETE SET NULL`** (child FK becomes `NULL`), or **4) `ON DELETE SET DEFAULT`** (child FK resets to default e.g. `0`).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Complete Integrity Constraint & Violation Response Matrix',
        body: 'Memorize the exact SQL clause and rejection trigger for all 5 constraints from Slides `150–163`:',
        table: {
          headers: ['Constraint Type', 'SQL Clause', 'Rule Enforced', 'Violation Example & Action'],
          rows: [
            ['Domain Constraint', '`CHECK (...)` / Data Type', 'Atomic value inside allowed type & range', '`CGPA = 12.5` (`0..10`) or `Age = 150` -> Reject INSERT/UPDATE'],
            ['Key Constraint', '`UNIQUE` / `PRIMARY KEY`', 'Every tuple holds distinct key value', 'Duplicate `phone` or duplicate `RegNo` -> Reject INSERT/UPDATE'],
            ['NULL Constraint', '`NOT NULL`', 'Mandatory non-empty attribute value', '`patient_name = NULL` -> Reject INSERT/UPDATE'],
            ['Entity Integrity', '`PRIMARY KEY`', 'No part of Primary Key may ever be `NULL`', '`INSERT Patient(NULL, ...)` -> Reject INSERT'],
            ['Referential Integrity', '`FOREIGN KEY ... REFERENCES`', 'Child FK matches an existing Parent PK or is `NULL`', '`Attendance(\'25BCE9999\')` (missing parent) -> Reject; Parent Delete -> 4 actions'],
          ],
        },
      },
      {
        title: '2. Tracing Referential Integrity Violations on Parent `DELETE` / `UPDATE`',
        body: 'Whenever a FAT question asks *"How does DBMS handle deleting a parent tuple referenced by a foreign key?"*, write out **ALL FOUR** configured options cleanly:',
        markdownBlock:
`#### Schema & Triggering Operation
- **Parent Relation:** \`PROJECT_GRANT\`(\`<u>Project_ID</u>\`, \`Project_Title\`, \`Principal_Investigator_SSN\`, \`Budget_Amount\`)
- **Child Relation:** \`EXPENDITURE\`(\`<u>Exp_ID</u>\`, \`Project_ID\` *[FK -> PROJECT_GRANT]*, \`Amount\`)

\`\`\`sql
DELETE FROM PROJECT_GRANT WHERE Project_ID = 'P101';
-- Risk: 'P101' currently has referencing child rows in EXPENDITURE
\`\`\`

| Referential Action | DBMS Behavior on Child Rows in \`EXPENDITURE\` |
| :--- | :--- |
| \`RESTRICT\` / \`NO ACTION\` *(Default)* | **Rejects** the delete on \`PROJECT_GRANT\` and raises a referential integrity error. |
| \`ON DELETE CASCADE\` | Deletes \`'P101'\` from \`PROJECT_GRANT\` **and automatically deletes** matching child rows in \`EXPENDITURE\`. |
| \`ON DELETE SET NULL\` | Deletes \`'P101'\` from \`PROJECT_GRANT\` and sets \`EXPENDITURE.Project_ID = NULL\` (requires nullable FK). |
| \`ON DELETE SET DEFAULT\` | Deletes \`'P101'\` from \`PROJECT_GRANT\` and resets \`EXPENDITURE.Project_ID\` to its column default. |`,
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q2 [10M, CO1, BL3]',
        questionPrompt:
          'Q2: Discuss the need for integrity constraints and describe their types. Given:\n• PATIENT(patient_id, patient_name, phone, age, gender)\n• DOCTOR(doctor_id, doctor_name, specialization)\n• APPOINTMENT(appointment_id, patient_id, doctor_id, appointment_date, status)\nMap each requirement (a–e) to the exact constraint and justify:\na) Every patient must have a unique patient_id\nb) A patient\'s phone number must not be duplicated\nc) Patient age must be between 1 and 120\nd) patient_name and doctor_name cannot be left empty\ne) An appointment can be created only for an existing patient and an existing doctor. [10M]',
        solvingMethod: [
          'Part 1 — Need & 5 Constraint Types [3M]: State that constraints guarantee data accuracy, prevent duplicates/orphans, and summarize **Domain**, **Key**, **NOT NULL**, **Entity Integrity**, and **Referential Integrity**.',
          'Part 2 — Map (a) -> **Entity Integrity + Key Constraint (`PRIMARY KEY`)** [1.5M]: `patient_id` uniquely identifies each patient AND cannot be `NULL` (`PRIMARY KEY (patient_id)`).',
          'Part 3 — Map (b) -> **Key Constraint (`UNIQUE`)** [1.5M]: Prevents two patients sharing the same `phone` (`phone VARCHAR(15) UNIQUE`), while still allowing `phone` not to be the PK.',
          'Part 4 — Map (c) & (d) -> **Domain Constraint** & **NOT NULL Constraint** [2M]: (c) restricts numeric domain via `CHECK (age BETWEEN 1 AND 120)`; (d) enforces mandatory values via `patient_name VARCHAR(50) NOT NULL` and `doctor_name VARCHAR(50) NOT NULL`.',
          'Part 5 — Map (e) -> **Referential Integrity (`FOREIGN KEY`)** [2M]: `APPOINTMENT.patient_id REFERENCES PATIENT(patient_id)` and `APPOINTMENT.doctor_id REFERENCES DOCTOR(doctor_id)` ensure no orphan appointment can reference a non-existent patient or doctor.',
        ],
        commonPitfalls:
          'Mapping (a) ONLY to `Key Constraint` without mentioning **Entity Integrity (`PK ≠ NULL`)**, or mapping (b) `phone` to `PRIMARY KEY` instead of **`UNIQUE` Key Constraint**!',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q2(A) & Q2(C) [4M of 10M, CO1, BL2/BL3]',
        questionPrompt:
          'Q2: PROJECT_GRANT(Project_ID, Project_Title, Principal_Investigator_SSN, PI_Name, Sponsor_Agency, Budget_Amount).\nA. Define a Domain Constraint and provide one example violation using any attribute from PROJECT_GRANT. [2M]\n(Note: Q2(B) anomalies [6M] are solved in Module 2 Topic m2-t4!)\nC. Explain how the DBMS handles referential integrity constraint checks when deleting a tuple from PROJECT_GRANT if Project_ID is referenced as a foreign key in another relation. [2M]',
        solvingMethod: [
          'Part A — Domain Constraint + `PROJECT_GRANT` Example [2M]: Define Domain Constraint (each attribute value must be atomic and belong to its declared data type, format, or range `CHECK`). Example: Define `Budget_Amount DECIMAL(12,2) CHECK (Budget_Amount > 0)`; inserting a row with `Budget_Amount = -50000` or `"Five Lakhs"` triggers a **Domain Constraint Violation** and is rejected.',
          'Part C — Referential Integrity on Parent `DELETE` [2M]: When deleting a `PROJECT_GRANT` tuple whose `Project_ID` is referenced by child tuples in another relation (e.g. `EXPENDITURE`), the DBMS intercepts the deletion and applies its configured referential action: **(1) `RESTRICT / REJECT`** (blocks delete), **(2) `CASCADE`** (deletes matching child rows too), **(3) `SET NULL`** (sets child FK to `NULL` if nullable), or **(4) `SET DEFAULT`** (sets child FK to a default ID).',
        ],
        commonPitfalls:
          'Giving a generic `Age = -5` example for Part A instead of using a real attribute from `PROJECT_GRANT` (`Budget_Amount` or `Principal_Investigator_SSN`), or stating only "DBMS rejects delete" in Part C without naming **`RESTRICT`, `CASCADE`, `SET NULL`, `SET DEFAULT`**.',
      },
    ],
    exampleTitle: 'Student / Attendance & Faculty Violation Cheat Sheet (Slides 151–161)',
    exampleBody:
`1. **Domain:** \`CGPA = 12.5\` (violates \`CHECK (CGPA BETWEEN 0 AND 10)\`) -> **Reject INSERT**
2. **Key:** Duplicate \`RegNo = '25BCE1001'\` -> **Reject INSERT**
3. **Entity / NULL:** \`PRIMARY KEY RegNo = NULL\` -> **Reject INSERT**
4. **Referential Insert:** \`Attendance('25BCE9999', '15-Jul')\` with no matching \`Student\` parent -> **Reject INSERT**
5. **Referential Delete:** \`DELETE FROM Student WHERE RegNo = '25BCE1001'\` while \`Attendance\` child rows exist -> \`RESTRICT\` (Reject) | \`CASCADE\` (Delete children) | \`SET NULL\` (\`FK = NULL\`) | \`SET DEFAULT\` (\`FK = 0\`)`,
    examTip:
      'Whenever an exam question mentions **"uniquely identifies every tuple"** (`a`), write BOTH **Key Constraint** AND **Entity Integrity (`NOT NULL`)**; for `"must not be duplicated"` (`b`) on a non-PK column, write **`UNIQUE` Key Constraint**.',
    selfChecks: [
      {
        question:
          'In the Hospital schema (A2+TA2 Q2), requirement (c) states "Patient age must be between 1 and 120." Which integrity constraint enforces this rule?',
        options: [
          'Entity Integrity Constraint',
          'Referential Integrity Constraint',
          'Domain Constraint (via CHECK condition)',
          'Alternate Key Constraint',
        ],
        correctIndex: 2,
        explanation:
          'Domain Constraints restrict the allowable data type, format, and value range (e.g., CHECK (age BETWEEN 1 AND 120)) of individual attributes.',
      },
      {
        question:
          'If table PUBLICATION references PROJECT_GRANT(Project_ID) with ON DELETE SET NULL, what happens when Project "P204" (referenced by 3 publications) is deleted from PROJECT_GRANT?',
        options: [
          'The DELETE fails with a RESTRICT error',
          'All 3 referencing rows in PUBLICATION are automatically deleted',
          'Project "P204" is deleted, and Project_ID becomes NULL in those 3 PUBLICATION rows',
          'The Primary Key of PROJECT_GRANT becomes NULL',
        ],
        correctIndex: 2,
        explanation:
          'ON DELETE SET NULL removes the parent tuple while preserving the child rows by setting their referencing Foreign Key column (Project_ID) to NULL.',
      },
    ],
  },
};
