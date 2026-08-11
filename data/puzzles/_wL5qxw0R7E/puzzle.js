// Title: Arrow Sudoku
// Author: Shinichi, Yosuke or Kota
// Video: https://www.youtube.com/watch?v=_wL5qxw0R7E
// Source: https://app.crackingthecryptic.com/sudoku/B7jNpp7rFT
//
// Normal sudoku rules apply (standard 3x3 boxes).
// Digits along an arrow may repeat and must sum to the number in the circle
// or pill; 2-digit numbers in pills are read left-to-right -> one
// Arrow(bulb, ...arm) per single-cell circle-bulb arrow, one
// PillArrow(2, tensCell, onesCell, ...arm) per 2-cell pill-bulb arrow (pill
// cells excluded from the arm; PillArrow sums only the trailing cells
// against the leading pill-digit cells).
//
// Given digits: R1C5=2 R2C9=3 R3C4=6 R4C3=7 R5C5=4 R5C8=1 R6C4=5 R8C2=7
// R8C5=5 R8C9=1 R9C1=5 R9C4=4 R9C9=2.
//
// Arrow geometry, reconstructed from the drawn arrow lines and bulb marks:
//   Arrow A: circle bulb R3C6, arm R3C7-R3C8-R4C7-R5C6-R4C6.
//   Arrow B: circle bulb R7C3, arm R7C4-R7C5-R8C4-R9C3-R8C3.
//   Arrow C: pill bulb R6C6/R6C7, tens=R6C6 (left), ones=R6C7 (right);
//     arm R6C8-R6C9-R7C8-R8C7-R9C6-R8C6-R7C6.
//   Arrow D: pill bulb R1C1/R1C2, tens=R1C1 (left), ones=R1C2 (right);
//     arm R1C3-R1C4-R1C5-R1C6-R1C7-R2C6-R3C5-R4C4-R5C3-R6C2-R7C1-R6C1-
//     R5C1-R4C1-R3C1-R2C1.

return [
  new Shape('9x9'),

  new Arrow('R3C6', 'R3C7', 'R3C8', 'R4C7', 'R5C6', 'R4C6'),
  new Arrow('R7C3', 'R7C4', 'R7C5', 'R8C4', 'R9C3', 'R8C3'),

  new PillArrow(2, 'R6C6', 'R6C7',
    'R6C8', 'R6C9', 'R7C8', 'R8C7', 'R9C6', 'R8C6', 'R7C6'),
  new PillArrow(2, 'R1C1', 'R1C2',
    'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C6', 'R3C5',
    'R4C4', 'R5C3', 'R6C2', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1'),

  new Given('R1C5', 2), new Given('R2C9', 3), new Given('R3C4', 6),
  new Given('R4C3', 7), new Given('R5C5', 4), new Given('R5C8', 1),
  new Given('R6C4', 5), new Given('R8C2', 7), new Given('R8C5', 5),
  new Given('R8C9', 1), new Given('R9C1', 5), new Given('R9C4', 4),
  new Given('R9C9', 2),
];
