// Title: Courtyard
// Author: Sotek
// Video: https://www.youtube.com/watch?v=cJJ7AUs9GvA
// Source: https://app.crackingthecryptic.com/sudoku/dqNdpph4Gb

// Normal sudoku rules apply. Both main diagonals are no-repeat. Fourteen
// cages are drawn; each is all-different internally, and where a total is
// printed the cage's digits must sum to it. Two cages carry no printed
// total (payload `value: ''`) and are encoded as AllDifferent only.

return [
  new Diagonal(1),
  new Diagonal(-1),

  new Cage(40, 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C2', 'R4C2'),
  new AllDifferent('R1C8', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9', 'R3C8', 'R4C8', 'R5C8'),
  new AllDifferent('R5C2', 'R6C2', 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R9C2'),
  new Cage(40, 'R6C8', 'R7C8', 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R9C8'),

  new Cage(15, 'R3C3', 'R3C4'),
  new Cage(15, 'R3C6', 'R3C7'),
  new Cage(15, 'R7C3', 'R7C4'),
  new Cage(15, 'R7C6', 'R7C7'),
  new Cage(9, 'R6C5', 'R7C5'),
  new Cage(10, 'R3C5', 'R4C5'),
  new Cage(18, 'R4C7', 'R5C7', 'R6C7'),
  new Cage(18, 'R4C3', 'R5C3', 'R6C3'),
  new Cage(7, 'R1C3', 'R1C4'),
  new Cage(9, 'R9C6', 'R9C7'),
];
