// Title: November 14, 2021: Say Eight!
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=jAtVtoRCW00
// Source: https://tinyurl.com/scybh8

// Normal sudoku rules apply (standard rows/columns/boxes from Shape('9x9')).
// Digits within a cage cannot repeat and sum to the printed total --
// Cage(sum, ...cells). Every given and every cage total in this puzzle is 8.
const cages = [
  new Cage(8, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(8, 'R1C9', 'R2C9', 'R3C9'),
  new Cage(8, 'R9C7', 'R9C8', 'R9C9'),
  new Cage(8, 'R7C1', 'R8C1', 'R9C1'),
  new Cage(8, 'R7C2', 'R7C3'),
  new Cage(8, 'R2C3', 'R2C4'),
  new Cage(8, 'R6C6', 'R7C6'),
  new Cage(8, 'R5C9', 'R6C9'),
  new Cage(8, 'R4C1', 'R5C1'),
  new Cage(8, 'R6C1', 'R6C2'),
  new Cage(8, 'R4C3', 'R4C4'),
  new Cage(8, 'R7C5', 'R8C5'),
  new Cage(8, 'R8C6', 'R9C6'),
  new Cage(8, 'R6C8', 'R7C8'),
  new Cage(8, 'R4C8', 'R4C9'),
  new Cage(8, 'R3C7', 'R3C8'),
  new Cage(8, 'R4C6', 'R5C6', 'R5C7'),
  new Cage(8, 'R3C4', 'R3C5', 'R4C5'),
];

return [
  new Shape('9x9'),
  new Given('R1C6', 8),
  new Given('R2C8', 8),
  new Given('R3C1', 8),
  new Given('R4C7', 8),
  new Given('R6C3', 8),
  new Given('R7C9', 8),
  new Given('R8C2', 8),
  new Given('R9C4', 8),
  ...cages,
];
