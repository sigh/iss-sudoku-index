// Title: 3/21/2023: 16 Extra Givens??
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=t7hYdmUfG1U
// Source: https://tinyurl.com/5n7nmjt3

// Normal sudoku rules apply.
// Arrow: digits along each arrow (the two shaft cells) sum to the digit in
// the circled bulb cell. Digits may repeat along an arrow, per the rules
// text. 16 of the 17 arrow bulbs are pre-filled givens (that given digit is
// simultaneously the arrow's circled total); the 17th bulb, R3C3, carries no
// given and is solved for.

const arrows = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R9C9', 'R9C8', 'R9C7'],
  ['R9C6', 'R9C5', 'R9C4'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R6C1', 'R5C1', 'R4C1'],
  ['R2C2', 'R2C3', 'R2C4'],
  ['R2C5', 'R2C6', 'R2C7'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R5C8', 'R6C8', 'R7C8'],
  ['R8C8', 'R8C7', 'R8C6'],
  ['R8C5', 'R8C4', 'R8C3'],
  ['R8C2', 'R7C2', 'R6C2'],
  ['R5C2', 'R4C2', 'R3C2'],
  ['R3C3', 'R3C4', 'R3C5'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 7),
  new Given('R1C4', 9),
  new Given('R1C9', 8),
  new Given('R2C2', 6),
  new Given('R2C5', 8),
  new Given('R2C8', 9),
  new Given('R4C9', 6),
  new Given('R5C2', 9),
  new Given('R5C8', 7),
  new Given('R6C1', 8),
  new Given('R8C2', 7),
  new Given('R8C5', 4),
  new Given('R8C8', 8),
  new Given('R9C1', 9),
  new Given('R9C6', 6),
  new Given('R9C9', 7),

  ...arrows.map(cells => new Arrow(...cells)),
];
