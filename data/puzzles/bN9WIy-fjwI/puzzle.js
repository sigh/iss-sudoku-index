// Title: Toroidal Odd Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=bN9WIy-fjwI
// Source: https://cracking-the-cryptic.web.app/sudoku/b8fb2FgP6t

// Rules encoded:
//  - Place 1-7 in every cell so that each row and each column contains each
//    digit exactly once. (A 7x7 grid has no default boxes, so the seven drawn
//    regions below are the only region groups.)
//  - Each of the seven drawn seven-cell regions contains 1-7 once. Four of
//    them run off one edge of the grid and continue on the opposite edge --
//    the toroidal layout.
//  - Every grey-shaded cell contains an odd digit.
//  - The six printed given digits.

const shape = new Shape('7x7');
const graph = cellGraph(shape);
const shapeName = graph.gridGeometry().name;

// The seven regions, transcribed from the drawn region borders. Regions 1 and
// 4 wrap across the top/bottom edge; regions 2 and 6 wrap across the
// left/right edge; regions 3, 5 and 7 lie wholly inside the square.
const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C2', 'R2C3', 'R7C1', 'R7C2'],
  ['R2C1', 'R2C7', 'R3C1', 'R3C2', 'R3C7', 'R4C1', 'R4C2'],
  ['R1C4', 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C5', 'R3C6'],
  ['R1C6', 'R1C7', 'R6C5', 'R6C6', 'R7C5', 'R7C6', 'R7C7'],
  ['R3C3', 'R3C4', 'R4C3', 'R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R4C6', 'R4C7', 'R5C1', 'R5C6', 'R5C7', 'R6C1', 'R6C7'],
  ['R5C2', 'R5C3', 'R6C2', 'R6C3', 'R6C4', 'R7C3', 'R7C4'],
];

// The six printed digits, all in the top-right corner.
const GIVENS = [
  ['R1C5', 2], ['R1C6', 6], ['R1C7', 3],
  ['R2C6', 1], ['R2C7', 5],
  ['R3C7', 4],
];

// The ten grey-shaded cells, transcribed from the grey full-cell fills: the
// two diagonals lying two steps either side of the main diagonal, drawn only
// where they fit inside the square (they are not continued around the edges --
// the wrapped positions R1C6, R2C7, R6C1 and R7C2 carry no shading, and R1C6's
// given 6 is even, so the shading is not toroidal).
const ODD_CELLS = [
  'R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7',
  'R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5',
];

return [
  shape,
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...REGIONS.map(cells => new Jigsaw(shapeName, ...cells)),
  ...ODD_CELLS.map(cell => new Given(cell, 1, 3, 5, 7)),
];
