// Title: January 17, 2022: Echo
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=0sOQm77GSSA
// Source: https://tinyurl.com/4t5fhjy

// Normal sudoku rules apply (standard box regions, implicit row/column/box
// all-different). Digits in cages cannot repeat and must sum to the total
// given. One drawn cage (R5C1,R6C1) carries no printed total in the source
// data, so only its no-repeat constraint is encoded for it.

const givens = [
  new Given('R3C4', 8),
  new Given('R3C5', 5),
  new Given('R4C2', 4),
  new Given('R4C4', 6),
  new Given('R5C5', 9),
  new Given('R6C6', 2),
  new Given('R6C8', 3),
  new Given('R7C5', 7),
  new Given('R7C6', 1),
];

// Killer cages, transcribed from the source's drawn `killercage` data
// (cells and totals).
const cages = [
  new Cage(3, 'R3C1', 'R4C1'),
  new Cage(4, 'R3C2', 'R3C3'),
  new Cage(5, 'R2C3', 'R2C4'),
  new Cage(6, 'R1C4', 'R1C5'),
  new Cage(7, 'R1C6', 'R1C7'),
  new Cage(9, 'R2C7', 'R2C8'),
  new Cage(8, 'R3C8', 'R4C8'),
  new Cage(10, 'R4C9', 'R5C9'),
  new Cage(11, 'R6C9', 'R7C9'),
  new Cage(12, 'R7C7', 'R7C8'),
  new Cage(13, 'R8C6', 'R8C7'),
  new Cage(14, 'R9C5', 'R9C6'),
  new Cage(16, 'R9C3', 'R9C4'),
  new Cage(15, 'R8C2', 'R8C3'),
  new Cage(17, 'R6C2', 'R7C2'),
];

// R5C1,R6C1 is drawn as a killer cage with no total in the source data, so
// only its distinctness applies.
const untotaledCage = new AllDifferent('R5C1', 'R6C1');

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  untotaledCage,
];
