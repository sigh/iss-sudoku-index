// Title: Between Lines Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=EIWX3buriUE
// Source: https://app.crackingthecryptic.com/sudoku/Gn497f83tF

// Normal sudoku rules apply (standard rows, columns, 3x3 boxes -- the ISS
// default). Digits along each line, which may include repeats, must be
// strictly between the values in the circles on the ends of that line.
//
// Each Between() below is passed a line's full cell list, circle cell to
// circle cell; the circles hold no digit of their own beyond being ordinary
// grid cells, some of which are also givens. Two circles each bound two
// different lines (R6C1: lines 2 and 3 below; R6C4: lines 3 and 10).
//
// Line cell paths are hand-transcribed from the puzzle's drawn lines and
// circle marks.

return [
  new Shape('9x9'),

  new Given('R1C3', 1),
  new Given('R1C7', 5),
  new Given('R2C4', 1),
  new Given('R4C3', 6),
  new Given('R4C9', 9),
  new Given('R5C1', 5),
  new Given('R5C6', 9),
  new Given('R6C4', 6),
  new Given('R6C5', 3),
  new Given('R7C7', 9),
  new Given('R9C3', 8),

  new Between('R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Between('R2C1', 'R3C1', 'R4C1', 'R5C1'),
  new Between('R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Between('R6C1', 'R6C2', 'R6C3', 'R6C4'),
  new Between('R7C2', 'R7C3', 'R8C3'),
  new Between('R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Between('R4C8', 'R4C7', 'R5C7', 'R5C8'),
  new Between('R6C9', 'R6C8', 'R6C7', 'R6C6'),
  new Between('R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8'),
  new Between('R5C6', 'R4C6', 'R3C6', 'R2C6'),
  new Between('R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4'),
  new Between('R9C3', 'R9C4', 'R9C5', 'R8C5', 'R7C5', 'R6C5'),
];
