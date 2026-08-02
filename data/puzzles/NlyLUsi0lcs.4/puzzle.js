// Title: September 11, 2023: Arrow
// Author: clover!
// Video: https://www.youtube.com/watch?v=NlyLUsi0lcs
// Source: https://tinyurl.com/2zxytpns

// Standard Sudoku with the 18 drawn givens. Each arrow's first cell is its
// circle; the remaining cells are its arm and sum to that circle.
return [
  new Shape('9x9'),
  new Given('R1C1', 9), new Given('R1C2', 8), new Given('R1C3', 7),
  new Given('R3C6', 8), new Given('R3C7', 9), new Given('R3C8', 4),
  new Given('R4C4', 6), new Given('R4C5', 4), new Given('R4C6', 2),
  new Given('R6C4', 3), new Given('R6C5', 1), new Given('R6C6', 5),
  new Given('R7C2', 6), new Given('R7C3', 9), new Given('R7C4', 7),
  new Given('R9C7', 6), new Given('R9C8', 7), new Given('R9C9', 8),
  // Arrow paths transcribed from the ten drawn arrow entries.
  new Arrow('R1C1', 'R2C2', 'R3C3', 'R4C4'),
  new Arrow('R1C2', 'R2C3', 'R3C4', 'R4C5'),
  new Arrow('R1C3', 'R2C4', 'R3C5', 'R4C6'),
  new Arrow('R9C7', 'R8C6', 'R7C5', 'R6C4'),
  new Arrow('R9C8', 'R8C7', 'R7C6', 'R6C5'),
  new Arrow('R9C9', 'R8C8', 'R7C7', 'R6C6'),
  new Arrow('R3C6', 'R2C7', 'R1C8'),
  new Arrow('R7C4', 'R8C3', 'R9C2'),
  new Arrow('R7C3', 'R8C2', 'R9C1'),
  new Arrow('R3C7', 'R2C8', 'R1C9'),
];
