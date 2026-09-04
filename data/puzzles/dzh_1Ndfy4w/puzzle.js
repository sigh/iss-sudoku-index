// Title: XII
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=dzh_1Ndfy4w
// Source: https://sudokupad.app/tnoai9qlvv
//
// Place 1-9 once each in every row and column (no box regions -- a Latin
// square variant). No digit shares an edge with a consecutive digit -- a
// global rule applying to every orthogonally-adjacent pair in the grid, not
// only marked ones. Each drawn straight line is a palindrome.
//
// The drawn lines are 24 distinct 2-cell diagonal segments (deduplicated from
// the payload, which draws several of them two or three times over in
// different colours for a cosmetic "X" effect). They form 12 pairs crossing
// at a lattice point, one "X" over each of 12 non-overlapping 2x2 blocks,
// matching the video's own title "The Twelve X Sudoku". A 2-cell palindrome
// forces its two endpoints equal, matching the rules' own worked example
// (R3C1=R4C2).

// The 12 X-marked 2x2 blocks, each as [main-diagonal pair, anti-diagonal
// pair], transcribed from the deduplicated drawn diagonal segments.
const X_BLOCKS = [
  [['R1C3', 'R2C4'], ['R1C4', 'R2C3']],
  [['R1C6', 'R2C7'], ['R1C7', 'R2C6']],
  [['R1C8', 'R2C9'], ['R1C9', 'R2C8']],
  [['R3C1', 'R4C2'], ['R3C2', 'R4C1']],
  [['R3C3', 'R4C4'], ['R3C4', 'R4C3']],
  [['R3C8', 'R4C9'], ['R3C9', 'R4C8']],
  [['R6C1', 'R7C2'], ['R6C2', 'R7C1']],
  [['R6C6', 'R7C7'], ['R6C7', 'R7C6']],
  [['R6C8', 'R7C9'], ['R6C9', 'R7C8']],
  [['R8C1', 'R9C2'], ['R8C2', 'R9C1']],
  [['R8C3', 'R9C4'], ['R8C4', 'R9C3']],
  [['R8C6', 'R9C7'], ['R8C7', 'R9C6']],
];

const xPalindromes = X_BLOCKS.flatMap(diagonals =>
  diagonals.map(cells => new Palindrome(...cells)));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new AntiConsecutive(),

  new Given('R1C5', 4),
  new Given('R7C4', 2),
  new Given('R7C6', 7),
  new Given('R8C5', 9),
  new Given('R9C2', 6),
  new Given('R9C8', 5),

  ...xPalindromes,
];
