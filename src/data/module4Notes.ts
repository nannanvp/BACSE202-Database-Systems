import type { TopicNote } from './noteTypes';

export const MODULE_4_NOTES: Record<string, TopicNote> = {
  'm4-t1': {
    summary:
      'A Transaction is a logical unit of database processing bounded by Begin and End operations that transforms one consistent database state into another. Using Write-Ahead Logging (WAL) and well-defined state transitions, the Transaction Manager and Recovery Manager enforce all four ACID guarantees even under crashes and concurrent execution.',
    sourceDecks: [
      'Module 4 Transaction Processing and Recovery.pptx (Slides 1–28)',
      'Module-4.ppt (Slides 1–45)',
    ],
    keyPoints: [
      {
        heading: 'Low-Level Read/Write Execution Model',
        text: 'Every transaction interacts with disk storage via two primitives: `read_item(X)` (locate disk block -> copy block to main-memory buffer -> copy item `X` into program variable) and `write_item(X)` (modify buffer copy -> schedule dirty block flush back to disk). Delaying disk writes creates performance gains but introduces crash-loss and dirty-read risks.',
      },
      {
        heading: 'ACID Properties & Enforcing Subsystems',
        text: '**Atomicity** (all-or-nothing execution — Recovery Manager), **Consistency Preservation** (database moves between valid integrity states — DBMS constraints + application logic), **Isolation** (concurrent runs behave as if serial — Concurrency Control Subsystem), and **Durability** (committed changes survive crashes — Recovery Manager + WAL on stable storage).',
      },
      {
        heading: 'Five-State Transaction Lifecycle & Commit Point',
        text: 'A transaction progresses from **Active** (reads/writes) -> **Partially Committed** (final operation finished; checks & log flush pending) -> **Committed** (Commit Point reached: `[commit, T]` flushed to stable log) -> **Terminated**. Any error or abort transitions Active or Partially Committed -> **Failed** -> **Aborted** (changes undone) -> **Terminated**.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Why Transactions Exist: Single-User vs. Multi-User & Low-Level I/O',
        body: 'In a database, a single logical business action (such as transferring funds from Account `A` to Account `B`) spans multiple low-level `read_item` and `write_item` steps. Because main memory is volatile and multiple users share disk blocks concurrently, crashes or uncontrolled interleaving between steps can violate financial or structural invariants:',
        bullets: [
          '**`read_item(X)` Execution Steps:** (1) Find the disk block address containing item `X`. (2) Copy that disk block into a main-memory DBMS buffer (skipped if already cached). (3) Copy item `X` from the buffer into the transaction’s local variable.',
          '**`write_item(X)` Execution Steps:** (1) Locate the block of `X` in disk/buffer. (2) Copy its disk block into memory if not buffered. (3) Overwrite `X` in the memory buffer from the program variable. (4) Flush the updated buffer block back to disk (either immediately or lazily on eviction/commit).',
          '**System Crash Window:** If a power failure occurs after `write_item(A)` flushes `A - 1000` to disk, before `write_item(B)` adds `B + 1000`, money vanishes unless the DBMS tracks before-images and rolls `A` back.',
        ],
      },
      {
        title: '2. Complete ACID Properties Matrix',
        body: 'ACID is the foundational contract between the DBMS engine and applications. Exam answers should state the **definition**, **concrete banking effect**, and the **responsible DBMS component** for each property:',
        table: {
          headers: ['Property', 'Formal Guarantee', 'Responsible DBMS Component', 'Bank Transfer Example (₹1,000 A → B)'],
          rows: [
            [
              'Atomicity (A)',
              '“All or nothing” — either every operation of T completes or none takes effect.',
              'Transaction / Recovery Manager (UNDO logs)',
              'If crash occurs after debiting A (5000→4000) and before crediting B, Recovery UNDOs A back to 5000.',
            ],
            [
              'Consistency (C)',
              'Executing T alone moves the DB from one valid constraint-satisfying state to another.',
              'Application Logic + DBMS Integrity Constraints (CHECK, FK)',
              'Total sum (A + B) remains invariant (5000 + 2000 = 4000 + 3000 = 7000) and balance constraints hold.',
            ],
            [
              'Isolation (I)',
              'Effects of an uncommitted T are hidden from concurrent transactions; outcome matches a serial order.',
              'Concurrency Control Subsystem (2PL / Timestamping)',
              'A simultaneous balance-audit or second withdrawal sees either pre-transfer or post-transfer balances, never half-moved ₹1,000.',
            ],
            [
              'Durability (D)',
              'Once T commits, its updates persist permanently regardless of subsequent crashes.',
              'Recovery Manager (WAL / REDO logs on stable storage)',
              'Even if power fails 1 ms after confirmation and dirty pages were still only in RAM buffer, Recovery REDOs A=4000, B=3000 on restart.',
            ],
          ],
        },
      },
      {
        title: '3. Transaction State Transition Diagram (5 States)',
        body: 'Track every legal state transition, paying close attention to the two exits out of **Partially Committed**:',
        diagramId: 'm4-txn-states',
        diagramCaption: '5-State Transaction Lifecycle showing Commit Point and Failure/Abort transitions.',
        bullets: [
          '**Active:** Initial state while the transaction executes `read_item` and `write_item` operations.',
          '**Partially Committed:** Reached right after the final statement completes; the DBMS verifies concurrency/integrity checks and prepares to flush log records to disk.',
          '**Committed:** Reached once all log records (including `[commit, T]`) are forced to stable storage (**Commit Point**). From here the transaction cannot be aborted.',
          '**Failed:** Entered if an error, constraint check, deadlock victim abort, or crash prevents normal completion from **Active** or **Partially Committed**.',
          '**Aborted & Terminated:** Recovery rolls back partial effects (`UNDO`), then either restarts or kills the transaction, freeing resources in **Terminated**.',
        ],
      },
      {
        title: '4. Failure Types & Write-Ahead System Log Records',
        body: 'The **System Log** is an append-only sequential file stored on stable (non-volatile) disk. Every update writes its log record **before** modifying disk data (**Write-Ahead Logging**):',
        bullets: [
          '**Five Failure Sources:** (1) Computer/System crash (hardware/OS fault losing volatile RAM), (2) Transaction/System error (divide-by-zero, overflow, user interrupt), (3) Local error or exception detected by T (insufficient funds `Abort`), (4) Concurrency control enforcement (deadlock victim or serializability abort), and (5) Disk failure or physical catastrophe (head crash, fire — recovered via archival backups + logs).',
          '**Standard Log Record Types:** `[start_transaction, T]`, `[write_item, T, X, old_value (BFIM), new_value (AFIM)]`, `[read_item, T, X]` (optional for cascading-abort tracking), `[commit, T]`, `[abort, T]`, and `[checkpoint]`.',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q5(a) [5M of 10M, CO3, BL4]',
        questionPrompt:
          'Q5(a): An online banking system allows customers to transfer money from one account to another. During a transfer, the system updates the balances of both accounts. Multiple customers may perform transfers simultaneously, and the system may experience failures such as a server crash or power interruption during transaction processing. Explain how the transaction processing system should handle the above scenario to ensure reliable and correct execution of transactions. Discuss the relevant properties of database transactions with suitable examples from the given scenario. [5 Marks]',
        solvingMethod: [
          'Step 1 — Frame the Transaction Processing Architecture [1M]: Treat each fund transfer `T` (`Debit A`, `Credit B`) as a single atomic transaction wrapped between `Begin_Transaction` and `Commit` (or `Abort`). State that the **Transaction Manager**, **Concurrency Control Manager**, and **Recovery Manager** collaborate using a **Write-Ahead Log (WAL)** on stable storage and locking/serializability protocols.',
          'Step 2 — Address Both Hazards in the Prompt [1M]: (1) *Simultaneous customer transfers* are handled by the Concurrency Control Manager (e.g., Strict 2PL) so interleaved reads/writes never lose updates or expose half-transferred funds. (2) *Server crashes / power interruptions* are handled by the Recovery Manager inspecting WAL records (`BFIM`/`AFIM` and `[commit, T]`) to undo incomplete transfers and redo committed ones.',
          'Step 3 — Explain All 4 ACID Properties with Concrete Banking Transfer Examples [3M]: Write clear subheadings for **Atomicity** (if power fails after `A = A - 1000` before `B = B + 1000`, `UNDO` restores `A`), **Consistency** (`A + B` total stays constant and minimum balance constraints hold before and after `T`), **Isolation** (a concurrent transfer or balance audit on `A`/`B` is serialized via locks so intermediate balances are invisible), and **Durability** (once the user receives “Transfer Successful” at the Commit Point, a crash 1 second later still preserves `A` and `B` via `REDO` logs).',
        ],
        commonPitfalls:
          'Do not only list generic ACID textbook definitions—the rubric explicitly asks for **suitable examples from the given banking transfer scenario** and **how the transaction processing system handles simultaneous transfers + crashes** (mention Concurrency Control + WAL Recovery Manager!).',
      },
    ],
    exampleTitle: 'Bank Transfer Commit Point & WAL Log Trace (Slide 19–22)',
    exampleBody:
`#### Initial Balances: \`A = 5,000\`, \`B = 2,000\` *(Total = 7,000)*

| Step | Action / Operation | Transaction State | Write-Ahead Log (WAL) Record |
| :--- | :--- | :--- | :--- |
| 1 | \`Begin_Transaction T1\` | **Active** | \`[start_transaction, T1]\` |
| 2 | \`read_item(A); A := A - 1000; write_item(A)\` | **Active** *(Buffer \`A = 4,000\`)* | \`[write_item, T1, A, 5000, 4000]\` |
| 3 | \`read_item(B); B := B + 1000; write_item(B)\` | **Active** *(Buffer \`B = 3,000\`)* | \`[write_item, T1, B, 2000, 3000]\` |
| 4 | \`End_Transaction T1\` | **Partially Committed** | Force-flush buffered WAL entries |
| 5 | **Commit Point Reached** | **Committed -> Terminated** | \`[commit, T1]\` flushed to stable disk |`,
    examTip:
      'In the 5-state diagram, always draw the arrow from Partially Committed to BOTH Committed (log flush succeeds) and Failed (log flush or validation fails).',
    selfChecks: [
      {
        question:
          'A transaction finishes executing its last write statement and enters the Partially Committed state, but a constraint/disk-flush failure strikes before [commit, T] reaches stable storage. Which state transition occurs next?',
        options: [
          'Partially Committed -> Aborted directly without entering Failed',
          'Partially Committed -> Failed -> Aborted -> Terminated',
          'Partially Committed -> Active (automatic retry)',
          'Partially Committed -> Committed (completed operations stay permanent)',
        ],
        correctIndex: 1,
        explanation:
          'Until the Commit Point ([commit, T] flushed to stable WAL), any error moves Partially Committed into Failed, where recovery UNDOs buffered/disk writes before reaching Aborted and Terminated.',
      },
      {
        question:
          'Which pairing correctly matches an ACID guarantee with the primary DBMS subsystem enforcing it?',
        options: [
          'Atomicity -> Concurrency Control Manager; Isolation -> Query Optimizer',
          'Durability -> Transaction/Recovery Manager via WAL; Isolation -> Concurrency Control Manager',
          'Consistency -> Buffer Pool Manager; Atomicity -> B+ Tree Index Manager',
          'Isolation -> System Catalog; Durability -> DDL Compiler',
        ],
        correctIndex: 1,
        explanation:
          'Atomicity and Durability are guaranteed by the Recovery Manager using WAL before/after-images and commit logs, whereas Isolation is enforced by the Concurrency Control Manager.',
      },
    ],
  },

  'm4-t2': {
    summary:
      'Allowing multiple transactions to interleave CPU bursts and disk I/O boosts throughput, but uncontrolled interleaving produces five data anomalies (Lost Update, Dirty Read, Incorrect Summary, Unrepeatable Read, Phantom Read). To keep failures safe, schedules are strictly classified into Recoverable, Cascadeless (ACA), and Strict hierarchies.',
    sourceDecks: [
      'Module 4 Transaction Processing and Recovery.pptx (Slides 9–17, 51–54)',
      'Module-4.ppt (Slides 50–92, 120–133)',
    ],
    keyPoints: [
      {
        heading: 'Serial vs. Concurrent Schedules & Why Concurrency Matters',
        text: 'A **Schedule `S`** orders the operations of `n` transactions while preserving each transaction’s internal sequence. **Serial schedules** run transactions one after another (always correct, zero concurrency), whereas **Concurrent schedules** interleave operations so one transaction computes/reads while another waits on disk I/O.',
      },
      {
        heading: 'Five Classic Concurrency Problems (Anomalies)',
        text: '1) **Lost Update:** `T2` overwrites `T1`’s update after reading the stale pre-update value. 2) **Dirty Read (Temporary Update):** `T2` reads `X` modified by `T1` before `T1` later fails/aborts. 3) **Incorrect Summary:** Aggregate query `T1` reads some items before and others after `T2` transfers values between them. 4) **Unrepeatable Read:** `T1` reads `X` twice and observes a new value updated by `T2` in between. 5) **Phantom Read:** `T1` re-runs a range predicate and sees newly inserted/deleted rows from `T2`.',
      },
      {
        heading: 'Recoverability Hierarchy: Strict ⊂ Cascadeless ⊂ Recoverable',
        text: '**Recoverable:** If `Tj` reads `X` written by `Ti`, `Commit(Ti)` must appear before `Commit(Tj)`. **Cascadeless (ACA — Avoids Cascading Aborts):** `Tj` may read `X` ONLY after `Ti` commits (prevents dirty reads). **Strict:** `Tj` may neither read NOR write `X` until `Ti` commits or aborts (makes recovery a simple before-image restore).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. The Five Concurrency Anomalies — Exact Traces & Diagnostics',
        body: 'In VIT exams, you are frequently shown an interleaved timeline (`t1, t2, ...`) and asked to **name the anomaly** and pinpoint the exact breaking step. Study these five canonical patterns:',
        table: {
          headers: ['Anomaly', 'Root Interleaving Pattern', 'Canonical Trace Example', 'Why Result Is Wrong'],
          rows: [
            [
              'Lost Update (WW)',
              'Both T1 and T2 read initial X, compute locally, and write back; second write overwrites first.',
              'T1: R(X)=80 -> T2: R(X)=80 -> T1: W(X=75) -> T2: W(X=84)',
              'T1’s -5 deduction vanishes completely; final X is 84 instead of 79.',
            ],
            [
              'Dirty Read / Temporary Update (WR)',
              'T2 reads (or uses) X written by uncommitted T1, then T1 aborts and rolls X back.',
              'T1: R(X); W(X=75) -> T2: R(X=75) -> T1: ABORT (X→80)',
              'T2 computed or displayed X=75 which never logically existed.',
            ],
            [
              'Incorrect Summary / Inconsistent Analysis',
              'Audit T1 sums A then B while transfer T2 moves amount M from A to B in between.',
              'T1: R(A=100) -> T2: W(A=80); W(B=70); C2 -> T1: R(B=70)',
              'T1 computes Sum = 100 + 70 = 170 (double-counting transferred 20 units).',
            ],
            [
              'Unrepeatable Read (RW + WR)',
              'T1 reads X once, T2 modifies and commits X, T1 reads X again.',
              'T1: R(X=50) -> T2: W(X=80); C2 -> T1: R(X=80)',
              'Within one transaction, two identical SELECTs of the same row return different numbers.',
            ],
            [
              'Phantom Read',
              'T1 executes a range query twice while T2 inserts/deletes matching rows and commits.',
              'T1: SELECT * WHERE Dept=5 (3 rows) -> T2: INSERT Dept=5; C2 -> T1 re-runs (4 rows)',
              'A “phantom” new row appears even if existing rows were locked (requires predicate/range locking).',
            ],
          ],
        },
      },
      {
        title: '2. Schedule Classification Based on Recoverability',
        body: 'Serializability ensures correctness assuming transactions commit; **Recoverability** ensures the database can still recover safely if any active transaction crashes or aborts mid-schedule:',
        diagramId: 'm4-recoverability-venn',
        diagramCaption: 'Strict nested hierarchy: Strict ⊂ Cascadeless (ACA) ⊂ Recoverable ⊂ All Schedules.',
        table: {
          headers: ['Schedule Class', 'Formal Condition on Ti → Tj', 'Minimal Example', 'Verdict & Behavior on Ti Abort'],
          rows: [
            [
              'Irrecoverable',
              'Tj reads X written by Ti, AND Commit(Tj) occurs BEFORE Commit(Ti).',
              'W1(X); R2(X); C2; C1',
              'FORBIDDEN. If T1 aborts after C2, T2 already committed using fake data (violates Durability).',
            ],
            [
              'Recoverable (with Cascading Rollback)',
              'Tj reads uncommitted X from Ti, AND Commit(Ti) occurs BEFORE Commit(Tj).',
              'W1(X); R2(X); C1; C2',
              'Safe but slow: if T1 aborts before C1, T2 (and any T3 reading from T2) must cascade-rollback.',
            ],
            [
              'Cascadeless (ACA)',
              'Tj may read X written by Ti ONLY AFTER Commit(Ti) / Abort(Ti).',
              'W1(X); C1; R2(X); C2',
              'Zero dirty reads, zero cascading rollbacks. (May still have blind overwrite WW before commit.)',
            ],
            [
              'Strict',
              'Tj neither reads NOR overwrites X written by Ti until Commit(Ti) / Abort(Ti).',
              'W1(X); C1; W2(X); R2(X); C2',
              'Gold standard (enforced by Strict 2PL). Any uncommitted write is trivially undone using BFIM.',
            ],
          ],
        },
        bullets: [
          '**Critical Exam Trap (`Strict` vs `Cascadeless`):** Consider `S = W1(X); W2(X); C1; C2`. Does `T2` ever read `X` written by `T1`? No! So `S` is **Cascadeless** (and **Recoverable**). Yet `T2` overwrote `X` before `T1` committed, so if `T1` aborted, restoring `T1`’s before-image would wipe out `T2`’s write! Thus `S` is **NOT Strict**.',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q8(a) Part A [3M of 10M, CO3, BL3]',
        questionPrompt:
          'Q8(a)-A: Product_A initially has 100 units and Product_B has 50 units (Total = 150). T1 (Audit Report) sums Product_A and Product_B while T2 (Stock Transfer) moves 20 units from Product_A to Product_B. T1 reads A=100 at t2, T2 updates A=80 and B=70 and commits at t4–t10, then T1 reads B=70 at t11 and outputs Sum = 170. Identify the concurrency problem and explain precisely where the inconsistency occurs. [3 Marks] (Full 2PL resolution is covered in Topic 4.)',
        solvingMethod: [
          'Step 1 — Name the Exact Anomaly [1M]: Identify this as the **Incorrect Summary Problem** (also called the *Inconsistent Analysis* or *Inconsistent Retrieval* problem).',
          'Step 2 — Pinpoint the Faulty Interleaving Interval [1M]: At `t2–t3`, `T1` reads the **pre-transfer** value `Product_A = 100` (`Sum = 100`). Between `t4` and `t10`, `T2` executes completely and commits, deducting 20 from `Product_A` (`80`) and adding 20 to `Product_B` (`70`).',
          'Step 3 — Explain the Arithmetic Error [1M]: At `t11`, `T1` resumes and reads the **post-transfer** value `Product_B = 70`. Because `T1` combined a pre-transfer read of `A` (`100`) with a post-transfer read of `B` (`70`), the transferred 20 units were **counted twice**, producing an invalid `Sum = 170` instead of the invariant `150`.',
        ],
        commonPitfalls:
          'Do not confuse this with Dirty Read (`T2` committed at `t10` before `T1` read `B` at `t11`, so `T1` did NOT read uncommitted data) or Lost Update (nobody lost a write; `T1` is read-only!). It is specifically **Incorrect Summary**.',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q7 Part C [3M of 10M, CO3, BL3]',
        questionPrompt:
          'Q7(C): Given S = T1:Read(X); T1:Write(X); T2:Read(X); T2:Write(X); T1:Read(Y); T2:Read(Y); T1:Write(Y); T1:Commit; T2:Commit. Classify schedule S according to recoverability properties (Recoverable, Cascadeless, or Strict). [3 Marks]',
        solvingMethod: [
          'Step 1 — Scan for Every Read-From (`Wi(Q) -> Rj(Q)`) Pair [1M]: Check `X`: `T1:Write(X)` (step 2) is immediately followed by `T2:Read(X)` (step 3) BEFORE `T1:Commit` (step 8). So `T2` performs a **Dirty Read** on `X` from `T1`.',
          'Step 2 — Test Cascadeless & Strict [1M]: Because `T2:Read(X)` occurs *before* `T1:Commit`, `S` violates the **Cascadeless (ACA)** condition (failing `T1` would force `T2` to cascade-rollback). Since `Strict ⊂ Cascadeless`, `S` is automatically **NOT Strict** either (moreover `T2:Write(X)` also overwrites `T1:Write(X)` before `T1` commits).',
          'Step 3 — Test Recoverability via Commit Order [1M]: Check `T1:Commit` (step 8) vs `T2:Commit` (step 9). `T1` commits **before** `T2` commits! Therefore `S` IS **Recoverable (specifically: Recoverable with Cascading Rollback)**.',
        ],
        commonPitfalls:
          'Never stop after spotting a Dirty Read and blindly write "Irrecoverable"! Dirty read only disproves *Cascadeless* and *Strict*. Recoverability depends strictly on **Commit Order** (`Commit(writer) < Commit(reader)`).',
      },
    ],
    exampleTitle: 'Side-by-Side Recoverability Contrast (Module-4.ppt Slides 86–92)',
    exampleBody:
`| Schedule | Classification | Reason |
| :--- | :--- | :--- |
| \`W1(X); R2(X); C2; C1\` | **Irrecoverable** | \`C2\` commits before \`C1\` after a dirty read on \`X\` |
| \`W1(X); R2(X); C1; C2\` | **Recoverable (Cascading)** | \`C1 < C2\`, but \`R2(X)\` read uncommitted \`X\` |
| \`W1(X); W2(X); C1; C2\` | **Cascadeless (Not Strict)** | No dirty read (\`WR\`), but \`W2\` overwrote uncommitted \`X\` |
| \`W1(X); C1; R2(X); C2\` | **Cascadeless & Recoverable** | \`R2(X)\` waits until \`C1\` completes |
| \`W1(X); C1; W2(X); C2\` | **Strict** *(also ACA & Rec.)* | \`T2\` waits for \`C1\` before reading OR writing \`X\` |`,
    examTip:
      'Memorize the exact hierarchy `Strict ⊂ Cascadeless ⊂ Recoverable`. When classifying a schedule in 3-mark questions, test in order: (1) Any WW or WR before writer commits? -> Not Strict. (2) Any WR before writer commits? -> Not Cascadeless. (3) Writer commits before reader? -> Recoverable.',
    selfChecks: [
      {
        question:
          'Which statement is ALWAYS true regarding the schedule classes Recoverable, Cascadeless (ACA), and Strict?',
        options: [
          'Every Recoverable schedule is Cascadeless',
          'Every Strict schedule is both Cascadeless and Recoverable',
          'A schedule with a dirty read can still be Cascadeless if both transactions commit',
          'Irrecoverable schedules are allowed as long as they are Conflict Serializable',
        ],
        correctIndex: 1,
        explanation:
          'Strict ⊂ Cascadeless ⊂ Recoverable. A Strict schedule forbids any transaction from reading or writing an item written by Ti until Ti commits or aborts, which automatically avoids dirty reads (Cascadeless) and guarantees safe commits (Recoverable).',
      },
      {
        question:
          'Transaction T1 computes SUM(Balance) across Accounts A and B. After T1 reads A, T2 transfers ₹500 from A to B and commits; then T1 reads B and gets a total ₹500 too high. Which anomaly occurred?',
        options: [
          'Lost Update Problem',
          'Dirty Read (Temporary Update) Problem',
          'Incorrect Summary (Inconsistent Analysis) Problem',
          'Phantom Read Problem',
        ],
        correctIndex: 2,
        explanation:
          'T1 combined a pre-transfer snapshot of A with a post-transfer snapshot of B after T2 committed, double-counting the ₹500 in transit — the classic Incorrect Summary problem.',
      },
    ],
  },

  'm4-t3': {
    summary:
      'Conflict Serializability is the industry-standard correctness test for concurrent schedules: a schedule is Conflict Serializable if and only if its Precedence Graph contains no cycles, and any topological sort yields an equivalent serial order. When a cyclic schedule contains blind writes, View Serializability (3 rules) checks whether equivalence still holds.',
    sourceDecks: [
      'Module 4 Transaction Processing and Recovery.pptx (Slides 37–50)',
      'Module-4.ppt (Slides 76–83, 97–117)',
    ],
    keyPoints: [
      {
        heading: 'Conflicting Operations (RW, WR, WW)',
        text: 'Two operations `li` (of `Ti`) and `lj` (of `Tj`) **conflict** iff: (1) `Ti ≠ Tj` (different transactions), (2) they access the **same data item `Q`**, and (3) **at least one is a Write** (`RW`, `WR`, or `WW`). Two Reads (`RR`) NEVER conflict and may be freely swapped.',
      },
      {
        heading: 'Conflict Equivalence & Precedence Graph Theorem',
        text: 'Schedules `S` and `S’` are **conflict equivalent** if one transforms into the other by swapping adjacent non-conflicting instructions. Build the **Precedence (Serialization) Graph** `G = (V, E)`: nodes = transactions; add directed edge `Ti -> Tj` whenever an op in `Ti` precedes and conflicts with an op in `Tj`. **`S` is Conflict Serializable iff `G` is acyclic**, and **topological sorting** gives every valid serial order.',
      },
      {
        heading: 'View Serializability & Blind Writes',
        text: 'Every conflict-serializable schedule is **view serializable**, but the converse is false ONLY when **blind writes** (`W(X)` without prior `R(X)` in that transaction) exist. Testing view equivalence requires matching (1) Initial Read, (2) Read-From (`Wj -> Ri`), and (3) Final Write on every item `Q` (NP-complete in general).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Precedence Graph Construction Algorithm (Exact Exam Method)',
        body: 'Follow this deterministic 4-step procedure so you never miss an edge or direction on 5-mark and 10-mark FAT questions:',
        bullets: [
          '**Step 1 — Group Operations by Data Item (`X`, `Y`, `Z`, ...):** Scan the schedule once per variable rather than checking every random pair. Operations on *different* variables NEVER conflict.',
          '**Step 2 — Pair Earlier vs. Later Ops (`i < j`):** Within variable `Q`, for every operation of `Ti` at step `i` and every later operation of `Tj` (`Ti ≠ Tj`) at step `j`, check if at least one is `W`. Record `(Ri->Wj)`, `(Wi->Rj)`, or `(Wi->Wj)` as edge `Ti -> Tj`. (Skip `Ri->Rj`!)',
          '**Step 3 — Draw & Deduplicate Directed Graph `G`:** Place one node per transaction (`T1, T2, ...`). Collapse duplicate `Ti -> Tj` conflicts into one directed arrow labeled with the conflicting item(s).',
          '**Step 4 — Detect Cycles & Topological Sort:** Any cycle (`T1 -> T2 -> T1` or `T1 -> T2 -> T3 -> T1`) proves **NOT Conflict Serializable**. If acyclic, repeatedly pick a node with **in-degree = 0** (no incoming arrows) to generate all equivalent serial orders. If one node (`T2`) is completely isolated, it can appear anywhere (`Problem 02`: `T1 -> T3` yields `T1->T2->T3`, `T1->T3->T2`, and `T2->T1->T3`).',
        ],
      },
      {
        title: '2. Professor’s Lecture Worked Problems (Slides 97–100)',
        body: 'Contrast these two solved schedules from `Module-4.ppt` showing both a cycle failure and an isolated-node topological sort:',
        table: {
          headers: ['Schedule', 'Conflicts Found (By Item)', 'Precedence Edges', 'Verdict & Valid Serial Orders'],
          rows: [
            [
              'Problem 01: R1(A); W2(A); R2(B); W1(B); R3(A); W3(B)',
              'On A: R1(A)->W2(A) [T1->T2], W2(A)->R3(A) [T2->T3]. On B: R2(B)->W1(B) [T2->T1], W1(B)->W3(B) [T1->T3].',
              'T1->T2, T2->T1, T2->T3, T1->T3',
              'Cycle T1 -> T2 -> T1 -> NOT Conflict Serializable.',
            ],
            [
              'Problem 02 (S3): R1(A); R2(B); W1(A); R3(A); W2(B); W3(A)',
              'On A: R1(A)->W3(A), W1(A)->R3(A), W1(A)->W3(A) [all T1->T3]. On B: only T2 touches B [no conflicts!].',
              'T1 -> T3 (T2 isolated)',
              'Acyclic -> Conflict Serializable! Serial orders: T1->T2->T3, T1->T3->T2, T2->T1->T3.',
            ],
          ],
        },
      },
      {
        title: '3. View Serializability — 3 Rules & Blind Write Decision Flow',
        body: 'Two schedules `S` and `S’` are **View Equivalent** iff they satisfy all three conditions for **every** data item `Q`:',
        bullets: [
          '**Rule 1 (Initial Read):** If `Ti` reads the initial database value of `Q` in `S`, `Ti` must also read the initial value of `Q` in `S’`.',
          '**Rule 2 (Updated Read / Read-From):** If `Ti` executes `read(Q)` immediately after `Tj` wrote `Q` in `S`, then `Ti` must read `Q` written by the same `Tj` in `S’`.',
          '**Rule 3 (Final Write):** The transaction performing the last `write(Q)` in `S` must also perform the final `write(Q)` in `S’`.',
          '**Blind Write Shortcut:** First run the Precedence Graph test. If Conflict Serializable -> **automatically View Serializable**. If cyclic -> check for **Blind Writes** (a transaction executes `W(Q)` without having read `Q` first). No blind writes => **definitely NOT View Serializable**. Blind writes exist => test whether any serial permutation satisfies Rules 1–3.',
        ],
        markdownBlock:
`#### Classic View-Serializable (Non-Conflict) Example: \`S = R1(Q); W2(Q); W1(Q); W3(Q)\`
- **Conflict Test:** \`R1(Q) -> W2(Q)\` (\`T1 -> T2\`) and \`W2(Q) -> W1(Q)\` (\`T2 -> T1\`) form a **2-cycle** -> *Not Conflict Serializable*.
- **Blind Writes Present?** **Yes** — \`W2(Q)\` and \`W3(Q)\` write \`Q\` without reading \`Q\` first.
- **View Equivalence Check against Serial Order \`<T1, T2, T3>\`:**
  1. **Initial Read:** \`T1\` reads the initial database value of \`Q\` in both \`S\` and \`<T1, T2, T3>\`.
  2. **Read-From:** No transaction reads a value written by another write in either schedule.
  3. **Final Write:** \`T3\` performs the last \`W3(Q)\` in both \`S\` and \`<T1, T2, T3>\`.
> **Verdict:** \`S\` is **View Equivalent to \`<T1, T2, T3>\`** -> **View Serializable!**`,
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q7 [Full 10M, CO3, BL3]',
        questionPrompt:
          'Q7: Wallet X = 500, Y = 800. T1 transfers 100 from X to Y; T2 adds 50 bonus to X and audits Y.\nSchedule S: T1:Read(X); T1:Write(X); T2:Read(X); T2:Write(X); T1:Read(Y); T2:Read(Y); T1:Write(Y); T1:Commit; T2:Commit.\nA. List all pairs of conflicting operations present in schedule S. [3M]\nB. State whether S is conflict serializable. If yes, give serial order; if no, justify using the precedence graph. [4M]\nC. Classify S according to recoverability properties (Recoverable, Cascadeless, or Strict). [3M]',
        solvingMethod: [
          'Step 1 — Part A [3M] Enumerate ALL 4 Conflicting Operation Pairs by Data Item: Group by `X`: `(T1:R(X), T2:W(X))` [RW], `(T1:W(X), T2:R(X))` [WR], and `(T1:W(X), T2:W(X))` [WW] — each imposes `T1 -> T2`. Group by `Y`: `T1:R(Y)` vs `T2:R(Y)` is RR (NOT a conflict!); `(T2:R(Y), T1:W(Y))` [RW] imposes `T2 -> T1`. (Also note `T1:R(Y)->T1:W(Y)` is intra-transaction, so NOT a conflict.)',
          'Step 2 — Part B [4M] Draw Precedence Graph & Prove Cycle: Draw two vertices `T1` and `T2`. Add directed edge `T1 -> T2` (from the three conflicts on `X`) and directed edge `T2 -> T1` (from `T2:R(Y) -> T1:W(Y)` on `Y`). Since the graph contains the 2-cycle **`T1 -> T2 -> T1`**, Schedule `S` is **NOT Conflict Serializable** (no equivalent serial schedule exists).',
          'Step 3 — Part C [3M] Recoverability Check: `T2:Read(X)` reads uncommitted data written by `T1:Write(X)` before `T1:Commit`, so `S` has a Dirty Read and is **NOT Cascadeless** and **NOT Strict**. However, `T1:Commit` appears *before* `T2:Commit`, so `S` IS **Recoverable (with Cascading Rollback)**.',
        ],
        codeBlock: {
          title: 'Precedence Graph & Conflict Table — A1 Q7',
          diagramId: 'm4-precedence-a1q7',
          diagramCaption: 'FAT A1+TA1 Q7: Cycle T1 -> T2 -> T1 proving Schedule S is Not Conflict Serializable.',
          language: 'markdown',
          content:
`#### Indexed Sequence
\`1: R1(X)\`, \`2: W1(X)\`, \`3: R2(X)\`, \`4: W2(X)\`, \`5: R1(Y)\`, \`6: R2(Y)\`, \`7: W1(Y)\`, \`8: C1\`, \`9: C2\`

| Pair # | Conflicting Operations | Type | Edge Added |
| :--- | :--- | :--- | :--- |
| 1 | \`Op 1: R1(X)\` -> \`Op 4: W2(X)\` | \`RW\` | \`T1 -> T2\` |
| 2 | \`Op 2: W1(X)\` -> \`Op 3: R2(X)\` | \`WR\` *(Dirty Read)* | \`T1 -> T2\` |
| 3 | \`Op 2: W1(X)\` -> \`Op 4: W2(X)\` | \`WW\` | \`T1 -> T2\` |
| 4 | \`Op 6: R2(Y)\` -> \`Op 7: W1(Y)\` | \`RW\` | \`T2 -> T1\` |`,
        },
        commonPitfalls:
          'A frequent mistake on A1 Q7 is missing `(T1:R(X), T2:W(X))` or wrongly listing `(T1:R(Y), T2:R(Y))` as a conflict. Write out step numbers `[1..9]` so you verify every pair mechanically.',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q5(b) [5M of 10M, CO3, BL4]',
        questionPrompt:
          'Q5(b): Determine whether each schedule S1 and S2 is conflict serializable or not. Justify your answers with the appropriate precedence graphs. [5 Marks]\nS1: r1(X); r2(Z); r1(Z); r3(X); r3(Y); w1(X); c1; w3(Y); c3; r2(Y); w2(Z); w2(Y); c2\nS2: r1(X); w1(X); r2(X); w2(X); r2(Y); w2(Y); r3(Y); w3(Y); r3(Z); w3(Z); r1(Z); w1(Z)',
        solvingMethod: [
          'Step 1 — Analyze S1 Item-by-Item [2.5M]:\n• On `X` (`r1(X), r3(X), w1(X)`): `r3(X) -> w1(X)` gives **`T3 -> T1`** (`r1` vs `r3` is RR).\n• On `Y` (`r3(Y), w3(Y), r2(Y), w2(Y)`): `r3(Y) -> w2(Y)`, `w3(Y) -> r2(Y)`, `w3(Y) -> w2(Y)` give **`T3 -> T2`**.\n• On `Z` (`r2(Z), r1(Z), w2(Z)`): `r1(Z) -> w2(Z)` gives **`T1 -> T2`** (`r2` vs `r1` is RR, and `r2` vs `w2` is same txn!).\n• Precedence Graph for `S1`: `T3 -> T1`, `T3 -> T2`, `T1 -> T2` — **NO cycles!** Topological sort gives the unique equivalent serial schedule **`T3 -> T1 -> T2`**.',
          'Step 2 — Analyze S2 Item-by-Item [2.5M]:\n• On `X`: `r1(X), w1(X)` precede `r2(X), w2(X)` ⇒ **`T1 -> T2`**.\n• On `Y`: `r2(Y), w2(Y)` precede `r3(Y), w3(Y)` ⇒ **`T2 -> T3`**.\n• On `Z`: `r3(Z), w3(Z)` precede `r1(Z), w1(Z)` ⇒ **`T3 -> T1`**.\n• Precedence Graph for `S2`: **`T1 -> T2 -> T3 -> T1`** forms a 3-node cycle ⇒ **NOT Conflict Serializable**.',
        ],
        codeBlock: {
          title: 'Precedence Graphs for A2 Q5(b) S1 and S2',
          diagramId: 'm4-precedence-a2q5b',
          diagramCaption: 'FAT A2+TA2 Q5(b): Schedule S1 (Acyclic DAG -> T3, T1, T2) vs. Schedule S2 (3-cycle -> Not Serializable).',
        },
        commonPitfalls:
          'Watch out on `S1`: `r2(Z)` comes BEFORE `r1(Z)` and `w2(Z)` comes AFTER `r1(Z)`! Beginners accidentally draw `T2 -> T1` from `r2(Z)` to `r1(Z)` forgetting that two reads do NOT conflict; only `r1(Z) -> w2(Z)` (`T1 -> T2`) conflicts!',
      },
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q5(a) & Q5(b) [5M + 5M = 10M, CO4]',
        questionPrompt:
          'Q5:\na) Consider the following schedule S involving four transactions T1, T2, T3, and T4:\nS: R1(A), R2(B), W1(B), R3(A), W2(A), R4(B), W3(C), W4(B), R2(C), C1, C2, C3, C4.\nConstruct the precedence (serialization) graph for the schedule S and determine whether the schedule is conflict serializable. [5 Marks]\nb) A bank allows customers to perform online transactions such as balance inquiries, fund transfers, and bill payments simultaneously. Explain the concepts of transactions, ACID properties, and concurrency anomalies if multiple transactions access the same account simultaneously. [5 Marks]',
        solvingMethod: [
          'Part (a) Step 1 — Conflict Audit by Data Item (`A`, `B`, `C`) [2.5M]:\n  • **On Item `A` (`R1(A), R3(A), W2(A)`):** `R1(A) -> W2(A)` [RW] creates **`T1 → T2`**, and `R3(A) -> W2(A)` [RW] creates **`T3 → T2`** (`R1` vs `R3` is RR — no edge).\n  • **On Item `B` (`R2(B), W1(B), R4(B), W4(B)`):** `R2(B) -> W1(B)` [RW] creates **`T2 → T1`**, `R2(B) -> W4(B)` [RW] creates **`T2 → T4`**, and `W1(B) -> R4(B)` [WR] + `W1(B) -> W4(B)` [WW] create **`T1 → T4`**.\n  • **On Item `C` (`W3(C), R2(C)`):** `W3(C) -> R2(C)` [WR] creates **`T3 → T2`**.',
          'Part (a) Step 2 — Precedence Graph & Serializability Verdict [2.5M]: Draw vertices `{T1, T2, T3, T4}` with directed edge set **`E = { T1 → T2, T2 → T1, T1 → T4, T2 → T4, T3 → T2 }`**. Because the graph contains the 2-node cycle **`T1 → T2 → T1`**, schedule `S` is **NOT Conflict Serializable** and has no equivalent serial schedule.',
          'Part (b) Step 1 — Transaction & ACID Guarantees in Online Banking [2.5M]:\n  • **Transaction:** A logical unit of database work (`BEGIN_TRANSACTION ... COMMIT/ROLLBACK`) transforming a consistent database state into another.\n  • **Atomicity:** Debit and credit both complete or Recovery `UNDO` logs roll back partial writes so money never vanishes.\n  • **Consistency:** Preserves account balance invariants (`A + B` unchanged, non-negative constraints).\n  • **Isolation:** Strict 2PL / MVCC prevents customers from viewing uncommitted mid-transfer balances.\n  • **Durability:** WAL `REDO` logs flush to stable storage so committed transfers survive crashes.',
          'Part (b) Step 2 — Concurrency Anomalies Without Control [2.5M]: Explain the three classic anomalies when concurrent transactions access the same account without locking: **(1) Lost Update (`WW`)** (two simultaneous transfers overwrite each other’s deduction), **(2) Dirty Read / Uncommitted Dependency (`WR`)** (balance inquiry reads an uncommitted transfer that later rolls back), and **(3) Inconsistent Summary / Unrepeatable Read (`RW`)** (audit sums `A` before transfer and `B` after transfer).',
        ],
        codeBlock: {
          title: 'Precedence Graph Conflict Summary — Official Model QP Q5(a)',
          language: 'markdown',
          content:
`| Data Item | Operations in Order | Conflicting Pairs (\`RW, WR, WW\`) | Directed Edges Added |
| :--- | :--- | :--- | :--- |
| **Item A** | \`R1(A), R3(A), W2(A)\` | \`R1→W2\` (\`T1→T2\`); \`R3→W2\` (\`T3→T2\`) | **\`T1 → T2\`**, **\`T3 → T2\`** |
| **Item B** | \`R2(B), W1(B), R4(B), W4(B)\` | \`R2→W1\` (\`T2→T1\`); \`R2→W4\` (\`T2→T4\`); \`W1→R4, W1→W4\` (\`T1→T4\`) | **\`T2 → T1\` *(Cycle!)*, \`T1 → T4\`, \`T2 → T4\`** |
| **Item C** | \`W3(C), R2(C)\` | \`W3→R2\` (\`T3→T2\`) | **\`T3 → T2\`** |

> **Verdict:** **NOT Conflict Serializable** (Contains cycle \`T1 → T2 → T1\`; edges \`E = {T1→T2, T2→T1, T1→T4, T2→T4, T3→T2}\`).`,
        },
        commonPitfalls:
          'In Q5(a), do not add `T1 -> T3` from `R1(A)` and `R3(A)` (Read-Read never conflicts!), and remember `W3(C) -> R2(C)` reinforces `T3 -> T2` — always draw all 4 vertices `{T1, T2, T3, T4}` and all 5 directed edges.',
      },
    ],
    exampleTitle: 'Topological Order Check on S1 vs Problem 02',
    exampleBody:
`#### Schedule S1 (\`In-degrees: T3 = 0, T1 = 1, T2 = 2\`)
1. Pick **\`T3\`** *(in-degree 0)* and remove its outgoing edges -> now \`T1\` reaches in-degree \`0\`.
2. Pick **\`T1\`** and remove edge \`T1 -> T2\` -> now \`T2\` reaches in-degree \`0\`.
3. Pick **\`T2\`** -> **Unique Equivalent Serial Order:** \`<T3, T1, T2>\`.

#### Contrast: Problem 02 (\`T1 -> T3\`, \`T2\` Isolated)
- In-degrees: \`T1 = 0\`, \`T2 = 0\`, \`T3 = 1\` -> **3 valid topological orders:** \`<T1, T2, T3>\`, \`<T1, T3, T2>\`, \`<T2, T1, T3>\`.`,
    examTip:
      'For any non-serializable cyclic schedule in a 10M question, mention whether a blind write exists if asked to comment on View Serializability — e.g., A1 Q7 and A2 Q5(b) S2 have NO blind writes (every write was preceded by a read), so neither is View Serializable either!',
    selfChecks: [
      {
        question:
          'In schedule S: R1(Z); R2(Z); W2(Z); W1(Z), which directed edge(s) appear in the Precedence Graph?',
        options: [
          'Only T1 -> T2',
          'Only T2 -> T1',
          'Both T1 -> T2 and T2 -> T1 (forming a cycle)',
          'No edges exist because both transactions read before writing',
        ],
        correctIndex: 2,
        explanation:
          'R1(Z) before W2(Z) creates edge T1 -> T2, while R2(Z) before W1(Z) (and W2(Z) before W1(Z)) creates edge T2 -> T1. The 2-cycle makes S non-conflict-serializable (classic Lost Update).',
      },
      {
        question:
          'When can a schedule that FAILS the Precedence Graph test (contains a cycle) still be View Serializable?',
        options: [
          'Whenever it is Recoverable',
          'Only when at least one transaction performs a blind write (writes an item without reading it first)',
          'Whenever every transaction reads the initial value of X',
          'Never — Conflict Serializability and View Serializability are identical sets',
        ],
        correctIndex: 1,
        explanation:
          'Every conflict-serializable schedule is view serializable, and every view-serializable schedule that is NOT conflict serializable must contain at least one blind write.',
      },
    ],
  },

  'm4-t4': {
    summary:
      'Lock-based protocols enforce mutual exclusion using Shared (S) and Exclusive (X) locks. Two-Phase Locking (2PL) guarantees conflict serializability via Growing and Shrinking phases—with Strict 2PL adding cascadelessness—while Wait-For Graphs, Timeouts, Wait-Die, and Wound-Wait prevent or resolve deadlocks and starvation.',
    sourceDecks: [
      'Module 4 Database Concurrency Control Techniques.pptx (Slides 1–23)',
      'Module-4.ppt (Slides 89–94, 134–167)',
    ],
    keyPoints: [
      {
        heading: 'Lock Compatibility & Lock Point Theorem',
        text: '`lock-S(X)` permits concurrent readers; `lock-X(X)` grants sole read+write access. Compatibility: `S + S = True`, while `S + X`, `X + S`, and `X + X = False`. Any schedule obeying **Two-Phase Locking (2PL)** is guaranteed conflict serializable in the order of each transaction’s **Lock Point** (the moment it acquires its final lock).',
      },
      {
        heading: 'Four Variants of 2PL',
        text: '1) **Basic 2PL:** Growing phase (acquire/upgrade `S->X`) then Shrinking phase (release/downgrade `X->S`) — serializable, but allows deadlocks & cascading rollbacks. 2) **Conservative (Static) 2PL:** Locks ALL pre-declared items before execution starts — **deadlock-free**, but still allows cascading rollback. 3) **Strict 2PL:** Holds all `X`-locks until Commit/Abort — **cascadeless + recoverable**. 4) **Rigorous 2PL:** Holds ALL `S` and `X` locks until Commit.',
      },
      {
        heading: 'Deadlock Detection (Wait-For Graph) vs. Timestamp Prevention',
        text: 'A deadlock cycle exists iff the **Wait-For Graph (`Ti -> Tj` means `Ti` waits for a lock held by `Tj`)** has a cycle; resolved by aborting a minimal-cost victim. Timestamp prevention avoids cycles without pre-declaration: **Wait-Die** (non-preemptive: older waits, younger dies) vs. **Wound-Wait** (preemptive: older wounds/aborts younger, younger waits).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Why Naive Locking Fails & Basic 2PL Rules',
        body: 'Simply wrapping every `read`/`write` in `lock`/`unlock` does **not** ensure serializability if a transaction unlocks early and later acquires another lock (Slide 6–13 `X=20, Y=30 -> X=50, Y=50` bug):',
        diagramId: 'm4-2pl-phases',
        diagramCaption: 'Two-Phase Locking (2PL): Locks Held across Growing Phase, Lock Point (LP), and Shrinking Phase.',
        bullets: [
          '**Why Non-2PL Breaks (`Example 1–4`, Slide 166):** If `T1` does `unlock(A)` and later requests `lock-X(B)`, `T1` locked after unlocking — violating 2PL and enabling cycles in the precedence graph (`T1 -> T2 -> T1`).',
          '**Cascading Rollback in Basic 2PL:** Because Basic 2PL allows `unlock-X(A)` *before* `Commit(T1)`, `T2` may lock-S(A) and read `T1`’s uncommitted update; if `T1` later aborts, `T2` must cascade-abort. **Strict 2PL** solves this by holding every `X`-lock until Commit/Abort.',
        ],
      },
      {
        title: '2. Comparison of All 4 Two-Phase Locking Variants',
        body: 'Memorize this exact matrix for conceptual comparison questions:',
        table: {
          headers: ['2PL Variant', 'Rule on Locks', 'Serializability', 'Cascadeless / Strict?', 'Deadlock-Free?', 'Practicality / Concurrency'],
          rows: [
            ['Basic 2PL', 'All locks before first unlock', 'Yes (LP order)', 'No (cascading rollback possible)', 'No', 'Highest concurrency of basic variants'],
            ['Conservative (Static) 2PL', 'Acquire ALL items in read/write set before starting; wait if any busy', 'Yes', 'No (may unlock X early)', 'YES (never waits while holding locks)', 'Low concurrency; hard to predeclare dynamic queries'],
            ['Strict 2PL', 'Hold ALL Exclusive (X) locks until Commit/Abort', 'Yes (Commit order)', 'YES (Strict & Cascadeless)', 'No (needs WFG / Wait-Die)', 'Industry standard for RDBMS'],
            ['Rigorous 2PL', 'Hold ALL S and X locks until Commit/Abort', 'Yes (Commit order)', 'YES (Strict & Cascadeless)', 'No', 'Easiest to enforce; slightly lower read concurrency than Strict 2PL'],
          ],
        },
      },
      {
        title: '3. Deadlock Handling: Detection, Victim Selection & Starvation',
        body: 'Except for Conservative 2PL, every 2PL variant can deadlock when two or more transactions hold conflicting locks and wait cyclically:',
        bullets: [
          '**Wait-For Graph (WFG) Construction:** Vertices `V` = active transactions; add directed edge `Ti -> Tj` when `Ti` is blocked waiting for `Tj` to release an incompatible lock on some item `Q`. Remove the edge when `Tj` releases/commits. **Deadlock exists iff WFG contains a cycle.** Note: Two transactions requesting `S`-locks on the same item NEVER block each other (`S+S` is compatible -> no edge!).',
          '**Three Victim Selection Criteria (Deadlock Recovery):** (1) *Least work completed* so far (fewest updates/ops to re-run), (2) *Fewest locks currently held* (or fewest transactions to cascade-rollback), and (3) *Fewest previous restarts* (to prevent cyclic victimization).',
          '**Preventing Starvation:** A transaction may starve if conflicting requests keep jumping ahead in the lock queue or if it is repeatedly aborted as a victim. Remedies: grant locks strictly in **FIFO request order** (Slide 151) and **preserve the original timestamp** `TS(T)` when restarting an aborted transaction.',
        ],
      },
      {
        title: '4. Deadlock Prevention: Wait-Die vs. Wound-Wait',
        body: 'Assign each transaction a unique starting timestamp `TS(T)`. Suppose `Ti` requests a lock currently held by `Tj`:',
        table: {
          headers: ['Scenario', 'Wait-Die (Non-Preemptive)', 'Wound-Wait (Preemptive)'],
          rows: [
            [
              'Ti is OLDER than Tj  (TS(Ti) < TS(Tj))',
              'Ti WAITS for Tj to finish.',
              'Ti WOUNDS (aborts/rolls back) younger Tj and takes the lock!',
            ],
            [
              'Ti is YOUNGER than Tj  (TS(Ti) > TS(Tj))',
              'Ti DIES (self-aborts) and restarts later with SAME original TS(Ti).',
              'Ti WAITS for older Tj to finish.',
            ],
            [
              'Why Deadlock-Free?',
              'Wait edges only point Older -> Younger (monotonic decreasing TS => acyclic).',
              'Wait edges only point Younger -> Older (monotonic increasing TS => acyclic).',
            ],
            [
              'Rollback Overhead',
              'Higher aborts (Wait-Die kills younger txn repeatedly while older holds lock).',
              'Lower aborts (younger waits peacefully; older preempts once).',
            ],
          ],
        },
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q7 [10M, CO3]',
        questionPrompt:
          'Q7: Given the two concurrent transactions T1 and T2 below:\nT1: read_item(X); read_item(Y); X := X + Y; write_item(X);\nT2: read_item(X); read_item(Y); Y := X + Y; write_item(Y);\nApply the Two-Phase Locking (2PL) protocol by inserting appropriate lock and unlock operations. Analyze and justify whether the resulting execution eliminates Lost Update, Uncommitted Update, and Inconsistent Summary problems. [10M]',
        solvingMethod: [
          'Step 1 — Instrument `T1` and `T2` with Two-Phase Locking (`Basic 2PL` & `Strict 2PL`) [4M]:\n  • In `T1`, `X` is both read and written (`write_lock(X)` up front, or `read_lock(X)` upgraded to `write_lock(X)`) and `Y` is read (`read_lock(Y)`). Crucially, **ALL lock acquisitions (`write_lock(X), read_lock(Y)`) MUST complete in the Growing Phase BEFORE the first `unlock(...)` begins the Shrinking Phase!**\n  • In `T2`, `X` is read (`read_lock(X)`) and `Y` is both read and written (`write_lock(Y)`). Acquire both locks in canonical order (`X` then `Y`) before releasing any lock, and under **Strict 2PL**, hold exclusive `write_lock`s until after `COMMIT`!',
          'Step 2 — Analyze How 2PL Eliminates (i) Lost Update [2M]: A Lost Update occurs when two transactions read the old value of an item and both overwrite it. Under 2PL, modifying `X` requires `write_lock(X)` (Exclusive lock). No other transaction can acquire `read_lock(X)` or `write_lock(X)` until `T1` unlocks `X`, forcing concurrent writers into strict serial order.',
          'Step 3 — Analyze How 2PL Eliminates (ii) Uncommitted Update (Dirty Read) [2M]: An Uncommitted Update (Dirty Read) occurs when `T2` reads `X` modified by `T1` before `T1` commits, and `T1` subsequently aborts. By holding `write_lock(X)` until **after `T1` commits or aborts (Strict 2PL)**, `T2`’s `read_lock(X)` request blocks cleanly until `T1`’s update is permanently committed or rolled back.',
          'Step 4 — Analyze How 2PL Eliminates (iii) Inconsistent Summary ( & Deadlock Note from Slides 11–13!) [2M]: An Inconsistent Summary occurs when one transaction reads `X` before an update and `Y` after an update. Because 2PL forbids `T1` from releasing `write_lock(X)` until it has also acquired `read_lock(Y)` (its **Lock Point**), `T2` cannot modify `Y` in between `T1`’s reads of `X` and `Y`! *(Slide 13 Note: Acquiring locks in the same canonical order `(X then Y)` in both `T1` and `T2` also prevents cyclic deadlock!)*',
        ],
        codeBlock: {
          title: '2PL-Compliant Step Schedule for T1 & T2 (Canonical Order X -> Y) — Model QP Q7',
          language: 'markdown',
          content:
`#### Step-by-Step Two-Phase Locking (\`Strict 2PL\`) Instrumentation
| Step | Phase | Transaction \`T1\` (\`X := X + Y\`) | Transaction \`T2\` (\`Y := X + Y\`) |
| :---: | :--- | :--- | :--- |
| **1** | **Growing** | \`write_lock(X);\` | \`read_lock(X);\` |
| **2** | **Growing** | \`read_item(X);\` | \`read_item(X);\` |
| **3** | **Growing (LP)** | \`read_lock(Y);\` ← **Lock Point** | \`write_lock(Y);\` ← **Lock Point** |
| **4** | **Compute** | \`read_item(Y);\` | \`read_item(Y);\` |
| **5** | **Compute** | \`X := X + Y;\` | \`Y := X + Y;\` |
| **6** | **Write** | \`write_item(X);\` | \`write_item(Y);\` |
| **7** | **Commit** | \`COMMIT;\` | \`COMMIT;\` |
| **8** | **Shrinking** | \`unlock(X); unlock(Y);\` | \`unlock(X); unlock(Y);\` |

> **Why Ordering \`X\` before \`Y\` in Both \`T1\` and \`T2\` Matters:** Requesting locks in a uniform canonical order (\`X\` then \`Y\`) prevents the circular wait \`T1 → T2 → T1\` shown in \`Module 4 Concurrency.pptx\` Slide 13.`,
        },
        commonPitfalls:
          'Never write `write_lock(X); read_item(X); unlock(X); read_lock(Y); ...`! Releasing `unlock(X)` BEFORE acquiring `read_lock(Y)` violates the Two-Phase Locking rule and re-introduces Inconsistent Summary.',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q8(a) [Full 10M, CO3, BL3]',
        questionPrompt:
          'Q8(a): Product_A = 100, Product_B = 50 (Total = 150). T1 (Audit) sums A+B; T2 (Transfer) moves 20 units from A to B. Uncontrolled schedule outputs Sum = 170.\nA. Identify the concurrency problem and where inconsistency occurs. [3M]\nB. Rewrite the complete step-by-step execution trace showing how 2PL resolves this schedule, explicitly listing all lock ops and WAITs. [5M]\nC. State the new final Sum computed by T1 under 2PL and justify consistency. [2M]',
        solvingMethod: [
          'Step 1 — Part A [3M]: Name the **Incorrect Summary Problem**. Explain `T1` read pre-transfer `Product_A = 100` (`t2–t3`), `T2` committed transfer `A=80, B=70` (`t4–t10`), and `T1` read post-transfer `Product_B = 70` (`t11`), double-counting 20 units (`Sum = 170`).',
          'Step 2 — Part B [5M] Write the Full Strict/Basic 2PL Trace with Explicit WAIT: Show `T1` acquiring `lock-S(Product_A)` at `t1` and reading `A = 100`. When `T2` arrives at `t4` and requests `lock-X(Product_A)`, **`T2` is forced to WAIT** because `T1` still holds `S(Product_A)` (2PL forbids `T1` from unlocking `A` until it acquires `lock-S(Product_B)` at its Lock Point; Strict 2PL holds both until Commit). `T1` proceeds to `lock-S(Product_B)`, reads `B = 50`, computes `Sum = 150`, commits and unlocks `A, B`. Only then does `T2` resume `lock-X(A)` and `lock-X(B)`, execute the transfer, and commit.',
          'Step 3 — Part C [2M]: State **`Sum = 150`**. Explain that 2PL enforced an atomic snapshot equivalent to serial order `T1 -> T2` (`100 + 50 = 150`), and final disk balances (`A=80, B=70`) still sum to `150` — proving total inventory conservation.',
        ],
        codeBlock: {
          title: '2PL Execution Trace Table for A1 Q8(a) Part B',
          language: 'markdown',
          content:
`| Time | T1 (Audit Report) | T2 (Stock Transfer) |
| :--- | :--- | :--- |
| **t1** | \`lock-S(Product_A)\` **[Granted]** | — |
| **t2** | \`Sum = 0; Read(Product_A)\` *[= 100]* | — |
| **t3** | \`Sum = 0 + 100 = 100\` | — |
| **t4** | — | \`lock-X(Product_A)\` -> **WAIT!** *(T1 holds S)* |
| **t5** | \`lock-S(Product_B)\` **[Granted; Lock Point]** | *(waiting for Product_A)* |
| **t6** | \`Read(Product_B)\` *[= 50]* | *(waiting for Product_A)* |
| **t7** | \`Sum = 100 + 50 = 150; Output(150)\` | *(waiting for Product_A)* |
| **t8** | \`Commit; unlock(A); unlock(B)\` | *(waiting -> unblocked!)* |
| **t9** | — | \`lock-X(Product_A)\` **[Granted]** |
| **t10** | — | \`Read(A)=100; A=80; Write(A=80)\` |
| **t11** | — | \`lock-X(Product_B)\` **[Granted; Lock Point]** |
| **t12** | — | \`Read(B)=50; B=70; Write(B=70)\` |
| **t13** | — | \`Commit; unlock(A); unlock(B)\` |`,
        },
        commonPitfalls:
          'Never let `T1` call `unlock(Product_A)` BEFORE calling `lock-S(Product_B)` — that violates Two-Phase Locking and re-introduces `Sum = 170`! Always mark the **WAIT** state and **Lock Point (LP)** explicitly.',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q6 [Full 10M, CO3, BL4]',
        questionPrompt:
          'Q6: Strict 2PL action table: 1: T1 S(A), 2: T1 R(A), 3: T2 X(B), 4: T2 W(B), 5: T3 S(C), 6: T3 R(C), 7: T1 X(C), 8: T2 X(A), 9: T3 X(B).\nDraw the Wait-For Graph and determine whether a deadlock exists. Justify your answer. If a deadlock exists, explain how it can be resolved using an appropriate deadlock-handling technique. [10 Marks]',
        solvingMethod: [
          'Step 1 — Build the Grant / Block Trace Table [4M]: Under Strict 2PL, no lock is released until Commit. Steps 1–6 are all **Granted** (`T1` holds `S(A)`, `T2` holds `X(B)`, `T3` holds `S(C)`). Then Step 7 `T1:X(C)` **Blocks** on `T3` (`S(C)` vs `X(C)`), Step 8 `T2:X(A)` **Blocks** on `T1` (`S(A)` vs `X(A)`), and Step 9 `T3:X(B)` **Blocks** on `T2` (`X(B)` vs `X(B)`).',
          'Step 2 — Draw Wait-For Graph & Prove Cycle [3M]: Nodes = `{T1, T2, T3}`. Edges from Steps 7–9: **`T1 -> T3`**, **`T2 -> T1`**, **`T3 -> T2`**. Reordering reveals the directed cycle **`T1 -> T3 -> T2 -> T1`**. Since the WFG is cyclic, **Deadlock EXISTS**.',
          'Step 3 — Explain Resolution & Prevention [3M]: (1) *Detection & Recovery (Victim Rollback):* Pick a victim with minimum rollback cost (`T3` or `T1` performed zero writes, whereas `T2` already executed `W(B)`). Abort **`T3`** and release `S(C)` (removing `T3->T2` and `T1->T3`). Now `T1` acquires `X(C)` and commits, releasing `A` and `C`; `T2` acquires `X(A)` and commits; finally `T3` restarts cleanly. (2) Also briefly note timestamp-based prevention (**Wait-Die** or **Wound-Wait**) could prevent the cycle upfront if `TS(T1) < TS(T2) < TS(T3)` (e.g., under Wait-Die, younger `T2` at step 8 and younger `T3` at step 9 would immediately abort instead of waiting).',
        ],
        codeBlock: {
          title: 'Step Trace Table & Wait-For Graph Cycle for A2 Q6',
          diagramId: 'm4-wfg-a2q6',
          diagramCaption: 'FAT A2+TA2 Q6: Wait-For Graph Cycle T1 -> T3 -> T2 -> T1 requiring victim rollback.',
          language: 'markdown',
          content:
`| Step | Op | Status | Holder of Conflict | WFG Edge Added |
| :--- | :--- | :--- | :--- | :--- |
| 1 | \`T1: S(A)\` | **Granted** | None | — |
| 2 | \`T1: R(A)\` | **Exec** | *(T1 holds S(A))* | — |
| 3 | \`T2: X(B)\` | **Granted** | None | — |
| 4 | \`T2: W(B)\` | **Exec** | *(T2 holds X(B))* | — |
| 5 | \`T3: S(C)\` | **Granted** | None | — |
| 6 | \`T3: R(C)\` | **Exec** | *(T3 holds S(C))* | — |
| 7 | \`T1: X(C)\` | **BLOCKED** | \`T3\` holds \`S(C)\` | **\`T1 -> T3\`** |
| 8 | \`T2: X(A)\` | **BLOCKED** | \`T1\` holds \`S(A)\` | **\`T2 -> T1\`** |
| 9 | \`T3: X(B)\` | **BLOCKED** | \`T2\` holds \`X(B)\` | **\`T3 -> T2\`** |`,
        },
        commonPitfalls:
          'Keep edge direction exact in a Wait-For Graph: if `T1` requests a lock held by `T3`, the edge goes **`T1 -> T3`** (“T1 waits for T3”), NEVER the reverse. Also don’t forget why Strict 2PL keeps `S(A)` and `S(C)` held past reads (in Rigorous/Strict 2PL, `T1` & `T3` haven’t reached commit yet).',
      },
    ],
    exampleTitle: 'Deadlock & Wait-Die vs. Wound-Wait Quick Check (Concurrency PPT Slides 13, 19)',
    exampleBody:
`Suppose **\`TS(T1) = 10\`** *(Older)* and **\`TS(T2) = 20\`** *(Younger)*.

| Contention Scenario | Wait-Die *(Non-Preemptive)* | Wound-Wait *(Preemptive)* |
| :--- | :--- | :--- |
| **Case 1:** Older \`T1\` requests \`X\` held by Younger \`T2\` | Older \`T1\` **WAITS** | Older \`T1\` **WOUNDS (aborts)** \`T2\` and takes \`X\` immediately |
| **Case 2:** Younger \`T2\` requests \`X\` held by Older \`T1\` | Younger \`T2\` **DIES** *(aborts & restarts later with \`TS=20\`)* | Younger \`T2\` **WAITS** |`,
    examTip:
      'Use the 4-word mnemonic **"Old Waits, Young Dies"** for Wait-Die, and **"Old Wounds, Young Waits"** for Wound-Wait. Always note that restarted transactions keep their **original timestamp** to avoid starvation.',
    selfChecks: [
      {
        question:
          'Which Two-Phase Locking variant guarantees BOTH conflict serializability AND freedom from cascading rollbacks, while allowing shared read locks to be released before commit?',
        options: [
          'Basic 2PL',
          'Conservative (Static) 2PL',
          'Strict 2PL',
          'Simple non-2PL locking',
        ],
        correctIndex: 2,
        explanation:
          'Strict 2PL requires holding all Exclusive (X) locks until Commit/Abort (guaranteeing cascadeless/strict execution), whereas Rigorous 2PL holds both S and X locks until commit.',
      },
      {
        question:
          'Suppose TS(T1) = 5 and TS(T2) = 15 (T1 is older). Under Wound-Wait, what happens when T1 requests a lock currently held by T2, and when T2 requests a lock held by T1?',
        options: [
          'T1 waits for T2; T2 aborts (dies)',
          'T1 wounds (aborts) T2; T2 waits for T1',
          'Both T1 and T2 wait, risking deadlock',
          'Both T1 and T2 abort immediately',
        ],
        correctIndex: 1,
        explanation:
          'Wound-Wait is preemptive in favor of older transactions ("Old Wounds, Young Waits"): older T1 aborts younger T2 when needing T2’s lock, while younger T2 waits peacefully for older T1.',
      },
    ],
  },

  'm4-t5': {
    summary:
      'Timestamp Ordering (TO) enforces a serial order equal to transaction arrival timestamps with zero deadlocks—and Thomas’s Write Rule rescues obsolete writes to boost concurrency—while Multiple Granularity Locking introduces Intention locks (IS, IX, SIX) so coarse table locks and fine row locks coexist safely.',
    sourceDecks: [
      'Module-4.ppt (Slides 169–186)',
      'Elmasri & Navathe 7th Ed., Ch. 21 (Sec. 21.2 & 21.4)',
    ],
    keyPoints: [
      {
        heading: 'Basic Timestamp Ordering (RTS & WTS Inequalities)',
        text: 'Each transaction gets a unique starting `TS(T)`, and each item `Q` stores `RTS(Q)` (largest TS of a successful reader) and `WTS(Q)` (largest TS of a successful writer). **`Ti` calls `read(Q)`:** if `WTS(Q) > TS(Ti)`, rollback `Ti`; else execute and set `RTS(Q) = max(RTS(Q), TS(Ti))`. **`Ti` calls `write(Q)`:** if `RTS(Q) > TS(Ti)` OR `WTS(Q) > TS(Ti)`, rollback `Ti`; else execute and set `WTS(Q) = TS(Ti)`.',
      },
      {
        heading: 'Thomas’s Write Rule (Obsolete Write Optimization)',
        text: 'When `Ti` issues `write(Q)` and `RTS(Q) <= TS(Ti)` is satisfied, **if `WTS(Q) > TS(Ti)`**, a younger transaction already overwrote `Q` with a newer value! Instead of rolling back `Ti`, **ignore `write(Q)`** and let `Ti` continue—admitting extra **view-serializable** (non-conflict-serializable) schedules.',
      },
      {
        heading: 'Multiple Granularity Locking & Intention Locks (IS, IX, SIX)',
        text: 'Locks a tree hierarchy (`Database -> Area/File -> Table -> Page -> Record`) **top-down** and unlocks **bottom-up** using three Intention modes alongside `S` and `X`: **`IS`** (descendants will hold `S`), **`IX`** (descendants will hold `X` or `S`), and **`SIX`** (holds `S` on the whole subtree while planning `X` updates on select descendants).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Basic Timestamp Ordering Protocol (BTO) — Complete Rules & Properties',
        body: 'Unlike 2PL (which serializes transactions by dynamic **Lock Point** order), Timestamp Ordering fixes the serial order **up front** at transaction start (`TS(T)` via system clock or monotonically increasing counter). Every conflicting pair must execute in ascending timestamp order:',
        table: {
          headers: ['Operation by Ti', 'Check Condition (Failure -> Rollback Ti)', 'Success Action & Metadata Update', 'Intuitive Reason Why Abort Needed'],
          rows: [
            [
              'Ti executes Read(Q)',
              'If WTS(Q) > TS(Ti)  ->  Abort & restart Ti with new TS',
              'Read Q; set RTS(Q) = max(RTS(Q), TS(Ti))',
              'A younger transaction already overwrote Q after Ti logically finished.',
            ],
            [
              'Ti executes Write(Q)',
              'If RTS(Q) > TS(Ti)  ->  Abort & restart Ti with new TS',
              '(Must also pass WTS check below)',
              'A younger transaction already read the old value of Q expecting Ti’s write not to exist.',
            ],
            [
              'Ti executes Write(Q) [cont.]',
              'If WTS(Q) > TS(Ti)  ->  Abort (Basic TO)  [OR Ignore via Thomas Rule!]',
              'Write Q; set WTS(Q) = TS(Ti)',
              'A younger transaction already wrote a newer value of Q.',
            ],
          ],
        },
        bullets: [
          '**Deadlock-Free Guarantee:** Because transactions NEVER wait for locks under BTO (any conflict violations abort immediately instead of blocking), **deadlocks are impossible**.',
          '**Drawbacks (Slides 181–183):** (1) *Starvation* can hit long transactions if younger transactions repeatedly bump `RTS(Q)`/`WTS(Q)` and force rollbacks. (2) Schedules are **NOT automatically Cascadeless or Recoverable** (because `Tj` can read an uncommitted write from `Ti` if `TS(Ti) < TS(Tj)`). Fix via **Strict TO** (buffer writes until commit, or wait on commit dependencies).',
        ],
      },
      {
        title: '2. Thomas’s Write Rule vs. Basic TO (Step-by-Step Comparison)',
        body: 'Notice how **Thomas’s Write Rule** modifies only ONE branch of the `Write(Q)` check (when `RTS(Q) <= TS(Ti)` holds, meaning no younger transaction read `Q`, yet `WTS(Q) > TS(Ti)`):',
        markdownBlock:
`#### Scenario: \`TS(T1) = 10\`, \`TS(T2) = 20\` *(Initially \`RTS(Q) = 0, WTS(Q) = 0\`)*
1. **\`T1(10): R(Q)\`:** \`WTS(Q) = 0 <= 10\` holds -> succeeds, \`RTS(Q) = 10, WTS(Q) = 0\`.
2. **\`T2(20): W(Q)\`:** \`RTS = 10 <= 20\` and \`WTS = 0 <= 20\` -> succeeds, \`RTS(Q) = 10, WTS(Q) = 20\`.
3. **\`T1(10): W(Q)\` *(Obsolete Write)*:**
   - \`RTS(Q) <= TS(T1)\`: \`10 <= 10\` *(TRUE — \`T2\` never read the old value of \`Q\`!)*
   - \`WTS(Q) > TS(T1)\`: \`20 > 10\` *(TRUE — \`T2\` already wrote a newer value of \`Q\`!)*
> - **Basic TO:** Rolls back \`T1(10)\`.
> - **Thomas’s Write Rule:** \`W1(Q)\` is obsolete, so **IGNORE \`W1(Q)\`** and let \`T1\` continue!`,
      },
      {
        title: '3. Multiple Granularity Locking Hierarchy & 5×5 Compatibility Matrix',
        body: 'Locking individual tuples (`Record`) avoids blocking other users on a table, whereas locking a whole `Table` (`S`/`X`) avoids acquiring 1,000,000 row locks during a full table scan. **Multiple Granularity Locking (MGL)** bridges both using a hierarchy tree and **Intention Locks**:',
        diagramId: 'm4-mgl-hierarchy',
        diagramCaption: 'Multiple Granularity Locking hierarchy: acquire Intention locks top-down, unlock bottom-up.',
        table: {
          headers: ['Requested \\ Held', 'IS (Intent Shared)', 'IX (Intent Exclusive)', 'S (Shared)', 'SIX (S + IX)', 'X (Exclusive)'],
          rows: [
            ['IS', 'Yes', 'Yes', 'Yes', 'Yes', 'No'],
            ['IX', 'Yes', 'Yes', 'No', 'No', 'No'],
            ['S', 'Yes', 'No', 'Yes', 'No', 'No'],
            ['SIX', 'Yes', 'No', 'No', 'No', 'No'],
            ['X', 'No', 'No', 'No', 'No', 'No'],
          ],
        },
        bullets: [
          '**Intention Lock Modes:** `IS` signals intent to place `S` locks lower down; `IX` signals intent to place `X` (or `S`) locks lower down; `SIX` (`S + IX`) lets a transaction read an entire table (`S`) while updating only a few matching rows (`IX -> X`), blocking other writers on the table while still permitting `IS` readers!',
          '**Strict Protocol Order:** Before placing `S` or `IS` on node `N`, the transaction must hold at least `IS` or `IX` on `N`’s parent. Before placing `X`, `IX`, or `SIX` on `N`, it must hold `IX` or `SIX` on `N`’s parent. Unlock **bottom-up** only after releasing all children.',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q9(a) & Q9(b) [6M + 4M = 10M, CO4]',
        questionPrompt:
          'Q9:\na) Suppose there are three transactions T1, T2, and T3 with timestamps TS(T1) = 10, TS(T2) = 20, and TS(T3) = 30, and three data items X = 100, Y = 200, and Z = 300 (initial read_TS = 0, write_TS = 0):\n1. T1: Read(X)\n2. T2: Write(X)\n3. T1: Write(X)\n4. T3: Read(Y)\n5. T2: Write(Y)\n6. T3: Write(Z)\n7. T1: Read(Z)\n8. T2: Read(Z)\n9. T3: Write(X)\nApply the Basic Timestamp Ordering protocol and trace the execution step-by-step, clearly mentioning read_TS, write_TS updates, and whether any transaction is aborted and rolled back. [6 Marks]\nb) Differentiate between Deferred Update and Immediate Update recovery techniques in database systems. [4 Marks]',
        solvingMethod: [
          'Part (a) Step-by-Step Timestamp Ordering Trace [6M]:\n  • **Op 1 (`T1: Read(X)`, `TS=10`):** `TS(T1)=10 ≥ WTS(X)=0` -> **ALLOWED**. `RTS(X) = max(0, 10) = 10`. (`X: [10, 0]`).\n  • **Op 2 (`T2: Write(X)`, `TS=20`):** `TS(T2)=20 ≥ RTS(X)=10` and `20 ≥ WTS(X)=0` -> **ALLOWED**. `WTS(X) = 20`, `X` holds uncommitted `X_T2` (`X: [10, 20]`).\n  • **Op 3 (`T1: Write(X)`, `TS=10`):** `TS(T1)=10 < WTS(X)=20` -> **REJECTED! `T1` is ABORTED and ROLLED BACK** (must restart with a fresh timestamp).\n  • **Op 4 (`T3: Read(Y)`, `TS=30`):** `TS(T3)=30 ≥ WTS(Y)=0` -> **ALLOWED**. `RTS(Y) = max(0, 30) = 30` (`Y: [30, 0]`).\n  • **Op 5 (`T2: Write(Y)`, `TS=20`):** `TS(T2)=20 < RTS(Y)=30` *(younger `T3` already read `Y`!)* -> **REJECTED! `T2` is ABORTED and ROLLED BACK** — undoing `T2`’s uncommitted `Write(X)` from Op 2 and restoring `WTS(X) = 0`, `X = 100`.\n  • **Op 6 (`T3: Write(Z)`, `TS=30`):** `TS(T3)=30 ≥ RTS(Z)=0` and `30 ≥ WTS(Z)=0` -> **ALLOWED**. `WTS(Z) = 30` (`Z: [0, 30]`).\n  • **Op 7 (`T1: Read(Z)`) & Op 8 (`T2: Read(Z)`):** **SKIPPED** because `T1` aborted at Op 3 and `T2` aborted at Op 5 *(and even if tested directly, `10 < WTS(Z)=30` and `20 < WTS(Z)=30` would also reject both)*.\n  • **Op 9 (`T3: Write(X)`, `TS=30`):** Since `T2` rolled back at Op 5, `RTS(X)=10` and `WTS(X)=0`. Both `30 ≥ 10` and `30 ≥ 0` hold -> **ALLOWED**. `WTS(X) = 30`, and **`T3` COMMITS** (`X: [10, 30]`).',
          'Part (b) Differentiate Deferred Update vs. Immediate Update Recovery [4M]:\n  1) **Timing of Disk Writes:** Deferred Update (`No-Steal`) buffers all writes and updates physical disk ONLY **after Commit**; Immediate Update (`Steal`) allows writing uncommitted updates to physical disk **before Commit** (after flushing WAL).\n  2) **Recovery Operations (`NO-UNDO/REDO` vs `UNDO/REDO`):** Deferred Update requires **NO UNDO** (uncommitted changes never touched disk) and only **REDOs** committed transactions forward using `AFIM`; Immediate Update requires **backward UNDO** of uncommitted transactions using `BFIM` plus **forward REDO** of committed transactions using `AFIM`.\n  3) **Log Record Content:** Deferred Update logs only need `<T, X, new_value (AFIM)>`; Immediate Update logs must store both `<T, X, old_value (BFIM), new_value (AFIM)>`.\n  4) **Buffer Space & Runtime Overhead:** Deferred Update can exhaust RAM buffer space on large transactions; Immediate Update offers superior buffer flexibility at the cost of a two-pass (`UNDO + REDO`) crash recovery.',
        ],
        codeBlock: {
          title: 'Complete Timestamp Ordering State Table — Official Model QP Q9(a)',
          language: 'markdown',
          content:
`| Step | Operation | Timestamp Check (\`TS(Ti)\` vs \`RTS / WTS\`) | Verdict | \`X (RTS, WTS, Val)\` | \`Y (RTS, WTS, Val)\` | \`Z (RTS, WTS, Val)\` |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **Init** | — | \`T1=10, T2=20, T3=30\` | — | \`(0, 0, 100)\` | \`(0, 0, 200)\` | \`(0, 0, 300)\` |
| **1** | \`T1: Read(X)\` | \`10 ≥ WTS(X)=0\` | **ALLOWED** | \`(10, 0, 100)\` | \`(0, 0, 200)\` | \`(0, 0, 300)\` |
| **2** | \`T2: Write(X)\` | \`20 ≥ RTS(X)=10, WTS(X)=0\` | **ALLOWED** | \`(10, 20, X_T2)\` | \`(0, 0, 200)\` | \`(0, 0, 300)\` |
| **3** | \`T1: Write(X)\` | \`10 < WTS(X)=20\` | **REJECTED (Abort T1!)** | \`(10, 20, X_T2)\` | \`(0, 0, 200)\` | \`(0, 0, 300)\` |
| **4** | \`T3: Read(Y)\` | \`30 ≥ WTS(Y)=0\` | **ALLOWED** | \`(10, 20, X_T2)\` | \`(30, 0, 200)\` | \`(0, 0, 300)\` |
| **5** | \`T2: Write(Y)\` | \`20 < RTS(Y)=30\` | **REJECTED (Abort T2!)** | \`(10, 0, 100)\` | \`(30, 0, 200)\` | \`(0, 0, 300)\` |
| **6** | \`T3: Write(Z)\` | \`30 ≥ RTS(Z)=0, WTS(Z)=0\` | **ALLOWED** | \`(10, 0, 100)\` | \`(30, 0, 200)\` | \`(0, 30, Z_T3)\` |
| **7** | \`T1: Read(Z)\` | *T1 aborted at Op 3* *(\`10 < 30\`)* | **SKIPPED / REJECTED** | \`(10, 0, 100)\` | \`(30, 0, 200)\` | \`(0, 30, Z_T3)\` |
| **8** | \`T2: Read(Z)\` | *T2 aborted at Op 5* *(\`20 < 30\`)* | **SKIPPED / REJECTED** | \`(10, 0, 100)\` | \`(30, 0, 200)\` | \`(0, 30, Z_T3)\` |
| **9** | \`T3: Write(X)\` | \`30 ≥ RTS(X)=10, WTS(X)=0\` | **ALLOWED (T3 Commits)** | \`(10, 30, X_T3)\` | \`(30, 0, 200)\` | \`(0, 30, Z_T3)\` |`,
        },
        commonPitfalls:
          'At Op 5 when `T2` aborts (`20 < RTS(Y)=30`), remember to roll back `T2`’s uncommitted Op 2 (`Write(X)`), restoring `WTS(X) = 0` so Op 9 (`T3: Write(X)`) sees clean `WTS(X) = 0` — and note that `T1`/`T2` ops after abort are skipped (though they fail `WTS(Z)=30` anyway!).',
      },
      {
        sourcePaper: 'VIT CO3 Exam Pattern · Timestamp Ordering & Thomas Write Rule Trace',
        questionPrompt:
          'Trace a concurrent schedule under Basic Timestamp Ordering (and show how Thomas’s Write Rule alters the outcome if an obsolete write occurs). Given TS(T1)=100, TS(T2)=200, TS(T3)=300 and initial RTS=WTS=0 for A, B, C, verify whether each operation succeeds or triggers rollback.',
        solvingMethod: [
          'Step 1 — Set Up a State Tracking Table: Initialize columns for `Item`, `RTS`, and `WTS` (all `0` initially) alongside the fixed `TS(Ti)` values (`T1=100, T2=200, T3=300`).',
          'Step 2 — Evaluate Every Operation Against Exact Bounds: On **`Read(Q)`**, compare `WTS(Q)` vs `TS(Ti)` (`WTS > TS => Rollback`; else update `RTS(Q) = max(RTS(Q), TS(Ti))`). On **`Write(Q)`**, first check `RTS(Q) > TS(Ti)` (`=> Rollback` in BOTH Basic TO and Thomas Write Rule!). Next check `WTS(Q) > TS(Ti)`: Basic TO rolls back `Ti`, whereas **Thomas’s Write Rule** skips/ignores the obsolete write!',
          'Step 3 — Handle Restarted Transactions: Whenever a transaction rolls back in Basic TO, state that it restarts with a **fresh, larger timestamp** (`TS_new > max existing TS`), guaranteeing progress without deadlock.',
        ],
        codeBlock: {
          title: 'Lecture Trace (Module-4.ppt Slide 179: T1=100, T2=200, T3=300)',
          language: 'markdown',
          content:
`| Op | Rule Check | Outcome | \`A (R,W)\` | \`B (R,W)\` | \`C (R,W)\` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Init | — | — | \`(0, 0)\` | \`(0, 0)\` | \`(0, 0)\` |
| \`1. T1 R(A)\` | \`WTS(A)=0 <= 100\` | **Execute** | \`(100, 0)\` | \`(0, 0)\` | \`(0, 0)\` |
| \`2. T2 R(B)\` | \`WTS(B)=0 <= 200\` | **Execute** | \`(100, 0)\` | \`(200, 0)\` | \`(0, 0)\` |
| \`3. T3 W(C)\` | \`RTS(C)=0 <= 300, WTS(C)=0 <= 300\` | **Execute** | \`(100, 0)\` | \`(200, 0)\` | \`(0, 300)\` |
| \`4. T2 R(C)\` | \`WTS(C)=300 > TS(T2)=200\` | **ABORT T2** | \`(100, 0)\` | \`(200, 0)\` | \`(0, 300)\` |
| \`5. T1 W(C)\` | \`RTS=0 <= 100\`, \`WTS(C)=300 > 100\` | **Basic TO:** ABORT T1 / **Thomas:** IGNORE | \`(100, 0)\` | \`(200, 0)\` | \`(0, 300)\` |`,
        },
        commonPitfalls:
          'Never apply Thomas’s Write Rule when **`RTS(Q) > TS(Ti)`**! If a younger transaction already *read* the value (`RTS > TS`), ignoring `Ti`’s write would leave that younger reader with wrong data—so `Ti` **must** roll back even under Thomas’s Write Rule.',
      },
      {
        sourcePaper: 'VIT CO3 Exam Pattern · Multiple Granularity Intention Lock Trace',
        questionPrompt:
          'Explain how Multiple Granularity Locking handles simultaneous coarse-grained (table scan) and fine-grained (tuple update) transactions on DB -> Table T -> Page P -> Record r1, r2, and evaluate compatibility between IX, S, SIX, and IS.',
        solvingMethod: [
          'Step 1 — Trace Top-Down Lock Path for Row Updater `T1` (`update r1`): `T1` acquires `IX(DB)` -> `IX(Table T)` -> `IX(Page P)` -> `X(r1)`.',
          'Step 2 — Trace Top-Down Lock Path for Concurrent Row Reader `T2` (`read r2`): `T2` acquires `IS(DB)` -> `IS(Table T)` -> `IS(Page P)` -> `S(r2)`. Look up `(IS, IX)` in the matrix: **Compatible (`Yes`)!** Neither needs to wait even at `Page P`, because conflict checking is delegated down to different records `r1` vs `r2`.',
          'Step 3 — Contrast with Whole-Table Scanner `T3` (`SELECT * FROM T`): `T3` requests `IS(DB)` -> `S(Table T)`. Look up `(S, IX)` on `Table T`: **Incompatible (`No`)!** Thus `T3` waits cleanly at the table level in O(1) checks without inspecting 100,000 child tuple locks.',
        ],
        commonPitfalls:
          'Remember that `SIX` is compatible ONLY with `IS` (NOT `S`, `IX`, `SIX`, or `X`), and unlocking MUST proceed **bottom-up** (`r1 -> Page -> Table -> DB`) so parent intention guards stay intact while child locks exist.',
      },
    ],
    exampleTitle: 'Basic TO vs. Thomas Write Rule Decision Summary',
    exampleBody:
`#### On \`Ti: Write(Q)\`
1. If **\`RTS(Q) > TS(Ti)\`** -> **ALWAYS Rollback \`Ti\`** *(younger reader already saw old \`Q\`!)*
2. Else if **\`WTS(Q) > TS(Ti)\`**:
   - **Basic Timestamp Ordering:** Rollback \`Ti\`
   - **Thomas’s Write Rule:** **IGNORE obsolete \`Write(Q)\`** and let \`Ti\` continue
3. Else (\`RTS(Q) <= TS(Ti)\` and \`WTS(Q) <= TS(Ti)\`) -> **Execute \`Write(Q)\`**, set \`WTS(Q) = TS(Ti)\`.`,
    examTip:
      'In Multiple Granularity compatibility questions, notice the pattern on the 5×5 matrix: `IS` conflicts only with `X`; `IX` conflicts with `S, SIX, X`; `S` conflicts with `IX, SIX, X`; `SIX` conflicts with everything except `IS`; `X` conflicts with everything.',
    selfChecks: [
      {
        question:
          'Suppose Item Q has RTS(Q) = 40 and WTS(Q) = 60. Transaction T1 with TS(T1) = 50 issues write(Q). What happens under Basic TO vs. Thomas’s Write Rule?',
        options: [
          'Both Basic TO and Thomas’s Write Rule execute write(Q) and set WTS(Q) = 50',
          'Basic TO rolls back T1, whereas Thomas’s Write Rule ignores write(Q) and lets T1 continue',
          'Both Basic TO and Thomas’s Write Rule roll back T1 because RTS(Q) <= TS(T1)',
          'Basic TO ignores write(Q), whereas Thomas’s Write Rule waits for WTS to drop',
        ],
        correctIndex: 1,
        explanation:
          'Since RTS(Q)=40 <= TS(T1)=50, no younger transaction read the missed value; since WTS(Q)=60 > 50, a younger transaction already overwrote Q. Basic TO aborts T1, while Thomas’s Write Rule safely ignores the obsolete write.',
      },
      {
        question:
          'On a Table node currently locked in IX mode by Transaction T1 (updating row r1), which lock request on the SAME Table node by Transaction T2 is immediately GRANTED?',
        options: [
          'S (Shared table lock to scan all rows)',
          'SIX (Shared + Intent Exclusive)',
          'IS (Intent Shared to read a different row r2)',
          'X (Exclusive table lock)',
        ],
        correctIndex: 2,
        explanation:
          'In the 5x5 MGL matrix, IS and IX are compatible (both signal intent to lock specific descendants, leaving conflict detection to individual pages/rows), whereas S, SIX, and X all conflict with IX.',
      },
    ],
  },

  'm4-t6': {
    summary:
      'Log-based recovery restores Atomicity and Durability after crashes using Write-Ahead Logging (WAL) and Buffer Pool policies (Steal/No-Steal, Force/No-Force). Deferred Update executes NO-UNDO/REDO by buffering writes until commit, Immediate Update executes UNDO/REDO using before/after images, and Shadow Paging atomically flips page-table pointers with zero log UNDO/REDO.',
    sourceDecks: [
      'Module 4 Transaction Processing and Recovery.pptx (Slides 55–58)',
      'Module-4.ppt (Slides 187–203)',
    ],
    keyPoints: [
      {
        heading: 'Buffer Pool Policies & Write-Ahead Logging (WAL)',
        text: '**No-Steal** forbids flushing uncommitted dirty buffers to disk (avoids UNDO); **Steal** allows early dirty flush (needs UNDO via `BFIM`). **Force** flushes all dirty pages on commit (avoids REDO); **No-Force** keeps committed pages in RAM (needs REDO via `AFIM`). WAL enforces two rules: (1) flush `[write, T, X, BFIM, AFIM]` to stable log BEFORE dirty page `X` hits disk; (2) flush `[commit, T]` BEFORE reporting commit success.',
      },
      {
        heading: 'Deferred Update (NO-UNDO / REDO) vs. Immediate Update (UNDO / REDO)',
        text: '**Deferred Update (`No-Steal`):** Disk database is NEVER modified until commit; on crash, ignore uncommitted transactions (**NO-UNDO**) and **REDO** committed ones forward using `AFIM`. **Immediate Update (`Steal / No-Force`):** Disk MAY change before commit; on crash, **UNDO** uncommitted transactions **backward** using `BFIM`, then **REDO** committed ones **forward** using `AFIM`.',
      },
      {
        heading: 'Checkpointing & Shadow Paging (NO-UNDO / NO-REDO)',
        text: '**Checkpointing** periodically flushes dirty buffers and writes `[checkpoint]` to log so recovery only scans back to the last checkpoint rather than the start of time. **Shadow Paging** maintains an immutable **Shadow Page Table** (old disk pages) and a **Current Page Table** (modified new pages); commit atomically flips the directory pointer (instant crash recovery, no log UNDO/REDO, but causes disk fragmentation).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Buffer Manager Policy Combinations & Recovery Cost',
        body: 'Whether a recovery engine needs `UNDO`, `REDO`, both, or neither comes directly from the Buffer Manager’s **Steal** and **Force** choices:',
        table: {
          headers: ['Buffer Policy Pair', 'Disk Flush Before Commit?', 'Flush All on Commit?', 'Recovery Action Needed', 'Corresponding Technique'],
          rows: [
            ['No-Steal + Force', 'No (uncommitted stays in RAM)', 'Yes (slow commits)', 'NO-UNDO / NO-REDO', 'Theoretical trivial baseline (too slow at commit)'],
            ['No-Steal + No-Force', 'No (uncommitted stays in RAM)', 'No (fast commits)', 'NO-UNDO / REDO', 'Deferred Database Modification'],
            ['Steal + No-Force', 'Yes (high buffer efficiency)', 'No (high commit speed)', 'UNDO / REDO', 'Immediate Modification (standard RDBMS / ARIES)'],
            ['Copy-on-Write Pages', 'Writes to fresh shadow blocks', 'Atomic pointer swap', 'NO-UNDO / NO-REDO', 'Shadow Paging (no WAL needed)'],
          ],
        },
      },
      {
        title: '2. Deferred vs. Immediate Crash Scenarios & Checkpointing (Slides 57–58)',
        body: 'Study Prof. Swaminathan’s three canonical crash scenarios on `T0` (`A: 1000->950`, `B: 2000->2050`) followed by `T1` (`C: 700->600`), plus how a `[checkpoint]` record partitions active vs. already-flushed transactions:',
        diagramId: 'm4-checkpoint-timeline',
        diagramCaption: 'Checkpointing Timeline: Ignore flushed T1, REDO committed T2 & T4, UNDO active uncommitted T3.',
        table: {
          headers: ['Crash Scenario on T0 -> T1', 'Deferred Update Action (NO-UNDO / REDO)', 'Immediate Update Action (UNDO / REDO)'],
          rows: [
            [
              'Case (a): Crash before <T0 commit>',
              'No REDO, No UNDO. (A=1000, B=2000, C=700 unchanged on disk)',
              'UNDO(T0) backward: restore B=2000, then A=1000.',
            ],
            [
              'Case (b): <T0 commit> in log, T1 crashes before commit',
              'REDO(T0) forward: set A=950, B=2050. Ignore T1 (C=700).',
              'UNDO(T1) backward: restore C=700; REDO(T0) forward: set A=950, B=2050.',
            ],
            [
              'Case (c): Both <T0 commit> and <T1 commit> in log',
              'REDO(T0) then REDO(T1): A=950, B=2050, C=600.',
              'REDO(T0) then REDO(T1): A=950, B=2050, C=600.',
            ],
          ],
        },
      },
      {
        title: '3. Shadow Paging Mechanics & Prof’s 6-Row Comparison Table (Slide 202)',
        body: 'In Shadow Paging, the database on disk is indexed by a Page Table mapping logical page numbers `1..n` to physical disk blocks. When `T` starts, the Current Page Table is copied to an immutable **Shadow Page Table** on stable storage; writes allocate new free disk blocks and update only the Current Page Table. On commit, the root pointer switches to Current; on crash, Current is discarded and Shadow remains untouched.',
        table: {
          headers: ['Feature', 'Deferred Update', 'Immediate Update', 'Shadow Paging'],
          rows: [
            ['Database Updated When?', 'After Commit only (`No-Steal`)', 'Before Commit allowed (`Steal`)', 'Written to new shadow pages; pointer swapped at Commit'],
            ['Uses UNDO?', 'No (`NO-UNDO`)', 'Yes (backward via `BFIM`)', 'No'],
            ['Uses REDO?', 'Yes (forward via `AFIM`)', 'Yes (forward via `AFIM`)', 'No'],
            ['System Log Required?', 'Yes (WAL `AFIM` + `commit`)', 'Yes (WAL `BFIM` + `AFIM` + `commit`)', 'No (for single-user; log needed only for concurrency)'],
            ['Recovery Speed', 'Medium (REDO only)', 'Slow (Backward UNDO + Forward REDO)', 'Fast (instant pointer revert)'],
            ['Complexity & Trade-off', 'Low (risks buffer overflow for huge txns)', 'Medium (best runtime performance)', 'High (breaks physical data contiguity & needs GC)'],
          ],
        },
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q8(b) [Full 10M, CO3, BL3]',
        questionPrompt:
          'Q8(b): Initial balances: A = 500, B = 1000.\nLog at CRASH:\n[Start_Transaction, T1]; [Write, T1, A, 500, 400]; [Start_Transaction, T2]; [Write, T2, B, 1000, 1200]; [Commit, T1]; [Start_Transaction, T3]; [Write, T3, A, 400, 450]; <CRASH>\nA. Differentiate Deferred vs Immediate Update regarding when physical disk updates occur relative to commits. [2M]\nB. Trace the recovery process (REDO List, UNDO List, exact ops on A & B) for Case A: Deferred Update and Case B: Immediate Update. [4M]\nC. State final values of A and B on disk after recovery completes for BOTH cases. [4M]',
        solvingMethod: [
          'Step 1 — Part A [2M] Protocol Timing Distinction: Under **Deferred Update (`NO-UNDO / REDO`, `No-Steal`)**, updates remain buffered in memory/log and **never touch physical disk pages until the transaction commits**. Under **Immediate Update (`UNDO / REDO`, `Steal / No-Force`)**, dirty buffers **may flush physical updates to disk while the transaction is still active (before commit)**, provided WAL records are written first.',
          'Step 2 — Part B [4M] Trace Case A (Deferred Update): Scan log for `[Commit, Tx]`. Only **`T1`** committed; `T2` and `T3` have no commit record. Thus **`UNDO List = ∅` (none)** and **`REDO List = {T1}`**. Ignore `T2` and `T3` completely (their writes never reached disk). Execute **`REDO(T1)`**: apply after-image `AFIM = 400` to `A` (`A = 400`; `B` remains `1000`).',
          'Step 3 — Part B [4M] Trace Case B (Immediate Update): Uncommitted active transactions **`T2` and `T3`** belong to **`UNDO List = {T3, T2}`** (ordered strictly **backward** from crash!) and committed **`T1`** belongs to **`REDO List = {T1}`**. (1) **Backward UNDO pass:** Undo `[Write, T3, A, 400, 450]` -> restore `A` to `BFIM = 400`; Undo `[Write, T2, B, 1000, 1200]` -> restore `B` to `BFIM = 1000`. (2) **Forward REDO pass:** Redo `[Write, T1, A, 500, 400]` -> set `A` to `AFIM = 400`.',
          'Step 4 — Part C [4M] Final Consistent Balances: **Case A (Deferred):** **`A = 400, B = 1000`**. **Case B (Immediate):** **`A = 400, B = 1000`**. Explain explicitly that both protocols arrive at the exact same final state (`T1` applied `-100` to `A`, while `T2`’s `+200` on `B` and `T3`’s `+50` on `A` were rolled back/discarded).',
        ],
        codeBlock: {
          title: 'Immediate vs Deferred Recovery Trace for A1 Q8(b)',
          language: 'markdown',
          content:
`| Transaction | Log State at Crash | Deferred Update Action | Immediate Update Action |
| :--- | :--- | :--- | :--- |
| \`T1\` | \`[Commit, T1]\` present | **REDO** *(forward)* | **REDO** *(forward)* |
| \`T2\` | Active, no commit record | Ignore *(never hit disk)* | **UNDO** *(backward via BFIM)* |
| \`T3\` | Active, no commit record | Ignore *(never hit disk)* | **UNDO** *(backward via BFIM)* |

#### Case A — Deferred Update (\`UNDO = {}\`, \`REDO = {T1}\`)
- **Action:** Redo \`[Write, T1, A, 500, 400]\` -> set \`A = 400\` *(B stays \`1000\`)*.

#### Case B — Immediate Update (\`Backward UNDO = {T3, T2}\`, \`Forward REDO = {T1}\`)
1. **Backward UNDO \`{T3, T2}\`:**
   - Undo \`[Write, T3, A, 400, 450]\` -> \`A := 400\` *(T3 BFIM)*
   - Undo \`[Write, T2, B, 1000, 1200]\` -> \`B := 1000\` *(T2 BFIM)*
2. **Forward REDO \`{T1}\`:**
   - Redo \`[Write, T1, A, 500, 400]\` -> \`A := 400\` *(T1 AFIM)*

> **Final Consistent Disk State (Both Cases):** **\`A = 400\`**, **\`B = 1,000\`**`,
        },
        commonPitfalls:
          'Notice how `T1` modified `A` (`500 -> 400`), committed, and then `T3` modified `A` (`400 -> 450`) before crashing! If you ran UNDO in the wrong order or forgot to mention backward UNDO before forward REDO, explain clearly why `UNDO(T3)` restores `A = 400` and `REDO(T1)` confirms `A = 400` (never restoring `500`!).',
      },
    ],
    exampleTitle: 'Why Backward UNDO + Forward REDO Order Matters',
    exampleBody:
`Suppose uncommitted \`T1\` wrote \`(X: 10 -> 20)\` and later uncommitted \`T2\` wrote \`(X: 20 -> 30)\` before a crash:

1. **Backward UNDO *(Correct: \`T2\` then \`T1\`)*:** Undo \`T2\` (\`X = 20\`), then Undo \`T1\` (\`X = 10\`) -> **Restores true initial \`X = 10\`!**
2. **Forward UNDO *(Buggy!)*:** Undo \`T1\` (\`X = 10\`), then Undo \`T2\` (\`X = 20\`) -> **Corrupts \`X\` to \`20\`!**

> **Golden Rule:** Always execute **UNDO in REVERSE log order** *(using \`BFIM\`)*, then **REDO in FORWARD log order** *(using \`AFIM\`)*.`,
    examTip:
      'For full marks in any Recovery 10-mark question, draw Prof. Swaminathan’s comparison table (Updated When, UNDO?, REDO?, Log Required?, Recovery Speed) and clearly state `BFIM` (Before-Image) for UNDO vs `AFIM` (After-Image) for REDO.',
    selfChecks: [
      {
        question:
          'Which buffer pool management policy pair corresponds to the Deferred Update (NO-UNDO / REDO) recovery protocol?',
        options: [
          'Steal + Force',
          'No-Steal + No-Force',
          'Steal + No-Force',
          'Shadow Paging + Force',
        ],
        correctIndex: 1,
        explanation:
          'Deferred Update uses No-Steal (uncommitted dirty pages never overwrite disk, eliminating UNDO) paired with No-Force (committed updates may still reside only in memory at crash, requiring REDO).',
      },
      {
        question:
          'During crash recovery under Immediate Update, why must UNDO operations execute strictly in reverse chronological log order?',
        options: [
          'To skip reading [commit] records at the end of the log',
          'So that if multiple uncommitted writes modified the same item X, the earliest before-image (BFIM) wins last rather than being overwritten by an intermediate value',
          'Because Write-Ahead Logging only writes AFIM values for committed transactions',
          'To avoid acquiring Shared locks during recovery',
        ],
        correctIndex: 1,
        explanation:
          'If T1 changed X (10->20) and T2 changed X (20->30) and neither committed, reversing backward restores X=20 then X=10 cleanly, whereas forward undo would finish at the intermediate value 20.',
      },
    ],
  },
};
