// Title: Spot the Difference
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=clLt6qRQE5g
// Source: https://sudokupad.app/atbh8bj6bp

// Normal Sudoku applies. Grey squares are even, and black dots are 1:2 ratios.
// The solver-discovered coloured snakes and their per-snake differences are omitted.
// Grey-square coordinates are transcribed from the grey square underlays.
const evenCells = ['R1C5', 'R2C8', 'R3C9', 'R9C2'];
// Black-dot pairs are transcribed from the two black edge underlays.
const blackDots = [['R4C6', 'R5C6'], ['R2C7', 'R2C8']];

return [
  new Shape('9x9'),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
