// Title: Mini Palindromes
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=5Y0zGCrwu8Q
// Source: https://app.crackingthecryptic.com/sudoku/4Bqg3BgfBg

// Normal sudoku rules apply (default 9x9, standard 3x3 boxes).
// Killer cages: digits sum to the printed total, no repeated digit in a cage.
// Anti-knight: cells a knight's move apart cannot repeat a digit.
// Little-killer-style outside diagonal sums: the six outside numbers give the
// sum of every digit along the indicated diagonal (repeats allowed).
// Grey lines are 2-cell palindromes: each pair of cells must hold the same
// digit (a 2-term sequence reads the same forwards/backwards only if both
// terms are equal). A 21st grey-line payload entry carries no waypoints and
// is not drawn anywhere in the grid; omitted as a decode stub, not a clue.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// The four killer cages (source array also carries title/author/rules
// metadata stubs alongside these, which are not cages).
const cages = [
  new Cage(6, 'R1C2', 'R2C2'),
  new Cage(12, 'R2C8', 'R2C9'),
  new Cage(8, 'R8C1', 'R8C2'),
  new Cage(14, 'R8C8', 'R9C8'),
];

// Grey palindrome lines, transcribed from the drawn line waypoints.
const palindromePairs = [
  ['R1C3', 'R2C4'], ['R2C3', 'R3C4'], ['R1C7', 'R2C6'], ['R2C7', 'R3C6'],
  ['R3C5', 'R4C6'], ['R3C1', 'R4C2'], ['R3C2', 'R4C3'], ['R3C8', 'R4C7'],
  ['R4C8', 'R3C9'], ['R5C7', 'R6C6'], ['R5C3', 'R4C4'], ['R6C4', 'R7C5'],
  ['R6C2', 'R7C1'], ['R6C3', 'R7C2'], ['R6C7', 'R7C8'], ['R6C8', 'R7C9'],
  ['R7C4', 'R8C3'], ['R8C4', 'R9C3'], ['R7C6', 'R8C7'], ['R8C6', 'R9C7'],
];
const palindromes = palindromePairs.map(cells => new Palindrome(...cells));

// Outside diagonal sums, read from each arrow's drawn corner + heading and
// cross-checked against its paired outside-clue text position. fromCells
// finds the matching canonical diagonal, walked from the start cell in the
// given (dRow, dCol) direction.
const littleKillers = [
  LittleKiller.fromCells(30, graph.ray('R1C3', 1, 1), geometry),
  LittleKiller.fromCells(23, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(40, graph.ray('R3C9', 1, -1), geometry),
  LittleKiller.fromCells(40, graph.ray('R9C7', -1, -1), geometry),
  LittleKiller.fromCells(30, graph.ray('R7C1', -1, 1), geometry),
  LittleKiller.fromCells(37, graph.ray('R4C1', 1, 1), geometry),
];

return [
  new Shape('9x9'),
  ...cages,
  new AntiKnight(),
  ...palindromes,
  ...littleKillers,
];
