import React from 'react';
import type { DiagramId } from '../data/noteTypes';
import {
  DbmsComponentsDiagram,
  RahulConcurrencyDiagram,
  ThreeSchemaDiagram,
} from './diagrams/Module1Diagrams';
import {
  ArrmsEerDiagram,
  CardinalityMinMaxDiagram,
  EerAggregationLatticeDiagram,
  HotelEerDiagram,
  ShoppingLatticeDiagram,
} from './diagrams/Module2Diagrams';
import {
  BPlusA1Q5bDiagram,
  BPlusA2Q10aDiagram,
  BPlusSplitRulesDiagram,
  HashingLayoutsDiagram,
  LsmArchitectureDiagram,
  MultilevelIndexDiagram,
  QueryTreeA1Q6Diagram,
  QueryTreeA2Q10bDiagram,
  SpannedUnspannedDiagram,
} from './diagrams/Module3Diagrams';
import {
  CheckpointTimelineDiagram,
  MglHierarchyDiagram,
  PrecedenceA1Q7Diagram,
  PrecedenceA2Q5bDiagram,
  RecoverabilityVennDiagram,
  TwoPlPhasesDiagram,
  TxnStatesDiagram,
  WfgA2Q6Diagram,
} from './diagrams/Module4Diagrams';
import {
  CapTriangleDiagram,
  ConsistentHashRingDiagram,
  DdbConceptDiagram,
  HardwareArchDiagram,
  MapReducePipelineDiagram,
  MongodbShardingDiagram,
  TwoPcSequenceDiagram,
} from './diagrams/Module5Diagrams';

export const DIAGRAM_REGISTRY: Record<
  DiagramId,
  React.FC<{ caption?: string }>
> = {
  'm1-rahul-concurrency': RahulConcurrencyDiagram,
  'm1-three-schema': ThreeSchemaDiagram,
  'm1-dbms-components': DbmsComponentsDiagram,
  'm2-cardinality-minmax': CardinalityMinMaxDiagram,
  'm2-hotel-eer': HotelEerDiagram,
  'm2-aggregation-lattice': EerAggregationLatticeDiagram,
  'm2-arrms-eer': ArrmsEerDiagram,
  'm2-shopping-lattice': ShoppingLatticeDiagram,
  'm3-spanned-unspanned': SpannedUnspannedDiagram,
  'm3-hashing-layouts': HashingLayoutsDiagram,
  'm3-bplus-split-rules': BPlusSplitRulesDiagram,
  'm3-lsm-architecture': LsmArchitectureDiagram,
  'm3-multilevel-index': MultilevelIndexDiagram,
  'm3-bplus-a1q5b': BPlusA1Q5bDiagram,
  'm3-bplus-a2q10a': BPlusA2Q10aDiagram,
  'm3-query-tree-a1q6': QueryTreeA1Q6Diagram,
  'm3-query-tree-a2q10b': QueryTreeA2Q10bDiagram,
  'm4-txn-states': TxnStatesDiagram,
  'm4-recoverability-venn': RecoverabilityVennDiagram,
  'm4-precedence-a1q7': PrecedenceA1Q7Diagram,
  'm4-precedence-a2q5b': PrecedenceA2Q5bDiagram,
  'm4-2pl-phases': TwoPlPhasesDiagram,
  'm4-wfg-a2q6': WfgA2Q6Diagram,
  'm4-mgl-hierarchy': MglHierarchyDiagram,
  'm4-checkpoint-timeline': CheckpointTimelineDiagram,
  'm5-ddb-concept': DdbConceptDiagram,
  'm5-hardware-arch': HardwareArchDiagram,
  'm5-2pc-sequence': TwoPcSequenceDiagram,
  'm5-cap-triangle': CapTriangleDiagram,
  'm5-mongodb-sharding': MongodbShardingDiagram,
  'm5-mapreduce-pipeline': MapReducePipelineDiagram,
  'm5-consistent-hash-ring': ConsistentHashRingDiagram,
};

export const ConceptDiagram: React.FC<{
  id: DiagramId;
  caption?: string;
}> = ({ id, caption }) => {
  const Component = DIAGRAM_REGISTRY[id];
  return (
    <div className="diagram-canvas-plate rounded-[4px] overflow-hidden">
      <Component caption={caption} />
    </div>
  );
};
