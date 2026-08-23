// Title: Killer Arrow Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=c35lhg7wyRc
// Source: https://app.crackingthecryptic.com/sudoku/98Q7RJ6Q8g

// Normal sudoku rules apply (default row/col/box all-different, standard
// 3x3 boxes). Digits cannot repeat in cages, which show their sums: Cage.
// Digits along an arrow sum to the number in the circle: Arrow, with the
// circled cell first. Each of the 12 clue locations is drawn as both a
// killer cage and an arrow over the identical 3 cells, the arrow's circle
// sitting on the cage's corner cell -- so each location yields one Cage and
// one Arrow constraint over the same cells.

return [
  new Shape('9x9'),

  new Cage(8, 'R1C1', 'R1C2', 'R2C1'),
  new Arrow('R1C2', 'R1C1', 'R2C1'),

  new Cage(16, 'R4C1', 'R5C1', 'R6C1'),
  new Arrow('R4C1', 'R5C1', 'R6C1'),

  new Cage(14, 'R8C1', 'R9C1', 'R9C2'),
  new Arrow('R8C1', 'R9C1', 'R9C2'),

  new Cage(8, 'R9C4', 'R9C5', 'R9C6'),
  new Arrow('R9C4', 'R9C5', 'R9C6'),

  new Cage(16, 'R9C8', 'R9C9', 'R8C9'),
  new Arrow('R9C8', 'R9C9', 'R8C9'),

  new Cage(8, 'R4C9', 'R5C9', 'R6C9'),
  new Arrow('R6C9', 'R5C9', 'R4C9'),

  new Cage(18, 'R1C8', 'R1C9', 'R2C9'),
  new Arrow('R2C9', 'R1C9', 'R1C8'),

  new Cage(18, 'R1C4', 'R1C5', 'R1C6'),
  new Arrow('R1C6', 'R1C5', 'R1C4'),

  new Cage(6, 'R3C3', 'R3C4', 'R4C3'),
  new Arrow('R3C4', 'R3C3', 'R4C3'),

  new Cage(18, 'R3C6', 'R3C7', 'R4C7'),
  new Arrow('R4C7', 'R3C7', 'R3C6'),

  new Cage(10, 'R6C3', 'R7C3', 'R7C4'),
  new Arrow('R6C3', 'R7C3', 'R7C4'),

  new Cage(14, 'R6C7', 'R7C6', 'R7C7'),
  new Arrow('R7C6', 'R7C7', 'R6C7'),
];
