// Title: A River Runs Through
// Author: Bees?
// Video: https://www.youtube.com/watch?v=x0u68KsZYvA
// Source: https://app.crackingthecryptic.com/sudoku/LRg3rJQjPt

// Normal sudoku rules apply (default row/column/box all-different from Shape).
// Grey circles/squares are candidate restrictions to odd/even digits, encoded
// as multi-value Givens (no dedicated Odd/Even class).
// The cage sums its cells and requires them distinct ("in cages, digits must
// sum to..." -- standard killer-cage convention; contrast with the outside
// diagonals below, whose "digits can repeat" is stated explicitly because it
// is the exception).
// The outside clues give a diagonal's sum with repeats allowed: LittleKiller.
// Each ray is built from the drawn arrow's start cell and direction, which
// each arrow's own path/bulb fixes unambiguously.
// The two grey lines are palindromes (rule states this directly).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Grey squares -> even (underlays, fill=#cfcfcf shape 1x1).
  new Given('R1C1', 2, 4, 6, 8),
  new Given('R3C3', 2, 4, 6, 8),
  new Given('R7C7', 2, 4, 6, 8),
  new Given('R9C9', 2, 4, 6, 8),

  // Grey circles -> odd (underlays, fill=#cfcfcf circle 0.8x0.8).
  new Given('R1C8', 1, 3, 5, 7, 9),
  new Given('R2C7', 1, 3, 5, 7, 9),
  new Given('R8C3', 1, 3, 5, 7, 9),
  new Given('R9C2', 1, 3, 5, 7, 9),

  // Cage, sum 30 (the central 2x2 block).
  new Cage(30, 'R4C5', 'R4C6', 'R5C5', 'R5C6'),

  // Outside diagonal sums, digits may repeat. Each clue's arrow and its
  // number were paired by nearest spatial distance -- unambiguous, same
  // distance for every pair, no runner-up.
  LittleKiller.fromCells(22, graph.ray('R1C3', 1, 1), geometry),
  LittleKiller.fromCells(11, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(6, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(47, graph.ray('R3C1', 1, 1), geometry),

  // Palindrome lines.
  new Palindrome(
    'R3C1', 'R4C1', 'R4C2', 'R5C2', 'R5C3', 'R6C3', 'R6C4', 'R7C4', 'R7C5',
    'R8C5', 'R8C6', 'R9C6', 'R9C7'),
  new Palindrome(
    'R1C3', 'R1C4', 'R2C4', 'R2C5', 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R5C7',
    'R5C8', 'R6C8', 'R6C9', 'R7C9'),
];
