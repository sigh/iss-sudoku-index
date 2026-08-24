// Title: Di5jointed
// Author: David Alderson
// Video: https://www.youtube.com/watch?v=E0LnfeuoHMg
// Source: https://app.crackingthecryptic.com/sudoku/Fp4tJQJrmF

// Normal sudoku rules apply, and no digit appears in the same position
// within two 3x3 boxes ("disjoint groups"). Cages show their sums (no
// repeats within a cage, standard convention). The grey line is a
// palindrome, reading the same in either direction. No givens.

// The grey line's drawn path repeatedly cuts diagonally through a box
// corner (e.g. R1C1 -> R2C2) rather than following grid edges; Palindrome
// binds consecutive pairs by list order, not by grid adjacency, so the
// diagonal jumps below are faithful to the drawn stroke.
const palindromeCells = [
  'R1C1', 'R2C2', 'R3C1', 'R3C2', 'R4C1', 'R4C2', 'R5C2', 'R5C3', 'R5C4',
  'R6C5', 'R5C6', 'R4C6', 'R3C6', 'R3C5', 'R3C4', 'R2C4', 'R1C4', 'R1C5',
  'R1C6', 'R2C7', 'R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C8', 'R8C8',
  'R9C8', 'R9C7', 'R9C6', 'R8C6', 'R8C5', 'R8C4', 'R9C3', 'R9C2', 'R8C1',
  'R8C2', 'R8C3', 'R7C2',
];

// Seven 2-cell killer cages, from the drawn cage totals.
const cages = [
  [11, 'R1C2', 'R1C3'],
  [11, 'R3C1', 'R3C2'],
  [11, 'R1C5', 'R1C6'],
  [3, 'R8C6', 'R9C6'],
  [12, 'R5C7', 'R5C8'],
  [7, 'R5C9', 'R6C9'],
  [8, 'R7C9', 'R8C9'],
];

return [
  new Shape('9x9'),
  new DisjointSets(),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new Palindrome(...palindromeCells),
];
