// Title: Integral of x^3
// Author: Evan
// Video: https://www.youtube.com/watch?v=EkAgIjnQ-ac
// Source: https://sudokupad.app/21ada44fy7

// Normal Sudoku rules; pink lines are renbans; blue line segments split by
// box borders have equal sums; green pairs differ by at least 5; killer cages
// have their drawn totals; marked X/V pairs sum to 10/5.

return [
  new Shape('9x9'),

  // Drawn givens.
  new Given('R1C2', 5),
  new Given('R1C5', 3),
  new Given('R3C2', 1),

  // Drawn pink lines; the final line closes back onto R2C7, so its unique
  // covered cells form the renban set.
  new Renban('R1C3', 'R1C2', 'R2C2', 'R3C2', 'R3C1'),
  new Renban('R2C8', 'R3C9'),
  new Renban('R2C9', 'R3C8'),
  new Renban('R1C7', 'R2C7', 'R3C7', 'R3C6', 'R2C6'),

  // Drawn blue line in path order.
  new RegionSumLine(
    'R4C9', 'R5C8', 'R6C7', 'R6C6', 'R6C5',
    'R6C4', 'R7C3', 'R8C2', 'R9C1',
  ),

  new Whisper(5, 'R2C4', 'R3C3'),
  new Whisper(5, 'R2C3', 'R3C4'),

  // Drawn killer cages.
  new Cage(9, 'R8C2', 'R9C2'),
  new Cage(5, 'R9C1'),
  new Cage(11, 'R7C3', 'R8C3', 'R9C3'),
  new Cage(13, 'R6C4', 'R7C4'),
  new Cage(13, 'R8C4', 'R9C4'),
  new Cage(17, 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new Cage(4, 'R6C6', 'R7C6'),
  new Cage(14, 'R8C6', 'R9C6'),
  new Cage(11, 'R6C7', 'R7C7', 'R8C7', 'R9C7'),
  new Cage(17, 'R5C8', 'R6C8', 'R7C8'),
  new Cage(13, 'R8C8', 'R9C8'),
  new Cage(12, 'R4C9', 'R5C9', 'R6C9'),
  new Cage(17, 'R7C9', 'R8C9', 'R9C9'),

  // Drawn black X and V marks.
  new X('R5C3', 'R6C3'),
  new X('R3C7', 'R4C7'),
  new V('R9C4', 'R9C5'),
];
