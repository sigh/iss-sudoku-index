// Title: 6 Dots and a Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=3fN2jrb6qHM
// Source: https://sudokupad.app/hn2t8spmu8

// Irregular Sudoku: place 1-6 once each in every row, column, and irregular
// region (no default 3x2 boxes). Kropki: digits either side of a white dot
// are consecutive; digits either side of a black dot are in a 1:2 ratio.

return [
  new Shape('6x6'),
  new NoBoxes(),

  // Irregular regions (six 6-cell jigsaw pieces).
  new Jigsaw('6x6', 'R1C1', 'R2C1', 'R3C1', 'R3C2', 'R4C2', 'R5C2'),
  new Jigsaw('6x6', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4'),
  new Jigsaw('6x6', 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R6C5', 'R6C6'),
  new Jigsaw('6x6', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6'),
  new Jigsaw('6x6', 'R1C2', 'R2C2', 'R2C3', 'R3C3', 'R4C3', 'R5C3'),
  new Jigsaw('6x6', 'R2C4', 'R2C5', 'R3C4', 'R4C4', 'R5C4', 'R5C5'),

  // Kropki white dots (consecutive).
  new WhiteDot('R3C1', 'R3C2'),
  new WhiteDot('R1C5', 'R1C6'),
  new WhiteDot('R5C4', 'R6C4'),

  // Kropki black dots (1:2 ratio).
  new BlackDot('R6C1', 'R6C2'),
  new BlackDot('R1C3', 'R2C3'),
  new BlackDot('R4C6', 'R5C6'),
];
