// Title: Big Bang
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=DnRGUWffGsc
// Source: https://tinyurl.com/24ckdbre

// Normal sudoku rules apply. Digits along an arrow must sum to that arrow's
// circled digit. Each Arrow() call takes the bulb cell first, then the arm
// cells in order (arm cells may repeat a digit; only the usual row/column/box
// constraints restrict them).
return [
  new Shape('9x9'),

  new Given('R1C1', 9), new Given('R1C2', 3),
  new Given('R1C8', 5), new Given('R1C9', 7),
  new Given('R2C1', 1), new Given('R2C9', 3),
  new Given('R8C1', 5), new Given('R8C9', 4),
  new Given('R9C1', 8), new Given('R9C2', 4),
  new Given('R9C8', 3), new Given('R9C9', 9),

  new Arrow('R4C5', 'R3C4', 'R3C3', 'R3C2'),
  new Arrow('R7C2', 'R6C1', 'R5C1', 'R4C1'),
  new Arrow('R5C4', 'R6C3', 'R7C3', 'R8C3'),
  new Arrow('R8C7', 'R9C6', 'R9C5', 'R9C4'),
  new Arrow('R6C5', 'R7C6', 'R7C7', 'R7C8'),
  new Arrow('R3C8', 'R4C9', 'R5C9', 'R6C9'),
  new Arrow('R5C6', 'R4C7', 'R3C7', 'R2C7'),
  new Arrow('R2C3', 'R1C4', 'R1C5', 'R1C6'),
];
