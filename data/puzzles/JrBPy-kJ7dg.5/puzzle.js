// Title: July 22, 2023: Renban Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=JrBPy-kJ7dg
// Source: https://tinyurl.com/bdeeapcf

// Normal sudoku rules apply. Each pink line contains a set of consecutive
// digits in any order (a renban line). Twelve renban lines are drawn, each
// spanning 3 cells in a straight row or column segment.

return [
  new Shape('9x9'),

  new Given('R1C5', 5),
  new Given('R2C2', 1),
  new Given('R2C8', 5),
  new Given('R3C3', 2),
  new Given('R3C7', 6),
  new Given('R5C1', 7),
  new Given('R5C9', 9),
  new Given('R7C3', 6),
  new Given('R7C7', 3),
  new Given('R8C2', 7),
  new Given('R8C8', 4),
  new Given('R9C5', 3),

  new Renban('R8C2', 'R8C3', 'R8C4'),
  new Renban('R2C2', 'R3C2', 'R4C2'),
  new Renban('R2C3', 'R3C3', 'R4C3'),
  new Renban('R3C6', 'R3C7', 'R3C8'),
  new Renban('R2C6', 'R2C7', 'R2C8'),
  new Renban('R6C8', 'R7C8', 'R8C8'),
  new Renban('R6C7', 'R7C7', 'R8C7'),
  new Renban('R7C4', 'R7C3', 'R7C2'),
  new Renban('R7C9', 'R6C9', 'R5C9'),
  new Renban('R1C7', 'R1C6', 'R1C5'),
  new Renban('R3C1', 'R4C1', 'R5C1'),
  new Renban('R9C3', 'R9C4', 'R9C5'),
];
