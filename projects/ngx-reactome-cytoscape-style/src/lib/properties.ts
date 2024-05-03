import {defaultable, extract, PropertiesType, Property} from "./properties-utils";

export interface Properties extends PropertiesType {
  global: {
    thickness: Property<number>
    surface: Property<string>
    onSurface: Property<string>
    primary: Property<string>
    onPrimary: Property<string>
    positive: Property<string>
    negative: Property<string>
    negativeContrast: Property<string>
    selectNode: Property<string>
    selectEdge: Property<string>
    hoverNode: Property<string>
    hoverEdge: Property<string>
    flag: Property<string>
  },
  compartment: {
    fill: Property<string>
    opacity: Property<number>
  }
  shadow: {
    luminosity: Property<number>
    opacity: Property<[number, number][]>
    labelOpacity: Property<[number, number][]>
  }
  protein: {
    fill: Property<string>
    drug: Property<string>
    radius: Property<number>
  }
  genomeEncodedEntity: {
    fill: Property<string>
    drug: Property<string>
    bottomRadius: Property<number>
    topRadius: Property<number>
  }
  rna: {
    fill: Property<string>
    drug: Property<string>
    radius: Property<number>
  }
  gene: {
    fill: Property<string>
    decorationHeight: Property<number>
    decorationExtraWidth: Property<number>
    arrowHeadSize: Property<number>
    borderRadius: Property<number>
    arrowRadius: Property<number>
  }
  molecule: {
    fill: Property<string>
    stroke: Property<string>
    drug: Property<string>
  }
  entitySet: {
    fill: Property<string>
    stroke: Property<string>
    drug: Property<string>
    radius: Property<number>
  }
  complex: {
    fill: Property<string>
    stroke: Property<string>
    drug: Property<string>
    cut: Property<number>
  }
  cell: {
    thickness: Property<number>
    fill: Property<string>
    stroke: Property<string>
  }
  //interacting pathway and sub pathway
  pathway: {
    fill: Property<string>
    stroke: Property<string>
  }
  modification: {
    fill: Property<string>
  }
  interactor: {
    fill: Property<string>
    stroke: Property<string>
    decorationWidth: Property<number>
  }
  trivial: {
    opacity: Property<[number, number][]>
  }
  structure: {
    opacity: Property<[number, number][]>
  }
  font: {
    size: Property<number>
  }
}

export function setDefaults(properties: UserProperties = {}, css: CSSStyleDeclaration): Properties {
  const global: Properties['global'] = defaultable(properties.global || {})
    .setDefault('thickness', 4)
    .setDefault('surface', () => css.getPropertyValue('--surface') || '#F6FEFF')
    .setDefault('onSurface', () => css.getPropertyValue('--on-surface') || '#001F24')
    .setDefault('primary', () => css.getPropertyValue('--primary') || '#006782')
    .setDefault('onPrimary', () => css.getPropertyValue('--on-primary') || '#FFFFFF')
    .setDefault('positive', () => css.getPropertyValue('--positive') || '#0C9509')
    .setDefault('negative', () => css.getPropertyValue('--negative') || '#BA1A1A')
    .setDefault('negativeContrast', () => css.getPropertyValue('--negative-contrast') || '#ea7d7d')
    .setDefault('selectNode', () => css.getPropertyValue('--select-node') || '#6EB3E4')
    .setDefault('selectEdge', () => css.getPropertyValue('--select-edge') || '#0561A6')
    .setDefault('hoverNode', () => css.getPropertyValue('--hover-node') || '#78E076')
    .setDefault('hoverEdge', () => css.getPropertyValue('--hover-edge') || '#04B601')
    .setDefault('flag', () => css.getPropertyValue('--flag') || '#DE75B4')

  const compartment: Properties['compartment'] = defaultable(properties.compartment || {})
    .setDefault('opacity', () => Number.parseFloat(css.getPropertyValue('--opacity')) || 0.06)
    .setDefault('fill', () => css.getPropertyValue('--compartment') || '#E5834A')

  const shadow: Properties['shadow'] = defaultable(properties.shadow || {})
    .setDefault('luminosity', () => Number.parseFloat(css.getPropertyValue('--shadow-luminosity')) || 40)
    .setDefault('opacity', () => {
      const p = css.getPropertyValue('--shadow-opacity');
      return p ? JSON.parse(p) : [[20, 20], [40, 0]];
    })
    .setDefault('labelOpacity', () => {
      const p = css.getPropertyValue('--shadow-label-opacity');
      return p ? JSON.parse(p) : [[20, 100], [40, 0]];
    })

  const protein: Properties['protein'] = defaultable(properties.protein || {})
    .setDefault('fill', () => css.getPropertyValue('--primary-contrast-1') || '#001F29')
    .setDefault('drug', () => css.getPropertyValue('--drug-contrast-1') || '#3E001D')
    .setDefault('radius', 8)


  const genomeEncodedEntity: Properties['genomeEncodedEntity'] = defaultable(properties.genomeEncodedEntity || {})
    .setDefault('fill', () => css.getPropertyValue('--primary-contrast-4') || '#006782')
    .setDefault('drug', () => css.getPropertyValue('--drug-contrast-4') || '#BB557A')
    .setDefault('bottomRadius', 6)
    .setDefault('topRadius', 40)

  const rna: Properties['rna'] = defaultable(properties.rna || {})
    .setDefault('fill', () => css.getPropertyValue('--primary-contrast-2') || '#003545')
    .setDefault('drug', () => css.getPropertyValue('--drug-contrast-2') || '#610B33')
    .setDefault('radius', 8)

  const gene: Properties['gene'] = defaultable(properties.gene || {})
    .setDefault('decorationHeight', 20)
    .setDefault('decorationExtraWidth', 17)
    .setDefault("arrowHeadSize", 10)
    .setDefault("borderRadius", 8)
    .setDefault("arrowRadius", 8)
    .setDefault("fill", () => css.getPropertyValue('--primary-contrast-3') || '#004D62')

  const molecule: Properties['molecule'] = defaultable(properties.molecule || {})
    .setDefault("fill", () => extract(global.surface))
    .setDefault("stroke", () => extract(global.onSurface))
    .setDefault('drug', () => css.getPropertyValue('--drug-contrast-3') || '#9C3D61')

  const complex: Properties['complex'] = defaultable(properties.complex || {})
    .setDefault("cut", 8)
    .setDefault("fill", () => css.getPropertyValue('--tertiary-contrast-1') || '#00315C')
    .setDefault("stroke", () => css.getPropertyValue('--on-tertiary') || '#FFFFFF')
    .setDefault('drug', () => css.getPropertyValue('--drug-contrast-3') || '#7E2549')

  const entitySet: Properties['entitySet'] = defaultable(properties.entitySet || {})
    .setDefault("radius", 8)
    .setDefault("fill", () => css.getPropertyValue('--tertiary-contrast-3') || '#1660A5')
    .setDefault("stroke", () => css.getPropertyValue('--on-tertiary') || '#FFFFFF')
    .setDefault('drug', () => css.getPropertyValue('--drug-contrast-4') || '#BB557A')

  const cell: Properties['cell'] = defaultable(properties.cell || {})
    .setDefault('thickness', () => Number.parseFloat(css.getPropertyValue('--cell-thickness')) || 16)
    .setDefault("fill", () => css.getPropertyValue('--tertiary-contrast-2') || '#004882')
    .setDefault("stroke", () => css.getPropertyValue('--on-tertiary') || '#FFFFFF')

  const pathway: Properties['pathway'] = defaultable(properties.pathway || {})
    .setDefault("fill", () => css.getPropertyValue('--primary-contrast-4') || '#006782')
    .setDefault("stroke", () => extract(global.onPrimary))

  const modification: Properties['modification'] = defaultable(properties.modification || {})
    .setDefault("fill", () => css.getPropertyValue('--primary-contrast-2') || '#003545')

  const interactor: Properties['interactor'] = defaultable(properties.interactor || {})
    .setDefault("fill", () => css.getPropertyValue('--interactor-fill') || '#68297C')
    .setDefault("stroke", () => css.getPropertyValue('--interactor-stroke') || '#9f5cb5')
    .setDefault('decorationWidth', () => Number.parseFloat(css.getPropertyValue('--decorationWidth')) || 20)

  const trivial: Properties['trivial'] = defaultable(properties.trivial || {})
    .setDefault('opacity', () => {
      const p = css.getPropertyValue('--trivial-opacity');
      return p ? JSON.parse(p) : [[40, 0], [60, 100]];
    })

  const structure: Properties['structure'] = defaultable(properties.structure || {})
    .setDefault('opacity', () => {
      const p = css.getPropertyValue('--structure-opacity');
      return p ? JSON.parse(p) : [[130, 0], [150, 100]];
    })

  const font: Properties['font'] = defaultable(properties.font || {})
    .setDefault('size', 12)


  return {
    global,
    compartment,
    shadow,
    protein,
    genomeEncodedEntity,
    rna,
    gene,
    molecule,
    complex,
    entitySet,
    cell,
    pathway,
    modification,
    interactor,
    trivial,
    structure,
    font
  }
}

export type UserProperties = Partial<{
  [k in keyof Properties]: Partial<Properties[k]>
}>

