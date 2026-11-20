---
name: BACSE202 Boxed-Software Reference Manual (Acetate Tab Board)
description: Open boxed-software reference manual on an oiled-charcoal binder mat with milk-acetate leaves, archival cream section board, and a 7-division stepped fore-edge tab wheel.
---

## Overview

BACSE202 Database Systems Exam Prep & Study Manual adopts the **`rw-manual-acetate-tab-board`** ("Boxed-Software Reference Manual Lying Open At A Tabbed Section") aesthetic direction. The interface behaves like an authoritative late-1980s boxed workstation/database systems manual (in the spirit of Symbolics Document Examiner, NeXT Developer Library, and classic Wirth/Date technical manuals) lying open on a dark binder mat (`#26231E`) with a punched ring-binder spine on the left and a stepped, color-coded fore-edge division tab rail on the right.

## Colors

### Core Surfaces & Ink Hierarchy
- **Binder Frame Mat** (`--surface-binder`): `#26231E` — Deep oiled-charcoal desk/binder frame surrounding the open manual.
- **Section Board Ground** (`--surface-board`): `#EAE4D7` — Warm uncoated archival paperboard base.
- **Milk-Acetate Leaf** (`--surface-leaf`): `#F4EFE4` — Secondary leaf and formula callout ground.
- **Primary Manual Sheet** (`--surface-sheet`): `#FAF7F0` — High-contrast reading sheet for syllabus notes, lab stages, and FAT exam papers.
- **Primary Carbon Ink** (`--ink-primary`): `#1C1B18` — All headings, primary prose, and 1px structural borders.
- **Secondary Warm Ink** (`--ink-secondary`): `#434038` — Supporting descriptions and table cells.
- **Muted Folio Ink** (`--ink-muted`): `#6E695D` — Folio numbers, lecture hours, and metadata captions placed below headings.
- **Hairline Rule** (`--rule-hairline`): `#C5BEB0` — Internal table and section dividers.

### 7-Division Fore-Edge Tab Wheel
- **Division 1 (`m1` / Primary Action)**: Chrome Yellow `#E5B82E` (Ink: `#1C1B18`) — Module 1 Architecture & Primary Exam CTA.
- **Division 2 (`m2`)**: Oxide Orange `#E06D2B` (Ink: `#1C1B18`) — Module 2 ER/EER & SQL.
- **Division 3 (`m3` / Verified Mastery)**: Grass Green `#4F8A3D` (Ink: `#FAF7F0`) — Module 3 Normalization & Verified Solutions.
- **Division 4 (`m4`)**: Teal `#147E7B` (Ink: `#FAF7F0`) — Module 4 Storage, B+ Trees & Query Processing.
- **Division 5 (`m5`)**: Ultramarine `#22559C` (Ink: `#FAF7F0`) — Module 5 Transactions, Recovery & Distributed NoSQL.
- **Division 6 (`labs`)**: Violet `#6F539B` (Ink: `#FAF7F0`) — Interactive Simulators.
- **Division 7 (`mock`)**: Sienna `#854D2B` (Ink: `#FAF7F0`) — 100-Mark FAT Slot Paper & Forensics.
- **Semantic Danger / Cycle Alert**: Carmine `#A62B2B` (Ink: `#FAF7F0`).

## Typography

- **Display & UI Headers (`--font-display`)**: `'Archivo'`, sans-serif (`weights 500, 600, 700, 800`). Tight tracking (`-0.02em`) for manual titles, module headers, and tabular controls.
- **Narrative Study Prose (`--font-serif`)**: `'EB Garamond'`, Georgia, serif (`weights 400, 500, 600`). Used via `.prose-manual` at `1.04rem`, `line-height: 1.65`, capped at `68ch` for effortless long-form reading across all 30 syllabus topics.
- **Technical Notation & Folios (`--font-mono`)**: `'JetBrains Mono'`, monospace (`weights 400, 500, 600`) with `font-variant-numeric: tabular-nums` on all marks, countdown timers, functional dependencies, SQL blocks, and schedule traces.

## Layout

- **Open Manual Binder Shell**: Outer `#26231E` binder frame (`p-2 sm:p-3 lg:p-4`) enclosing the `#EAE4D7` manual body (`max-w-[1600px]`), flanked by a `36px` left punched binder margin (`.binder-hole` + vertical folio stamp) on desktop and a `52px` right stepped fore-edge division tab rail.
- **Full-Width Syllabus Reader**: Syllabus notes occupy 100% of the manual sheet width without right-rail clutter; Professor PPT Decks, Critical Rules & Formulas, Comparison Tables, and Expected VIT FAT Exam Prompts live in the dedicated **Reference** section.
- **Asymmetric Lab Workbenches**: Interactive labs use a `7:5` 12-column split (live visual stage on the left 7 columns, parameter controls and presets on the right 5 columns).

## Elevation & Depth

- **Crisp 1px Carbon Rules over Soft Drop Shadows**: Sheets and plates are separated by `1px solid #1C1B18` outer rules and `1px solid #C5BEB0` internal hairlines rather than blurred SaaS drop shadows.
- **Calibrated Milk-Acetate Translucency**: A runtime sRGB relative-luminance binary-search solver (`solveLeafAlpha`) computes `--leaf-alpha` so the milk-acetate leaf layer maintains a strict WCAG AAA contrast ratio (`≥ 9.5:1`) against `#1C1B18` ink.

## Shapes

- **Die-Cut Manual Geometry**:
  - Primary sheets, tables, and controls: `4px` (`rounded-[4px]`).
  - Inline code badges and folio tags: `2px` (`rounded-[2px]`).
  - Fore-edge division tabs: square spine attachment on the left, `0 6px 6px 0` die-cut tab radius on the right with a punched eyelet circle.
  - Punched binder holes and topic mastery check rings: circular `9999px` (`rounded-full`) with `1px solid #1C1B18` strokes.

## Components

- **Top Manual Specification Header**: Displays the `M1`–`M5` division stamp, course title (`BACSE202 — Database Systems`), 5-tab mode bar (`48h Plan`, `Syllabus`, `Reference`, `Interactive Labs`, `FAT Mock`), mastery counter (`X/30 Mastered`), and the Chrome Yellow `Start FAT Mock →` primary button.
- **Stepped Fore-Edge Division Tab Rail**: Right-hand vertical index rail with proportional heights (`18%`, `17%`, `16%`, `15%`, `14%`, `10%`, `10%`) for instant switching across Modules 1–5, Labs, and the 100M FAT Mock.
- **Full-Screen Note Reader**: Modal overlay (`data-testid="fullscreen-note-reader"`) on `#EAE4D7` ground with sticky `#FAF7F0` header, `Prev`/`Next` topic navigation, mastery toggle, and `Escape` key support.

## Do's and Don'ts

- **Do** let every `<h1>`, `<h2>`, `<h3>`, and `<h4>` lead its text block directly, placing metadata (`Module 1 · 7 Lecture Hours`, `Topic 1.1 · Core`, `Q1 · 10M · CO1`) **below** the heading.
- **Do** use `.prose-manual` (`EB Garamond`, `max-width: 68ch`) for long-form conceptual explanations and `JetBrains Mono` for SQL, relational algebra, and functional dependency traces.
- **Don't** place uppercase eyebrow kickers above headings (`craft-floor.md` violation).
- **Don't** use generic cool slate/white (`#F8FAFC` / `#FFFFFF`) or blurred SaaS card shadows (`shadow-lg`, `rounded-2xl`).
- **Don't** add decorative `01.` / `02.` numbers to non-sequential feature grids or cards-within-cards.
