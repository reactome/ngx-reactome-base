import * as i0 from '@angular/core';
import { InjectionToken, AfterViewInit, OnChanges, ElementRef, SimpleChanges } from '@angular/core';
import * as rxjs from 'rxjs';
import { Observable, Subscription } from 'rxjs';
import cytoscape from 'cytoscape';
import { Style, ReactomeEvent } from 'ngx-reactome-cytoscape-style';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

interface Position {
    x: number;
    y: number;
}

interface DiagramConfig {
    diagramUrl?: string;
}
declare const DIAGRAM_CONFIG_TOKEN: InjectionToken<DiagramConfig>;
declare class DiagramService {
    private http;
    extraLine: Map<string, Position>;
    reverseExtraLine: Map<string, Position>;
    constructor();
    nodeTypeMap: Map<string, ["SUB" | "Interacting", "Pathway", ...string[]] | [("Gene" | "GenomeEncodedEntity" | "RNA" | "Protein" | "Molecule") | ("Complex" | "EntitySet" | "Cell"), "PhysicalEntity", ...string[]]>;
    reactionTypeMap: Map<string | undefined, ["dissociation" | "association" | "transition" | "omitted" | "uncertain", "reaction", ...string[]]>;
    edgeTypeMap: Map<string, ["consumption" | "catalysis" | "positive-regulation" | "negative-regulation" | "set-to-member", "incoming", ...string[]] | ["production", "outgoing", ...string[]]>;
    edgeTypeToStr: Map<string, string>;
    linkClassMap: Map<string, ["consumption" | "catalysis" | "positive-regulation" | "negative-regulation" | "set-to-member", "incoming", ...string[]] | ["production", "outgoing", ...string[]]>;
    random(min: number, max: number): number;
    pick<T>(values: T[]): T;
    private readonly COMPARTMENT_SHIFT;
    private diagramUrl;
    getLegend(): Observable<cytoscape.ElementsDefinition>;
    getDiagram(id: number | string): Observable<cytoscape.ElementsDefinition>;
    getStructureVideoHtml(item: {
        id: string | number;
        type: string;
    }, width: number, height: number, uniprotId: string | undefined): string | undefined;
    private getEdgeId;
    private addEdgeInfo;
    private endpoint;
    lastSelectedResource: string | undefined;
    /**
     * Use Matrix power to convert points from an absolute coordinate system to an edge relative system
     *
     * Visually explained by https://youtu.be/kYB8IZa5AuE?si=vJKi-MUv2dCRQ5oA<br>
     * Short version ==> https://math.stackexchange.com/q/1855051/683621
     * @param source Position position of the edge source:  {x:number, y:number}
     * @param target Position position of the edge target:  {x:number, y:number}
     * @param toConvert Array of Position to convert to the edge-relative system
     * @return The points converted to relative coordinates {distances: number[], weights: number[]}
     */
    private absoluteToRelative;
    randomNetwork(): Observable<cytoscape.ElementsDefinition>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DiagramService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DiagramService>;
}

declare class DarkService {
    private _body;
    private _isDark;
    private readonly $_dark;
    readonly $dark: rxjs.Observable<boolean>;
    constructor();
    get isDark(): boolean;
    set isDark(value: boolean);
    static ɵfac: i0.ɵɵFactoryDeclaration<DarkService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DarkService>;
}

/**
 * A diagram that could not be loaded: its id, and the HTTP status of the
 * failed request (0 for a network error, or a failure that is not HTTP's).
 */
interface DiagramLoadFailure {
    diagramId: string;
    status: number;
}
declare class DiagramComponent implements AfterViewInit, OnChanges {
    private diagram;
    dark: DarkService;
    private state;
    dialog: MatDialog;
    private changes;
    private destroyRef;
    title: string;
    cytoscapeContainer?: ElementRef<HTMLDivElement>;
    compareContainer?: ElementRef<HTMLDivElement>;
    legendContainer?: ElementRef<HTMLDivElement>;
    comparing: boolean;
    selectedPsicquicResource: FormControl<any>;
    isDataFromPsicquicLoading: boolean;
    cy: cytoscape.Core;
    cyCompare: cytoscape.Core;
    legend: cytoscape.Core;
    reactomeStyle: Style;
    reactomeStyleCompare: Style;
    private _reactomeEvents$;
    private _ignore;
    private loading?;
    reactomeEvents$: Observable<ReactomeEvent>;
    /**
     * A diagram that could not be loaded. The diagram shown stays, and the
     * failure is still logged.
     */
    readonly loadFailed: i0.OutputEmitterRef<DiagramLoadFailure>;
    diagramId: string;
    usedbId: boolean;
    set blockRouterChange(block: boolean);
    constructor();
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    loadDiagram(): void;
    /**
     * Draws `elements`: what `DiagramService.getDiagram` gives, or a list of
     * elements (the curator tool draws an empty diagram with `[]`), which is
     * never compared.
     */
    displayNetwork(elements: cytoscape.ElementsDefinition | cytoscape.ElementDefinition[]): void;
    private initialiseReplaceElements;
    private loadCompare;
    avoidSideEffect(m: () => void): void;
    /** The diagram and its compare pane, skipping one destroyed or not made. */
    private drawn;
    flagging: Subscription;
    selecting: Subscription;
    private stateToDiagram;
    readonly classRegex: RegExp;
    getElements(tokens: (string | number)[], cy: cytoscape.Core): cytoscape.CollectionArgument;
    resetState(): void;
    select(tokens: string | number, cy: cytoscape.Core): cytoscape.CollectionArgument;
    flag(accs: (string | number)[], cy: cytoscape.Core): cytoscape.CollectionArgument;
    flagElements(toFlag: cytoscape.CollectionArgument, cy: cytoscape.Core): cytoscape.CollectionArgument;
    setSubPathwayVisibility(visible: boolean, cy: cytoscape.Core): void;
    applyEvent(event: ReactomeEvent, affectedElements: cytoscape.NodeCollection | cytoscape.EdgeCollection): void;
    ratio: number;
    replacedElements: cytoscape.SingularElementArgument[];
    replacedElementsPosition: number[];
    lastIndex: number;
    underlayPadding: number;
    private updateReplacementVisibility;
    syncing: boolean;
    syncViewports: (source: cytoscape.Core, sourceContainer: HTMLElement, target: cytoscape.Core, targetContainer: HTMLElement) => void;
    updateStyle(): void;
    compareDragging: boolean;
    dragStart(): void;
    dragEnd(): void;
    dragMove($event: MouseEvent, compareContainer: HTMLDivElement, container: HTMLDivElement): void;
    updateLegend(): void;
    compareBackgroundSync: Subscription;
    diagram2legend: Subscription;
    diagramSelect2state: Subscription;
    diagramUnselect2state: Subscription;
    legend2state: Subscription;
    /** The diagram's elements of a legend element's kind; none before a diagram is drawn. */
    private legendMatches;
    logProteins(): void;
    /**
     * Somehow DiagramService cannot be exported for use out of this package. Therefore, use this method to get this instance.
     */
    getDiagramService(): DiagramService;
    static ɵfac: i0.ɵɵFactoryDeclaration<DiagramComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DiagramComponent, "cr-diagram", never, { "diagramId": { "alias": "id"; "required": false; }; "usedbId": { "alias": "usedbId"; "required": false; }; "blockRouterChange": { "alias": "blockRouterChange"; "required": false; }; }, { "reactomeEvents$": "reactomeEvents$"; "loadFailed": "loadFailed"; }, never, never, true, never>;
}

export { DIAGRAM_CONFIG_TOKEN, DiagramComponent, DiagramService };
export type { DiagramConfig, DiagramLoadFailure };
