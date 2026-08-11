// Title: Pulsar
// Author: Jeet Sampat
// Video: https://www.youtube.com/watch?v=cW9TWSFsaZ0
// Source: https://app.crackingthecryptic.com/sudoku/ngJ7MLBQLd

// In cages, digits sum to the small clue in the top-left corner and cannot
// repeat within the cage.
const cages = [
  new Cage(28, 'R4C1', 'R3C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3', 'R1C4'),
  new Cage(42, 'R1C6', 'R1C7', 'R1C8', 'R2C8', 'R2C9', 'R3C9', 'R4C9'),
  new Cage(40, 'R2C5', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R5C8'),
  new Cage(19, 'R2C4', 'R2C3', 'R3C3', 'R3C2', 'R4C2'),
  new Cage(40, 'R5C2', 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4', 'R8C5'),
  new Cage(42, 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(21, 'R7C4', 'R7C5', 'R7C6'),
  new Cage(19, 'R6C8', 'R7C8', 'R7C7', 'R8C7', 'R8C6'),
  new Cage(28, 'R6C9', 'R7C9', 'R8C9', 'R8C8', 'R9C8', 'R9C7', 'R9C6'),
];

// Single drawn white dot, between R4C5 and R5C5. Rules say not all possible
// dots are given, so no negative (non-consecutive) inference is made on
// unmarked adjacent cells.
const whiteDots = [
  new WhiteDot('R4C5', 'R5C5'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whiteDots,
];
