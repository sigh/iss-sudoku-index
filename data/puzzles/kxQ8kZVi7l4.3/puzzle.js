// Title: Kropki Pairs Sudoku
// Author: shye
// Video: https://www.youtube.com/watch?v=kxQ8kZVi7l4
// Source: https://tinyurl.com/dduejy78

// Standard sudoku rules apply. White dots join consecutive digits and black
// dots join digits in a 1:2 ratio. The given and dot coordinates below are
// transcribed from the f-puzzles grid, difference, and ratio arrays.
const givens = [
  ['R1C1', 1], ['R1C9', 6], ['R2C9', 9], ['R3C9', 3],
  ['R4C9', 2], ['R5C9', 1], ['R6C9', 4], ['R7C9', 7],
  ['R8C9', 5], ['R9C1', 3], ['R9C2', 7], ['R9C3', 6],
  ['R9C4', 5], ['R9C5', 4], ['R9C6', 1], ['R9C7', 9],
  ['R9C8', 2], ['R9C9', 8],
];
const whiteDotEdges = [
  ['R7C1', 'R6C1'], ['R7C2', 'R6C2'], ['R6C3', 'R7C3'],
  ['R6C4', 'R7C4'], ['R6C5', 'R7C5'], ['R6C6', 'R7C6'],
  ['R6C6', 'R6C7'], ['R5C6', 'R5C7'], ['R4C6', 'R4C7'],
  ['R3C7', 'R3C6'], ['R2C7', 'R2C6'], ['R1C6', 'R1C7'],
];
const blackDotEdges = [
  ['R4C1', 'R3C1'], ['R3C2', 'R4C2'], ['R4C3', 'R3C3'],
  ['R3C3', 'R3C4'], ['R2C3', 'R2C4'], ['R1C4', 'R1C3'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whiteDotEdges.map(cells => new WhiteDot(...cells)),
  ...blackDotEdges.map(cells => new BlackDot(...cells)),
];
