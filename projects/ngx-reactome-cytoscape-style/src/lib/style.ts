import cytoscape from "cytoscape";
import {clearDrawersCache, imageBuilder, OMMITED_ICON} from "./drawer/image-builder";
import {extract, propertyExtractor, propertyMapper} from "./properties-utils";

import {Properties, setDefaults, UserProperties} from "./properties";
import {Interactivity} from "./interactivity";
import {HSL} from "./color";


export class Style {
  public css: CSSStyleDeclaration;
  public properties: Properties;
  private cy?: cytoscape.Core;
  private readonly imageBuilder;
  private readonly p;
  private readonly pm;
  public interactivity!: Interactivity;

  constructor(container: HTMLElement, properties: UserProperties = {}) {
    this.css = getComputedStyle(container);
    this.properties = setDefaults(properties, this.css);
    this.imageBuilder = imageBuilder(this.properties);
    this.p = propertyExtractor(this.properties);
    this.pm = propertyMapper(this.properties);
  }

  bindToCytoscape(cy: cytoscape.Core) {
    this.cy = cy;
    this.interactivity = new Interactivity(cy, this.properties);
    this.initSubPathwayColors()
  }

  initSubPathwayColors() {
    const subPathways = this.cy?.nodes('.Shadow');
    if (!subPathways) return;
    const dH = 360 / subPathways.length;

    const subpathwayIdToColor = new Map<number, string>(subPathways.map((subPathway, i) => {
      const hex = new HSL(dH * i, 100, extract(this.properties.shadow.luminosity)).toHex();
      subPathway.data('color', hex);
      return [subPathway.data('reactomeId'), hex]
    }))

    this.cy?.edges('[?pathway]').forEach(edge => {
      edge.data('color', subpathwayIdToColor.get(edge.data('pathway'))
      )
    })
  }


  getStyleSheet(): cytoscape.Stylesheet[] {
    return [
      {
        selector: "*",
        style: {
          "font-family": "Roboto",
          "font-weight": 600,
          "z-index": 1
        }
      },
      {
        selector: 'node.Compartment',
        style: {
          "shape": "round-rectangle",
          "width": 'data(width)',
          "height": 'data(height)',

          "border-style": 'double',

          "z-index": 0,
          "z-compound-depth": "bottom",
          "overlay-opacity": 0,

          "color": this.p('compartment', 'fill'),
          "border-color": this.p('compartment', 'fill'),
          "background-color": this.p('compartment', 'fill'),
          "background-opacity": this.p('compartment', 'opacity'),
          "border-width": this.pm('global', 'thickness', t => 3 * t)
        }
      },
      {
        selector: 'node.Compartment.inner, node.Compartment.outer',
        style: {
          "border-style": 'solid',
          "border-width": this.p('global', 'thickness')
        }
      },
      {
        selector: 'node.Compartment.outer',
        style: {
          'label': 'data(displayName)',
          "text-opacity": 1,
          "text-valign": "bottom",
          "text-halign": "right",
          // @ts-ignore
          "text-margin-x": "data(textX)",
          // @ts-ignore
          "text-margin-y": "data(textY)",
        }
      },
      {
        selector: 'node[?radius]',
        style: {
          // @ts-ignore
          'corner-radius': 'data(radius)'
        }
      },
      {
        selector: 'node.Shadow',
        style: {
          'label': 'data(displayName)',
          "font-size": 80,
          "background-opacity": 0,
          "shape": "rectangle",
          "text-valign": "center",
          "text-halign": "center",
          "text-outline-color": this.p('global', 'surface'),
          "text-outline-width": 15,
          "text-wrap": 'wrap',
          "text-max-width": "data(width)",
        }
      },
      {
        selector: 'node.Shadow[?color]',
        style: {
          "color": 'data(color)',
        }
      },
      {
        selector: 'node.drug',
        style: {
          "text-max-width": (node: cytoscape.NodeSingular) => (node.width() - 44) + 'px',
          "text-margin-x": 4,
          "font-style": "italic"
        }
      }, {
        selector: 'node.PhysicalEntity, node.Pathway, node.Modification, node.Protein',
        style: {
          'font-size': this.p('font','size'),
          'text-margin-x' : 0,
          'label': 'data(displayName)',
          'width': 'data(width)',
          'height': 'data(height)',
          "background-fit": "none",
          "text-halign": 'center',
          "text-valign": 'center',
          "text-wrap": 'wrap',
          "text-max-width": (node:cytoscape.NodeSingular) => node.data('width') + 'px',
          // @ts-ignore
          "background-image-smoothing": "no no no no no no no no",

          // @ts-ignore
          "background-image": node => this.imageBuilder(node)["background-image"],
          // @ts-ignore
          "background-position-y": node => this.imageBuilder(node)["background-position-y"] || 0,
          // @ts-ignore
          "background-position-x": node => this.imageBuilder(node)["background-position-x"] || 0,
          // @ts-ignore
          "background-height": node => this.imageBuilder(node)["background-height"] || '100%',
          // @ts-ignore
          "background-width": node => this.imageBuilder(node)["background-width"] || '100%',
          // @ts-ignore
          "background-clip": node => this.imageBuilder(node)["background-clip"] || 'node',
          // @ts-ignore
          "background-image-containment": node => this.imageBuilder(node)["background-image-containment"] || 'inside',
          // @ts-ignore
          "background-image-opacity": node => this.imageBuilder(node)["background-image-opacity"] || 1,
          // @ts-ignore
          "bounds-expansion": node => this.imageBuilder(node)["bounds-expansion"][0] || 0,
          'color': this.p('global', 'onPrimary'),
        }
      },

      {
        selector: 'node.InteractorOccurrences',
        style: {
          'label': 'data(displayName)',
          'color': this.p('global', 'surface'),
          "shape": "ellipse",
          "text-valign": "center",
          "text-halign": "center",
          "text-wrap": 'wrap',
          "background-color": this.p('interactor', 'fill')
        }
      },
      {
        selector: 'node.InteractorOccurrences.Disease',
        style: {
          "background-color": this.p('global', 'negative')
        }
      },
      {
        selector: 'node.InteractorOccurrences.hover',
        style: {
          "border-width": this.pm('global', 'thickness', t => t * 1),
          "border-color": this.p('global', 'hoverNode'),
        }
      },
      {
        selector: 'node.InteractorOccurrences.select',
        style: {
          "border-width": this.pm('global', 'thickness', t => t * 1),
          "border-color": this.p('global', 'selectNode'),
        }
      },
      {
        selector: 'node.Interactor',
        style: {
          "label": "data(displayName)",
          "font-family": "Roboto Mono, monospace",
          // "border-color": this.p('interactor', 'stroke'),
          "border-width": this.p('global', 'thickness'),
          "text-wrap": "ellipsis",
          "border-color": this.p('interactor', 'fill')
        }
      },
      {
        selector: 'node.DiseaseInteractor',
        style: {
          "shape": "round-hexagon",
          "background-color": this.p('global', 'negative'),
          "background-opacity": 0,
          "font-family": "Roboto Mono, monospace",
          "color": this.p('global', 'onPrimary'),
          "text-wrap": "ellipsis",
          "text-max-width": (node: cytoscape.NodeSingular) => (node.width() - 40) + 'px',
        }
      },

      {
        selector: 'node.PhysicalEntity.disease',
        style: {
          "border-color": this.p('global', 'negativeContrast'),
          "color": this.p('global', 'negativeContrast'),
          "border-width": this.p('global', 'thickness'),
        }
      }, {
        selector: 'node.Protein',
        style: {
          "shape": "round-rectangle",
          "background-color": this.p('protein', 'fill')
        }
      }, {
        selector: 'node.Protein.drug',
        style: {
          "background-color": this.p('protein', 'drug')
        }
      }, {
        selector: 'node.GenomeEncodedEntity',
        style: {
          "shape": "round-rectangle",
          "background-opacity": 0,
          "background-color": this.p('genomeEncodedEntity', 'fill'),
          "text-margin-y": this.pm('genomeEncodedEntity', 'topRadius', r => r / 10),
          "border-width": 0 // Avoid disease border
        }
      }, {
        selector: 'node.RNA',
        style: {
          "shape": "bottom-round-rectangle",
          "background-color": this.p('rna', 'fill'),
        }
      }, {
        selector: 'node.RNA.drug',
        style: {
          "background-color": this.p('rna', 'drug'),
        }
      }, {
        selector: 'node.Gene',
        style: {
          "shape": "bottom-round-rectangle",
          "background-opacity": 0,
          "background-color": this.p('gene', 'fill'),
          "bounds-expansion": this.p('gene', 'decorationExtraWidth'),
          "text-margin-y": this.pm('gene', 'decorationHeight', h => h / 2),
          "border-width": 0 // Avoid disease border
        }
      }, {
        selector: 'node.Molecule',
        style: {
          "shape": 'round-rectangle',
          "color": this.p("molecule", 'stroke'),
          "background-color": this.p("molecule", 'fill'),
          "border-color": this.p("molecule", 'stroke'),
          "border-width": this.p("global", 'thickness'),
          // @ts-ignore
          "corner-radius": (node: cytoscape.NodeSingular) => Math.min(node.data('width'), node.data('height')) / 2,
        }
      }, {
        selector: 'node.Molecule.drug',
        style: {
          "color": this.p("molecule", 'drug'),
          "border-color": this.p("molecule", 'drug'),
        }
      }, {
        selector: 'node.Molecule.Interactor',
        style: {
          "border-color": this.p("interactor", 'fill'),
        }
      }, {
        selector: 'node.EntitySet',
        style: {
          "background-opacity": 0,
          "shape": "round-rectangle",
          "border-width": 0, // Avoid disease border
          "text-max-width": (node: cytoscape.NodeSingular) =>
            this.pm('global', 'thickness', t =>
              this.pm('entitySet', 'radius', r => `${node.width() - 2 * r - 6 * t}px`
              )
            )
        }
      }, {
        selector: 'node.EntitySet.drug',
        style: {
          "text-max-width": (node: cytoscape.NodeSingular) =>
            this.pm('global', 'thickness', t =>
              this.pm('entitySet', 'radius', r => `${node.width() - 2 * r - 6 * t - 44}px`
              )
            )
        }
      }, {
        selector: 'node.Complex',
        style: {
          "shape": "cut-rectangle",
          "text-max-width": (node: cytoscape.NodeSingular) => this.pm('global', 'thickness', t => (node.width() - t * 6) + 'px'),
          "background-opacity": 0,
          "border-width": 0, // Avoid disease border

          // "background-color": this.p("complex", 'fill'),
          // "width": (node: cytoscape.NodeSingular) => this.pm('global', 'thickness', t => node.data('width') -  2 * t) ,
          // "height": (node: cytoscape.NodeSingular) => this.pm('global', 'thickness', t => node.data('height') -  2 * t) ,
          // // @ts-ignore
          // "corner-radius": this.pm('complex', 'cut', c => c),
          // "outline-width":  this.p('global', 'thickness'),
          // "outline-color":  this.p('complex', 'fill'),
          // "outline-offset":  this.pm('global', 'thickness', t => - t),
          // "outline-opacity":  1,
          //
          // // "border-position": 'inside',
          // "border-join": 'round',
          // "border-color": this.p('complex', 'stroke'),
          // "border-width": this.p('global', 'thickness'),
        }
      }, {
        selector: 'node.Complex.drug',
        style: {
          "text-margin-x": 4,
          "text-max-width": (node: cytoscape.NodeSingular) => this.pm('global', 'thickness', t => (node.width() - t * 6 - 44) + 'px')
        }
      }, {
        selector: 'node.Cell',
        style: {
          "background-opacity": 0,
          "shape": "round-rectangle",
          // @ts-ignore
          "corner-radius": 999999,
          "border-width": 0, // Avoid disease border

          "text-max-width": (node: cytoscape.NodeSingular) =>
            this.pm('global', 'thickness', t => this.pm('cell', 'thickness', ct => (node.width() - t * 2 - ct * 2) + 'px'))
        }
      },
      {
        selector: 'node.Pathway',
        style: {
          "background-color": this.p('pathway', 'fill'),
          "text-margin-x": 18,
        }
      },
      {
        selector: 'node.Interacting.Pathway',
        style: {
          "shape": "rectangle",
          "border-color": this.p('pathway', 'stroke'),
          "border-width": this.pm('global', 'thickness', t => 3 * t),
          // @ts-ignore
          "border-position": "inside",
          "text-max-width": (node: cytoscape.NodeSingular) =>
            this.pm('global', 'thickness', t => `${node.width() - (6 * t + 36) * 2}px`
            ),
        }
      },
      {
        selector: 'node.SUB.Pathway',
        style: {
          "background-opacity": 0,
          "shape": 'round-rectangle',
          "text-max-width": (node: cytoscape.NodeSingular) =>
            this.pm('global', 'thickness', t => `${node.width() - (6 * t + 36) * 2}px`
            ),
        }
      }, {
        selector: 'node.Pathway.disease',
        style: {
          "border-color": this.p('global', 'negativeContrast'),
          "color": this.p('global', 'negativeContrast'),
        }
      }, {
        selector: 'node.Modification',
        style: {
          "background-color": this.p('modification', 'fill'),
          "shape": 'round-rectangle'
        }
      },
      {
        selector: 'node.loss-of-function',
        style: {
          "border-style": 'dashed',
          //@ts-ignore
          "border-dash-pattern": this.pm('global', 'thickness', t => [t, t * 2]),
          "border-cap": "round"
        }
      },


      {
        selector: 'node.reaction',
        style: {
          "width": this.pm('global', 'thickness', t => t * 6),
          "height": this.pm('global', 'thickness', t => t * 6),
          "shape": "round-rectangle",
          "text-halign": "center",
          "text-valign": "center",
          "border-width": this.p('global', 'thickness'),
          "border-color": this.p('global', 'onSurface'),
          "color": this.p('global', 'onSurface'),
          "background-color": this.p('global', 'surface'),
        }
      }, {
        selector: 'node.reaction[?displayName]',
        style: {
          "label": "data(displayName)",
          "font-weight": 400,
          "text-valign": "top",
          "text-margin-y": -5,
        }
      }, {
        selector: 'node.reaction.hover',
        style: {
          "border-width": this.pm('global', 'thickness', t => t * 1),
          "border-color": this.p('global', 'hoverEdge'),
        }
      }, {
        selector: 'node.reaction:selected',
        style: {
          "border-width": this.pm('global', 'thickness', t => t * 1.5),
          "border-color": this.p('global', 'selectEdge'),
        }
      }, {
        selector: 'node.reaction.flag',
        style: {
          // @ts-ignore
          "outline-width": this.pm('global', 'thickness', t => t * 1.5),
          "outline-color": this.p('global', 'flag'),
        }
      }, {
        selector: 'node.association',
        style: {
          "shape": "ellipse",
          "background-color": this.p('global', 'onSurface'),
        }
      }, {
        selector: 'node.dissociation',
        style: {
          "shape": "ellipse",
          "border-style": "double",
          "border-width": this.pm('global', 'thickness', t => 3 * t)
        }
      }, {
        selector: 'node.uncertain',
        style: {
          "label": "?",
          "text-valign": "center",
          "text-margin-y": 0,
          "font-weight": 600
        }
      }, {
        selector: 'node.omitted',
        style: {
          "background-image": OMMITED_ICON(this.properties),
          "background-fit": "cover",
          "background-height": "100%",
          "background-width": "100%",
        }
      },
      {
        selector: 'node.InteractorOccurrences',
        style: {
          'label': 'data(displayName)',
          'color': this.p('global', 'surface'),
          "shape": "ellipse",
          "text-valign": "center",
          "text-halign": "center",
          "text-wrap": 'wrap',
          "background-color": this.p('interactor', 'fill')
        }
      },
      {
        selector: 'node.InteractorOccurrences.Disease',
        style: {
          "background-color": this.p('global', 'negative')
        }
      },
      {
        selector: 'node.InteractorOccurrences.hover',
        style: {
          "border-width": this.pm('global', 'thickness', t => t * 1),
          "border-color": this.p('global', 'hoverNode'),
        }
      },
      {
        selector: 'node.InteractorOccurrences.select',
        style: {
          "border-width": this.pm('global', 'thickness', t => t * 1),
          "border-color": this.p('global', 'selectNode'),
        }
      },
      {
        selector: 'node.Interactor',
        style: {
          "label": "data(displayName)",
          "font-family": "Roboto Mono, monospace",
          "border-color": this.p('interactor', 'stroke'),
          "text-wrap": "ellipsis",
        }
      },
      {
        selector: 'node.RNA.Interactor, node.Protein.Interactor',
        style: {
          "border-color": this.p('interactor', 'fill'),
          "border-width": this.p('global', 'thickness'),

        }
      },
      {
        selector: 'node.Molecule.Interactor',
        style: {
          "color": this.p("molecule", 'stroke'),
          "background-color": this.p("molecule", 'fill'),
          "border-color": this.p("interactor", 'stroke'),
          "border-width": this.p("global", 'thickness'),
          // @ts-ignore
          "corner-radius": (node: cytoscape.NodeSingular) => Math.min(node.data('width'), node.data('height')) / 2,
        }
      },
      // {
      //   selector: 'node.Interactor.Disease',
      //   style: {
      //     "shape": "round-hexagon",
      //     "background-color": this.p('global', 'negative'),
      //     "color": this.p('global', 'onPrimary'),
      //     "border-width": 0,
      //     "width": "data(width)",
      //     "height": "data(height)",
      //     "text-halign": 'center',
      //     "text-valign": 'center',
      //     "text-max-width": (node: cytoscape.NodeSingular) => (node.width() - 40) + 'px',
      //   }
      // },
      {
        selector: 'node.DiseaseInteractor',
        style: {
          "shape": "round-hexagon",
          "background-color": this.p('global', 'negative'),
          "color": this.p('global', 'onPrimary'),
          "border-width": 0,
          "width": "data(width)",
          "height": "data(height)",
          "text-halign": 'center',
          "text-valign": 'center',
          "text-max-width": (node: cytoscape.NodeSingular) => (node.width() - 60) + 'px',
        }
      },
      {
        selector: 'node.input_output',
        style: {
          "shape": "ellipse",
          "width": this.pm('global', 'thickness', t => t * 4),
          "height": this.pm('global', 'thickness', t => t * 4),
        }
      },


      {
        selector: 'edge',
        style: {
          "curve-style": "straight",
          "line-cap": "round",
          "source-endpoint": "outside-to-node",
          "arrow-scale": 1.5,

          'width': this.p('global', 'thickness'),
          'color': this.p('global', 'onSurface'),
          'line-color': this.p('global', 'onSurface'),
          'target-arrow-color': this.p('global', 'onSurface'),
          'mid-source-arrow-color': this.p('global', 'onSurface'),
          'mid-target-arrow-color': this.p('global', 'onSurface'),
          'source-arrow-color': this.p('global', 'onSurface'),
          // @ts-ignore
          'source-arrow-width': '100%',
          // @ts-ignore
          'target-arrow-width': '100%',
        }
      }, {
        selector: 'edge.disease',
        style: {
          "color": this.p('global', 'negative'),
          "line-color": this.p('global', 'negative'),
          "border-color": this.p('global', 'negative'),
          'target-arrow-color': this.p('global', 'negative'),
          'source-arrow-color': this.p('global', 'negative'),
        }
      }, {
        selector: "edge.hover",
        style: {
          "line-color": this.p('global', 'hoverEdge'),
          "width": this.pm('global', 'thickness', t => t * 1.5),
          "arrow-scale": 1,
          "source-arrow-color": this.p('global', 'hoverEdge'),
          "target-arrow-color": this.p('global', 'hoverEdge'),
          // @ts-ignore
          'source-arrow-width': '50%',
          // @ts-ignore
          'target-arrow-width': '50%',
          "z-index": 2
        }
      }, {
        selector: "edge:selected",
        style: {
          "line-color": this.p('global', 'selectEdge'),
          "width": this.pm('global', 'thickness', t => t * 2),
          "arrow-scale": 1,
          "source-arrow-color": this.p('global', 'selectEdge'),
          "target-arrow-color": this.p('global', 'selectEdge'),
          // @ts-ignore
          'source-arrow-width': '50%',
          // @ts-ignore
          'target-arrow-width': '50%',
          "z-index": 3
        }
      },
      {
        selector: 'edge.consumption',
        style: {"target-endpoint": "inside-to-node", "source-endpoint": "outside-to-node"}
      }
      , {
        selector: 'edge.production',
        style: {'target-arrow-shape': 'triangle'}
      }, {
        selector: 'edge.catalysis',
        style: {
          'target-arrow-shape': 'circle',
          "target-arrow-fill": "hollow",
          "target-arrow-color": this.p('global', 'positive')
        }
      }, {
        selector: 'edge.positive-regulation',
        style: {
          'target-arrow-shape': 'triangle',
          "target-arrow-fill": "hollow",
          "target-arrow-color": this.p('global', 'positive')
        }
      }, {
        selector: 'edge.negative-regulation',
        style: {
          'target-arrow-shape': 'tee',
          "line-cap": "butt",
          "source-endpoint": "inside-to-node",
          "target-arrow-color": this.p('global', 'negative')
        }
      }, {
        selector: 'edge.set-to-member',
        style: {'target-arrow-shape': 'circle', "line-style": "dashed", "line-dash-pattern": [6, 10], "opacity": 0.5}
      }, {
        selector: 'edge[stoichiometry > 1]',
        style: {
          "text-background-color": this.p('global', 'surface'),
          "text-background-opacity": 1,
          "text-border-width": this.pm('global', 'thickness', t => t / 2),
          "text-border-opacity": 1,
          "text-border-color": this.p('global', 'onSurface'),
          "text-background-shape": 'roundrectangle',
          "text-background-padding": this.pm('global', 'thickness', t => t + 'px'),
        }
      }, {
        selector: 'edge[stoichiometry > 1].incoming',
        style: {
          "source-label": "data(stoichiometry)",
          "source-text-offset": 30,
        }
      }, {
        selector: 'edge[stoichiometry > 1].outgoing',
        style: {
          "target-label": "data(stoichiometry)",
          "target-text-offset": 35,
        }
      }, {
        selector: "edge.shadow[?color]",
        style: {
          // @ts-ignore
          "underlay-color": "data(color)",
          "underlay-padding": 20,
          "underlay-opacity": this.pm('shadow', 'opacity', o => o[0][1] / 100),
        }
      }, {
        selector: "edge.flag",
        style: {
          // @ts-ignore
          "underlay-color": this.p('global', 'flag'),
          "underlay-padding": 10,
          "underlay-opacity": 1,
        }
      }, {
        selector: "edge[?weights]",
        style: {
          // @ts-ignore
          "curve-style": (ele) => ele.data('curveStyle') || 'round-segments',
          "segment-distances": "data(distances)",
          "segment-weights": "data(weights)",
          "segment-radius": 30,
          "radius-type": 'influence-radius',
          // @ts-ignore
          "edge-distances": "endpoints",
        }
      }, {
        selector: "edge[?sourceEndpoint]",
        style: {
          // @ts-ignore
          "source-endpoint": "data(sourceEndpoint)",
        }
      }, {
        selector: "edge[?targetEndpoint]",
        style: {
          // @ts-ignore
          "target-endpoint": "data(targetEndpoint)",
        }
      }, {
        selector: "edge[?sourceLabel]",
        style: {
          "source-label": "data(sourceLabel)",
          "source-text-margin-y": -12,
          "font-weight": 400
        }
      }, {
        selector: "edge[?label]",
        style: {
          "label": "data(label)",
          "text-margin-y": 12,
          "font-weight": 400
        }
      },
      {
        selector: 'edge.Interactor',
        style: {
          'line-color': this.p('interactor', 'stroke'),
          'line-style': 'dashed',
          'line-dash-pattern': [1, 8]
        }
      },
      {
        selector: 'edge.DiseaseInteractor',
        style: {
          'line-color': this.p('global', 'negativeContrast'),
        }
      },
      {
        selector: 'edge.Interactor.hover, edge.DiseaseInteractor.hover',
        style: {
          "line-color": this.p('global', 'hoverEdge')
        }
      },
      {
        selector: "edge[?sourceOffset]",
        style: {
          // @ts-ignore
          "source-text-offset": "data(sourceOffset)",
        }
      },
      {
        selector: "[?labelColor]",
        style: {
          "color": (e: cytoscape.EdgeSingular) => extract(this.p('global', e.data("labelColor")))
        }
      }, {
        selector: "node.debug",
        style: {
          label: "data(id)",
          "text-outline-width": 4,
          "text-outline-color": 'black',
          "text-outline-opacity": 1,
          color: 'white'
        }
      },

      {
        selector: "node.Legend.Label",
        style: {
          "label": "data(displayName)",
          "text-halign": "center",
          "text-valign": "center",
          "font-size": 24,
          "font-weight": 400,
          "background-opacity": 0,
          "color": this.p('global', 'onSurface')
        }
      },
      {
        selector: "node.Legend.Placeholder",
        style: {
          "background-opacity": 0,
          "border-opacity": 0,
          width: 20,
          height: 20,
          shape: "rectangle"
        }
      },
      {
        selector: "node.Legend.Placeholder[?displayName]",
        style: {
          "label": "data(displayName)",
          "font-weight": 400,
        }
      },
      {
        selector: '.trivial',
        style: {
          'opacity': 0,
        }
      },
    ]
  }

  clearCache() {
    this.imageBuilder.cache.clear!()
    clearDrawersCache();
  }

  update(cy: cytoscape.Core) {
    this.clearCache();
    cy.style(this.getStyleSheet());
    this.initSubPathwayColors();
    this.interactivity.onZoom()
  }
}
