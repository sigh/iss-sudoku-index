// Title: March 19, 2023: Deficit Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=t7hYdmUfG1U
// Source: https://tinyurl.com/2p92zxuu

// 7x7 grid, digits 1-7. Standard row/column all-different (no standard boxes:
// 7 has no integer box factorization, and the puzzle draws its own irregular
// regions instead). Eight hand-drawn 6-cell regions each hold every digit at
// most once (not exactly once, since 6 cells can't hold 7 distinct digits
// without a "Deficit" region every time) -- AllDifferent over 6 cells already
// expresses "at most once" for a 7-digit domain. One cell, R4C4, falls outside
// every region's wall and answers only to its row/column.
//
// Region membership below is derived from the drawn wall segments between
// grid vertices (row/col in [0,7]): the 8 regions are the connected
// components once every wall segment is applied to the open 7x7
// cell-adjacency grid.
const regions = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C1', 'R3C2'], // A
  ['R1C3', 'R1C4', 'R2C3', 'R2C4', 'R3C3', 'R3C4'], // B
  ['R1C5', 'R1C6', 'R1C7', 'R2C5', 'R2C6', 'R2C7'], // C
  ['R3C5', 'R3C6', 'R3C7', 'R4C5', 'R4C6', 'R4C7'], // D
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3'], // E
  ['R5C4', 'R5C5', 'R6C4', 'R6C5', 'R7C4', 'R7C5'], // F
  ['R5C6', 'R5C7', 'R6C6', 'R6C7', 'R7C6', 'R7C7'], // G
  ['R6C1', 'R6C2', 'R6C3', 'R7C1', 'R7C2', 'R7C3'], // H
  // R4C4 is deliberately absent from every region.
];

// Givens, transcribed from the drawn cell clues.
const givens = [
  ['R1C6', 3],
  ['R2C2', 4], ['R2C6', 7],
  ['R3C2', 5], ['R3C4', 7], ['R3C7', 4],
  ['R4C1', 1], ['R4C4', 4], ['R4C7', 7],
  ['R5C1', 2], ['R5C4', 6], ['R5C6', 1],
  ['R6C2', 3], ['R6C6', 2],
  ['R7C2', 1],
];

return [
  new Shape('7x7'),
  new NoBoxes(),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...regions.map(cells => new AllDifferent(...cells)),
];
