// Title: So You Think You've Seen This Puzzle Before...
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=pY7-6ltY-6k
// Source: https://cracking-the-cryptic.web.app/sudoku/hNDLtr4Q8T

// Normal sudoku rules apply. Along the thermometer shape, digits must
// increase from the bulb end (Thermo, bulb first). The grey cells form a
// magic square: every row/column and both main diagonals of that 3x3 block
// sum to the same total (EqualSum over the box's 8 lines; the box's own
// all-different, from the default region set, then forces the common sum to
// 15 by itself). Cells a knight's move apart cannot repeat a digit
// (AntiKnight, global). Regions are the default 3x3 boxes -- the puzzle's
// drawn region outlines exactly match that partition.

// Thermometer cells, bulb first: drawn as one line (color #A3E048) with a
// filled circular bulb underlay at its first waypoint, R2C8.
const thermo = ['R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2'];

// Grey magic-square box: 9 single-cell underlays (color #CFCFCF) covering
// exactly R4C4..R6C6, the center box.
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
const magicDiags = [
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
];

return [
  new Shape('9x9'),

  new Given('R1C8', 9),
  new Given('R3C3', 5),
  new Given('R8C1', 4),

  new Thermo(...thermo),

  new EqualSum(...magicRows, ...magicCols, ...magicDiags),

  new AntiKnight(),
];
