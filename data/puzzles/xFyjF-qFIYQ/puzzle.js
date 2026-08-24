// Title: Konami Code
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=xFyjF-qFIYQ
// Source: https://app.crackingthecryptic.com/sudoku/nR9Tj3th6H

// Normal sudoku rules apply. Digits along an arrow sum to the digit in the
// circle, and may repeat (if allowed by the other constraints). No givens.
// Standard boxes (payload regions match the nine 3x3 boxes exactly).
//
// 12 arrows are drawn; a 13th payload arrow entry has no waypoints and
// renders nothing, so it is omitted as non-clue styling. Two arrows
// (R1C3-R1C2-R2C2 and R1C3-R2C3-R3C3) share one circle at R1C3 -- both
// shafts independently sum to that one circled digit.

const arrows = [
  new Arrow('R3C2', 'R4C1', 'R5C1', 'R6C1'),
  new Arrow('R9C1', 'R8C1', 'R7C1'),
  new Arrow('R1C3', 'R1C2', 'R2C2'),
  new Arrow('R1C3', 'R2C3', 'R3C3'),
  new Arrow('R3C4', 'R2C5', 'R1C5', 'R1C4'),
  new Arrow('R3C6', 'R2C7', 'R1C8', 'R2C8'),
  new Arrow('R6C5', 'R6C4', 'R7C3'),
  new Arrow('R9C4', 'R8C5', 'R7C4'),
  new Arrow('R9C5', 'R8C4', 'R7C5'),
  new Arrow('R7C9', 'R7C8', 'R8C8'),
  new Arrow('R6C6', 'R5C7', 'R5C8'),
  new Arrow('R5C9', 'R6C8', 'R6C7'),
];

return [
  new Shape('9x9'),
  ...arrows,
];
