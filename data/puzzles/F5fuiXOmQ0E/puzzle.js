// Title: Broken Arrows
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=F5fuiXOmQ0E
// Source: https://app.crackingthecryptic.com/sudoku/D8bbJFghnG

// Normal sudoku rules apply.
// 8 arrow lines and 8 circles are drawn separately, sharing no cell: each
// arrow's digits must sum to the digit of exactly one circle, and each
// circle is the target of exactly one arrow -- a one-to-one pairing that is
// not given (the puzzle's "broken" twist) and is solved for below.
// The two main diagonals may repeat digits (no constraint needed for that --
// diagonals are not all-different by default) and their combined total
// equals the sum of the 8 circle digits.

const arrows = [
  ['R6C4', 'R6C5'],
  ['R5C4', 'R4C4'],
  ['R4C5', 'R4C6'],
  ['R5C5', 'R5C6'],
  ['R7C4', 'R6C3', 'R5C2', 'R4C3'],
  ['R3C4', 'R3C3', 'R2C2', 'R1C2'],
  ['R9C1', 'R9C2'],
  ['R5C7', 'R4C8'],
]; // the 8 drawn arrow lines, cell path in drawn order (arrowhead cell last)

const circles = [
  'R6C1', 'R6C2', 'R6C8', 'R6C9', 'R9C5', 'R7C3', 'R3C7', 'R1C4',
]; // the 8 drawn circle cells (each a plain grid cell with a circle drawn on it)

const K = arrows.length; // 8, equal to circles.length

const diag1 = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];
const diag2 = ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'];
// the two main diagonals the puzzle marks with off-grid rays into R1C1 and
// R1C9; X and Y are never referenced individually, only as X+Y, so no
// separate Var is needed for either.

// Which arrow (1..K, index into `arrows`) each circle is the target of.
const pairing = new Var('P', 'Circle-to-arrow pairing', K);

// All (a, b) with 1 <= a < b <= K -- used both to compare every pair of
// circles and, reused, to enumerate every ordered (x, y) with x < y.
const pairsUpTo = (n) => {
  const out = [];
  for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) out.push([a, b]);
  return out;
};

return [
  new Shape('9x9'),
  new Given('R2C9', 7),

  pairing,
  // Restrict each selector to a real arrow index: the group's cells
  // otherwise take the grid's full 1-9 range, but there are only K=8 arrows.
  ...pairing.cells().map(cell =>
    new Given(cell, ...Array.from({ length: K }, (_, k) => k + 1))),
  // K selectors ranging over K values, all different -> a bijection, i.e.
  // "one circle belongs to exactly one arrow line and vice versa".
  new AllDifferent(...pairing.cells()),

  // For each circle, exactly one selector value can hold (the rest are
  // excluded by AllDifferent), and that branch ties the circle's own digit
  // to its assigned arrow's arm-cell sum via a two-segment EqualSum.
  ...circles.map((circle, j) => new Or(
    arrows.map((arm, i) => new And([
      new EqualSum([circle], arm),
      new Given(pairing.cell(j + 1), i + 1),
    ]))
  )),

  // The rules only assert that a bijection exists, never which one, so when
  // two circles land on the same digit either could take either of the two
  // matching arrows -- a pairing-only symmetry with no effect on the grid.
  // Pin the canonical representative (lower circle index takes the lower
  // arrow index whenever the circles it and a later one tie) so the search
  // reports the single underlying grid instead of every relabelling of it.
  ...pairsUpTo(K).map(([a, b]) => new Or([
    new AllDifferent(circles[a - 1], circles[b - 1]),
    new And([
      new SameValues(2, circles[a - 1], circles[b - 1]),
      new Or(pairsUpTo(K).map(([x, y]) => new And([
        new Given(pairing.cell(a), x),
        new Given(pairing.cell(b), y),
      ]))),
    ]),
  ])),

  // sum(diag1) + sum(diag2) = sum(circles), i.e. X+Y = sum of the 8 circle
  // digits. R5C5 sits on both diagonals, so it is deliberately listed twice
  // (contributing to X and to Y separately, as the rule requires).
  new EqualSum([...diag1, ...diag2], circles),
];
