// Title: Rivets
// Author: XeonRisq
// Video: https://www.youtube.com/watch?v=QzsFyP5DsOc
// Source: https://app.crackingthecryptic.com/sudoku/g8nbdG8674

// Normal sudoku rules apply (default 3x3 boxes). Each single-cell "rivet"
// cage below is read as: the digit X placed in the cage's own cell points to
// a second digit Y located X cells away from it, along its own row or
// column; the cage's printed total is X+Y. The rules do not name a fixed
// direction, so each cage is encoded as a disjunction over every direction
// (left/right/up/down) that stays on the grid for the value the cell could
// hold. White dots require consecutive values; black dots require a 2:1
// ratio; both bind their two adjacent cells only (no claim about undotted
// pairs).

// Rivet cage total/cell pairs, transcribed from the drawn single-cell cages.
const rivetCages = [
  [10, 1, 3], [9, 1, 4], [9, 1, 6], [10, 1, 7],
  [10, 3, 1], [8, 3, 5], [6, 3, 9],
  [8, 4, 1], [7, 4, 5], [6, 4, 9],
  [7, 5, 3], [5, 5, 4], [4, 5, 6], [10, 5, 7],
  [10, 6, 1], [7, 6, 5], [11, 6, 9],
  [9, 7, 1], [9, 7, 5], [9, 7, 9],
  [10, 9, 3], [13, 9, 4], [6, 9, 6], [11, 9, 7],
];

// For a rivet cage at (r, c) with total T: try every value the source cell
// could hold (1-9) and every direction; keep only the (value, direction)
// combinations that land a target cell on the grid. Given(source, value)
// pins which one is "active", and Sum(T, source, target) then forces the
// target to T-value. The Or over all combinations is exactly "some direction
// X cells away sums with X to T", for whichever X the source turns out to
// hold - including forbidding a source value for which no direction stays
// on the grid.
function rivetCage(total, r, c) {
  const source = makeCellId(r, c);
  const alternatives = [];
  for (let value = 1; value <= 9; value++) {
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const tr = r + dr * value;
      const tc = c + dc * value;
      if (tr < 1 || tr > 9 || tc < 1 || tc > 9) continue;
      const target = makeCellId(tr, tc);
      alternatives.push(new And([
        new Given(source, value),
        new Sum(total, source, target),
      ]));
    }
  }
  return new Or(alternatives);
}

// White-dot (consecutive) edges, transcribed from the white-filled overlays.
const whiteDots = [
  ['R3C5', 'R4C5'],
  ['R3C9', 'R4C9'],
  ['R6C1', 'R7C1'],
  ['R9C3', 'R9C4'],
  ['R9C6', 'R9C7'],
];

// Black-dot (ratio 2:1) edges, transcribed from the black-filled overlays.
const blackDots = [
  ['R1C3', 'R1C4'],
  ['R1C6', 'R1C7'],
  ['R3C1', 'R4C1'],
  ['R5C3', 'R5C4'],
  ['R5C6', 'R5C7'],
  ['R6C5', 'R7C5'],
  ['R6C9', 'R7C9'],
];

return [
  new Shape('9x9'),
  ...rivetCages.map(([total, r, c]) => rivetCage(total, r, c)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
