// Title: 862 Hz
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=hW4HZ-59kjA
// Source: https://sudokupad.app/7Gr3rNnD2N

// Normal Sudoku rules apply. Digits along a gray arrow sum to the digit in
// that arrow's circle. Orange lines are palindromes; every orange line here
// is drawn on exactly two cells, so each just pins its pair equal. Digits in
// a cage sum to the printed total. Digits joined by a white dot are
// consecutive.

// Arrows: circle cell first, then arm cells, from the drawn arrow paths.
// Six circles each send out two branches.
const arrows = [
  ['R6C1', 'R7C2', 'R6C3'],
  ['R6C4', 'R7C5', 'R6C6'],
  ['R6C4', 'R7C3'],
  ['R6C7', 'R7C8', 'R6C9'],
  ['R6C7', 'R7C6'],
  ['R4C6', 'R3C5', 'R4C4'],
  ['R4C6', 'R3C7'],
  ['R4C3', 'R3C2', 'R4C1'],
  ['R4C3', 'R3C4'],
  ['R4C9', 'R3C8', 'R4C7'],
].map(cells => new Arrow(...cells));

// Palindrome lines, from the drawn orange lines. Six sit on a two-cell arrow
// arm above (R6C3-R7C2, R6C6-R7C5, R6C9-R7C8, R3C2-R4C1, R3C5-R4C4,
// R3C8-R4C7); the other six are independent pairs.
const palindromes = [
  ['R6C3', 'R7C2'],
  ['R6C6', 'R7C5'],
  ['R6C9', 'R7C8'],
  ['R3C2', 'R4C1'],
  ['R3C5', 'R4C4'],
  ['R3C8', 'R4C7'],
  ['R1C4', 'R2C3'],
  ['R2C4', 'R3C3'],
  ['R2C7', 'R3C6'],
  ['R1C7', 'R2C6'],
  ['R7C4', 'R8C3'],
  ['R7C7', 'R8C6'],
].map(cells => new Palindrome(...cells));

// Cages, from the two drawn 2x2 cage boxes.
const cages = [
  [27, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [22, 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
].map(([total, ...cells]) => new Cage(total, ...cells));

// White dot, from the drawn edge mark between R5C8 and R6C8.
const whiteDots = [
  ['R5C8', 'R6C8'],
].map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  ...arrows,
  ...palindromes,
  ...cages,
  ...whiteDots,
];
