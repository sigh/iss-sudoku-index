// Title: Going to Extremes
// Author: Conc123
// Video: https://www.youtube.com/watch?v=rMGug-opCrI
// Source: https://app.crackingthecryptic.com/sudoku/GjnL983hGT

// Normal sudoku rules apply (standard rows/columns/boxes, the ISS default).
// Arrows: digits along an arrow sum to the digit in that arrow's circle.
// V joins two cells that sum to 5, X joins two cells that sum to 10 (both
// bind by grid adjacency). A black dot joins two cells in ratio 1:2; a white
// dot joins two consecutive cells (adjacent pairs, from the drawn overlays).
// R6C5 must be less than all four of its orthogonal neighbours; R4C6 must be
// greater than all four of its orthogonal neighbours (rules text). The eight
// small chevron marks drawn inside R4C6 and R6C5 -- one per orthogonal
// direction on each cell -- are a decorative redraw of that same sentence,
// not additional clues, so they are not separately encoded.

const graph = cellGraph('9x9');

// Arrow bulbs and arms, read off the drawn arrow paths. R6C4 and R4C6 each
// carry two arrows sharing one circle.
const arrows = [
  new Arrow('R8C6', 'R8C7', 'R8C8', 'R8C9'),
  new Arrow('R9C4', 'R9C3', 'R9C2', 'R9C1'),
  new Arrow('R6C4', 'R5C3', 'R4C2'),
  new Arrow('R6C4', 'R7C4', 'R8C3'),
  new Arrow('R4C6', 'R5C5', 'R6C5'),
  new Arrow('R4C6', 'R3C7', 'R2C7'),
  new Arrow('R2C6', 'R2C7', 'R2C8', 'R2C9'),
];

// V (sum 5) and X (sum 10) edge markers, read off the drawn overlays.
const vDots = [
  new V('R3C1', 'R3C2'),
  new V('R5C1', 'R6C1'),
  new V('R9C1', 'R9C2'),
  new V('R6C7', 'R6C8'),
];
const xDots = [
  new X('R6C4', 'R6C5'),
];

// White (consecutive) and black (ratio 1:2) Kropki dots, read off the drawn
// overlays (fill colour distinguishes white from black).
const whiteDots = [
  new WhiteDot('R8C7', 'R8C8'),
  new WhiteDot('R8C8', 'R8C9'),
  new WhiteDot('R9C2', 'R9C3'),
];
const blackDots = [
  new BlackDot('R2C7', 'R3C7'),
];

// Extreme cells: derive each cell's boundary pairs from the grid graph
// rather than hand-listing the four neighbours.
const minCell = 'R6C5';
const maxCell = 'R4C6';
const extremes = [
  ...graph.neighbours(minCell).map(n => new GreaterThan(n, minCell)),
  ...graph.neighbours(maxCell).map(n => new GreaterThan(maxCell, n)),
];

return [
  new Shape('9x9'),
  new Given('R1C2', 6),
  new Given('R3C3', 5),
  new Given('R5C8', 6),
  new Given('R7C8', 7),
  new Given('R9C8', 5),
  ...arrows,
  ...vDots,
  ...xDots,
  ...whiteDots,
  ...blackDots,
  ...extremes,
];
