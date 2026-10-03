import cytoscape from 'cytoscape';
import { Scale } from 'chroma-js';

type Provider<T> = () => T;
type Property<T> = T | Provider<T>;
/**
 * This function extracts the value from a property, and if the property is a Provider<T>, it calls the property function to get the actual value.
 *
 * @param property A value of type Property<T>.
 */
declare function extract<T>(property: Property<T>): T;
type PropertiesType = {
    [k: string]: Property<any>;
};
declare const propertyExtractor: (properties: Properties) => <G extends keyof Properties, K extends keyof Properties[G]>(group: G, key: K) => Properties[G][K];

interface Properties extends PropertiesType {
    global: {
        thickness: Property<number>;
        surface: Property<string>;
        onSurface: Property<string>;
        primary: Property<string>;
        onPrimary: Property<string>;
        primaryContainer: Property<string>;
        onPrimaryContainer: Property<string>;
        positive: Property<string>;
        negative: Property<string>;
        negativeContrast: Property<string>;
        selectNode: Property<string>;
        selectEdge: Property<string>;
        hoverNode: Property<string>;
        hoverEdge: Property<string>;
        flag: Property<string>;
    };
    compartment: {
        fill: Property<string>;
        opacity: Property<number>;
    };
    shadow: {
        luminosity: Property<number>;
        opacity: Property<[number, number][]>;
        labelOpacity: Property<[number, number][]>;
        padding: Property<number>;
        fontSize: Property<number>;
        fontPadding: Property<number>;
    };
    protein: {
        fill: Property<string>;
        drug: Property<string>;
        radius: Property<number>;
    };
    genomeEncodedEntity: {
        fill: Property<string>;
        drug: Property<string>;
        bottomRadius: Property<number>;
        topRadius: Property<number>;
    };
    rna: {
        fill: Property<string>;
        drug: Property<string>;
        radius: Property<number>;
    };
    gene: {
        fill: Property<string>;
        decorationHeight: Property<number>;
        decorationExtraWidth: Property<number>;
        arrowHeadSize: Property<number>;
        borderRadius: Property<number>;
        arrowRadius: Property<number>;
    };
    molecule: {
        fill: Property<string>;
        stroke: Property<string>;
        drug: Property<string>;
    };
    entitySet: {
        fill: Property<string>;
        stroke: Property<string>;
        drug: Property<string>;
        radius: Property<number>;
    };
    complex: {
        fill: Property<string>;
        stroke: Property<string>;
        drug: Property<string>;
        cut: Property<number>;
    };
    polymer: {
        distance: Property<number>;
        filter: Property<string>;
    };
    cell: {
        thickness: Property<number>;
        fill: Property<string>;
        stroke: Property<string>;
    };
    pathway: {
        fill: Property<string>;
        stroke: Property<string>;
    };
    modification: {
        fill: Property<string>;
    };
    interactor: {
        fill: Property<string>;
        stroke: Property<string>;
        decorationWidth: Property<number>;
    };
    trivial: {
        opacity: Property<[number, number][]>;
    };
    structure: {
        opacity: Property<[number, number][]>;
    };
    font: {
        size: Property<number>;
    };
    analysis: {
        min: Property<number>;
        max: Property<number>;
        unidirectionalPalette: Property<[number, string][] | string>;
        bidirectionalPalette: Property<[number, string][] | string>;
        notFound: Property<string>;
    };
    features: {
        edit: Property<boolean>;
        compare: Property<boolean>;
        interactors: Property<boolean>;
        analysis: Property<boolean>;
    };
}
type UserProperties = Partial<{
    [k in keyof Properties]: Partial<Properties[k]>;
}>;

/**
 * Below this zoom the interactor count badge is not drawn at all.
 *
 * Measured rather than chosen: the badge is 30 model units wide, so 0.6 puts it
 * at 18 screen pixels. Below that its two digits are a smudge -- 6 pixels at the
 * 0.203 that R-HSA-1368108 opens at.
 */
declare const INTERACTOR_BADGE_MIN_ZOOM = 0.6;
declare class Interactivity {
    private cy;
    private properties;
    isMobile: boolean;
    constructor(cy: cytoscape.Core, properties: Properties);
    expandReaction(reactionNode: cytoscape.NodeCollection): cytoscape.CollectionReturnValue;
    applyToReaction: (action: (col: cytoscape.Collection) => void, stateKey: keyof State) => (reactionNode: cytoscape.NodeCollection) => void;
    initHover(cy: cytoscape.Core, mapper?: <X>(x: X) => X): void;
    initSelect(cy: cytoscape.Core, mapper?: <X>(x: X) => X): void;
    initClick(cy: cytoscape.Core): void;
    private videoLayer?;
    initStructureVideo(cy: cytoscape.Core): void;
    addLoading(container: HTMLElement): void;
    removeLoading(container: HTMLElement): void;
    removeStructureContainer(loadingContainer: HTMLElement, node: cytoscape.NodeSingular): void;
    private moleculeLayer?;
    initStructureMolecule(cy: cytoscape.Core): void;
    onZoom: {
        [name: string]: (e?: cytoscape.EventObjectCore) => void;
        shadow: (e?: cytoscape.EventObjectCore) => void;
        protein: (e?: cytoscape.EventObjectCore) => void;
    };
    triggerZoom(): void;
    structureContainers: cytoscape.NodeCollection;
    /** Nodes whose structure could not be found: never counted back in. */
    private withoutStructure;
    updateProteins(): void;
    initZoom(cy: cytoscape.Core): void;
    margin: number;
    p(x: number, y: number): P;
    interpolate(x: number, points: P[]): number;
    /**
     * Linear interpolation as described in https://en.wikipedia.org/wiki/Linear_interpolation
     * @param x : number number to determine corresponding value
     * @param p0 : P lower bound point for the linear interpolation
     * @param p1 : P upper bound point for the linear interpolation
     */
    lerp(x: number, p0: P, p1: P): number | undefined;
}
interface State {
    [k: string]: boolean;
}
declare class P extends Array<number> {
    constructor(x: number, y: number);
    get x(): number;
    get y(): number;
}

/**
 * The Interactivity bound to this specific graph. Prefer this over
 * `cy.data('reactome').interactivity`, which returns whichever graph was bound
 * most recently and so may belong to an entirely different cytoscape instance.
 */
declare function interactivityOf(cy: cytoscape.Core): Interactivity | undefined;
declare class Style {
    css: CSSStyleDeclaration;
    properties: Properties;
    currentPalette: Scale;
    cy?: cytoscape.Core;
    private readonly imageBuilder;
    private readonly p;
    private readonly pm;
    interactivity: Interactivity;
    constructor(container: HTMLElement, properties?: UserProperties);
    bindToCytoscape(cy: cytoscape.Core): void;
    initSubPathwayColors(cy?: cytoscape.Core | undefined): void;
    getStyleSheet(): cytoscape.StylesheetCSS[];
    clearCache(): void;
    update(cy: cytoscape.Core): void;
    loadAnalysis(cy: cytoscape.Core, palette: Scale): void;
}

type SimpleEntity = 'Protein' | 'GenomeEncodedEntity' | 'RNA' | 'Gene' | 'Molecule';
type ComposedEntity = 'EntitySet' | 'Complex' | 'Cell';
type PhysicalEntity = SimpleEntity | ComposedEntity;
type PhysicalEntityDefinition = [PhysicalEntity, 'PhysicalEntity', ...string[]];
type PathwayEntity = 'Interacting' | 'SUB';
type PathwayEntityDefinition = [PathwayEntity, 'Pathway', ...string[]];
type DiseaseInteractorEntity = 'Interactor';
type Node = PhysicalEntity | PathwayEntity | DiseaseInteractorEntity;
type NodeDefinition = PathwayEntityDefinition | PhysicalEntityDefinition;
type CompartmentDefinition = ['Compartment', ...string[]];
type ModificationDefinition = ['Modification', ...string[]];
type Reaction = 'association' | 'dissociation' | 'transition' | 'uncertain' | 'omitted';
type ReactionDefinition = [Reaction, 'reaction', ...string[]];
type IncomingEdge = 'consumption' | 'catalysis' | 'positive-regulation' | 'negative-regulation' | 'set-to-member';
type OutgoingEdge = 'production';
type EdgeType = IncomingEdge | OutgoingEdge;
type IncomingEdgeDefinition = [IncomingEdge, 'incoming', ...string[]];
type OutgoingEdgeDefinition = [OutgoingEdge, 'outgoing', ...string[]];
type EdgeTypeDefinition = IncomingEdgeDefinition | OutgoingEdgeDefinition;

type types_d_CompartmentDefinition = CompartmentDefinition;
type types_d_ComposedEntity = ComposedEntity;
type types_d_DiseaseInteractorEntity = DiseaseInteractorEntity;
type types_d_EdgeType = EdgeType;
type types_d_EdgeTypeDefinition = EdgeTypeDefinition;
type types_d_IncomingEdge = IncomingEdge;
type types_d_IncomingEdgeDefinition = IncomingEdgeDefinition;
type types_d_ModificationDefinition = ModificationDefinition;
type types_d_Node = Node;
type types_d_NodeDefinition = NodeDefinition;
type types_d_OutgoingEdge = OutgoingEdge;
type types_d_OutgoingEdgeDefinition = OutgoingEdgeDefinition;
type types_d_PathwayEntity = PathwayEntity;
type types_d_PathwayEntityDefinition = PathwayEntityDefinition;
type types_d_PhysicalEntity = PhysicalEntity;
type types_d_PhysicalEntityDefinition = PhysicalEntityDefinition;
type types_d_Reaction = Reaction;
type types_d_ReactionDefinition = ReactionDefinition;
type types_d_SimpleEntity = SimpleEntity;
declare namespace types_d {
  export type { types_d_CompartmentDefinition as CompartmentDefinition, types_d_ComposedEntity as ComposedEntity, types_d_DiseaseInteractorEntity as DiseaseInteractorEntity, types_d_EdgeType as EdgeType, types_d_EdgeTypeDefinition as EdgeTypeDefinition, types_d_IncomingEdge as IncomingEdge, types_d_IncomingEdgeDefinition as IncomingEdgeDefinition, types_d_ModificationDefinition as ModificationDefinition, types_d_Node as Node, types_d_NodeDefinition as NodeDefinition, types_d_OutgoingEdge as OutgoingEdge, types_d_OutgoingEdgeDefinition as OutgoingEdgeDefinition, types_d_PathwayEntity as PathwayEntity, types_d_PathwayEntityDefinition as PathwayEntityDefinition, types_d_PhysicalEntity as PhysicalEntity, types_d_PhysicalEntityDefinition as PhysicalEntityDefinition, types_d_Reaction as Reaction, types_d_ReactionDefinition as ReactionDefinition, types_d_SimpleEntity as SimpleEntity };
}

interface ReactomeEventTarget {
    reactomeId: string;
    type: 'PhysicalEntity' | 'Pathway' | 'reaction' | 'Interactor' | 'Any';
    element: cytoscape.NodeSingular;
    cy: cytoscape.Core;
}
declare enum ReactomeEventTypes {
    hover = "reactome::hover",
    leave = "reactome::leave",
    select = "reactome::select",
    unselect = "reactome::unselect",
    open = "reactome::open",
    close = "reactome::close"
}
declare class ReactomeEvent extends CustomEvent<ReactomeEventTarget> {
    constructor(type: ReactomeEventTypes, target: ReactomeEventTarget);
}

export { INTERACTOR_BADGE_MIN_ZOOM, Interactivity, ReactomeEvent, ReactomeEventTypes, Style, types_d as Types, extract, interactivityOf, propertyExtractor };
export type { ReactomeEventTarget, UserProperties };
