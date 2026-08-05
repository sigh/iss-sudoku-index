// Title: Oct. 18, 2022: Catch Sum Rays
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=FpaGo21lbhM
// Source: https://tinyurl.com/2p83dzpd

// Normal Sudoku rules apply. Each listed ray sums to its shared circled cell.
// Givens and arrow rays are transcribed from the puzzle grid.
return [
  new Shape('9x9'),
  new Given('R1C3', 6),
  new Given('R1C5', 2),
  new Given('R4C6', 7),
  new Given('R4C7', 4),
  new Given('R5C5', 3),
  new Given('R6C3', 8),
  new Given('R6C4', 5),
  new Given('R9C5', 1),
  new Given('R9C7', 9),

  new Arrow('R6C6', 'R6C7', 'R6C8', 'R6C9'),
  new Arrow('R6C6', 'R7C6', 'R8C6', 'R9C6'),
  new Arrow('R6C6', 'R7C7', 'R8C8'),
  new Arrow('R3C7', 'R2C6', 'R1C5'),
  new Arrow('R3C7', 'R4C8', 'R5C9'),
  new Arrow('R3C7', 'R2C8', 'R1C9'),
  new Arrow('R3C7', 'R2C7', 'R1C7'),
  new Arrow('R3C7', 'R3C8', 'R3C9'),
  new Arrow('R4C4', 'R4C3', 'R4C2', 'R4C1'),
  new Arrow('R4C4', 'R3C4', 'R2C4', 'R1C4'),
  new Arrow('R4C4', 'R3C3', 'R2C2'),
  new Arrow('R7C3', 'R8C2', 'R9C1'),
  new Arrow('R7C3', 'R7C2', 'R7C1'),
  new Arrow('R7C3', 'R8C3', 'R9C3'),
  new Arrow('R7C3', 'R6C2', 'R5C1'),
  new Arrow('R7C3', 'R8C4', 'R9C5'),
];
