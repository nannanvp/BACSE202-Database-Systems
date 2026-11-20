export type DiagramId =
  | 'm1-rahul-concurrency'
  | 'm1-three-schema'
  | 'm1-dbms-components'
  | 'm2-cardinality-minmax'
  | 'm2-hotel-eer'
  | 'm2-aggregation-lattice'
  | 'm2-arrms-eer'
  | 'm2-shopping-lattice'
  | 'm3-spanned-unspanned'
  | 'm3-hashing-layouts'
  | 'm3-bplus-split-rules'
  | 'm3-lsm-architecture'
  | 'm3-multilevel-index'
  | 'm3-bplus-a1q5b'
  | 'm3-bplus-a2q10a'
  | 'm3-query-tree-a1q6'
  | 'm3-query-tree-a2q10b'
  | 'm4-txn-states'
  | 'm4-recoverability-venn'
  | 'm4-precedence-a1q7'
  | 'm4-precedence-a2q5b'
  | 'm4-2pl-phases'
  | 'm4-wfg-a2q6'
  | 'm4-mgl-hierarchy'
  | 'm4-checkpoint-timeline'
  | 'm5-ddb-concept'
  | 'm5-hardware-arch'
  | 'm5-2pc-sequence'
  | 'm5-cap-triangle'
  | 'm5-mongodb-sharding'
  | 'm5-mapreduce-pipeline'
  | 'm5-consistent-hash-ring';

export interface NoteSubSection {
  title: string;
  body: string;
  bullets?: string[];
  codeOrDiagram?: string;
  codeLanguage?: string;
  markdownBlock?: string;
  diagramId?: DiagramId;
  diagramCaption?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface FatSolvedMethod {
  sourcePaper: string;
  questionPrompt: string;
  solvingMethod: string[];
  codeBlock?: {
    title: string;
    content?: string;
    language?: 'markdown' | 'sql' | 'json' | 'js' | 'cypher';
    diagramId?: DiagramId;
    diagramCaption?: string;
  };
  commonPitfalls?: string;
}

export interface TopicSelfCheck {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicNote {
  summary: string;
  sourceDecks: string[];
  keyPoints: Array<{ heading: string; text: string }>;
  deepDiveSections?: NoteSubSection[];
  fatQuestionMethods?: FatSolvedMethod[];
  selfChecks?: TopicSelfCheck[];
  exampleTitle: string;
  exampleBody: string;
  exampleDiagramId?: DiagramId;
  exampleDiagramCaption?: string;
  examTip: string;
}
