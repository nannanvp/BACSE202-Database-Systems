import type { TopicNote } from './noteTypes';

export const MODULE_3_NOTES: Record<string, TopicNote> = {
  'm3-t1': {
    summary:
      'Physical file organization governs how logical relations are mapped onto fixed-size disk blocks (pages) and accessed by the buffer manager. Understanding blocking factor (bfr), spanned vs. unspanned storage, and block I/O complexity across Heap (unordered) and Sequential (ordered) files is the foundation for every indexing and query-cost calculation.',
    sourceDecks: [
      'BACSE202-DBS-Module-3_Complete.pptx (Slides 1–52)',
      'Module 3. Indexing.pptx (Slides 1–12)',
    ],
    keyPoints: [
      {
        heading: 'Storage Hierarchy, Disk Blocks & Blocking Factor (bfr)',
        text: 'Disk I/O operates in whole blocks of size `B` bytes (not individual bytes). With fixed-length records of size `R` bytes stored **unspanned** (no record crosses a block boundary), the blocking factor is `bfr = floor(B / R)` records/block and total file blocks are `b = ceil(r / bfr)`.',
      },
      {
        heading: 'Unordered (Heap) vs. Ordered (Sequential) File Trade-offs',
        text: '**Heap files** append new records at the end (`O(1)` insert = 2 I/Os), but equality searches scan half the file on average (`b/2` blocks) and range scans read all `b` blocks. **Ordered files** physically sort records by an ordering field so binary search takes `ceil(log2 b)` I/Os and range queries stay sequential, while insertions use **overflow files** + periodic reorganization.',
      },
      {
        heading: 'Spanned vs. Unspanned Records & Deletion Markers',
        text: 'Unspanned wastes `B mod R` bytes per block but reads any record in 1 block access; **spanned** packs variable-length records across blocks using trailing pointers (more dense, up to 2 block reads). Deletions avoid expensive disk shifting by setting a **deletion marker bit** on the record slot and reclaiming space later.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Blocking Factor, Spanned vs. Unspanned Layouts & File Parameters',
        body: 'In Elmasri & Navathe / Prof. Swaminathan’s Module 3 lectures, every physical design numerical converts record counts into **block counts (`b`)** because transferring one block between disk and RAM buffer dominates latency (~5–10 ms vs. nanoseconds in RAM):',
        diagramId: 'm3-spanned-unspanned',
        diagramCaption: 'Unspanned vs. Spanned disk block packing across B = 1,000 byte blocks.',
        bullets: [
          '**Blocking Factor Formula (Unspanned):** `bfr = floor(B / R)`. Wasted bytes per block = `B - (bfr * R)`.',
          '**Total Disk Blocks Formula:** `b = ceil(r / bfr)` where `r` is the total number of records.',
          '**Spanned Average `bfr`:** When a block pointer takes `P` bytes, usable space per spanned record is `(R + P)` if split often, yielding `bfr_spanned ≈ (B - P) / (R + P)` (higher density for large variable-length records, e.g. `R > B/2`).',
        ],
      },
      {
        title: '2. Heap (Unordered) vs. Ordered (Sequential) Files: Exact I/O Cost Matrix',
        body: 'Compare the exact disk block I/O costs assuming `b` data blocks and an optional temporary **unordered overflow file** of `b_ov` blocks for ordered files:',
        table: {
          headers: ['Operation', 'Heap (Unordered) File', 'Ordered (Sequential) File (No Overflow)'],
          rows: [
            [
              'Equality search on ordering/search key',
              'Avg: b/2 blocks | Worst (not found): b blocks',
              'Binary search: ceil(log2 b) blocks (worst case)',
            ],
            [
              'Equality search on non-ordering field',
              'Avg: b/2 | Worst: b',
              'Full linear scan: b/2 avg, b worst (sort key does not help)',
            ],
            [
              'Range query (e.g., Salary BETWEEN 50k AND 80k)',
              'Must scan all b blocks',
              'ceil(log2 b) to find start + contiguous blocks in range',
            ],
            [
              'Insert new record',
              'Read last block + write back = 2 I/Os (O(1))',
              'Log(b) to find slot + shift average b/2 blocks (or 2 I/Os via Overflow file)',
            ],
            [
              'Delete existing record',
              'Search (b/2) + mark deleted bit + write block (1 I/O)',
              'Binary search log2(b) + mark deleted bit + write block (1 I/O)',
            ],
            [
              'Periodic Maintenance',
              'Compact deleted slots / reclaim free space',
              'Sort overflow file (b_ov) and merge with main sorted file (b)',
            ],
          ],
        },
        bullets: [
          '**Handling Slow Inserts in Ordered Files (Slide 39):** Maintain an unsorted **overflow file** for new inserts. Searches first binary-search the main ordered file (`log2 b`), and if missing, linearly scan the small overflow file (`+ b_ov`). Periodically merge and re-sort.',
          '**Nine Standard DBMS File Primitives:** `Open`, `Reset`, `Find` (Locate), `ReadNext`, `FindNext`, `Modify`, `Insert`, `Delete`, and `Close` — internal iterators move a file scan cursor block-by-block.',
        ],
      },
      {
        title: '3. Record Formats (Fixed vs. Variable) & Heap Free-Space Tracking',
        body: 'Physical engines support both fixed-length record arrays and variable-length slotted pages:',
        bullets: [
          '**Fixed-Length Records:** Offset of field `k` is computed statically in `O(1)` (`base + sum(len_0..k-1)`). Free slots are linked into a **free list** whose header pointer sits in Block 0 so deleted slots reuse in `O(1)` without scanning.',
          '**Variable-Length Records (Delimited vs. Slotted Page):** Needed for `VARCHAR`, multivalued attributes, or optional fields. A **Slotted-Page Header** tracks `(entry_count, free_space_end, [(offset_i, len_i), ...])` growing forward while records grow backward from the block end — keeping external RIDs (`(block_id, slot_no)`) stable even when records move inside the block.',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Exam Pattern Method · Physical Storage & Blocking Factor I/O (CO2, BL3)',
        questionPrompt:
          'Typical Exam Numerical: Given a relation with r records of fixed size R bytes stored unspanned in blocks of B bytes, compute blocking factor (bfr), number of data blocks (b), wasted bytes per block, and search/scan I/O costs under Heap vs. Ordered organization.',
        solvingMethod: [
          'Step 1 — Check Unspanned Blocking Factor: Compute `bfr = floor(B / R)`. Never round up—half a record cannot fit into remaining bytes if unspanned!',
          'Step 2 — Compute Unused Space & Total Data Blocks: Unused space per block = `B - (bfr * R)` bytes. Total blocks `b = ceil(r / bfr)` (round UP so leftover records get a final partial block).',
          'Step 3 — Compare Search I/O Costs: Heap equality search takes `b / 2` average (`b` worst case). Ordered equality search on the ordering key uses binary search taking `ceil(log2 b)` block accesses.',
          'Step 4 — State Overflow Strategy if Inserts Mentioned: Explain that keeping an overflow file keeps ordered inserts at `O(1)` (2 I/Os) at the expense of periodic merge-sort reorganization.',
        ],
        codeBlock: {
          title: 'Worked Drill: r = 30,000 records, R = 100 B, B = 1,024 B',
          language: 'markdown',
          content:
`- **Blocking Factor:** \`bfr = floor(1024 / 100) = 10 records/block\` (*unused = 24 bytes/block*)
- **Total Blocks:** \`b = ceil(30,000 / 10) = 3,000 blocks\`
- **Heap Equality Search (Avg):** \`3,000 / 2 = 1,500 block reads\`
- **Ordered Binary Search (Max):** \`ceil(log2(3,000)) = 12 block reads\` (**125x fewer!**)`,
        },
        commonPitfalls:
          'Rounding `bfr` with standard rounding instead of `floor()`, or forgetting to use `ceil()` when dividing total records `r` by `bfr`.',
      },
    ],
    exampleTitle: 'Heap vs. Ordered Search Speedup (b = 1,024 Blocks)',
    exampleBody:
`- **Heap File:** Avg Search = \`1,024 / 2 = 512 I/Os\` | Insert = \`2 I/Os\`
- **Ordered File:** Binary Search = \`ceil(log2 1,024) = 10 I/Os\` | Range Scan = \`10 + contiguous blocks in range\``,
    examTip:
      'Whenever an exam asks "Why not store every file sorted?", cite the expensive block-shifting cost on random inserts (`b/2` blocks) and explain how overflow files or B+ Trees solve it.',
    selfChecks: [
      {
        question:
          'A file has 10,000 fixed-length records of 150 bytes each stored unspanned in 1,024-byte blocks. What are the blocking factor (bfr) and total blocks (b)?',
        options: [
          'bfr = 7, b = 1,429 blocks',
          'bfr = 6, b = 1,667 blocks',
          'bfr = 6, b = 1,666 blocks',
          'bfr = 7, b = 1,465 blocks',
        ],
        correctIndex: 1,
        explanation:
          'Unspanned bfr = floor(1024 / 150) = 6 records/block (leaving 124 bytes unused). Total blocks b = ceil(10,000 / 6) = ceil(1666.67) = 1,667 blocks.',
      },
      {
        question:
          'Why do ordered (sequential) files use deletion markers instead of immediately shifting trailing records backward?',
        options: [
          'Shifting across blocks would rewrite on average b/2 blocks just to close one gap',
          'Ordered files cannot store variable-length attributes',
          'Deletion markers convert the file into a hash bucket chain',
          'Disk hardware forbids overwriting a block more than once',
        ],
        correctIndex: 0,
        explanation:
          'Physically compacting an ordered file on every delete would shift subsequent records across half the file (O(b) I/Os). Setting a 1-bit deletion marker takes only 1 block rewrite and defers cleanup to batch reorganization.',
      },
    ],
  },

  'm3-t2': {
    summary:
      'Hashing maps a search key directly to a disk bucket address via hash function `h(k)` for near-`O(1)` equality lookups. Because **Static Hashing** degrades with long overflow chains as files grow, dynamic schemes—**Extendible Hashing** (directory doubling + local/global depths) and **Linear Hashing** (directory-free sequential splitting)—expand and shrink buckets smoothly.',
    sourceDecks: [
      'Module 3. Hashing.pptx (Slides 1–46)',
      'Linear_Hashing_Numerical_Example.pptx (Slides 1–20)',
      'BACSE202-DBS-Module-3_Complete.pptx (Slides 53–118)',
    ],
    keyPoints: [
      {
        heading: 'Static Collision Resolution: Open Addressing vs. Chaining & Overflow Buckets',
        text: 'Closed addressing (Separate Chaining / Bucket Overflow Chains) links extra blocks off a full primary bucket. Open addressing probes alternate slots: **Linear Probing** `(h(k)+i)%m` (primary clustering), **Quadratic Probing** `(h(k)+i^2)%m` (secondary clustering), and **Double Hashing** `(h1(k)+i*h2(k))%m`.',
      },
      {
        heading: 'Extendible Hashing (Global Depth `d` vs. Local Depth `d\'`)',
        text: 'A directory of `2^d` slots maps `d` prefix (MSB) or suffix (LSB) bits of `h(k)` to data buckets, each holding local depth `d\' ≤ d`. On overflow: **Case 1 (`d\' == d`)** doubles the directory (`d -> d+1`), splits the full bucket (`d\'+1`), and redistributes its keys; **Case 2 (`d\' < d`)** splits ONLY the overflowing bucket and updates existing pointers (NO doubling!).',
      },
      {
        heading: 'Linear Hashing (Level `i` & Split Pointer `p` — No Directory)',
        text: 'Buckets start as `B_0..B_{N-1}` (`i=0, p=0`). Whenever ANY bucket overflows, it allocates an overflow chain AND **always splits bucket `B_p`** (even if a different bucket overflowed!) using `h_{i+1}(k) = k mod (2^{i+1}*N)`, advancing `p = p + 1`. When `p` reaches `2^i * N`, increment `i <- i+1` and reset `p <- 0`.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Static Hashing & Collision Resolution Techniques',
        body: 'In **Internal Static Hashing**, slots sit in an array of size `m`. In **External (Disk) Static Hashing**, each address points to a primary disk **bucket** holding `c` records; full buckets link to **overflow buckets**:',
        table: {
          headers: ['Technique', 'Formula / Mechanism', 'Clustering Risk', 'Key Lecture Example / Rule'],
          rows: [
            [
              'Separate Chaining / Overflow Buckets',
              'Each bucket points to a linked list of overflow blocks',
              'None (chains grow gracefully)',
              'FAT A1 Q5(a): h(k) = last 2 bits; K3, K5 overflow B1 -> B1_ov1',
            ],
            [
              'Linear Probing',
              'h(k, i) = (h(k) + i) mod m',
              'High Primary Clustering (long contiguous occupied runs)',
              'Checks slot+1, slot+2, ... sequentially until empty',
            ],
            [
              'Quadratic Probing',
              'h(k, i) = (h(k) + c1*i + c2*i^2) mod m (often + i^2)',
              'Secondary Clustering (same home hash follows same probe)',
              'From Complete PPT: h(k)=k%10, probe (h(k)+i^2)%10',
            ],
            [
              'Double Hashing',
              'h(k, i) = (h1(k) + i * h2(k)) mod m',
              'Minimal (near-uniform probe sequences)',
              'From Complete PPT: h1(k)=k%11, h2(k)=8-(k%8) (never 0!)',
            ],
          ],
        },
        bullets: [
          '**Drawback of Static Hashing:** Fixed `B` primary buckets cannot grow without rehashing the entire file; under high growth, long overflow chains degrade `O(1)` lookup toward linear scan, and hash tables **cannot efficiently answer range queries** (`BETWEEN a AND b`).',
        ],
        markdownBlock:
`#### Six Hash Function Construction Methods (\`Module 3. Hashing.pptx\`, Slides 8–15)
| Method | Rule / Formula | Worked Slide Numerical |
| :--- | :--- | :--- |
| **1. Truncation** | Pick \`k\` leftmost or rightmost digits matching table size | Keys \`82394561, 87139465, 83567271, 85943228\` (size 100, 2 rightmost) → **\`61, 65, 71, 28\`** |
| **2. Mid-Square** | Square key \`k²\` and extract middle digits (e.g., 3rd & 4th) | \`1337² = 1787569 → 87\`, \`1273² = 1620529 → 20\`, \`1391² = 1934881 → 34\`, \`1026² = 1052676 → 52\` |
| **3. Folding** | Partition key into segments (\`3-2-3\` digits), sum, & truncate | \`82394561 → 823 + 94 + 561 = 1478 → 478\`; \`87139465 → 871 + 39 + 465 = 1375 → 375\` |
| **4. Modular (Division)** | \`h(k) = k mod m\` (choose prime \`m = 97\`) | \`82394561 % 97 = 45\`, \`87139465 % 97 = 0\`, \`83567271 % 97 = 25\`, \`85943228 % 97 = 64\` |
| **5. Floating-Point** | \`h(k) = ⌊fractional(k) × m⌋\` (\`m = 97\`) | \`123.4321 → ⌊0.4321×97⌋ = 41\`, \`19.463 → 44\`, \`2.0298 → 2\`, \`8.9956 → 96\` |
| **6. String ASCII Sum** | Sum ASCII codes of characters \`mod m\` (\`m = 97\`) | \`"suresh" = (115+117+117+101+115+104) % 97 = 666 % 97 =\` **\`84\`** |

#### Slide Comparison: Linear Probing vs. Quadratic Probing (\`m = 11\`, Slides 22–26)
- **Linear Probing \`(k + i) % 11\` on \`[29, 18, 43, 10, 36, 25, 46]\`:** \`29→7\`, \`18→7(coll)→8\`, \`43→10\`, \`10→10(coll)→0\`, \`36→3\`, \`25→3(coll)→4\`, \`46→2\`. Final slots: \`[0:10, 2:46, 3:36, 4:25, 7:29, 8:18, 10:43]\`.
- **Quadratic Probing \`(k + i²) % 11\` on \`[29, 18, 43, 10, 46, 54]\`:** \`29→7\`, \`18→7(coll,+1²)→8\`, \`43→10\`, \`10→10(coll,+1²)→0\`, \`46→2\`, \`54→10(coll) → (54+1²)%11=0(coll) → (54+2²)%11 = 58%11 =\` **\`3\`**.`,
      },
      {
        title: '2. Extendible Hashing: Complete Split, Bit-Order & Merge Rules',
        body: 'Extendible Hashing adapts dynamically without scanning the whole file. Always read the exam question carefully to see whether it uses **Prefix bits (MSB, left-to-right)** or **Suffix bits (LSB, right-to-left)**:',
        markdownBlock:
`> **Overflow Split Decision (\`d'\` = Local Depth, \`d\` = Global Depth):**
> - **Case 1 (\`d' == d\`):** **Double Directory** (\`d -> d + 1\`), split the overflowing bucket into two, and increment \`d'\` on both new buckets.
> - **Case 2 (\`d' < d\`):** **NO directory doubling!** Split ONLY the overflowing bucket, increment its \`d'\`, and re-point only the directory entries that shared it.

#### Deletion Merge Rule (Prof. Complete PPT Slides 82–86)
- Two sibling (*"buddy"*) buckets differing only in bit \`d'\` **MERGE** if \`|Bucket_0| + |Bucket_1| <= capacity c\` (decrement \`d' -> d' - 1\`).
- **Directory Shrinks (\`d -> d - 1\`)** ONLY when **EVERY** bucket in the file satisfies \`d' < d\`.`,
        bullets: [
          '**Professor’s Lecture LSB Example (`Module 3. Hashing.pptx` Slide 37):** Insert `{16, 4, 6, 22, 24, 10, 31, 7, 9, 20, 26}`, `c = 3`, initial `d = 1`, `d\' = 1` using rightmost `d` bits (LSB): inserting `22 (10110)` overflows bucket `0` (`d\'=d=1 -> d=2`), while later inserting `26 (11010)` overflows bucket `010` where `d\'=2 < d=3` (**Case 2**: split bucket `010` into `010` and `110` WITHOUT doubling the directory!).',
          '**Professor’s Complete PPT MSB Example:** Uses leftmost `d` bits (`prefix 0` vs `prefix 1`) — identical to **FAT A1+TA1 Q5(a)**!',
        ],
      },
      {
        title: '3. Linear Hashing: Level `i`, Split Pointer `p` & Round Reset (`Linear_Hashing_Numerical_Example.pptx`)',
        body: 'Linear Hashing eliminates the in-memory directory completely and splits buckets in strict linear order `0, 1, 2, ...` across rounds:',
        markdownBlock:
`> **Initial State & Hash Pair:** \`N\` buckets (\`B0..B_{N-1}\`), Level \`i = 0\`, Split Pointer \`p = 0\`
> \`h_i(k) = k mod (2^i * N)\`   and   \`h_{i+1}(k) = k mod (2^{i+1} * N)\`

#### Lookup / Insert Routing Rule for Key \`k\`
1. Compute \`m = h_i(k)\`.
2. If **\`m < p\`**: bucket \`B_m\` has already split this round — re-route via **\`h_{i+1}(k)\`**.
3. If **\`m >= p\`**: bucket \`B_m\` has not split yet — use **\`B_m\`** directly.

#### Complete Slide Numerical Walkthrough: Insert \`[2, 4, 6, 1, 3, 5, 7]\` (\`N = 2, c = 2, h₀(k) = k mod 2, h₁(k) = k mod 4\`)
| Step | Key \`k\` | Hash Evaluation | Action Taken | Bucket State After Step | Split Pointer \`p\` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | \`2\` | \`h₀(2) = 0 ≥ p(0)\` | Insert in \`B0\` | \`B0=[2], B1=[]\` | \`p = 0\` |
| **2** | \`4\` | \`h₀(4) = 0 ≥ p(0)\` | Insert in \`B0\` (Full) | \`B0=[2, 4], B1=[]\` | \`p = 0\` |
| **3** | \`6\` | \`h₀(6) = 0\` → **Overflow!** | Split \`B_p = B0\` via \`h₁(k)=k mod 4\` into \`B0, B2\` | \`B0=[4], B1=[], B2=[2, 6]\` | \`p = 0 → 1\` |
| **4** | \`1\` | \`h₀(1) = 1 ≥ p(1)\` | Insert in \`B1\` | \`B0=[4], B1=[1], B2=[2, 6]\` | \`p = 1\` |
| **5** | \`3\` | \`h₀(3) = 1 ≥ p(1)\` | Insert in \`B1\` (Full) | \`B0=[4], B1=[1, 3], B2=[2, 6]\` | \`p = 1\` |
| **6** | \`5\` | \`h₀(5) = 1\` → **Overflow!** | Split \`B_p = B1\` via \`h₁(k)=k mod 4\` into \`B1, B3\`; round finishes (\`i=0->1, p=0\`) | \`B0=[4], B1=[1, 5], B2=[2, 6], B3=[3]\` | \`p = 1 → 2\` *(resets \`p=0, i=1\`)* |
| **7** | \`7\` | \`h₁(7) = 7 mod 4 = 3 ≥ p(0)\` | Insert in \`B3\` (No overflow) | \`B0=[4], B1=[1, 5], B2=[2, 6], B3=[3, 7]\` | \`p = 0\` (\`i=1\`) |`,
        bullets: [
          '**Crucial Exam Point (Slide 20):** The bucket that overflows and the bucket `B_p` that gets split do **NOT** have to be the same bucket! (e.g., if `B2` overflowed while `p = 1`, `B2` gets an overflow block and `B1` is split!).',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q5(a) [10M, CO2, BL3]',
        questionPrompt:
          'Q5(a): Bucket capacity c = 2. Keys: K1(0001), K2(1001), K3(0101), K4(0010), K5(1101).\nA. Static Hashing with fixed buckets B0, B1, B2, B3 using h_static(k) = last 2 bits of h(k). Trace K1..K5, show overflows at K3 & K5, and draw the Overflow Chain. [4M]\nB. Extendible Dynamic Hashing with initial d = 1, directory entries (0 and 1), Bucket_A (prefix 0, dp=1) and Bucket_B (prefix 1, dp=1), c = 2. Trace K1..K5 step by step and draw Final Directory and Bucket Layout. [6M]',
        solvingMethod: [
          'Part A — Static Hashing Trace [4M]: Extract last 2 bits (`B0=00, B1=01, B2=10, B3=11`). `K1(0001)->01 (B1=[K1])`; `K2(1001)->01 (B1=[K1, K2] FULL)`; `K3(0101)->01` hits full `B1` -> **Bucket Overflow on B1!** Create overflow bucket `B1_ov1=[K3]`; `K4(0010)->10 (B2=[K4])`; `K5(1101)->01` hits full `B1` -> follows overflow pointer to `B1_ov1=[K3, K5]`.',
          'Part B — Check Bit Convention [1M]: Read wording carefully: “Bucket_A for **prefix 0** and Bucket_B for **prefix 1**” -> this problem explicitly uses **MSB (leftmost `d` bits)**, NOT LSB!',
          'Part B — Step-by-Step Extendible Trace [3M]: `K1(0001)` prefix `0` -> `Bucket_A=[K1]`. `K2(1001)` prefix `1` -> `Bucket_B=[K2]`. `K3(0101)` prefix `0` -> `Bucket_A=[K1, K3]` (FULL, `c=2`). `K4(0010)` prefix `0` -> **`Bucket_A` OVERFLOWS!** Since `dp(A)=1 == d=1`, **double directory (`d=2`: `00, 01, 10, 11`)**, split `Bucket_A` into `A1 (dp=2)` for `00` and `A2 (dp=2)` for `01`, and rehash `{K1(0001), K3(0101), K4(0010)}` -> `A1=[K1, K4]`, `A2=[K3]`. Directory `10` & `11` both continue pointing to `Bucket_B (dp=1)`. Finally insert `K5(1101)`: 2-bit prefix `11` -> routes to `Bucket_B=[K2, K5]` (fits with `c=2`, NO split!).',
          'Part B — Draw Final Directory & Buckets [2M]: Clearly show Global Depth `d = 2` on the directory and Local Depth `dp = 2` on `A1, A2` vs. `dp = 1` on `Bucket_B`.',
        ],
        codeBlock: {
          title: 'Exact Final Layouts (Part A Static vs. Part B Extendible MSB)',
          diagramId: 'm3-hashing-layouts',
          diagramCaption: 'FAT A1+TA1 Q5(a): Static Hashing Overflow Chain vs. MSB Extendible Hashing Directory (d = 2).',
        },
        commonPitfalls:
          'Biggest trap in A1 Q5(a): blindly applying LSB (suffix bits) when the prompt explicitly says **prefix 0 / prefix 1** (MSB). Always check whether the prompt says prefix (leftmost) or suffix/last bits (rightmost)! Also never split `Bucket_B` after `K5`—only `2` keys `[K2, K5]` are in `Bucket_B`, which equals capacity `c=2`.',
      },
    ],
    exampleTitle: 'Extendible Hashing Case 1 vs. Case 2 Decision Rule',
    exampleBody:
`When a bucket overflows (contains \`c + 1\` keys):

#### Case 1 — Local Depth \`d' == d\` (Global Depth)
1. **Double Directory:** Set \`d = d + 1\` and mirror existing pointers.
2. **Split Full Bucket:** Replace with 2 buckets, each having \`d' = d_new\`.
3. **Rehash Only That Bucket:** Redistribute those \`c + 1\` keys (unsplit buckets keep shared pointers).

#### Case 2 — Local Depth \`d' < d\` (Global Depth)
1. **Do NOT double directory!** Global depth \`d\` stays unchanged.
2. **Split Full Bucket Only:** Set \`d' = d' + 1\` on both split halves and reassign only its directory slots.`,
    examTip:
      'State both `d` (Global Depth) and `dp / d\'` (Local Depth) next to EVERY directory/bucket box when drawing Extendible Hashing diagrams—graders assign dedicated marks for tracking depths at every split.',
    selfChecks: [
      {
        question:
          'In Extendible Hashing with Global Depth d = 3, a bucket with Local Depth d\' = 2 overflows. What action does the DBMS take?',
        options: [
          'Double the directory to d = 4 and split every bucket in the file',
          'Do NOT double the directory; split only the overflowing bucket (new d\' = 3) and update the two directory pointers sharing it',
          'Attach a permanent overflow chain like Static Hashing',
          'Decrement global depth d to 2',
        ],
        correctIndex: 1,
        explanation:
          'When d\' < d, multiple directory slots already point to the overflowing bucket. Splitting that bucket gives its two halves distinct d\'+1 pointers within the existing 2^d directory with zero directory doubling.',
      },
      {
        question:
          'In Linear Hashing with N = 2, i = 0, and split pointer p = 1, bucket B0 (which already split earlier) receives a key. Which hash function determines its target bucket?',
        options: [
          'h0(k) = k mod 2 only',
          'h0(k) initially, and because 0 < p, re-hash using h1(k) = k mod 4',
          'Linear probing (h0(k) + p) mod 4',
          'Divide key by split pointer p',
        ],
        correctIndex: 1,
        explanation:
          'Whenever h_i(k) evaluates to a bucket index < p, that bucket has already been split in the current round, so Linear Hashing applies h_{i+1}(k) = k mod (2^{i+1} * N) to distinguish B_m from its split image.',
      },
    ],
  },

  'm3-t3': {
    summary:
      'Single-level and Multi-level ordered indexes reduce equality and range search times from linear scans to a handful of block I/Os. **B+ Trees** serve as the universal disk index for general databases, while **LSM Trees** convert random write amplification into sequential SSTable flushes for write-heavy engines.',
    sourceDecks: [
      'Module 3. Indexing.pptx (Slides 1–42)',
      'B+.docx (Formal Occupancy & Order Rules)',
      'BACSE202-DBS-Module-3_Complete.pptx (Slides 119–196)',
    ],
    keyPoints: [
      {
        heading: 'Primary vs. Clustering vs. Secondary Indexes (Sparse vs. Dense)',
        text: 'Index entry = `<search_key, pointer>`. **Primary Index** (ordered key field -> Sparse: 1 anchor per block). **Clustering Index** (ordered non-key field -> Sparse: 1 entry per distinct value). **Secondary Index** (unordered field -> **Dense**: 1 entry per record; `bfr_i = floor(B / (V + P))`).',
      },
      {
        heading: 'B+ Tree Occupancy Rules (`B+.docx` & `Indexing.pptx`, Order `m`)',
        text: 'Order `m` = max child pointers. Both internal and leaf nodes hold **at most `m - 1` keys**. Non-root internal nodes hold at least `ceil(m/2)` children (`ceil(m/2) - 1` keys); non-root leaves hold at least `ceil((m-1)/2)` keys (for `m = 3`: **min 1 key, max 2 keys**; for `m = 4`: **leaf min 2, internal min 1, max 3**).',
      },
      {
        heading: 'LSM Trees (O’Neil 1996) & Compaction Policies',
        text: 'Writes append sequentially to disk **WAL** and sorted RAM **MemTable** (Red-Black/SkipList), freeze as **Immutable MemTable**, and flush to immutable **SSTables**. Reads scan newest-to-oldest using **Bloom Filters** (fast negative checks; zero false negatives) and handle deletes via **Tombstone** markers; merged via **STCS** or **LCS** compaction.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Single-Level & Multi-Level Index Formulas (Elmasri Ch. 17)',
        body: 'Given file parameters `r` records, record size `R`, block size `B`, key size `V`, block pointer `P` (`R_i = V + P`), index blocking factor is `bfr_i = floor(B / (V + P))` (often called **fan-out `fo`**):',
        table: {
          headers: ['Index Type', 'Data Ordering', 'Density', '1st-Level Entries (`r1`)', '1st-Level Blocks (`b1`)'],
          rows: [
            [
              'Primary (Sparse)',
              'Ordered on Key field',
              'Sparse (1 per block)',
              'r1 = b (data blocks)',
              'b1 = ceil(b / bfr_i)',
            ],
            [
              'Primary (Dense) / Secondary',
              'Unordered (or Dense)',
              'Dense (1 per record)',
              'r1 = r (total records)',
              'b1 = ceil(r / bfr_i)',
            ],
            [
              'Clustering',
              'Ordered on Non-key',
              'Sparse (1 per distinct key)',
              'r1 = # distinct field values',
              'b1 = ceil(r1 / bfr_i)',
            ],
            [
              'Multi-Level (Level k > 1)',
              'Sparse over Level k-1',
              'Always Sparse above Level 1',
              'rk = b_{k-1}',
              'bk = ceil(b_{k-1} / bfr_i) until 1 root block',
            ],
          ],
        },
        bullets: [
          '**Multi-Level Access Count:** With `t` index levels ending in 1 root block, locating a record takes `t + 1` block accesses (`1` per index level + `1` data file block). If the top level still has `b_top > 1` blocks (e.g., 2 blocks), binary search on the top level takes `ceil(log2 b_top)` accesses + `(t - 1)` lower index accesses + `1` data block access.',
        ],
      },
      {
        title: '2. B+ Tree Structure, Split & 3 Deletion Cases (Lecture Slides 31–36 & `B+.docx`)',
        body: 'Unlike B-Trees (which store data pointers in internal nodes too), **B+ Trees** keep all data record pointers exclusively in doubly-linked **leaf nodes** (boosting internal fan-out and enabling fast range scans):',
        diagramId: 'm3-bplus-split-rules',
        diagramCaption: 'Order m = 3 B+ Tree leaf (COPY middle key up) vs. internal node (MOVE middle key up) split rules.',
        markdownBlock:
`#### Slide Classification of B+ Tree Deletion Cases (\`Module 3. Indexing.pptx\`, Slides 31–36)
| Deletion Sub-Case | Where Key Appears | Exact Resolution Procedure |
| :--- | :--- | :--- |
| **Case I(1)** | **Leaf ONLY** (\`> min\` keys) | Simply delete the key from the leaf; no parent or sibling update needed. |
| **Case I(2)** | **Leaf ONLY** (exact \`min\` keys) | Delete key, **borrow** a key from an immediate sibling with \`> min\` keys, and update the parent separator between them (or **merge** if siblings also have \`min\`). |
| **Case II(1)** | **Leaf AND Internal** (\`> min\` keys) | Delete from leaf and replace the key in the internal node with its **inorder successor** (smallest remaining key in the right leaf). |
| **Case II(2)** | **Leaf AND Internal** (exact \`min\`, sibling lends) | Delete from leaf, borrow from immediate sibling, and fill the internal node space with the borrowed/successor key. |
| **Case II(3)** | **Leaf AND Internal** (propagates up) | Merge underflowing leaf with sibling and update/fill grandparent separator with inorder successor. |
| **Case III** | **Root Collapse** (height shrinkage) | Merging two internal children pulls the last root separator down into a single combined node, **reducing tree height by 1**. |`,
      },
      {
        title: '3. Log-Structured Merge (LSM) Tree Write, Read & Compaction Architecture',
        body: 'Traditional B+ Trees perform random in-place disk updates on every write. **LSM Trees** (used in RocksDB, LevelDB, Cassandra, HBase) trade random writes for sequential appends:',
        diagramId: 'm3-lsm-architecture',
        diagramCaption: 'LSM Tree Write Path (WAL + MemTable -> SSTable flush) & Read Path (Bloom Filter skip).',
        bullets: [
          '**Updates & Deletes:** SSTables are immutable! Updates append a newer key-value timestamp; Deletes write a **Tombstone** marker so older SSTables are shadowed until **Compaction** physically purges them.',
          '**Compaction Strategies (Complete PPT Slides 185–193):** **Size-Tiered (STCS)** merges similarly sized SSTables (write-optimized; Cassandra default, up to 50% temp space overhead), **Leveled (LCS)** keeps non-overlapping key ranges per level `L0, L1=10x...` (read-optimized; RocksDB/LevelDB), **Universal**, and **FIFO** (time-series TTL drop).',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q6(a) & Q6(b) [7M + 3M = 10M, CO3]',
        questionPrompt:
          'Q6:\na) Construct a B+ tree of order 4 using the key values 24, 45, 11, 89, 55, 67, 49, 38, 7, 23, 12, 78, 97, 36, 21. Show the constructed B+ tree. [7 marks]\nb) Delete the key values 38, 12, and 89 from the constructed B+ tree. [3 marks]',
        solvingMethod: [
          'Occupancy Setup (`Order m = 4`): Maximum children per node = `4`; Maximum keys per node = `m − 1 = 3`; Minimum children (non-root) = `⌈4/2⌉ = 2`; Minimum keys per internal node = `⌈4/2⌉ − 1 = 1` (and `⌈(4-1)/2⌉ = 2` for leaves under right-biased split where 4 keys `[k1, k2, k3, k4]` split into `[k1, k2]` and `[k3, k4]`, **copying `k3` up** to the parent; when an internal node overflows with 4 keys `[k1, k2, k3, k4]`, **move `k3` (or `k2`) up** to the parent).',
          'Part (a) Step-by-Step Construction Trace (`15` Keys) [7M]:\n  1) **Insert `24, 45, 11`:** Single root leaf `[11, 24, 45]`.\n  2) **Insert `89` (Leaf Split #1):** `[11, 24, 45, 89]` splits into `[11, 24]` and `[45, 89]`; copy `45` up -> Root `[45]`.\n  3) **Insert `55`:** Goes to right leaf -> `[45, 55, 89]`.\n  4) **Insert `67` (Leaf Split #2):** `[45, 55, 67, 89]` splits into `[45, 55]` and `[67, 89]`; copy `67` up -> Root `[45, 67]`.\n  5) **Insert `49, 38`:** `49` fits in `[45, 49, 55]`; `38` fits in `[11, 24, 38]`.\n  6) **Insert `7` (Leaf Split #3):** `[7, 11, 24, 38]` splits into `[7, 11]` and `[24, 38]`; copy `24` up -> Root `[24, 45, 67]` with 4 leaves `[7, 11] -> [24, 38] -> [45, 49, 55] -> [67, 89]`.\n  7) **Insert `23`:** Fits in `[7, 11, 23]`.\n  8) **Insert `12` (Leaf Split #4 + Root Split!):** `[7, 11, 12, 23]` splits into `[7, 11]` and `[12, 23]`, copying `12` up to Root `[12, 24, 45, 67]`. Root overflows (4 keys) -> **Internal Split** moving `45` up as new Root `[45]` with Left Internal `[12, 24]` (leaves `[7, 11], [12, 23], [24, 38]`) and Right Internal `[67]` (leaves `[45, 49, 55], [67, 89]`).\n  9) **Insert `78, 97`:** `78` fits in `[67, 78, 89]`; `97` splits `[67, 78, 89, 97]` into `[67, 78]` and `[89, 97]`, copying `89` up -> Right Internal `[67, 89]`.\n  10) **Insert `36`:** Fits in `[24, 36, 38]`.\n  11) **Insert `21`:** Fits in `[12, 21, 23]`.\n  • **Final Constructed B+ Tree (Height = 3):**\n    - **Root:** `[45]`\n    - **Level 1 Internal Nodes:** Left = `[12, 24]` | Right = `[67, 89]`\n    - **Level 2 Linked Leaves (6 leaves):** `[7, 11] <-> [12, 21, 23] <-> [24, 36, 38] <-> [45, 49, 55] <-> [67, 78] <-> [89, 97]`.',
          'Part (b) Sequential Deletions (`Delete 38`, `Delete 12`, `Delete 89`) [3M]:\n  1) **Delete `38` (Case I-1 — Leaf-Only, `> min` keys):** `38` is in leaf `[24, 36, 38]` (3 keys) and NOT in any internal node -> simply remove `38`, leaving leaf **`[24, 36]`**.\n  2) **Delete `12` (Case II-1 — In Leaf & Internal Node, leaf has `> min` keys):** `12` is in leaf `[12, 21, 23]` (3 keys) AND in Left Internal `[12, 24]`. Remove `12` from the leaf -> **`[21, 23]`**, and replace `12` in Left Internal with its inorder successor **`21`** -> Left Internal becomes **`[21, 24]`**.\n  3) **Delete `89` (Case II-2/3 — In Leaf & Internal Node `[89, 97]`):** Removing `89` leaves `[97]` (1 key; under `min=2` leaves, merge with left sibling `[67, 78]` -> **`[67, 78, 97]`** and drop separator `89` from Right Internal leaving **`[67]`**; or under `min=1` key rule, keep leaf **`[97]`** and replace internal separator `89` with inorder successor **`97`** -> Right Internal `[67, 97]`). State both `min_leaf = 2` (merge to `[67, 78, 97]`, internal `[67]`) and `min_leaf = 1` (update separator to `97`, leaf `[97]`) for full marks!',
        ],
        codeBlock: {
          title: 'Final Constructed & Post-Deletion B+ Tree (Order 4) — Model QP Q6',
          language: 'markdown',
          content:
`#### Part (a) — Final B+ Tree After All 15 Insertions
- **Root:** \`[ 45 ]\`
- **Internal Level:** \`L_Int: [ 12 | 24 ]\`  ·  \`R_Int: [ 67 | 89 ]\`
- **Leaf Chain:** \`[7, 11] → [12, 21, 23] → [24, 36, 38] → [45, 49, 55] → [67, 78] → [89, 97]\`

#### Part (b) — State After Deleting \`38\`, \`12\`, and \`89\`
1. **After \`Delete 38\`:** Leaf \`[24, 36, 38]\` → \`[24, 36]\` *(Case I-1)*.
2. **After \`Delete 12\`:** Leaf \`[12, 21, 23]\` → \`[21, 23]\`; \`L_Int\` updates \`[12 | 24]\` → **\`[21 | 24]\`** *(Case II-1: inorder successor \`21\`)*.
3. **After \`Delete 89\`:** Leaf \`[89, 97]\` → merges with \`[67, 78]\` into **\`[67, 78, 97]\`** and \`R_Int\` becomes **\`[ 67 ]\`** *(or under \`min=1\`, leaf \`[97]\` and \`R_Int: [67 | 97]\`)*.`,
        },
        commonPitfalls:
          'Forgetting to update the internal node separator `12 -> 21` when deleting `12` in Q6(b)! Whenever a deleted key also appears in an internal node (Case II), you MUST replace that internal key with the new smallest key (inorder successor) of the right child.',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q4 [10M, CO2, BL3]',
        questionPrompt:
          'Q4: STUDENT has 16,000 records, R = 80 bytes, block size B = 1,000 bytes. Dense primary index has 4-byte key and 6-byte block pointer (10 bytes total), unspanned.\na) Calculate blocking factor & total data blocks for STUDENT. [2M]\nb) Calculate number of index blocks for 1st-level primary index and 2nd-level index. [3M]\nc) Calculate maximum block accesses required to locate a record using this multilevel index. [3M]\nd) Draw the multilevel index structure. [2M]',
        solvingMethod: [
          'Part (a) — Blocking Factor & Data Blocks [2M]: `bfr = floor(1000 / 80) = 12` records/block (unused = 40 B/block). Total data blocks `b = ceil(16,000 / 12) = ceil(1333.33) = 1,334` blocks.',
          'Part (b) — 1st-Level & 2nd-Level Index Blocks [3M]: Index entry size `Ri = 4 + 6 = 10` B -> index blocking factor `bfr_i = floor(1000 / 10) = 100` entries/block. Because the 1st-level index is explicitly **DENSE**, `r1 = 16,000` entries -> `b1 = ceil(16,000 / 100) = 160` blocks. The 2nd-level index is sparse (1 entry per 1st-level block -> `r2 = 160` entries) -> `b2 = ceil(160 / 100) = 2` blocks.',
          'Part (c) — Maximum Block Accesses [3M]: Using binary search on the 2-block 2nd-level index (`ceil(log2(2)) = 1` block read) + `1` read in 1st-level index + `1` read in `STUDENT` data file = **3 block accesses** (note: if scanning both top-level blocks sequentially or adding a 1-block 3rd-level root, worst case = `2 + 1 + 1 = 4` accesses — state both `3` via binary search on top level and `4` via linear scan/3rd level!).',
          'Part (d) — Diagram [2M]: Draw the 2-block 2nd-level index pointing down to the 160-block 1st-level dense index pointing down to the 1,334-block `STUDENT` data file.',
        ],
        codeBlock: {
          title: 'Multilevel Index Structure Diagram (Part d — A2 Q4)',
          diagramId: 'm3-multilevel-index',
          diagramCaption: 'FAT A2+TA2 Q4: 2nd-Level Sparse Index (2 blocks) -> 1st-Level Dense Index (160 blocks) -> STUDENT Data File (1,334 blocks).',
        },
        commonPitfalls:
          'Using sparse `r1 = 1,334` instead of dense `r1 = 16,000`! Read the prompt carefully: Q4 explicitly says **"Assume that the index is dense"**, so level 1 has 16,000 entries (160 blocks), NOT 14 blocks.',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q5(b) [10M, CO2, BL3]',
        questionPrompt:
          'Q5(b): Construct a B+ Tree of order m = 3 by inserting sequentially: [10, 20, 5, 15, 25, 30, 2]. After constructing the final B+ Tree, perform in sequence: Delete 5, Delete 20, Delete 15. Show step-by-step tree transformations for both insertion and deletion. [5+5M]',
        solvingMethod: [
          'Setup Rule (`m = 3`): Max keys = `m - 1 = 2`, Min keys = `ceil(3/2) - 1 = 1`. Leaf split `[a, b, c]` splits into `[a]` and `[b, c]` with **copy of `b` pushed up**. Internal split `[a, b, c]` moves **`b` up** leaving `[a]` and `[c]`.',
          'Phase 1 — Step-by-Step Insertions [5M]: Follow `[10]` -> `[10, 20]` -> `5` splits to `[10] -> [5], [10, 20]` -> `15` splits `[10, 20]` to `[10, 15] -> [5], [10], [15, 20]` -> `25` overflows right leaf & root! Root splits moving `15` up: Root `[15]` -> `[10] ([5],[10])` & `[20] ([15],[20,25])` -> `30` splits `[20, 25]` copying `25` up (`[20, 25]`) -> `2` inserts cleanly into `[2, 5]`.',
          'Phase 2 — Step-by-Step Deletions [5M]: (1) **Delete 5**: `[2, 5] -> [2]` (≥1 key, valid!). (2) **Delete 20**: leaf `[20]` underflows (`0` keys); right sibling `[25, 30]` has 2 keys -> **Borrow `25`** (leaf `[25]`, sibling `[30]`) and update parent `[20, 25]` to **`[25, 30]`**. (3) **Delete 15**: leaf `[15]` underflows (`0` keys); right sibling `[25]` has only 1 key -> **Merge** into `[25]`, drop separator `25` from parent leaving `[30]`, and update Root separator `15 -> 25` (Case II inorder successor) giving **Final Root `[25]`**.',
        ],
        codeBlock: {
          title: 'Exact B+ Tree (m = 3) Step Trace & Tree Diagrams — A1+TA1 Q5(b)',
          diagramId: 'm3-bplus-a1q5b',
          diagramCaption: 'FAT A1+TA1 Q5(b): B+ Tree (m = 3) after insertions [10,20,5,15,25,30,2] and final state after Deletions [5, 20, 15].',
          language: 'markdown',
          content:
`#### Phase 1 — Insertions \`[10, 20, 5, 15, 25, 30, 2]\`
1. **Ins 10, 20:** Single leaf \`[10, 20]\`.
2. **Ins 5 (Leaf Split):** \`[5, 10, 20]\` splits into \`[5]\` and \`[10, 20]\`; copy \`10\` up -> Root \`[10]\`.
3. **Ins 15 (Leaf Split):** \`[10, 15, 20]\` splits into \`[10]\` and \`[15, 20]\`; copy \`15\` up -> Root \`[10, 15]\`.
4. **Ins 25 (2-Level Split):** \`[15, 20, 25]\` copies \`20\` up -> Root \`[10, 15, 20]\` splits moving \`15\` up: Root \`[15]\` -> \`[10]\` (\`[5], [10]\`) & \`[20]\` (\`[15], [20, 25]\`).
5. **Ins 30 (Leaf Split):** \`[20, 25, 30]\` copies \`25\` up -> right internal \`[20, 25]\`, leaves \`[20]\`, \`[25, 30]\`.
6. **Ins 2 (Fit):** Inserts cleanly into leaf \`[2, 5]\`.

#### Phase 2 — Deletions \`[5, 20, 15]\`
7. **Delete 5:** Leaf \`[2, 5]\` becomes \`[2]\` (\`>= 1\` key — valid!).
8. **Delete 20:** Leaf \`[20]\` underflows -> **borrow \`25\`** from sibling \`[25, 30]\` -> leaves \`[25]\`, \`[30]\` and parent updates to \`[25, 30]\`.
9. **Delete 15:** Leaf \`[15]\` underflows -> **merge** into \`[25]\`, drop separator \`25\` from parent \`[25, 30]\` leaving \`[30]\`, and update Root \`15 -> 25\`. Final Root: \`[25]\` -> \`[10]([2],[10])\` & \`[30]([25],[30])\`.`,
        },
        commonPitfalls:
          'In Step 8 (`Delete 20`), do NOT update only one separator in `[20, 25]`—when borrowing `25` from `[25, 30]` to replace `[20]`, the two separators under that internal node become `25` (smallest of `[25]`) and `30` (smallest of `[30]`).',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q10(a) [10M, CO2, BL6]',
        questionPrompt:
          'Q10(a): Consider a B+ tree of order 3, where each internal node can have a maximum of 2 keys. Starting with an empty B+ tree, perform in sequence and draw whenever a split, redistribution, or merging occurs: Insert 10, Insert 20, Insert 5, Insert 15, Insert 25, Delete 10, Insert 30, Insert 35, Insert 40, Delete 20. [10M]',
        solvingMethod: [
          'Steps 1–4 — First 5 Insertions [3M]: Identical build through `25`: Root `[15]` -> `[10]` (`[5], [10]`) & `[20]` (`[15], [20, 25]`).',
          'Step 5 — Delete 10 (Leaf Merge + Internal Root Collapse!) [2M]: Deleting `10` empties `[10]`. Sibling `[5]` has 1 key -> merge to `[5]`, emptying internal node `[10]`. Right internal `[20]` also has only 1 key -> **merge internal nodes & pull root key `15` down** into single Root `[15, 20]` (height drops 3 -> 2) with leaves `[5], [15], [20, 25]`.',
          'Step 6 — Insert 30, 35, 40 (Two Splits back to Height 3!) [3M]: `30` overflows `[20,25]` & Root `[15,20,25]` -> Root `[20]` -> `[15]` & `[25]`. `35` expands right internal to `[25,30]`. `40` overflows `[30,35]` & `[25,30,35]` moving `30` up -> Root `[20,30]` -> `[15]`, `[25]`, `[35]` with leaves `[5], [15], [20], [25], [30], [35,40]`.',
          'Step 7 — Delete 20 (Leaf Merge + Internal Merge shrinking Root!) [2M]: `[20]` empties; merges with `[25]` -> `[25]`, emptying middle internal `[25]`. Merge empty internal with left `[15]` + pull root `20` down -> `[15, 20]` (`[5],[15],[25]`). Final Root `[30]` -> `[15, 20]` & `[35]`.',
        ],
        codeBlock: {
          title: 'Exact Interleaved B+ Tree (m = 3) Trace & Diagrams — A2+TA2 Q10(a)',
          diagramId: 'm3-bplus-a2q10a',
          diagramCaption: 'FAT A2+TA2 Q10(a): B+ Tree (m = 3) height shrink after Delete 10 and final state after Delete 20.',
          language: 'markdown',
          content:
`1. **After Ins 10, 20, 5, 15, 25:** Root \`[15]\` -> \`[10]([5], [10])\` | \`[20]([15], [20, 25])\`.
2. **Delete 10 (Leaf Merge + Height Shrink 3 -> 2):** Leaf \`[10]\` merges into \`[5]\`, emptying internal \`[10]\`; pull root \`15\` down into \`Root [15, 20]\` -> \`[5]\` | \`[15]\` | \`[20, 25]\`.
3. **Insert 30 (Height 2 -> 3):** Copies \`25\` up -> Root \`[15, 20, 25]\` splits moving \`20\` up -> \`Root [20]\` -> \`[15]([5], [15])\` | \`[25]([20], [25, 30])\`.
4. **Insert 35:** Splits \`[25, 30, 35]\` -> right internal \`[25, 30]\` over \`[20]\`, \`[25]\`, \`[30, 35]\`.
5. **Insert 40:** Splits \`[30, 35, 40]\` & pushes \`30\` up -> \`Root [20, 30]\` over \`[15]\`, \`[25]\`, \`[35]\`.
6. **Delete 20 (Leaf Merge + Internal Merge):** \`[20]\` merges with \`[25]\` -> \`[25]\`; empty internal pulls root \`20\` down into \`[15, 20]\`. **Final Root:** \`[30]\` -> \`L:[15, 20] ([5], [15], [25])\` | \`R:[35] ([30], [35, 40])\`.`,
        },
        commonPitfalls:
          'Forgetting the internal node merge / height shrink during `Delete 10`! Once `[10]` merges into `[5]`, the left internal parent has 0 keys—never leave an empty internal node dangling; pull the root separator `15` down into `[15, 20]`.',
      },
    ],
    exampleTitle: 'Bloom Filter Intuition in LSM Trees (Complete PPT Slides 175–183)',
    exampleBody:
`#### Search Key \`K = 109\` *(MemTable holds 150, 160, 170)*
1. **MemTable check:** \`109\` not found -> descend to disk SSTables newest-to-oldest.
2. **SSTable-3 Bloom Filter:** One hash bit is \`0\` -> **Definitely NOT present** *(0 Disk I/Os!)*.
3. **SSTable-2 Bloom Filter:** One hash bit is \`0\` -> **Skip!** *(0 Disk I/Os!)*.
4. **SSTable-1 Bloom Filter:** All hash bits are \`1\` -> Read \`SSTable-1\` block -> **FOUND 109!**`,
    examTip:
      'For B+ Trees, always state the order convention clearly at the top (`m = max pointers, max keys = m - 1, min keys = ceil(m/2) - 1`), and verify every leaf maintains a linked-list arrow.',
    selfChecks: [
      {
        question:
          'In an LSM Tree, why can a Bloom filter say "Definitely NOT in this SSTable" without ever returning a false negative?',
        options: [
          'Every key in the SSTable has already set its k hash bit positions to 1, so seeing any 0 bit proves the key was never inserted there',
          'Bloom filters store an exact sorted copy of every key inside L1 cache',
          'SSTables automatically delete cold keys after 10 seconds',
          'Tombstones reset false positive bits to zero',
        ],
        correctIndex: 0,
        explanation:
          'When inserting a key, all k hash positions are set to 1. A 0 bit at any hash position of search key K guarantees K cannot exist in that SSTable, though hash collisions from other keys can occasionally cause false positives.',
      },
      {
        question:
          'In a B+ Tree of order m = 3 (max 2 keys per node), what happens when a third key causes an INTERNAL node [a, b, c] to overflow?',
        options: [
          'Copy b up and retain b in the left internal node',
          'Move (push) middle key b up to the parent and leave [a] on the left and [c] on the right',
          'Convert the internal node into a leaf node',
          'Create an overflow bucket chain',
        ],
        correctIndex: 1,
        explanation:
          'Leaves COPY the split separator upward so all keys remain in the leaf level, whereas internal nodes MOVE the middle key upward without keeping a duplicate copy inside the split children.',
      },
    ],
  },

  'm3-t4': {
    summary:
      'Relational Algebra (RA) is a procedural query algebra over sets of tuples. Every SQL query compiles internally into an RA tree built from 6 fundamental operators (`σ, π, ∪, −, ×, ρ`), derived joins (`⋈, ⟕, ⟖, ⟗`), relational division (`÷`), and Extended RA grouping/aggregation (`γ` / `ℱ`).',
    sourceDecks: [
      'Module 3. Relational Algebra.pptx (Slides 1–48)',
      'Translating SQL queries to Relational Algebra.pptx (Slides 1–38)',
      'BACSE202-DBS-Module-3_Complete.pptx (Slides 197–245)',
    ],
    keyPoints: [
      {
        heading: 'Six Fundamental vs. Derived RA Operators',
        text: '**Fundamental:** Select `σ_p(R)` (filters rows), Project `π_L(R)` (picks columns & strips duplicates), Union `∪`, Set Difference `−`, Cartesian Product `×`, Rename `ρ`. **Derived:** Intersection `R ∩ S = R − (R − S)`, Equi/Theta/Natural Joins (`⋈`), Outer Joins (`⟕, ⟖, ⟗`), and Division (`÷`).',
      },
      {
        heading: 'Division (`R ÷ S`) for Universal ("EVERY / ALL") Queries',
        text: '`R(A, B) ÷ S(B)` returns every `A` paired with **ALL** values of `B` present in `S`. Algebraic identity: `π_A(R) − π_A( (π_A(R) × S) − R )` (subtract disqualified candidates!).',
      },
      {
        heading: '4-Step SQL-to-RA Compilation & Extended RA (`γ` / Generalized `π`)',
        text: 'Order of evaluation: (1) `FROM` tables (`×` or `⋈`), (2) `WHERE` predicates (`σ`), (3) `GROUP BY` + Aggregates via grouping operator `_{G}ℱ_{AGG(A)}(R)` (or `γ`) + `HAVING` (`σ` on aggregated output), (4) `SELECT` projection (`π`, supporting arithmetic expressions like `Salary * 12`).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Complete Relational Algebra Operator Reference',
        body: 'Master both syntax and SQL correspondence—especially never confusing SQL `SELECT` (column projection `π`) with RA **Select (`σ`)** (row filtering `WHERE`):',
        table: {
          headers: ['Operator', 'Notation', 'SQL Equivalent', 'Key Rule / Property'],
          rows: [
            [
              'Select (Unary)',
              'σ_{cond}(R)',
              'WHERE cond',
              'Commutative: σ_c1(σ_c2(R)) = σ_c2(σ_c1(R)); output schema = schema(R)',
            ],
            [
              'Project (Unary)',
              'π_{A1, A2}(R)',
              'SELECT DISTINCT A1, A2',
              'Set semantics: eliminates duplicate rows; NOT commutative unless inner set >= outer',
            ],
            [
              'Union / Intersect / Diff',
              'R ∪ S, R ∩ S, R − S',
              'UNION / INTERSECT / EXCEPT',
              'Requires Union Compatibility: same arity (degree) & matching column domains',
            ],
            [
              'Theta & Equi Join',
              'R ⋈_{cond} S',
              'FROM R JOIN S ON cond',
              'Equivalent to σ_{cond}(R × S)',
            ],
            [
              'Natural Join',
              'R ⋈ S',
              'NATURAL JOIN',
              'Equates all common-named attributes and drops duplicate join column',
            ],
            [
              'Outer Joins',
              'R ⟕ S, R ⟖ S, R ⟗ S',
              'LEFT / RIGHT / FULL OUTER JOIN',
              'Preserves unmatched tuples from left, right, or both relations padded with NULL',
            ],
            [
              'Aggregate & Grouping',
              '{G} ℱ_{COUNT(*), AVG(S)}(R)',
              'GROUP BY G + aggregates',
              'Executes AFTER WHERE (σ) and BEFORE HAVING (outer σ)',
            ],
          ],
        },
      },
      {
        title: '2. Division (`÷`) & Left/Right/Full Outer Join Worked Example',
        body: 'From `Translating SQL queries to Relational Algebra.pptx`: notice how Division picks exact universal matches and Outer Joins preserve NULL-padded orphans:',
        markdownBlock:
`#### 1. Relational Division (\`StudentCourse ÷ Required\`)
- **\`StudentCourse(SID, Course)\`:** \`{(10, DBMS), (10, CN), (10, OS), (20, DBMS), (20, CN), (30, DBMS)}\`
- **\`Required(Course)\`:** \`{(DBMS), (CN)}\`
- **Result \`R ÷ S\`:** **\`{(10), (20)}\`** *(Student \`30\` dropped because \`CN\` is missing!)*

#### 2. Outer Join Contrast (\`E = {(1, D1), (2, D9)}\`, \`D = {(D1, CS), (D2, AI)}\`)
| Join Operation | Notation | Output Tuples |
| :--- | :--- | :--- |
| Inner Natural Join | \`E ⋈ D\` | \`{(1, D1, CS)}\` |
| Left Outer Join | \`E ⟕ D\` | \`{(1, D1, CS), (2, D9, NULL)}\` |
| Right Outer Join | \`E ⟖ D\` | \`{(1, D1, CS), (NULL, D2, AI)}\` |
| Full Outer Join | \`E ⟗ D\` | \`{(1, D1, CS), (2, D9, NULL), (NULL, D2, AI)}\` |`,
      },
      {
        title: '3. SQL-to-RA 4-Step Translation Pattern (Including `GROUP BY / HAVING`)',
        body: 'Follow this rigid inside-out recipe whenever converting an SQL query to Relational Algebra before building a Query Tree:',
        bullets: [
          '**Step 1 (`FROM`):** Combine all tables with Cartesian Product `×` or explicit `⋈_{join_cond}`.',
          '**Step 2 (`WHERE`):** Wrap with `σ_{where_conditions}` (must happen *before* grouping!).',
          '**Step 3 (`GROUP BY` & `HAVING`):** Apply `_{group_cols}ℱ_{agg_fn(col)}` (or `γ_{group_cols, agg}`) followed by an outer `σ_{having_cond}`.',
          '**Step 4 (`SELECT`):** Wrap the final result in `π_{output_cols}` (or renamed columns using `ρ` / `AS`).',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q8(i)–(v) [5 × 2M = 10M, CO3]',
        questionPrompt:
          'Q8: Consider the following relational database schema and write Relational Algebra expressions for (i)–(v):\n• Projects(Proj_Id, Proj_Name, Address)\n• Products(Prod_Id, Prod_Name, Price)\n• Suppliers(S_Id, S_Name, Address, Credit)\n• Deliveries(Prod_Id, S_Id, Proj_Id, Quantity)\ni) Retrieve the project names that are residing in Mumbai.\nii) Find the names of products whose price does not exceed Rs. 1000.\niii) List the supplier names and their credit status for suppliers located in Delhi.\niv) Retrieve the product IDs and project IDs where the delivered quantity is more than 50 units.\nv) Find the names of suppliers who have delivered products to projects located in Chennai. [10M]',
        solvingMethod: [
          'Query (i) — Project names residing in Mumbai [2M]: Filter `Projects` on `Address = \'Mumbai\'` and project `Proj_Name`: **`π_{Proj_Name}(σ_{Address = \'Mumbai\'}(Projects))`**.',
          'Query (ii) — Names of products with price <= Rs. 1000 [2M]: Filter `Products` on `Price <= 1000` ("does not exceed") and project `Prod_Name`: **`π_{Prod_Name}(σ_{Price <= 1000}(Products))`**.',
          'Query (iii) — Supplier names and credit status in Delhi [2M]: Filter `Suppliers` on `Address = \'Delhi\'` and project `S_Name, Credit`: **`π_{S_Name, Credit}(σ_{Address = \'Delhi\'}(Suppliers))`**.',
          'Query (iv) — Product IDs and Project IDs with delivered quantity > 50 [2M]: Filter `Deliveries` on `Quantity > 50` and project `Prod_Id, Proj_Id`: **`π_{Prod_Id, Proj_Id}(σ_{Quantity > 50}(Deliveries))`**.',
          'Query (v) — Names of suppliers who delivered products to projects in Chennai [2M]: Note that BOTH `Suppliers` and `Projects` contain an attribute named `Address`! Filter `Projects` on `Address = \'Chennai\'` first, then project only `(Proj_Id)` before joining with `Deliveries` and `Suppliers` (or rename aliases) so `Natural Join (⋈)` does NOT accidentally equate `Suppliers.Address = Projects.Address`: **`π_{S_Name}(Suppliers ⋈ Deliveries ⋈ π_{Proj_Id}(σ_{Address = \'Chennai\'}(Projects)))`**.',
        ],
        codeBlock: {
          title: 'Complete Relational Algebra Solutions — Official Model QP Q8(i)–(v)',
          language: 'markdown',
          content:
`| Sub-Question | Exact Relational Algebra Expression |
| :--- | :--- |
| **(i) Mumbai project names** | \`π_{Proj_Name}(σ_{Address = 'Mumbai'}(Projects))\` |
| **(ii) Products price ≤ 1000** | \`π_{Prod_Name}(σ_{Price <= 1000}(Products))\` |
| **(iii) Delhi suppliers & credit** | \`π_{S_Name, Credit}(σ_{Address = 'Delhi'}(Suppliers))\` |
| **(iv) Deliveries qty > 50** | \`π_{Prod_Id, Proj_Id}(σ_{Quantity > 50}(Deliveries))\` |
| **(v) Suppliers delivering to Chennai projects** | \`π_{S_Name}(Suppliers ⋈ Deliveries ⋈ π_{Proj_Id}(σ_{Address = 'Chennai'}(Projects)))\` |`,
        },
        commonPitfalls:
          'In Q8(v), BOTH `Suppliers` and `Projects` have an attribute named `Address`! Writing `Suppliers ⋈ Deliveries ⋈ σ_{Address=\'Chennai\'}(Projects)` as a bare Natural Join would equate `Suppliers.Address = Projects.Address` (requiring the supplier itself to also sit in Chennai!). Always project `π_{Proj_Id}(σ_{Address=\'Chennai\'}(Projects))` or use explicit Theta-Join `S.S_Id = D.S_Id ∧ D.Proj_Id = P.Proj_Id`!',
      },
      {
        sourcePaper: 'Exam Practice Drill · Grouping (γ) & Self-Join (ρ) on Suppliers/Deliveries [CO2, BL4]',
        questionPrompt:
          'Advanced Schema Variant: Projects(projNbr, name, city), Products(prodNbr, name, color), Suppliers(supplNbr, name, city), Deliveries(supplNbr, prodNbr, projNbr, number).\nWrite RA expressions for: (a) Projects in a city having the MAXIMUM number of projects; (b) All pairs of distinct product numbers delivered by the same supplier.',
        solvingMethod: [
          'Part (a) — City with maximum number of projects: Count projects per city via `CityCnt(city, cnt) ← _{city}γ_{COUNT(projNbr) → cnt}(Projects)`, find the max count via `MaxC(m) ← γ_{MAX(cnt) → m}(CityCnt)`, and join back with `Projects`: **`π_{projNbr, name, city}(Projects ⋈ (CityCnt ⋈_{cnt = m} MaxC))`**.',
          'Part (b) — Product pairs delivered by the same supplier: Alias two copies of `Deliveries` using Rename (`ρ_{D1}` and `ρ_{D2}`), equate `D1.supplNbr = D2.supplNbr` with `D1.prodNbr < D2.prodNbr` (excludes self-pairs `(p, p)` and duplicate reversals `(p2, p1)`): **`π_{D1.prodNbr, D2.prodNbr}(σ_{D1.supplNbr = D2.supplNbr ∧ D1.prodNbr < D2.prodNbr}(ρ_{D1}(Deliveries) × ρ_{D2}(Deliveries)))`**.',
        ],
        codeBlock: {
          title: 'Step-by-Step Extended RA & Self-Join Solutions',
          language: 'markdown',
          content:
`1. **Step 1 (City Count):** \`CityCnt ← _{city}γ_{COUNT(projNbr) → cnt}(Projects)\`
2. **Step 2 (Global Max):** \`MaxC ← γ_{MAX(cnt) → m}(CityCnt)\`
3. **Part (a) Answer:** \`π_{projNbr, name, city}(Projects ⋈ (CityCnt ⋈_{cnt = m} MaxC))\`
4. **Part (b) Self-Join Answer:** \`π_{D1.prodNbr, D2.prodNbr}(σ_{D1.supplNbr = D2.supplNbr ∧ D1.prodNbr < D2.prodNbr}(ρ_{D1}(Deliveries) × ρ_{D2}(Deliveries)))\``,
        },
        commonPitfalls:
          'Forgetting `D1.prodNbr < D2.prodNbr` in a self-join, which pairs every product with itself `(p, p)` and duplicates unordered pairs `(p1, p2)` and `(p2, p1)`.',
      },
      {
        sourcePaper: 'Prerequisite Core · SQL to RA Translation (Supports A1 Q6 & A2 Q10b) [CO2, BL3]',
        questionPrompt:
          'Exam Pattern: Convert a multi-table SQL query with WHERE, GROUP BY, HAVING, and aggregates (or "every/all" division) into an exact Relational Algebra expression.',
        solvingMethod: [
          'Step 1 — Read Bottom-Up (FROM -> WHERE -> GROUP BY -> HAVING -> SELECT): Never start translating from `SELECT`! Build the inner table expression from `FROM` first.',
          'Step 2 — Convert `JOIN / WHERE` Predicates: Apply single-table filters via `σ`, and combine tables with `⋈_{equi_cond}` (or `×` before `σ` if writing an unoptimized canonical expression).',
          'Step 3 — Handle `GROUP BY` & `HAVING`: Place `_{G}ℱ_{SUM(Amt) AS Total}` directly outside `σ_{WHERE}` and wrap `σ_{Total > X}` around `ℱ` for `HAVING`.',
          'Step 4 — Check "ALL" / Correlated `NOT EXISTS`: If SQL asks for "students who passed ALL core courses", translate immediately into Division `(StudentPassed ÷ CoreCourses)` or Set Difference.',
        ],
        codeBlock: {
          title: 'Professor’s SQL-to-RA Worked Translation (GROUP BY + HAVING + JOIN)',
          language: 'markdown',
          content:
`\`\`\`sql
SELECT D.Dept_Name, COUNT(S.Student_ID) AS Total
FROM STUDENT S JOIN DEPARTMENT D ON S.Dept_ID = D.Dept_ID
WHERE S.CGPA >= 8.0
GROUP BY D.Dept_Name
HAVING COUNT(S.Student_ID) > 5;
\`\`\`

> **Exact Relational Algebra (Inside -> Out):**
> \`π_{D.Dept_Name, Total}( σ_{Total > 5}( _{D.Dept_Name}ℱ_{COUNT(S.Student_ID) AS Total}( (σ_{S.CGPA >= 8.0}(STUDENT S)) ⋈_{S.Dept_ID = D.Dept_ID} D ) ) )\``,
        },
        commonPitfalls:
          'Placing `HAVING` inside `ℱ` or `WHERE` outside `ℱ`! Remember: `WHERE` always sits *below* `ℱ` (filters individual rows), while `HAVING` always sits *above* `ℱ` (filters computed groups).',
      },
    ],
    exampleTitle: 'Generalized Projection & Division Identity (SQL-to-RA PPT)',
    exampleBody:
`> **Generalized Projection (Extended RA):**
> \`π_{Emp_ID, Name, Salary * 12 AS Annual_Pay}( σ_{Dept='CS'}(EMPLOYEE) )\`

> **Division via 5 Fundamental Operators:**
> \`R(A, B) ÷ S(B)  ≡  π_A(R) − π_A( (π_A(R) × S) − R )\``,
    examTip:
      'State whether duplicate rows are dropped (`π` removes duplicates under set semantics, whereas SQL `SELECT` preserves them unless `DISTINCT` is used).',
    selfChecks: [
      {
        question:
          'Which Relational Algebra operator sequence evaluates SQL WHERE, GROUP BY, HAVING, and SELECT in the semantically correct order (innermost to outermost)?',
        options: [
          'π -> σ_HAVING -> ℱ -> σ_WHERE -> FROM',
          'σ_HAVING( ℱ( σ_WHERE( FROM ) ) ) wrapped by outer π',
          'π( σ_WHERE( ℱ( σ_HAVING( FROM ) ) ) )',
          'ℱ( π( σ_WHERE( σ_HAVING( FROM ) ) ) )',
        ],
        correctIndex: 1,
        explanation:
          'Execution flows inside-out: FROM tables -> WHERE (σ_WHERE filters rows) -> GROUP BY + aggregates (ℱ builds groups) -> HAVING (σ_HAVING filters groups) -> SELECT (outer π projects columns).',
      },
      {
        question:
          'Relation ENROLLED(Sid, Cid) has {(1,C1), (1,C2), (2,C1)} and CORE(Cid) has {(C1), (C2)}. What does ENROLLED ÷ CORE return?',
        options: [
          '{(1), (2)}',
          '{(1)}',
          '{(2)}',
          '{(1, C1), (1, C2)}',
        ],
        correctIndex: 1,
        explanation:
          'Division finds Sid values paired with EVERY Cid in CORE. Student 1 took both C1 and C2, whereas Student 2 is missing C2, so only {(1)} is returned.',
      },
    ],
  },

  'm3-t5': {
    summary:
      'Tuple Relational Calculus (TRC) is a non-procedural, declarative query language of the form `{ t | P(t) }` that specifies **what** properties result tuples satisfy rather than **how** to compute them. Mastering free vs. bound tuple variables, `∃` / `∀` quantifiers, and **Safety** ensures valid finite expressions.',
    sourceDecks: [
      'Module 3. Relational Algebra.pptx (Slides 36–48)',
      'BACSE202-DBS-Module-3_Complete.pptx (Slides 246–260)',
    ],
    keyPoints: [
      {
        heading: 'Procedural (RA) vs. Declarative (TRC / DRC)',
        text: '**Relational Algebra** prescribes an exact operator order (`σ, π, ⋈`), serving as the DBMS execution plan. **Tuple Relational Calculus (TRC)** (`{ t | P(t) }`) lets tuple variable `t` range over tuples without specifying execution order; **Domain Relational Calculus (DRC)** (`{ <x1, x2> | P(x1, x2) }`) ranges over scalar domain values.',
      },
      {
        heading: 'Free vs. Bound Variables & Quantifiers (`∃`, `∀`)',
        text: 'The output variable to the left of `|` is **free**. Variables quantified by `(∃ s)` ("there exists a tuple `s`") or `(∀ s)` ("for every tuple `s`") are **bound**. Universal queries ("works on ALL projects") convert `(∀ x)(R(x) → Q(x))` via `¬(∃ x)(R(x) ∧ ¬Q(x))`.',
      },
      {
        heading: 'Safety of Relational Calculus Expressions',
        text: 'A TRC expression `{ t | P(t) }` is **safe** iff every returned tuple comes strictly from values appearing in `P(t)` or existing database relations. Unbounded negation like `{ t | ¬EMPLOYEE(t) }` is **unsafe** because it produces an infinite set of non-employee tuples.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. TRC Syntax, Atoms & Safe Formula Rules',
        body: 'Every well-formed TRC query `{ t.A1, t.A2 | P(t) }` builds predicate `P(t)` out of atomic formulas and Boolean connectives (`∧, ∨, ¬, →`):',
        bullets: [
          '**Range Atom:** `REL(t)` asserts that tuple variable `t` is an existing tuple in relation `REL` (anchors `t` to a finite domain!).',
          '**Join / Comparison Atom:** `t.Attr1 = s.Attr2` or `t.Salary > 50000` (must compare attributes of compatible types).',
          '**Projection in TRC:** Writing `{ e.Name, e.Salary | EMPLOYEE(e) ∧ e.Dno = 5 }` returns only `Name` and `Salary` (equivalent to `π_{Name, Salary}(σ_{Dno=5}(EMPLOYEE))`).',
          '**Why Negation Needs Anchoring:** Never write `{ e | ¬WORKS_ON(e) }`. Always anchor `e` first: `{ e.Name | EMPLOYEE(e) ∧ ¬(∃ w)(WORKS_ON(w) ∧ w.Essn = e.Ssn) }` ("employees who work on NO projects").',
        ],
      },
      {
        title: '2. RA vs. TRC vs. DRC Side-by-Side Comparison',
        body: 'Know how identical queries express across all three formal query languages:',
        table: {
          headers: ['Query Goal', 'Relational Algebra (Procedural)', 'Tuple Relational Calculus (TRC)', 'Domain Relational Calculus (DRC)'],
          rows: [
            [
              'Names of CS students with CGPA > 8',
              'π_{Name}(σ_{Dept=\'CS\' ∧ CGPA>8}(STUDENT))',
              '{ s.Name | STUDENT(s) ∧ s.Dept=\'CS\' ∧ s.CGPA > 8 }',
              '{ <n> | ∃id,g (STUDENT(id, n, \'CS\', g) ∧ g > 8) }',
            ],
            [
              'Names of students in Dept located in \'Block-A\' (Join)',
              'π_{S.Name}(STUDENT S ⋈_{S.Did=D.Did} σ_{Loc=\'Block-A\'}(DEPT D))',
              '{ s.Name | STUDENT(s) ∧ (∃d)(DEPT(d) ∧ d.Did = s.Did ∧ d.Loc = \'Block-A\') }',
              '{ <n> | ∃id,did,g,dn (STUDENT(id,n,did,g) ∧ DEPT(did,dn,\'Block-A\')) }',
            ],
            [
              'Students NOT in any club (Negation)',
              'π_{Sid}(STUDENT) − π_{Sid}(MEMBER)',
              '{ s.Sid | STUDENT(s) ∧ ¬(∃m)(MEMBER(m) ∧ m.Sid = s.Sid) }',
              '{ <id> | ∃n,d,g (STUDENT(id,n,d,g) ∧ ¬∃c MEMBER(id,c)) }',
            ],
          ],
        },
      },
      {
        title: '3. Mastering Universal Quantification (`∀`) Without Making Domain Mistakes',
        body: 'The most tested TRC pitfall is writing `(∀ p)(PROJECT(p) ∧ ...)` instead of implication `→`! Writing `∀p (PROJECT(p) ∧ condition)` asserts that *every tuple in the universe is a PROJECT* (FALSE!). Always write implication `→` or double-negated `∃`:',
        markdownBlock:
`#### Goal: Names of employees working on **ALL** projects controlled by Dept 5
> **Form 1 — Safe Universal Implication (\`→\`):**
> \`{ e.Name | EMPLOYEE(e) ∧ (∀p)( (PROJECT(p) ∧ p.Dnum = 5) → (∃w)(WORKS_ON(w) ∧ w.Essn = e.Ssn ∧ w.Pno = p.Pnumber) ) }\`

> **Form 2 — Equivalent Double-Negation (SQL \`NOT EXISTS\`):**
> \`{ e.Name | EMPLOYEE(e) ∧ ¬(∃p)( PROJECT(p) ∧ p.Dnum = 5 ∧ ¬(∃w)(WORKS_ON(w) ∧ w.Essn = e.Ssn ∧ w.Pno = p.Pnumber) ) }\``,
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Exam Pattern Method · Converting English / SQL to Safe TRC Queries [CO2, BL3]',
        questionPrompt:
          'Typical Exam Question: Express multi-table joins, "not in any", and "all / every" queries in Tuple Relational Calculus (TRC) and justify expression safety.',
        solvingMethod: [
          'Step 1 — Anchor Free Variable: Place `{ t.Attr | REL(t) ∧ ... }` so `t` is bound to a finite database relation (proving **Safety**).',
          'Step 2 — Add Existential Joins (`∃`): For every additional table needed in `FROM`, introduce `(∃ s)( REL2(s) ∧ s.FK = t.PK ∧ ... )`.',
          'Step 3 — Handle "NONE / NOT IN": Use `¬(∃ m)( REL3(m) ∧ m.Key = t.Key )`—never negate `REL3(m)` outside an anchored relation!',
          'Step 4 — Handle "ALL / EVERY": Use `(∀ p)( (REL_P(p) ∧ filter) → (∃ w)(LINK(w) ∧ w.K1 = t.K1 ∧ w.K2 = p.K2) )` (always `→`, NEVER `∧` after `∀p`!).',
        ],
        codeBlock: {
          title: 'TRC Example: Customers with NO Orders vs. Customers Who Bought ALL Electronics',
          language: 'markdown',
          content:
`#### 1. Customers with NO orders *(Safe Negation)*
> \`{ c.Name | CUSTOMER(c) ∧ ¬(∃o)( ORDERS(o) ∧ o.Cust_ID = c.Cust_ID ) }\`

#### 2. Customers who ordered EVERY \`Electronics\` product *(Safe \`∀\`)*
> \`{ c.Name | CUSTOMER(c) ∧ (∀p)( (PRODUCT(p) ∧ p.Category = 'Electronics') → (∃o)( ORDERS(o) ∧ o.Cust_ID = c.Cust_ID ∧ o.Product_ID = p.Product_ID ) ) }\``,
        },
        commonPitfalls:
          'Writing `(∀p)(PRODUCT(p) ∧ p.Category=\'Electronics\' ∧ ...)` instead of `→`! Because `∀` ranges over the entire infinite domain, `∀p (PRODUCT(p) ∧ ...)` evaluates to FALSE whenever even one non-product tuple exists in another table.',
      },
    ],
    exampleTitle: 'Codd’s Completeness Theorem (RA ≡ Safe TRC ≡ Safe DRC)',
    exampleBody:
`> **Codd's Theorem:** Relational Algebra, Safe TRC, and Safe DRC share **IDENTICAL expressive power**.

- **Unsafeness Trap:** \`{ t | ¬STUDENT(t) }\` yields infinitely many non-student tuples -> **UNSAFE**.
- **Safety Fix:** Always anchor every free tuple variable with a positive range predicate \`REL(t)\`.`,
    examTip:
      'Whenever asked for a "Non-Procedural" relational query expression or how SQL `WHERE NOT EXISTS` works formally, cite **Tuple Relational Calculus (TRC)** and explicitly write positive `REL(t)` anchoring for safety.',
    selfChecks: [
      {
        question:
          'Why is the Tuple Relational Calculus expression { t | ¬EMPLOYEE(t) } classified as UNSAFE?',
        options: [
          'It omits a projection attribute list on the left of |',
          'It matches infinitely many tuples outside the EMPLOYEE relation',
          'TRC forbids using the negation symbol ¬ anywhere in a formula',
          'It uses a bound variable instead of a free variable',
        ],
        correctIndex: 1,
        explanation:
          'The complement of EMPLOYEE contains infinitely many arbitrary tuples not stored in the database, violating safety (a safe TRC query must always yield a finite subset of domain values).',
      },
      {
        question:
          'Which TRC connective MUST link the domain guard (∀p)(PROJECT(p) ...) to the matching condition inside a universal ("ALL") query?',
        options: [
          'Conjunction (∧)',
          'Implication (→)',
          'Set Difference (−)',
          'Cartesian Product (×)',
        ],
        correctIndex: 1,
        explanation:
          'Because ∀p tests every tuple p, writing PROJECT(p) → condition means "for every p, IF p is a project THEN condition holds", whereas PROJECT(p) ∧ condition is false for any tuple that is not a project.',
      },
    ],
  },

  'm3-t6': {
    summary:
      'Query processing turns declarative SQL into a fast physical execution plan across parsing, optimization, and evaluation. **Heuristic Query Optimization** transforms an unoptimized **Canonical Query Tree** step-by-step using algebraic equivalences to shrink intermediate tuple counts and disk I/Os by orders of magnitude.',
    sourceDecks: [
      'BACSE202-DBS-Module-3_Complete.pptx (Slides 246–285: Query Processing, Stafford & Aquarius Trees)',
    ],
    keyPoints: [
      {
        heading: 'Three Stages of Query Processing',
        text: '1) **Parsing & Translation** checks syntax/catalog, decomposes nested SQL into **query blocks**, and builds an initial RA **Query Tree**. 2) **Optimization** applies algebraic heuristics + cost estimation (indexes, selectivity, histograms) to pick the cheapest **Execution Plan**. 3) **Evaluation** executes physical iterator pipelines.',
      },
      {
        heading: 'Canonical Query Tree vs. Query Graph',
        text: 'In a **Query Tree**, leaves are base tables (`CUSTOMER`, `ORDERS`), internal nodes are RA operators (`×, ⋈, σ, π`), and execution flows **bottom-up**. A **Canonical Query Tree** puts all tables into bottom `×` Cartesian products, a single giant `σ` above, and final `π` at the root.',
      },
      {
        heading: 'Five Golden Heuristic Optimization Steps (Elmasri Ch. 19 / Lecture Slide 268)',
        text: '1) **Cascade/Break `σ`** (`σ_{c1∧c2}(R) ≡ σ_{c1}(σ_{c2}(R))`). 2) **Push `σ` down** as close to base-table leaves as possible. 3) **Reorder leaves / joins** so the most restrictive `σ` (smallest intermediate size) executes first. 4) **Replace `×` + `σ_{join}` with Join (`⋈`)**. 5) **Push `π` down** (retain only final output + parent join attributes!).',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Relational Algebra Equivalence Rules Underlying Optimization',
        body: 'Heuristic optimizers only rewrite trees when **algebraic equivalence** guarantees identical output rows:',
        table: {
          headers: ['Equivalence Rule', 'Algebraic Identity', 'Optimization Impact'],
          rows: [
            [
              '1. Cascade of Selection (σ)',
              'σ_{c1 ∧ c2}(R) ≡ σ_{c1}(σ_{c2}(R))',
              'Splits a multi-predicate WHERE clause so single-table predicates can travel independently',
            ],
            [
              '2. Commutativity of σ & Join',
              'σ_{c1}(σ_{c2}(R)) ≡ σ_{c2}(σ_{c1}(R));   R ⋈ S ≡ S ⋈ R',
              'Lets optimizer place the cheapest/smallest filtered relation on the outer/left join input',
            ],
            [
              '3. Push σ past Join / ×',
              'σ_{c}(R × S) ≡ (σ_{c}(R)) × S   (when c uses only R attrs)',
              'Shrinks R BEFORE multiplying or joining with S (biggest intermediate-size reduction!)',
            ],
            [
              '4. Combine × + σ into ⋈',
              'σ_{R.A = S.A}(R × S) ≡ R ⋈_{R.A = S.A} S',
              'Avoids huge Cartesian products by using Hash Join, Sort-Merge Join, or Index Nested-Loop Join',
            ],
            [
              '5. Push Project (π) down',
              'π_L(R ⋈_c S) ≡ π_L( π_{L_R}(R) ⋈_c π_{L_S}(S) )',
              'Discards unused wide columns early (`L_R` = `L ∩ R ∪ join_attrs(c)`), fitting more rows per buffer page!',
            ],
          ],
        },
      },
      {
        title: '2. Lecture Benchmark: Aquarius Project Heuristic Transformation (Slide 268)',
        body: 'Notice how **both** Nov 2026 FAT papers (`A1 Q6` and `A2 Q10b`) follow the exact 3-table structure of Prof. Swaminathan’s **Aquarius** problem:',
        markdownBlock:
`\`\`\`sql
SELECT LNAME
FROM EMPLOYEE, WORKS_ON, PROJECT
WHERE PNAME = 'AQUARIUS' AND PNUMBER = PNO
  AND ESSN = SSN AND BDATE > '1957-12-31';
\`\`\`

1. **Step 0 — Canonical Tree:** \`π_{LNAME}( σ_{4 AND conditions}( (EMPLOYEE × WORKS_ON) × PROJECT ) )\`
2. **Steps 1–2 — Cascade & Push \`σ\` Down:** Isolate \`σ_{BDATE>'1957-12-31'}(EMPLOYEE)\` and \`σ_{PNAME='AQUARIUS'}(PROJECT)\` at base leaves.
3. **Step 3 — Reorder Most Restrictive Leaf First:** Place \`PROJECT\` (*1 matching row!*) on the left-most branch before joining \`WORKS_ON\`.
4. **Step 4 — Convert \`× + σ\` -> \`⋈\`:** \`((σ_{PNAME='AQUARIUS'}(P)) ⋈_{PNUMBER=PNO} W) ⋈_{ESSN=SSN} (σ_{BDATE>'1957-12-31'}(E))\`
5. **Step 5 — Push \`π\` Down:** Retain only \`{PNUMBER}\` on \`P\`, \`{ESSN, PNO}\` on \`W\`, and \`{SSN, LNAME}\` on \`E\`.`,
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q6 [10M, CO2, BL3]',
        questionPrompt:
          'Q6: Retail banking relations: CUSTOMER(Cust_ID, CName, Branch_Code, Credit_Score), ACCOUNT(Acc_No, Cust_ID, Acc_Type, Opening_Date), TRANSACTION(Txn_ID, Acc_No, Txn_Type, Amount, Txn_Date).\nSELECT C.CName, A.Acc_No, T.Amount FROM CUSTOMER C, ACCOUNT A, TRANSACTION T WHERE C.Cust_ID = A.Cust_ID AND A.Acc_No = T.Acc_No AND C.Branch_Code = \'BR_MUMBAI_01\' AND A.Acc_Type = \'Savings\' AND T.Amount > 100000;\nA. Draw the unoptimized Canonical Query Tree. [2M]\nB. Demonstrate step-by-step Heuristic Optimization rules and draw the Final Optimized Query Tree. [8M]',
        solvingMethod: [
          'Part A — Canonical Tree [2M]: Place base tables `CUSTOMER C`, `ACCOUNT A`, `TRANSACTION T` at the leaves joined by two `×` nodes, one compound `σ` holding all 5 `AND` conditions above `×`, and `π_{C.CName, A.Acc_No, T.Amount}` at the root.',
          'Part B Step 1 & 2 — Break `σ` & Push Down [2M]: Split the 5 `AND` predicates; push `σ_{C.Branch_Code=\'BR_MUMBAI_01\'}` onto `CUSTOMER`, `σ_{A.Acc_Type=\'Savings\'}` onto `ACCOUNT`, and `σ_{T.Amount>100000}` onto `TRANSACTION`.',
          'Part B Step 3 — Reorder Most Restrictive Leaves [2M]: Execute the two most selective leaf filters first (`Branch_Code=\'BR_MUMBAI_01\'` limits customers to one branch; `Amount > 100000` limits high-value transactions) before joining.',
          'Part B Step 4 — Replace `× + σ` with Equi-Joins (`⋈`) [2M]: Convert `(C × A)` + `C.Cust_ID = A.Cust_ID` into `⋈_{C.Cust_ID=A.Cust_ID}`, and upper `×` + `A.Acc_No = T.Acc_No` into `⋈_{A.Acc_No=T.Acc_No}`.',
          'Part B Step 5 — Push Projection (`π`) Down & Final Tree [2M]: Project ONLY needed columns at each branch: `π_{Cust_ID, CName}(C)` (drops Branch_Code, Credit_Score), `π_{Acc_No, Cust_ID}(A)` (drops Acc_Type, Opening_Date), `π_{Acc_No, Amount}(T)` (drops Txn_ID, Txn_Type, Txn_Date), then after joining `C ⋈ A` project `π_{C.CName, A.Acc_No}` before joining `T`.',
        ],
        codeBlock: {
          title: 'Canonical Tree (Part A) -> Final Optimized Query Tree (Part B — A1 Q6)',
          diagramId: 'm3-query-tree-a1q6',
          diagramCaption: 'FAT A1+TA1 Q6: Unoptimized Canonical Query Tree vs. Final Optimized Heuristic Query Tree.',
        },
        commonPitfalls:
          'When pushing `π` down to leaves, NEVER drop join keys! For example, projecting only `π_{C.CName}(C)` drops `Cust_ID`, making the parent `⋈_{C.Cust_ID = A.Cust_ID}` impossible! Always keep `(Output_Attrs ∪ Parent_Join_Keys)`.',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q10(b) [10M, CO2, BL3]',
        questionPrompt:
          'Q10(b): Online Shopping System: CUSTOMER(Cust_ID, Name, City), ORDERS(Order_ID, Cust_ID, Product_ID, Amount), PRODUCT(Product_ID, Product_Name, Category, Price).\nSELECT C.Name, P.Product_Name FROM CUSTOMER C, ORDERS O, PRODUCT P WHERE C.Cust_ID = O.Cust_ID AND O.Product_ID = P.Product_ID AND C.City = \'Chennai\';\nDraw initial canonical tree, demonstrate step-by-step heuristic optimization, and write the final optimized relational algebra expression. [10M]',
        solvingMethod: [
          'Step 0 — Initial Canonical Query Tree [2M]: Bottom `((CUSTOMER × ORDERS) × PRODUCT)` -> single `σ_{C.Cust_ID=O.Cust_ID ∧ O.Product_ID=P.Product_ID ∧ C.City=\'Chennai\'}` -> root `π_{C.Name, P.Product_Name}`.',
          'Step 1 & 2 — Cascade `σ` & Push Leaf Selection Down [2M]: Split conjunctions; push `σ_{C.City=\'Chennai\'}` directly down to the `CUSTOMER` leaf (and keep `C ⋈ O` first because filtering `City=\'Chennai\'` makes `C` the most restrictive relation!).',
          'Step 3 — Convert `× + σ` into Equi-Joins (`⋈`) [2M]: Form `((σ_{C.City=\'Chennai\'}(C)) ⋈_{C.Cust_ID=O.Cust_ID} O) ⋈_{O.Product_ID=P.Product_ID} P`.',
          'Step 4 — Push Projection (`π`) Down [2M]: Above `σ(C)` project `π_{Cust_ID, Name}`; over `ORDERS` project `π_{Cust_ID, Product_ID}` (drops `Order_ID, Amount`); above `(C ⋈ O)` project `π_{C.Name, O.Product_ID}` (drops `Cust_ID` once no longer needed!); over `PRODUCT` project `π_{Product_ID, Product_Name}` (drops `Category, Price`).',
          'Step 5 — Final Optimized RA Expression [2M]: Write the exact bottom-up parenthesized RA expression matching the final tree.',
        ],
        codeBlock: {
          title: 'Final Optimized Query Tree & RA Expression — A2+TA2 Q10(b)',
          diagramId: 'm3-query-tree-a2q10b',
          diagramCaption: 'FAT A2+TA2 Q10(b): Final Optimized Query Tree pushing σ and π down below joins.',
          language: 'markdown',
          content:
`> **Final Optimized Relational Algebra Expression:**
> \`π_{C.Name, P.Product_Name}( ( π_{C.Name, O.Product_ID}( (π_{Cust_ID, Name}(σ_{City='Chennai'}(C))) ⋈_{C.Cust_ID = O.Cust_ID} (π_{Cust_ID, Product_ID}(O)) ) ) ⋈_{O.Product_ID = P.Product_ID} (π_{Product_ID, Product_Name}(P)) )\``,
        },
        commonPitfalls:
          'Q10(b) explicitly asks for BOTH the step-by-step trees AND the **final optimized relational algebra expression** at the end—do not stop after drawing the final tree!',
      },
    ],
    exampleTitle: 'Golden Rule When Pushing Projections (`π`) Down',
    exampleBody:
`> **Projection Retention Rule at any node \`R\` feeding parent \`Op\`:**
> \`Keep = (Attributes needed in final SELECT) ∪ (Join/Filter attributes used in Op above)\`

- **Example (A2 Q10b on \`ORDERS\`):** Final \`SELECT\` needs zero columns from \`ORDERS\`, yet the two parent joins require \`Cust_ID\` and \`Product_ID\`. Therefore project **\`π_{Cust_ID, Product_ID}(O)\`** — dropping \`Order_ID\` and \`Amount\` early!`,
    examTip:
      'In every 10M Query Optimization question, draw cleanly separated **Step Trees**: (0) Canonical Tree -> (1) Push `σ` Down -> (2) Reorder Leaves & Convert `×+σ` to `⋈` -> (3) Push `π` Down -> (4) Final RA Expression.',
    selfChecks: [
      {
        question:
          'Why does heuristic query optimization push Select (σ) operations down toward the leaves BEFORE replacing Cartesian Products (×) with Joins (⋈)?',
        options: [
          'Because σ changes column names while × does not',
          'Filtering individual relations at the leaves dramatically shrinks the number of tuples entering subsequent joins, minimizing I/O and memory cost',
          'Because SQL forbids WHERE clauses on joined tables',
          'Moving σ down eliminates duplicate rows automatically like π',
        ],
        correctIndex: 1,
        explanation:
          'Single-table selections (like City = \'Chennai\' or Branch_Code = \'BR_MUMBAI_01\') filter rows locally first so joins process only matching rows rather than full multi-million-row tables.',
      },
      {
        question:
          'When pushing Project (π) down below a join CUSTOMER ⋈_{C.Cust_ID = O.Cust_ID} ORDERS where the final SELECT outputs only C.Name and O.Amount, which attributes MUST be retained on the CUSTOMER branch?',
        options: [
          'Only C.Name',
          'C.Name and C.Cust_ID',
          'C.Cust_ID only',
          'All attributes of CUSTOMER because π cannot move past ⋈',
        ],
        correctIndex: 1,
        explanation:
          'Pushing π down retains both attributes required by the final output (C.Name) AND attributes required by the join condition above (C.Cust_ID).',
      },
    ],
  },
};
