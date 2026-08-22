// Title: Not The Same
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=Ks30c_rwA4E
// Source: https://app.crackingthecryptic.com/sudoku/bQbNd7dfLM

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Grey lines are palindromes. Cages sum to the total in
// their top-left cell and are distinct within the cage (killer cage). Each
// outside clue gives the sum of every digit along the diagonal its arrow
// points into ("little killer"; digits may repeat). A black dot marks a
// 1:2 ratio between its two cells; per the rules an unmarked pair carries
// no meaning, so only the drawn dots are constrained.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Killer cages: cells and totals transcribed from the drawn cages.
const cages = [
  new Cage(4, 'R8C6', 'R9C6'),
  new Cage(15, 'R3C8', 'R3C9'),
  new Cage(10, 'R4C8', 'R4C9'),
  new Cage(10, 'R6C8', 'R6C9'),
  new Cage(10, 'R7C8', 'R7C9'),
  new Cage(9, 'R8C7', 'R9C7'),
  new Cage(9, 'R6C1', 'R6C2'),
  new Cage(9, 'R7C1', 'R7C2'),
];

// Palindrome (grey) lines, transcribed from the drawn waypoints. A seventh
// `lines` entry has no waypoints and renders nothing, so it is omitted.
const palindromes = [
  new Palindrome('R3C2', 'R3C1', 'R4C2', 'R4C1'),
  new Palindrome('R2C3', 'R1C3', 'R2C4', 'R1C4'),
  new Palindrome('R2C6', 'R1C6', 'R2C7', 'R1C7'),
  new Palindrome('R4C7', 'R5C7', 'R6C7', 'R7C6', 'R7C5', 'R7C4'),
  new Palindrome('R3C6', 'R3C5', 'R3C4', 'R4C3', 'R5C3', 'R6C3'),
  new Palindrome('R8C3', 'R9C3', 'R8C4', 'R9C4'),
];

// Black dots: 1:2 ratio, transcribed from the three edge-sized black
// overlays. The rules state dots are not exhaustive, so no negative
// (StrictKropki-style) constraint is added for unmarked adjacent pairs.
const blackDots = [
  new BlackDot('R5C4', 'R5C5'),
  new BlackDot('R5C5', 'R5C6'),
  new BlackDot('R6C1', 'R6C2'),
];

// Outside diagonal-sum clues: entry corner, direction, and total
// transcribed from the drawn arrows and their nearest clue-text badge.
const littleKillers = [
  LittleKiller.fromCells(23, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(22, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(13, graph.ray('R9C7', -1, 1), geometry),
];

return [
  new Shape('9x9'),
  ...cages,
  ...palindromes,
  ...blackDots,
  ...littleKillers,
];
