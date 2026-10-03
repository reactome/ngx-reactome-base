import * as _ from 'lodash';
import { memoize, isNumber, isArray } from 'lodash';
import cytoscape from 'cytoscape';
import Layers, { layers } from 'cytoscape-layers';
import chroma from 'chroma-js';

/**
 * This is a guard function to check if a property is a Provider function, or a direct value
 *
 * @param property The value to check
 * @return true if is a Provider function
 */
function isProvider(property) {
    return property.apply !== undefined;
}
/**
 * This function extracts the value from a property, and if the property is a Provider<T>, it calls the property function to get the actual value.
 *
 * @param property A value of type Property<T>.
 */
function extract(property) {
    return isProvider(property) ? property() : property;
}
function defaultable(object) {
    const defaultable = object;
    defaultable.setDefault = function (key, defaultValue) {
        if (object[key] === undefined || object[key] === null)
            object[key] = defaultValue;
        return defaultable;
    };
    return defaultable;
}
const propertyExtractor = (properties) => (group, key) => properties[group][key];
const propertyMapper = (properties) => (group, key, mapper) => mapper(extract(properties[group][key]));

const gene = (properties, { width, height, interactor, disease, lossOfFunction }) => {
    const t = extract(properties.global.thickness);
    const dHeight = extract(properties.gene.decorationHeight);
    const dWidth = extract(properties.gene.decorationExtraWidth);
    const headSize = extract(properties.gene.arrowHeadSize);
    const radius = extract(properties.gene.arrowRadius);
    const fill = extract(properties.gene.fill);
    const stroke = interactor
        ? extract(properties.interactor.fill)
        : disease
            ? extract(properties.global.negativeContrast)
            : null;
    const select = extract(properties.global.selectNode);
    const hover = extract(properties.global.hoverNode);
    const flag = extract(properties.global.flag);
    const hh = Math.sqrt((Math.pow(headSize, 2) * 3) / 4);
    const halfWidth = width / 2;
    const r = extract(properties.gene.borderRadius);
    const oR = r + t;
    const iR = r - t;
    const t_2 = t / 2;
    const t2 = t * 2;
    return {
        background: {
            'background-image': `
          <path fill="${fill}" class="gradient" stroke-linecap="round" transform="translate(${t_2} ${t_2})"
      ${stroke ? `stroke="${stroke}" stroke-width="${t}"` : ''}
      ${lossOfFunction ? `stroke-dasharray="${t} ${t2}"` : ''}  d="
            M ${0} ${dHeight}
            H ${width}
            v ${height - dHeight - radius}
            a ${radius} ${radius} 0 0 1 -${radius} ${radius}
            H ${radius}
            a ${radius} ${radius} 0 0 1 -${radius} -${radius}
            Z
          "/>`,
            'bounds-expansion': t_2,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-position-x': -t / 2,
            'background-position-y': -t / 2,
            'background-width': width + t,
            'background-height': height + t,
            requireGradient: true,
        },
        decorators: [
            {
                'background-image': `
          <path fill="none" stroke="${fill}" stroke-width="${t}"  d="
            M ${halfWidth} ${dHeight + 2 * t}
            v -${dHeight - radius - (headSize + t) / 2 + 2 * t}
            a ${radius} ${radius} 0 0 1 ${radius} -${radius}
            h ${halfWidth - t - radius + dWidth}
          "/>
            <path fill="${fill}" stroke="${fill}" stroke-width="${t}" stroke-linejoin="round"  d="
            M ${width - hh - t_2 + dWidth} ${headSize / 2 + t_2}
            v -${headSize / 2}
            l ${hh} ${headSize / 2}
            l -${hh} ${headSize / 2}
            v -${headSize / 2}
            z
          "/>`,
                'background-position-y': -t / 2,
                'bounds-expansion': dHeight,
                'background-height': dHeight + 1.5 * t,
                'background-width': width + dWidth,
                'background-clip': 'none',
                'background-image-containment': 'over',
            },
        ],
        hover: {
            'background-image': `<rect x="0" y="0" width="${width}" height="${2 * t}" fill="${hover}"/>`,
            'background-position-y': dHeight - t,
            'bounds-expansion': t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': 2 * t,
        },
        select: {
            'background-image': `
          <path fill="${select}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 0
            a ${oR} ${oR} 0 0 0 ${oR} ${oR}
            h ${width - 2 * oR}
            a ${oR} ${oR} 0 0 0 ${oR} -${oR}
            a ${oR} ${iR} 0 0 1 -${oR} ${iR}
            h -${width - 2 * oR}
            a ${oR} ${iR} 0 0 1 -${oR} -${iR}
            Z"/>
`,
            'background-position-y': height - r,
            'bounds-expansion': t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': oR,
        },
        flag: {
            'background-image': `
       <path fill="${flag}" d="
       M 0 0
       H ${width + 4 * t}
       V ${height - dHeight - r + t}
       a ${oR + t} ${oR} 0 0 1 -${oR + t} ${oR}
       H ${oR + t}
       a ${oR + t} ${oR} 0 0 1 -${oR + t} -${oR}
       Z
       "/>
`,
            'background-position-x': -2 * t,
            'background-position-y': dHeight - t,
            'bounds-expansion': 2 * t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-width': width + 4 * t,
            'background-height': height + 2 * t - dHeight,
        },
        // analysis: {
        //   "background-image": `${gradient}
        //       <path fill="url(#gradient)" transform="translate(${t_2} ${t_2})"
        //       d="
        //         M ${0} ${dHeight}
        //         H ${width}
        //         v ${height - dHeight - radius}
        //         a ${radius} ${radius} 0 0 1 -${radius} ${radius}
        //         H ${radius}
        //         a ${radius} ${radius} 0 0 1 -${radius} -${radius}
        //         Z
        //       "/>`,
        //   "bounds-expansion": t_2,
        //   "background-clip": "none",
        //   "background-image-containment": "over",
        //   "background-position-x": -t / 2,
        //   "background-position-y": -t / 2,
        //   "background-width": width + t,
        //   "background-height": height + t,
        // }
    };
};

const molecule = (properties, { width, height, drug, interactor }) => {
    const select = extract(properties.global.selectNode);
    const hover = extract(properties.global.hoverNode);
    const flag = extract(properties.global.flag);
    const t = extract(properties.global.thickness);
    const stroke = !interactor
        ? !drug
            ? extract(properties.molecule.stroke)
            : extract(properties.molecule.drug)
        : extract(properties.interactor.fill);
    const fill = extract(properties.molecule.fill);
    const halfHeight = height / 2;
    const oR = halfHeight + t;
    const iR = halfHeight - t;
    const oRx = Math.min(oR, width / 2);
    return {
        background: {
            'background-image': `<rect fill="${fill}" width="${width}" height="${height}" rx="${halfHeight}" stroke-width="${t}" stroke="${stroke}"/>`,
            'background-width': width + t,
            'background-height': height + t,
            optional: true,
        },
        hover: {
            'background-image': `
          <path fill="${hover}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 ${oR}
            a ${oRx} ${oR} 0 0 1 ${oRx} -${oR}
            h ${width - 2 * oRx + t}
            a ${oRx} ${oR} 0 0 1 ${oRx} ${oR}
            a ${oRx} ${iR} 0 0 0 -${oRx} -${iR}
            h -${width - 2 * oRx + t}
            a ${oRx} ${iR} 0 0 0 -${oRx} ${iR}
            Z"/>
`,
            'background-position-y': -t,
            'background-position-x': -t / 2,
            'bounds-expansion': t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': oR,
            'background-width': width + t,
        },
        select: {
            'background-image': `
          <path fill="${select}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 0
            a ${oRx} ${oR} 0 0 0 ${oRx} ${oR}
            h ${width - 2 * oRx + t}
            a ${oRx} ${oR} 0 0 0 ${oRx} -${oR}
            a ${oRx} ${iR} 0 0 1 -${oRx} ${iR}
            h -${width - 2 * oRx + t}
            a ${oRx} ${iR} 0 0 1 -${oRx} -${iR}
            Z"/>
`,
            'background-position-y': halfHeight,
            'background-position-x': -t / 2,
            'bounds-expansion': t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': oR,
            'background-width': width + t,
        },
        flag: {
            'background-image': `
<rect width="${width + 4 * t}" height="${height + 2 * t}" rx="${oR + 2 * t}" ry="${oR}" fill="${flag}"/>
<rect x="${2 * t}" y="${t}" width="${width}" height="${height}" rx="${oR}" fill="${fill}" stroke="${stroke}" stroke-width="${t}"/>
`,
            'background-position-x': -2 * t,
            'background-position-y': -t,
            'bounds-expansion': 2 * t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-width': width + 4 * t,
            'background-height': height + 2 * t,
        },
        analysis: {
            'background-image': `<rect fill="url(#gradient)" width="${width}" height="${height}" rx="${halfHeight}" stroke-width="${t}" stroke="${stroke}"/>`,
            requireGradient: true,
        },
    };
};

const protein = (properties, { width, height }) => {
    const fill = extract(properties.protein.fill);
    const select = extract(properties.global.selectNode);
    const hover = extract(properties.global.hoverNode);
    const flag = extract(properties.global.flag);
    const thick = extract(properties.global.thickness);
    const radius = extract(properties.protein.radius);
    const oR = radius + thick;
    const iR = radius - thick;
    return {
        background: {
            optional: true,
            'background-image': `<rect width="${width}" height="${height}" fill="${fill}" rx="${radius}"/>`,
        },
        hover: {
            'background-image': `
          <path fill="${hover}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 ${oR}
            a ${oR} ${oR} 0 0 1 ${oR} -${oR}
            h ${width - 2 * oR}
            a ${oR} ${oR} 0 0 1 ${oR} ${oR}
            a ${oR} ${iR} 0 0 0 -${oR} -${iR}
            h -${width - 2 * oR}
            a ${oR} ${iR} 0 0 0 -${oR} ${iR}
            Z"/>
`,
            'background-position-y': -thick,
            'bounds-expansion': thick,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': oR,
        },
        select: {
            'background-image': `
          <path fill="${select}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 0
            a ${oR} ${oR} 0 0 0 ${oR} ${oR}
            h ${width - 2 * oR}
            a ${oR} ${oR} 0 0 0 ${oR} -${oR}
            a ${oR} ${iR} 0 0 1 -${oR} ${iR}
            h -${width - 2 * oR}
            a ${oR} ${iR} 0 0 1 -${oR} -${iR}
            Z"/>
`,
            'background-position-y': height - radius,
            'bounds-expansion': thick,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': oR,
        },
        flag: {
            'background-image': `
<rect width="${width + 4 * thick}" height="${height + 2 * thick}" rx="${oR}"  fill="${flag}"/>
<rect x="${2 * thick}" y="${thick}" width="${width}" height="${height}" rx="${radius}" fill="${fill}"/>
`,
            'background-position-x': -2 * thick,
            'background-position-y': -thick,
            'bounds-expansion': 2 * thick,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-width': width + 4 * thick,
            'background-height': height + 2 * thick,
        },
        analysis: {
            'background-image': `<rect width="${width}" height="${height}" class="gradient" rx="${radius}"/>`,
            requireGradient: true,
        },
    };
};

const rna = (properties, { width, height }) => {
    const thick = extract(properties.global.thickness);
    const select = extract(properties.global.selectNode);
    const hover = extract(properties.global.hoverNode);
    const flag = extract(properties.global.flag);
    const fill = extract(properties.rna.fill);
    const r = extract(properties.rna.radius);
    const oR = r + thick;
    const iR = r - thick;
    return {
        background: {
            'background-image': `
       <path fill="${fill}" d="
       M 0 0
       H ${width}
       V ${height - r}
       a ${r} ${r} 0 0 1 -${r} ${r}
       H ${r}
       a ${r} ${r} 0 0 1 -${r} -${r}
       Z"/>`,
            optional: true,
        },
        hover: {
            'background-image': `<rect x="0" y="0" width="${width}" height="${2 * thick}" fill="${hover}"/>`,
            'background-position-y': -thick,
            'bounds-expansion': thick,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': 2 * thick,
        },
        select: {
            'background-image': `
          <path fill="${select}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 0
            a ${oR} ${oR} 0 0 0 ${oR} ${oR}
            h ${width - 2 * oR}
            a ${oR} ${oR} 0 0 0 ${oR} -${oR}
            a ${oR} ${iR} 0 0 1 -${oR} ${iR}
            h -${width - 2 * oR}
            a ${oR} ${iR} 0 0 1 -${oR} -${iR}
            Z"/>
`,
            'background-position-y': height - r,
            'bounds-expansion': thick,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': oR,
        },
        flag: {
            'background-image': `
       <path fill="${flag}" d="
       M 0 0
       H ${width + 4 * thick}
       V ${height - r + thick}
       a ${oR + thick} ${oR} 0 0 1 -${oR + thick} ${oR}
       H ${oR + thick}
       a ${oR + thick} ${oR} 0 0 1 -${oR + thick} -${oR}
       Z
       "/>
       <path fill="${fill}" d="
       M ${2 * thick} ${thick}
       H ${width + 2 * thick}
       V ${height - r + thick}
       a ${r} ${r} 0 0 1 -${r} ${r}
       H ${r + 2 * thick}
       a ${r} ${r} 0 0 1 -${r} -${r}
       Z"/>
`,
            'background-position-x': -2 * thick,
            'background-position-y': -thick,
            'bounds-expansion': 2 * thick,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-width': width + 4 * thick,
            'background-height': height + 2 * thick,
        },
        analysis: {
            'background-image': `
       <path class="gradient" d="
       M 0 0
       H ${width}
       V ${height - r}
       a ${r} ${r} 0 0 1 -${r} ${r}
       H ${r}
       a ${r} ${r} 0 0 1 -${r} -${r}
       Z"/>`,
            requireGradient: true,
        },
    };
};

const genomeEncodedEntity = (properties, { width, height, drug, disease, interactor, lossOfFunction }) => {
    const fill = !drug
        ? extract(properties.complex.fill)
        : extract(properties.genomeEncodedEntity.drug);
    const select = extract(properties.global.selectNode);
    const hover = extract(properties.global.hoverNode);
    const flag = extract(properties.global.flag);
    const t = extract(properties.global.thickness);
    const t_2 = t / 2;
    const bottomR = extract(properties.genomeEncodedEntity.bottomRadius);
    const stroke = !interactor
        ? !disease
            ? null
            : extract(properties.global.negativeContrast)
        : extract(properties.interactor.fill);
    const topR = Math.min(extract(properties.genomeEncodedEntity.topRadius), height - bottomR, width / 2 - t);
    const v = height - bottomR - topR;
    const topOR = topR + t;
    const topIR = topR - t;
    const bottomOR = bottomR + t;
    const bottomIR = bottomR - t;
    return {
        background: {
            'background-image': `
      <path fill="${fill}" class="gradient" stroke-linecap="round" transform="translate(${t_2} ${t_2})"
      ${stroke ? `stroke="${stroke}" stroke-width="${t}"` : ''}
      ${lossOfFunction ? `stroke-dasharray="${t} ${t * 2}"` : ''}
      d="
      M ${topR} 0
      H ${width - topR}
      a ${topR} ${topR} 0 0 1 ${topR} ${topR}
      v ${v}
      a ${bottomR} ${bottomR} 0 0 1 -${bottomR} ${bottomR}
      H ${bottomR}
      a ${bottomR} ${bottomR} 0 0 1 -${bottomR} -${bottomR}
      v -${v}
      a ${topR} ${topR} 0 0 1 ${topR} -${topR}
      Z
      "/>
      `,
            'bounds-expansion': t / 2,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-position-x': -t_2,
            'background-position-y': -t_2,
            'background-width': width + t,
            'background-height': height + t,
            requireGradient: true,
        },
        hover: {
            'background-image': `
          <path fill="${hover}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 ${topOR}
            a ${topOR} ${topOR} 0 0 1 ${topOR} -${topOR}
            h ${width - 2 * topOR}
            a ${topOR} ${topOR} 0 0 1 ${topOR} ${topOR}
            a ${topOR} ${topIR} 0 0 0 -${topOR} -${topIR}
            h -${width - 2 * topOR}
            a ${topOR} ${topIR} 0 0 0 -${topOR} ${topIR}
            Z"/>
`,
            'background-position-y': -t,
            'bounds-expansion': t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': topOR,
        },
        select: {
            'background-image': `
          <path fill="${select}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 0
            a ${bottomOR} ${bottomOR} 0 0 0 ${bottomOR} ${bottomOR}
            h ${width - 2 * bottomOR}
            a ${bottomOR} ${bottomOR} 0 0 0 ${bottomOR} -${bottomOR}
            a ${bottomOR} ${bottomIR} 0 0 1 -${bottomOR} ${bottomIR}
            h -${width - 2 * bottomOR}
            a ${bottomOR} ${bottomIR} 0 0 1 -${bottomOR} -${bottomIR}
            Z"/>
`,
            'background-position-y': height - bottomR,
            'bounds-expansion': t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': bottomOR,
        },
        flag: {
            'background-image': `
      <path fill="${flag}" d="
      M ${topOR} 0
      H ${width + 3 * t - topOR}
      a ${topOR + t} ${topOR} 0 0 1 ${topOR + t} ${topOR}
      v ${v}
      a ${bottomOR + t} ${bottomOR} 0 0 1 -${bottomOR + t} ${bottomOR}
      H ${bottomOR + t}
      a ${bottomOR + t} ${bottomOR} 0 0 1 -${bottomOR + t} -${bottomOR}
      v -${v}
      a ${topOR + t} ${topOR} 0 0 1 ${topOR + t} -${topOR}
      Z
      "/>
`,
            'background-position-x': -2 * t,
            'background-position-y': -t,
            'bounds-expansion': 2 * t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-width': width + 4 * t,
            'background-height': height + 2 * t,
        },
    };
};

const complex = (properties, { width, height, drug, disease, interactor, lossOfFunction }) => {
    const select = extract(properties.global.selectNode);
    const hover = extract(properties.global.hoverNode);
    const flag = extract(properties.global.flag);
    const t = extract(properties.global.thickness);
    const cut = extract(properties.complex.cut);
    const fill = !drug
        ? interactor
            ? extract(properties.interactor.fill)
            : extract(properties.complex.fill)
        : extract(properties.complex.drug);
    const stroke = !disease
        ? extract(properties.complex.stroke)
        : extract(properties.global.negativeContrast);
    const cut2 = cut * 2;
    const t2 = t * 2;
    const v = height - cut2 - 2 * t2; // Vertical
    const delta = 0;
    const stateHeight = height / 2 + t;
    const defs = `<defs>
  <path id="octogon" d="
      M ${cut + t2 + delta} ${t2}
      H ${width - cut - t2 - delta}
      l ${cut} ${cut}
      v ${v}
      l -${cut} ${cut}
      H ${cut + t2 + delta}
      l -${cut} -${cut}
      v -${v}
      l  ${cut} -${cut}
      Z
      "/>
  </defs>`;
    return {
        background: {
            'background-image': `
      ${defs}
      <use href="#octogon" fill="${fill}" stroke="${fill}" stroke-width="${2 * t2}" stroke-linejoin="round"/>
`,
        },
        hover: {
            'background-image': `
      <path stroke="${hover}" fill="none" stroke-width="${2 * t2}" stroke-linejoin="round" d="
      M ${t2} ${stateHeight}
      v -${v / 2}
      l ${cut} -${cut + t}
      H ${width - cut - t2}
      l ${cut} ${cut + t}
      v ${v / 2}
      " />
      `,
            'background-position-y': -t,
            'background-height': stateHeight,
            'background-clip': 'none',
            'bounds-expansion': t,
        },
        select: {
            'background-image': `
      <path stroke="${select}" fill="none" stroke-width="${2 * t2}" stroke-linejoin="round" d="
      M ${t2} ${0}
      v ${v / 2}
      l ${cut} ${cut + t}
      H ${width - cut - t2}
      l ${cut} -${cut + t}
      v -${v / 2}
      " />
      `,
            'background-position-y': height / 2,
            'background-height': stateHeight,
            'background-clip': 'none',
            'bounds-expansion': t,
        },
        flag: {
            'background-image': `
<path id="octogon" d="
      M ${width / 2} ${3 * t}
      H ${width - cut - delta}
      l ${cut + t} ${cut}
      v ${v}
      l -${cut + t} ${cut}
      H ${cut + delta + 2 * t2}
      l -${cut + t} -${cut}
      v -${v}
      l  ${cut + t} -${cut}
      Z
      " stroke="${flag}" stroke-width="${3 * t2}" stroke-linejoin="round"/>
`,
            'background-position-x': -2 * t,
            'background-position-y': -t,
            'bounds-expansion': 2 * t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-width': width + 4 * t,
            'background-height': height + 2 * t,
        },
        decorators: [
            {
                'background-image': `
         ${defs}
         <use href="#octogon" fill="none" stroke="${stroke}" stroke-width="${t2}" stroke-linejoin="round" ${lossOfFunction ? `stroke-dasharray="${t2}"` : ''} />
         <use href="#octogon" fill="${fill}" class="gradient"/>
         `,
                requireGradient: true,
            },
        ],
    };
};

const entitySet = (properties, { width, height, drug, disease, interactor, lossOfFunction }) => {
    const select = extract(properties.global.selectNode);
    const hover = extract(properties.global.hoverNode);
    const flag = extract(properties.global.flag);
    const t = extract(properties.global.thickness);
    let r = extract(properties.entitySet.radius);
    if (2 * r > height / 2 - t) {
        r = height / 4 - t / 2;
    }
    width += 2 * r;
    const fill = !interactor
        ? !drug
            ? extract(properties.entitySet.fill)
            : extract(properties.entitySet.drug)
        : extract(properties.interactor.fill);
    const stroke = !disease
        ? extract(properties.entitySet.stroke)
        : extract(properties.global.negativeContrast);
    const r2 = r * 2;
    const t2 = t * 2;
    const v = height / 2 - r2 - t; // Vertical
    const stateHeight = height / 2 + t;
    const bracesOffset = r2 + t2;
    // A set is drawn as its braces: the stretch of outline between them is
    // masked out. A loss-of-function set dashes that stretch, top and bottom,
    // as complexes, genes and proteins dash their outlines. The dashes are
    // fitted to it -- a whole number of them, as long as the gaps, starting
    // and ending on a dash -- so neither end stops on a stub.
    const hidingLength = width - 2 * bracesOffset;
    // At least two, so a narrow set still reads as dashed rather than closed.
    const dashNumber = Math.max(2, Math.round((hidingLength / t2 + 1) / 2));
    const dashLength = hidingLength / (2 * dashNumber - 1);
    const lossOfFunctionDashes = lossOfFunction && hidingLength > 0
        ? `<path d="M ${bracesOffset} ${t} H ${width - bracesOffset} M ${bracesOffset} ${height - t} H ${width - bracesOffset}" fill="none" stroke="${stroke}" stroke-width="${t2}" stroke-dasharray="${dashLength}" clip-path="url(#inside)"/>`
        : '';
    const defs = `<defs>
   <path id="curly" d="
       M ${r2 + t} ${t}
       H ${width - r2 - t}
       a ${r} ${r} 0 0 1 ${r} ${r}

       v ${v}
       a ${r} ${r} 0 0 0 ${r} ${r}
       a ${r} ${r} 0 0 0 -${r} ${r}
       v ${v}

       a ${r} ${r} 0 0 1 -${r} ${r}
       H ${r2 + t}
       a ${r} ${r} 0 0 1 -${r} -${r}

       v -${v}
       a ${r} ${r} 0 0 0 -${r} -${r}
       a ${r} ${r} 0 0 0 ${r} -${r}
       v -${v}

       a ${r} ${r} 0 0 1 ${r} -${r}
       Z
       "/>
   <clipPath id="inside">
     <use href="#curly"/>
   </clipPath>
 </defs>`;
    return {
        background: {
            'background-image': `
       ${defs}
       <use href="#curly" fill="${fill}" stroke="${fill}" stroke-width="${t2}" stroke-linejoin="round"/>
       `,
            'background-position-x': -r,
            'background-width': width + 2 * r,
            'background-clip': 'none',
            'bounds-expansion': 2 * t,
        },
        hover: {
            'background-image': `
       <path stroke="${hover}" stroke-width="${t2}" fill="none" stroke-linejoin="round" d="
         M ${r + t} ${stateHeight + r}
         a ${r} ${r} 0 0 0 -${r} -${r}
         a ${r} ${r} 0 0 0 ${r} -${r}
         v -${v}
         a ${r} ${r + t} 0 0 1 ${r} -${r + t}
         H ${width - r2 - t}
         a ${r} ${r + t} 0 0 1 ${r} ${r + t}
         v ${v}
         a ${r} ${r} 0 0 0 ${r} ${r}
         a ${r} ${r} 0 0 0 -${r} ${r}
       "/>`,
            'background-position-x': -r,
            'background-width': width + 2 * r,
            'background-clip': 'none',
            'bounds-expansion': 2 * t,
            'background-position-y': -t,
            'background-height': stateHeight,
        },
        select: {
            'background-image': `
       <path stroke="${select}" stroke-width="${t2}" fill="none" stroke-linejoin="round" d="
         M ${r + t} ${-r}
         a ${r} ${r} 0 0 1 -${r} ${r}
         a ${r} ${r} 0 0 1 ${r} ${r}
         v ${v}
         a ${r} ${r + t} 0 0 0 ${r} ${r + t}
         H ${width - r2 - t}
         a ${r} ${r + t} 0 0 0 ${r} -${r + t}
         v -${v}
         a ${r} ${r} 0 0 1 ${r} -${r}
         a ${r} ${r} 0 0 1 -${r} -${r}
       "/>`,
            'background-position-x': -r,
            'background-width': width + 2 * r,
            'background-clip': 'none',
            'bounds-expansion': 2 * t,
            'background-position-y': height / 2,
            'background-height': stateHeight,
        },
        flag: {
            'background-image': `
<rect width="${width}" height="${height + 2 * t}" rx="${r + 3 * t}" ry="${r + t2}" fill="${flag}"/>
`,
            'background-position-x': -2 * t,
            'background-position-y': -t,
            'bounds-expansion': 2 * t,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-width': width,
            'background-height': height + 2 * t,
        },
        decorators: [
            {
                'background-image': `
       ${defs}
       <mask id="myMask">
         <rect fill="white" x="0" y="0" width="${width}" height="${height}"/>
         <rect fill="black" x="${bracesOffset}" y="${0}" width="${width - 2 * bracesOffset}" height="${height}"/>
       </mask>
       <use href="#curly" fill="none" stroke="${stroke}" stroke-width="${t2}" clip-path="url(#inside)" mask="url(#myMask)"/>
       ${lossOfFunctionDashes}
`,
                'background-position-x': -r,
                'bounds-expansion': r,
                'background-clip': 'none',
                'background-width': width + 2 * r,
            },
        ],
        analysis: {
            'background-image': `<rect x="${r * 1.5}" y="${t}" width="${width - 2 * r * 1.5}" rx="${r}" height="${height - t2}" class="gradient"/>`,
            'background-position-x': -r,
            'background-width': width + 2 * r,
            'background-clip': 'none',
            'bounds-expansion': 2 * t,
            requireGradient: true,
        },
        // analysis: {
        //   'background-image': `${defs}${gradient}
        //   <use href="#curly" fill="url(#gradient)" clip-path="url(#inside)"/>
        //   <mask id="myMask">
        //      <rect fill="white" x="0" y="0" width="${width}" height="${height}"/>
        //      <rect fill="black" x="${bracesOffset}" y="${0}" width="${width - 2 * bracesOffset}" height="${height}"/>
        //    </mask>
        //    <use href="#curly" fill="none" stroke="${stroke}" stroke-width="${t2}" clip-path="url(#inside)" mask="url(#myMask)"/>`,
        //   "background-position-x": -r,
        //   "bounds-expansion": r,
        //   "background-clip": "none",
        //   "background-width": width + 2 * r,
        // }
    };
};

const cell = (properties, { width, height }) => {
    const select = extract(properties.global.selectNode);
    const hover = extract(properties.global.hoverNode);
    const flag = extract(properties.global.flag);
    const thick = extract(properties.global.thickness);
    const cellThick = extract(properties.cell.thickness);
    const stroke = extract(properties.cell.stroke);
    const fill = extract(properties.cell.fill);
    const ht = thick / 2;
    const halfHeight = height / 2;
    const oR = halfHeight + thick;
    const iR = halfHeight - thick;
    const oRx = Math.min(oR, width / 2);
    return {
        background: {
            'background-image': `
      <rect x="${ht}" y="${ht}" width="${width - thick}" height="${height - thick}" rx="${halfHeight}" stroke="${fill}" fill="${stroke}" stroke-width="${thick}"/>
      <rect x="${ht + cellThick}" y="${2 * thick}" width="${width - 2 * cellThick - thick}" height="${height - 4 * thick}" ry="${halfHeight}" rx="${halfHeight - cellThick}" fill="${fill}" class="gradient" stroke-width="0"/>
      `,
            requireGradient: true,
        },
        hover: {
            'background-image': `
          <path fill="${hover}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 ${oR}
            a ${oRx} ${oR} 0 0 1 ${oRx} -${oR}
            h ${width - 2 * oRx}
            a ${oRx} ${oR} 0 0 1 ${oRx} ${oR}
            a ${oRx} ${iR} 0 0 0 -${oRx} -${iR}
            h -${width - 2 * oRx}
            a ${oRx} ${iR} 0 0 0 -${oRx} ${iR}
            Z"/>
`,
            'background-position-y': -thick,
            'bounds-expansion': thick,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': oR,
        },
        select: {
            'background-image': `
          <path fill="${select}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 0
            a ${oRx} ${oR} 0 0 0 ${oRx} ${oR}
            h ${width - 2 * oRx}
            a ${oRx} ${oR} 0 0 0 ${oRx} -${oR}
            a ${oRx} ${iR} 0 0 1 -${oRx} ${iR}
            h -${width - 2 * oRx}
            a ${oRx} ${iR} 0 0 1 -${oRx} -${iR}
            Z"/>
`,
            'background-position-y': halfHeight,
            'bounds-expansion': thick,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': oR,
        },
        flag: {
            'background-image': `
<rect width="${width + 4 * thick}" height="${height + 2 * thick}" rx="${oR + 2 * thick}" ry="${oR}" fill="${flag}"/>
`,
            'background-position-x': -2 * thick,
            'background-position-y': -thick,
            'bounds-expansion': 2 * thick,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-width': width + 4 * thick,
            'background-height': height + 2 * thick,
        },
        // analysis: {
        //   'background-image': `${gradient}<rect x="${ht + cellThick}" y="${2 * thick}" width="${width - 2 * cellThick - thick}" height="${height - 4 * thick}" ry="${halfHeight}" rx="${halfHeight - cellThick}" fill="url(#gradient)" stroke-width="0"/>`
        // }
    };
};

const interactingPathway = (properties, { width, height }) => {
    const select = extract(properties.global.selectNode);
    const hover = extract(properties.global.hoverNode);
    const flag = extract(properties.global.flag);
    const thick = extract(properties.global.thickness);
    const realWidth = width;
    const t = 3 * thick;
    return {
        hover: {
            'background-image': `<rect fill="${hover}" width="${width}" height="${t}"/>`,
            'background-width': width,
            'background-height': t,
        },
        select: {
            'background-image': `<rect fill="${select}" width="${width}" height="${t}"/>`,
            'background-position-y': height - t,
            'background-width': width,
            'background-height': t,
        },
        flag: {
            'background-image': `
<rect fill="${flag}" width="${t}" height="${height}"/>
<rect fill="${flag}" width="${t}" height="${height}" x="${realWidth + t}"/>
`,
            'background-width': realWidth + 4 * t,
            'background-position-x': -t,
            'background-height': height,
            'bounds-expansion': 2 * t,
            'background-clip': 'none',
            'background-image-containment': 'over',
        },
        analysis: {
            'background-image': `<rect class="gradient" x="${t}" y="${t}" width="${width - 2 * t}" height="${height - 2 * t}"/>`,
            requireGradient: true,
        },
    };
};

const diseaseInteractor = (properties, { width, height }) => {
    const hover = extract(properties.global.hoverNode);
    const select = extract(properties.global.selectNode);
    const fill = extract(properties.global.negative);
    const t = extract(properties.global.thickness);
    const decorationWidth = extract(properties.interactor.decorationWidth);
    const t4 = t * 4;
    const t2 = t * 2;
    const h = height / 2 + t2;
    const midH = height / 2;
    return {
        decorators: [
            {
                'background-image': `
      <path fill="${fill}" stroke-linejoin="round" stroke-linecap="round" stroke-width="${t4}" stroke="${fill}"  d="
      M ${t2} ${midH}
      L ${decorationWidth + t2} ${t2}
      H ${width - (decorationWidth + t2)}
      L ${width - t2} ${midH}
      L ${width - (decorationWidth + t2)} ${height - t2}
      H ${decorationWidth + t2}
      Z
      " />
      `,
            },
        ],
        hover: {
            'background-image': `
      <path stroke="${hover}" stroke-linejoin="round" stroke-linecap="round" stroke-width="${t4}" d="
      M ${t2} ${midH + t2}
      L ${decorationWidth + t2} ${t2}
      H ${width - (decorationWidth + t2)}
      L ${width - t2} ${midH + t2}
      Z
      " />
      `,
            'background-position-y': -t2,
            'background-height': h,
            'background-clip': 'none',
            'bounds-expansion': t2,
            'background-image-containment': 'over',
        },
        select: {
            'background-image': `
      <path stroke="${select}" stroke-linejoin="round" stroke-linecap="round" stroke-width="${t4}" d="
      M ${t2} 0
      L ${decorationWidth + t2} ${midH}
      H ${width - (decorationWidth + t2)}
      L ${width - t2} 0
      Z
      " />
      `,
            'background-position-y': midH,
            'background-height': h,
            'background-clip': 'none',
            'bounds-expansion': t2,
            'background-image-containment': 'over',
        },
    };
};

const subPathway = (properties, { width, height, disease }) => {
    const select = extract(properties.global.selectNode);
    const hover = extract(properties.global.hoverNode);
    const flag = extract(properties.global.flag);
    const thick = extract(properties.global.thickness) * 3;
    const stroke = !disease
        ? extract(properties.pathway.stroke)
        : extract(properties.global.negativeContrast);
    const fill = extract(properties.pathway.fill);
    const halfHeight = height / 2;
    const ht = thick / 2;
    const oR = halfHeight;
    const iR = halfHeight - thick;
    const oRx = Math.min(oR, width / 2);
    return {
        hover: {
            'background-image': `
          <path fill="${hover}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 ${oR}
            a ${oRx} ${oR} 0 0 1 ${oRx} -${oR}
            h ${width - 2 * oRx}
            a ${oRx} ${oR} 0 0 1 ${oRx} ${oR}
            a ${oRx} ${iR} 0 0 0 -${oRx} -${iR}
            h -${width - 2 * oRx}
            a ${oRx} ${iR} 0 0 0 -${oRx} ${iR}
            Z"/>
`,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': oR,
        },
        select: {
            'background-image': `
          <path fill="${select}" stroke-linejoin="round" stroke-linecap="round"  d="
            M 0 0
            a ${oRx} ${oR} 0 0 0 ${oRx} ${oR}
            h ${width - 2 * oRx}
            a ${oRx} ${oR} 0 0 0 ${oRx} -${oR}
            a ${oRx} ${iR} 0 0 1 -${oRx} ${iR}
            h -${width - 2 * oRx}
            a ${oRx} ${iR} 0 0 1 -${oRx} -${iR}
            Z"/>
`,
            'background-position-y': halfHeight,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-height': oR,
        },
        flag: {
            'background-image': `
      <rect width="${width + 2 * thick}" height="${height}" rx="${oR + thick}" ry="${oR}" fill="${flag}"/>
      <rect x="${1.5 * thick}" y="${ht}" width="${width - thick}" height="${height - thick}" rx="${oR}" fill="${fill}" stroke="${stroke}" stroke-width="${thick}"/>
      `,
            'background-position-x': -thick,
            'bounds-expansion': 2 * thick,
            'background-clip': 'none',
            'background-image-containment': 'over',
            'background-width': width + 2 * thick,
            'background-height': height,
        },
        analysis: {
            'background-image': `<rect class="gradient" x="${thick}" y="${thick}" width="${width - 2 * thick}" height="${height - 2 * thick}" rx="${(height - 2 * thick) / 2}"/>`,
            requireGradient: true,
        },
    };
};

const imageBuilder = (properties, style) => memoize((node) => {
    let layers = [];
    const clazz = node.classes().find((clazz) => classToDrawers.has(clazz));
    if (!clazz)
        return aggregate(layers, defaultBg);
    const provider = classToDrawers.get(clazz);
    const exps = node.data('exp');
    const drawerParams = {
        id: node.id(),
        width: node.data('width'),
        height: node.data('height'),
        drug: node.hasClass('drug'),
        disease: node.hasClass('disease'),
        interactor: node.hasClass('Interactor'),
        crossed: node.hasClass('crossed'),
        lossOfFunction: node.hasClass('loss-of-function'),
    };
    const drawer = provider(properties, drawerParams);
    // A polymer is its shape with an offset copy behind it: the copies only.
    // The shape's own layers are added below like any other node's -- added
    // here as well, they were drawn twice.
    if (node.hasClass('Polymer')) {
        const drawn = [
            drawer.background && !drawer.background.optional ? drawer.background : undefined,
            ...(drawer.decorators || []),
        ].filter((layer) => !!layer);
        for (const originalLayer of drawn) {
            const polymerLayer = { ...originalLayer };
            polymerLayer['background-position-x'] =
                (polymerLayer['background-position-x'] || 0) +
                    extract(properties.polymer.distance);
            polymerLayer['background-position-y'] =
                (polymerLayer['background-position-y'] || 0) +
                    extract(properties.polymer.distance);
            polymerLayer['bounds-expansion'] =
                (polymerLayer['bounds-expansion'] || 0) +
                    extract(properties.polymer.distance) * 2;
            polymerLayer['background-image'] =
                `<g style="filter: ${extract(properties.polymer.filter)}">` +
                    polymerLayer['background-image'] +
                    '</g>';
            layers.push(polymerLayer);
        }
    }
    if (node.hasClass('flag') && drawer.flag)
        layers.push(drawer.flag);
    if (drawer.background && !drawer.background.optional)
        layers.push(drawer.background);
    if (exps && drawer.analysis)
        layers.push(drawer.analysis);
    if (node.selected() && drawer.select)
        layers.push(drawer.select);
    if (node.hasClass('hover') && drawer.hover)
        layers.push(drawer.hover);
    if (drawer.decorators)
        layers.push(...drawer.decorators);
    if (drawerParams.drug) {
        layers.push(RX(properties, drawerParams, clazz));
    }
    if (node.hasClass('Pathway')) {
        layers.push(Pathway(properties, drawerParams));
    }
    if (drawerParams.crossed)
        layers.push(CROSS(properties, drawerParams));
    const gradient = expToGradient(node.id(), exps, properties, style.currentPalette);
    // Convert raw HTML to string encoded images
    layers = layers
        // On a copy: the layer belongs to a cached drawer, and writing the
        // gradient into it added another one on every redraw.
        .map((l) => l.requireGradient && gradient
        ? { ...l, 'background-image': addGradient(l['background-image'], gradient) }
        : l)
        .map((l) => ({
        ...l,
        'background-image': svgStr(l['background-image'], isNumber(l['background-width']) ? l['background-width'] : drawerParams.width, isNumber(l['background-height']) ? l['background-height'] : drawerParams.height),
    }));
    const aggregated = aggregate(layers, defaultBg);
    aggregated['bounds-expansion'] = [
        Math.max(...aggregated['bounds-expansion'], 0),
    ];
    // console.timeEnd(`build-image-${node.id()}`)
    return aggregated;
}, (node) => `${node.id()}-${node.classes().toString()}-s:${node.selected()}`);
const defaultBg = {
    'background-image': '',
    'background-position-x': 0,
    'background-position-y': 0,
    'background-offset-x': 0,
    'background-offset-y': 0,
    'background-width': '100%',
    'background-height': '100%',
    'background-fit': 'none',
    'background-clip': 'none',
    'background-image-opacity': 1,
    'background-image-containment': 'over',
    'background-image-smoothing': 'yes',
    'background-height-relative-to': 'inner',
    'background-width-relative-to': 'inner',
    'background-repeat': 'no-repeat',
    'background-image-crossorigin': 'anonymous',
    'bounds-expansion': 0,
};
function addGradient(svgText, gradient, _single = false) {
    // if (single) {
    //   const s = `<style>.gradient{fill: ${gradient}!important;}</style>${svgText}`;
    //   console.log(s)
    //   return s;
    // }
    // else
    // return gradient + svgText.replaceAll('class="gradient"', 'fill="url(#gradient)"');
    return `<style>.gradient{fill: url(#gradient)};</style>${gradient}${svgText}`;
}
function _expToGradient(_id, exps, _properties, palette) {
    if (!exps)
        return;
    // console.time('exp-to-gradient')
    const stops = [];
    const size = exps.reduce((l, e) => (e !== undefined && isArray(e) ? l + e[1] : l + 1), 0);
    // Nothing to divide the width between: no gradient, not NaN widths.
    if (!(size > 0))
        return undefined;
    const delta = 1 / size;
    exps.forEach((exp, _i) => {
        const p = stops.length - 1;
        const realExp = isArray(exp) ? exp[0] : exp;
        if (stops.length !== 0 && stops[p].exp === realExp) {
            // A [value, count] pair is count shares of the width, merged or not.
            const share = isArray(exp) ? delta * exp[1] : delta;
            stops[p].stop += share;
            stops[p].width += share;
        }
        else {
            if (isArray(exp)) {
                stops.push({
                    start: stops[p]?.stop || 0,
                    stop: (stops[p]?.stop || 0) + delta * exp[1],
                    width: delta * exp[1],
                    color: palette(realExp).hex(),
                    exp: realExp,
                });
                // console.log(stops, exps)
            }
            else {
                stops.push({
                    start: stops[p]?.stop || 0,
                    stop: (stops[p]?.stop || 0) + delta,
                    color: palette(realExp).hex(),
                    width: delta,
                    exp: realExp,
                });
            }
        }
    });
    // if (stops.length === 1) {
    //   console.log(stops)
    //   return stops[0].color;
    // }
    const pattern = '<defs><pattern id="gradient" patternUnits="objectBoundingBox" width="1" height="1" viewBox="0 0 1 1" preserveAspectRatio="none">' +
        stops
            .map((stop, _i) => `<rect fill="${stop.color}" x="${stop.start}" height="1" width="${stop.width + 0.01}"/>`)
            .join('') +
        '</pattern></defs>';
    // const gradient = '<defs><linearGradient id="gradient">' +
    //     stops
    //         .map(stop => `<stop stop-color="${stop.color}" offset="${stop.start}"/><stop stop-color="${stop.color}" offset="${stop.stop}"/>`)
    //         .join('') +
    //     '</linearGradient></defs>'
    // console.timeEnd('exp-to-gradient')
    // console.log(exps)
    return pattern;
}
/**
 * Kept per palette, and keyed on the node's values as well as its id: keyed on
 * the id alone it was shared by every diagram on the page, so a node took the
 * colours of whichever node with that id was drawn first, and kept them after
 * its values changed.
 */
let gradients = new WeakMap();
function expToGradient(id, exps, properties, palette) {
    if (!exps || !palette)
        return undefined;
    let cache = gradients.get(palette);
    if (!cache)
        gradients.set(palette, (cache = new Map()));
    const key = `${id}|${JSON.stringify(exps)}`;
    if (!cache.has(key))
        cache.set(key, _expToGradient(id, exps, properties, palette));
    return cache.get(key);
}
const resetGradients = () => {
    gradients = new WeakMap();
};
function svg(svgStr, width = 100, height = 100) {
    // const cleanedStr = svgStr.replaceAll(/  {2,}|\n/g, " "); // TODO examine performance impact
    const s = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg><svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='${width}' height='${height}'>${svgStr}</svg>`;
    // console.log(s)
    return s;
}
function svgStr(svgText, viewPortWidth, viewPortHeight) {
    // return svg(svgText, viewPortWidth, viewPortHeight);
    return ('data:image/svg+xml;utf8,' + encodeURIComponent(svg(svgText, viewPortWidth, viewPortHeight)));
}
function cached(provider) {
    let byProperties = new WeakMap();
    const drawer = ((properties, p) => {
        let cache = byProperties.get(properties);
        if (!cache)
            byProperties.set(properties, (cache = new Map()));
        const key = [
            p.width,
            p.height,
            p.drug,
            p.disease,
            p.interactor,
            p.crossed,
            p.lossOfFunction,
        ].join('|');
        let drawn = cache.get(key);
        if (!drawn)
            cache.set(key, (drawn = provider(properties, p)));
        return drawn;
    });
    drawer.cache = {
        clear: () => {
            byProperties = new WeakMap();
        },
    };
    return drawer;
}
const classToDrawers = new Map([
    ['Protein', cached(protein)],
    ['GenomeEncodedEntity', cached(genomeEncodedEntity)],
    ['RNA', cached(rna)],
    ['Gene', cached(gene)],
    ['Molecule', cached(molecule)],
    ['Complex', cached(complex)],
    ['EntitySet', cached(entitySet)],
    ['Cell', cached(cell)],
    ['Interacting', cached(interactingPathway)],
    ['SUB', cached(subPathway)],
    ['Interactor', cached(diseaseInteractor)],
]);
function clearDrawersCache() {
    for (const value of classToDrawers.values()) {
        value.cache.clear();
    }
    OMMITED_ICON.cache.clear();
}
function aggregate(toAggregate, defaultValue) {
    const aggregate = {};
    //@ts-expect-error
    const keys = new Set(Object.keys(defaultValue));
    keys.forEach((key) => (aggregate[key] = toAggregate.map((t) => t[key] ?? defaultValue[key])));
    return aggregate;
}
const RX = (properties, { height }, clazz) => {
    const t = extract(properties.global.thickness);
    const color = clazz !== 'Molecule' ? extract(properties.global.onPrimary) : extract(properties.molecule.drug);
    const x = (clazz !== 'EntitySet' ? 0 : extract(properties.entitySet.radius)) + 3 * t;
    return {
        'background-image': `
      <path id="RX" style="transform: scale(2)" fill="${color}" stroke-width="0.4" stroke="${color}" d="M3.2 4C3.3 4 3.4 4 3.6 4L6.75 8.81L5.7 10.15C5.7 10.15 5.53985 10.3884 5.31824 10.6092C5.00434 10.922 4.6582 11.3 4.28711 11.3C4.19141 11.3 4.2 11.3 4.1 11.3V11.5H6.4V11.3C6.2 11.3 6 11.3 5.9 11.2C5.8 11.1 5.8 11 5.8 10.9C5.8 10.6301 5.9 10.5547 6.16055 10.226L7 9.2L7.65291 10.226C7.82889 10.5025 8 10.7344 8 10.9C8 11.0656 7.90095 11.3 7.65291 11.3C7.55291 11.3 7.6 11.3 7.4 11.3V11.5H10.2V11.3C9.9 11.3 9.7 11.2 9.5 11C9.24121 10.7412 9 10.5 8.6 10L7.6 8.5L8.48711 7.35309C8.55228 7.28792 8.61656 7.21558 8.68081 7.13924C9.09787 6.6437 9.64859 6 10.2 6.01309V5.81309H7.8V6.01309C8 6.01309 8.2 6.01309 8.3 6.01309C8.45586 6.01309 8.6 6.20329 8.6 6.31309C8.6 6.62136 8.43963 6.81922 8.2462 7.03337L7.3 8.1L4.5 3.9C5.1 3.8 5.4 3.61 5.7 3.31C6 3.01 6.2 2.6 6.2 2.2C6.2 1.8 6.08711 1.47 5.78711 1.17C5.52798 0.910875 5.3 0.8 5 0.7C4.6 0.6 4.1 0.5 3.4 0.5H1V0.7H1.2C1.82201 0.7 2 1.14292 2 1.7V6C2 6.59634 2 6.9 1.2 6.9H1V7.1H3.8V6.9H3.6C2.9041 6.9 2.9 6.61047 2.9 6V4H3H3.2ZM3 3.7C3 3.7 3 3.7 2.9 3.7L2.88711 1C3.18711 0.9 3.4 0.9 3.6 0.9C4.47782 0.9 5 1.42405 5 2.3C5 3.40743 4.15401 3.7 3.2 3.7H3Z"/>
    `,
        'background-position-x': x,
        'background-position-y': height / 2 - 11,
        'background-width': 22,
        'background-height': 24,
    };
};
const Pathway = (properties, { height, disease }) => {
    const t = extract(properties.global.thickness);
    const color = !disease
        ? extract(properties.global.onPrimary)
        : extract(properties.global.negativeContrast);
    const x = 5 * t;
    return {
        'background-image': `
      <path style="transform: scale(1.5)" fill="${color}" stroke-width="0.4" stroke="${color}" d="M19.6864 21.0381C19.0364 21.0381 18.4531 20.8508 17.9364 20.4761C17.4197 20.1008 17.0614 19.6214 16.8614 19.0381H11.6864C10.5864 19.0381 9.64473 18.6464 8.8614 17.8631C8.07807 17.0798 7.6864 16.1381 7.6864 15.0381C7.6864 13.9381 8.07807 12.9964 8.8614 12.2131C9.64473 11.4298 10.5864 11.0381 11.6864 11.0381H13.6864C14.2364 11.0381 14.7074 10.8421 15.0994 10.4501C15.4907 10.0588 15.6864 9.58809 15.6864 9.03809C15.6864 8.48809 15.4907 8.01709 15.0994 7.62509C14.7074 7.23375 14.2364 7.03809 13.6864 7.03809H8.5114C8.29473 7.62142 7.9324 8.10075 7.4244 8.47609C6.91573 8.85075 6.3364 9.03809 5.6864 9.03809C4.85307 9.03809 4.14473 8.74642 3.5614 8.16309C2.97807 7.57975 2.6864 6.87142 2.6864 6.03809C2.6864 5.20475 2.97807 4.49642 3.5614 3.91309C4.14473 3.32975 4.85307 3.03809 5.6864 3.03809C6.3364 3.03809 6.91573 3.22542 7.4244 3.60009C7.9324 3.97542 8.29473 4.45475 8.5114 5.03809H13.6864C14.7864 5.03809 15.7281 5.42975 16.5114 6.21309C17.2947 6.99642 17.6864 7.93809 17.6864 9.03809C17.6864 10.1381 17.2947 11.0798 16.5114 11.8631C15.7281 12.6464 14.7864 13.0381 13.6864 13.0381H11.6864C11.1364 13.0381 10.6657 13.2338 10.2744 13.6251C9.8824 14.0171 9.6864 14.4881 9.6864 15.0381C9.6864 15.5881 9.8824 16.0591 10.2744 16.4511C10.6657 16.8424 11.1364 17.0381 11.6864 17.0381H16.8614C17.0781 16.4548 17.4407 15.9754 17.9494 15.6001C18.4574 15.2254 19.0364 15.0381 19.6864 15.0381C20.5197 15.0381 21.2281 15.3298 21.8114 15.9131C22.3947 16.4964 22.6864 17.2048 22.6864 18.0381C22.6864 18.8714 22.3947 19.5798 21.8114 20.1631C21.2281 20.7464 20.5197 21.0381 19.6864 21.0381ZM5.6864 7.03809C5.96973 7.03809 6.2074 6.94242 6.3994 6.75109C6.59073 6.55909 6.6864 6.32142 6.6864 6.03809C6.6864 5.75475 6.59073 5.51709 6.3994 5.32509C6.2074 5.13375 5.96973 5.03809 5.6864 5.03809C5.40307 5.03809 5.1654 5.13375 4.9734 5.32509C4.78207 5.51709 4.6864 5.75475 4.6864 6.03809C4.6864 6.32142 4.78207 6.55909 4.9734 6.75109C5.1654 6.94242 5.40307 7.03809 5.6864 7.03809Z" />
    `,
        'background-position-x': x,
        'background-position-y': height / 2 - 18,
        'background-width': 36,
        'background-height': 36,
    };
};
const CROSS = memoize((properties, { width, height }) => {
    const s = extract(properties.global.negative);
    const t = extract(properties.global.thickness);
    return {
        'background-image': `<line x1="${t}" y1="${t}" x2="${width - t}" y2="${height - t}" stroke-width="${2 * t}" stroke-linecap="round" stroke="${s}"/><line x1="${t}" y1="${height - t}" x2="${width - t}" y2="${t}" stroke-width="${2 * t}" stroke-linecap="round" stroke="${s}"/>`,
        'background-image-opacity': 1,
    };
}, (_p, { width, height }) => `${width}x${height}`);
const OMMITED_ICON = memoize((properties) => {
    const s = extract(properties.global.onSurface);
    return svgStr(`<line x1="2.5" y1="3" x2="4.5" y2="7" stroke-width="1.5" stroke-linecap="round" stroke="${s}"/><line x1="5.5" y1="3" x2="7.5" y2="7" stroke-width="1.5" stroke-linecap="round" stroke="${s}"/>`, 10, 10);
}, (_p) => '');

/** A CSS variable as a number, or the default when it is unset or not a number. 0 is a number. */
function cssNumber(css, name, defaultValue) {
    const value = Number.parseFloat(css.getPropertyValue(name));
    return Number.isFinite(value) ? value : defaultValue;
}
/**
 * A CSS variable holding JSON, or the default when it is unset or unreadable.
 * Stylesheets quote with single quotes as readily as double, so
 * `[[0, '#FFFFE0']]` and `'viridis'` are read as JSON would read them double-quoted.
 */
function cssJson(css, name, defaultValue) {
    const value = css.getPropertyValue(name).trim();
    if (!value)
        return defaultValue;
    for (const text of [value, value.replace(/'/g, '"')]) {
        try {
            return JSON.parse(text);
        }
        catch {
            // Try the next reading.
        }
    }
    return defaultValue;
}
function setDefaults(properties = {}, css) {
    const global = defaultable(properties.global || {})
        .setDefault('thickness', 4)
        .setDefault('surface', () => css.getPropertyValue('--surface') || '#F6FEFF')
        .setDefault('onSurface', () => css.getPropertyValue('--on-surface') || '#001F24')
        .setDefault('primary', () => css.getPropertyValue('--primary') || '#006782')
        .setDefault('onPrimary', () => css.getPropertyValue('--on-primary') || '#FFFFFF')
        .setDefault('primaryContainer', () => css.getPropertyValue('--primary-container') || '#baeaff')
        .setDefault('onPrimaryContainer', () => css.getPropertyValue('--on-primary-container') || '#001f29')
        .setDefault('positive', () => css.getPropertyValue('--positive') || '#0C9509')
        .setDefault('negative', () => css.getPropertyValue('--negative') || '#BA1A1A')
        .setDefault('negativeContrast', () => css.getPropertyValue('--negative-contrast') || '#ea7d7d')
        .setDefault('selectNode', () => css.getPropertyValue('--select-node') || '#6EB3E4')
        .setDefault('selectEdge', () => css.getPropertyValue('--select-edge') || '#0561A6')
        .setDefault('hoverNode', () => css.getPropertyValue('--hover-node') || '#78E076')
        .setDefault('hoverEdge', () => css.getPropertyValue('--hover-edge') || '#04B601')
        .setDefault('flag', () => css.getPropertyValue('--flag') || '#DE75B4');
    const compartment = defaultable(properties.compartment || {})
        .setDefault('opacity', () => cssNumber(css, '--compartment-opacity', 0.06))
        .setDefault('fill', () => css.getPropertyValue('--compartment') || '#E5834A');
    const shadow = defaultable(properties.shadow || {})
        .setDefault('luminosity', () => cssNumber(css, '--shadow-luminosity', 40))
        .setDefault('padding', () => cssNumber(css, '--shadow-padding', 20))
        .setDefault('fontSize', () => cssNumber(css, '--shadow-font-size', 80))
        .setDefault('fontPadding', () => cssNumber(css, '--shadow-font-padding', 15))
        .setDefault('opacity', () => cssJson(css, '--shadow-opacity', [
        [20, 20],
        [40, 0],
    ]))
        .setDefault('labelOpacity', () => cssJson(css, '--shadow-label-opacity', [
        [20, 100],
        [40, 0],
    ]));
    const protein = defaultable(properties.protein || {})
        .setDefault('fill', () => css.getPropertyValue('--primary-contrast-1') || '#001F29')
        .setDefault('drug', () => css.getPropertyValue('--drug-contrast-1') || '#3E001D')
        .setDefault('radius', 8);
    const genomeEncodedEntity = defaultable(properties.genomeEncodedEntity || {})
        .setDefault('fill', () => css.getPropertyValue('--primary-contrast-4') || '#006782')
        .setDefault('drug', () => css.getPropertyValue('--drug-contrast-4') || '#BB557A')
        .setDefault('bottomRadius', 6)
        .setDefault('topRadius', 40);
    const rna = defaultable(properties.rna || {})
        .setDefault('fill', () => css.getPropertyValue('--primary-contrast-2') || '#003545')
        .setDefault('drug', () => css.getPropertyValue('--drug-contrast-2') || '#610B33')
        .setDefault('radius', 8);
    const gene = defaultable(properties.gene || {})
        .setDefault('decorationHeight', 20)
        .setDefault('decorationExtraWidth', 17)
        .setDefault('arrowHeadSize', 10)
        .setDefault('borderRadius', 8)
        .setDefault('arrowRadius', 8)
        .setDefault('fill', () => css.getPropertyValue('--primary-contrast-3') || '#004D62');
    const molecule = defaultable(properties.molecule || {})
        .setDefault('fill', () => extract(global.surface))
        .setDefault('stroke', () => extract(global.onSurface))
        .setDefault('drug', () => css.getPropertyValue('--drug-contrast-3') || '#9C3D61');
    const complex = defaultable(properties.complex || {})
        .setDefault('cut', 8)
        .setDefault('fill', () => css.getPropertyValue('--tertiary-contrast-1') || '#00315C')
        .setDefault('stroke', () => css.getPropertyValue('--on-tertiary') || '#FFFFFF')
        .setDefault('drug', () => css.getPropertyValue('--drug-contrast-3') || '#7E2549');
    const entitySet = defaultable(properties.entitySet || {})
        .setDefault('radius', 8)
        .setDefault('fill', () => css.getPropertyValue('--tertiary-contrast-3') || '#1660A5')
        .setDefault('stroke', () => css.getPropertyValue('--on-tertiary') || '#FFFFFF')
        .setDefault('drug', () => css.getPropertyValue('--drug-contrast-4') || '#BB557A');
    const polymer = defaultable(properties.polymer || {})
        .setDefault('distance', () => 3 * extract(global.thickness))
        .setDefault('filter', () => css.getPropertyValue('--polymer-filter') || 'invert(0.2)');
    const cell = defaultable(properties.cell || {})
        .setDefault('thickness', () => cssNumber(css, '--cell-thickness', 16))
        .setDefault('fill', () => css.getPropertyValue('--tertiary-contrast-2') || '#004882')
        .setDefault('stroke', () => css.getPropertyValue('--on-tertiary') || '#FFFFFF');
    const pathway = defaultable(properties.pathway || {})
        .setDefault('fill', () => css.getPropertyValue('--primary-contrast-4') || '#006782')
        .setDefault('stroke', () => extract(global.onPrimary));
    const modification = defaultable(properties.modification || {}).setDefault('fill', () => css.getPropertyValue('--primary-contrast-2') || '#003545');
    const interactor = defaultable(properties.interactor || {})
        .setDefault('fill', () => css.getPropertyValue('--interactor-fill') || '#68297C')
        .setDefault('stroke', () => css.getPropertyValue('--interactor-stroke') || '#9f5cb5')
        .setDefault('decorationWidth', () => cssNumber(css, '--decorationWidth', 20));
    const trivial = defaultable(properties.trivial || {}).setDefault('opacity', () => cssJson(css, '--trivial-opacity', [
        [40, 0],
        [60, 100],
    ]));
    const structure = defaultable(properties.structure || {}).setDefault('opacity', () => cssJson(css, '--structure-opacity', [
        [130, 0],
        [150, 100],
    ]));
    const font = defaultable(properties.font || {}).setDefault('size', 12);
    const analysis = defaultable(properties.analysis || {})
        .setDefault('min', cssNumber(css, '--analysis-min', 0))
        .setDefault('max', cssNumber(css, '--analysis-max', 1))
        .setDefault('notFound', () => css.getPropertyValue('--analysis-not-found') || extract(global.onSurface))
        .setDefault('unidirectionalPalette', () => cssJson(css, '--analysis-uni-palette', [
        [0.0, '#FFFFE0'],
        [1.0, '#00429D'],
    ]))
        .setDefault('bidirectionalPalette', () => cssJson(css, '--analysis-bi-palette', [
        [0.0, '#93003A'],
        [0.5, '#FFFFE0'],
        [1.0, '#00429D'],
    ]));
    const features = defaultable(properties.features || {})
        .setDefault('edit', false)
        .setDefault('compare', true)
        .setDefault('analysis', true)
        .setDefault('interactors', true);
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
        polymer,
        pathway,
        modification,
        interactor,
        trivial,
        structure,
        font,
        analysis,
        features,
    };
}

var ReactomeEventTypes;
(function (ReactomeEventTypes) {
    ReactomeEventTypes["hover"] = "reactome::hover";
    ReactomeEventTypes["leave"] = "reactome::leave";
    ReactomeEventTypes["select"] = "reactome::select";
    ReactomeEventTypes["unselect"] = "reactome::unselect";
    ReactomeEventTypes["open"] = "reactome::open";
    ReactomeEventTypes["close"] = "reactome::close";
})(ReactomeEventTypes || (ReactomeEventTypes = {}));
class ReactomeEvent extends CustomEvent {
    constructor(type, target) {
        super(type, { detail: target });
    }
}

cytoscape.use(Layers);
/**
 * Below this zoom the interactor count badge is not drawn at all.
 *
 * Measured rather than chosen: the badge is 30 model units wide, so 0.6 puts it
 * at 18 screen pixels. Below that its two digits are a smudge -- 6 pixels at the
 * 0.203 that R-HSA-1368108 opens at.
 */
const INTERACTOR_BADGE_MIN_ZOOM = 0.6;
class Interactivity {
    constructor(cy, properties) {
        this.cy = cy;
        this.properties = properties;
        this.isMobile = 'ontouchstart' in document || navigator.maxTouchPoints > 0;
        this.applyToReaction = (action, stateKey) => (reactionNode) => {
            if (state[stateKey])
                return;
            state[stateKey] = true;
            action(this.expandReaction(reactionNode));
            state[stateKey] = false;
        };
        this.onZoom = {
            shadow: () => undefined,
            protein: () => undefined,
        };
        this.margin = 0;
        // console.log('is mobile', this.isMobile)
        cy.elements().ungrabify().panify();
        this.initHover(cy);
        this.initSelect(cy);
        this.initClick(cy);
        // Before the layers: a structure that cannot be found removes its node
        // from this collection as the layer is drawn.
        this.withoutStructure = cy.collection();
        this.updateProteins();
        this.initStructureVideo(cy);
        this.initStructureMolecule(cy);
        // After the layers, so its first run sets their opacity for this zoom.
        // It ran first, and the molecule layer stayed at full opacity until the
        // reader zoomed.
        this.initZoom(cy);
    }
    expandReaction(reactionNode) {
        return reactionNode.connectedEdges().add(reactionNode);
    }
    initHover(cy, mapper = (x) => x) {
        const hoverReaction = this.applyToReaction((col) => col.addClass('hover'), 'hovering');
        const deHoverReaction = this.applyToReaction((col) => col.removeClass('hover'), 'deHovering');
        const container = cy.container();
        cy.on('mouseover', 'node.PhysicalEntity', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.hover, {
            element: e.target,
            type: 'PhysicalEntity',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('mouseover', 'node.Pathway', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.hover, {
            element: e.target,
            type: 'Pathway',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('mouseover', 'node.reaction', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.hover, {
            element: e.target,
            type: 'reaction',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('mouseover', 'edge.reaction', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.hover, {
            element: e.target.connectedNodes('.reaction'),
            type: 'reaction',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('mouseout', 'node.PhysicalEntity', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.leave, {
            element: e.target,
            type: 'PhysicalEntity',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('mouseout', 'node.Pathway', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.leave, {
            element: e.target,
            type: 'Pathway',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('mouseout', 'node.reaction', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.leave, {
            element: e.target,
            type: 'reaction',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('mouseout', 'edge.reaction', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.leave, {
            element: e.target.connectedNodes('.reaction'),
            type: 'reaction',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('mouseover', 'node', (e) => mapper(e.target).addClass('hover'))
            .on('mouseout', 'node', (e) => mapper(e.target).removeClass('hover'))
            .on('mouseover', 'node.reaction', (e) => hoverReaction(mapper(e.target)))
            .on('mouseout', 'node.reaction', (e) => deHoverReaction(mapper(e.target)))
            .on('mouseover', 'edge', (e) => {
            const mapped = mapper(e.target);
            // if (mapped !== e.target) console.log(mapped, mapped.connectedNodes('.reaction'))
            hoverReaction(mapped.connectedNodes('.reaction'));
        })
            .on('mouseout', 'edge', (e) => deHoverReaction(mapper(e.target).connectedNodes('.reaction')))
            .on('mouseover', 'node.Modification', (e) => mapper(cy.nodes(`#${e.target.data('nodeId')}`)).addClass('hover'))
            .on('mouseout', 'node.Modification', (e) => mapper(cy.nodes(`#${e.target.data('nodeId')}`)).removeClass('hover'))
            .on('mouseover', 'edge.Interactor', (e) => mapper(cy.edges(`#${e.target.data('id')}`)).addClass('hover'))
            .on('mouseout', 'edge.Interactor', (e) => mapper(cy.edges(`#${e.target.data('id')}`)).removeClass('hover'));
    }
    initSelect(cy, mapper = (x) => x) {
        const selectReaction = this.applyToReaction((col) => col.select(), 'selecting');
        const container = cy.container();
        cy.on('select', 'node.PhysicalEntity', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.select, {
            element: e.target,
            type: 'PhysicalEntity',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('select', 'node.Pathway', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.select, {
            element: e.target,
            type: 'Pathway',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('select', 'node.reaction', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.select, {
            element: e.target,
            type: 'reaction',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('select', 'edge.reaction', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.select, {
            element: e.target.connectedNodes('.reaction'),
            type: 'reaction',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('unselect', 'node.PhysicalEntity', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.unselect, {
            element: e.target,
            type: 'PhysicalEntity',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('unselect', 'node.Pathway', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.unselect, {
            element: e.target,
            type: 'Pathway',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('unselect', 'node.reaction', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.unselect, {
            element: e.target,
            type: 'reaction',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('unselect', 'edge.reaction', (e) => container.dispatchEvent(new ReactomeEvent(ReactomeEventTypes.unselect, {
            element: e.target.connectedNodes('.reaction'),
            type: 'reaction',
            reactomeId: e.target.data('reactomeId'),
            cy,
        })))
            .on('select', 'edge', (e) => selectReaction(mapper(e.target).connectedNodes('.reaction')))
            .on('unselect', 'edge', () => selectReaction(mapper(cy.edges(':selected').connectedNodes('.reaction').add(cy.nodes('.reaction:selected'))))) // Avoid single element selection when double-clicking
            .on('select', 'node.reaction', (event) => selectReaction(mapper(event.target)))
            .on('select', 'node.Modification', (e) => mapper(cy.nodes(`#${e.target.data('nodeId')}`)).select());
    }
    initClick(cy) {
        const container = cy.container();
        cy.on('tap', 'node.InteractorOccurrences', (e) => {
            const openClass = 'opened';
            const eventType = !e.target.hasClass(openClass)
                ? ReactomeEventTypes.open
                : ReactomeEventTypes.close;
            e.target.toggleClass(openClass);
            container.dispatchEvent(new ReactomeEvent(eventType, {
                element: e.target,
                type: 'Interactor',
                reactomeId: e.target.data('reactomeId'),
                cy,
            }));
        })
            .on('tap', '.Interactor', (e) => {
            const prop = e.target.isNode() ? 'accURL' : 'evidenceURLs';
            const url = e.target.data(prop);
            if (url)
                window.open(url);
        })
            .on('tap', '.DiseaseInteractor', (e) => {
            const prop = e.target.isNode() ? 'accURL' : 'evidenceURLs';
            const url = e.target.data(prop);
            if (url)
                window.open(url);
        })
            .on('tap', '.Compartment', () => cy.elements().unselect());
        // .on('tap', e => {
        //   const openClass = 'opened';
        //   let eventType = !e.target.hasClass(openClass) ? ReactomeEventTypes.open : ReactomeEventTypes.close;
        //   e.target.toggleClass(openClass);
        //   container.dispatchEvent(new ReactomeEvent(eventType, {
        //     element: e.target,
        //     type: "Any",
        //     reactomeId: e.target.data('reactomeId'),
        //     cy
        //   }))
        // });
    }
    initStructureVideo(cy) {
        const layersPlugin = layers(cy);
        this.videoLayer = layersPlugin.append('html');
        if (this.videoLayer)
            this.videoLayer.node.style.opacity = '0';
        layersPlugin.renderPerNode(this.videoLayer, (elem) => {
            elem.render();
        }, {
            init: (elem, node) => {
                elem.innerHTML = node.data('html') || '';
                elem.style.display = 'flex';
                const video = elem.children[0];
                elem.render = _.throttle(() => {
                    if (isElementInViewport(elem)) {
                        // console.log('rendering', name)
                        if (this.videoLayer?.node.style.opacity !== '0' &&
                            video.readyState === video.HAVE_NOTHING &&
                            video.networkState === video.NETWORK_IDLE) {
                            // video.classList.add('loading');
                            this.addLoading(elem);
                            video.oncanplay = (_e) => this.removeLoading(elem);
                            let errors = 0;
                            const sources = video.querySelectorAll('source');
                            sources.forEach((source) => source.addEventListener('error', (_e) => {
                                errors++;
                                if (errors === sources.length)
                                    this.removeStructureContainer(elem, node);
                            }));
                            video.load();
                        }
                        elem.style.visibility = node.visible() ? 'visible' : 'hidden';
                    }
                }, 500);
            },
            transform: `translate(-70%, -50%)`,
            position: 'center',
            uniqueElements: false,
            checkBounds: false, // Need false otherwise destroy nodes when out of view
            selector: '.Protein',
            updateOn: 'render', // Need render to call display whenever we move
            queryEachTime: false,
        });
        this.videoLayer?.node.classList.add('video');
        // Not async: nothing in here awaits, and returning a promise handed every
        // cytoscape listener built from this factory a value it ignores.
        const handler = (action) => (event) => {
            const videoId = event.target.id();
            const videoElement = this.videoLayer?.node.querySelector(`#video-${videoId}`);
            if (videoElement && videoElement.readyState >= videoElement.HAVE_ENOUGH_DATA) {
                action(videoElement);
            }
        };
        if (this.isMobile) {
            this.cy
                .on('select', 'node.Protein', handler((v) => {
                // play() rejects when the browser blocks autoplay, which is normal
                // and not worth reporting; the icon stays on its first frame.
                void v.play().catch(() => undefined);
            }))
                .on('unselect', 'node.Protein', handler((v) => v.pause()));
        }
        this.cy
            .on('mouseover', 'node.Protein', handler((v) => {
            // play() rejects when the browser blocks autoplay, which is normal
            // and not worth reporting; the icon stays on its first frame.
            void v.play().catch(() => undefined);
        }))
            .on('mouseout', 'node.Protein', handler((v) => v.pause()));
    }
    addLoading(container) {
        // const template = document.createElement('template');
        // template.innerHTML = `<video class='loader' autoplay loop muted playsinline><source src='assets/loader-dark.webm' type='video/webm'></video>`
        // container.appendChild(template.content.firstChild as HTMLVideoElement);
        container.classList.add('loading');
    }
    removeLoading(container) {
        // container.querySelector('.loader')?.remove();
        container.classList.remove('loading');
    }
    removeStructureContainer(loadingContainer, node) {
        // console.log('Remove diagram structure container because not found', loadingContainer, node)
        loadingContainer.classList.remove('loading');
        this.removeLoading(loadingContainer);
        // Only what the structure set. All of the node's inline style went before,
        // the zoom's opacity with it, and a trivial molecule then fell back to its
        // stylesheet opacity of 0 until the next zoom -- which never came in a
        // diagram that cannot be zoomed.
        // The zoom moved the label aside to make room for the structure; with no
        // structure it goes back to the middle.
        for (const property of [
            'background-position-x',
            'background-position-y',
            'background-width',
            'background-height',
            'font-size',
            'text-margin-x',
            'text-max-width',
        ])
            node.removeStyle(property);
        this.withoutStructure = this.withoutStructure.union(node);
        this.structureContainers = this.structureContainers.not(node);
    }
    initStructureMolecule(cy) {
        // @ts-expect-error
        const layers = cy.layers();
        this.moleculeLayer = layers.append('html');
        this.moleculeLayer.node.classList.add('molecule');
        layers.renderPerNode(this.moleculeLayer, (elem, node) => {
            elem.style.visibility = node.visible() ? 'visible' : 'hidden';
        }, {
            init: (elem, node) => {
                elem.classList.add('molecule-structure');
                // elem.classList.add('loading')
                this.addLoading(elem);
                const w = node.data('width') - 4; // retrieve border width
                const h = node.data('height') - 4; // retrieve border width
                const cos45 = 0.7071067811865476;
                const margin = (1 - cos45) * (Math.min(h, w) / 2); // Margin to cut the rounded corner exactly at 45deg
                elem.style.width = w / 2 - margin + 'px';
                elem.style.height = h - 2 * margin + 'px';
                elem.style.display = 'flex';
                // The structure's SVG, or its load while it is still on the way.
                const structure = node.data('chebiStructure');
                const initStructure = (svgData) => {
                    if (svgData === undefined)
                        return this.removeStructureContainer(elem, node);
                    elem.innerHTML = svgData;
                    const svg = elem.querySelector('svg');
                    if (!svg)
                        return this.removeStructureContainer(elem, node);
                    // Avoid molecule bonds to scale with size
                    // svg.querySelectorAll('path').forEach(p => p.setAttribute("vector-effect", `non-scaling-stroke`));
                    // Remove white background
                    svg.querySelector('rect:first-of-type')?.remove();
                    // Readjust svg content to fit in the container
                    const bbox = svg.getBBox();
                    svg.setAttribute('viewBox', `${bbox.x - 1} ${bbox.y - 1} ${bbox.width + 2} ${bbox.height + 2}`);
                    elem.classList.remove('loading');
                    this.removeLoading(elem);
                };
                // A thenable -- not `instanceof Promise`, which is false for a native
                // promise where zone.js has replaced the global, as in an app that
                // uses it -- and not rxjs's internal isPromise, no part of its API.
                if (typeof structure?.then === 'function') {
                    // A structure that fails to load is one that could not be found.
                    structure.then(initStructure, () => this.removeStructureContainer(elem, node));
                }
                else {
                    initStructure(structure);
                }
            },
            transform: `translate(-100%, -50%)`,
            position: 'center',
            uniqueElements: true,
            checkBounds: false,
            selector: '.Molecule',
            // Not only when a node moves: a node hidden or shown changes no
            // position, and its structure has to follow it.
            updateOn: 'position style',
            queryEachTime: false,
        });
    }
    triggerZoom() {
        Object.values(this.onZoom).forEach((onZoom) => onZoom());
    }
    updateProteins() {
        this.structureContainers = this.cy.nodes('.Protein').or('.Molecule').not(this.withoutStructure);
    }
    initZoom(cy) {
        const allShadows = cy.edges('[?pathway]');
        const shadowLabels = cy.nodes('.Shadow');
        const trivial = cy.elements('.trivial');
        cy.minZoom(Math.min(cy.zoom(), extract(this.properties.shadow.labelOpacity)[0][0] / 100));
        cy.maxZoom(15);
        const baseFontSize = extract(this.properties.font.size);
        const structureOpacityArray = extract(this.properties.structure.opacity);
        const zoomStart = structureOpacityArray[0][0];
        const zoomEnd = structureOpacityArray[structureOpacityArray.length - 1][0];
        this.onZoom.shadow = () => {
            // Not the lines of a flagged reaction: they carry a sub-pathway band too,
            // and writing it inline here wiped the flag's halo off them on the next
            // restyle (#311). As with trivial molecules below, the class is the
            // authority.
            const shadows = allShadows.not('.flag');
            const zoomLevel = cy.zoom();
            const z = zoomLevel * 100;
            const shadowLabelOpacity = this.interpolate(z, extract(this.properties.shadow.labelOpacity).map((v) => this.p(...v))) / 100;
            const trivialOpacity = this.interpolate(z, extract(this.properties.trivial.opacity).map((v) => this.p(...v))) / 100;
            let shadowOpacity = this.interpolate(z, extract(this.properties.shadow.opacity).map((v) => this.p(...v))) / 100;
            // A dirty fix for removing shadowEdges color when no shadow color is defined, color black is assigned to the edges after removing shadow class
            if (shadows.style('underlay-color') === 'rgb(0,0,0)') {
                shadowOpacity = 0;
            }
            shadows.style({
                'underlay-opacity': shadowOpacity,
            });
            // Something pointed at in the hierarchy: the other sub-pathways' bands
            // fade and its own is drawn strongly. Here rather than in the stylesheet,
            // because this handler writes the bands inline and inline always wins.
            shadows.filter('.hierarchy-dim').style({ 'underlay-opacity': shadowOpacity * 0.15 });
            // Only a band that is showing is strengthened: with bands off (flagging
            // removes them) the underlay falls back to black, and boosting it drew a
            // black halo round the hovered sub-pathway.
            if (shadowOpacity > 0) {
                shadows
                    .filter('.hierarchy-hover.shadow')
                    .style({ 'underlay-opacity': Math.max(shadowOpacity, 0.6) });
            }
            shadowLabels.style({
                'text-opacity': shadowLabelOpacity,
            });
            // The other sub-pathways' names fade with their bands.
            shadowLabels.filter('.hierarchy-dim').style({ 'text-opacity': shadowLabelOpacity * 0.2 });
            // Not the ones flagging has pinned visible.
            //
            // This writes an inline opacity, and in cytoscape an inline style beats
            // any stylesheet rule -- so it silently overrode the `.trivial
            // .always-visible` rule that flagging relies on. Detaching this handler
            // from the zoom event was not enough to stop it: `triggerZoom()` calls it
            // directly, and that runs on every restyle (a theme change, an analysis
            // loading) and whenever an interactor is opened. Curators saw H2O and H+
            // vanish as they zoomed out with something flagged, and saw chemical
            // structures drawn with no molecule underneath -- the same fault, since
            // the structures are drawn by a different handler that was still running.
            //
            // The class is the authority. Anything wearing it is left alone.
            const shown = trivial.filter((element) => !element.hasClass('always-visible'));
            shown.style({
                opacity: trivialOpacity,
                'underlay-opacity': Math.min(shadowOpacity, trivialOpacity),
            });
            // Faded with the rest while something else is pointed at in the hierarchy.
            const faded = Math.min(trivialOpacity, 0.2);
            shown.filter('.hierarchy-dim').style({
                opacity: faded,
                'underlay-opacity': Math.min(shadowOpacity, faded),
            });
            // The interactor count badge is not worth drawing when it cannot be read.
            //
            // It is 30 model units across, so at the zoom a pathway opens at -- 0.203
            // for R-HSA-1368108 -- it is **6 pixels**, holding a two-digit number. Two
            // readers in a row failed to find it while looking straight at it.
            //
            // The old browser does not draw it either: RendererManager.setFactor swaps
            // renderer tiers at 0.5, and ProteinRenderer000 makes no call to
            // drawSummaryItems while ProteinRenderer050 makes two. This threshold is
            // close to theirs but chosen here rather than copied, because a cytoscape
            // zoom and a GWT factor are not the same quantity: 0.6 puts the badge at 18
            // screen pixels, which is where its digits stop being a smudge.
            cy.elements('.InteractorOccurrences').style('display', zoomLevel < INTERACTOR_BADGE_MIN_ZOOM ? 'none' : 'element');
        };
        const updateDecorationPosition = (node) => {
            if (!this.structureContainers.has(node))
                return;
            node.removeStyle('background-position-x');
            node.removeStyle('background-position-y');
            node.removeStyle('background-width');
            node.removeStyle('background-height');
            const i = node.numericStyle('background-image').findIndex((svg) => svg.includes('RX'));
            const xs = [...node.numericStyle('background-position-x')];
            const ys = [...node.numericStyle('background-position-y')];
            const widths = [...node.numericStyle('background-width')];
            const heights = [...node.numericStyle('background-height')];
            const x = xs[i];
            xs[i] = x + this.margin * 2 * node.data('width');
            // margin : 0 -> 0.25
            const scale = 1 - this.margin * 2; // 1 -> 0.5
            widths[i] = widths[i] * scale;
            heights[i] = heights[i] * scale;
            ys[i] = ys[i] + heights[i] * this.margin * 2;
            node.style('background-position-x', xs);
            node.style('background-position-y', ys);
            node.style('background-width', widths);
            node.style('background-height', heights);
        };
        this.onZoom.protein = () => {
            const zoomLevel = cy.zoom();
            const z = zoomLevel * 100;
            const videoOpacity = this.interpolate(z, extract(this.properties.structure.opacity).map((v) => this.p(...v))) / 100;
            const maxWidth = this.interpolate(z, [this.p(zoomStart, 100), this.p(zoomEnd, 50)]); //might need to be commented out (Jhaque)
            this.margin = this.interpolate(z, [this.p(zoomStart, 0), this.p(zoomEnd, 0.25)]);
            const fontSize = this.interpolate(z, [
                this.p(zoomStart, baseFontSize),
                this.p(zoomEnd, baseFontSize / 2),
            ]);
            this.structureContainers.style({
                'font-size': fontSize,
                'text-margin-x': (n) => this.margin * n.data('width') + (n.hasClass('drug') ? 10 : 0),
                'text-max-width': maxWidth + '%', //Might need to be deleted (Jhaque)
            });
            this.structureContainers.nodes('.drug').forEach(updateDecorationPosition);
            if (this.videoLayer)
                this.videoLayer.node.style.opacity = videoOpacity + '';
            if (this.moleculeLayer)
                this.moleculeLayer.node.style.opacity = videoOpacity + '';
        };
        cy.on('zoom', this.onZoom.shadow);
        cy.on('zoom', this.onZoom.protein);
        const handler = (e) => updateDecorationPosition(e.target);
        cy.on('mouseover', '.drug', handler)
            .on('mouseout', '.drug', handler)
            .on('unselect', '.drug', handler)
            .on('select', '.drug', handler);
        this.triggerZoom();
    }
    p(x, y) {
        return new P(x, y);
    }
    interpolate(x, points) {
        if (x < points.at(0).x)
            return points.at(0).y;
        if (x > points.at(-1).x)
            return points.at(-1).y;
        for (let i = 0; i + 1 < points.length; i++) {
            const y = this.lerp(x, points[i], points[i + 1]);
            if (y)
                return y;
        }
        console.assert(false, 'Should not arrive here');
        return 0;
    }
    /**
     * Linear interpolation as described in https://en.wikipedia.org/wiki/Linear_interpolation
     * @param x : number number to determine corresponding value
     * @param p0 : P lower bound point for the linear interpolation
     * @param p1 : P upper bound point for the linear interpolation
     */
    lerp(x, p0, p1) {
        if (x < p0.x || x > p1.x)
            return undefined;
        return (p0.y * (p1.x - x) + p1.y * (x - p0.x)) / (p1.x - p0.x);
    }
}
const state = {
    selecting: false,
    hovering: false,
    deHovering: false,
};
class P extends Array {
    constructor(x, y) {
        super(x, y);
    }
    get x() {
        return this[0];
    }
    get y() {
        return this[1];
    }
}
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth));
}

const INTERACTIVITY_KEY = '_reactomeInteractivity';
/**
 * The Interactivity bound to this specific graph. Prefer this over
 * `cy.data('reactome').interactivity`, which returns whichever graph was bound
 * most recently and so may belong to an entirely different cytoscape instance.
 */
function interactivityOf(cy) {
    return cy.scratch(INTERACTIVITY_KEY);
}
class Style {
    constructor(container, properties = {}) {
        this.css = getComputedStyle(container);
        this.properties = setDefaults(properties, this.css);
        this.imageBuilder = imageBuilder(this.properties, this);
        this.p = propertyExtractor(this.properties);
        this.pm = propertyMapper(this.properties);
    }
    bindToCytoscape(cy) {
        this.cy = cy;
        cy.data('reactome', this);
        this.interactivity = new Interactivity(cy, this.properties);
        // One Style is bound to several graphs -- the diagram, the legend, the
        // comparison view -- and this.interactivity only ever holds the most recent
        // one. Anything that has to reach the handlers registered on a *particular*
        // graph must look them up on that graph, so keep a per-instance reference.
        cy.scratch(INTERACTIVITY_KEY, this.interactivity);
        this.initSubPathwayColors();
    }
    initSubPathwayColors(cy = this.cy) {
        const subPathways = cy?.nodes('.Shadow');
        if (!subPathways)
            return;
        const dH = 360 / subPathways.length;
        subPathways.forEach((subPathway, i) => {
            const edges = cy.edges(`[pathway=${subPathway.data('reactomeId')}]`);
            subPathway.data('edges', edges);
            const color = chroma.hsl(dH * i, 1, extract(this.properties.shadow.luminosity) / 100);
            const hex = color.hex();
            subPathway.data('color', hex);
            edges.forEach((edge) => {
                edge.data('color', hex);
            });
        });
    }
    getStyleSheet() {
        return [
            {
                selector: '*',
                css: {
                    // A stack, not a bare family: an exported SVG carries this string
                    // to wherever it is opened, and a viewer without Roboto was falling
                    // all the way back to its default serif, whose metrics are nothing
                    // like Roboto's -- so labels stopped fitting inside their shapes.
                    'font-family': 'Roboto, Helvetica, Arial, sans-serif',
                    'font-weight': 600,
                    'z-index': 1,
                },
            },
            {
                selector: 'node.Compartment',
                css: {
                    shape: 'round-rectangle',
                    width: 'data(width)',
                    height: 'data(height)',
                    'border-style': 'double',
                    'z-index': 0,
                    'z-compound-depth': 'bottom',
                    'overlay-opacity': 0,
                    color: this.p('compartment', 'fill'),
                    'border-color': this.p('compartment', 'fill'),
                    'background-color': this.p('compartment', 'fill'),
                    'background-opacity': this.p('compartment', 'opacity'),
                    'border-width': this.pm('global', 'thickness', (t) => 3 * t),
                },
            },
            {
                selector: 'node.Compartment.inner, node.Compartment.outer',
                css: {
                    'border-style': 'solid',
                    'border-width': this.p('global', 'thickness'),
                },
            },
            {
                selector: 'node.Compartment.outer',
                css: {
                    label: 'data(displayName)',
                    'text-opacity': 1,
                    'text-valign': 'bottom',
                    'text-halign': 'right',
                    // @ts-expect-error
                    'text-margin-x': 'data(textX)',
                    // @ts-expect-error
                    'text-margin-y': 'data(textY)',
                },
            },
            {
                selector: 'node[?radius]',
                css: {
                    'corner-radius': 'data(radius)',
                },
            },
            {
                selector: 'node.Shadow',
                css: {
                    label: 'data(displayName)',
                    'font-size': this.p('shadow', 'fontSize'),
                    events: 'no',
                    'background-opacity': 0,
                    shape: 'rectangle',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'text-outline-color': this.p('global', 'surface'),
                    'text-outline-width': this.p('shadow', 'fontPadding'),
                    'text-wrap': 'wrap',
                    'text-max-width': 'data(width)',
                },
            },
            {
                selector: 'node.Shadow[?color]',
                css: {
                    color: 'data(color)',
                },
            },
            {
                selector: 'node.PhysicalEntity, node.Pathway, node.Modification, node.Interactor',
                css: {
                    'font-size': this.p('font', 'size'),
                    'text-margin-x': 0,
                    label: 'data(displayName)',
                    width: 'data(width)',
                    height: 'data(height)',
                    'background-fit': 'none',
                    'text-halign': 'center',
                    'text-valign': 'center',
                    'text-wrap': 'wrap',
                    'text-max-width': (node) => node.data('width') + 'px',
                    // @ts-expect-error
                    'background-image-smoothing': 'no no no no no no no no',
                    // @ts-expect-error
                    'background-image': (node) => this.imageBuilder(node)['background-image'],
                    // @ts-expect-error
                    'background-position-y': (node) => this.imageBuilder(node)['background-position-y'] || [],
                    // @ts-expect-error
                    'background-position-x': (node) => this.imageBuilder(node)['background-position-x'] || [],
                    // @ts-expect-error
                    'background-height': (node) => this.imageBuilder(node)['background-height'] || '100%',
                    // @ts-expect-error
                    'background-width': (node) => this.imageBuilder(node)['background-width'] || '100%',
                    // @ts-expect-error
                    'background-clip': (node) => this.imageBuilder(node)['background-clip'] || 'node',
                    // @ts-expect-error
                    'background-image-containment': (node) => this.imageBuilder(node)['background-image-containment'] || 'inside',
                    // @ts-expect-error
                    'background-image-opacity': (node) => this.imageBuilder(node)['background-image-opacity'] || 1,
                    'bounds-expansion': (node) => this.imageBuilder(node)['bounds-expansion'][0] || 0,
                    color: this.p('global', 'onPrimary'),
                },
            },
            {
                selector: 'node.drug',
                css: {
                    'text-max-width': (node) => node.width() - 36 * 2 + 'px',
                    'text-margin-x': 4,
                    'font-style': 'italic',
                },
            },
            {
                selector: 'node.InteractorOccurrences',
                css: {
                    label: 'data(displayName)',
                    color: this.p('global', 'surface'),
                    shape: 'ellipse',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'text-wrap': 'wrap',
                    'background-color': this.p('interactor', 'fill'),
                },
            },
            {
                selector: 'node.InteractorOccurrences.disease',
                css: {
                    'background-color': this.p('global', 'negative'),
                },
            },
            {
                selector: 'node.InteractorOccurrences[?exp]',
                css: {
                    'background-color': (node) => {
                        const exp = node.data('exp');
                        // console.log(node.data(), exp)
                        return exp !== undefined
                            ? this.currentPalette(exp[0]).hex()
                            : this.pm('analysis', 'notFound', (c) => c)();
                    },
                    'border-width': this.p('global', 'thickness'),
                    'border-color': this.p('interactor', 'fill'),
                },
            },
            {
                selector: 'node.InteractorOccurrences.hover',
                css: {
                    'border-width': this.p('global', 'thickness'),
                    'border-color': this.p('global', 'hoverNode'),
                },
            },
            {
                selector: 'node.InteractorOccurrences.select',
                css: {
                    'border-width': this.p('global', 'thickness'),
                    'border-color': this.p('global', 'selectNode'),
                },
            },
            {
                selector: 'node.Interactor',
                css: {
                    label: 'data(displayName)',
                    'font-family': 'Roboto Mono, monospace',
                    // "border-color": this.p('interactor', 'stroke'),
                    'border-width': this.p('global', 'thickness'),
                    'text-wrap': 'ellipsis',
                    'border-color': this.p('interactor', 'fill'),
                    'border-position': 'inside',
                },
            },
            {
                selector: 'node.PhysicalEntity.disease',
                css: {
                    'border-color': this.p('global', 'negativeContrast'),
                    color: this.p('global', 'negativeContrast'),
                    'border-width': this.p('global', 'thickness'),
                },
            },
            {
                selector: 'node.Interactor.disease',
                css: {
                    shape: 'round-hexagon',
                    'background-color': this.p('global', 'negative'),
                    'background-opacity': 0,
                    'border-width': 0,
                    'font-family': 'Roboto Mono, monospace',
                    color: this.p('global', 'onPrimary'),
                    'text-wrap': 'ellipsis',
                    'text-max-width': (node) => node.width() - 40 + 'px',
                },
            },
            {
                selector: 'node.Protein',
                css: {
                    shape: 'round-rectangle',
                    'background-color': this.p('protein', 'fill'),
                },
            },
            {
                selector: 'node.Protein.drug',
                css: {
                    'background-color': this.p('protein', 'drug'),
                },
            },
            {
                selector: 'node.GenomeEncodedEntity',
                css: {
                    shape: 'round-rectangle',
                    'background-opacity': 0,
                    'background-color': this.p('genomeEncodedEntity', 'fill'),
                    'text-margin-y': this.pm('genomeEncodedEntity', 'topRadius', (r) => r / 10),
                    'border-width': 0, // Avoid disease border
                },
            },
            {
                selector: 'node.RNA',
                css: {
                    shape: 'bottom-round-rectangle',
                    'background-color': this.p('rna', 'fill'),
                },
            },
            {
                selector: 'node.RNA.drug',
                css: {
                    'background-color': this.p('rna', 'drug'),
                },
            },
            {
                selector: 'node.Gene',
                css: {
                    shape: 'bottom-round-rectangle',
                    'background-opacity': 0,
                    'background-color': this.p('gene', 'fill'),
                    'bounds-expansion': this.p('gene', 'decorationExtraWidth'),
                    'text-margin-y': this.pm('gene', 'decorationHeight', (h) => h / 2),
                    'border-width': 0, // Avoid disease border
                },
            },
            {
                selector: 'node.Molecule',
                css: {
                    shape: 'round-rectangle',
                    color: this.p('molecule', 'stroke'),
                    'background-color': this.p('molecule', 'fill'),
                    'border-color': this.p('molecule', 'stroke'),
                    'border-width': this.p('global', 'thickness'),
                    // @ts-expect-error
                    'corner-radius': (node) => Math.min(node.data('width'), node.data('height')) / 2,
                },
            },
            {
                selector: 'node.Molecule.drug',
                css: {
                    color: this.p('molecule', 'drug'),
                    'border-color': this.p('molecule', 'drug'),
                },
            },
            {
                selector: 'node.Molecule.Interactor',
                css: {
                    'border-color': this.p('interactor', 'fill'),
                },
            },
            {
                selector: 'node.EntitySet',
                css: {
                    'background-opacity': 0,
                    shape: 'round-rectangle',
                    'border-width': 0, // Avoid disease border
                    'text-max-width': (node) => this.pm('global', 'thickness', (t) => this.pm('entitySet', 'radius', (r) => `${node.width() - 2 * r - 6 * t}px`)),
                },
            },
            {
                selector: 'node.EntitySet.drug',
                css: {
                    'text-max-width': (node) => this.pm('global', 'thickness', (t) => this.pm('entitySet', 'radius', (r) => `${node.width() - 2 * r - 6 * t - 44}px`)),
                },
            },
            {
                selector: 'node.Complex',
                css: {
                    shape: 'cut-rectangle',
                    'text-max-width': (node) => this.pm('global', 'thickness', (t) => node.width() - t * 6 + 'px'),
                    'background-opacity': 0,
                    'border-width': 0, // Avoid disease border
                    // "background-color": this.p("complex", 'fill'),
                    // "width": (node: cytoscape.NodeSingular) => this.pm('global', 'thickness', t => node.data('width') -  2 * t) ,
                    // "height": (node: cytoscape.NodeSingular) => this.pm('global', 'thickness', t => node.data('height') -  2 * t) ,
                    // // @ts-expect-error
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
                },
            },
            {
                selector: 'node.Complex.drug',
                css: {
                    'text-margin-x': 4,
                    'text-max-width': (node) => this.pm('global', 'thickness', (t) => node.width() - t * 6 - 44 + 'px'),
                },
            },
            {
                selector: 'node.Cell',
                css: {
                    'background-opacity': 0,
                    shape: 'round-rectangle',
                    // @ts-expect-error
                    'corner-radius': 999999,
                    'border-width': 0, // Avoid disease border
                    'text-max-width': (node) => this.pm('global', 'thickness', (t) => this.pm('cell', 'thickness', (ct) => node.width() - t * 2 - ct * 2 + 'px')),
                },
            },
            {
                selector: 'node.Pathway',
                css: {
                    'background-color': this.p('pathway', 'fill'),
                    'text-margin-x': 18,
                    'border-color': this.p('pathway', 'stroke'),
                    'border-position': 'inside',
                    'border-width': this.pm('global', 'thickness', (t) => 3 * t),
                },
            },
            {
                selector: 'node.Interacting.Pathway',
                css: {
                    shape: 'rectangle',
                    'text-max-width': (node) => this.pm('global', 'thickness', (t) => `${node.width() - (6 * t + 36) * 2}px`),
                },
            },
            {
                selector: 'node.SUB.Pathway',
                css: {
                    //@ts-expect-error
                    'corner-radius': 99999,
                    shape: 'round-rectangle',
                    'text-max-width': (node) => this.pm('global', 'thickness', (t) => `${node.width() - (6 * t + 36) * 2}px`),
                },
            },
            {
                selector: 'node.Pathway.disease',
                css: {
                    'border-color': this.p('global', 'negativeContrast'),
                    color: this.p('global', 'negativeContrast'),
                },
            },
            {
                selector: 'node.Modification',
                css: {
                    'background-color': this.p('modification', 'fill'),
                    shape: 'round-rectangle',
                },
            },
            {
                selector: 'node.reaction',
                css: {
                    width: this.pm('global', 'thickness', (t) => t * 6),
                    height: this.pm('global', 'thickness', (t) => t * 6),
                    shape: 'round-rectangle',
                    'text-halign': 'center',
                    'text-valign': 'center',
                    'border-width': this.p('global', 'thickness'),
                    'border-color': this.p('global', 'onSurface'),
                    color: this.p('global', 'onSurface'),
                    'background-color': this.p('global', 'surface'),
                },
            },
            {
                selector: 'node.reaction[?displayName]',
                css: {
                    label: 'data(displayName)',
                    'font-weight': 400,
                    'text-valign': 'top',
                    'text-margin-y': -5,
                    'font-size': this.p('font', 'size'),
                },
            },
            {
                selector: 'node.reaction.hover',
                css: {
                    'border-width': this.pm('global', 'thickness', (t) => t * 1),
                    'border-color': this.p('global', 'hoverEdge'),
                },
            },
            {
                selector: 'node.reaction:selected',
                css: {
                    'border-width': this.pm('global', 'thickness', (t) => t * 1.5),
                    'border-color': this.p('global', 'selectEdge'),
                },
            },
            {
                selector: 'node.reaction.flag',
                css: {
                    'outline-width': this.pm('global', 'thickness', (t) => t * 1.5),
                    'outline-color': this.p('global', 'flag'),
                },
            },
            {
                selector: 'node.association',
                css: {
                    shape: 'ellipse',
                    'background-color': this.p('global', 'onSurface'),
                },
            },
            {
                selector: 'node.dissociation',
                css: {
                    shape: 'ellipse',
                    'border-style': 'double',
                    'border-width': this.pm('global', 'thickness', (t) => 3 * t),
                },
            },
            {
                selector: 'node.uncertain',
                css: {
                    label: '?',
                    'text-valign': 'center',
                    'text-margin-y': 0,
                    'font-weight': 600,
                },
            },
            {
                selector: 'node.omitted',
                css: {
                    'background-image': OMMITED_ICON(this.properties),
                    'background-fit': 'cover',
                    'background-height': '100%',
                    'background-width': '100%',
                },
            },
            {
                selector: 'node.loss-of-function',
                css: {
                    'border-style': 'dashed',
                    'border-dash-pattern': this.pm('global', 'thickness', (t) => [t, t * 2]),
                    'border-cap': 'round',
                },
            },
            // {
            //   selector: 'node.RNA.Interactor, node.Protein.Interactor',
            //   css: {
            //     "border-color": this.p('interactor', 'fill'),
            //     "border-width": this.p('global', 'thickness'),
            //
            //   }
            // },
            // {
            //   selector: 'node.Molecule.Interactor',
            //   css: {
            //     "color": this.p("molecule", 'stroke'),
            //     "background-color": this.p("molecule", 'fill'),
            //     "border-color": this.p("interactor", 'stroke'),
            //     "border-width": this.p("global", 'thickness'),
            //     // @ts-expect-error
            //     "corner-radius": (node: cytoscape.NodeSingular) => Math.min(node.data('width'), node.data('height')) / 2,
            //   }
            // },
            {
                selector: 'edge',
                css: {
                    'curve-style': 'straight',
                    'line-cap': 'round',
                    'source-endpoint': 'outside-to-node',
                    'arrow-scale': 1.5,
                    width: this.p('global', 'thickness'),
                    color: this.p('global', 'onSurface'),
                    'line-color': this.p('global', 'onSurface'),
                    'target-arrow-color': this.p('global', 'onSurface'),
                    'mid-source-arrow-color': this.p('global', 'onSurface'),
                    'mid-target-arrow-color': this.p('global', 'onSurface'),
                    'source-arrow-color': this.p('global', 'onSurface'),
                    // @ts-expect-error
                    'source-arrow-width': '100%',
                    'target-arrow-width': '100%',
                    'font-size': this.p('font', 'size'),
                },
            },
            {
                selector: 'edge.disease',
                css: {
                    color: this.p('global', 'negative'),
                    'line-color': this.p('global', 'negative'),
                    'border-color': this.p('global', 'negative'),
                    'target-arrow-color': this.p('global', 'negative'),
                    'source-arrow-color': this.p('global', 'negative'),
                },
            },
            {
                selector: 'edge.hover',
                css: {
                    'line-color': this.p('global', 'hoverEdge'),
                    width: this.pm('global', 'thickness', (t) => t * 1.5),
                    'arrow-scale': 1,
                    'source-arrow-color': this.p('global', 'hoverEdge'),
                    'target-arrow-color': this.p('global', 'hoverEdge'),
                    // @ts-expect-error
                    'source-arrow-width': '50%',
                    'target-arrow-width': '50%',
                    'z-index': 2,
                },
            },
            {
                selector: 'edge:selected',
                css: {
                    'line-color': this.p('global', 'selectEdge'),
                    width: this.pm('global', 'thickness', (t) => t * 2),
                    'arrow-scale': 1,
                    'source-arrow-color': this.p('global', 'selectEdge'),
                    'target-arrow-color': this.p('global', 'selectEdge'),
                    // @ts-expect-error
                    'source-arrow-width': '50%',
                    'target-arrow-width': '50%',
                    'z-index': 3,
                },
            },
            {
                selector: 'edge.consumption',
                css: {
                    'target-endpoint': 'inside-to-node',
                    'source-endpoint': 'outside-to-node',
                },
            },
            {
                selector: 'edge.production',
                css: { 'target-arrow-shape': 'triangle' },
            },
            {
                selector: 'edge.catalysis',
                css: {
                    'target-arrow-shape': 'circle',
                    'target-arrow-fill': 'hollow',
                    'target-arrow-color': this.p('global', 'positive'),
                },
            },
            {
                selector: 'edge.positive-regulation',
                css: {
                    'target-arrow-shape': 'triangle',
                    'target-arrow-fill': 'hollow',
                    'target-arrow-color': this.p('global', 'positive'),
                },
            },
            {
                selector: 'edge.negative-regulation',
                css: {
                    'target-arrow-shape': 'tee',
                    'line-cap': 'butt',
                    'source-endpoint': 'inside-to-node',
                    'target-arrow-color': this.p('global', 'negative'),
                },
            },
            {
                selector: 'edge.set-to-member',
                css: {
                    'target-arrow-shape': 'circle',
                    'line-style': 'dashed',
                    'line-dash-pattern': [6, 10],
                    opacity: 0.5,
                },
            },
            {
                selector: 'edge[stoichiometry > 1]',
                css: {
                    'text-background-color': this.p('global', 'surface'),
                    'text-background-opacity': 1,
                    'text-border-width': this.pm('global', 'thickness', (t) => t / 2),
                    'text-border-opacity': 1,
                    'text-border-color': this.p('global', 'onSurface'),
                    'text-background-shape': 'roundrectangle',
                    'text-background-padding': this.pm('global', 'thickness', (t) => t + 'px'),
                },
            },
            {
                selector: 'edge[stoichiometry > 1].incoming',
                css: {
                    'source-label': 'data(stoichiometry)',
                    'source-text-offset': 30,
                },
            },
            {
                selector: 'edge[stoichiometry > 1].outgoing',
                css: {
                    'target-label': 'data(stoichiometry)',
                    'target-text-offset': 35,
                },
            },
            {
                selector: 'edge.shadow[?color]',
                css: {
                    'underlay-color': 'data(color)',
                    'underlay-padding': this.p('shadow', 'padding'),
                    'underlay-opacity': this.pm('shadow', 'opacity', (o) => o[0][1] / 100),
                },
            },
            {
                selector: 'edge.flag',
                css: {
                    'underlay-color': this.p('global', 'flag'),
                    'underlay-padding': 10,
                    'underlay-opacity': 1,
                },
            },
            // Pointing at a reaction or sub-pathway in the hierarchy. No highlight
            // colour can be told apart from the sub-pathway tints -- they are spread
            // around the whole hue wheel, so green, yellow or any other colour is one
            // of them in some diagram. So everything else fades instead, and the
            // pointed-at element keeps its own colours at full strength, drawn thicker.
            // (The sub-pathway bands are written inline by the zoom handler, so their
            // part of this is done there -- see Interactivity.initZoom.)
            {
                selector: '.hierarchy-dim',
                css: {
                    opacity: 0.2,
                },
            },
            {
                selector: 'edge.hierarchy-hover',
                css: {
                    width: this.pm('global', 'thickness', (t) => t * 3),
                    'z-index': 4,
                },
            },
            {
                selector: 'node.reaction.hierarchy-hover',
                css: {
                    'border-width': this.pm('global', 'thickness', (t) => t * 2),
                    'z-index': 4,
                },
            },
            {
                selector: 'edge[?weights]',
                css: {
                    'curve-style': 'round-segments',
                    'segment-distances': 'data(distances)',
                    'segment-weights': 'data(weights)',
                    'segment-radius': 30,
                    'radius-type': 'influence-radius',
                    // @ts-expect-error
                    'edge-distances': 'endpoints',
                },
            },
            {
                selector: 'edge[?sourceEndpoint]',
                css: {
                    'source-endpoint': 'data(sourceEndpoint)',
                },
            },
            {
                selector: 'edge[?targetEndpoint]',
                css: {
                    'target-endpoint': 'data(targetEndpoint)',
                },
            },
            {
                selector: 'edge[?sourceLabel]',
                css: {
                    'source-label': 'data(sourceLabel)',
                    'source-text-margin-y': -14,
                    'font-weight': 400,
                },
            },
            {
                selector: 'edge.left-label',
                css: {
                    'source-text-margin-x': 5,
                },
            },
            {
                selector: 'edge.right-label',
                css: {
                    'source-text-margin-x': -5,
                },
            },
            {
                selector: 'edge[?label]',
                css: {
                    label: 'data(label)',
                    'text-margin-y': 14,
                    'font-weight': 400,
                },
            },
            {
                selector: 'edge.Interactor',
                css: {
                    'line-color': this.p('interactor', 'stroke'),
                    'line-style': 'dashed',
                    'line-dash-pattern': [1, 8],
                },
            },
            {
                selector: 'edge.Interactor.disease',
                css: {
                    'line-color': this.p('global', 'negativeContrast'),
                },
            },
            {
                selector: 'edge.Interactor.hover',
                css: {
                    'line-color': this.p('global', 'hoverEdge'),
                },
            },
            {
                selector: 'edge[?sourceOffset]',
                css: {
                    // @ts-expect-error
                    'source-text-offset': 'data(sourceOffset)',
                },
            },
            {
                selector: '[?labelColor]',
                css: {
                    color: (e) => extract(this.p('global', e.data('labelColor'))),
                },
            },
            {
                selector: 'node.debug',
                css: {
                    label: 'data(id)',
                    'text-outline-width': 4,
                    'text-outline-color': 'black',
                    'text-outline-opacity': 1,
                    color: 'white',
                },
            },
            {
                selector: '[?exp]',
                css: {
                    color: this.p('global', 'surface'),
                    'text-outline-width': 2,
                    'text-outline-color': this.p('global', 'onSurface'),
                    'text-outline-opacity': 1,
                },
            },
            {
                selector: '[?exp].Molecule',
                css: {
                    'background-color': this.p('global', 'onSurface'),
                },
            },
            {
                selector: 'node.Legend.Label',
                css: {
                    label: 'data(displayName)',
                    'text-halign': 'center',
                    'text-valign': 'center',
                    'font-size': 24,
                    'font-weight': 400,
                    'background-opacity': 0,
                    color: this.p('global', 'onSurface'),
                },
            },
            {
                selector: 'node.Legend.Placeholder',
                css: {
                    'background-opacity': 0,
                    'border-opacity': 0,
                    width: 20,
                    height: 20,
                    shape: 'rectangle',
                },
            },
            {
                selector: 'node.Legend.Placeholder[?displayName]',
                css: {
                    label: 'data(displayName)',
                    'font-size': this.p('font', 'size'),
                    'font-weight': 400,
                },
            },
            {
                selector: '.trivial',
                css: {
                    opacity: 0,
                },
            },
            // Flagging switches trivial molecules from "fade in as you zoom" to
            // "always visible", and it does that by detaching the zoom handler. That
            // leaves nothing to recompute their opacity, so their visibility cannot
            // rest on an inline style -- anything that drops it strands them at the
            // rule above, invisible however far the user zooms in, while their
            // chemical structures carry on being drawn by a different handler. A
            // class survives restyling, and this rule follows .trivial so it wins.
            {
                selector: '.trivial.always-visible',
                css: {
                    opacity: 1,
                },
            },
        ];
    }
    clearCache() {
        this.imageBuilder.cache.clear();
        clearDrawersCache();
    }
    update(cy) {
        this.clearCache();
        cy.style(this.getStyleSheet());
        // The graph asked for: one Style is bound to several, and this.cy and
        // this.interactivity are only the last of them.
        this.initSubPathwayColors(cy);
        interactivityOf(cy)?.triggerZoom();
    }
    loadAnalysis(cy, palette) {
        this.currentPalette = palette;
        resetGradients();
        this.update(cy);
    }
}

var types = /*#__PURE__*/Object.freeze({
    __proto__: null
});

/*
 * Public API Surface of reactome-cytoscape-style
 */

/**
 * Generated bundle index. Do not edit.
 */

export { INTERACTOR_BADGE_MIN_ZOOM, Interactivity, ReactomeEvent, ReactomeEventTypes, Style, types as Types, extract, interactivityOf, propertyExtractor };
//# sourceMappingURL=ngx-reactome-cytoscape-style.mjs.map
