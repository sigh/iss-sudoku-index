// Title: The Tau Sudoku
// Author: Raf Coremans
// Video: https://www.youtube.com/watch?v=M6CnVOzCn7o
// Source: https://cracking-the-cryptic.web.app/sudoku/RNbpGThQTg

// Normal sudoku rules apply (default 3x3 boxes, which match the payload's
// drawn regions exactly). Within cages, digits cannot repeat. Every printed
// number in the grid is lying: it must be exactly one less or one greater
// than the digit/total actually there, so every printed clue digit and every
// printed cage total is encoded as a two-way disjunction rather than at face
// value.

// Printed liar-clue digits (drawn as small pencil-mark numerals rather than
// solid givens). Each is restricted to the one or two values one away from
// the printed digit; 0 and 9 only have one in-range neighbour (1 and 8
// respectively).
const liarGivens = [
  new Given('R1C3', 1, 3),
  new Given('R1C4', 7, 9),
  new Given('R1C5', 5, 7),
  new Given('R1C6', 1, 3),
  new Given('R1C7', 7, 9),
  new Given('R2C2', 4, 6),
  new Given('R2C8', 2, 4),
  new Given('R3C1', 1, 3),
  new Given('R3C9', 2),
  new Given('R4C1', 8),
  new Given('R4C9', 7, 9),
  new Given('R5C1', 5, 7),
  new Given('R5C5', 1),
  new Given('R5C9', 4, 6),
  new Given('R6C1', 6, 8),
  new Given('R6C6', 2),
  new Given('R6C9', 2, 4),
  new Given('R7C1', 3, 5),
  new Given('R7C9', 1),
  new Given('R8C2', 5, 7),
  new Given('R8C8', 6, 8),
  new Given('R9C3', 7, 9),
  new Given('R9C4', 4, 6),
  new Given('R9C5', 8),
  new Given('R9C6', 6, 8),
  new Given('R9C7', 2),
];

// Six 6-cell killer cages. A printed total is itself a liar clue, so each
// totalled cage becomes an Or of the two cages one away from the printed
// number; distinctness holds either way. The two cages drawn with no total
// keep only their distinctness.
const cages = [
  new Or([
    new Cage(32, 'R3C1', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R1C2'),
    new Cage(34, 'R3C1', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R1C2'),
  ]),
  new Or([
    new Cage(26, 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C5', 'R3C5'),
    new Cage(28, 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C5', 'R3C5'),
  ]),
  new AllDifferent('R2C6', 'R2C7', 'R2C8', 'R2C9', 'R1C8', 'R1C7'),
  new Or([
    new Cage(26, 'R3C4', 'R4C4', 'R5C4', 'R4C5', 'R5C5', 'R6C5'),
    new Cage(28, 'R3C4', 'R4C4', 'R5C4', 'R4C5', 'R5C5', 'R6C5'),
  ]),
  new AllDifferent('R6C4', 'R7C4', 'R7C5', 'R8C5', 'R8C6', 'R9C6'),
  new Or([
    new Cage(30, 'R8C7', 'R9C7', 'R8C8', 'R7C8', 'R7C9', 'R6C9'),
    new Cage(32, 'R8C7', 'R9C7', 'R8C8', 'R7C8', 'R7C9', 'R6C9'),
  ]),
];

return [
  new Shape('9x9'),
  ...liarGivens,
  ...cages,
];
