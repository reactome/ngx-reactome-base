import * as rxjs from 'rxjs';
import { Observable } from 'rxjs';
import * as i0 from '@angular/core';
import { InjectionToken, AfterViewInit, OnChanges, ElementRef, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import cytoscape from 'cytoscape';
import { Style, ReactomeEvent } from 'ngx-reactome-cytoscape-style';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

interface Position {
    x: number;
    y: number;
}

declare const DIAGRAM_CONFIG_TOKEN: InjectionToken<any>;
declare class DiagramService {
    private http;
    private config;
    extraLine: Map<string, Position>;
    reverseExtraLine: Map<string, Position>;
    constructor(http: HttpClient, config: any);
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

interface UrlParam<T> {
    value: T;
    otherTokens?: string[];
}
type State = {
    [token: string]: UrlParam<any>;
    select: UrlParam<string | number>;
    flag: UrlParam<(string | number)[]>;
    path: UrlParam<string[]>;
    flagInteractors: UrlParam<boolean>;
    overlay: UrlParam<string | null>;
    analysis: UrlParam<string | null>;
    analysisProfile: UrlParam<string | null>;
};
type ObservableState = {
    [K in keyof State as `${K & string}$`]: Observable<State[K]['value']>;
};
declare class DiagramStateService {
    private router;
    private ignore;
    blockRouterChange: boolean;
    private state;
    private _state$;
    state$: Observable<State>;
    onChange: ObservableState;
    constructor(route: ActivatedRoute, router: Router);
    get<T extends keyof State>(token: T): State[T]['value'];
    set<T extends keyof State>(token: T, value: State[T]['value']): void;
    onPropertyModified(): Promise<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DiagramStateService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DiagramStateService>;
}

declare class DiagramComponent implements AfterViewInit, OnChanges {
    private diagram;
    dark: DarkService;
    private state;
    dialog: MatDialog;
    title: string;
    cytoscapeContainer?: ElementRef<HTMLDivElement>;
    compareContainer?: ElementRef<HTMLDivElement>;
    legendContainer?: ElementRef<HTMLDivElement>;
    comparing: boolean;
    selectedPsicquicResource: FormControl<any>;
    isDataFromPsicquicLoading: boolean;
    constructor(diagram: DiagramService, dark: DarkService, state: DiagramStateService, dialog: MatDialog);
    cy: cytoscape.Core;
    cyCompare: cytoscape.Core;
    legend: cytoscape.Core;
    reactomeStyle: Style;
    reactomeStyleCompare: Style;
    private _reactomeEvents$;
    private _ignore;
    reactomeEvents$: Observable<ReactomeEvent>;
    diagramId: string;
    usedbId: boolean;
    set blockRouterChange(block: boolean);
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    loadDiagram(): void;
    displayNetwork(elements: any): void;
    private initialiseReplaceElements;
    private loadCompare;
    avoidSideEffect(m: () => any): void;
    flagging: rxjs.Subscription;
    selecting: rxjs.Subscription;
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
    compareBackgroundSync: rxjs.Subscription;
    diagram2legend: rxjs.Subscription;
    diagramSelect2state: rxjs.Subscription;
    legend2state: rxjs.Subscription;
    logProteins(): void;
    /**
     * Somehow DiagramService cannot be exported for use out of this package. Therefore, use this method to get this instance.
     */
    getDiagramService(): DiagramService;
    static ɵfac: i0.ɵɵFactoryDeclaration<DiagramComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DiagramComponent, "cr-diagram", never, { "diagramId": { "alias": "id"; "required": false; }; "usedbId": { "alias": "usedbId"; "required": false; }; "blockRouterChange": { "alias": "blockRouterChange"; "required": false; }; }, { "reactomeEvents$": "reactomeEvents$"; }, never, never, true, never>;
}

export { DIAGRAM_CONFIG_TOKEN, DiagramComponent, DiagramService };
