// Title: Ratio Killer Sudoku
// Author: Emerson Denner
// Video: https://www.youtube.com/watch?v=tfMnFk6BelI
// Source: https://app.crackingthecryptic.com/sudoku/FgD8HLh3Gr

// Normal sudoku rules apply (standard 3x3 boxes, default for Shape('9x9')).
// Cages show their sum and forbid repeated digits within the cage -- Cage's
// own semantics ("Values must add up to the given sum. All values must be
// unique.") match this directly.
// Black dots mean a 1:2 ratio between the two adjacent cells -- BlackDot's
// own semantics ("one value must be double the other") match this directly.
// "Not all dots are given" only disclaims completeness of the drawn dots; it
// licenses no negative constraint elsewhere, so no AntiRatio/anti-dot rule is
// added for unmarked adjacent pairs.

return [
  new Shape('9x9'),

  new Given('R5C4', 2),
  new Given('R5C6', 9),

  new Cage(5, 'R1C1', 'R2C1'),
  new Cage(20, 'R1C2', 'R1C3', 'R2C3'),
  new Cage(15, 'R2C2', 'R3C2', 'R3C3'),
  new Cage(30, 'R1C4', 'R1C5', 'R2C4', 'R2C5', 'R3C4', 'R3C5'),
  new Cage(20, 'R1C6', 'R1C7', 'R1C8'),
  new Cage(15, 'R2C6', 'R2C7', 'R3C6'),
  new Cage(5, 'R3C7', 'R3C8'),
  new Cage(25, 'R2C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Cage(15, 'R6C1', 'R7C1'),
  new Cage(45, 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6'),
  new Cage(7, 'R7C4', 'R7C5'),
  new Cage(3, 'R7C2', 'R7C3'),
  new Cage(26, 'R7C6', 'R8C4', 'R8C5', 'R8C6'),
  new Cage(12, 'R7C7', 'R7C8'),
  new Cage(12, 'R8C7', 'R9C7', 'R9C8'),
  new Cage(15, 'R8C8', 'R8C9', 'R9C9'),

  new BlackDot('R1C4', 'R1C5'),
  new BlackDot('R3C3', 'R4C3'),
  new BlackDot('R3C7', 'R4C7'),
  new BlackDot('R5C1', 'R5C2'),
  new BlackDot('R7C3', 'R8C3'),
  new BlackDot('R7C3', 'R7C4'),
  new BlackDot('R7C5', 'R8C5'),
  new BlackDot('R8C2', 'R8C3'),
  new BlackDot('R9C5', 'R9C6'),
  new BlackDot('R8C9', 'R9C9'),
  new BlackDot('R9C8', 'R9C9'),
];
