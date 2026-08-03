// Title: Wedding Sudoku
// Author: Piatato
// Video: https://www.youtube.com/watch?v=dk7NO1q2qKo
// Source: https://app.crackingthecryptic.com/sudoku/397PdfPq6D

// Normal sudoku rules apply. Along thermometers, digits must increase from
// the bulb end (default 3x3 boxes; no other clues in the payload).
//
// Each Thermo lists cells from the bulb, per the drawn circle underlay on
// the first cell of each line.

return [
  new Shape('9x9'),

  new Given('R6C1', 1),
  new Given('R6C2', 2),
  new Given('R7C4', 8),
  new Given('R8C6', 2),
  new Given('R8C7', 3),

  new Thermo('R6C5', 'R5C4', 'R4C3', 'R3C2', 'R2C2', 'R1C3', 'R1C4'),
  new Thermo('R6C7', 'R7C7', 'R8C8', 'R9C8'),
  new Thermo('R7C2', 'R7C3', 'R8C4', 'R8C5', 'R9C6'),
  new Thermo('R2C5', 'R1C6', 'R1C7', 'R2C8', 'R3C8', 'R4C7', 'R5C6'),
];
