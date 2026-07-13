// Title: Cantor's Blue!
// Author: Mateo99
// Video: https://www.youtube.com/watch?v=noCVJzMy9t4
// Source: https://sudokupad.app/6nqzhupznu

// Normal sudoku rules apply. Digits in cages do not repeat and sum to the
// total shown. Digits along an arrow sum to the number in the bulb. Digits
// along a grey line read the same forwards and backwards.

const givens = [
  new Given('R2C6', 6),
];

// Cages: distinct digits summing to the shown total.
const cages = [
  new Cage(14, 'R1C1', 'R1C2'),
  new Cage(8, 'R8C5', 'R9C5'),
  new Cage(8, 'R7C7', 'R8C7', 'R9C7'),
  new Cage(12, 'R6C3', 'R6C4', 'R6C5', 'R6C6'),
  new Cage(10, 'R7C3', 'R8C3', 'R9C3'),
];

// Arrows: bulb (first cell) equals the sum of the arm cells.
const arrows = [
  new Arrow('R4C3', 'R5C2', 'R5C1'),
  new Arrow('R2C3', 'R3C2', 'R3C1'),
  new Arrow('R2C7', 'R1C6', 'R1C5', 'R1C4'),
  new Arrow('R4C4', 'R3C4', 'R3C5'),
  new Arrow('R4C5', 'R3C6'),
  new Arrow('R6C7', 'R5C8', 'R5C9'),
  new Arrow('R7C9', 'R8C8', 'R9C9'),
];

// Grey lines: palindromes (read the same forwards and backwards).
const palindromes = [
  new Palindrome('R9C2', 'R9C3', 'R8C4', 'R8C5'),
  new Palindrome('R5C4', 'R6C4', 'R7C5', 'R7C6'),
  new Palindrome('R6C3', 'R7C2'),
  new Palindrome('R4C6', 'R4C7', 'R3C8', 'R3C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...arrows,
  ...palindromes,
];
