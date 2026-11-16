export interface Graph {
  dbId: number;
  stId: string;
  speciesName: string;
  edges: Edge[];
  nodes: Node[];
  subpathways: SubPathway[];
}

export type Entity = {
  dbId: number;
  stId: string;
  displayName: string;
};

export interface Edge extends Entity {
  schemaClass: string;
}

export interface Node extends Entity {
  diagramIds?: number[];
  identifier: string;
  parents: number[];
  children: number[];
  /**
   * A complex's or set's leaves, the entities at the bottom of its children
   * (set by the diagram service).
   */
  leaves?: Node[];
  schemaClass: string;
  referenceType: string;
}

export interface SubPathway extends Entity {
  events: number[];
}
