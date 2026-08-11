// Title: Pi
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=UD_Jx8M_Cs0
// Source: https://app.crackingthecryptic.com/sudoku/G2jJbhbGtQ

// Normal sudoku rules apply (standard 3x3 boxes, confirmed against the
// payload's own region list). Cells a knight's move apart cannot repeat a
// digit (AntiKnight). Adjacent digits along the grey line must differ by at
// least 3 (Whisper(3)).
//
// The grey line is a single closed loop (its drawn path starts and ends at
// R3C1). Whisper binds only consecutive pairs in the given cell list, so the
// wrap-around edge is covered by repeating the first cell at the end of the
// list.

const GIVENS = [
  ['R1C5', 8],
  ['R2C2', 9],
  ['R2C8', 4],
  ['R5C4', 3],
  ['R5C5', 1],
  ['R5C6', 4],
  ['R7C5', 6],
];

// Grey whisper-line cells, in drawn order. First cell repeated at the end to
// close the loop.
const LINE_CELLS = [
  'R3C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8',
  'R1C9', 'R2C9', 'R3C8', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7',
  'R8C7', 'R9C8', 'R9C7', 'R8C6', 'R7C6', 'R6C6', 'R5C6', 'R4C6',
  'R3C6', 'R3C5', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4',
  'R9C3', 'R9C2', 'R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3',
  'R3C2', 'R4C1', 'R3C1',
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  new AntiKnight(),
  new Whisper(3, ...LINE_CELLS),
];
