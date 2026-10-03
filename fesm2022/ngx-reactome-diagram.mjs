import { __decorate } from 'tslib';
import * as i0 from '@angular/core';
import { InjectionToken, Inject, Injectable, Input, Output, ViewChild, Component } from '@angular/core';
import cytoscape from 'cytoscape';
import { Style, ReactomeEventTypes, interactivityOf } from 'ngx-reactome-cytoscape-style';
import { of, forkJoin, map, BehaviorSubject, distinctUntilChanged, Subject, filter, share, delay } from 'rxjs';
import { FormControl } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import * as i5 from '@angular/common';
import { CommonModule } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { array } from 'vectorious';
import cytoscapeFcose from 'cytoscape-fcose';
import * as i1 from '@angular/common/http';
import { isArray } from 'lodash';
import * as i1$1 from '@angular/router';
import * as i4 from '@angular/material/dialog';

var nodes = [
	{
		data: {
			id: "Label 1",
			displayName: "Molecules"
		},
		classes: [
			"Label",
			"Legend"
		],
		position: {
			x: 250,
			y: -20
		}
	},
	{
		data: {
			id: "Gene",
			displayName: "Gene",
			height: 80,
			width: 220
		},
		classes: [
			"Gene",
			"PhysicalEntity"
		],
		position: {
			x: 130,
			y: 40
		}
	},
	{
		data: {
			id: "Genome Encoded Entity",
			displayName: "Genome Encoded Entity",
			height: 60,
			width: 220
		},
		classes: [
			"GenomeEncodedEntity",
			"PhysicalEntity"
		],
		position: {
			x: 370,
			y: 50
		}
	},
	{
		data: {
			id: "RNA",
			displayName: "RNA",
			height: 60,
			width: 220
		},
		classes: [
			"RNA",
			"PhysicalEntity"
		],
		position: {
			x: 130,
			y: 130
		}
	},
	{
		data: {
			id: "RNA-drug",
			displayName: "RNA Drug",
			height: 60,
			width: 220
		},
		classes: [
			"RNA",
			"PhysicalEntity",
			"drug"
		],
		position: {
			x: 370,
			y: 130
		}
	},
	{
		data: {
			id: "Protein",
			displayName: "Protein",
			height: 60,
			width: 220
		},
		classes: [
			"Protein",
			"PhysicalEntity"
		],
		position: {
			x: 130,
			y: 210
		}
	},
	{
		data: {
			id: "Protein-drug",
			displayName: "Protein Drug",
			height: 60,
			width: 220
		},
		classes: [
			"Protein",
			"PhysicalEntity",
			"drug"
		],
		position: {
			x: 370,
			y: 210
		}
	},
	{
		data: {
			id: "Molecule",
			displayName: "Molecule",
			height: 60,
			width: 220
		},
		classes: [
			"Molecule",
			"PhysicalEntity"
		],
		position: {
			x: 130,
			y: 290
		}
	},
	{
		data: {
			id: "Molecule-drug",
			displayName: "Molecule Drug",
			height: 60,
			width: 220
		},
		classes: [
			"Molecule",
			"PhysicalEntity",
			"drug"
		],
		position: {
			x: 370,
			y: 290
		}
	},
	{
		data: {
			id: "Complex",
			displayName: "Complex",
			height: 60,
			width: 220
		},
		classes: [
			"Complex",
			"PhysicalEntity"
		],
		position: {
			x: 130,
			y: 370
		}
	},
	{
		data: {
			id: "Complex-drug",
			displayName: "Complex Drug",
			height: 60,
			width: 220
		},
		classes: [
			"Complex",
			"PhysicalEntity",
			"drug"
		],
		position: {
			x: 370,
			y: 370
		}
	},
	{
		data: {
			id: "EntitySet",
			displayName: "Set",
			height: 60,
			width: 220
		},
		classes: [
			"EntitySet",
			"PhysicalEntity"
		],
		position: {
			x: 130,
			y: 450
		}
	},
	{
		data: {
			id: "EntitySet-drug",
			displayName: "Set Drug",
			height: 60,
			width: 220
		},
		classes: [
			"EntitySet",
			"PhysicalEntity",
			"drug"
		],
		position: {
			x: 370,
			y: 450
		}
	},
	{
		data: {
			id: "Cell",
			displayName: "Cell",
			height: 60,
			width: 220
		},
		classes: [
			"Cell",
			"PhysicalEntity"
		],
		position: {
			x: 250,
			y: 530
		}
	},
	{
		data: {
			id: "SubPathway",
			displayName: "SubPathway",
			height: 80,
			width: 220
		},
		classes: [
			"SUB",
			"Pathway"
		],
		position: {
			x: 130,
			y: 610
		}
	},
	{
		data: {
			id: "interacting pathway",
			displayName: "Interacting Pathway",
			height: 80,
			width: 220
		},
		classes: [
			"Interacting",
			"Pathway"
		],
		position: {
			x: 370,
			y: 610
		}
	},
	{
		data: {
			id: "Label 2",
			displayName: "Reaction Types"
		},
		classes: [
			"Label",
			"Legend"
		],
		position: {
			x: 250,
			y: 690
		}
	},
	{
		data: {
			id: "a"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 15,
			y: 760
		}
	},
	{
		data: {
			id: "dissociation",
			displayName: "Dissociation"
		},
		classes: [
			"dissociation",
			"reaction"
		],
		position: {
			x: 130,
			y: 760
		}
	},
	{
		data: {
			id: "b"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 250,
			y: 740
		}
	},
	{
		data: {
			id: "c"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 250,
			y: 780
		}
	},
	{
		data: {
			id: "association",
			displayName: "Association"
		},
		classes: [
			"association",
			"reaction"
		],
		position: {
			x: 370,
			y: 760
		}
	},
	{
		data: {
			id: "d"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 485,
			y: 760
		}
	},
	{
		data: {
			id: "e"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 15,
			y: 840
		}
	},
	{
		data: {
			id: "transition",
			displayName: "Transition"
		},
		classes: [
			"transition",
			"reaction"
		],
		position: {
			x: 130,
			y: 840
		}
	},
	{
		data: {
			id: "f"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 250,
			y: 840
		}
	},
	{
		data: {
			id: "omitted",
			displayName: "Omitted"
		},
		classes: [
			"omitted",
			"reaction"
		],
		position: {
			x: 370,
			y: 840
		}
	},
	{
		data: {
			id: "g"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 485,
			y: 840
		}
	},
	{
		data: {
			id: "h"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 15,
			y: 920
		}
	},
	{
		data: {
			id: "uncertain-l",
			displayName: "Uncertain"
		},
		classes: [
			"Placeholder",
			"reaction",
			"Legend"
		],
		position: {
			x: 250,
			y: 916
		}
	},
	{
		data: {
			id: "uncertain"
		},
		classes: [
			"uncertain",
			"reaction"
		],
		position: {
			x: 250,
			y: 920
		}
	},
	{
		data: {
			id: "i"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 485,
			y: 920
		}
	},
	{
		data: {
			id: "Label 3",
			displayName: "Reaction Attributes"
		},
		classes: [
			"Label",
			"Legend"
		],
		position: {
			x: 250,
			y: 980
		}
	},
	{
		data: {
			id: "attr-catalysis"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 15,
			y: 1020
		}
	},
	{
		data: {
			id: "attr-reg+"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 485,
			y: 1020
		}
	},
	{
		data: {
			id: "attr-a"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 15,
			y: 1060
		}
	},
	{
		data: {
			id: "attr-b"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 15,
			y: 1100
		}
	},
	{
		data: {
			id: "attr-reaction"
		},
		classes: [
			"association",
			"reaction"
		],
		position: {
			x: 250,
			y: 1080
		}
	},
	{
		data: {
			id: "attr-c"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 485,
			y: 1080
		}
	},
	{
		data: {
			id: "attr-reg-"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 485,
			y: 1145
		}
	},
	{
		data: {
			id: "attr-s-l",
			displayName: "Stoichiometry",
			labelColor: "onSurface"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 73,
			y: 1150
		}
	},
	{
		data: {
			id: "line-a"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 15,
			y: 1185
		}
	},
	{
		data: {
			id: "line-b"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 250,
			y: 1185
		}
	},
	{
		data: {
			id: "line-c"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 485,
			y: 1185
		}
	},
	{
		data: {
			id: "line-d"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 15,
			y: 1225
		}
	},
	{
		data: {
			id: "line-e"
		},
		classes: [
			"Placeholder",
			"Legend"
		],
		position: {
			x: 485,
			y: 1225
		}
	}
];
var edges = [
	{
		data: {
			source: "a",
			target: "dissociation"
		},
		classes: [
			"consumption",
			"incoming"
		]
	},
	{
		data: {
			source: "dissociation",
			target: "b",
			weights: "0.270 0.523",
			distances: "5.535 -9.976",
			sourceEndpoint: "18 0",
			targetEndpoint: "-10 0"
		},
		classes: [
			"production",
			"outgoing"
		]
	},
	{
		data: {
			source: "dissociation",
			target: "c",
			weights: "0.270 0.523",
			distances: "-5.535 9.976",
			sourceEndpoint: "18 0",
			targetEndpoint: "-10 0"
		},
		classes: [
			"production",
			"outgoing"
		]
	},
	{
		data: {
			source: "b",
			target: "association",
			weights: "0.285 0.521",
			distances: "-5.82 9.777",
			sourceEndpoint: "10 0",
			targetEndpoint: "-10 0"
		},
		classes: [
			"consumption",
			"outgoing"
		]
	},
	{
		data: {
			source: "c",
			target: "association",
			weights: "0.285 0.521",
			distances: "5.82 -9.777",
			sourceEndpoint: "10 0",
			targetEndpoint: "-10 0"
		},
		classes: [
			"consumption",
			"outgoing"
		]
	},
	{
		data: {
			source: "association",
			target: "d"
		},
		classes: [
			"production",
			"outgoing"
		]
	},
	{
		data: {
			source: "e",
			target: "transition"
		},
		classes: [
			"consumption",
			"incoming"
		]
	},
	{
		data: {
			source: "transition",
			target: "f"
		},
		classes: [
			"production",
			"outgoing"
		]
	},
	{
		data: {
			source: "f",
			target: "omitted"
		},
		classes: [
			"consumption",
			"incoming"
		]
	},
	{
		data: {
			source: "omitted",
			target: "g"
		},
		classes: [
			"production",
			"outgoing"
		]
	},
	{
		data: {
			source: "h",
			target: "uncertain"
		},
		classes: [
			"consumption",
			"incoming"
		]
	},
	{
		data: {
			source: "uncertain",
			target: "i"
		},
		classes: [
			"production",
			"outgoing"
		]
	},
	{
		data: {
			source: "attr-a",
			target: "attr-reaction",
			weights: "0.582 0.683",
			distances: "-11.686 6.357",
			sourceEndpoint: "10 0",
			targetEndpoint: "-12 0"
		},
		classes: [
			"consumption",
			"incoming"
		]
	},
	{
		data: {
			source: "attr-b",
			target: "attr-reaction",
			weights: "0.582 0.683",
			distances: "11.686 -6.357",
			sourceEndpoint: "10 0",
			targetEndpoint: "-12 0",
			stoichiometry: 3,
			sourceOffset: 50
		},
		classes: [
			"consumption",
			"incoming"
		]
	},
	{
		data: {
			source: "attr-reaction",
			target: "attr-c",
			sourceEndpoint: "12 0",
			targetEndpoint: "-10 0"
		},
		classes: [
			"production",
			"outgoing"
		]
	},
	{
		data: {
			source: "attr-catalysis",
			target: "attr-reaction",
			weights: "0.754",
			distances: "-34.250",
			sourceEndpoint: "10 0",
			targetEndpoint: "-15.556 -15.556",
			sourceLabel: "Catalysis",
			sourceOffset: 30,
			labelColor: "positive"
		},
		classes: [
			"catalysis",
			"incoming"
		]
	},
	{
		data: {
			source: "attr-reg+",
			target: "attr-reaction",
			weights: "0.754",
			distances: "34.250",
			sourceEndpoint: "-10 0",
			targetEndpoint: "15.556 -15.556",
			sourceLabel: "Positive Regulation",
			sourceOffset: 70,
			labelColor: "positive"
		},
		classes: [
			"positive-regulation",
			"incoming"
		]
	},
	{
		data: {
			source: "attr-reg-",
			target: "attr-reaction",
			sourceEndpoint: "-10 0",
			targetEndpoint: "0 22",
			weights: "0.966",
			distances: "-41.287",
			sourceLabel: "Negative regulation",
			sourceOffset: 72,
			labelColor: "negative"
		},
		classes: [
			"negative-regulation",
			"incoming"
		]
	},
	{
		data: {
			source: "line-a",
			target: "line-b",
			sourceEndpoint: "12 0",
			targetEndpoint: "-12 0",
			label: "Wild Type"
		},
		classes: [
			"consumption",
			"incoming"
		]
	},
	{
		data: {
			source: "line-b",
			target: "line-c",
			sourceEndpoint: "12 0",
			targetEndpoint: "-12 0",
			label: "Disease Associated",
			labelColor: "negative"
		},
		classes: [
			"consumption",
			"incoming",
			"disease"
		]
	},
	{
		data: {
			source: "line-d",
			target: "line-e",
			sourceEndpoint: "12 0",
			targetEndpoint: "-12 0",
			label: "Member of Set",
			labelColor: "onSurface"
		},
		classes: [
			"set-to-member"
		]
	}
];
var legend = {
	nodes: nodes,
	edges: edges,
	"Reaction Types GeoGebra": "https://www.geogebra.org/calculator/bydd8bz5",
	"Reaction Attributes GeoGebra": "https://www.geogebra.org/calculator/hgu6afmu"
};

cytoscape.use(cytoscapeFcose);
// Above the service, which names it in its constructor's @Inject: declared
// after it, the decorator read it before it existed.
const DIAGRAM_CONFIG_TOKEN = new InjectionToken('DIAGRAM_CONFIG_TOKEN');
const posToStr = (edge, pos) => `${edge.id}-${pos.x},${pos.y}`;
const pointToStr = (point) => `${point.x};${point.y}`;
const scale = (pos, scale = 2) => {
    if (typeof pos === 'number')
        return pos * scale;
    return {
        x: pos.x * scale,
        y: pos.y * scale
    };
};
const equal = (pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y;
const avg = (positions) => {
    const sum = { x: 0, y: 0 };
    positions.forEach(pos => {
        sum.x += pos.x;
        sum.y += pos.y;
    });
    sum.x /= positions.length;
    sum.y /= positions.length;
    return sum;
};
const squaredDist = (pos1, pos2) => {
    return Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2);
};
const dist = (pos1, pos2) => Math.sqrt(squaredDist(pos1, pos2));
const closestToAverage = (positions) => {
    const average = avg(positions);
    let closest = positions[0];
    let min = squaredDist(closest, average);
    for (let i = 1; i < positions.length; i++) {
        const pos = positions[i];
        const dist = squaredDist(pos, average);
        if (dist < min) {
            min = dist;
            closest = pos;
        }
    }
    return closest;
};
class DiagramService {
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.extraLine = new Map();
        this.reverseExtraLine = new Map();
        this.nodeTypeMap = new Map([
            ['Gene', ['Gene', 'PhysicalEntity']],
            ['RNA', ['RNA', 'PhysicalEntity']],
            ['Protein', ['Protein', 'PhysicalEntity']],
            ['Entity', ['GenomeEncodedEntity', 'PhysicalEntity']],
            ['Complex', ['Complex', 'PhysicalEntity']],
            ['EntitySet', ['EntitySet', 'PhysicalEntity']],
            ['Chemical', ['Molecule', 'PhysicalEntity']],
            ['Cell', ['Cell', 'PhysicalEntity']],
            ['ProteinDrug', ['Protein', 'PhysicalEntity', 'drug']],
            ['ComplexDrug', ['Complex', 'PhysicalEntity', 'drug']],
            ['ChemicalDrug', ['Molecule', 'PhysicalEntity', 'drug']],
            ['RNADrug', ['RNA', 'PhysicalEntity', 'drug']],
            ['EntitySetDrug', ['EntitySet', 'PhysicalEntity', 'drug']],
            ['ProcessNode', ['SUB', 'Pathway']],
            ['EncapsulatedNode', ['Interacting', 'Pathway']]
        ]);
        this.reactionTypeMap = new Map([
            [undefined, ['transition', 'reaction']],
            ['transition', ['transition', 'reaction']],
            ['Transition', ['transition', 'reaction']],
            ['Process', ['transition', 'reaction']],
            ['binding', ['association', 'reaction']],
            ['Association', ['association', 'reaction']],
            ['dissociation', ['dissociation', 'reaction']],
            ['Dissociation', ['dissociation', 'reaction']],
            ['omitted', ['omitted', 'reaction']],
            ['Omitted Process', ['omitted', 'reaction']],
            ['uncertain', ['uncertain', 'reaction']],
            ['Uncertain Process', ['uncertain', 'reaction']],
        ]);
        this.edgeTypeMap = new Map([
            ['INPUT', ['consumption', 'incoming', 'reaction']],
            ['ACTIVATOR', ['positive-regulation', 'incoming', 'reaction']],
            ['REQUIRED', ['positive-regulation', 'incoming', 'reaction']],
            ['INHIBITOR', ['negative-regulation', 'incoming', 'reaction']],
            ['CATALYST', ['catalysis', 'incoming', 'reaction']],
            ['OUTPUT', ['production', 'outgoing', 'reaction']],
        ]);
        this.edgeTypeToStr = new Map([
            ['INPUT', '-'],
            ['ACTIVATOR', '+'],
            ['REQUIRED', '+>'],
            ['INHIBITOR', '|'],
            ['CATALYST', 'o'],
            ['OUTPUT', '>'],
        ]);
        this.linkClassMap = new Map([
            ['EntitySetAndMemberLink', ['set-to-member', 'incoming']],
            ['EntitySetAndEntitySetLink', ['set-to-member', 'incoming']],
            ['Interaction', ['production', 'outgoing']],
            ['FlowLine', ['production', 'outgoing']]
        ]);
        this.COMPARTMENT_SHIFT = 35;
        // Where diagrams are loaded from, unless the configuration says otherwise:
        // Reactome's public release.
        this.diagramUrl = 'https://reactome.org/download/current/diagram';
        // This is a service object. Therefore, we have to extract configure here if any
        // The default stands when the configuration does not name an address; it
        // was overwritten with undefined, and every request went to "undefined/...".
        this.diagramUrl = this.config?.diagramUrl ?? this.diagramUrl;
    }
    random(min, max) {
        return Math.floor((Math.random()) * (max - min + 1)) + min;
    }
    pick(values) {
        return values[this.random(0, values.length - 1)];
    }
    getLegend() {
        return of(legend);
    }
    //TODO: Don't do anything if id is undefined here - GW
    getDiagram(id) {
        return forkJoin({
            diagram: this.http.get(`${this.diagramUrl}/${id}.json`),
            graph: this.http.get(`${this.diagramUrl}/${id}.graph.json`)
        }).pipe(map((response) => {
            const data = response.diagram;
            const graph = response.graph;
            const idToEdges = new Map(data.edges.map(edge => [edge.id, edge]));
            const idToNodes = new Map(data.nodes.map(node => [node.id, node]));
            const reactomeIdToEdge = new Map([
                // ...data.nodes.map(node => [node.reactomeId, node]),
                ...data.edges.map(edge => [edge.reactomeId, edge])
            ]);
            const edgeIds = new Map();
            const forwardArray = data.edges.flatMap(edge => edge.segments.map(segment => [posToStr(edge, scale(segment.from)), scale(segment.to)]));
            this.extraLine = new Map(forwardArray);
            console.assert(forwardArray.length === this.extraLine.size, "Some edge data have been lost because 2 segments are starting from the same point");
            const backwardArray = data.edges.flatMap(edge => edge.segments.map(segment => [posToStr(edge, scale(segment.to)), scale(segment.from)]));
            this.reverseExtraLine = new Map(backwardArray);
            console.assert(backwardArray.length == this.reverseExtraLine.size, "Some edge data have been lost because 2 segments are ending at the same point");
            const subpathwayIds = new Set(data.shadows.map((shadow) => shadow.reactomeId));
            const eventIdToSubPathwayId = new Map(graph.subpathways?.flatMap(subpathway => subpathway.events
                .map(event => [event, subpathway.dbId])
                .filter(entry => subpathwayIds.has(entry[1]))) || []);
            const subpathwayIdToEventIds = new Map(graph.subpathways?.map(subpathway => [subpathway.dbId, subpathway.events]));
            // create a node id - graph node mapping
            const dbIdToGraphNode = new Map(graph.nodes.map(node => [node.dbId, node]));
            const mappingList = graph.nodes.flatMap(node => {
                if (node.children?.length === 1) {
                    return node.diagramIds?.map(id => [id, dbIdToGraphNode.get(node.children[0])]).filter(entry => entry[1] !== undefined);
                }
                else
                    return node.diagramIds?.map(id => [id, node]);
            }).filter(entry => entry !== undefined);
            const idToGraphNodes = new Map([...mappingList]);
            const idToGraphEdges = new Map(graph.edges.map(edge => [edge.dbId, edge]));
            const dbIdToGraphEdge = new Map(graph.edges.map(edge => [edge.dbId, edge]));
            const hasFadeOut = data.nodes.some(node => node.isFadeOut);
            const normalNodes = data.nodes.filter(node => node.isFadeOut);
            const specialNodes = data.nodes.filter(node => !node.isFadeOut);
            const posToNormalNode = new Map(normalNodes.map(node => [pointToStr(node.position), node]));
            const posToSpecialNode = new Map(specialNodes.map(node => [pointToStr(node.position), node]));
            const normalEdges = data.edges.filter(edge => edge.isFadeOut);
            const specialEdges = data.edges.filter(edge => !edge.isFadeOut);
            const posToNormalEdge = new Map(normalEdges.map(edge => [pointToStr(edge.position), edge]));
            const posToSpecialEdge = new Map(specialEdges.map(edge => [pointToStr(edge.position), edge]));
            //compartment nodes
            const compartmentNodes = data?.compartments.flatMap(item => {
                const propToRects = (prop) => ({
                    left: scale(prop.x),
                    top: scale(prop.y),
                    right: scale(prop.x + prop.width),
                    bottom: scale(prop.x + prop.height),
                });
                const innerCR = 10;
                let outerCR;
                if (item.insets) {
                    const rects = [propToRects(item.prop), propToRects(item.insets)];
                    outerCR = Object.keys(rects[0]).reduce((smallest, key) => Math.min(smallest, Math.abs(rects[0][key] - rects[1][key])), Number.MAX_SAFE_INTEGER);
                    outerCR = innerCR + Math.min(outerCR, 100);
                }
                const layers = [
                    {
                        data: {
                            id: item.id + '-outer',
                            displayName: item.displayName,
                            textX: scale(item.textPosition.x - (item.prop.x + item.prop.width)) + this.COMPARTMENT_SHIFT,
                            textY: scale(item.textPosition.y - (item.prop.y + item.prop.height)) + this.COMPARTMENT_SHIFT,
                            width: scale(item.prop.width),
                            height: scale(item.prop.height),
                            radius: outerCR
                        },
                        classes: ['Compartment', 'outer'],
                        position: scale(item.position),
                        selectable: false,
                    }
                ];
                if (item.insets) {
                    layers.push({
                        data: {
                            id: item.id + '-inner',
                            width: scale(item.insets.width),
                            height: scale(item.insets.height),
                            radius: innerCR
                        },
                        classes: ['Compartment', 'inner'],
                        position: scale({ x: item.insets.x + item.insets.width / 2, y: item.insets.y + item.insets.height / 2 }),
                        selectable: false,
                    });
                }
                return layers;
            });
            const replacementMap = new Map();
            //reaction nodes
            const reactionNodes = data?.edges.map(item => {
                let replacement, replacedBy;
                if (item.isFadeOut) {
                    replacedBy = posToSpecialEdge.get(pointToStr(item.position))?.id.toString() || specialEdges.find(edge => squaredDist(scale(edge.position), scale(item.position)) < 5 ** 2)?.id.toString();
                    if (replacedBy) {
                        replacementMap.set(item.id.toString(), replacedBy);
                        replacementMap.set(replacedBy, item.id.toString());
                    }
                }
                if (!item.isFadeOut)
                    replacement = posToNormalEdge.get(pointToStr(item.position)) || normalEdges.find(edge => squaredDist(scale(edge.position), scale(item.position)) < 5 ** 2)?.id.toString();
                return ({
                    data: {
                        id: item.id + '',
                        // displayName: item.displayName,
                        inputs: item.inputs,
                        output: item.outputs,
                        isFadeOut: item.isFadeOut,
                        isBackground: item.isFadeOut,
                        reactomeId: item.reactomeId,
                        reactionId: item.id,
                        graph: idToGraphEdges.get(item.reactomeId),
                        replacement, replacedBy
                    },
                    classes: this.reactionTypeMap.get(item.reactionType),
                    position: scale(item.position)
                });
            });
            //entity nodes
            const entityNodes = data?.nodes.flatMap(item => {
                const classes = [...(this.nodeTypeMap.get(item.renderableClass) || [item.renderableClass.toLowerCase()])];
                let replacedBy;
                let replacement;
                if (item.isDisease)
                    classes.push('disease');
                if (item.isCrossed)
                    classes.push('crossed');
                if (item.trivial)
                    classes.push('trivial');
                if (item.needDashedBorder)
                    classes.push('loss-of-function');
                if (item.isFadeOut) {
                    replacedBy = posToSpecialNode.get(pointToStr(item.position))?.id.toString();
                    if (!replacedBy) {
                        replacedBy = specialNodes.find(node => overlapLimited(item, node, 0.8))?.id.toString();
                    }
                    if (replacedBy) {
                        replacementMap.set(item.id.toString(), replacedBy);
                        replacementMap.set(replacedBy, item.id.toString());
                    }
                }
                if (!item.isFadeOut)
                    replacement = posToNormalNode.get(pointToStr(item.position))?.id.toString(); //|| normalNodes.find(node => overlap(item, node))?.id.toString();
                if (classes.some(clazz => clazz === 'RNA'))
                    item.prop.height -= 10;
                if (classes.some(clazz => clazz === 'Cell'))
                    item.prop.height /= 2;
                const isBackground = item.isFadeOut || classes.some(clazz => clazz === 'Pathway') || item.connectors.some(connector => connector.isFadeOut);
                item.isBackground = isBackground;
                let html = undefined;
                const width = scale(item.prop.width);
                const height = scale(item.prop.height);
                const uniprotId = idToGraphNodes.get(item.id)?.identifier;
                if (classes.some(clazz => clazz === 'Protein')) {
                    html = this.getStructureVideoHtml({ ...item, type: 'Protein' }, width, height, uniprotId);
                }
                if (isBackground && !item.isFadeOut) {
                    replacementMap.set(item.id.toString(), item.id.toString());
                }
                const isFadeOut = !item.isCrossed && item.isFadeOut;
                const nodes = [
                    {
                        data: {
                            id: item.id + '',
                            reactomeId: item.reactomeId,
                            displayName: item.displayName.replace(/([/,:;-])/g, "$1\u200b"),
                            height: height,
                            width: width,
                            graph: idToGraphNodes.get(item.id),
                            acc: uniprotId,
                            html,
                            isFadeOut,
                            isBackground,
                            replacement,
                            replacedBy
                        },
                        classes: classes,
                        position: scale(item.position)
                    }
                ];
                if (item.nodeAttachments) {
                    nodes.push(...item.nodeAttachments.map(ptm => ({
                        data: {
                            id: item.id + '-' + ptm.reactomeId,
                            reactomeId: ptm.reactomeId,
                            nodeId: item.id,
                            nodeReactomeId: item.reactomeId,
                            displayName: ptm.label,
                            height: scale(ptm.shape.b.y - ptm.shape.a.y),
                            width: scale(ptm.shape.b.x - ptm.shape.a.x),
                            isFadeOut,
                            isBackground,
                            replacement,
                            replacedBy
                        },
                        classes: "Modification",
                        position: scale(ptm.shape.centre)
                    })));
                }
                return nodes;
            });
            //sub pathways
            const shadowNodes = data?.shadows.map(item => {
                return {
                    data: {
                        id: item.id + '',
                        displayName: item.displayName,
                        height: scale(item.prop.height),
                        width: scale(item.prop.width),
                        reactomeId: item.reactomeId,
                    },
                    classes: ['Shadow'],
                    position: closestToAverage(subpathwayIdToEventIds.get(item.reactomeId).map(reactionId => reactomeIdToEdge.get(reactionId)).map(edge => scale(edge.position)))
                };
            });
            avoidOverlap(shadowNodes);
            const T = 4;
            const ARROW_MULT = 1.5;
            const EDGE_MARGIN = 6;
            const REACTION_RADIUS = 3 * T;
            const MIN_DIST = EDGE_MARGIN;
            /**
             * iterate nodes connectors to get all edges information based on the connector type.
             *
             */
            const edges = data.nodes.flatMap(node => {
                return node.connectors.map(connector => {
                    const reaction = idToEdges.get(connector.edgeId);
                    const reactionP = scale(reaction.position);
                    const nodeP = scale(node.position);
                    const [source, target] = connector.type !== 'OUTPUT' ?
                        [node, reaction] :
                        [reaction, node];
                    const sourceP = scale(source.position);
                    const targetP = scale(target.position);
                    const points = connector.segments
                        .flatMap((segment, i) => i === 0 ? [segment.from, segment.to] : [segment.to])
                        .map(pos => scale(pos));
                    if (connector.type === 'OUTPUT')
                        points.reverse();
                    if (points.length === 0)
                        points.push(reactionP);
                    this.addEdgeInfo(reaction, points, 'backward', sourceP);
                    this.addEdgeInfo(reaction, points, 'forward', targetP);
                    let [from, to] = [points.shift(), points.pop()];
                    from = from ?? nodeP; // Quick fix to avoid problem with reaction without visible outputs like R-HSA-2424252 in R-HSA-1474244
                    to = to ?? reactionP; // Quick fix to avoid problem with reaction without visible outputs like R-HSA-2424252 in R-HSA-1474244
                    if (connector.type === 'CATALYST') {
                        to = scale(connector.endShape.centre);
                    }
                    // points = addRoundness(from, to, points);
                    const relatives = this.absoluteToRelative(from, to, points);
                    const classes = [...this.edgeTypeMap.get(connector.type)];
                    if (reaction.isDisease)
                        classes.push('disease');
                    if (node.trivial)
                        classes.push('trivial');
                    if (eventIdToSubPathwayId.has(reaction.reactomeId))
                        classes.push('shadow');
                    let d = dist(from, to);
                    if (equal(from, reactionP) || equal(to, reactionP))
                        d -= REACTION_RADIUS;
                    if (classes.includes('positive-regulation') || classes.includes('catalysis') || classes.includes('production'))
                        d -= ARROW_MULT * T;
                    // console.assert(d > MIN_DIST, `The edge between reaction: R-HSA-${reaction.reactomeId} and entity: R-HSA-${node.reactomeId} in pathway ${id} has a visible length of ${d} which is shorter than ${MIN_DIST}`)
                    console.assert(d > MIN_DIST, `${id}\t${data.displayName}\t${hasFadeOut}\tR-HSA-${reaction.reactomeId}\tR-HSA-${node.reactomeId}\thttps://release.reactome.org/PathwayBrowser/#/${id}&SEL=R-HSA-${reaction.reactomeId}&FLG=R-HSA-${node.reactomeId}\thttps://reactome-pwp.github.io/PathwayBrowser/${id}?select=${reaction.reactomeId}&flag=${node.reactomeId}`);
                    let replacement, replacedBy;
                    if (connector.isFadeOut) {
                        // First case: same node is used both special and normal context
                        // replacedBy = node.connectors.find(otherConnector => otherConnector !== connector && !otherConnector.isFadeOut && samePoint(idToEdges.get(otherConnector.edgeId)!.position, reaction.position))?.edgeId;
                        // Second case: different nodes are used between special and normal context
                        // replacedBy = replacedBy || (posToSpecialNode.get(pointToStr(node.position)) && posToSpecialEdge.get(pointToStr(reaction.position)))?.id;
                        replacedBy = replacementMap.get(node.id.toString()) && replacementMap.get(reaction.id.toString());
                    }
                    if (!connector.isFadeOut) {
                        // First case: same node is used both special and normal context
                        replacement = node.connectors.find(otherConnector => otherConnector !== connector && otherConnector.isFadeOut && samePoint(idToEdges.get(otherConnector.edgeId).position, reaction.position))?.edgeId;
                        // Second case: different nodes are used between special and normal context
                        replacement = replacement || (posToNormalNode.get(pointToStr(node.position)) && posToNormalEdge.get(pointToStr(reaction.position)))?.id;
                    }
                    const edge = {
                        data: {
                            id: this.getEdgeId(source, connector, target, edgeIds),
                            graph: dbIdToGraphEdge.get(reaction.reactomeId),
                            source: source.id + '',
                            target: target.id + '',
                            stoichiometry: connector.stoichiometry.value,
                            weights: relatives.weights.join(" "),
                            distances: relatives.distances.join(" "),
                            sourceEndpoint: this.endpoint(sourceP, from),
                            targetEndpoint: this.endpoint(targetP, to),
                            pathway: eventIdToSubPathwayId.get(reaction.reactomeId),
                            reactomeId: reaction.reactomeId,
                            reactionId: reaction.id,
                            isFadeOut: reaction.isFadeOut,
                            isBackground: reaction.isFadeOut,
                            replacedBy, replacement
                        },
                        classes: classes
                    };
                    return edge;
                });
            });
            const linkEdges = data.links
                ?.filter(link => !link.renderableClass.includes('EntitySet') || link.inputs[0].id !== link.outputs[0].id)
                ?.map(link => {
                const source = idToNodes.get(link.inputs[0].id);
                const target = idToNodes.get(link.outputs[0].id);
                const sourceP = scale(source.position);
                const targetP = scale(target.position);
                const points = link.segments
                    .flatMap((segment, i) => i === 0 ? [segment.from, segment.to] : [segment.to])
                    .map(pos => scale(pos));
                let [from, to] = [points.shift(), points.pop()];
                from = from ?? sourceP; // Quick fix to avoid problem with reaction without visible outputs like R-HSA-2424252 in R-HSA-1474244
                to = to ?? targetP; // Quick fix to avoid problem with reaction without visible outputs like R-HSA-2424252 in R-HSA-1474244
                // points = addRoundness(from, to, points);
                const relatives = this.absoluteToRelative(from, to, points);
                const classes = [...this.linkClassMap.get(link.renderableClass)];
                if (link.isDisease)
                    classes.push('disease');
                const isBackground = link.isFadeOut ||
                    idToNodes.get(link.inputs[0].id)?.isBackground &&
                        idToNodes.get(link.outputs[0].id)?.isBackground;
                return {
                    data: {
                        id: link.id + '',
                        source: link.inputs[0].id + '',
                        target: link.outputs[0].id + '',
                        weights: relatives.weights.join(" "),
                        distances: relatives.distances.join(" "),
                        sourceEndpoint: this.endpoint(sourceP, from),
                        targetEndpoint: this.endpoint(targetP, to),
                        isFadeOut: link.isFadeOut,
                        isBackground: isBackground
                    },
                    classes: classes,
                    selectable: false
                };
            });
            return {
                nodes: [...compartmentNodes, ...reactionNodes, ...entityNodes, ...shadowNodes],
                edges: [...edges, ...linkEdges]
            };
        }));
    }
    getStructureVideoHtml(item, width, height, uniprotId) {
        if (item.type === 'Protein')
            return `<video loop id="video-${item.id}" width="${width + 10}" height="${height + 10}">
                <source src="https://s3.amazonaws.com/download.reactome.org/structures/${uniprotId}.mov" type="video/quicktime">
                <source src="https://s3.amazonaws.com/download.reactome.org/structures/${uniprotId}.webm" type="video/webm">
              </video>`;
        return undefined;
    }
    getEdgeId(source, connector, target, edgeIds) {
        let edgeId = `${source.id} --${this.edgeTypeToStr.get(connector.type)} ${target.id}`;
        if (edgeIds.has(edgeId)) {
            let count = edgeIds.get(edgeId);
            edgeIds.set(edgeId, count++);
            edgeId += ` (${count})`;
            console.warn('Conflicting edge id: ', edgeId);
        }
        else {
            edgeIds.set(edgeId, 0);
        }
        return edgeId;
    }
    addEdgeInfo(edge, points, direction, stop) {
        const stopPos = posToStr(edge, stop);
        if (direction === 'forward') {
            const map = this.extraLine;
            let pos = posToStr(edge, points.at(-1));
            while (map.has(pos) && pos !== stopPos) {
                points.push(map.get(pos));
                pos = posToStr(edge, points.at(-1));
            }
        }
        else {
            const map = this.reverseExtraLine;
            let pos = posToStr(edge, points.at(0));
            while (map.has(pos) && pos !== stopPos) {
                points.unshift(map.get(pos));
                pos = posToStr(edge, points.at(0));
            }
        }
    }
    endpoint(source, point) {
        return `${point.x - source.x} ${point.y - source.y}`;
    }
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
    absoluteToRelative(source, target, toConvert) {
        const relatives = { distances: [], weights: [] };
        if (toConvert.length === 0)
            return relatives;
        const mainVector = array([target.x - source.x, target.y - source.y]); // Edge vector
        const orthoVector = array([-mainVector.y, mainVector.x]) // Perpendicular vector
            .normalize(); //Normalized to have the distance expressed in pixels https://math.stackexchange.com/a/413235/683621
        const transform = array([
            [mainVector.x, mainVector.y],
            [orthoVector.x, orthoVector.y],
        ]).inv(); // Should always be invertible if the ortho vector is indeed perpendicular
        for (const coord of toConvert) {
            const absolute = array([[coord.x - source.x, coord.y - source.y]]);
            const relative = absolute.multiply(transform);
            relatives.weights.push(relative.get(0, 0));
            relatives.distances.push(relative.get(0, 1));
        }
        return relatives;
    }
    randomNetwork() {
        const amount = 100;
        const peTypes = ['Protein', 'EntitySet', 'GenomeEncodedEntity', 'RNA', 'Gene', 'Complex', 'Molecule'];
        // const peTypes = ['Gene'];
        const reactionTypes = ['association', 'dissociation', 'transition', 'uncertain', 'omitted'];
        const physicalEntities = Array.from({ length: amount }, (_x, i) => {
            const clazz = this.pick(peTypes);
            return {
                group: 'nodes',
                data: {
                    id: i.toString(),
                    width: this.random(150, 300),
                    height: this.random(50, 150),
                    displayName: clazz,
                    parent: 'Compartment'
                },
                classes: [clazz, "PhysicalEntity", this.pick(["drug", "", ""])]
            };
        });
        const reactions = physicalEntities.map((_node, i) => ({
            group: 'nodes',
            data: {
                id: `${i}-react`,
                parent: 'Compartment'
            },
            classes: [this.pick(reactionTypes), 'reaction']
        }));
        const nodes = physicalEntities.flatMap((node, i) => [node, reactions[i]]);
        const inOut = physicalEntities.flatMap((_node, i) => [
            {
                group: 'edges',
                data: {
                    source: `${i}`,
                    target: `${i}-react`,
                    stoichiometry: this.pick([undefined, -1, 0, 1, 2])
                },
                classes: ['consumption']
            },
            {
                group: 'edges',
                data: {
                    source: `${i}-react`,
                    target: `${(i + 1) % amount}`,
                    stoichiometry: this.pick([undefined, -1, 0, 1, 2])
                },
                classes: ['production']
            },
        ]);
        const additionalIn = Array.from({ length: amount / 4 }).map(() => ({
            group: 'edges',
            data: {
                source: this.pick(physicalEntities).data.id,
                target: this.pick(reactions).data.id,
            },
            classes: this.pick(['catalysis', 'positive-regulation', 'negative-regulation', 'set-to-member'])
        }));
        const edges = [...inOut, ...additionalIn];
        return of({
            nodes: [
                {
                    data: { id: 'Compartment' },
                    classes: ['Compartment'],
                    pannable: true,
                    grabbable: false,
                    selectable: false
                },
                ...nodes
            ],
            edges
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DiagramService, deps: [{ token: i1.HttpClient }, { token: DIAGRAM_CONFIG_TOKEN }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DiagramService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DiagramService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DIAGRAM_CONFIG_TOKEN]
                }] }] });
function samePoint(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}
function overlapLimited(nodeA, nodeB, limit = 0.8) {
    if (nodeA.position.x === nodeB.position.x && nodeA.position.y === nodeB.position.y)
        return true;
    const rectA = getRect(nodeA), rectB = getRect(nodeB);
    const o = {
        left: Math.max(rectA.left, rectB.left),
        right: Math.min(rectA.right, rectB.right),
        top: Math.max(rectA.top, rectB.top),
        bottom: Math.min(rectA.bottom, rectB.bottom)
    };
    return (o.left < o.right && o.top < o.bottom) && ((area(o) / area(rectA)) > limit);
}
function area(rect) {
    return (rect.right - rect.left) * (rect.bottom - rect.top);
}
function getRect(node) {
    if (node.rect)
        return node.rect;
    const halfWidth = node.prop.width / 2;
    const halfHeight = node.prop.height / 2;
    node.rect = {
        left: node.position.x - halfWidth,
        right: node.position.x + halfWidth,
        top: node.position.y - halfHeight,
        bottom: node.position.y + halfHeight,
    };
    return node.rect;
}
/**
 * Create a temporary cytoscape session to apply a layout to the nodes in order to avoid them to overlap each others
 */
function avoidOverlap(definitions) {
    const container = document.createElement("div");
    const style = new Style(container, {});
    const cy = cytoscape({
        container: container,
        style: style.getStyleSheet(),
        elements: definitions,
        layout: { name: 'preset' }
    });
    const nodes = cy.nodes();
    nodes.forEach(node => {
        const bb = node.boundingBox({ includeLabels: true, includeNodes: false });
        node.style({ width: bb.w, height: bb.h });
    });
    const layout = nodes.layout({
        name: 'fcose',
        nodeRepulsion: 15,
        animate: false,
        fit: true,
        packComponents: false,
        randomize: false,
        tile: false,
    });
    layout.run();
    definitions.forEach(def => def.position = cy.getElementById(def.data.id).position());
    cy.destroy();
    container.remove();
}

class DarkService {
    constructor() {
        this._isDark = false;
        this.$_dark = new BehaviorSubject(this._isDark);
        this.$dark = this.$_dark.asObservable();
        this._body = document.querySelector('body');
        // Update theme if other tabs are changing it
        // window.addEventListener('storage', (e) => {
        //   if (e.key === 'is-dark') this.isDark = JSON.parse(e.newValue || 'false');
        // });
        const localValue = localStorage.getItem('is-dark');
        if (localValue)
            this.isDark = JSON.parse(localValue);
        else if (window.matchMedia('(prefers-color-scheme)').media !== 'not all') {
            this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
    }
    get isDark() {
        return this._isDark;
    }
    set isDark(value) {
        this._isDark = value;
        localStorage.setItem('is-dark', JSON.stringify(value));
        if (value)
            this._body?.classList.add('dark');
        else
            this._body?.classList.remove('dark');
        this.$_dark.next(this._isDark);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DarkService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DarkService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DarkService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class DiagramStateService {
    constructor(route, router) {
        this.router = router;
        this.ignore = false;
        this.blockRouterChange = false;
        this.state = {
            select: { otherTokens: ['SEL'], value: '' },
            flag: { otherTokens: ['FLG'], value: [] },
            path: { otherTokens: ['PATH'], value: [] },
            flagInteractors: { otherTokens: ['FLGINT'], value: false },
            overlay: { value: '' },
            analysis: { value: null, otherTokens: ['ANALYSIS'] },
            analysisProfile: { value: null },
        };
        this._state$ = new BehaviorSubject(this.state);
        this.state$ = this._state$.asObservable();
        this.onChange = Object.keys(this.state)
            .reduce((properties, prop) => {
            properties[`${prop}$`] = this.state$.pipe(map(state => state[prop].value), distinctUntilChanged((v1, v2) => v1?.toString() === v2?.toString()));
            return properties;
        }, {});
        route.queryParamMap.subscribe(params => {
            if (this.ignore)
                return;
            let change = false;
            for (const mainToken in this.state) {
                const param = this.state[mainToken];
                const tokens = [mainToken, ...param.otherTokens || []];
                const token = tokens.find(token => params.has(token));
                if (token) {
                    const formerValue = param.value;
                    if (isArray(param.value)) {
                        const rawValue = params.get(token);
                        // A database id is a number; anything else, such as a gene name, a string.
                        param.value = rawValue.split(',').map(v => /^\d+$/.test(v) ? parseInt(v) : v);
                    }
                    else {
                        param.value = params.get(token);
                    }
                    // Changed when it differs from before. This was inverted, so a state
                    // read from the address reached no one and an unchanged one did.
                    change = change || formerValue?.toString() !== param.value?.toString();
                }
            }
            if (change)
                this._state$.next(this.state);
        });
    }
    get(token) {
        return this.state[token].value;
    }
    set(token, value) {
        this.state[token].value = value;
        // N.B. by GW: Not sure why this.ignore is here. Nothing changes here!!!
        // Most likely this.ignore = true below
        this.ignore = false;
        if (!this.blockRouterChange) {
            // Subscribers hear of it once the address has it. They used to through
            // the address itself, by way of the inverted change check that read an
            // unchanged value as a change.
            void this.onPropertyModified().then(() => {
                this.ignore = false;
                this._state$.next(this.state);
            });
        }
    }
    onPropertyModified() {
        return this.router.navigate([], {
            queryParams: {
                ...Object.entries(this.state)
                    .filter(([_token, param]) => param.value && param.value.length !== 0)
                    .reduce((acc, [token, param]) => ({
                    ...acc,
                    [token]: Array.isArray(param.value) ? param.value.join(',') : param.value
                }), {})
            }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DiagramStateService, deps: [{ token: i1$1.ActivatedRoute }, { token: i1$1.Router }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DiagramStateService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DiagramStateService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1$1.ActivatedRoute }, { type: i1$1.Router }] });

let DiagramComponent = class DiagramComponent {
    constructor(diagram, dark, state, dialog) {
        this.diagram = diagram;
        this.dark = dark;
        this.state = state;
        this.dialog = dialog;
        this.title = 'pathway-browser';
        this.comparing = false;
        this.selectedPsicquicResource = new FormControl();
        this.isDataFromPsicquicLoading = false;
        this._reactomeEvents$ = new Subject();
        this._ignore = false;
        this.reactomeEvents$ = this._reactomeEvents$.asObservable().pipe(distinctUntilChanged((prev, current) => prev.type === current.type && prev.detail.reactomeId === current.detail.reactomeId), filter(() => !this._ignore), share());
        this.diagramId = '';
        // Flag to control if dbId should be used as primary ids
        // This should be useful in the context of the curator tool since
        // dbIds are used as primary ids. Not all instances have stable ids.
        this.usedbId = false;
        this.flagging = this.state.onChange.flag$.subscribe((value) => this.avoidSideEffect(() => [this.cy, this.cyCompare].forEach(cy => { if (cy) {
            this.flag(value, cy);
        } })));
        this.selecting = this.state.onChange.select$.subscribe((value) => this.avoidSideEffect(() => [this.cy, this.cyCompare].forEach(cy => { if (cy) {
            this.select(value, cy);
        } })));
        this.classRegex = /class:(\w+)([!.]drug)?/;
        this.ratio = 0.384;
        this.replacedElementsPosition = [];
        this.lastIndex = 0;
        this.underlayPadding = 0;
        this.syncing = false;
        this.syncViewports = (source, sourceContainer, target, targetContainer) => {
            if (this.syncing)
                return;
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
        this.compareDragging = false;
        // ----- Event Syncing -----
        // stateToDiagramSub = this.state.state$.subscribe(() => this.stateToDiagram());
        this.compareBackgroundSync = this.reactomeEvents$.pipe(filter(() => this.comparing), filter((e) => e.detail.cy !== this.legend)).subscribe(event => {
            const src = event.detail.cy;
            const tgt = src === this.cy ? this.cyCompare : this.cy;
            let replacedBy = event.detail.element.data('replacedBy');
            replacedBy = replacedBy || event.detail.element.data('replacement');
            replacedBy = replacedBy || (event.detail.element.data('isBackground') && !event.detail.element.data('isFadeOut') && event.detail.element.data('id'));
            if (!replacedBy)
                return;
            let replacements = tgt.getElementById(replacedBy);
            if (event.detail.type === 'reaction') {
                // Need to check if replaceBy is an object or a number
                if (typeof replacedBy === 'object') {
                    // If replacedBy is an object, try to get its id property
                    replacedBy = replacedBy.reactomeId;
                }
                if (typeof replacedBy === 'number') // Looks like there is a bug in cytoscape. check for object will return all elements.
                    replacements = replacements.add(tgt.elements(`[reactionId=${replacedBy}]`));
            }
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
        this.diagram2legend = this.reactomeEvents$.pipe(filter((e) => e.detail.cy !== this.legend)).subscribe(event => {
            const classes = event.detail.element.classes();
            let matchingElement = this.legend.elements(`.${classes[0]}`);
            if (event.detail.type === 'PhysicalEntity') {
                if (classes.includes('drug'))
                    matchingElement = matchingElement.nodes('.drug');
                else
                    matchingElement = matchingElement.not('.drug');
            }
            else if (event.detail.type === 'reaction') {
                const reaction = event.detail.element.nodes('.reaction');
                matchingElement = this.legend.nodes(`.${reaction.classes()[0]}`).first();
                matchingElement = matchingElement.add(matchingElement.connectedEdges());
            }
            this._ignore = true;
            this.applyEvent(event, matchingElement);
            this._ignore = false;
        });
        this.diagramSelect2state = this.reactomeEvents$.pipe(filter((e) => e.detail.cy !== this.legend), delay(0)).subscribe(e => {
            if (e.type !== ReactomeEventTypes.select)
                return;
            let elements = e.detail.element;
            if (e.detail.type === 'reaction') {
                elements = e.detail.cy.elements('node.reaction:selected');
            }
            let reactomeIds = [];
            if (this.usedbId)
                reactomeIds = elements.map(el => el.data('reactomeId'));
            else
                reactomeIds = elements.map(el => el.data('graph.stId'));
            // Make sure reactomeIds don't contain duplicated element
            const uniqueSet = new Set(reactomeIds);
            reactomeIds = Array.from(uniqueSet);
            this.state.set('select', reactomeIds[0] || '');
        });
        this.legend2state = this.reactomeEvents$.pipe(filter((e) => e.detail.cy === this.legend), filter(() => !this._ignore)).subscribe((e) => {
            const event = e;
            const classes = event.detail.element.classes();
            let matchingElement = this.cy.elements(`.${classes[0]}`);
            if (event.detail.type === 'PhysicalEntity' || event.detail.type === 'Pathway') {
                if (classes.includes('drug'))
                    matchingElement = matchingElement.nodes('.drug');
                else
                    matchingElement = matchingElement.not('.drug');
            }
            else if (event.detail.type === 'reaction') {
                const reaction = event.detail.element.nodes('.reaction');
                matchingElement = this.cy.nodes(`.${reaction.classes()[0]}`);
                matchingElement = matchingElement.add(matchingElement.connectedEdges());
            }
            switch (event.type) {
                case ReactomeEventTypes.select:
                    this.state.set('flag', ['class:' + classes[0] + (classes.includes('drug') ? '.' : '!') + 'drug']);
                    this.stateToDiagram();
                    break;
                case ReactomeEventTypes.unselect:
                    this.state.set('flag', []);
                    this.stateToDiagram();
                    break;
                case ReactomeEventTypes.hover:
                    matchingElement.addClass('hover');
                    break;
                case ReactomeEventTypes.leave:
                    matchingElement.removeClass('hover');
                    break;
            }
        });
    }
    // There are many issues having URL changes for selection state or other
    // state changes in the curator tool environment (e.g conflict with tree URL)
    // therefore, we'd like to block the change by flagging this to true.
    set blockRouterChange(block) {
        if (this.state)
            this.state.blockRouterChange = block;
    }
    ;
    ngOnChanges(changes) {
        if (changes['diagramId'])
            this.loadDiagram();
    }
    ngAfterViewInit() {
        this.dark.$dark.subscribe(this.updateStyle.bind(this));
        const container = this.cytoscapeContainer.nativeElement;
        const compareContainer = this.compareContainer.nativeElement;
        const legendContainer = this.legendContainer.nativeElement;
        Object.values(ReactomeEventTypes).forEach((type) => {
            container.addEventListener(type, (e) => this._reactomeEvents$.next(e));
            compareContainer.addEventListener(type, (e) => this._reactomeEvents$.next(e));
            legendContainer.addEventListener(type, (e) => this._reactomeEvents$.next(e));
        });
        this.reactomeStyle = new Style(container);
        this.diagram.getLegend()
            .subscribe(legend => {
            this.legend = cytoscape({
                container: legendContainer,
                elements: legend,
                style: this.reactomeStyle?.getStyleSheet(),
                layout: { name: "preset" },
                boxSelectionEnabled: false
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
        if (!this.cytoscapeContainer)
            return;
        if (!this.diagramId || this.diagramId.trim().length == 0)
            return; // Nothing to do.
        this.diagram.getDiagram(this.diagramId)
            .subscribe(elements => {
            this.displayNetwork(elements);
        });
    }
    displayNetwork(elements) {
        const container = this.cytoscapeContainer.nativeElement;
        this.comparing = (elements.nodes?.some((node) => node.data['isFadeOut'])) ||
            (elements.edges?.some((edge) => edge.data['isFadeOut']));
        this.cy = cytoscape({
            container: container,
            elements: elements,
            style: this.reactomeStyle?.getStyleSheet(),
            layout: { name: "preset" },
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
    initialiseReplaceElements() {
        if (this.comparing)
            this.cy.batch(() => {
                this.cy.elements('[!isBackground]').style('visibility', 'hidden');
                this.cy.edges('.shadow').style('underlay-padding', 0);
                this.lastIndex = 0;
                this.updateReplacementVisibility();
                this.cy.elements('.Compartment').style('visibility', 'visible');
            });
    }
    loadCompare(elements, container) {
        const getPosition = (e) => e.is('.Shadow') ? e.data('triggerPosition') : e.boundingBox().x1;
        if (this.comparing) {
            this.cy.elements('[!isBackground]').style('visibility', 'hidden');
            this.replacedElements = this.cy
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
                    if (index === -1)
                        index = this.replacedElements.length;
                    this.replacedElements.splice(index, 0, addedElement);
                    this.replacedElementsPosition.splice(index, 0, x);
                    addedElement.style('visibility', 'hidden');
                }
            });
            this.cy.on('remove', e => {
                const removedElement = e.target;
                const index = this.replacedElements.indexOf(removedElement);
                if (index > -1) {
                    this.replacedElements.splice(index, 1);
                    this.replacedElementsPosition.splice(index, 1);
                }
            });
            const compareContainer = this.compareContainer.nativeElement;
            this.cyCompare = cytoscape({
                container: compareContainer,
                elements: elements,
                style: this.reactomeStyle?.getStyleSheet(),
                layout: { name: "preset" },
            });
            this.cyCompare.elements('[?isFadeOut]').remove();
            this.cyCompare.elements('.Compartment').remove();
            this.cy.nodes('.crossed').removeClass('crossed');
            this.cyCompare.on('viewport', () => this.syncViewports(this.cyCompare, compareContainer, this.cy, container));
            this.cy.on('viewport', () => this.syncViewports(this.cy, container, this.cyCompare, compareContainer));
            this.reactomeStyleCompare = new Style(compareContainer);
            this.reactomeStyleCompare?.bindToCytoscape(this.cyCompare);
            this.cyCompare.minZoom(this.cy.minZoom());
            this.cyCompare.maxZoom(this.cy.maxZoom());
            setTimeout(() => {
                this.syncViewports(this.cy, container, this.cyCompare, compareContainer);
                this.initialiseReplaceElements();
            });
        }
    }
    avoidSideEffect(m) {
        this._ignore = true;
        m();
        this._ignore = false;
    }
    stateToDiagram() {
        for (const cy of [this.cy, this.cyCompare].filter(cy => cy !== undefined)) {
            this.flag(this.state.get('flag'), cy);
            this.select(this.state.get("select"), cy);
        }
    }
    getElements(tokens, cy) {
        let elements;
        elements = cy.collection();
        tokens.forEach(token => {
            if (typeof token === 'string') {
                // An empty token should be ignored. If this is not done,
                // all objects will be selected since [acc=""] matches all elements without acc attribute.
                if (token.trim().length === 0)
                    return;
                if (token.startsWith('R-')) {
                    elements = elements.or(`[graph.stId="${token}"]`);
                }
                else {
                    const matchArray = token.match(this.classRegex);
                    if (matchArray) {
                        const [_, clazz, drug] = matchArray;
                        if (drug === '.drug') { // Drug physical entity
                            elements = elements.or(`.${clazz}`).and('.drug');
                        }
                        else if (drug === '!drug') { // Non drug physical entity
                            elements = elements.or(`.${clazz}`).not('.drug');
                        }
                        else { // Non physical entity
                            elements = elements.or(`.${clazz}`);
                        }
                    }
                    else if (this.usedbId) {
                        // It is possible dbId is encoded in string
                        elements = elements.or(`[reactomeId=${token}]`);
                    }
                    else {
                        elements = elements.or(`[acc=${token}]`);
                    }
                }
            }
            else {
                elements = elements.or(`[acc=${token}]`).or(`[reactomeId=${token}]`);
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
    select(tokens, cy) {
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
            });
        }
        return selected;
    }
    flag(accs, cy) {
        return this.flagElements(this.getElements(accs, cy), cy);
    }
    flagElements(toFlag, cy) {
        if (toFlag.nonempty()) {
            cy.batch(() => {
                this.setSubPathwayVisibility(false, cy);
                cy.elements().removeClass('flag');
                toFlag.addClass('flag')
                    .edges().style({ 'underlay-opacity': 1 });
            });
            return toFlag;
        }
        else {
            cy.batch(() => {
                this.setSubPathwayVisibility(true, cy);
                cy.elements().removeClass('flag');
            });
            return cy.collection();
        }
    }
    setSubPathwayVisibility(visible, cy) {
        const shadowNodes = cy.nodes('.Shadow');
        const shadowEdges = cy.edges('[?color]');
        const trivials = cy.elements('.trivial');
        if (visible) {
            shadowNodes.style({ opacity: 1 });
            trivials.style({ opacity: 1 });
            shadowEdges.addClass('shadow');
            // The handlers bound to this graph: cy.data('reactome').interactivity is
            // whichever graph its Style was bound to last.
            const onZoomShadow = interactivityOf(cy)?.onZoom.shadow;
            if (onZoomShadow) {
                cy.on('zoom', onZoomShadow);
                onZoomShadow();
            }
        }
        else {
            shadowNodes.style({ opacity: 0 });
            shadowEdges.removeClass('shadow');
            const onZoomShadow = interactivityOf(cy)?.onZoom.shadow;
            if (onZoomShadow)
                cy.off('zoom', onZoomShadow);
            trivials.style({ opacity: 1 });
            cy.edges().style({ 'underlay-opacity': 0 });
        }
    }
    applyEvent(event, affectedElements) {
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
    updateReplacementVisibility() {
        // // Calculate the position of the element that is to the right of the separation
        const extent = this.cyCompare.extent();
        let limitIndex = this.replacedElementsPosition.findIndex(x1 => x1 >= extent.x1);
        if (limitIndex === -1)
            limitIndex = this.replacedElements.length;
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
                this.replacedElements.slice(limitIndex, this.lastIndex)
                    .map(e => e.style('visibility', 'hidden')) // Hide the range of elements
                    .filter(e => e.is('.Shadow')) // And if it is an shadow
                    .forEach(shadow => shadow.data('edges').style('underlay-padding', 0)); // Hide as well the associated reaction underlay
            // If at least one element is switched from right to left
            if (limitIndex > this.lastIndex)
                this.replacedElements.slice(this.lastIndex, limitIndex)
                    .map(e => e.style('visibility', 'visible')) // Show the range of elements
                    .filter(e => e.is('.Shadow')) // And if it is an shadow
                    .forEach(shadow => shadow.data('edges').style('underlay-padding', this.underlayPadding)); // Show as well the associated reaction underlay
        }
        this.lastIndex = limitIndex;
    }
    updateStyle() {
        this.cy ? setTimeout(() => this.reactomeStyle?.update(this.cy), 5) : null;
        this.cyCompare ? setTimeout(() => this.reactomeStyle?.update(this.cyCompare), 5) : null;
        this.legend ? setTimeout(() => this.reactomeStyle?.update(this.legend), 5) : null;
    }
    dragStart() {
        this.compareDragging = true;
    }
    dragEnd() {
        this.compareDragging = false;
    }
    dragMove($event, compareContainer, container) {
        if (!this.compareDragging)
            return;
        compareContainer.style['left'] = $event.x - container.getBoundingClientRect().x + 'px';
        this.cyCompare.resize();
        this.syncViewports(this.cy, this.cytoscapeContainer.nativeElement, this.cyCompare, this.compareContainer.nativeElement);
    }
    updateLegend() {
        this.legend.resize();
        this.legend.panningEnabled(true);
        this.legend.zoomingEnabled(true);
        this.legend.fit(this.legend.elements(), 2);
        this.legend.panningEnabled(false);
        this.legend.zoomingEnabled(false);
    }
    logProteins() {
        // eslint-disable-next-line no-console -- logging is what it is called for
        console.debug(new Set(this.cy.nodes(".Protein").map(node => node.data("acc") || node.data("iAcc"))));
    }
    /**
     * Somehow DiagramService cannot be exported for use out of this package. Therefore, use this method to get this instance.
     */
    getDiagramService() {
        return this.diagram;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DiagramComponent, deps: [{ token: DiagramService }, { token: DarkService }, { token: DiagramStateService }, { token: i4.MatDialog }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.25", type: DiagramComponent, isStandalone: true, selector: "cr-diagram", inputs: { diagramId: ["id", "diagramId"], usedbId: "usedbId", blockRouterChange: "blockRouterChange" }, outputs: { reactomeEvents$: "reactomeEvents$" }, viewQueries: [{ propertyName: "cytoscapeContainer", first: true, predicate: ["cytoscape"], descendants: true }, { propertyName: "compareContainer", first: true, predicate: ["cytoscapeCompare"], descendants: true }, { propertyName: "legendContainer", first: true, predicate: ["legend"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"variables\" [class.dark]=\"dark.isDark\" #container>\n\n    <div id=\"cytoscape\" #cytoscape></div>\n      <div id=\"disease-container\" class=\"drag-container\" #compareContainer [style.display]=\"comparing ? 'flex': 'none'\">\n        <div id=\"handle-limits\" (mouseup)=\"dragEnd()\" (mouseleave)=\"dragEnd()\"\n             (mousemove)=\"dragMove($event, compareContainer, container)\" [class.active]=\"compareDragging\">\n          <span id=\"disease-handle\" class=\"drag-handle\" (mousedown)=\"dragStart()\"></span>\n        </div>\n  \n        <div id=\"cytoscape-compare\" #cytoscapeCompare class=\"drag-content\"></div>\n      </div>\n  \n    <div id=\"legend-boundary\" [ngStyle]=\"{'--legend-width': ratio  * container.clientHeight + 'px'}\">\n      <div cdkDrag cdkDragLockAxis=\"x\" cdkDragBoundary=\"#legend-boundary\" id=\"legend-container\" (cdkDragMoved)=\"updateLegend()\"\n           [style.height]=\"container.clientHeight + 'px'\">\n        <button id=\"legend-handle\" cdkDragHandle>LEGEND</button>\n        <div id=\"legend\" #legend></div>\n      </div>\n    </div>\n  \n  \n    <!-- <form id=\"controls\">\n      <button mat-raised-button  (click)=\"getInteractors(ResourceType.STATIC)\">IntAct</button>\n      <button mat-raised-button (click)=\"getInteractors(ResourceType.DISGENET)\">DisGeNet</button>\n      <button mat-raised-button (click)=\"updateStyle()\">Update Style</button>\n      <button mat-raised-button (click)=\"logProteins()\">Log Proteins</button>\n  \n      <mat-form-field appearance=\"outline\">\n        <mat-label>PSICQUIC</mat-label>\n        <mat-select #psicquicSelect [formControl]=\"selectedPsicquicResource\" [hideSingleSelectionIndicator]=true (selectionChange)=\"onPsicquicResourceChange($event.value)\">\n          <mat-option *ngFor=\"let resource of psicquicResources\" [value]=\"resource.name\" [disabled]=\"!resource.active\" (click)=\"psicquicSelect.open()\">\n            <div class=\"option-content\">\n              <span><i>{{ resource.name }}</i></span>\n              <mat-spinner diameter=\"20\" *ngIf=\"isDataFromPsicquicLoading && selectedPsicquicResource.value === resource.name\"></mat-spinner>\n            </div>\n          </mat-option>\n        </mat-select>\n      </mat-form-field>\n  \n      <button mat-raised-button (click)=\"openCustomInteractorDialog()\">Custom resource</button>\n  \n      <mat-slide-toggle [(ngModel)]=\"dark.isDark\" name=\"dark\">Dark mode</mat-slide-toggle>\n      <span>{{(reactomeEvents$ | async)?.detail?.reactomeId}}</span>\n    </form>\n  \n  \n    <mat-selection-list style=\"width: 260px\" *ngIf=\"resourceTokens?.length != 0\" [multiple]=\"false\">\n      <mat-list-option color=\"primary\" *ngFor=\"let resourceToken of resourceTokens\" [value]=\"resourceToken\"\n                       [selected]=\"isSelected(resourceToken)\" (click)=\"onCustomResourceChange(resourceToken)\">\n        <div class=\"option-content\">\n          <div>{{ resourceToken.token?.summary?.name }}</div>\n          <button mat-icon-button color=\"primary\" (click)=\"deleteResource(resourceToken)\">\n            <mat-icon>delete</mat-icon>\n          </button>\n        </div>\n      </mat-list-option>\n    </mat-selection-list> -->\n  \n  </div>", styles: [".variables{position:absolute;inset:0 0 40px;--compartment-opacity: .08;--structure-opacity: [[130,0], [150,100]];--shadow-luminosity: 40;--on-surface: #001F24;--primary: #006782;--on-primary: #FFFFFF;--on-tertiary: #FFFFFF;--positive: #0C9509;--negative: #BA1A1A;--negative-contrast: #ea7d7d;--select-node: #6EB3E4;--select-edge: #0561A6;--hover-node: #78E076;--hover-edge: #04B601;--interactor-fill: #68297C;--interactor-stroke: #9f5cb5;--flag: #DE75B4;--compartment: #E5834A;--primary-contrast-1: #001F29;--primary-contrast-2: #003545;--primary-contrast-3: #004D62;--primary-contrast-4: #006782;--tertiary-contrast-1: #00315C;--tertiary-contrast-2: #004882;--tertiary-contrast-3: #1660A5;--drug-contrast-1: #3E001D;--drug-contrast-2: #610B33;--drug-contrast-3: #7E2549;--drug-contrast-4: #BB557A}.variables.dark{--compartment-opacity: .08;--shadow-luminosity: 70;--shadow-opacity: [[20, 40], [40, 0]];--on-surface: #97F0FF;--primary: #5CD4FF;--on-primary: #0D1617;--on-tertiary: #0D1317;--positive: #10d70b;--negative: #ea2323;--select-node: #00ffff;--negative-contrast: #8f0000;--select-edge: #1d85cc;--hover-node: #ffff00;--hover-edge: #ffff00;--flag: #DA429E;--compartment: #5e232d;--primary-contrast-1: #5CD4FF;--primary-contrast-2: #20B9E5;--primary-contrast-3: #009DC4;--primary-contrast-4: #0081A2;--tertiary-contrast-1: #a48ee0;--tertiary-contrast-2: #9b73d3;--tertiary-contrast-3: #8c63c5;--drug-contrast-1: #FFB1C8;--drug-contrast-2: #F988AE;--drug-contrast-3: #DA6E94;--drug-contrast-4: #c4527b}#controls{position:absolute;inset:calc(100vh - 40px) 0 0 0}#controls *{background:var(--surface);color:var(--on-surface)}#controls{background:var(--surface)}#cytoscape{position:absolute;inset:0;background:var(--surface)}#legend-boundary{--legend-width: 400px;--border-width: 2px;--handle-width: 20px;position:absolute;pointer-events:none;right:calc(-1 * var(--legend-width) - var(--border-width));height:100%;width:calc(2 * var(--legend-width) + var(--handle-width))}#legend-boundary #legend-container{position:relative;z-index:1;display:flex;align-items:center;width:fit-content;left:calc(var(--legend-width) - var(--border-width));pointer-events:all;height:100%}#legend-boundary #legend-handle{width:var(--handle-width);text-orientation:upright;writing-mode:vertical-lr;border-radius:8.5px 0 0 8.5px;background:color-mix(in srgb,var(--surface) 80%,transparent);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);border-left:var(--border-width) solid var(--primary);border-top:var(--border-width) solid var(--primary);border-bottom:var(--border-width) solid var(--primary);border-right:0;cursor:ew-resize;color:var(--on-surface)}#legend-boundary #legend{width:var(--legend-width);height:100%;background:color-mix(in srgb,var(--surface) 80%,transparent);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}#legend-boundary #legend:before{content:\"\";height:100%;width:2px;background-color:var(--primary);position:absolute;left:-1px;z-index:4}.drag-container{position:absolute;left:10%;width:100%;pointer-events:all;z-index:1;display:flex;align-items:center;height:100%}#handle-limits{--width: 500px;--height: 500px;position:absolute;left:calc(-.5 * var(--width));top:calc(50% - .5 * var(--height));width:var(--width);height:var(--height);z-index:5;pointer-events:none}#handle-limits.active{pointer-events:all;cursor:ew-resize}.drag-handle{--width: 4px;--height: 30px;position:absolute;left:calc(50% - .5 * var(--width) - 4px);top:calc(50% - .5 * var(--height) - 4px);border-radius:var(--height);width:var(--width);height:var(--height);border:4px solid var(--primary);cursor:ew-resize;color:var(--on-surface);pointer-events:all;filter:drop-shadow(-2px 0px 0px var(--primary-container)) drop-shadow(2px 0px 0px var(--error-container));background:var(--surface)}#cytoscape-compare{box-sizing:border-box;position:absolute;height:100%;width:100%;inset:0;background-color:color-mix(in srgb,var(--error) 5%,color-mix(in srgb,var(--surface) 50%,transparent))}#cytoscape-compare:before{content:\"\";height:100%;width:4px;background-color:var(--primary);filter:drop-shadow(-2px 0px 0px var(--primary-container)) drop-shadow(2px 0px 0px var(--error-container));position:absolute;left:-2px;z-index:4}.option-content{width:100%;display:flex;justify-content:space-between;gap:100px;align-items:center}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i5.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: CdkDrag, selector: "[cdkDrag]", inputs: ["cdkDragData", "cdkDragLockAxis", "cdkDragRootElement", "cdkDragBoundary", "cdkDragStartDelay", "cdkDragFreeDragPosition", "cdkDragDisabled", "cdkDragConstrainPosition", "cdkDragPreviewClass", "cdkDragPreviewContainer", "cdkDragScale"], outputs: ["cdkDragStarted", "cdkDragReleased", "cdkDragEnded", "cdkDragEntered", "cdkDragExited", "cdkDragDropped", "cdkDragMoved"], exportAs: ["cdkDrag"] }] }); }
};
DiagramComponent = __decorate([
    UntilDestroy({ checkProperties: true })
], DiagramComponent);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DiagramComponent, decorators: [{
            type: Component,
            args: [{ selector: 'cr-diagram', standalone: true, imports: [
                        CommonModule,
                        CdkDrag
                    ], template: "<div class=\"variables\" [class.dark]=\"dark.isDark\" #container>\n\n    <div id=\"cytoscape\" #cytoscape></div>\n      <div id=\"disease-container\" class=\"drag-container\" #compareContainer [style.display]=\"comparing ? 'flex': 'none'\">\n        <div id=\"handle-limits\" (mouseup)=\"dragEnd()\" (mouseleave)=\"dragEnd()\"\n             (mousemove)=\"dragMove($event, compareContainer, container)\" [class.active]=\"compareDragging\">\n          <span id=\"disease-handle\" class=\"drag-handle\" (mousedown)=\"dragStart()\"></span>\n        </div>\n  \n        <div id=\"cytoscape-compare\" #cytoscapeCompare class=\"drag-content\"></div>\n      </div>\n  \n    <div id=\"legend-boundary\" [ngStyle]=\"{'--legend-width': ratio  * container.clientHeight + 'px'}\">\n      <div cdkDrag cdkDragLockAxis=\"x\" cdkDragBoundary=\"#legend-boundary\" id=\"legend-container\" (cdkDragMoved)=\"updateLegend()\"\n           [style.height]=\"container.clientHeight + 'px'\">\n        <button id=\"legend-handle\" cdkDragHandle>LEGEND</button>\n        <div id=\"legend\" #legend></div>\n      </div>\n    </div>\n  \n  \n    <!-- <form id=\"controls\">\n      <button mat-raised-button  (click)=\"getInteractors(ResourceType.STATIC)\">IntAct</button>\n      <button mat-raised-button (click)=\"getInteractors(ResourceType.DISGENET)\">DisGeNet</button>\n      <button mat-raised-button (click)=\"updateStyle()\">Update Style</button>\n      <button mat-raised-button (click)=\"logProteins()\">Log Proteins</button>\n  \n      <mat-form-field appearance=\"outline\">\n        <mat-label>PSICQUIC</mat-label>\n        <mat-select #psicquicSelect [formControl]=\"selectedPsicquicResource\" [hideSingleSelectionIndicator]=true (selectionChange)=\"onPsicquicResourceChange($event.value)\">\n          <mat-option *ngFor=\"let resource of psicquicResources\" [value]=\"resource.name\" [disabled]=\"!resource.active\" (click)=\"psicquicSelect.open()\">\n            <div class=\"option-content\">\n              <span><i>{{ resource.name }}</i></span>\n              <mat-spinner diameter=\"20\" *ngIf=\"isDataFromPsicquicLoading && selectedPsicquicResource.value === resource.name\"></mat-spinner>\n            </div>\n          </mat-option>\n        </mat-select>\n      </mat-form-field>\n  \n      <button mat-raised-button (click)=\"openCustomInteractorDialog()\">Custom resource</button>\n  \n      <mat-slide-toggle [(ngModel)]=\"dark.isDark\" name=\"dark\">Dark mode</mat-slide-toggle>\n      <span>{{(reactomeEvents$ | async)?.detail?.reactomeId}}</span>\n    </form>\n  \n  \n    <mat-selection-list style=\"width: 260px\" *ngIf=\"resourceTokens?.length != 0\" [multiple]=\"false\">\n      <mat-list-option color=\"primary\" *ngFor=\"let resourceToken of resourceTokens\" [value]=\"resourceToken\"\n                       [selected]=\"isSelected(resourceToken)\" (click)=\"onCustomResourceChange(resourceToken)\">\n        <div class=\"option-content\">\n          <div>{{ resourceToken.token?.summary?.name }}</div>\n          <button mat-icon-button color=\"primary\" (click)=\"deleteResource(resourceToken)\">\n            <mat-icon>delete</mat-icon>\n          </button>\n        </div>\n      </mat-list-option>\n    </mat-selection-list> -->\n  \n  </div>", styles: [".variables{position:absolute;inset:0 0 40px;--compartment-opacity: .08;--structure-opacity: [[130,0], [150,100]];--shadow-luminosity: 40;--on-surface: #001F24;--primary: #006782;--on-primary: #FFFFFF;--on-tertiary: #FFFFFF;--positive: #0C9509;--negative: #BA1A1A;--negative-contrast: #ea7d7d;--select-node: #6EB3E4;--select-edge: #0561A6;--hover-node: #78E076;--hover-edge: #04B601;--interactor-fill: #68297C;--interactor-stroke: #9f5cb5;--flag: #DE75B4;--compartment: #E5834A;--primary-contrast-1: #001F29;--primary-contrast-2: #003545;--primary-contrast-3: #004D62;--primary-contrast-4: #006782;--tertiary-contrast-1: #00315C;--tertiary-contrast-2: #004882;--tertiary-contrast-3: #1660A5;--drug-contrast-1: #3E001D;--drug-contrast-2: #610B33;--drug-contrast-3: #7E2549;--drug-contrast-4: #BB557A}.variables.dark{--compartment-opacity: .08;--shadow-luminosity: 70;--shadow-opacity: [[20, 40], [40, 0]];--on-surface: #97F0FF;--primary: #5CD4FF;--on-primary: #0D1617;--on-tertiary: #0D1317;--positive: #10d70b;--negative: #ea2323;--select-node: #00ffff;--negative-contrast: #8f0000;--select-edge: #1d85cc;--hover-node: #ffff00;--hover-edge: #ffff00;--flag: #DA429E;--compartment: #5e232d;--primary-contrast-1: #5CD4FF;--primary-contrast-2: #20B9E5;--primary-contrast-3: #009DC4;--primary-contrast-4: #0081A2;--tertiary-contrast-1: #a48ee0;--tertiary-contrast-2: #9b73d3;--tertiary-contrast-3: #8c63c5;--drug-contrast-1: #FFB1C8;--drug-contrast-2: #F988AE;--drug-contrast-3: #DA6E94;--drug-contrast-4: #c4527b}#controls{position:absolute;inset:calc(100vh - 40px) 0 0 0}#controls *{background:var(--surface);color:var(--on-surface)}#controls{background:var(--surface)}#cytoscape{position:absolute;inset:0;background:var(--surface)}#legend-boundary{--legend-width: 400px;--border-width: 2px;--handle-width: 20px;position:absolute;pointer-events:none;right:calc(-1 * var(--legend-width) - var(--border-width));height:100%;width:calc(2 * var(--legend-width) + var(--handle-width))}#legend-boundary #legend-container{position:relative;z-index:1;display:flex;align-items:center;width:fit-content;left:calc(var(--legend-width) - var(--border-width));pointer-events:all;height:100%}#legend-boundary #legend-handle{width:var(--handle-width);text-orientation:upright;writing-mode:vertical-lr;border-radius:8.5px 0 0 8.5px;background:color-mix(in srgb,var(--surface) 80%,transparent);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);border-left:var(--border-width) solid var(--primary);border-top:var(--border-width) solid var(--primary);border-bottom:var(--border-width) solid var(--primary);border-right:0;cursor:ew-resize;color:var(--on-surface)}#legend-boundary #legend{width:var(--legend-width);height:100%;background:color-mix(in srgb,var(--surface) 80%,transparent);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}#legend-boundary #legend:before{content:\"\";height:100%;width:2px;background-color:var(--primary);position:absolute;left:-1px;z-index:4}.drag-container{position:absolute;left:10%;width:100%;pointer-events:all;z-index:1;display:flex;align-items:center;height:100%}#handle-limits{--width: 500px;--height: 500px;position:absolute;left:calc(-.5 * var(--width));top:calc(50% - .5 * var(--height));width:var(--width);height:var(--height);z-index:5;pointer-events:none}#handle-limits.active{pointer-events:all;cursor:ew-resize}.drag-handle{--width: 4px;--height: 30px;position:absolute;left:calc(50% - .5 * var(--width) - 4px);top:calc(50% - .5 * var(--height) - 4px);border-radius:var(--height);width:var(--width);height:var(--height);border:4px solid var(--primary);cursor:ew-resize;color:var(--on-surface);pointer-events:all;filter:drop-shadow(-2px 0px 0px var(--primary-container)) drop-shadow(2px 0px 0px var(--error-container));background:var(--surface)}#cytoscape-compare{box-sizing:border-box;position:absolute;height:100%;width:100%;inset:0;background-color:color-mix(in srgb,var(--error) 5%,color-mix(in srgb,var(--surface) 50%,transparent))}#cytoscape-compare:before{content:\"\";height:100%;width:4px;background-color:var(--primary);filter:drop-shadow(-2px 0px 0px var(--primary-container)) drop-shadow(2px 0px 0px var(--error-container));position:absolute;left:-2px;z-index:4}.option-content{width:100%;display:flex;justify-content:space-between;gap:100px;align-items:center}\n"] }]
        }], ctorParameters: () => [{ type: DiagramService }, { type: DarkService }, { type: DiagramStateService }, { type: i4.MatDialog }], propDecorators: { cytoscapeContainer: [{
                type: ViewChild,
                args: ['cytoscape']
            }], compareContainer: [{
                type: ViewChild,
                args: ['cytoscapeCompare']
            }], legendContainer: [{
                type: ViewChild,
                args: ['legend']
            }], reactomeEvents$: [{
                type: Output
            }], diagramId: [{
                type: Input,
                args: ['id']
            }], usedbId: [{
                type: Input
            }], blockRouterChange: [{
                type: Input
            }] } });

/*
 * Public API Surface of ngx-reactome-diagram
 */
// export default {};

/**
 * Generated bundle index. Do not edit.
 */

export { DIAGRAM_CONFIG_TOKEN, DiagramComponent, DiagramService };
//# sourceMappingURL=ngx-reactome-diagram.mjs.map
