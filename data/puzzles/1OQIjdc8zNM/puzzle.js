// Title: nabneR
// Author: zetamath
// Video: https://www.youtube.com/watch?v=1OQIjdc8zNM
// Source: https://app.crackingthecryptic.com/sudoku/fpmB4ppfMp

// Normal sudoku rules apply. Cells separated by a white dot hold consecutive
// digits; cells separated by a black dot hold digits in a 2:1 ratio. Not
// every such pair is dotted, so absence of a dot is unconstrained. Each
// purple line holds no repeated digit and no two digits anywhere on the
// line -- not just adjacent cells -- may be consecutive (the title spells
// "Renban" backwards, its opposite: a "Nabner" line).

const purpleLines = [
  ['R1C3', 'R1C2', 'R2C2'],
  ['R1C5', 'R1C4', 'R2C4', 'R3C4'],
  ['R1C6', 'R1C7', 'R1C8', 'R2C8'],
  ['R2C7', 'R3C8', 'R3C9', 'R2C9'],
  ['R2C6', 'R3C6', 'R3C7', 'R4C7'],
  ['R2C5', 'R3C5', 'R4C5', 'R4C6'],
  ['R4C8', 'R4C9'],
  ['R3C3', 'R4C4', 'R5C5', 'R6C4'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4'],
  ['R6C1', 'R7C1', 'R7C2', 'R7C3'],
  ['R6C2', 'R6C3', 'R7C4', 'R8C3'],
  ['R9C2', 'R9C3', 'R9C4', 'R8C4'],
  ['R7C5', 'R8C5', 'R9C5', 'R9C6'],
  ['R8C6', 'R7C6', 'R6C7', 'R6C8'],
  ['R8C7', 'R9C7', 'R9C8', 'R8C9'],
  ['R6C6', 'R5C7', 'R5C8', 'R5C9'],
];

// "No two digits on a line can be consecutive, regardless of their
// position" is a relation over every pair of cells on the line, not just
// line-adjacent pairs, so it needs PairX (all pairs) rather than a
// line-adjacency handling class.
const notConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),

  new Given('R6C9', 9),

  ...purpleLines.map(cells => new AllDifferent(...cells)),
  ...purpleLines.map(cells => new PairX(notConsecutiveKey, 'Purple', ...cells)),

  // Drawn white dot (fill white, border black): R4C6/R4C7 hold consecutive digits.
  new WhiteDot('R4C6', 'R4C7'),
  // Drawn black dot (fill black, border black): R5C8/R6C8 hold a 2:1 ratio.
  new BlackDot('R5C8', 'R6C8'),
];
