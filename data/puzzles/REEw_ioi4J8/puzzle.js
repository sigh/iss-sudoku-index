// Title: Good (k)Night Milki
// Author: I Love Sleeping
// Video: https://www.youtube.com/watch?v=REEw_ioi4J8
// Source: https://tinyurl.com/axs5m6bb

// Normal sudoku rules apply. Purple lines are renban (consecutive,
// non-repeating digits, any order). Digits may not repeat in any cage. The
// "09" cage is a look-and-say cage. Other cages are killer cages (sum,
// distinct). Knight's-move cells cannot repeat. The red line, closed into a
// loop, forces alternating parity along the heart. A gray line marks a pair
// of diagonally-adjacent cells forced to hold the same digit; every other
// diagonally-adjacent pair is forced to differ (orthogonal king-move pairs
// are already distinct via the row/column rules, so only the diagonal pairs
// need the negative clause).

// Four purple lines are renban. A further pair of purple strokes in the same
// colour, crossing at R8C1, is drawn but carries no stated rule and is not
// encoded (decorative).
const renbanLines = [
  ['R3C1', 'R2C1', 'R1C1', 'R2C2', 'R1C3', 'R2C3', 'R3C3'],
  ['R3C8', 'R2C8', 'R1C8'],
  ['R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6'],
  ['R7C8', 'R8C8', 'R9C8'],
];

// Heart line: closed loop (first cell repeated at the end), alternating
// odd/even along consecutive cells.
const heartLoop = [
  'R9C5', 'R8C4', 'R7C3', 'R6C3', 'R5C4',
  'R6C5', 'R5C6', 'R6C7', 'R7C7', 'R8C6', 'R9C5',
];

// Gray line pairs: diagonally-adjacent cells forced to hold the same digit.
// One drawn segment (R5C6-R4C7-R3C8) covers two pairs.
const grayPairs = [
  ['R2C3', 'R3C4'], ['R3C3', 'R2C4'], ['R3C6', 'R2C7'], ['R3C7', 'R2C6'],
  ['R5C6', 'R4C7'], ['R4C7', 'R3C8'], ['R6C7', 'R7C6'], ['R7C7', 'R6C6'],
  ['R7C9', 'R6C8'], ['R3C5', 'R4C4'], ['R5C4', 'R4C3'], ['R6C3', 'R7C4'],
  ['R7C3', 'R6C2'], ['R9C3', 'R8C4'], ['R9C4', 'R8C3'], ['R4C2', 'R3C1'],
  ['R3C9', 'R4C8'], ['R6C4', 'R5C3'], ['R8C6', 'R9C7'], ['R5C7', 'R4C6'],
];

// Derive every diagonally-adjacent cell pair on the 9x9 grid, then subtract
// the marked (gray-line) pairs: the remainder must hold different digits.
const markedKeys = new Set(
  grayPairs.map(([a, b]) => [a, b].sort().join('-'))
);
const unmarkedDiagonalPairs = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 9; c++) {
    if (c <= 8) {
      const a = makeCellId(r, c), b = makeCellId(r + 1, c + 1);
      if (!markedKeys.has([a, b].sort().join('-'))) {
        unmarkedDiagonalPairs.push([a, b]);
      }
    }
    if (c >= 2) {
      const a = makeCellId(r, c), b = makeCellId(r + 1, c - 1);
      if (!markedKeys.has([a, b].sort().join('-'))) {
        unmarkedDiagonalPairs.push([a, b]);
      }
    }
  }
}

return [
  new Shape('9x9'),
  new AntiKnight(),

  ...renbanLines.map((cells) => new Renban(...cells)),

  new Modular(2, ...heartLoop),

  // "09" cage: look-and-say ("0 nines"), plus the global no-repeat-in-cage
  // rule (this cage has no sum, so it needs its own AllDifferent).
  new LookAndSay('09', 'R3C3', 'R3C4', 'R4C3', 'R4C4'),
  new AllDifferent('R3C3', 'R3C4', 'R4C3', 'R4C4'),

  new Cage(23, 'R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new Cage(14, 'R1C4', 'R1C5', 'R1C6'),

  ...grayPairs.map(([a, b]) => new SameValues(2, a, b)),
  ...unmarkedDiagonalPairs.map(([a, b]) => new AllDifferent(a, b)),
];
