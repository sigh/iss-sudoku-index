// Title: Confetti Sums Killer Sudoku
// Author: Jesper Josefsson
// Video: https://www.youtube.com/watch?v=p1UWaHhZEkI
// Source: https://app.crackingthecryptic.com/sudoku/966jBbp2Hr

// Rules encoded:
// - Normal sudoku: rows, columns and boxes each hold 1-9 once. The grid uses a
//   widened value range to host the auxiliary sum-tracking Vars below; the 81
//   grid cells are stamped back down to 1-9 with a Given.
// - Cages: digits sum to the cage's printed total (Cage) when a total is
//   printed; digits within a cage never repeat. Three cages carry no
//   printed total -- those are all-different only (no sum).
// - Dot rule (video description): every orthogonally adjacent pair whose sum is
//   A or B carries a dot -- white = sum is always A, black = sum is always B,
//   grey = sum is A or B -- and EVERY such pair is marked ("IN ALL CASES").
//   A and B are unknown, distinct, and are themselves part of the solution.
//   Modeled with two single-cell Vars VA, VB (the shared sum values): each
//   dot ties its two grid cells' sum to VA and/or VB with a coefficient `Sum`
//   equation. AllDifferent(VA, VB) enforces A != B. The exhaustiveness clause
//   is enforced on every *undotted* orthogonal pair: a per-edge Var VS holds
//   that pair's sum (tied by the same kind of Sum equation) and
//   AllDifferent(VS, VA, VB) forces the pair's sum to differ from both A and B
//   -- the un-drawn-dot condition.
//   Any two orthogonally-adjacent grid cells sit in the same row or column, so
//   sudoku already forces them distinct: their sum ranges over [1+2, 8+9] =
//   [3, 17], one value past this solver's 16-value cap on a single cell's
//   range. VA, VB and VS instead hold (sum - 2), range [1, 15]; every
//   equation that reads one of them folds the same +2 back in via the Sum's
//   own target, so the shift is applied consistently everywhere the true
//   value is needed.

const graph = cellGraph('9x9');

// Cages, as drawn. Untotaled cages (no printed total) are all-different only
// (the rule text's sum clause only applies "if given").
const totaledCages = [
  { total: 10, cells: ['R1C6', 'R2C6', 'R3C6'] },
  { total: 10, cells: ['R4C1', 'R4C2', 'R4C3'] },
  { total: 11, cells: ['R4C4', 'R3C4', 'R2C4'] },
];
const untotaledCages = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5'],
  ['R4C9', 'R4C8', 'R4C7', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R6C4', 'R9C4', 'R8C4', 'R7C4'],
];

// Dots, as drawn (edge-sized rounded marks between two orthogonally adjacent
// cells). Colour -> meaning per the rules text: white fill = sum always A,
// black fill = sum always B, grey fill = sum is A or B.
const whiteDots = [
  ['R2C4', 'R3C4'],
  ['R4C2', 'R4C3'],
  ['R6C6', 'R7C6'],
  ['R6C9', 'R7C9'],
];
const blackDots = [
  ['R3C6', 'R4C6'],
  ['R8C9', 'R9C9'],
];
const greyDots = [
  ['R2C1', 'R2C2'],
  ['R8C7', 'R9C7'],
  ['R8C8', 'R9C8'],
];
const allDots = [...whiteDots, ...blackDots, ...greyDots];

// Every orthogonally adjacent pair in the grid, computed from the graph (not
// hand-enumerated), so the undotted set below is exactly "all adjacencies
// minus the drawn dots".
const allAdjacentPairs = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c < 9; c++) {
    allAdjacentPairs.push([makeCellId(r, c), makeCellId(r, c + 1)]);
  }
}
for (let c = 1; c <= 9; c++) {
  for (let r = 1; r < 9; r++) {
    allAdjacentPairs.push([makeCellId(r, c), makeCellId(r + 1, c)]);
  }
}
const dotKey = ([a, b]) => [a, b].sort().join('-');
const dotSet = new Set(allDots.map(dotKey));
const undottedPairs = allAdjacentPairs.filter(p => !dotSet.has(dotKey(p)));

const SHIFT = 2; // VA/VB/VS store (true sum - SHIFT) to fit MAX_SIZE=16.
const shape = new Shape('9x9', 16);

// Stamp every grid cell back to the true 1-9 digit range (the widened range
// exists only to host VA/VB/VS).
const gridCells = graph.cells();
const gridDomain = new Replicate(
  [new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
  Replicate.encodeTargetCells(gridCells, gridCells[0], graph),
  gridCells[0],
);

const VA = new Var('A', 'shared sum value A minus SHIFT (white dots)', 1);
const VB = new Var('B', 'shared sum value B minus SHIFT (black dots)', 1);
const VS = new Var('S', 'per-undotted-pair sum minus SHIFT, for the exhaustiveness check', undottedPairs.length);

// cellA + cellB = shiftedTarget + SHIFT, i.e. cellA + cellB - shiftedTarget = SHIFT.
const sumEquals = (cellA, cellB, shiftedTarget) => new Sum(SHIFT, cellA, cellB, [shiftedTarget, -1]);

return [
  shape,
  gridDomain,

  ...totaledCages.map(({ total, cells }) => new Cage(total, ...cells)),
  ...untotaledCages.map(cells => new AllDifferent(...cells)),

  VA,
  VB,
  new AllDifferent(VA.cell(1), VB.cell(1)),
  ...whiteDots.map(([a, b]) => sumEquals(a, b, VA.cell(1))),
  ...blackDots.map(([a, b]) => sumEquals(a, b, VB.cell(1))),
  ...greyDots.map(([a, b]) => new Or([
    sumEquals(a, b, VA.cell(1)),
    sumEquals(a, b, VB.cell(1)),
  ])),

  VS,
  ...undottedPairs.map(([a, b], i) => sumEquals(a, b, VS.cell(i + 1))),
  ...undottedPairs.map((_, i) => new AllDifferent(VS.cell(i + 1), VA.cell(1), VB.cell(1))),
];
