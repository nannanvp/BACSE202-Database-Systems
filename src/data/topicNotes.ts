import type { TopicNote } from './noteTypes';
import { MODULE_1_NOTES } from './module1Notes';
import { MODULE_2_NOTES } from './module2Notes';
import { MODULE_3_NOTES } from './module3Notes';
import { MODULE_4_NOTES } from './module4Notes';
import { MODULE_5_NOTES } from './module5Notes';

export type { TopicNote, NoteSubSection, FatSolvedMethod, TopicSelfCheck } from './noteTypes';

export const TOPIC_NOTES: Record<string, TopicNote> = {
  // ==========================================================================
  // MODULE 1: Database Systems and Data Models (Enhanced)
  // ==========================================================================
  ...MODULE_1_NOTES,


  // ==========================================================================
  // MODULE 2: ER Modeling and Relational Database Design (Enhanced)
  // ==========================================================================
  ...MODULE_2_NOTES,


  // ==========================================================================
  // MODULE 3: Physical Database Design and Query Processing (Enhanced)
  // ==========================================================================
  ...MODULE_3_NOTES,

  // ==========================================================================
  // MODULE 4: Transaction Processing, Concurrency Control & Recovery (Enhanced)
  // ==========================================================================
  ...MODULE_4_NOTES,

  // ==========================================================================
  // MODULE 5: Distributed and NoSQL Databases (Enhanced Deep Study Notes)
  // ==========================================================================
  ...MODULE_5_NOTES,
};
