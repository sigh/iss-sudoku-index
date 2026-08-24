// Title: Left Out
// Author: fritzdis
// Video: https://www.youtube.com/watch?v=R8o6xXdcSis
// Source: https://app.crackingthecryptic.com/sudoku/9tqg3dGhNP

// Normal sudoku rules apply (standard rows/cols/boxes, from Shape('9x9')).
// No given digits.
//
// Five 9-cell cages are drawn; none carries a printed total, so each is
// "digits cannot repeat within a cage" only. A 9-cell no-repeat cage is
// forced to contain every digit 1-9 exactly once, so each is encoded as
// AllDifferent over its 9 cells. The 36 cells outside every cage (the
// puzzle's "left out" cells) carry no cage constraint at all.
//
// Eight arrows sum their non-bulb cells to the digit in the bulb (circle);
// repeats along an arrow are explicitly allowed by the rules text unless
// forced by another rule (row/col/box/cage). Two arrows share bulb cell
// R5C4, giving it two independent sum expressions.

const cageA = ['R1C3', 'R2C3', 'R2C2', 'R3C2', 'R3C1', 'R4C1', 'R5C1', 'R5C2', 'R5C3'];
const cageB = ['R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R3C7', 'R3C8', 'R3C9'];
const cageC = ['R6C1', 'R6C2', 'R6C3', 'R7C3', 'R7C2', 'R7C1', 'R8C2', 'R8C3', 'R9C3'];
const cageD = ['R6C7', 'R6C6', 'R7C6', 'R7C5', 'R8C5', 'R8C6', 'R8C7', 'R9C6', 'R9C7'];
const cageE = ['R4C8', 'R5C8', 'R6C8', 'R6C9', 'R5C9', 'R4C9', 'R7C9', 'R8C9', 'R9C9'];

const arrows = [
  ['R1C2', 'R1C1', 'R2C1'],
  ['R1C5', 'R2C5', 'R2C6'],
  ['R1C8', 'R2C8', 'R2C7'],
  ['R4C8', 'R4C7', 'R4C6'],
  ['R5C4', 'R5C3', 'R5C2'],
  ['R5C4', 'R6C3', 'R7C3'],
  ['R7C7', 'R7C8', 'R6C8', 'R6C9', 'R7C9'],
  ['R8C1', 'R9C1', 'R9C2'],
];

return [
  new Shape('9x9'),
  new AllDifferent(...cageA),
  new AllDifferent(...cageB),
  new AllDifferent(...cageC),
  new AllDifferent(...cageD),
  new AllDifferent(...cageE),
  ...arrows.map(cells => new Arrow(...cells)),
];
