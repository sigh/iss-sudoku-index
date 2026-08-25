// Title: Crossguard Lightsaber Sudoku
// Author: Stephen Parthimos
// Video: https://www.youtube.com/watch?v=wuEyDHt9c4g
// Source: https://app.crackingthecryptic.com/webapp/rmJ9BnTJ4T

// Normal sudoku rules apply. Clues outside the grid give the sum of the cells
// along the indicated diagonal; digits may repeat along these diagonals.
// Cells separated by a V must sum to 5; cells separated by an X must sum to
// 10. There is no negative constraint, so X/V is not used on every adjacent
// pair -- unmarked pairs may still happen to sum to 5 or 10.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Diagonal sum clues, read off the drawn off-grid badges and their arrows
// (down-right or down-left).
const littleKillers = [
  LittleKiller.fromCells(57, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(31, graph.ray('R1C2', 1, 1), geometry),
  LittleKiller.fromCells(32, graph.ray('R2C1', 1, 1), geometry),
  LittleKiller.fromCells(32, graph.ray('R3C9', 1, -1), geometry),
  LittleKiller.fromCells(25, graph.ray('R4C9', 1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R5C9', 1, -1), geometry),
];

// V markers (adjacent pair sums to 5), one per drawn edge overlay.
const vPairs = [
  new V('R1C3', 'R2C3'),
  new V('R3C1', 'R3C2'),
  new V('R4C5', 'R4C6'),
  new V('R5C4', 'R6C4'),
  new V('R7C8', 'R7C9'),
  new V('R8C7', 'R9C7'),
];

// X markers (adjacent pair sums to 10), one per drawn edge overlay.
const xPairs = [
  new X('R1C9', 'R2C9'),
  new X('R2C6', 'R2C7'),
  new X('R8C3', 'R9C3'),
];

return [
  new Shape('9x9'),
  ...littleKillers,
  ...vPairs,
  ...xPairs,
];
