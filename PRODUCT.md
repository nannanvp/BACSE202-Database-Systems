# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

VIT Chennai B.Tech Computer Science students preparing for the **BACSE202 Database Systems End Semester Final Assessment Test (FAT)** across a 48-hour study sprint (Nov 21–23). They need to master 43 lecture hours across 5 syllabus modules, verify hand-worked database algorithms, and practice full 100-mark slot paper blueprints (`A1+TA1` and `A2+TA2`).

## Product Purpose

An integrated exam-sprint manual and interactive laboratory that combines complete module study notes, 32 architectural SVG diagrams, deterministic database engines (FD closure, candidate keys, minimal cover, normal forms, B+ tree splits, conflict serializability, CAP/NoSQL), course reference decks/formulas, and 100-mark FAT slot paper simulations.

## Positioning

Unlike generic flashcard apps or static PDF slide dumps, BACSE202 Sprint binds every VIT syllabus module directly to Dr. Swaminathan's lecture decks, R. Elmasri & S. B. Navathe's *Fundamentals of Database Systems* (7th Ed.), real Nov 2026 `A1+TA1` / `A2+TA2` slot paper forensics, and live algorithmic verifiers in one unified reference manual.

## Operating Context

Used primarily on desktop and laptop screens during intensive 2-to-3-hour study blocks, as well as on mobile phones for rapid morning formula and diagram review prior to the 09:00 AM exam slot. Students switch between **Operate** surfaces (`48h Plan`, `Interactive Labs`, `FAT Mock`) and **Read** surfaces (`Full-Width Syllabus Manual`, `Full Screen Reader`, `Reference`).

## Capabilities and Constraints

- Deterministic TypeScript database engine (`src/utils/dbEngine.ts`) verified by 15 unit tests (`src/utils/dbEngine.test.ts`).
- Full-screen-width Syllabus study notes with distraction-free Full Screen reader mode, keeping Professor PPT links, Critical Rules & Formulas, Module Comparison Tables, and Expected Exam Prompts separated into the dedicated `Reference` tab.
- Offline-ready `localStorage` persistence for completed sprint blocks, mastered syllabus topics, and mock quiz answers.

## Evidence on Hand

- Ingested Professor PPT slide decks (`src/data/professorMaterials.ts`) across Modules 0–5.
- Real VIT Chennai Nov 2026 `A1+TA1` and `A2+TA2` End Semester FAT question paper forensics and parallel 100-mark generated slot paper (`src/data/slotPaperAnalysis.ts`).
- 30 comprehensive topic study notes (`src/data/topicNotes.ts`) and 32 vector concept diagrams (`src/components/ConceptDiagrams.tsx`).

## Product Principles

1. **Structural Honesty Over Card Clutter**: Organize dense technical material with architectural hairline rules, stepped module index tabs, and clear typographic measure rather than nested rounded cards.
2. **Prove Every Algorithm Step-by-Step**: Never show a black-box verdict; display every FD closure step, precedence graph conflict edge, B+ tree node split, and marking-scheme derivation.
3. **Zero Friction Between Reading and Doing**: Every sprint block and syllabus module connects directly to its corresponding interactive lab and FAT slot paper question.

## Accessibility & Inclusion

WCAG AA contrast compliance (≥4.5:1 body text, ≥3:1 large text and UI controls), full keyboard navigation (`/` to search, `Escape` to exit full-screen reader, visible focus rings), semantic landmarks, and `prefers-reduced-motion` support.
