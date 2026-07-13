// Title: Bonds
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=VDFZ9Wlohik
// Source: https://sudokupad.app/r834e3uouc

// Normal sudoku rules apply. Within a cage, digits don't repeat and they
// must sum to the small number written at the top left of that cage.
// Digits along an arrow must sum to the digit in the circle cell attached
// to that arrow.

return [
  new Shape('9x9'),

  new Cage(27, 'R1C3', 'R1C4', 'R1C5', 'R2C3'),
  new Cage(27, 'R5C9', 'R6C9', 'R7C8', 'R7C9'),
  new Cage(17, 'R2C7', 'R3C6', 'R3C7', 'R3C8', 'R4C7'),
  new Cage(15, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(21, 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R5C7'),
  new Cage(7, 'R5C1', 'R6C1'),
  new Cage(8, 'R9C4', 'R9C5'),
  new Cage(30, 'R6C2', 'R6C3', 'R7C3', 'R7C4', 'R8C4'),
  new Cage(25, 'R5C3', 'R5C4', 'R5C5', 'R6C5', 'R7C5'),

  new Arrow('R3C1', 'R3C2', 'R3C3', 'R2C3'),
  new Arrow('R9C7', 'R8C7', 'R7C7', 'R7C8'),
];
