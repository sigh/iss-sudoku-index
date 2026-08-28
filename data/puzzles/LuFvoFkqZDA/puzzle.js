// Title: Unknown
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=LuFvoFkqZDA
// Source: https://cracking-the-cryptic.web.app/sudoku/HhPLM3MnRH

// Normal sudoku rules apply (default row/column/box all-different, 9x9,
// standard boxes as drawn).
//
// Thermo: digits strictly increase from the bulb (first cell). Bulb end
// confirmed by the drawn circle marker at R2C8.
//
// Magic square: the center box (R4C4..R6C6, matching the drawn grey
// shading) has equal row/column/diagonal sums. EqualSum over the box's 3
// rows, 3 columns and 2 diagonals; the box's own all-different (from the
// default box constraint) then forces the common sum to 15.
//
// AntiKnight: global "no repeat a knight's move apart" rule, applies to the
// whole grid.

const thermoCells = [
  'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2',
];

const magicRows = [
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
];
const magicCols = [
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
];
const magicDiagonals = [
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 2),
  new Given('R1C9', 5),
  new Given('R3C1', 8),
  new Given('R7C9', 2),
  new Given('R9C1', 5),
  new Given('R9C9', 8),

  new Thermo(...thermoCells),

  new EqualSum(...magicRows, ...magicCols, ...magicDiagonals),

  new AntiKnight(),
];
