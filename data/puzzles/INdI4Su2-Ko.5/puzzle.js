// Title: June 27, 2022: Even Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=INdI4Su2-Ko
// Source: https://tinyurl.com/3edwfmu9

// Normal sudoku rules apply. Digits along thermometers must strictly
// increase (not necessarily consecutively) starting from the round bulb --
// encoded with Thermo(bulb, ..., tip). Digits in gray squares must be even --
// there is no dedicated Even class, so each gray cell is a candidate
// restriction to {2,4,6,8}.

const givens = [
  new Given('R1C3', 1),
  new Given('R3C7', 2),
  new Given('R7C3', 6),
  new Given('R9C7', 5),
];

// Thermometers, bulb-to-tip, from the "thermometer" lines arrays.
const thermos = [
  new Thermo('R6C2', 'R5C3', 'R4C4', 'R5C5', 'R6C6', 'R5C7', 'R4C8'),
  new Thermo('R5C6', 'R4C5', 'R3C4', 'R2C5', 'R1C6'),
  new Thermo('R9C4', 'R8C5', 'R7C6', 'R6C5', 'R5C4'),
  new Thermo('R2C2', 'R3C3', 'R4C2', 'R5C1'),
  new Thermo('R5C9', 'R6C8', 'R7C7', 'R8C8'),
];

// Gray (even) cells, from the "even" array.
const evenCells = [
  'R6C1', 'R5C2', 'R4C3', 'R6C3', 'R4C7', 'R6C7', 'R5C8', 'R4C9', 'R3C5', 'R7C5',
];
const evens = evenCells.map((cell) => new Given(cell, 2, 4, 6, 8));

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
  ...evens,
];
