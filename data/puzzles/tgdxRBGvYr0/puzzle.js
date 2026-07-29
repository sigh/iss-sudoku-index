// Title: Big Bang
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=tgdxRBGvYr0
// Source: https://sudokupad.app/3jdlbq25sj

// Standard Sudoku applies. Each arrow's arm cells sum to its circular bulb.
// Givens and arrow paths are transcribed from the drawn source clues.
const arrows = [
  new Arrow('R4C4', 'R3C3', 'R2C2'),
  new Arrow('R4C4', 'R5C3', 'R6C2'),
  new Arrow('R5C4', 'R6C3', 'R7C2'),
  new Arrow('R6C4', 'R7C3', 'R8C2'),
  new Arrow('R6C4', 'R7C5', 'R8C6'),
  new Arrow('R6C5', 'R7C6', 'R8C7'),
  new Arrow('R6C6', 'R7C7', 'R8C8'),
  new Arrow('R6C6', 'R5C7', 'R4C8'),
  new Arrow('R5C6', 'R4C7', 'R3C8'),
  new Arrow('R4C6', 'R3C7', 'R2C8'),
  new Arrow('R4C6', 'R3C5', 'R2C4'),
  new Arrow('R4C5', 'R3C4', 'R2C3'),
];

return [
  new Shape('9x9'),
  new Given('R1C9', 7),
  new Given('R3C4', 1),
  new Given('R4C6', 6),
  new Given('R6C5', 4),
  ...arrows,
];
