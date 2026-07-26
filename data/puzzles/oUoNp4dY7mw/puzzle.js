// Title: The Magical Ingredients
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=oUoNp4dY7mw
// Source: https://sudokupad.app/pyv0ykw8h5

// Normal sudoku rules apply. Each purple line is a Renban (non-repeating
// consecutive digits, any order). Each cage sums to the clue in its top-left
// cell, with no repeated digits within a cage.

const cages = [
  new Cage(15, 'R3C5', 'R4C4', 'R4C5', 'R5C3', 'R5C4'),
  new Cage(35, 'R1C3', 'R2C2', 'R2C3', 'R3C1', 'R3C2'),
  new Cage(12, 'R9C7', 'R9C8'),
  new Cage(10, 'R6C7', 'R7C7'),
  new Cage(15, 'R1C7', 'R2C7', 'R3C6', 'R3C7'),
  new Cage(10, 'R7C9', 'R8C9'),
];

const renbans = [
  new Renban('R5C7', 'R5C6', 'R6C6', 'R6C5', 'R7C5'),
  new Renban('R3C5', 'R3C4', 'R4C3', 'R5C3', 'R6C3'),
  new Renban('R3C3', 'R2C4', 'R2C5', 'R3C6', 'R4C6', 'R5C5'),
  new Renban('R9C3', 'R9C4', 'R9C5'),
  new Renban('R4C1', 'R4C2'),
  new Renban('R5C8', 'R6C8'),
  new Renban('R4C7', 'R4C8'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...renbans,
];
