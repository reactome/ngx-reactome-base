import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef, Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { DiagramService } from "../services/diagram.service";
import cytoscape from "cytoscape";
// @ts-ignore
import { ReactomeEvent, ReactomeEventTypes, Style } from "ngx-reactome-cytoscape-style";
import { DarkService } from "../services/dark.service";
import { delay, distinctUntilChanged, filter, Observable, share, Subject, tap } from "rxjs";
import { FormControl } from "@angular/forms";
import { DiagramStateService } from "../services/diagram-state.service";
import { UntilDestroy } from "@ngneat/until-destroy";
import { MatDialog } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';

@UntilDestroy({checkProperties: true})
@Component({
    selector: 'cr-diagram',
    templateUrl: './diagram.component.html',
    styleUrls: ['./diagram.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        CdkDrag
    ]
})
export class DiagramComponent implements AfterViewInit, OnChanges {
  title = 'pathway-browser';
  @ViewChild('cytoscape') cytoscapeContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('cytoscapeCompare') compareContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('legend') legendContainer?: ElementRef<HTMLDivElement>;

  comparing: boolean = false;
  selectedPsicquicResource = new FormControl();
  isDataFromPsicquicLoading: boolean = false;


  constructor(private diagram: DiagramService, public dark: DarkService, private state: DiagramStateService, public dialog: MatDialog, private cdr: ChangeDetectorRef) {
  }

  cy!: cytoscape.Core;
  cyCompare!: cytoscape.Core;
  legend!: cytoscape.Core;
  reactomeStyle!: Style;
  reactomeStyleCompare!: Style;
  
  private _reactomeEvents$: Subject<ReactomeEvent> = new Subject<ReactomeEvent>();
  private _ignore = false;

  @Output()
  public reactomeEvents$: Observable<ReactomeEvent> = this._reactomeEvents$.asObservable().pipe(
    distinctUntilChanged((prev, current) => prev.type === current.type && prev.detail.reactomeId === current.detail.reactomeId),
    tap(e => console.log(e.type, e.detail, e.detail.element.data(), e.detail.cy.container()?.id)),
    filter(() => !this._ignore),
    share()
  );


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
    if (this.state)
      this.state.blockRouterChange = block;
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diagramId']) this.loadDiagram();
  }

  ngAfterViewInit(): void {
    this.dark.$dark.subscribe(this.updateStyle.bind(this))

    const container = this.cytoscapeContainer!.nativeElement;
    const compareContainer = this.compareContainer!.nativeElement;
    const legendContainer = this.legendContainer!.nativeElement;

    Object.values(ReactomeEventTypes).forEach((type) => {
      container.addEventListener(type, (e) => this._reactomeEvents$.next(e as ReactomeEvent))
      compareContainer.addEventListener(type, (e) => this._reactomeEvents$.next(e as ReactomeEvent))
      legendContainer.addEventListener(type, (e) => this._reactomeEvents$.next(e as ReactomeEvent))
    })

    this.reactomeStyle = new Style(container);

    this.diagram.getLegend()
      .subscribe(legend => {
        this.legend = cytoscape({
          container: legendContainer,
          elements: legend,
          style: this.reactomeStyle?.getStyleSheet(),
          layout: {name: "preset"},
          boxSelectionEnabled: false
        });
        this.reactomeStyle?.bindToCytoscape(this.legend);
        this.legend.zoomingEnabled(false);
        this.legend.panningEnabled(false);
        this.legend.minZoom(0)
        const bb = this.legend.elements().boundingBox();
        // this.ratio = bb.w / bb.h;
      });

    this.loadDiagram();

    //this.getPsicquicResources();
  }

  loadDiagram() {
    if (!this.cytoscapeContainer) return;

    if (!this.diagramId || this.diagramId.trim().length == 0)
      return; // Nothing to do.

    this.diagram.getDiagram(this.diagramId)
      .subscribe(elements => {
        this.displayNetwork(elements);
      })
  }

  displayNetwork(elements: any) {
    const container = this.cytoscapeContainer!.nativeElement;
    this.comparing = (elements.nodes && elements.nodes.some((node: any) => node.data['isFadeOut'])) || 
                     (elements.edges && elements.edges.some((edge: any) => edge.data['isFadeOut']))
    this.cy = cytoscape({
      container: container,
      elements: elements,
      style: this.reactomeStyle?.getStyleSheet(),
      layout: {name: "preset"},
      userPanningEnabled: false,
      userZoomingEnabled: false,
      autoungrabify: false
    });
    this.reactomeStyle.bindToCytoscape(this.cy);
    this.reactomeStyle.clearCache();

    this.loadCompare(elements, container);

    this.stateToDiagram();

    // Fire an event after this network is displayed.
    const event = new CustomEvent("network_displayed");
    container.dispatchEvent(event);
  }

  private initialiseReplaceElements() {
    if (this.comparing)
      this.cy.batch(() => {
        this.cy.elements('[!isBackground]').style('visibility', 'hidden')
        this.cy.edges('.shadow').style('underlay-padding', 0)
        this.lastIndex = 0;
        this.updateReplacementVisibility();
        this.cy.elements('.Compartment').style('visibility', 'visible')
      })
  }

  private loadCompare(elements: cytoscape.ElementsDefinition, container: HTMLDivElement) {

    const getPosition = (e: cytoscape.SingularElementArgument) => e.is('.Shadow') ? e.data('triggerPosition') : e.boundingBox().x1;
    if (this.comparing) {
      this.cy.elements('[!isBackground]').style('visibility', 'hidden')
      this.replacedElements = this.cy!
        .elements('[?replacedBy]')
        .add('[?isCrossed]')
        .sort((a, b) => getPosition(a) - getPosition(b))
        .style('visibility', 'hidden')
        .toArray();

      this.replacedElementsPosition = this.replacedElements.map(getPosition);


      this.cy.on('add', e => {
        const addedElement = e.target;
        if (addedElement.data('replacedBy') || addedElement.data('isCrossed')) {
          const x = getPosition(addedElement);
          let index = this.replacedElementsPosition.findIndex(x1 => x1 >= x);
          if (index === -1) index = this.replacedElements.length;

          this.replacedElements.splice(index, 0, addedElement);
          this.replacedElementsPosition.splice(index, 0, x);
          addedElement.style('visibility', 'hidden');
        }
      })

      this.cy.on('remove', e => {
        const removedElement = e.target;
        const index = this.replacedElements.indexOf(removedElement);
        if (index > -1) {
          this.replacedElements.splice(index, 1);
          this.replacedElementsPosition.splice(index, 1);
        }
      })

      const compareContainer = this.compareContainer!.nativeElement;
      this.cyCompare = cytoscape({
        container: compareContainer,
        elements: elements,
        style: this.reactomeStyle?.getStyleSheet(),
        layout: { name: "preset" },
      });
      
      this.cyCompare.elements('[?isFadeOut]').remove();
      this.cyCompare.elements('.Compartment').remove();
      this.cy!.nodes('.crossed').removeClass('crossed');

      this.cyCompare!.on('viewport', () => this.syncViewports(this.cyCompare, compareContainer, this.cy, container))
      this.cy!.on('viewport', () => this.syncViewports(this.cy, container, this.cyCompare, compareContainer))

      this.reactomeStyleCompare = new Style(compareContainer);
      this.reactomeStyleCompare?.bindToCytoscape(this.cyCompare);
      this.cyCompare.minZoom(this.cy!.minZoom())
      this.cyCompare.maxZoom(this.cy!.maxZoom())

      setTimeout(() => {
        this.syncViewports(this.cy!, container, this.cyCompare, compareContainer)
        this.initialiseReplaceElements();
      })
    }
  }


  avoidSideEffect(m: () => any) {
    this._ignore = true;
    m();
    this._ignore = false;
  }

  flagging = this.state.onChange.flag$.subscribe((value) => this.avoidSideEffect(
    () => [this.cy, this.cyCompare].forEach(cy => {if (cy) {this.flag(value, cy)} })
  ));
  selecting = this.state.onChange.select$.subscribe((value) => this.avoidSideEffect(
    () => [this.cy, this.cyCompare].forEach(cy => {if (cy) {this.select(value, cy)} })
  ));

  private stateToDiagram() {
    // for (let cy of [this.cy, this.cyCompare].filter(cy => cy !== undefined)) {
    //   this.flag(this.state.get('flag'), cy);
    //   this.select(this.state.get("select"), cy);
    // }
  }

  readonly classRegex = /class:(\w+)([!.]drug)?/

  getElements(tokens: (string | number)[], cy: cytoscape.Core): cytoscape.CollectionArgument {
    let elements: cytoscape.Collection;

    elements = cy.collection()
    tokens.forEach(token => {
      if (typeof token === 'string') {
        if (token.startsWith('R-')) {
          elements = elements.or(`[graph.stId="${token}"]`)
        } else {
          const matchArray = token.match(this.classRegex);
          if (matchArray) {
            const [_, clazz, drug] = matchArray;
            if (drug === '.drug') { // Drug physical entity
              elements = elements.or(`.${clazz}`).and('.drug');
            } else if (drug === '!drug') { // Non drug physical entity
              elements = elements.or(`.${clazz}`).not('.drug');
            } else { // Non physical entity
              elements = elements.or(`.${clazz}`);
            }
          } 
          else if (this.usedbId) {
            // It is possible dbId is encoded in string
            elements = elements.or(`[reactomeId=${token}]`);
          }
          else {
            elements = elements.or(`[acc=${token}]`)
          }
        }
      } else {
        console.log('number')
        elements = elements.or(`[acc=${token}]`).or(`[reactomeId=${token}]`)
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

  select(tokens: (string | number), cy: cytoscape.Core): cytoscape.CollectionArgument {
    cy.elements(':selected').unselect();
    let selected = this.getElements([tokens], cy);
    selected.select();
    if ("connectedNodes" in selected) {
      selected = selected.add(selected.connectedNodes());
    }

    if (this._ignore) {
      cy.animate({
        fit: {
          eles: selected,
          padding: 100
        },
        duration: 1000,
        easing: "ease-in-out"
      })
    }

    return selected;
  }

  flag(accs: (string | number)[], cy: cytoscape.Core): cytoscape.CollectionArgument {
    return this.flagElements(this.getElements(accs, cy), cy)
  }

  flagElements(toFlag: cytoscape.CollectionArgument, cy: cytoscape.Core): cytoscape.CollectionArgument {
      const shadowNodes = cy.nodes('.Shadow');
      const shadowEdges = cy.edges('[?color]');
      const trivials = cy.elements('.trivial');
  
      if (toFlag.nonempty()) {
        cy.batch(() => {
          this.setSubPathwayVisibility(false, cy);
          cy.elements().removeClass('flag')
          toFlag.addClass('flag')
            .edges().style({'underlay-opacity': 1})
        })
  
        return toFlag
      } else {
        cy.batch(() => {
          this.setSubPathwayVisibility(true, cy);
          cy.elements().removeClass('flag');
        })
  
        return cy.collection()
      }
    }
  
  setSubPathwayVisibility(visible: boolean, cy: cytoscape.Core) {
    const shadowNodes = cy.nodes('.Shadow');
    const shadowEdges = cy.edges('[?color]');
    const trivials = cy.elements('.trivial');

    if (visible) {
      shadowNodes.style({opacity: 1})
      trivials.style({opacity: 1})
      shadowEdges.addClass('shadow')
      cy.on('zoom', cy.data('reactome').interactivity.onZoom.shadow)
      cy.data('reactome').interactivity.onZoom.shadow()
    } else {
      shadowNodes.style({opacity: 0})
      shadowEdges.removeClass('shadow')
      cy.off('zoom', cy.data('reactome').interactivity.onZoom.shadow)
      trivials.style({opacity: 1})
      cy.edges().style({'underlay-opacity': 0})
    }
  }


  applyEvent(event: ReactomeEvent, affectedElements: cytoscape.NodeCollection | cytoscape.EdgeCollection) {
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

    const extent = this.cyCompare!.extent();
    let limitIndex = this.replacedElementsPosition.findIndex(x1 => x1 >= extent.x1);
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
      if (limitIndex < this.lastIndex) this.replacedElements.slice(limitIndex, this.lastIndex)
        .map(e => e.style('visibility', 'hidden')) // Hide the range of elements
        .filter(e => e.is('.Shadow')) // And if it is an shadow
        .forEach(shadow => shadow.data('edges').style('underlay-padding', 0)) // Hide as well the associated reaction underlay
      // If at least one element is switched from right to left
      if (limitIndex > this.lastIndex) this.replacedElements.slice(this.lastIndex, limitIndex)
        .map(e => e.style('visibility', 'visible')) // Show the range of elements
        .filter(e => e.is('.Shadow')) // And if it is an shadow
        .forEach(shadow => shadow.data('edges').style('underlay-padding', this.underlayPadding)) // Show as well the associated reaction underlay
    }
    this.lastIndex = limitIndex
  }

  syncing = false;
  syncViewports = (source: cytoscape.Core, sourceContainer: HTMLElement, target: cytoscape.Core, targetContainer: HTMLElement) => {
    if (this.syncing) return;
    this.syncing = true;
    this.updateReplacementVisibility();

    const position = {...source.pan()};
    const sourceX = sourceContainer.getBoundingClientRect().x;
    const targetX = targetContainer.getBoundingClientRect().x;
    position.x += sourceX - targetX;
    target.viewport({
      zoom: source.zoom(),
      pan: position,
    })
    this.syncing = false;
  };


  updateStyle() {
    this.cy ? setTimeout(() => this.reactomeStyle?.update(this.cy), 5) : null;
    this.cyCompare ? setTimeout(() => this.reactomeStyle?.update(this.cyCompare), 5) : null;
    this.legend ? setTimeout(() => this.reactomeStyle?.update(this.legend), 5) : null;
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
    this.cyCompare.resize()
    this.syncViewports(this.cy!, this.cytoscapeContainer!.nativeElement, this.cyCompare!, this.compareContainer!.nativeElement);
  }

  updateLegend() {
    this.legend.resize()
    this.legend.panningEnabled(true)
    this.legend.zoomingEnabled(true)
    this.legend.fit(this.legend.elements(), 2)
    this.legend.panningEnabled(false)
    this.legend.zoomingEnabled(false)
  }

  // ----- Event Syncing -----

  // stateToDiagramSub = this.state.state$.subscribe(() => this.stateToDiagram());
  
  compareBackgroundSync = this.reactomeEvents$.pipe(
    filter(() => this.comparing),
    filter((e) => e.detail.cy !== this.legend)
  ).subscribe(event => {
    const src = event.detail.cy;
    const tgt = src === this.cy ? this.cyCompare : this.cy;

    let replacedBy = event.detail.element.data('replacedBy');
    replacedBy = replacedBy || event.detail.element.data('replacement');
    replacedBy = replacedBy || (event.detail.element.data('isBackground') && !event.detail.element.data('isFadeOut') && event.detail.element.data('id'));

    if (!replacedBy) return;

    let replacements = tgt.getElementById(replacedBy);
    if (event.detail.type === 'reaction') {
      // Need to check if replaceBy is an object or a number
      if (typeof replacedBy === 'object') {
        // If replacedBy is an object, try to get its id property
        replacedBy = replacedBy.reactomeId;
      }
      if (typeof replacedBy === 'number') // Looks like there is a bug in cytoscape. check for object will return all elements.
        replacements = replacements.add(tgt.elements(`[reactionId=${replacedBy}]`))
    }

    this.applyEvent(event, replacements)
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

  diagram2legend = this.reactomeEvents$.pipe(
    filter((e) => e.detail.cy !== this.legend),
  ).subscribe(event => {
    const classes = event.detail.element.classes();
    let matchingElement: cytoscape.NodeCollection | cytoscape.EdgeCollection = this.legend.elements(`.${classes[0]}`);

    if (event.detail.type === 'PhysicalEntity') {
      if (classes.includes('drug')) matchingElement = matchingElement.nodes('.drug')
      else matchingElement = matchingElement.not('.drug')
    } else if (event.detail.type === 'reaction') {
      const reaction = event.detail.element.nodes('.reaction');
      matchingElement = this.legend.nodes(`.${reaction.classes()[0]}`).first()
      matchingElement = matchingElement.add(matchingElement.connectedEdges())
    }

    this._ignore = true;
    this.applyEvent(event, matchingElement);
    this._ignore = false;
  });

  diagramSelect2state = this.reactomeEvents$.pipe(
    filter((e) => e.detail.cy !== this.legend),
    delay(0)
  ).subscribe(e => {
      if (e.type !== ReactomeEventTypes.select) return;
      let elements: cytoscape.NodeSingular = e.detail.element;
      if (e.detail.type === 'reaction') {
        elements = e.detail.cy.elements('node.reaction:selected')
      }
      let reactomeIds = []
      if (this.usedbId)
        reactomeIds = elements.map(el => el.data('reactomeId'));
      else
        reactomeIds = elements.map(el => el.data('graph.stId'));
      // Make sure reactomeIds don't contain duplicated element
      const uniqueSet = new Set(reactomeIds);
      reactomeIds = Array.from(uniqueSet);
      this.state.set('select', reactomeIds[0] || '');
    }
  );

  legend2state = this.reactomeEvents$.pipe(
    filter((e) => e.detail.cy === this.legend),
    filter(() => !this._ignore),
  ).subscribe((e) => {
    const event = e as ReactomeEvent;
    const classes = event.detail.element.classes();
    let matchingElement: cytoscape.NodeCollection | cytoscape.EdgeCollection = this.cy.elements(`.${classes[0]}`);

    if (event.detail.type === 'PhysicalEntity' || event.detail.type === 'Pathway') {
      if (classes.includes('drug')) matchingElement = matchingElement.nodes('.drug')
      else matchingElement = matchingElement.not('.drug')
    } else if (event.detail.type === 'reaction') {
      const reaction = event.detail.element.nodes('.reaction');
      matchingElement = this.cy.nodes(`.${reaction.classes()[0]}`)
      matchingElement = matchingElement.add(matchingElement.connectedEdges())
    }

    switch (event.type) {
      case ReactomeEventTypes.select:
        this.state.set('flag', ['class:' + classes[0] + (classes.includes('drug') ? '.' : '!') + 'drug'])
        this.stateToDiagram();
        break;
      case ReactomeEventTypes.unselect:
        this.state.set('flag', [])
        this.stateToDiagram();
        break;
      case ReactomeEventTypes.hover:
        matchingElement.addClass('hover')
        break;
      case ReactomeEventTypes.leave:
        matchingElement.removeClass('hover')
        break;
    }
  });

  logProteins() {
    console.debug(new Set(this.cy.nodes(".Protein").map(node => node.data("acc") || node.data("iAcc"))))
  }

  /**
   * Somehow DiagramService cannot be exported for use out of this package. Therefore, use this method to get this instance.
   */
  getDiagramService(): DiagramService {
    return this.diagram;
  }
}
