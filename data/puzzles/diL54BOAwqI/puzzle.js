// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=diL54BOAwqI
// Source: https://cracking-the-cryptic.web.app/sudoku/npnPp8NgGL

// Rules: normal sudoku rules apply, and cages sum to different squares.
// Different 3-digit squares appear on the arrows, and 9-digit squares appear
// in the green cells.
//
// Readings this encoding commits to, and the drawn feature or arithmetic that
// forces each:
//   - "Square" means perfect square. Board digits are 1-9, so no number read
//     off the board can contain a 0 digit.
//   - The cages are sum-only, with repeats allowed, not killer cages. Two of
//     the seven cages cover nine cells each; nine cells with no repeats would
//     hold 1-9 and total 45, which is not a perfect square, so a no-repeats
//     reading leaves the puzzle with no solution at all.
//   - Each arrow covers exactly three cells and is read from its tail towards
//     its arrowhead. Three of the seven arrows bend, so they have no
//     left-to-right or top-to-bottom reading, and the head is the only mark
//     separating the two ends of a stroke; the arrows also do not all point
//     the same way (R5C6-R5C4 runs leftwards where R1C1-R3C1 runs downwards),
//     so the drawn direction is a deliberate choice rather than stroke order.
//     The board settles it too: the givens R1C5=9, R4C5=1 and R9C5=6 leave
//     923187456 as the only pandigital square fitting column 5, so R1C5=9 and
//     R2C5=2; read tail-to-head the R2C6-R2C5-R1C5 arrow is R2C6-2-9, which
//     529 and 729 both complete, while head-to-tail it would be 9-2-R2C6 and
//     no 3-digit square begins 92.
//   - The green cells are exactly columns 1, 5 and 9 and row 5, four complete
//     nine-cell runs (33 cells, the three crossing points shared), so they
//     spell four 9-digit numbers, each read top-to-bottom or left-to-right.
//   - "Different" scopes within a clue type: the seven cage totals differ from
//     each other, and the seven arrow numbers differ from each other.

// Perfect-square tables, computed here rather than transcribed.

// The 3-digit perfect squares with no 0 digit: 19 values.
const arrowSquares = [];
for (let n = 10; n <= 31; n++) {
  const s = String(n * n);
  if (!s.includes('0')) arrowSquares.push(s);
}

// The 9-digit perfect squares that use each of 1-9 exactly once: 30 values.
// 11112^2 is the first 9-digit square and 31622^2 the last. Restricting to
// pandigital values loses nothing here: every green run is a whole sudoku
// column or row, so its nine digits are already 1-9 in some order, and over
// such a run this list is exactly the set of 9-digit perfect squares.
const greenSquares = [];
for (let n = 11112; n <= 31622; n++) {
  const s = String(n * n);
  if ([...s].sort().join('') === '123456789') greenSquares.push(s);
}

const column = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));
const row = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));

// The four green runs, in reading order.
const greenRuns = [column(1), column(5), column(9), row(5)];

// The seven arrows, each transcribed from its drawn polyline, tail first and
// arrowhead last.
const arrows = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R5C6', 'R5C5', 'R5C4'],
  ['R6C4', 'R6C3', 'R5C3'],
  ['R2C6', 'R2C5', 'R1C5'],
  ['R4C8', 'R4C7', 'R5C7'],
  ['R5C9', 'R6C9', 'R7C9'],
];

// The seven drawn cage outlines. None carries a printed total.
const cages = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6'],
  ['R2C2'],
  ['R3C1'],
  ['R3C4'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
  ['R9C1', 'R9C2'],
];

// One Var per cage holds the root of that cage's square total, so a single
// AllDifferent over the roots carries the "different squares" half of the
// rule. A cage covers at most nine cells, so its total is at most 81 and its
// root is a digit 1-9; the Var group inherits that range from the grid.
const cageRoots = new Var('S', 'cage square root', cages.length);

// Two 3-digit numbers are equal exactly when all three digit positions agree,
// so "different" between a pair of arrows is: some position differs.
const notEqual = Pair.fnToKey((a, b) => a !== b, 9);
const arrowPairs = arrows.flatMap(
  (a, i) => arrows.slice(i + 1).map((b) => [a, b]));

return [
  new Shape('9x9'),

  // Givens, from the payload's cell values.
  new Given('R1C5', 9),
  new Given('R1C7', 4),
  new Given('R2C1', 6),
  new Given('R4C5', 1),
  new Given('R6C1', 4),
  new Given('R6C4', 6),
  new Given('R7C8', 9),
  new Given('R7C9', 6),
  new Given('R8C2', 4),
  new Given('R8C4', 1),
  new Given('R8C6', 9),
  new Given('R9C5', 6),
  new Given('R9C8', 1),
  new Given('R9C9', 4),

  cageRoots,
  new AllDifferent(...cageRoots.cells()),
  ...cages.map((cells, i) => new Or(
    Array.from({ length: 9 }, (_, k) => new And([
      new Given(cageRoots.cell(i + 1), k + 1),
      new Sum((k + 1) * (k + 1), ...cells),
    ])))),

  ...arrows.map((cells) => new Regex(arrowSquares.join('|'), ...cells)),
  ...arrowPairs.map(([a, b]) => new Or(
    a.map((cell, k) => new Pair(notEqual, 'different', cell, b[k])))),

  ...greenRuns.map((cells) => new Regex(greenSquares.join('|'), ...cells)),
];
