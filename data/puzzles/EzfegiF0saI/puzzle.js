// Title: Sum 41
// Author: Mr. Menace
// Video: https://www.youtube.com/watch?v=EzfegiF0saI
// Source: https://app.crackingthecryptic.com/sudoku/3MdQph698j

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Digits along an arrow sum to the digit in that arrow's
// circle (Arrow). Each clue outside the grid gives the sum of every digit
// along the diagonal it points into; digits may repeat on that diagonal
// (LittleKiller).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// In-grid arrows: bulb cell first, then arm cells, transcribed from the
// drawn way-points and matched to their circle underlay.
const arrows = [
  new Arrow('R1C3', 'R1C4', 'R1C5'),
  new Arrow('R3C1', 'R4C1', 'R5C1'),
  new Arrow('R2C6', 'R3C6', 'R4C7', 'R4C8'),
  new Arrow('R6C2', 'R6C3', 'R7C4', 'R8C4'),
  new Arrow('R9C7', 'R9C6', 'R9C5'),
  new Arrow('R7C9', 'R6C9', 'R5C9'),
  new Arrow('R3C4', 'R4C3'),
];

// Outside diagonal-sum clues: entry cell, direction, and total transcribed
// from each drawn off-grid arrow's way-points and its nearest clue-text
// overlay. Each outside gap has two candidate diagonals (one from either
// side); the drawn arrow's direction picks the one it enters.
const littleKillers = [
  LittleKiller.fromCells(28, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(41, graph.ray('R4C9', 1, -1), geometry),
  LittleKiller.fromCells(41, graph.ray('R7C9', -1, -1), geometry),
  LittleKiller.fromCells(57, graph.ray('R3C1', 1, 1), geometry),
  LittleKiller.fromCells(41, graph.ray('R6C1', -1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R9C4', -1, -1), geometry),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...littleKillers,
];
