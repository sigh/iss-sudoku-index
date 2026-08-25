// Title: CTC Consecutive Sudoku
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=S7PULNF7riM
// Source: https://app.crackingthecryptic.com/webapp/PDrrDndbNp

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. Every drawn dot overlay is filled
// black; the rules text says cells sharing a black dot hold consecutive
// digits, so each is a WhiteDot (the class name is the standard-Kropki
// label; it encodes "consecutive", independent of the drawn dot colour).
// There are no unfilled dots in the payload, so no ratio/negative reading
// applies to any pair.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
const givens = [
  ['R2C5', 6], ['R3C1', 9], ['R3C9', 4],
  ['R5C1', 2], ['R5C9', 9],
  ['R6C2', 1], ['R6C3', 9], ['R6C7', 6], ['R6C8', 8],
  ['R8C3', 1], ['R8C7', 2],
  ['R9C2', 2], ['R9C8', 3],
];

// Black dot edges, transcribed from `overlays` (edge-sized rounded marks,
// fill=#000000). Each is one adjacent-cell pair.
const dots = [
  ['R1C2', 'R1C3'], ['R1C3', 'R1C4'],
  ['R1C2', 'R2C2'], ['R2C2', 'R3C2'], ['R3C2', 'R4C2'],
  ['R4C2', 'R4C3'], ['R4C3', 'R4C4'],
  ['R1C5', 'R1C6'],
  ['R1C6', 'R1C7'], ['R1C7', 'R1C8'],
  ['R2C6', 'R2C7'], ['R3C6', 'R3C7'], ['R4C6', 'R4C7'],
  ['R6C4', 'R6C5'], ['R6C5', 'R6C6'],
  ['R6C4', 'R7C4'], ['R7C4', 'R8C4'], ['R8C4', 'R9C4'],
  ['R9C4', 'R9C5'], ['R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...dots.map(([a, b]) => new WhiteDot(a, b)),
];
