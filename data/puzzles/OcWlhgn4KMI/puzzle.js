// Title: Thirteen
// Author: Klausku
// Video: https://www.youtube.com/watch?v=OcWlhgn4KMI
// Source: https://app.crackingthecryptic.com/sudoku/jHr9hRfm94

// Normal sudoku on standard 3x3 boxes, no givens. "Cages contain no repeated
// digits, and sum to the given total" -> killer cages (Cage bakes in the
// no-repeat clause).

const cages = [
  new Cage(13, 'R1C2', 'R1C3', 'R2C2', 'R3C2'),
  new Cage(12, 'R4C1', 'R4C2', 'R4C3'),
  new Cage(9, 'R5C3', 'R5C4'),
  new Cage(13, 'R6C2', 'R6C3', 'R6C4', 'R7C4'),
  new Cage(13, 'R7C2', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(18, 'R8C3', 'R8C4', 'R9C4'),
  new Cage(7, 'R8C5', 'R9C5'),
  new Cage(5, 'R4C5', 'R5C5'),
  new Cage(22, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(12, 'R2C7', 'R3C7', 'R4C7'),
  new Cage(13, 'R1C8', 'R1C9', 'R2C9', 'R3C9'),
  new Cage(19, 'R5C7', 'R5C8', 'R5C9'),
  new Cage(10, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(13, 'R7C9', 'R8C9', 'R9C8', 'R9C9'),
];

return [
  new Shape('9x9'),
  ...cages,
];
