// Title: A Puzzle Palindrome
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=K7LvoN0w2oA
// Source: https://cracking-the-cryptic.web.app/sudoku/p8b67RB9J9

// Normal sudoku (rows, columns, standard 3x3 boxes). No givens.
//
// The payload carries no rules text anywhere (no metadata object, no rules
// field). Only the sixteen killer cages below are recoverable as a rule: each
// cage's cells sum to the printed total, no digit repeated within a cage
// (Cage's built-in semantics). The 15 cells no cage covers are shaded light
// grey and form one king-move-connected path, and six unlabelled black dots
// sit on cell edges; neither has any stated meaning anywhere in the archived
// evidence, so both are omitted.

const cages = [
  new Cage(25, 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3'),
  new Cage(12, 'R3C1', 'R3C2'),
  new Cage(22, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(21, 'R1C7', 'R1C8', 'R1C9', 'R2C9'),
  new Cage(24, 'R2C7', 'R2C8', 'R3C8', 'R3C9', 'R4C9'),
  new Cage(23, 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Cage(20, 'R4C2', 'R5C2', 'R5C3', 'R6C2'),
  new Cage(22, 'R6C3', 'R7C2', 'R7C3'),
  new Cage(22, 'R8C2', 'R9C2', 'R9C3'),
  new Cage(12, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(20, 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(22, 'R7C8', 'R7C9', 'R8C8'),
  new Cage(20, 'R4C8', 'R5C8', 'R5C9', 'R6C8', 'R6C9'),
  new Cage(22, 'R5C7', 'R6C6', 'R6C7', 'R7C5', 'R7C6', 'R7C7'),
  new Cage(12, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(21, 'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R6C4'),
];

return [
  new Shape('9x9'),
  ...cages,
];
