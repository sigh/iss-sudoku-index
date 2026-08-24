// Title: Disjointed Knights
// Author: Memeristor
// Video: https://www.youtube.com/watch?v=s1-oOx9xINs
// Source: https://app.crackingthecryptic.com/sudoku/6B6T8TLbFH

// Normal sudoku rules apply (rows, columns, boxes). Identical cells cannot be
// a knight's move apart. Identical cells cannot appear within the same
// position in two 3x3 boxes. Grey lines are palindromes. A clue outside the
// grid shows the sum of the indicated diagonal, which may include repeats
// (the diagonal cells are not otherwise all-different, so this is descriptive).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const givens = [
  new Given('R2C6', 4),
  new Given('R2C9', 6),
  new Given('R3C7', 4),
  new Given('R5C3', 9),
  new Given('R5C6', 1),
  new Given('R5C9', 2),
  new Given('R6C4', 9),
  new Given('R6C7', 1),
  new Given('R8C3', 8),
  new Given('R8C6', 7),
  new Given('R8C9', 3),
  new Given('R9C4', 8),
  new Given('R9C7', 7),
];

// Grey lines (drawn colour #CFCFCF), transcribed from the drawn cell path.
const palindromes = [
  new Palindrome('R2C1', 'R3C2', 'R4C3'),
  new Palindrome('R2C3', 'R3C4'),
  new Palindrome('R2C4', 'R3C5', 'R4C6'),
  new Palindrome('R2C7', 'R3C8', 'R4C9'),
  new Palindrome('R5C1', 'R6C2', 'R7C3'),
  new Palindrome('R5C4', 'R6C5', 'R7C6'),
  new Palindrome('R5C7', 'R6C8', 'R7C9'),
];

// Outside diagonal-sum clues. Both arrows are drawn down-right (the off-grid
// waypoint and overlay both sit above/left of the grid, ray direction (1, 1)).
const littleKillers = [
  LittleKiller.fromCells(24, graph.ray('R1C2', 1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R7C1', 1, 1), geometry),
];

return [
  new Shape('9x9'),
  ...givens,
  ...palindromes,
  ...littleKillers,
  new AntiKnight(),
  new DisjointSets(),
];
