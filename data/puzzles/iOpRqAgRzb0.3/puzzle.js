// Title: September 8, 2023: Mathradd
// Author: clover!
// Video: https://www.youtube.com/watch?v=iOpRqAgRzb0
// Source: https://tinyurl.com/yhfuzu45

// Normal Sudoku with 13 givens. Each 9-circle makes both diagonal pairs of
// its drawn 2x2 block sum to 9; each ?-circle makes those two sums equal.
const givens = [
  ['R2C2', 5], ['R2C4', 1], ['R2C6', 6], ['R2C8', 7],
  ['R4C2', 9], ['R4C8', 2], ['R5C5', 9], ['R6C2', 4], ['R6C8', 5],
  ['R8C2', 6], ['R8C4', 8], ['R8C6', 3], ['R8C8', 9],
];

// Each entry is the two diagonal pairs from one drawn 2x2 circle.
const nines = [
  ['R4C3', 'R5C4', 'R4C4', 'R5C3'],
  ['R3C5', 'R4C6', 'R3C6', 'R4C5'],
  ['R5C6', 'R6C7', 'R5C7', 'R6C6'],
  ['R6C4', 'R7C5', 'R6C5', 'R7C4'],
  ['R2C4', 'R3C5', 'R2C5', 'R3C4'],
  ['R4C7', 'R5C8', 'R4C8', 'R5C7'],
  ['R7C5', 'R8C6', 'R7C6', 'R8C5'],
  ['R5C2', 'R6C3', 'R5C3', 'R6C2'],
];
const unknowns = [
  ['R6C3', 'R7C4', 'R6C4', 'R7C3'],
  ['R3C3', 'R4C4', 'R3C4', 'R4C3'],
  ['R3C6', 'R4C7', 'R3C7', 'R4C6'],
  ['R6C6', 'R7C7', 'R6C7', 'R7C6'],
  ['R2C2', 'R3C3', 'R2C3', 'R3C2'],
  ['R7C7', 'R8C8', 'R7C8', 'R8C7'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...nines.flatMap(([a, b, c, d]) => [new Sum(9, a, b), new Sum(9, c, d)]),
  ...unknowns.map(([a, b, c, d]) => new EqualSum([a, b], [c, d])),
];
