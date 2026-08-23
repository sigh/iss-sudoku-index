// Title: Chameleon
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=McNmBk4wrh0
// Source: https://app.crackingthecryptic.com/sudoku/H8fbgF24Fn

// Normal sudoku rules apply (default row/column/box all-different). Digits
// along each arrow sum to the digit in its attached (unlabelled) circle,
// which sits on the arrow's bulb cell. `Arrow` takes the bulb cell first and
// the arm cells after, per the payload's ten arrow paths (two bulbs, R3C5
// and R7C5, each carry two arrows).

return [
  new Shape('9x9'),

  new Given('R1C4', 5),
  new Given('R2C1', 4),
  new Given('R7C1', 5),
  new Given('R8C8', 4),

  new Arrow('R3C2', 'R2C3', 'R1C3'),
  new Arrow('R3C5', 'R2C4', 'R1C4'),
  new Arrow('R3C5', 'R2C6', 'R1C6'),
  new Arrow('R3C8', 'R2C7', 'R1C7'),
  new Arrow('R4C2', 'R5C3', 'R5C4'),
  new Arrow('R5C6', 'R5C7', 'R6C8'),
  new Arrow('R7C8', 'R8C7', 'R9C7'),
  new Arrow('R7C5', 'R8C6', 'R9C6'),
  new Arrow('R7C5', 'R8C4', 'R9C4'),
  new Arrow('R7C2', 'R8C3', 'R9C3'),
];
