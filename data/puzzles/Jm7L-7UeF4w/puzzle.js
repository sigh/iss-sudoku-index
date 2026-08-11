// Title: Spotting the 8 Ball
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=Jm7L-7UeF4w
// Source: https://app.crackingthecryptic.com/sudoku/fQGnQbP2MG

// Normal sudoku rules (default rows/cols/boxes). Digits along an arrow sum
// to the digit in that arrow's circle. Circles without an attached arrow are
// Neighbour Sum cells: the circled cell's own digit equals the sum of its
// orthogonally adjacent cells -- this is the same "cell equals sum of those
// cells" relation Arrow already expresses, just with the arm cells being the
// orthogonal neighbours instead of a drawn line, so Arrow is reused for it.
// White dots mark orthogonally adjacent pairs holding consecutive digits.

const graph = cellGraph('9x9');

// Given digits (source `cells` array).
const givens = [
  ['R5C5', 8],
  ['R6C9', 6],
];

// Arrows: bulb cell first, then arm cells, transcribed from the drawn
// `arrows` (line) + `overlays` (bulb circle) arrays.
const arrows = [
  ['R8C2', 'R7C2', 'R6C2'],
  ['R6C8', 'R7C8', 'R8C8'],
  ['R2C8', 'R1C9', 'R1C8'],
  ['R2C2', 'R1C1', 'R1C2'],
  ['R2C5', 'R3C5', 'R4C5'],
];

// Neighbour Sum cells: circles drawn on the cell itself with no attached
// arrow line (source `overlays` array, same circle style as the arrow
// bulbs). Arm cells are each cell's orthogonal neighbours, computed from the
// grid graph rather than hand-listed.
const neighbourSumCells = [
  'R1C3', 'R1C7', 'R5C7', 'R6C6', 'R7C5', 'R6C4', 'R5C3', 'R9C1', 'R9C9',
];

// White dots (source `overlays` array): consecutive digits.
const whiteDots = [
  ['R6C2', 'R7C2'],
  ['R3C8', 'R4C8'],
  ['R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...neighbourSumCells.map(
    cell => new Arrow(cell, ...graph.neighbours(cell))),
  ...whiteDots.map(pair => new WhiteDot(...pair)),
];
