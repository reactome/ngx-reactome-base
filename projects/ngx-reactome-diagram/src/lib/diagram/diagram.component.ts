import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  output,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DiagramService } from '../services/diagram.service';
import cytoscape from 'cytoscape';
import {
  interactivityOf,
  ReactomeEvent,
  ReactomeEventTypes,
  Style,
} from 'ngx-reactome-cytoscape-style';
import { DarkService } from '../services/dark.service';
import {
  delay,
  distinctUntilChanged,
  filter,
  Observable,
  share,
  Subject,
  Subscription,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { DiagramStateService } from '../services/diagram-state.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { withData, withLeaf } from './with-data';
import { idData, isSet, numberData, textData } from './element-data';

/**
 * A diagram that could not be loaded: its id, and the HTTP status of the
 * failed request (0 for a network error, or a failure that is not HTTP's).
 */
export interface DiagramLoadFailure {
  diagramId: string;
  status: number;
}

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cr-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss'],
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDragHandle],
})
export class DiagramComponent implements AfterViewInit, OnChanges {
  private diagram = inject(DiagramService);
  dark = inject(DarkService);
  private state = inject(DiagramStateService);
  dialog = inject(MatDialog);
  private changes = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  title = 'pathway-browser';
  @ViewChild('cytoscape') cytoscapeContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('cytoscapeCompare') compareContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('legend') legendContainer?: ElementRef<HTMLDivElement>;

  comparing: boolean = false;
  selectedPsicquicResource = new FormControl();
  isDataFromPsicquicLoading: boolean = false;

  cy!: cytoscape.Core;
  cyCompare!: cytoscape.Core;
  legend!: cytoscape.Core;
  reactomeStyle!: Style;
  reactomeStyleCompare!: Style;

  private _reactomeEvents$: Subject<ReactomeEvent> = new Subject<ReactomeEvent>();
  private _ignore = false;
  private loading?: Subscription;

  @Output()
  public reactomeEvents$: Observable<ReactomeEvent> = this._reactomeEvents$.asObservable().pipe(
    // The component's own events are dropped before the repeats: the other
    // way round, one it made counted as the last, and the user's same event
    // after it was dropped as a repeat (issue #14, bug 8).
    filter(() => !this._ignore),
    distinctUntilChanged(
      (prev, current) =>
        prev.type === current.type && prev.detail.reactomeId === current.detail.reactomeId
    ),
    share()
  );

  /**
   * A diagram that could not be loaded. The diagram shown stays, and the
   * failure is still logged.
   */
  readonly loadFailed = output<DiagramLoadFailure>();

  @Input('id') diagramId: string = '';

  // Flag to control if dbId should be used as primary ids
  // This should be useful in the context of the curator tool since
  // dbIds are used as primary ids. Not all instances have stable ids.
  @Input() usedbId: boolean = false;
  // There are many issues having URL changes for selection state or other
  // state changes in the curator tool environment (e.g conflict with tree URL)
  // therefore, we'd like to block the change by flagging this to true.
  @Input()
  set blockRouterChange(block: boolean) {
    if (this.state) this.state.blockRouterChange = block;
  }

  constructor() {
    // Nothing tore these down: a destroyed component's cores went on drawing,
    // and its theme subscription restyling them (issue #14, bug 11).
    this.destroyRef.onDestroy(() => {
      this.loading?.unsubscribe();
      const cores: (cytoscape.Core | undefined)[] = [this.cy, this.cyCompare, this.legend];
      cores.forEach((cy) => cy?.destroy());
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diagramId']) this.loadDiagram();
  }

  ngAfterViewInit(): void {
    this.dark.$dark.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateStyle());

    const container = viewElement(this.cytoscapeContainer, 'diagram');
    const compareContainer = viewElement(this.compareContainer, 'compare pane');
    const legendContainer = viewElement(this.legendContainer, 'legend');

    Object.values(ReactomeEventTypes).forEach((type) => {
      container.addEventListener(type, (e) => this._reactomeEvents$.next(e as ReactomeEvent));
      compareContainer.addEventListener(type, (e) =>
        this._reactomeEvents$.next(e as ReactomeEvent)
      );
      legendContainer.addEventListener(type, (e) => this._reactomeEvents$.next(e as ReactomeEvent));
    });

    this.reactomeStyle = new Style(container);

    this.diagram.getLegend().subscribe((legend) => {
      this.legend = cytoscape({
        container: legendContainer,
        elements: legend,
        style: this.reactomeStyle?.getStyleSheet(),
        layout: { name: 'preset' },
        boxSelectionEnabled: false,
      });
      this.reactomeStyle?.bindToCytoscape(this.legend);
      this.legend.zoomingEnabled(false);
      this.legend.panningEnabled(false);
      this.legend.minZoom(0);
    });

    this.loadDiagram();

    //this.getPsicquicResources();
  }

  loadDiagram() {
    // A request a later one replaces is dropped: answering more slowly, it
    // replaced the diagram asked for after it (issue #14, bug 3).
    this.loading?.unsubscribe();
    this.loading = undefined;

    if (!this.cytoscapeContainer) return;

    if (!this.diagramId || this.diagramId.trim().length == 0) return; // Nothing to do.

    const id = this.diagramId;
    this.loading = this.diagram.getDiagram(id).subscribe({
      next: (elements) => this.displayNetwork(elements),
      // The diagram shown stays. Unhandled, the failure reached the host only
      // as an uncaught error (issue #14, bug 3); now it is told, by `loadFailed`.
      error: (error: unknown) => {
        console.error(`Diagram ${id} could not be loaded`, error);
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        this.loadFailed.emit({ diagramId: id, status });
      },
    });
  }

  /**
   * Draws `elements`: what `DiagramService.getDiagram` gives, or a list of
   * elements (the curator tool draws an empty diagram with `[]`), which is
   * never compared.
   */
  displayNetwork(elements: cytoscape.ElementsDefinition | cytoscape.ElementDefinition[]) {
    const container = viewElement(this.cytoscapeContainer, 'diagram');
    const fadesOut = (element: cytoscape.ElementDefinition): boolean =>
      Boolean(element.data['isFadeOut']);
    this.comparing =
      !Array.isArray(elements) &&
      [...(elements.nodes ?? []), ...(elements.edges ?? [])].some(fadesOut);
    // Set from a response, which a zoneless host does not check after: the
    // compare pane stayed hidden (issue #14, bug 14).
    this.changes.markForCheck();
    // A new core destroys the one in its container, but a diagram drawn
    // without a compare pane left the last one's: still drawing, and still
    // flagged and selected with the new diagram's state (issue #14, bug 11).
    const replaced: cytoscape.Core | undefined = this.cyCompare;
    replaced?.destroy();
    this.cy = cytoscape({
      container: container,
      elements: elements,
      style: this.reactomeStyle?.getStyleSheet(),
      layout: { name: 'preset' },
      userPanningEnabled: false,
      userZoomingEnabled: false,
      autoungrabify: false,
    });
    this.reactomeStyle.bindToCytoscape(this.cy);
    this.reactomeStyle.clearCache();

    this.loadCompare(elements, this.cy, container);

    // As the state's own changes are shown: zoomed to, and not sent to the
    // host as if clicked (issue #14, bug 7).
    this.avoidSideEffect(() => this.stateToDiagram());

    // Fire an event after this network is displayed.
    const event = new CustomEvent('network_displayed');
    container.dispatchEvent(event);
  }

  private initialiseReplaceElements() {
    if (this.comparing)
      this.cy.batch(() => {
        this.cy.elements('[!isBackground]').style('visibility', 'hidden');
        this.cy.edges('.shadow').style('underlay-padding', 0);
        this.lastIndex = 0;
        this.updateReplacementVisibility();
        this.cy.elements('.Compartment').style('visibility', 'visible');
      });
  }

  private loadCompare(
    elements: cytoscape.ElementsDefinition | cytoscape.ElementDefinition[],
    cy: cytoscape.Core,
    container: HTMLDivElement
  ) {
    // Nothing writes a shadow's `triggerPosition` (none in the fixtures), and
    // no shadow is replaced or crossed; read absent, it is NaN, which sorts
    // and compares as the `undefined` read before.
    const getPosition = (e: cytoscape.SingularElementArgument): number =>
      e.is('.Shadow') ? (numberData(e, 'triggerPosition') ?? NaN) : e.boundingBox().x1;
    const isReplaced = (e: cytoscape.SingularElementArgument) =>
      isSet(e, 'replacedBy') || isSet(e, 'isCrossed');
    if (this.comparing) {
      cy.elements('[!isBackground]').style('visibility', 'hidden');
      this.replacedElements = cy
        .elements('[?replacedBy]')
        .add('[?isCrossed]')
        .sort((a, b) => getPosition(a) - getPosition(b))
        .style('visibility', 'hidden')
        .toArray();

      this.replacedElementsPosition = this.replacedElements.map(getPosition);

      cy.on('add', (e: cytoscape.EventObjectNode | cytoscape.EventObjectEdge) => {
        const addedElement = e.target;
        if (isReplaced(addedElement)) {
          const x = getPosition(addedElement);
          let index = this.replacedElementsPosition.findIndex((x1) => x1 >= x);
          if (index === -1) index = this.replacedElements.length;

          this.replacedElements.splice(index, 0, addedElement);
          this.replacedElementsPosition.splice(index, 0, x);
          addedElement.style('visibility', 'hidden');
        }
      });

      cy.on('remove', (e: cytoscape.EventObjectNode | cytoscape.EventObjectEdge) => {
        const removedElement = e.target;
        const index = this.replacedElements.indexOf(removedElement);
        if (index > -1) {
          this.replacedElements.splice(index, 1);
          this.replacedElementsPosition.splice(index, 1);
        }
      });

      const compareContainer = viewElement(this.compareContainer, 'compare pane');
      const cyCompare = cytoscape({
        container: compareContainer,
        elements: elements,
        style: this.reactomeStyle?.getStyleSheet(),
        layout: { name: 'preset' },
      });
      this.cyCompare = cyCompare;

      cyCompare.elements('[?isFadeOut]').remove();
      cyCompare.elements('.Compartment').remove();
      cy.nodes('.crossed').removeClass('crossed');

      cyCompare.on('viewport', () =>
        this.syncViewports(cyCompare, compareContainer, cy, container)
      );
      cy.on('viewport', () => this.syncViewports(cy, container, cyCompare, compareContainer));

      this.reactomeStyleCompare = new Style(compareContainer);
      this.reactomeStyleCompare?.bindToCytoscape(cyCompare);
      cyCompare.minZoom(cy.minZoom());
      cyCompare.maxZoom(cy.maxZoom());

      // A pane destroyed by then, with its diagram replaced or the component
      // gone, is left alone. One still drawn is the field's, and `cy` the
      // diagram's: replacing the diagram destroys the pane first.
      setTimeout(() => {
        if (cyCompare.destroyed()) return;
        this.syncViewports(cy, container, cyCompare, compareContainer);
        this.initialiseReplaceElements();
      });
    }
  }

  avoidSideEffect(m: () => void) {
    this._ignore = true;
    m();
    this._ignore = false;
  }

  /** The diagram and its compare pane, skipping one destroyed or not made. */
  private drawn(): cytoscape.Core[] {
    const cores: (cytoscape.Core | undefined)[] = [this.cy, this.cyCompare];
    return cores.filter((cy): cy is cytoscape.Core => cy !== undefined && !cy.destroyed());
  }

  flagging = this.state.onChange.flag$.subscribe((value) =>
    this.avoidSideEffect(() => this.drawn().forEach((cy) => this.flag(value, cy)))
  );
  selecting = this.state.onChange.select$.subscribe((value) =>
    this.avoidSideEffect(() => this.drawn().forEach((cy) => this.select(value, cy)))
  );

  private stateToDiagram() {
    for (const cy of this.drawn()) {
      this.flag(this.state.get('flag'), cy);
      this.select(this.state.get('select'), cy);
    }
  }

  readonly classRegex = /class:(\w+)([!.]drug)?/;

  getElements(tokens: (string | number)[], cy: cytoscape.Core): cytoscape.CollectionArgument {
    let elements: cytoscape.Collection;

    elements = cy.collection();
    tokens.forEach((token) => {
      if (typeof token === 'string') {
        // An empty token should be ignored. If this is not done,
        // all objects will be selected since [acc=""] matches all elements without acc attribute.
        if (token.trim().length === 0) return;
        if (token.startsWith('R-')) {
          let own = withData(cy, 'graph.stId', token);
          // Not drawn on its own: the drawn complexes containing it, as in
          // WebsiteAngular's diagram. A monomer drawn only in its multimers
          // found nothing once they had their own stIds (T021, issue #14 bug 4).
          if (own.empty()) own = withLeaf(cy, token);
          elements = elements.or(own);
        } else {
          const matchArray = token.match(this.classRegex);
          if (matchArray) {
            const [_, clazz, drug] = matchArray;
            if (drug === '.drug') {
              // Drug physical entity
              elements = elements.or(`.${clazz}`).and('.drug');
            } else if (drug === '!drug') {
              // Non drug physical entity
              elements = elements.or(`.${clazz}`).not('.drug');
            } else {
              // Non physical entity
              elements = elements.or(`.${clazz}`);
            }
            // A reaction type is found as its nodes; its lines go with them, or
            // flagging it from the legend marked specks (issue #14, bug 13).
            elements = elements.or(elements.nodes('.reaction').connectedEdges());
          } else if (this.usedbId) {
            // A dbId may come as text; it is compared as the number it is.
            const dbId = /^\d+$/.test(token) ? Number(token) : token;
            elements = elements.or(withData(cy, 'reactomeId', dbId));
          } else {
            elements = elements.or(withData(cy, 'acc', token));
          }
        }
      } else {
        elements = elements.or(withData(cy, 'acc', token)).or(withData(cy, 'reactomeId', token));
      }
    });
    return elements;
  }

  // Apparently the selected state is kept when a new diagram is loaded.
  // This method is used to reset the state
  resetState() {
    this.state.set('select', '');
    this.state.set('flag', []);
  }

  select(tokens: string | number, cy: cytoscape.Core): cytoscape.CollectionArgument {
    cy.elements(':selected').unselect();
    let selected = this.getElements([tokens], cy);
    selected.select();
    if ('connectedNodes' in selected) {
      selected = selected.add(selected.connectedNodes());
    }

    // Only the view is fitted; the compare pane follows it (syncViewports).
    // Fitting the pane too fitted the view to the pane (issue #14, bug 9).
    if (this._ignore && cy === this.cy) {
      cy.animate({
        fit: {
          eles: selected,
          padding: 100,
        },
        duration: 1000,
        easing: 'ease-in-out',
      });
    }

    return selected;
  }

  flag(accs: (string | number)[], cy: cytoscape.Core): cytoscape.CollectionArgument {
    return this.flagElements(this.getElements(accs, cy), cy);
  }

  flagElements(
    toFlag: cytoscape.CollectionArgument,
    cy: cytoscape.Core
  ): cytoscape.CollectionArgument {
    if (toFlag.nonempty()) {
      cy.batch(() => {
        this.setSubPathwayVisibility(false, cy);
        cy.elements().removeClass('flag');
        // The stylesheet's `edge.flag` rule draws the halo. Written inline, it
        // outlived the flag: cleared, the lines kept an opaque underlay, black
        // without the class's colour (issue #14, bug 2).
        toFlag.addClass('flag').edges().removeStyle('underlay-opacity');
      });

      return toFlag;
    } else {
      cy.batch(() => {
        cy.elements().removeClass('flag');
        cy.edges().not('[?color]').style({ 'underlay-opacity': 0 });
      });
      // Outside the batch: the zoom handler this hands the bands back to reads
      // their colour, which a batch has not yet restyled, and read black it
      // hid them all (issue #14, bug 2).
      this.setSubPathwayVisibility(true, cy);

      return cy.collection();
    }
  }

  setSubPathwayVisibility(visible: boolean, cy: cytoscape.Core) {
    const shadowNodes = cy.nodes('.Shadow');
    const shadowEdges = cy.edges('[?color]');
    const trivials = cy.elements('.trivial');

    if (visible) {
      shadowNodes.style({ opacity: 1 });
      // Back to the zoom handler, which owns their opacity again from here.
      trivials.removeClass('always-visible');
      shadowEdges.addClass('shadow');
      // The handlers bound to this graph: cy.data('reactome').interactivity is
      // whichever graph its Style was bound to last.
      const onZoomShadow = interactivityOf(cy)?.onZoom.shadow;
      if (onZoomShadow) {
        cy.on('zoom', onZoomShadow);
        onZoomShadow();
      }
    } else {
      shadowNodes.style({ opacity: 0 });
      shadowEdges.removeClass('shadow');
      const onZoomShadow = interactivityOf(cy)?.onZoom.shadow;
      if (onZoomShadow) cy.off('zoom', onZoomShadow);
      // A class, not an inline opacity: a restyle runs the zoom handler, which
      // rewrote the inline value and faded them out while flagged; it leaves
      // `.always-visible` alone (issue #14, bug 12). The inline value it last
      // wrote goes first, since an inline style beats the class's rule.
      trivials.removeStyle('opacity').addClass('always-visible');
      // Not a flagged line: hiding the bands must not take the flag's halo.
      cy.edges().not('.flag').style({ 'underlay-opacity': 0 });
    }
  }

  applyEvent(
    event: ReactomeEvent,
    affectedElements: cytoscape.NodeCollection | cytoscape.EdgeCollection
  ) {
    switch (event.type) {
      case ReactomeEventTypes.hover:
        affectedElements.addClass('hover');
        break;
      case ReactomeEventTypes.leave:
        affectedElements.removeClass('hover');
        break;
      case ReactomeEventTypes.select:
        affectedElements.select();
        break;
      case ReactomeEventTypes.unselect:
        affectedElements.unselect();
        break;
    }
  }

  ratio = 0.384;

  replacedElements!: cytoscape.SingularElementArgument[];
  replacedElementsPosition: number[] = [];

  lastIndex = 0;
  underlayPadding = 0;

  private updateReplacementVisibility() {
    // // Calculate the position of the element that is to the right of the separation

    // Only a compare pane's extent says which replaced elements show.
    const cyCompare: cytoscape.Core | undefined = this.cyCompare;
    if (cyCompare === undefined) return;
    const extent = cyCompare.extent();
    let limitIndex = this.replacedElementsPosition.findIndex((x1) => x1 >= extent.x1);
    if (limitIndex === -1) limitIndex = this.replacedElements.length;

    /// Alternative calculation. In theory more optimised, but seems worse when console is opened for some reason

    // const currentPos = this.cyCompare!.extent().x1;
    // let limitIndex = this.lastIndex;
    // let i = this.lastIndex;
    // if (currentPos > this.lastPosition) { // Dragging to the right
    //   while (i >= 0 && this.replacedElementsPosition[i] < currentPos) i++;
    //   limitIndex = i;
    // } else if (currentPos < this.lastPosition) { // Dragging to the left
    //   do i--;
    //   while (i < this.replacedElementsPosition.length  && this.replacedElementsPosition[i] >= currentPos)
    //   limitIndex = i+1;
    // }
    //
    // this.lastPosition = currentPos;
    // ---------

    if (this.lastIndex !== limitIndex) {
      // If at least one element is switched from left to right
      if (limitIndex < this.lastIndex)
        this.replacedElements
          .slice(limitIndex, this.lastIndex)
          .map((e) => e.style('visibility', 'hidden')) // Hide the range of elements
          .filter((e) => e.is('.Shadow')) // And if it is an shadow
          .forEach((shadow) => subPathwayEdges(shadow).style('underlay-padding', 0)); // Hide as well the associated reaction underlay
      // If at least one element is switched from right to left
      if (limitIndex > this.lastIndex)
        this.replacedElements
          .slice(this.lastIndex, limitIndex)
          .map((e) => e.style('visibility', 'visible')) // Show the range of elements
          .filter((e) => e.is('.Shadow')) // And if it is an shadow
          .forEach((shadow) =>
            subPathwayEdges(shadow).style('underlay-padding', this.underlayPadding)
          ); // Show as well the associated reaction underlay
    }
    this.lastIndex = limitIndex;
  }

  syncing = false;
  syncViewports = (
    source: cytoscape.Core,
    sourceContainer: HTMLElement,
    target: cytoscape.Core,
    targetContainer: HTMLElement
  ) => {
    if (this.syncing) return;
    this.syncing = true;
    this.updateReplacementVisibility();

    const position = { ...source.pan() };
    const sourceX = sourceContainer.getBoundingClientRect().x;
    const targetX = targetContainer.getBoundingClientRect().x;
    position.x += sourceX - targetX;
    target.viewport({
      zoom: source.zoom(),
      pan: position,
    });
    this.syncing = false;
  };

  updateStyle() {
    const cores: (cytoscape.Core | undefined)[] = [...this.drawn(), this.legend];
    for (const cy of cores) {
      if (!cy) continue;
      setTimeout(() => {
        if (!cy.destroyed()) this.reactomeStyle?.update(cy);
      }, 5);
    }
  }

  compareDragging = false;

  dragStart() {
    this.compareDragging = true;
  }

  dragEnd() {
    this.compareDragging = false;
  }

  dragMove($event: MouseEvent, compareContainer: HTMLDivElement, container: HTMLDivElement) {
    if (!this.compareDragging) return;
    compareContainer.style['left'] = $event.x - container.getBoundingClientRect().x + 'px';
    // The handle is in the compare pane, shown only once one is drawn.
    const cy: cytoscape.Core | undefined = this.cy;
    const cyCompare: cytoscape.Core | undefined = this.cyCompare;
    if (cy === undefined || cyCompare === undefined) return;
    cyCompare.resize();
    this.syncViewports(
      cy,
      viewElement(this.cytoscapeContainer, 'diagram'),
      cyCompare,
      viewElement(this.compareContainer, 'compare pane')
    );
  }

  updateLegend() {
    this.legend.resize();
    this.legend.panningEnabled(true);
    this.legend.zoomingEnabled(true);
    this.legend.fit(this.legend.elements(), 2);
    this.legend.panningEnabled(false);
    this.legend.zoomingEnabled(false);
  }

  // ----- Event Syncing -----

  // stateToDiagramSub = this.state.state$.subscribe(() => this.stateToDiagram());

  compareBackgroundSync = this.reactomeEvents$
    .pipe(
      filter(() => this.comparing),
      filter((e) => e.detail.cy !== this.legend)
    )
    .subscribe((event) => {
      const src = event.detail.cy;
      const tgt = src === this.cy ? this.cyCompare : this.cy;

      // The counterpart's id, as the diagram service writes it: text, or a
      // number for a connector's `replacement`. A reaction's `replacement`
      // was a raw layout edge, read here for its `reactomeId`; since T021
      // (#34) it is the counterpart's id, and nothing writes an object there.
      // An event's element is a node (a line sends its reaction's node), and
      // a reaction node's ids are text, so the lines are not added today.
      const element = event.detail.element;
      const replacedBy =
        idData(element, 'replacedBy') ??
        idData(element, 'replacement') ??
        (isSet(element, 'isBackground') && !isSet(element, 'isFadeOut')
          ? idData(element, 'id')
          : undefined);

      if (replacedBy === undefined) return;

      let replacements = tgt.getElementById(String(replacedBy));
      if (event.detail.type === 'reaction' && typeof replacedBy === 'number')
        replacements = replacements.add(withData(tgt, 'reactionId', replacedBy));

      this.applyEvent(event, replacements);
    });

  // interactorHandling = this.reactomeEvents$
  //   .pipe(
  //     filter((e) => e.detail.cy !== this.legend),
  //     filter(e => [ReactomeEventTypes.open, ReactomeEventTypes.close].includes(e.type as ReactomeEventTypes)),
  //     filter(e => e.detail.type === 'Interactor'),
  //   ).subscribe(e => {
  //       this.interactorsService.addInteractorNodes(e.detail.element.nodes(), this.cy);
  //       this.reactomeStyle.interactivity.updateProteins();
  //       this.reactomeStyle.interactivity.onZoom();
  //     }
  //   );

  // Not before the legend is made: read then, it threw (found in T017).
  diagram2legend = this.reactomeEvents$
    .pipe(filter((e) => this.legend !== undefined && e.detail.cy !== this.legend))
    .subscribe((event) => {
      const classes = event.detail.element.classes();
      let matchingElement: cytoscape.NodeCollection | cytoscape.EdgeCollection =
        this.legend.elements(`.${classes[0]}`);

      if (event.detail.type === 'PhysicalEntity') {
        if (classes.includes('drug')) matchingElement = matchingElement.nodes('.drug');
        else matchingElement = matchingElement.not('.drug');
      } else if (event.detail.type === 'reaction') {
        const reaction = event.detail.element.nodes('.reaction');
        matchingElement = this.legend.nodes(`.${reaction.classes()[0]}`).first();
        matchingElement = matchingElement.add(matchingElement.connectedEdges());
      }

      this._ignore = true;
      this.applyEvent(event, matchingElement);
      this._ignore = false;
    });

  diagramSelect2state = this.reactomeEvents$
    .pipe(
      filter((e) => e.detail.cy !== this.legend),
      delay(0)
    )
    .subscribe((e) => {
      if (e.type !== ReactomeEventTypes.select) return;
      let elements: cytoscape.NodeCollection = e.detail.element;
      if (e.detail.type === 'reaction') {
        elements = e.detail.cy.elements('node.reaction:selected');
      }
      const ids: (string | number | undefined)[] = this.usedbId
        ? elements.map((el) => numberData(el, 'reactomeId'))
        : elements.map((el) => textData(el, 'graph.stId'));
      // An element with no graph data (the faded normal pathway of a disease
      // diagram) has no id, and leaves the selection as it was: it set it to
      // '', which unselected everything (issue #14, bug 6).
      const reactomeIds = Array.from(new Set(ids)).filter(
        (id): id is string | number => id !== undefined && id !== ''
      );
      if (reactomeIds.length === 0) return;
      this.state.set('select', reactomeIds[0]);
    });

  // Deselecting the selected element clears the selection. It was kept, so
  // selecting the same element again changed nothing, and the next redraw from
  // the state brought the cleared selection back (issue #14, bug 10). Checked
  // once the event is handled: clicking another element deselects this one
  // first, and a redraw from the state deselects and reselects it.
  diagramUnselect2state = this.reactomeEvents$
    .pipe(
      filter((e) => e.detail.cy !== this.legend && e.type === ReactomeEventTypes.unselect),
      delay(0)
    )
    .subscribe((e) => {
      if (e.detail.cy.elements(':selected').nonempty()) return;
      const element: cytoscape.NodeCollection = e.detail.element;
      const id: unknown = element.data(this.usedbId ? 'reactomeId' : 'graph.stId');
      if (id !== undefined && String(id) === String(this.state.get('select'))) {
        this.state.set('select', '');
      }
    });

  // A click sets the flag even before a diagram is drawn: the state is drawn
  // when the diagram arrives (displayNetwork). Only a hover reads the diagram,
  // and before one is drawn has nothing to mark (reading it threw, T020).
  legend2state = this.reactomeEvents$
    .pipe(
      filter((e) => e.detail.cy === this.legend),
      filter(() => !this._ignore)
    )
    .subscribe((event) => {
      const classes = event.detail.element.classes();
      switch (event.type) {
        case ReactomeEventTypes.select:
          this.state.set('flag', [
            'class:' + classes[0] + (classes.includes('drug') ? '.' : '!') + 'drug',
          ]);
          this.stateToDiagram();
          break;
        case ReactomeEventTypes.unselect:
          this.state.set('flag', []);
          this.stateToDiagram();
          break;
        case ReactomeEventTypes.hover:
          this.legendMatches(event)?.addClass('hover');
          break;
        case ReactomeEventTypes.leave:
          this.legendMatches(event)?.removeClass('hover');
          break;
      }
    });

  /** The diagram's elements of a legend element's kind; none before a diagram is drawn. */
  private legendMatches(
    event: ReactomeEvent
  ): cytoscape.NodeCollection | cytoscape.EdgeCollection | undefined {
    const cy: cytoscape.Core | undefined = this.cy;
    if (cy === undefined) return undefined;
    const classes = event.detail.element.classes();
    let matchingElement: cytoscape.NodeCollection | cytoscape.EdgeCollection = cy.elements(
      `.${classes[0]}`
    );

    if (event.detail.type === 'PhysicalEntity' || event.detail.type === 'Pathway') {
      if (classes.includes('drug')) matchingElement = matchingElement.nodes('.drug');
      else matchingElement = matchingElement.not('.drug');
    } else if (event.detail.type === 'reaction') {
      const reaction = event.detail.element.nodes('.reaction');
      matchingElement = cy.nodes(`.${reaction.classes()[0]}`);
      matchingElement = matchingElement.add(matchingElement.connectedEdges());
    }
    return matchingElement;
  }

  logProteins() {
    // eslint-disable-next-line no-console -- logging is what it is called for
    console.debug(
      new Set(
        this.cy.nodes('.Protein').map((node): unknown => node.data('acc') || node.data('iAcc'))
      )
    );
  }

  /**
   * Somehow DiagramService cannot be exported for use out of this package. Therefore, use this method to get this instance.
   */
  getDiagramService(): DiagramService {
    return this.diagram;
  }
}

/**
 * A sub-pathway's lines: its pathway's edges, as the style library finds them
 * (`initSubPathwayColors`, which keeps them on the shadow as `edges`, a value
 * typed as anything). A shadow without a database id has none.
 */
function subPathwayEdges(shadow: cytoscape.SingularElementArgument): cytoscape.EdgeCollection {
  const pathway = numberData(shadow, 'reactomeId');
  return pathway === undefined
    ? shadow.cy().collection().edges()
    : withData(shadow.cy(), 'pathway', pathway).edges();
}

/**
 * A view child's element. The three are in the template unconditionally, so
 * each is there from the view's creation; asked for before then, or after a
 * template that lost one, it is a mistake, and said so.
 */
function viewElement(ref: ElementRef<HTMLDivElement> | undefined, name: string): HTMLDivElement {
  if (ref === undefined)
    throw new Error(`DiagramComponent: the ${name} element is not in the view yet.`);
  return ref.nativeElement;
}
