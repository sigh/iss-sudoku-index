// Title: Noah's Ark
// Author: Mac T.
// Video: https://www.youtube.com/watch?v=g-xZof6aUII
// Source: https://tinyurl.com/NoahsArkSudoku

// Normal sudoku rules apply. Digits separated by a white dot are consecutive
// (WhiteDot). On a black dot, one digit is double the other (BlackDot). Every
// box has zero or more unlabelled two-cell cages, each entirely inside one
// box; within a box, all of that box's cages sum to the same (unstated)
// total, and no two boxes share their total. Box 4 (R4-R6,C1-C3) has no
// cages, so it carries no total to compare -- it is simply left out of the
// cross-box distinctness group. A cage's own two digits are already forced
// distinct by its box's built-in all-different, so no separate distinctness
// constraint is added per cage.
//
// Cage totals are not given, so each box's total is modelled as an auxiliary
// Var: every cage in that box is tied to the box's Var by a coefficient Sum
// (forcing all of a box's cages to the same total), and the Vars of the 8
// boxes that have cages are then required all-different. A two-digit cage
// sums 3-17, which combined with the 1-9 grid digits would need 17 distinct
// values -- one past ISS's MAX_SIZE=16 value-count limit. Each Var instead
// holds (cage total - 2), range 1-15: an affine shift, so AllDifferent on
// the shifted Vars is exactly AllDifferent on the real totals. The grid
// Shape only needs widening to 15 for that Var domain; the 81 real grid
// cells are restricted back to 1-9 via one Replicate template.

const TOTAL_OFFSET = 2; // Var holds (cageTotal - TOTAL_OFFSET); min total 3 -> Var 1.
const shape = new Shape('9x9', 15);
const graph = cellGraph(shape);

// Cages, grouped per box (source: `killercage` array). Box 4 has none.
const cagesByBox = [
  [['R1C1', 'R2C1'], ['R2C2', 'R3C2'], ['R1C3', 'R2C3']], // box 1
  [['R1C4', 'R2C4'], ['R1C5', 'R2C5'], ['R1C6', 'R2C6'], ['R3C5', 'R3C6']], // box 2
  [['R2C8', 'R2C9']], // box 3
  [], // box 4 -- no cages
  [['R6C5', 'R6C6'], ['R4C6', 'R5C6'], ['R4C4', 'R4C5'], ['R5C4', 'R6C4']], // box 5
  [['R5C8', 'R6C8'], ['R5C9', 'R6C9'], ['R4C8', 'R4C9']], // box 6
  [['R7C2', 'R7C3'], ['R7C1', 'R8C1'], ['R9C1', 'R9C2']], // box 7
  [['R7C4', 'R7C5'], ['R8C4', 'R8C5'], ['R9C4', 'R9C5'], ['R8C6', 'R9C6']], // box 8
  [['R7C7', 'R7C8'], ['R7C9', 'R8C9'], ['R8C8', 'R9C8']], // box 9
];
const boxesWithCages = cagesByBox
  .map((cages, index) => ({ cages, index }))
  .filter(({ cages }) => cages.length > 0);

// One Var per box that has cages, holding that box's common cage total.
const boxTotal = new Var('BT', 'box cage total', boxesWithCages.length);

const boxTotalConstraints = boxesWithCages.flatMap(({ cages }, slot) => {
  const totalVar = boxTotal.cell(slot + 1);
  return cages.map(
    // a + b - totalVar = TOTAL_OFFSET, i.e. totalVar = a + b - TOTAL_OFFSET.
    ([a, b]) => new Sum(TOTAL_OFFSET, a, b, [totalVar, -1]),
  );
});

return [
  shape,
  // Widening is only for the box-total Vars; puzzle digits stay 1-9.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  boxTotal,
  ...boxTotalConstraints,
  new AllDifferent(...boxTotal.cells()),
  // Kropki dots (source: `difference`/`ratio` arrays, no explicit `value` on
  // either -- f-puzzles default: difference=1 (white dot), ratio=2 (black dot)).
  new WhiteDot('R7C5', 'R7C6'),
  new WhiteDot('R9C5', 'R9C6'),
  new BlackDot('R3C4', 'R3C5'),
];
