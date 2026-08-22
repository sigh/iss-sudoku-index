// Title: Tick Tock
// Author: Mark Sweep (Frostini)
// Video: https://www.youtube.com/watch?v=_m5SrofDuMg
// Source: https://app.crackingthecryptic.com/sudoku/q3jhj7DBGn

// Normal sudoku rules (default row/col/box all-different from Shape('9x9')).
// Cages: distinct digits, summing to the printed top-left total when one is
// given (Cage), or distinct-only when no total is printed (AllDifferent).
// Arrows: bulb digit equals the sum of its arm digits (Arrow); the two short
// arrows both start at the shared centre bulb R5C5 but run to disjoint arms.

return [
  new Shape('9x9'),

  new Given('R1C4', 1),
  new Given('R1C6', 2),
  new Given('R5C1', 9),
  new Given('R5C9', 3),
  new Given('R9C5', 6),

  new Cage(19, 'R2C4', 'R2C5', 'R2C6'),
  new AllDifferent('R3C3', 'R3C4', 'R4C3'),
  new AllDifferent('R3C6', 'R3C7', 'R4C7'),
  new Cage(11, 'R6C3', 'R7C3', 'R7C4'),
  new AllDifferent('R6C7', 'R7C6', 'R7C7'),
  new Cage(10, 'R4C2', 'R5C2', 'R6C2'),
  new Cage(20, 'R4C8', 'R5C8', 'R6C8'),
  new Cage(11, 'R8C4', 'R8C5', 'R8C6'),

  new Arrow('R2C6', 'R2C7', 'R3C8', 'R4C8'),
  new Arrow('R6C8', 'R7C8', 'R8C7', 'R8C6'),
  new Arrow('R8C4', 'R8C3', 'R7C2', 'R6C2'),
  new Arrow('R4C2', 'R3C2', 'R2C3', 'R2C4'),
  new Arrow('R5C5', 'R5C4', 'R6C3'),
  new Arrow('R5C5', 'R5C6', 'R4C7'),
];
