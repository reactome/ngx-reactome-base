export type SimpleEntity = 'Protein' | 'GenomeEncodedEntity' | 'RNA' | 'Gene' | 'Molecule';
export type ComposedEntity = 'EntitySet' | 'Complex' | 'Cell';
export type PhysicalEntity = SimpleEntity | ComposedEntity;
export type PhysicalEntityDefinition = [PhysicalEntity, 'PhysicalEntity', ...string[]];
export type PathwayEntity = 'Interacting' | 'SUB';
export type PathwayEntityDefinition = [PathwayEntity, 'Pathway', ...string[]];
export type DiseaseInteractorEntity = 'DiseaseInteractor';
export type Node = PhysicalEntity | PathwayEntity | DiseaseInteractorEntity;

export type NodeDefinition = PathwayEntityDefinition | PhysicalEntityDefinition ;

export type CompartmentDefinition = ['Compartment', ...string[]];
export type ModificationDefinition = ['Modification', ...string[]];


export type Reaction = 'association' | 'dissociation' | 'transition' | 'uncertain' | 'omitted';
export type ReactionDefinition = [Reaction, 'reaction', ...string[]];


export type IncomingEdge =
  'consumption'
  | 'catalysis'
  | 'positive-regulation'
  | 'negative-regulation'
  | 'set-to-member';
export type OutgoingEdge = 'production';
export type EdgeType = IncomingEdge | OutgoingEdge;
export type IncomingEdgeDefinition = [IncomingEdge, 'incoming', ...string[]];
export type OutgoingEdgeDefinition = [OutgoingEdge, 'outgoing', ...string[]];
export type EdgeTypeDefinition = IncomingEdgeDefinition | OutgoingEdgeDefinition;
