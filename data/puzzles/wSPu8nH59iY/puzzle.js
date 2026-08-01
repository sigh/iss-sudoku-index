// Title: Take the Low Road
// Author: Chilly
// Video: https://www.youtube.com/watch?v=wSPu8nH59iY
// Source: https://sudokupad.app/z01nexs74t

// Normal Sudoku rules apply. Each grey arrow cell is greater than every cell
// along the ray indicated by its arrowhead. The literal arrays below transcribe
// the arrow cells and their drawn rays, in order.
const arrows = [
  ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R3C2', 'R2C1'],
  ['R3C3', 'R4C2', 'R5C1'],
  ['R3C6', 'R2C7', 'R1C8'],
  ['R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R4C7', 'R3C8', 'R2C9'],
  ['R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2'],
  ['R5C7', 'R6C8', 'R7C9'],
  ['R6C2', 'R6C1'],
  ['R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'],
  ['R6C4', 'R7C5', 'R8C6', 'R9C7'],
  ['R6C5', 'R6C4', 'R6C3', 'R6C2', 'R6C1'],
  ['R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ['R8C2', 'R8C1'],
];

// A Pair is used for every control-cell/ray-cell comparison, including diagonal
// rays; the first cell is the arrow cell and must be larger than the second.
const greater = Pair.fnToKey((a, b) => a > b, 9);
const arrowComparisons = arrows.flatMap(([control, ...ray]) =>
  ray.map(cell => new Pair(greater, 'arrow', control, cell)));

return [
  new Shape('9x9'),
  ...arrowComparisons,
];
