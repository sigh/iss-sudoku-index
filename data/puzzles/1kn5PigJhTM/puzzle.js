// Title: Riders on the Storm
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=1kn5PigJhTM
// Source: https://link.sudokupad.app/ridersofthestorm-jamessinclair

// Normal sudoku (rows/cols/boxes) plus: anti-knight; grey-circle cells odd,
// grey-square cells even; killer cages (distinct + sum); arrows (arm digits
// sum to the bulb, single-digit, repeats on the arm allowed). The "fog of
// war" progressive-reveal mechanic and its centre light-source marker are
// solving UI, not a rule on the finished grid, and are not encoded (a grid
// with all cells lit is the same grid as one solved digit-by-digit).

return [
  new Shape('9x9'),

  new AntiKnight(),

  // Odd cells (grey circle): candidate restriction to {1,3,5,7,9}.
  // Drawn odd markers per source `odd` array.
  new Given('R4C6', 1, 3, 5, 7, 9),
  new Given('R3C9', 1, 3, 5, 7, 9),
  new Given('R7C2', 1, 3, 5, 7, 9),

  // Even cells (grey square): candidate restriction to {2,4,6,8}.
  // Drawn even markers per source `even` array.
  new Given('R5C4', 2, 4, 6, 8),
  new Given('R6C6', 2, 4, 6, 8),

  // Killer cages: cells and totals transcribed from the source `killercage` array.
  new Cage(45, 'R4C2', 'R4C4', 'R4C5', 'R4C6', 'R5C2', 'R5C4', 'R6C2', 'R6C3', 'R6C4'),
  new Cage(45, 'R4C8', 'R5C5', 'R5C6', 'R5C8', 'R6C6', 'R6C8', 'R7C6', 'R7C7', 'R7C8'),
  new Cage(42, 'R6C1', 'R6C5', 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R8C2'),
  new Cage(45, 'R1C4', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'),

  // Arrows: bulb cell first, then arm cells, transcribed from the source
  // `arrow` array's `lines` (bulb is the line's first entry).
  new Arrow('R6C4', 'R5C4', 'R4C3', 'R4C4'),
  new Arrow('R6C5', 'R6C6', 'R5C7', 'R5C6'),
  new Arrow('R2C7', 'R3C6', 'R4C5'),
  new Arrow('R2C4', 'R3C4', 'R3C5'),
  new Arrow('R2C3', 'R2C2', 'R2C1'),
  new Arrow('R8C2', 'R7C2', 'R6C3'),
];
