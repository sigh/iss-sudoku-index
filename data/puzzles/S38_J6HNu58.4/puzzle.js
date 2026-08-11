// Title: July 23, 2022: Connect Four
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=S38_J6HNu58
// Source: https://tinyurl.com/yknp9mea

// Normal sudoku (default row/col/box). Killer cages: Cage (distinct digits
// summing to the printed total). Purple dots: each dot sits at the shared
// corner of a 2x2 block of cells; the four surrounding digits must form a
// consecutive run of four digits in any order, which is Renban's semantics
// (consecutive, non-repeating, any order) applied to that block's four cells
// instead of a line -- Renban's cell list need not be adjacent-ordered, so
// this is a faithful direct encoding, not an approximation.

return [
  new Shape('9x9'),

  new Given('R1C5', 9),
  new Given('R2C3', 7),
  new Given('R3C1', 6),
  new Given('R3C8', 8),
  new Given('R7C2', 2),
  new Given('R7C9', 4),
  new Given('R8C7', 3),
  new Given('R9C5', 5),

  // Killer cages.
  new Cage(6, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(9, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(13, 'R3C4', 'R4C3', 'R4C4'),
  new Cage(8, 'R3C6', 'R3C7', 'R4C7'),
  new Cage(22, 'R6C3', 'R7C3', 'R7C4'),
  new Cage(17, 'R6C6', 'R6C7', 'R7C6'),
  new Cage(21, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(24, 'R8C9', 'R9C8', 'R9C9'),

  // Purple dots (2x2 consecutive-set blocks).
  new Renban('R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Renban('R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Renban('R3C3', 'R3C4', 'R4C3', 'R4C4'),
  new Renban('R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new Renban('R6C3', 'R6C4', 'R7C3', 'R7C4'),
  new Renban('R6C6', 'R6C7', 'R7C6', 'R7C7'),
  new Renban('R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Renban('R8C8', 'R8C9', 'R9C8', 'R9C9'),
];
