// Title: More
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=vbVN-wJYEhM
// Source: https://app.crackingthecryptic.com/sudoku/DhF88nPTP4

// Normal sudoku rules apply (standard rows/cols/boxes, no givens).
// Digits along an arrow must sum to the digit in that arrow's circle;
// three circles (R2C3, R2C6, R6C6, R9C8 carry two each) feed two arrows,
// each arm summing to the same circled digit independently.
// A cell with an opaque grey square must hold an even digit; a cell with
// an opaque grey circle must hold an odd digit. There is no Odd/Even
// class, so parity is encoded as a restricted Given (candidate list).

const arrows = [
  new Arrow('R1C3', 'R1C2', 'R1C1'),
  new Arrow('R2C3', 'R2C2', 'R2C1'),
  new Arrow('R2C3', 'R3C4'),
  new Arrow('R2C6', 'R2C5', 'R2C4'),
  new Arrow('R2C6', 'R1C7', 'R1C8'),
  new Arrow('R2C6', 'R3C7', 'R3C8'),
  new Arrow('R2C7', 'R3C6'),
  new Arrow('R4C4', 'R5C3', 'R6C2'),
  new Arrow('R4C7', 'R5C8', 'R4C9'),
  new Arrow('R6C6', 'R5C6', 'R4C6'),
  new Arrow('R6C6', 'R7C5', 'R7C4'),
  new Arrow('R9C4', 'R8C4', 'R8C5'),
  new Arrow('R9C8', 'R8C8', 'R7C7'),
  new Arrow('R9C8', 'R8C9', 'R7C9'),
];

return [
  new Shape('9x9'),
  ...arrows,
  new Given('R9C5', 1, 3, 5, 7, 9), // grey circle: odd
  new Given('R7C6', 2, 4, 6, 8),    // grey square: even
  new Given('R3C9', 2, 4, 6, 8),    // grey square: even
];
