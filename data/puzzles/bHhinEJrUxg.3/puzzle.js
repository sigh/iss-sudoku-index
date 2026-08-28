// Title: Oct 22, 2021: Arrow
// Author: clover!
// Video: https://www.youtube.com/watch?v=bHhinEJrUxg
// Source: https://tinyurl.com/37sv5css

// Normal sudoku rules apply (standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes). Digits along an arrow sum to the digit in
// the arrow's bulb cell (the first cell of each Arrow below); the arm
// permits repeated digits, subject to normal sudoku placement rules.
// One bulb (R5C5) anchors four separate arms; ISS's Arrow class has no
// UNIQUENESS_KEY_FIELD, so all four instances at the shared bulb are kept.
// Given digits transcribed from the payload's grid values.

return [
  new Shape('9x9'),

  new Given('R2C6', 2),
  new Given('R2C8', 4),
  new Given('R3C3', 4),
  new Given('R3C4', 6),
  new Given('R4C2', 3),
  new Given('R4C9', 7),
  new Given('R5C3', 2),
  new Given('R5C5', 9),
  new Given('R5C7', 6),
  new Given('R6C1', 7),
  new Given('R6C8', 2),
  new Given('R7C6', 7),
  new Given('R7C7', 3),
  new Given('R8C2', 5),
  new Given('R8C4', 2),

  new Arrow('R1C1', 'R2C1', 'R3C1', 'R4C1', 'R4C2'),
  new Arrow('R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C4'),
  new Arrow('R9C9', 'R8C9', 'R7C9', 'R6C9', 'R6C8'),
  new Arrow('R1C9', 'R1C8', 'R1C7', 'R1C6', 'R2C6'),
  new Arrow('R5C5', 'R6C4', 'R7C3', 'R8C2'),
  new Arrow('R5C5', 'R4C6', 'R3C7', 'R2C8'),
  new Arrow('R5C5', 'R4C4', 'R3C3'),
  new Arrow('R5C5', 'R6C6', 'R7C7'),
  new Arrow('R2C3', 'R3C4', 'R4C5'),
  new Arrow('R8C7', 'R7C6', 'R6C5'),
  new Arrow('R2C4', 'R1C4', 'R1C3'),
  new Arrow('R8C6', 'R9C6', 'R9C7'),
];
