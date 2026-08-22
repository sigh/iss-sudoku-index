// Title: Whispering the Cracktic
// Author: Vidarino
// Video: https://www.youtube.com/watch?v=SrKbv0DhcA0
// Source: https://app.crackingthecryptic.com/sudoku/j3R2Nm447j

// Normal sudoku rules apply (standard rows/cols/boxes). Digits along both main
// diagonals cannot repeat. Neighbouring numbers along green lines must differ
// by at least 5. Numbers in circles must all appear somewhere in the
// surrounding 2x2 cell area (presence only, not a one-to-one placement).
//
// The two circles at R1-2,C1-2 and R8-9,C8-9 are drawn in the payload as an
// outline circle plus two small overlapping mini-circles carrying "1 2"/"3 5"
// and "2 4"/"5 6" respectively -- a SudokuPad rendering split for a
// multi-digit circle label; all four digits belong to one Quad clue per box.

return [
  new Shape('9x9'),

  new Diagonal(1),   // anti-diagonal: R1C9..R9C1
  new Diagonal(-1),  // main diagonal: R1C1..R9C9

  ...[
    ['R3C2', 'R4C1', 'R5C2', 'R4C3'],
    ['R1C4', 'R2C3', 'R3C4', 'R2C5'],
    ['R3C1', 'R2C2', 'R1C3'],
    ['R4C4', 'R3C3', 'R2C2'],
    ['R6C7', 'R5C8', 'R6C9', 'R7C8'],
    ['R8C5', 'R7C6', 'R8C7', 'R9C6'],
    ['R6C6', 'R7C7', 'R8C8'],
    ['R7C9', 'R8C8', 'R9C7'],
  ].map(cells => new Whisper(5, ...cells)),

  new Quad('R6C3', 8),
  new Quad('R1C1', 1, 2, 3, 5),
  new Quad('R8C8', 2, 4, 5, 6),
];
