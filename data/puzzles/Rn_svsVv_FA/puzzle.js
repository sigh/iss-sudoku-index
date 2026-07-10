// Title: Hot or Cold
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=Rn_svsVv_FA
// Source: https://sudokupad.app/58u9d7sohd

// Red cells are greater than each orthogonally adjacent white cell.
// Blue cells are less than each orthogonally adjacent white cell.
// Dominoes crossing a standard 3x3 box border have a difference of at least 4.

const RED_CELLS = [
  [1, 1],
  [3, 6], [3, 7], [4, 6], [4, 7],
  [6, 7], [6, 8], [7, 7], [7, 8],
].map(([row, col]) => makeCellId(row, col));

const BLUE_CELLS = [
  [3, 2], [3, 3], [4, 2], [4, 3],
  [6, 3], [6, 4], [7, 3], [7, 4],
  [9, 9],
].map(([row, col]) => makeCellId(row, col));

const COLORED_CELLS = new Set([...RED_CELLS, ...BLUE_CELLS]);
const GRID = cellGraph('9x9');

const borderDominoes = [];
for (let row = 1; row <= 9; row++) {
  for (const col of [3, 6]) {
    borderDominoes.push([makeCellId(row, col), makeCellId(row, col + 1)]);
  }
}
for (const row of [3, 6]) {
  for (let col = 1; col <= 9; col++) {
    borderDominoes.push([makeCellId(row, col), makeCellId(row + 1, col)]);
  }
}

const hotColdComparisons = [
  ...RED_CELLS.flatMap(cell =>
    GRID.neighbours(cell)
      .filter(neighbour => !COLORED_CELLS.has(neighbour))
      .map(neighbour => new GreaterThan(cell, neighbour))
  ),
  ...BLUE_CELLS.flatMap(cell =>
    GRID.neighbours(cell)
      .filter(neighbour => !COLORED_CELLS.has(neighbour))
      .map(neighbour => new GreaterThan(neighbour, cell))
  ),
];

return [
  new Shape('9x9'),
  new Given('R3C3', 1),
  ...borderDominoes.map(([a, b]) => new Whisper(4, a, b)),
  ...hotColdComparisons,
];
