// Title: One Ring Magic Thermo
// Author: Pete Craig
// Video: https://www.youtube.com/watch?v=8rtY9f-VjVw
// Source: https://app.crackingthecryptic.com/sudoku/LDrhHbmHtr

// Normal Sudoku rules apply (default row/column/box all-different from Shape).
// Digits increase along each thermometer from the bulb: Thermo(bulb, ...tip).
// The central box (R4-R6, C4-C6) is a magic square: EqualSum over its 3 rows,
// 3 columns and 2 diagonals; the box's own all-different then forces the
// common sum to 15 by itself.

// Thermometer cell lists, bulb-first (source lines[]; several are drawn
// tip-first per the geometry helper's notes, so those are reversed here).
const thermos = [
  ['R2C2', 'R2C3', 'R1C3', 'R1C2'], // lines[0], reversed
  ['R1C6', 'R1C5', 'R1C4'], // lines[1], reversed
  ['R1C7', 'R1C8', 'R2C8', 'R2C7'], // lines[2], drawn bulb-first
  ['R4C8', 'R3C7', 'R2C6', 'R2C5', 'R2C4', 'R3C3'], // lines[3], reversed
  ['R5C9', 'R4C9', 'R3C9'], // lines[4], reversed
  ['R7C8', 'R7C9', 'R8C9', 'R8C8'], // lines[5], drawn bulb-first
  ['R8C4', 'R8C5', 'R8C6', 'R7C7', 'R6C8', 'R5C8'], // lines[6], reversed
  ['R9C4', 'R9C5'], // lines[7], reversed
  ['R9C1', 'R8C1', 'R8C2', 'R9C2'], // lines[8], reversed
  ['R6C1', 'R5C1', 'R4C1'], // lines[9], drawn bulb-first
  ['R4C2', 'R5C2', 'R6C2', 'R7C3'], // lines[10], drawn bulb-first
];

// Central box's rows/cols/diagonals for the magic-square EqualSum.
const centerRows = [4, 5, 6].map((r) => [4, 5, 6].map((c) => makeCellId(r, c)));
const centerCols = [4, 5, 6].map((c) => [4, 5, 6].map((r) => makeCellId(r, c)));
const centerDiags = [
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
];

return [
  new Shape('9x9'),

  new Given('R3C4', 3),
  new Given('R4C3', 9),
  new Given('R7C2', 1),
  new Given('R9C7', 7),

  ...thermos.map((cells) => new Thermo(...cells)),

  new EqualSum(...centerRows, ...centerCols, ...centerDiags),
];
