import { describe, expect, it } from 'vitest';
import cytoscape from 'cytoscape';
import { expressionData, listData, numberData, textData } from './element-data';

function anElement(data: Record<string, unknown>) {
  const cy = cytoscape({ headless: true, elements: [{ data: { id: 'e', ...data } }] });
  return cy.getElementById('e');
}

describe('element data', () => {
  const element = anElement({ name: 'TP53', size: 40, list: [1, 'a'], none: null });

  it('reads text as text, and anything else as absent', () => {
    expect(textData(element, 'name')).toBe('TP53');
    expect(textData(element, 'size')).toBeUndefined();
    expect(textData(element, 'missing')).toBeUndefined();
  });

  // A number written as text is not a number: what the diagram writes for a
  // size or an id is a number.
  it('reads a number as a number, and anything else as absent', () => {
    expect(numberData(element, 'size')).toBe(40);
    expect(numberData(anElement({ size: '40' }), 'size')).toBeUndefined();
    expect(numberData(element, 'none')).toBeUndefined();
  });

  it('reads a list as a list, and anything else as absent', () => {
    expect(listData(element, 'list')).toEqual([1, 'a']);
    expect(listData(element, 'name')).toBeUndefined();
  });
});

describe("a node's analysis values", () => {
  it('reads values, none and shares as they are written', () => {
    // As WebsiteAngular writes them: an entity's, an interactor's without
    // values, and a pathway's found and not found entities.
    expect(expressionData(anElement({ exp: [0.2, undefined, 0.8] }))).toEqual([
      0.2,
      undefined,
      0.8,
    ]);
    expect(expressionData(anElement({ exp: [undefined] }))).toEqual([undefined]);
    expect(
      expressionData(
        anElement({
          exp: [
            [0.01, 3],
            [undefined, 7],
          ],
        })
      )
    ).toEqual([
      [0.01, 3],
      [undefined, 7],
    ]);
  });

  it('reads an entry that is not a value as none, and no list as absent', () => {
    expect(expressionData(anElement({ exp: ['0.2', [1], [1, 2, 3], null] }))).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(expressionData(anElement({ exp: 0.2 }))).toBeUndefined();
    expect(expressionData(anElement({}))).toBeUndefined();
  });
});
