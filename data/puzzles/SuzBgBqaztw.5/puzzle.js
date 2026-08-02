// Title: October 5, 2023: Matryoshka Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=SuzBgBqaztw
// Source: https://tinyurl.com/y5srv6e5

// Four overlapping 4x4, 5x5, 6x6, and 7x7 Sudokus use digits 1 through their
// respective sizes.  Rows, columns, and the outlined regions are all distinct.
// VS is the source canvas: its shared cells let the four grids use one value.
const S = new Var('S', '19x7 source canvas', '19x7');
const cell = (r, c) => S.cell(r, c);
const grid = (r0, c0, n) =>
  Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => cell(r0 + r, c0 + c)));
const houses = (g) => [
  ...g.map(row => new AllDifferent(...row)),
  ...g[0].map((_, c) => new AllDifferent(...g.map(row => row[c]))),
];

const four = grid(1, 2, 4);
const five = grid(4, 2, 5);
const six = grid(8, 1, 6);
const seven = grid(13, 1, 7);

// The red outlined paths draw these five 5-cell regions.
const regions5 = [
  ['R4C2', 'R4C3', 'R5C2', 'R5C3', 'R6C3'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R6C4'],
  ['R5C5', 'R5C6', 'R6C5', 'R6C6', 'R7C6'],
  ['R6C2', 'R7C2', 'R7C3', 'R8C2', 'R8C3'],
  ['R7C4', 'R7C5', 'R8C4', 'R8C5', 'R8C6'],
].map(region => region.map(id => cell(...id.match(/\d+/g).map(Number))));

// The red outlined paths draw these seven 7-cell regions.
const regions7 = [
  ['R13C1', 'R13C2', 'R13C3', 'R14C1', 'R14C2', 'R15C1', 'R16C1'],
  ['R13C4', 'R13C5', 'R13C6', 'R13C7', 'R14C6', 'R14C7', 'R15C7'],
  ['R14C3', 'R14C4', 'R14C5', 'R15C2', 'R15C3', 'R15C4', 'R15C5'],
  ['R15C6', 'R16C2', 'R16C3', 'R16C4', 'R16C5', 'R16C6', 'R17C2'],
  ['R16C7', 'R17C7', 'R18C6', 'R18C7', 'R19C5', 'R19C6', 'R19C7'],
  ['R17C1', 'R18C1', 'R18C2', 'R19C1', 'R19C2', 'R19C3', 'R19C4'],
  ['R17C3', 'R17C4', 'R17C5', 'R17C6', 'R18C3', 'R18C4', 'R18C5'],
].map(region => region.map(id => cell(...id.match(/\d+/g).map(Number))));

const regularRegions = (g, h, w) =>
  Array.from({ length: g.length / h }, (_, br) =>
    Array.from({ length: g.length / w }, (_, bc) =>
      Array.from({ length: h }, (_, r) =>
        Array.from({ length: w }, (_, c) => g[br * h + r][bc * w + c])).flat())).flat();
const gridLayers = [four, five, six, seven];
const active = new Map();
for (const g of gridLayers)
  for (const id of g.flat())
    active.set(id, Math.min(active.get(id) || g.length, g.length));
// In an overlap, the smaller grid's alphabet is the cell's available range.
const domains = [...active].map(([id, n]) =>
  new Given(id, ...Array.from({ length: n }, (_, i) => i + 1)));
const padding = Array.from({ length: 19 }, (_, r) =>
  Array.from({ length: 7 }, (_, c) => cell(r + 1, c + 1))
    .filter(id => !active.has(id))
    .map(id => new Given(id, 1))).flat();
const givens = [
  [1, 2, 1], [1, 4, 2], [4, 3, 3], [4, 5, 4], [7, 4, 4], [7, 6, 1],
  [10, 2, 3], [10, 4, 2], [10, 6, 4], [13, 1, 4], [13, 3, 1],
  [13, 5, 5], [13, 7, 7], [16, 2, 7], [16, 4, 2], [16, 6, 4],
  [19, 1, 3], [19, 3, 6], [19, 5, 4], [19, 7, 2],
].map(([r, c, value]) => new Given(cell(r, c), value));

return [
  // The 1x1 carrier grid is unused; fix it so it does not add a model-only symmetry.
  new Shape('1x1', 7), new NoBoxes(), new Given('R1C1', 1), S,
  ...padding, ...domains, ...givens,
  ...houses(four), ...regularRegions(four, 2, 2).map(r => new AllDifferent(...r)),
  ...houses(five), ...regions5.map(r => new AllDifferent(...r)),
  ...houses(six), ...regularRegions(six, 2, 3).map(r => new AllDifferent(...r)),
  ...houses(seven), ...regions7.map(r => new AllDifferent(...r)),
];
