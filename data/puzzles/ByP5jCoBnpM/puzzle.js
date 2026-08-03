// Title: Above Average On Average
// Author: Jeet Sampat
// Video: https://www.youtube.com/watch?v=ByP5jCoBnpM
// Source: https://app.crackingthecryptic.com/sudoku/P7DpbRmpJH

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Each clue outside the grid gives the sum of every digit
// along the full diagonal it points into ("little killer"; digits may
// repeat). Cage digits sum to the total shown in the cage's top-left cell,
// and are distinct within the cage. The green line's two digits must differ
// by 5 or more (Whisper's default difference).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Killer cages: cells and totals transcribed from the drawn cages.
const cages = [
  new Cage(15, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(11, 'R4C1', 'R5C1', 'R6C1'),
  new Cage(14, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(14, 'R4C9', 'R5C9', 'R6C9'),
];

// Outside diagonal-sum clues: entry corner/edge, direction, and total
// transcribed from the drawn arrows and their nearest clue-text badge.
const littleKillers = [
  LittleKiller.fromCells(56, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(50, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(23, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(28, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(29, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(24, graph.ray('R9C6', -1, 1), geometry),
];

return [
  new Shape('9x9'),
  ...cages,
  ...littleKillers,
  new Whisper(5, 'R4C2', 'R5C3'),
];
