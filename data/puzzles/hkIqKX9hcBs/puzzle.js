// Title: Cut In Half
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=hkIqKX9hcBs
// Source: https://app.crackingthecryptic.com/sudoku/4P97DPpdQ4

// Normal sudoku rules apply (default 9x9, standard 3x3 boxes).
// Digits may not repeat along the main diagonal marked in blue: the drawn
// line runs R9C1-R8C2-...-R1C9 (the '/' diagonal), i.e. Diagonal(1).
// Anti-knight: cells a knight's move apart cannot repeat a digit.
// Little-killer-style outside diagonal sums: the six outside numbers give the
// sum of every digit along the indicated diagonal (repeats allowed).
// Grey lines are palindromes: each line must read the same forwards and
// backwards.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Grey palindrome lines, transcribed from the drawn line waypoints. Each
// re-enters a region, which only affects the descriptive per-region walk
// order, not the palindrome itself: each line is one 9-cell sequence.
const palindromes = [
  new Palindrome(
    'R1C6', 'R2C6', 'R3C5', 'R3C4', 'R4C3', 'R5C2', 'R6C2', 'R7C2', 'R6C1'),
  new Palindrome(
    'R4C9', 'R3C8', 'R4C8', 'R5C8', 'R6C7', 'R7C6', 'R7C5', 'R8C4', 'R9C4'),
];

// Outside diagonal sums, read from each arrow's drawn entry cell + heading
// and cross-checked against its paired outside-clue text position. fromCells
// finds the matching canonical diagonal, walked from the start cell in the
// given (dRow, dCol) direction.
const littleKillers = [
  LittleKiller.fromCells(10, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R5C1', -1, 1), geometry),
  LittleKiller.fromCells(16, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(24, graph.ray('R9C4', -1, -1), geometry),
  LittleKiller.fromCells(11, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(30, graph.ray('R6C9', 1, -1), geometry),
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new AntiKnight(),
  ...palindromes,
  ...littleKillers,
];
