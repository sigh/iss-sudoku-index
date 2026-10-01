// Title: Zero Sum
// Author: Invi
// Video: https://www.youtube.com/watch?v=eEFfs2AV39o
// Source: https://sudokupad.app/9iskh68h4z

// Rules encoded:
// - Digits 0-9. Each of 1-9 appears at most once in any row, column or 3x3
//   box; 0 may repeat.
// - Every row, column and box sums to the total number of zeroes in the grid.
// - Box borders divide the blue line into segments with equal sums; separate
//   visits to the same box are separate segments.
// - X: the two cells sum to 10.
// - Arrows between cells point to the smaller digit.
//
// The grid is Raw because 0 repeats within houses: the houses are built
// explicitly below.

const shape = new Shape('9x9', '0-9', 'Raw');
const graph = cellGraph(shape);

const boxes = [1, 4, 7].flatMap(r => [1, 4, 7].map(c =>
  graph.block(makeCellId(r, c), 3, 3)));
const houses = [...graph.rows(), ...graph.columns(), ...boxes];

// --- 1-9 at most once per house: any two cells differ unless one is 0.
const distinctNonZeroKey = PairX.fnToKey((a, b) => a === 0 || a !== b, shape);
const houseDistinct = houses.map(
  house => new PairX(distinctNonZeroKey, '1-9 at most once', ...house));

// --- Zero count. Each grid cell has a paired flag Var: 1 if the cell is 0,
// else 0. The total zero count Z is held in two Var digits, Z = 10*VZ1 + VZ2,
// since it can exceed 9.
const zeroFlag = graph.makeOverlay('VF');
const flagKey = Pair.fnToKey((digit, flag) => flag === (digit === 0 ? 1 : 0), shape);
const flags = graph.cells().map(
  cell => new Pair(flagKey, 'zero flag', cell, zeroFlag.at(cell)));
const zeroTotal = new Var('Z', 'zero count (tens, units)', 2);
const [zTens, zUnits] = zeroTotal.cells();
const minusZ = [[zTens, -10], [zUnits, -1]];
const zeroCount = new Sum(0, ...zeroFlag.at(graph.cells()), ...minusZ);
const houseSums = houses.map(house => new Sum(0, ...house, ...minusZ));

// --- Blue line: cell centres along the two drawn blue strokes, joined where
// they meet at R3C2 (the first stroke's final R3C2->R4C1 step retraces an
// edge it already drew).
const blueLine = [
  'R4C4', 'R4C5', 'R3C5', 'R2C5', 'R3C6', 'R3C7', 'R2C7', 'R2C6', 'R1C6',
  'R1C7', 'R1C8', 'R2C8', 'R3C9', 'R3C8', 'R4C8', 'R4C7', 'R4C6', 'R5C6',
  'R5C7', 'R5C8', 'R6C7', 'R6C6', 'R7C7', 'R6C8', 'R6C9', 'R7C9', 'R8C9',
  'R9C8', 'R9C7', 'R8C6', 'R7C6', 'R7C5', 'R6C5', 'R5C4', 'R5C3', 'R6C3',
  'R7C4', 'R8C5', 'R8C4', 'R8C3', 'R9C2', 'R8C1', 'R7C1', 'R8C2', 'R7C2',
  'R6C2', 'R5C2', 'R4C1', 'R3C2', 'R2C2', 'R1C2', 'R1C3', 'R2C3', 'R3C3',
  'R4C2',
];
// Split the walk into maximal runs of consecutive cells in the same 3x3 box.
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};
const segments = [];
blueLine.forEach((cell, i) => {
  if (i > 0 && boxOf(cell) === boxOf(blueLine[i - 1])) {
    segments[segments.length - 1].push(cell);
  } else {
    segments.push([cell]);
  }
});
const blueSegments = new EqualSum(...segments);

// --- X on the R1C5|R2C5 border.
const xClue = new X('R1C5', 'R2C5');

// --- Arrows (larger cell first): R6C3 > R5C3, R7C6 > R8C6, R2C1 > R1C1.
const arrows = [
  ['R6C3', 'R5C3'],
  ['R7C6', 'R8C6'],
  ['R2C1', 'R1C1'],
].map(([larger, smaller]) => new GreaterThan(larger, smaller));

return [
  shape,
  zeroFlag.toVar('zero flags'),
  zeroTotal,
  ...houseDistinct,
  ...flags,
  zeroCount,
  ...houseSums,
  blueSegments,
  xClue,
  ...arrows,
];
