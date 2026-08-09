// Title: Palettes and Palindromes
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=9V0KY4KUbgU
// Source: https://app.crackingthecryptic.com/sudoku/j6rbqPj8b6

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Ten 2-cell killer cages sum to 9 (top-left small clue).
// One outside diagonal-sum clue reads 16, on the diagonal starting at R7C1
// running down-right. Twelve grey lines are palindromes. Black dots are
// Kropki ratio (1:2); white dots are Kropki consecutive. The rules state not
// all possible dots are drawn, so undotted adjacent pairs carry no
// constraint -- no negative dot constraint is encoded.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const cages = [
  ['R1C2', 'R1C3'],
  ['R2C1', 'R3C1'],
  ['R1C7', 'R2C7'],
  ['R1C8', 'R2C8'],
  ['R1C9', 'R2C9'],
  ['R9C7', 'R9C8'],
  ['R7C9', 'R8C9'],
  ['R8C3', 'R9C3'],
  ['R8C2', 'R9C2'],
  ['R8C1', 'R9C1'],
].map(cells => new Cage(9, ...cells));

const palindromes = [
  ['R5C1', 'R4C1', 'R3C2', 'R2C3', 'R1C4'],
  ['R1C5', 'R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R5C9', 'R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R9C5', 'R9C4', 'R8C3', 'R7C2', 'R6C1'],
  ['R4C2', 'R3C3', 'R2C4'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R6C8', 'R7C7', 'R8C6'],
  ['R8C4', 'R7C3', 'R6C2'],
  ['R4C3', 'R3C4', 'R3C5'],
  ['R3C6', 'R4C7', 'R5C7'],
  ['R6C7', 'R7C6', 'R7C5'],
  ['R7C4', 'R6C3', 'R5C3'],
].map(cells => new Palindrome(...cells));

const blackDots = [
  ['R4C3', 'R5C3'],
  ['R4C9', 'R5C9'],
].map(cells => new BlackDot(...cells));

const whiteDots = [
  ['R4C2', 'R4C3'],
  ['R5C1', 'R6C1'],
  ['R5C3', 'R6C3'],
  ['R1C4', 'R1C5'],
  ['R4C8', 'R4C9'],
  ['R3C5', 'R3C6'],
  ['R5C7', 'R6C7'],
  ['R7C4', 'R7C5'],
  ['R9C5', 'R9C6'],
  ['R6C4', 'R6C5'],
].map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),

  ...cages,
  ...palindromes,
  ...blackDots,
  ...whiteDots,

  // Outside diagonal-sum clue, drawn on the left edge pointing down-right
  // into the grid: total 16 along R7C1, R8C2, R9C3.
  LittleKiller.fromCells(16, graph.ray('R7C1', 1, 1), geometry),
];
