// Title: Arrow Sudoku
// Author: Nityant Agarwal
// Video: https://www.youtube.com/watch?v=A_f4XGMLkyw
// Source: https://app.crackingthecryptic.com/sudoku/Gj6rPRJhjT

// Normal sudoku rules apply (standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes). Digits along an arrow sum to the digit in
// the arrow's bulb cell (the first cell of each Arrow below); the arm
// permits repeated digits. All 8 arrows have a single-cell bulb, so
// Arrow(bulb, ...arm) is bulb == sum(arm).

return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C4', 3),
  new Given('R4C9', 6),
  new Given('R6C1', 5),
  new Given('R9C6', 7),
  new Given('R9C9', 1),

  new Arrow('R3C2', 'R3C3', 'R3C4', 'R3C5'),
  new Arrow('R4C3', 'R4C4', 'R4C5', 'R4C6'),
  new Arrow('R5C4', 'R5C5', 'R5C6', 'R5C7'),
  new Arrow('R6C9', 'R6C8', 'R6C7', 'R6C6'),
  new Arrow('R6C2', 'R7C2', 'R8C2', 'R9C2'),
  new Arrow('R8C7', 'R8C6', 'R8C5', 'R8C4'),
  new Arrow('R7C8', 'R7C7', 'R7C6', 'R7C5'),
  new Arrow('R3C7', 'R2C7', 'R1C7'),
];
