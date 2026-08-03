// Title: Question Everything
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=ceQx4G5Q4RY
// Source: https://app.crackingthecryptic.com/sudoku/rD98HnbQFt

// Standard 9x9 sudoku (ordinary 3x3 boxes). Two killer cages. One
// thermometer, bulb-first, strictly increasing. Four cells marked with a
// gray square must hold an even digit. Adjacent-cell X marks sum to 10 (no
// V marks are drawn); "all possible V's and X's are given" makes every
// other adjacent pair a negative constraint, via StrictXV.
// Cage and mark cells are transcribed from the drawn source data.

return [
  new Shape('9x9'),

  new Cage(6, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(8, 'R8C9', 'R9C8', 'R9C9'),

  // Bulb at R7C5 (filled circle underlay); increases along the drawn path.
  new Thermo('R7C5', 'R6C5', 'R5C6', 'R4C5', 'R5C4'),

  // Gray-square cells (underlay squares, distinct from the round thermo bulb).
  new Given('R4C3', 2, 4, 6, 8),
  new Given('R4C7', 2, 4, 6, 8),
  new Given('R6C3', 2, 4, 6, 8),
  new Given('R6C7', 2, 4, 6, 8),

  // Every drawn "X" badge (adjacent pair sums to 10); no "V" badges are drawn.
  new X('R6C5', 'R7C5'),
  new X('R3C5', 'R4C5'),
  new X('R1C5', 'R2C5'),
  new X('R8C5', 'R9C5'),
  new X('R5C6', 'R5C7'),
  new X('R5C3', 'R5C4'),
  new X('R5C1', 'R5C2'),
  new X('R5C8', 'R5C9'),
  // "All possible V's and X's are given": every other adjacent pair must
  // not sum to 5 or 10.
  new StrictXV(),
];
