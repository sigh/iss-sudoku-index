// Title: Cacophony
// Author: zetamath
// Video: https://www.youtube.com/watch?v=OtPjR_jlEHk
// Source: https://app.crackingthecryptic.com/sudoku/j7H9pphNm7

// Normal sudoku rules apply (default row/col/box all-different).
// Thermometers: digits strictly increase from the bulb end -> Thermo.
// Purple lines: digits on the line are strictly between the digits in the
// two circled end cells -> Between, cell list ordered end-to-end.
// Two of the purple lines curve out to the grid edge: the drawn path visits
// the two circled cells and three cells on the far column, in that order.
// Cages: killer-style, sum to the printed total, cells distinct -> Cage.
// Grey-square cells must hold an even digit: no dedicated class exists, so
// this is encoded as a restricted Given over {2,4,6,8}.

return [
  new Shape('9x9'),

  new Given('R9C4', 3),

  // Thermometers (bulb first).
  new Thermo('R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'),
  new Thermo('R1C5', 'R2C5', 'R3C5'),
  new Thermo('R7C5', 'R8C5', 'R9C5'),

  // Purple between-lines (circled ends first/last in each list).
  new Between('R2C4', 'R2C3', 'R3C3', 'R4C3', 'R4C4'),
  new Between('R2C6', 'R2C7', 'R3C7', 'R4C7', 'R4C6'),
  new Between('R6C4', 'R6C3', 'R7C3', 'R8C3', 'R8C4'),
  new Between('R6C6', 'R6C7', 'R7C7', 'R8C7', 'R8C6'),
  new Between('R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C8'),
  new Between('R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2'),

  // Cages (top-left cell first, order otherwise irrelevant).
  new Cage(8, 'R1C1', 'R2C1'),
  new Cage(12, 'R1C9', 'R2C9'),
  new Cage(8, 'R8C1', 'R9C1'),
  new Cage(12, 'R8C9', 'R9C9'),
  new Cage(10, 'R6C1', 'R6C2'),
  new Cage(10, 'R4C8', 'R4C9'),

  // Grey-square even cells.
  new Given('R4C5', 2, 4, 6, 8),
  new Given('R6C5', 2, 4, 6, 8),
];
