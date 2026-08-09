// Title: Then one foggy Christmas Eve
// Author: Panthera
// Video: https://www.youtube.com/watch?v=0H8aV33I3ZM
// Source: https://sudokupad.app/b3j6kd3mzp

// Rules encoded: digits 1-6 occur twice in each row, column, and drawn region.
// White snow dots (native WhiteDot) mark consecutive digits. The coloured
// Japanese-sum run clues are omitted; their shading is not represented in
// this partial model.
//
// Rows/columns repeat digits, so the grid is Raw: no implicit constraints.
const shape = new Shape('12x12', '1-6', 'Raw');
const graph = cellGraph(shape);
const TWICE_EACH = '1_1_2_2_3_3_4_4_5_5_6_6';

// The letters are the twelve irregular 12-cell regions drawn on the active board.
const REGION_MAP = `
ABBBCCDDEEEF
ABBBCCDDEEEF
ABBBGCDHEEEF
ABBBGCDHEEEF
AGGGGCDHHHHF
AGGGGCDHHHHF
AAAGGCDHHFFF
IIAAACDFFFJJ
IIIICCDDJJJJ
IIIIIIJJJJJJ
KKKKKKLLLLLL
KKKKKKLLLLLL
`.replaceAll(/\s/g, '');
const boardCells = graph.cells();
const cell = (r, c) => boardCells[r * 12 + c];
const rows = Array.from({ length: 12 }, (_, r) =>
  Array.from({ length: 12 }, (_, c) => cell(r, c)));
const columns = Array.from({ length: 12 }, (_, c) =>
  Array.from({ length: 12 }, (_, r) => cell(r, c)));
const regions = 'ABCDEFGHIJKL'.split('').map(letter =>
  REGION_MAP.split('').flatMap((value, index) =>
    value === letter ? [cell(Math.floor(index / 12), index % 12)] : []));

// White snow dots drawn on seven active-grid edges (adjacent cell pairs).
const snowDots = [
  [[1, 3], [1, 4]], [[1, 10], [1, 11]], [[2, 7], [2, 8]],
  [[10, 6], [10, 7]], [[10, 9], [10, 10]], [[7, 11], [8, 11]],
  [[8, 0], [9, 0]],
].map(([a, b]) => new WhiteDot(cell(...a), cell(...b)));

return [
  shape,
  ...rows.map(cells => new ContainExact(TWICE_EACH, ...cells)),
  ...columns.map(cells => new ContainExact(TWICE_EACH, ...cells)),
  ...regions.map(cells => new ContainExact(TWICE_EACH, ...cells)),
  ...snowDots,
];
