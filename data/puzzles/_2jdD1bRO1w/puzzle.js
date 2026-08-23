// Title: Killer Wasp
// Author: Quarterthru
// Video: https://www.youtube.com/watch?v=_2jdD1bRO1w
// Source: https://app.crackingthecryptic.com/sudoku/tBfT7DHJ6F

// Standard sudoku rules (default row/col/box all-different). 13 killer cages
// (distinct digits, printed sum) over 50 of the 81 cells; the remaining
// cells carry no cage. R2C8 carries a small grey square marker that the
// rules text says marks an even digit; encoded as a restricted Given since
// ISS has no Odd/Even class.
//
// The grey/gold shading under the cage cells is decorative art only (it
// traces a wasp shape) and is not encoded.

return [
  new Shape('9x9'),

  new Cage(32, 'R1C6', 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8', 'R4C9'),
  new Cage(20, 'R3C6', 'R3C7', 'R4C7'),
  new Cage(13, 'R4C5', 'R4C6', 'R5C6'),
  new Cage(29, 'R6C7', 'R6C8', 'R6C9', 'R7C9', 'R7C8'),
  new Cage(10, 'R8C9', 'R9C9', 'R9C8'),
  new Cage(34, 'R8C7', 'R9C7', 'R9C6', 'R8C6', 'R7C6'),
  new Cage(19, 'R7C5', 'R8C5', 'R9C5'),
  new Cage(19, 'R8C2', 'R8C3', 'R9C3'),
  new Cage(13, 'R7C2', 'R7C1'),
  new Cage(9, 'R5C3', 'R5C2', 'R5C1'),
  new Cage(18, 'R3C1', 'R4C1', 'R4C3', 'R3C2', 'R4C2'),
  new Cage(21, 'R1C3', 'R2C3', 'R1C4', 'R2C4', 'R3C4'),
  new Cage(20, 'R1C2', 'R1C1', 'R2C1'),

  new Given('R2C8', 2, 4, 6, 8),
];
