// Title: 20/20 Vision
// Author: Ian Corper
// Video: https://www.youtube.com/watch?v=7Xiwz-z-sK0
// Source: https://app.crackingthecryptic.com/sudoku/hL28FggBj3

// Normal sudoku rules apply (standard rows/columns/boxes from Shape('9x9')).
// Digits cannot repeat within a cage, which shows their sum -- Cage(sum,
// ...cells). Every cage happens to sum to 20.
const cages = [
  new Cage(20, 'R1C2', 'R1C3', 'R2C3'),
  new Cage(20, 'R1C1', 'R2C1', 'R3C1', 'R3C2'),
  new Cage(20, 'R4C3', 'R5C3', 'R5C4', 'R6C4', 'R6C5'),
  new Cage(20, 'R4C1', 'R5C1', 'R6C1', 'R7C1'),
  new Cage(20, 'R8C1', 'R8C2', 'R9C2'),
  new Cage(20, 'R7C4', 'R7C5', 'R8C5'),
  new Cage(20, 'R8C4', 'R9C4', 'R9C5', 'R9C6'),
  new Cage(20, 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9'),
  new Cage(20, 'R3C7', 'R3C8', 'R3C9', 'R4C9'),
  new Cage(20, 'R3C5', 'R3C6', 'R4C5', 'R4C6'),
  new Cage(20, 'R1C5', 'R2C4', 'R2C5'),
  new Cage(20, 'R4C8', 'R5C8', 'R5C9', 'R6C8'),
  new Cage(20, 'R4C7', 'R5C7', 'R6C6', 'R6C7'),
  new Cage(20, 'R8C7', 'R8C8', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(20, 'R7C8', 'R7C9', 'R8C9'),
];

// Numbers along an arrow sum to the digit in the circle -- Arrow(bulb,
// ...restOfLine). Both bulbs are drawn on-grid (no separate outside cell),
// so the bulb cell's own digit is the sum.
const arrows = [
  new Arrow('R5C4', 'R4C5', 'R5C6'),
  new Arrow('R4C4', 'R3C3', 'R2C2', 'R1C1'),
];

// X joins two orthogonally adjacent cells whose digits sum to 10 -- X(a, b).
// "Not all X's may be given" means the drawn X's are the only guaranteed
// sum-to-10 pairs; unmarked adjacent pairs are not thereby forbidden from
// summing to 10, so no negative/exhaustive form is used.
const xMarks = [
  new X('R2C2', 'R3C2'),
  new X('R3C1', 'R4C1'),
  new X('R4C1', 'R4C2'),
  new X('R5C3', 'R6C3'),
  new X('R6C2', 'R7C2'),
  new X('R7C1', 'R8C1'),
  new X('R8C2', 'R8C3'),
  new X('R8C5', 'R8C6'),
  new X('R8C7', 'R9C7'),
  new X('R1C6', 'R1C7'),
  new X('R2C6', 'R2C7'),
  new X('R1C8', 'R2C8'),
  new X('R4C7', 'R4C8'),
  new X('R4C9', 'R5C9'),
  new X('R8C8', 'R8C9'),
];

return [
  new Shape('9x9'),
  new Given('R1C4', 4),
  new Given('R2C5', 5),
  new Given('R3C5', 2),
  new Given('R3C6', 6),
  new Given('R6C4', 3),
  ...cages,
  ...arrows,
  ...xMarks,
];
