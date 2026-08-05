// Title: The Eye of Providence
// Author: Stingo
// Video: https://www.youtube.com/watch?v=e3ftdRdF85E
// Source: https://app.crackingthecryptic.com/sudoku/Fm9Rth7bfr

// Normal Sudoku rules; the three given digits; every grey arrow's shaft sums to
// its circled bulb; and each drawn killer cage has distinct digits totalling its clue.
// Givens and cages are transcribed from the displayed grid and cage outlines.
return [
  new Shape('9x9'),
  new Given('R2C5', 2),
  new Given('R5C5', 5),
  new Given('R8C5', 3),

  new Arrow('R2C2', 'R2C3', 'R3C3'),
  new Arrow('R2C8', 'R2C7', 'R2C6', 'R3C7'),
  new Arrow('R4C8', 'R4C7', 'R5C7'),
  new Arrow('R4C2', 'R4C3', 'R5C3'),
  new Arrow('R5C4', 'R4C5', 'R4C6'),
  new Arrow('R9C1', 'R8C2', 'R7C2'),
  new Arrow('R9C8', 'R8C9', 'R7C8'),

  new Cage(9, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(9, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(20, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(15, 'R6C4', 'R6C5', 'R6C6'),
  new Cage(13, 'R4C1', 'R5C1', 'R5C2'),
  new Cage(13, 'R4C9', 'R5C8', 'R5C9'),
  new Cage(17, 'R7C3', 'R8C3', 'R9C3'),
  new Cage(13, 'R7C4', 'R8C4'),
  new Cage(9, 'R7C6', 'R8C6'),
  new Cage(20, 'R7C7', 'R8C7', 'R9C7'),
];
