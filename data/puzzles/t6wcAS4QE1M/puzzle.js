// Title: Discombobulated
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=t6wcAS4QE1M
// Source: https://app.crackingthecryptic.com/sudoku/QG9PRqnJg2

// Rules encoded: normal sudoku (standard 9x9 boxes, 0 givens); 5 arrows
// (circle = sum of arm cells); 3 killer cages (sum + no-repeat -- each cage's
// cells sit inside a single box, so the no-repeat half of Cage duplicates the
// box all-different rather than adding new constraint); 3 purple lines
// (consecutive digits, any order = Renban); disjoint groups (identical digit
// cannot occupy the same within-box position in two different boxes).

// --- Arrows. Cited from the puzzle's drawn arrow paths: each arrow's first
// cell lands on one of the 5 drawn circles, confirming the circle cell is the
// arrow's own first (sum) cell; the remaining cells are the arm in path
// order (some arms bend through a diagonally adjacent cell, not just
// orthogonally -- the drawn segment length matches a single diagonal step
// each time, so no cell is skipped along the way).
const arrows = [
  new Arrow('R2C8', 'R3C7', 'R2C6', 'R2C5'),
  new Arrow('R2C2', 'R2C1', 'R1C1', 'R1C2'),
  new Arrow('R5C5', 'R4C5', 'R4C4', 'R5C4'),
  new Arrow('R8C8', 'R8C7', 'R7C7', 'R7C8'),
  new Arrow('R8C4', 'R9C3', 'R8C2', 'R7C3'),
];

// --- Cages. Cited from the puzzle's drawn cage outlines and totals.
const cages = [
  new Cage(8, 'R1C8', 'R1C7', 'R2C7'),
  new Cage(11, 'R4C8', 'R4C7'),
  new Cage(9, 'R7C1', 'R8C1'),
];

// --- Purple lines. Cited from the puzzle's 3 drawn purple lines;
// "consecutive digits in any order" = Renban.
const renbans = [
  new Renban('R2C3', 'R3C3', 'R3C2'),
  new Renban('R5C6', 'R6C6', 'R6C5'),
  new Renban('R8C9', 'R9C9', 'R9C8'),
];

return [
  new Shape('9x9'),
  new DisjointSets(),
  ...arrows,
  ...cages,
  ...renbans,
];
