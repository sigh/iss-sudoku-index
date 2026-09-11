// Title: 4x4??
// Author: mellowrobinson
// Video: https://www.youtube.com/watch?v=k33tuVb60r0
// Source: https://sudokupad.app/bnmfo36siz

// 8x8 Latin square (digits 1-8, rows and columns, no boxes); small white
// dots are consecutive digits; the two large white circles are quadruple
// clues (1,2,3,4 and 5,6,7,8). The sixteen 2x2 blocks are the "large
// cells" of a 4x4 sudoku: each block's four digits are distinct, its value
// is their sum, the sixteen values are drawn from one set of four values
// with no repeat in any 4x4 row, column or 2x2 box of blocks (the thick
// quadrants), the two large circles are also consecutive-value dots
// between the blocks they straddle, and the 57 cage covers three blocks
// whose values are distinct and sum to 57.
//
// Block sums lie in 10..26 (four distinct digits from 1-8), 17 states, one
// more than a cell can hold, so each of the four set values S1..S4 is
// held as 10*T + U over two Var cells (T tens, U units). An index Var per
// block names which set value it takes; the 4x4 sudoku is played on the
// indices, which is equivalent because the set values are made strictly
// increasing (S1 < S2 < S3 < S4) -- that ordering also pins the labelling
// symmetry the index layer introduces. The value range is widened to 0-15
// for those Var cells and the grid is restricted back to 1-8.

const shape = new Shape('8x8', '0-15');
const graph = cellGraph(shape);

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8];
const restrictGrid = graph.makeReplicate(new Given('R1C1', ...DIGITS));

// Large cell (r, c), r and c in 1..4, is the 2x2 block at R(2r-1)C(2c-1).
const block = (r, c) => graph.block(makeCellId(2 * r - 1, 2 * c - 1), 2, 2);
const RC = [1, 2, 3, 4];

// Index of the set value each block takes: a 4x4 sudoku over 1..4.
const index = new Var('I', 'set-value index per 2x2 block', '4x4');
const indexAt = (r, c) => index.cell(r, c);
const indexDomain = index.cells().map(cell => new Given(cell, 1, 2, 3, 4));
const indexRows = RC.map(r => new AllDifferent(...RC.map(c => indexAt(r, c))));
const indexCols = RC.map(c => new AllDifferent(...RC.map(r => indexAt(r, c))));
const indexBoxes = [1, 3].flatMap(r0 => [1, 3].map(c0 => new AllDifferent(
  indexAt(r0, c0), indexAt(r0, c0 + 1), indexAt(r0 + 1, c0), indexAt(r0 + 1, c0 + 1))));

// The set of four values: S_i = 10*T_i + U_i, T in 1..2 and U in 0..9
// (values 10..26), with U held to the full base range so the split is
// unique.
const tens = new Var('T', 'set value tens digit', 4);
const units = new Var('U', 'set value units digit', 4);
const valueDomain = [
  ...tens.cells().map(cell => new Given(cell, 1, 2)),
  ...units.cells().map(cell => new Given(cell, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9)),
];
// S_(i+1) - S_i = 1 + gap_i with gap_i in 0..15: strictly increasing, so
// the four values are distinct and the labelling is canonical. The gap is
// at most 16 - 1 = 15, which the widened range holds exactly.
const gaps = new Var('G', 'gap between consecutive set values, minus 1', 3);
const ordering = [1, 2, 3].map(i => new Sum(1,
  [tens.cell(i + 1), 10], [units.cell(i + 1), 1],
  [tens.cell(i), -10], [units.cell(i), -1],
  [gaps.cell(i), -1]));

// Each block's digit sum equals the set value its index names.
const blockValues = RC.flatMap(r => RC.map(c => new Or(
  [1, 2, 3, 4].map(i => new And([
    new Given(indexAt(r, c), i),
    new Sum(0, ...block(r, c), [tens.cell(i), -10], [units.cell(i), -1]),
  ])))));

// Consecutive block values: sum(A) - sum(B) = 1 or sum(B) - sum(A) = 1.
const consecutiveBlocks = (a, b) => new Or([
  new Sum(1, ...a, ...b.map(cell => [cell, -1])),
  new Sum(1, ...b, ...a.map(cell => [cell, -1])),
]);

// Large white circles: quadruple at the corner's top-left cell, and the
// consecutive-value dot between the two blocks the circle straddles.
const quads = [
  new Quad('R1C2', 1, 2, 3, 4),
  new Quad('R2C5', 5, 6, 7, 8),
];
const largeDots = [
  consecutiveBlocks(block(1, 1), block(1, 2)),
  consecutiveBlocks(block(1, 3), block(2, 3)),
];

// Small white dots, as drawn on cell edges.
const smallDots = [
  ['R2C4', 'R2C5'], ['R3C6', 'R4C6'], ['R4C5', 'R4C6'], ['R4C2', 'R5C2'],
  ['R5C3', 'R6C3'], ['R6C3', 'R7C3'], ['R5C6', 'R5C7'], ['R5C8', 'R6C8'],
  ['R6C7', 'R6C8'], ['R7C5', 'R7C6'], ['R7C6', 'R8C6'],
].map(cells => new WhiteDot(...cells));

// The 57 cage (dashed outline, total at R1C3): blocks (1,2), (1,3), (2,3).
// Its values are distinct (distinct indices) and sum to 57, which is the
// sum of its twelve digits.
const cageBlocks = [[1, 2], [1, 3], [2, 3]];
const cage = [
  new AllDifferent(...cageBlocks.map(([r, c]) => indexAt(r, c))),
  new Sum(57, ...cageBlocks.flatMap(([r, c]) => block(r, c))),
];

return [
  shape,
  restrictGrid,
  new RegionSize(4),  // the 2x2 blocks: four distinct digits each
  new Given('R7C8', 6),
  index, tens, units, gaps,
  ...indexDomain, ...indexRows, ...indexCols, ...indexBoxes,
  ...valueDomain, ...ordering,
  ...blockValues,
  ...quads, ...largeDots, ...smallDots,
  ...cage,
];
