// Title: Mystery City Sandwich
// Author: Molly Boodey
// Video: https://www.youtube.com/watch?v=rmTibORL4EM
// Source: https://sudokupad.app/392kqguq3f

// Rules encoded:
// - Normal sudoku.
// - Every outside clue is an X-sum, a skyscraper or a sandwich clue.
// - Its type is set by the grid digit next to it: each digit 1-9 has one type,
//   and every clue whose adjacent (outermost) digit is d takes d's type.
// No rule limits how many digits take each type, so none is imposed.

// Type of each digit d is held in Var VTd: 1 = X-sum, 2 = skyscraper,
// 3 = sandwich.
const TYPE = { XSUM: 1, SKYSCRAPER: 2, SANDWICH: 3 };
const typeVar = new Var('VT', 'clue type of digit', 9);

// Outside clues, read off the circles around the frame, in row/column order.
const TOP = [5, 2, 24, 14, 15, 2, 41, 14, 11];
const BOTTOM = [24, 3, 24, 0, 12, 36, 28, 2, 2];
const LEFT = [3, 3, 38, 17, 11, 19, 2, 13, 20];
const RIGHT = [15, 3, 2, 17, 11, 32, 34, 17, 2];

// Each lane lists its cells starting from the clue's side; the first cell is
// the outermost grid digit next to the clue.
const shape = new Shape('9x9');
const geometry = cellGeometry(shape);
const N = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const row = r => N.map(c => makeCellId(r, c));
const col = c => N.map(r => makeCellId(r, c));
const lanes = [
  ...TOP.map((v, i) => ({ v, cells: col(i + 1) })),
  ...BOTTOM.map((v, i) => ({ v, cells: col(i + 1).reverse() })),
  ...LEFT.map((v, i) => ({ v, cells: row(i + 1) })),
  ...RIGHT.map((v, i) => ({ v, cells: row(i + 1).reverse() })),
];

// Reads [edge, VT1..VT9]: matches when VT at index (edge digit) equals t.
const edgeHasType = (edge, t) => new Regex(
  [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map(d => `${d}${'.'.repeat(d - 1)}${t}${'.'.repeat(9 - d)}`)
    .join('|'),
  edge, ...typeVar.cells());

// A clue of 0 can be neither an X-sum (X >= 1 digits sum to >= 1) nor a
// skyscraper count (the nearest building is always visible); ISS rejects 0
// for both classes, so those branches are left out for a 0 clue.
// A sandwich clue reads the same from either end of its line.
const laneClue = ({ v, cells }) => new Or([
  ...(v > 0 ? [
    new And([XSum.fromCells(v, cells, geometry),
      edgeHasType(cells[0], TYPE.XSUM)]),
    new And([Skyscraper.fromCells(v, cells, geometry),
      edgeHasType(cells[0], TYPE.SKYSCRAPER)]),
  ] : []),
  new And([Sandwich.fromCells(v, cells, geometry),
    edgeHasType(cells[0], TYPE.SANDWICH)]),
]);

return [
  shape,
  typeVar,
  ...typeVar.cells().map(cell => new Given(cell, 1, 2, 3)),
  ...lanes.map(laneClue),
];
