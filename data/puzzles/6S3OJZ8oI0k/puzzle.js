// Title: Tangled
// Author: DVFrank
// Video: https://www.youtube.com/watch?v=6S3OJZ8oI0k
// Source: https://app.crackingthecryptic.com/sudoku/PBhtdrb4Mr

// Normal sudoku rules apply (standard 3x3 boxes; no irregular regions).
// Cages show their sums; each cage's digits are all different (Cage's default).
// One inequality sign sits between R4C3 and R4C4, drawn as a chevron whose
// point rests in R4C4; the rules state the sign points at the lower digit, so
// R4C3 > R4C4.

const cages = [
  new Cage(5, 'R1C1', 'R1C2'),
  new Cage(15, 'R2C3', 'R3C2', 'R3C3'),
  new Cage(12, 'R4C1', 'R5C1', 'R5C2', 'R6C1'),
  new Cage(15, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(12, 'R8C5', 'R9C4', 'R9C5', 'R9C6'),
  new Cage(7, 'R4C5', 'R5C5', 'R5C6'),
  new Cage(12, 'R1C4', 'R1C5', 'R2C5'),
  new Cage(8, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(12, 'R4C7', 'R4C8'),
  new Cage(12, 'R5C8', 'R5C9', 'R6C9'),
  new Cage(5, 'R8C9', 'R9C9'),
  new Cage(15, 'R7C7', 'R7C8', 'R8C7'),
  new Cage(12, 'R2C6', 'R3C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  new GreaterThan('R4C3', 'R4C4'),
];
