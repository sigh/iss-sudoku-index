// Title: May 9, 2022: Equal Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=G9Ve4kxxzjs
// Source: https://tinyurl.com/2czz5ubz

// Normal sudoku rules apply. Digits may not repeat within a cage (AllDifferent
// per cage; no cage carries a printed total, so no Cage/Sum total is added).
// Within each cage, the sum of the even digits equals the sum of the odd
// digits.
//
// Cages transcribed from the payload's `cage` array (10 entries, none with a
// `value` field).
const CAGES = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1'],
  ['R2C3', 'R3C2', 'R3C3'],
  ['R1C6', 'R1C7', 'R1C8', 'R2C8', 'R3C8'],
  ['R2C6', 'R3C6', 'R3C7'],
  ['R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R7C2', 'R8C2', 'R9C2', 'R9C3', 'R9C4'],
  ['R7C3', 'R7C4', 'R8C4'],
  ['R7C7', 'R7C8', 'R8C7'],
  ['R4C3', 'R5C3', 'R6C2', 'R6C3', 'R6C4'],
  ['R4C6', 'R4C7', 'R4C8', 'R5C7', 'R6C7'],
];

// Givens transcribed from the payload's `grid` array.
const GIVENS = {
  R1C1: 6, R1C3: 8, R1C6: 2, R1C8: 4,
  R3C1: 2, R3C3: 3, R3C6: 1, R3C8: 8,
  R5C3: 5, R5C7: 3,
  R7C2: 6, R7C4: 3, R7C7: 1, R7C9: 2,
  R9C2: 8, R9C4: 2, R9C7: 6, R9C9: 4,
};

// "Sum of even digits == sum of odd digits" is a value-conditional sum, not a
// fixed cell partition, so it needs a per-cell modifier overlay: one Var per
// cage cell holding that cell's digit when the digit is even, else 0. Zero
// has to be a legal value for the overlay, so the shape is widened to 0-9
// and every real grid cell is pinned back to 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const cageCells = CAGES.flat();

const evenPart = graph.makeOverlay('VE', cageCells);
// (digit, extra): extra mirrors digit when digit is even, else extra is 0.
const isEvenPart = Pair.fnToKey(
  (digit, extra) => (digit % 2 === 0 && extra === digit) || (digit % 2 === 1 && extra === 0),
  shape);

// sum(cage digits) = sum(odd digits) + sum(even digits)
//                  = sum(odd digits) + sum(evenPart)
// The rule requires sum(odd digits) == sum(even digits) == sum(evenPart), so
// sum(cage digits) == 2 * sum(evenPart) is the equivalent linear equation.
const equalParitySum = (cells) => new Sum(
  0, ...cells, ...evenPart.at(cells).map(cell => [cell, -2]));

return [
  shape,
  evenPart.toVar('even part'),
  // Stamp the widened 0-9 domain back down to 1-9 on every real grid cell;
  // the specific givens below intersect it down further since Given
  // constraints on the same cell merge by intersection.
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...Object.entries(GIVENS).map(([cell, value]) => new Given(cell, value)),
  ...cageCells.map(cell => new Pair(isEvenPart, 'even part', cell, evenPart.at(cell))),
  ...CAGES.flatMap(cells => [new AllDifferent(...cells), equalParitySum(cells)]),
];
