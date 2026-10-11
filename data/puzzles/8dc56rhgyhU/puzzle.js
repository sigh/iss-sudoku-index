// Title: Crust
// Author: Fuxia
// Video: https://www.youtube.com/watch?v=8dc56rhgyhU
// Source: https://sudokupad.app/uzwuwd14qi

// Normal Sudoku; blue rows index their row digit within each column,
// red columns index their column digit within each row. Corners obey both.
// White and black dots apply only where drawn; no negative dot rule.

// The colored border consists of blue rows 1,9 and red columns 1,9.
const blueCells = [1, 9].flatMap(row =>
  Array.from({length: 9}, (_, i) => makeCellId(row, i + 1)));
const redCells = [1, 9].flatMap(col =>
  Array.from({length: 9}, (_, i) => makeCellId(i + 1, col)));

// Filled black circles and outlined white circles on the drawn borders.
const blackDots = [['R1C2', 'R1C3'], ['R1C5', 'R1C6']];
const whiteDots = [['R1C3', 'R1C4'], ['R1C4', 'R1C5'], ['R4C9', 'R5C9']];

return [
  new Shape('9x9'),
  new Indexing('R', ...blueCells),
  new Indexing('C', ...redCells),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
