// Title: Inequality Sudoku 06
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=dXx5nkYfnZ8
// Source: https://app.crackingthecryptic.com/sudoku/22J3G2G6p2

// Normal sudoku rules apply. Each grid marking 'points' at the lower digit
// in the connected cells. GreaterThan(a, b) encodes a > b, i.e. the mark's
// tip points at b. Horizontal '>' points right, '<' points left; vertical
// caret (up chevron) points up, 'V' (down chevron) points down.

const inequalities = [
  // '>' (horizontal, tip right -> right cell is lower)
  new GreaterThan('R1C1', 'R1C2'),
  new GreaterThan('R1C2', 'R1C3'),
  new GreaterThan('R1C4', 'R1C5'),
  new GreaterThan('R1C5', 'R1C6'),
  new GreaterThan('R2C1', 'R2C2'),
  new GreaterThan('R3C1', 'R3C2'),
  new GreaterThan('R3C2', 'R3C3'),
  new GreaterThan('R3C4', 'R3C5'),
  new GreaterThan('R3C5', 'R3C6'),
  new GreaterThan('R4C1', 'R4C2'),
  new GreaterThan('R5C1', 'R5C2'),
  new GreaterThan('R5C2', 'R5C3'),
  new GreaterThan('R5C8', 'R5C9'),
  new GreaterThan('R7C8', 'R7C9'),
  new GreaterThan('R7C7', 'R7C8'),
  new GreaterThan('R8C5', 'R8C6'),
  new GreaterThan('R8C7', 'R8C8'),
  new GreaterThan('R8C8', 'R8C9'),
  new GreaterThan('R9C7', 'R9C8'),
  new GreaterThan('R9C8', 'R9C9'),

  // '<' (horizontal, tip left -> left cell is lower)
  new GreaterThan('R2C3', 'R2C2'),
  new GreaterThan('R2C5', 'R2C4'),
  new GreaterThan('R2C6', 'R2C5'),
  new GreaterThan('R4C3', 'R4C2'),
  new GreaterThan('R6C2', 'R6C1'),
  new GreaterThan('R6C3', 'R6C2'),
  new GreaterThan('R6C8', 'R6C7'),
  new GreaterThan('R6C9', 'R6C8'),
  new GreaterThan('R5C8', 'R5C7'),
  new GreaterThan('R4C8', 'R4C7'),
  new GreaterThan('R4C9', 'R4C8'),
  new GreaterThan('R7C6', 'R7C5'),
  new GreaterThan('R7C5', 'R7C4'),
  new GreaterThan('R8C5', 'R8C4'),
  new GreaterThan('R9C5', 'R9C4'),
  new GreaterThan('R9C6', 'R9C5'),

  // caret (vertical, tip up -> upper cell is lower)
  new GreaterThan('R2C1', 'R1C1'),
  new GreaterThan('R2C3', 'R1C3'),
  new GreaterThan('R2C4', 'R1C4'),
  new GreaterThan('R2C5', 'R1C5'),
  new GreaterThan('R2C6', 'R1C6'),
  new GreaterThan('R3C6', 'R2C6'),
  new GreaterThan('R3C5', 'R2C5'),
  new GreaterThan('R3C4', 'R2C4'),
  new GreaterThan('R3C2', 'R2C2'),
  new GreaterThan('R5C1', 'R4C1'),
  new GreaterThan('R5C2', 'R4C2'),
  new GreaterThan('R6C1', 'R5C1'),
  new GreaterThan('R6C2', 'R5C2'),
  new GreaterThan('R6C3', 'R5C3'),
  new GreaterThan('R9C4', 'R8C4'),
  new GreaterThan('R8C5', 'R7C5'),
  new GreaterThan('R9C6', 'R8C6'),
  new GreaterThan('R9C7', 'R8C7'),
  new GreaterThan('R8C7', 'R7C7'),
  new GreaterThan('R8C9', 'R7C9'),
  new GreaterThan('R9C9', 'R8C9'),
  new GreaterThan('R6C9', 'R5C9'),

  // 'V' (vertical, tip down -> bottom cell is lower)
  new GreaterThan('R1C2', 'R2C2'),
  new GreaterThan('R2C1', 'R3C1'),
  new GreaterThan('R2C3', 'R3C3'),
  new GreaterThan('R4C3', 'R5C3'),
  new GreaterThan('R4C7', 'R5C7'),
  new GreaterThan('R4C8', 'R5C8'),
  new GreaterThan('R4C9', 'R5C9'),
  new GreaterThan('R5C8', 'R6C8'),
  new GreaterThan('R5C7', 'R6C7'),
  new GreaterThan('R7C8', 'R8C8'),
  new GreaterThan('R8C8', 'R9C8'),
  new GreaterThan('R7C4', 'R8C4'),
  new GreaterThan('R8C5', 'R9C5'),
  new GreaterThan('R7C6', 'R8C6'),
];

return [
  new Shape('9x9'),
  ...inequalities,
];
