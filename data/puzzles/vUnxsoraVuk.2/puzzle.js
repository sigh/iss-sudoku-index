// Title: Get My Bearings
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=vUnxsoraVuk
// Source: https://tinyurl.com/fttv8phz
//
// Normal sudoku rules apply. Digits along an arrow sum to the digit in that
// arrow's circled cell -> one Arrow(circle, ...shaft) per arrow. Each circled
// cell is itself a given digit; the shaft is the remaining two cells of the
// drawn arrow path.
const givens = {
  R1C6: 9, R2C6: 7, R3C6: 5,
  R4C1: 5, R4C2: 2, R4C3: 8,
  R5C5: 1,
  R6C7: 7, R6C8: 9, R6C9: 8,
  R7C4: 9, R8C4: 8, R9C4: 6,
};

const arrows = [
  ['R1C6', 'R2C7', 'R3C8'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R3C6', 'R4C7', 'R5C8'],
  ['R4C1', 'R3C2', 'R2C3'],
  ['R4C2', 'R3C3', 'R2C4'],
  ['R4C3', 'R3C4', 'R2C5'],
  ['R6C7', 'R7C6', 'R8C5'],
  ['R6C8', 'R7C7', 'R8C6'],
  ['R6C9', 'R7C8', 'R8C7'],
  ['R7C4', 'R6C3', 'R5C2'],
  ['R8C4', 'R7C3', 'R6C2'],
  ['R9C4', 'R8C3', 'R7C2'],
];

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(cells => new Arrow(...cells)),
];
