// Title: Triclinium
// Author: Qodec
// Video: https://www.youtube.com/watch?v=-78lEgjZUhk
// Source: https://app.crackingthecryptic.com/sudoku/q6fGDLqpqF

// Normal sudoku rules apply on the 9x9 grid (standard 3x3 boxes, no givens).
//
// Numbered Room clues (outside the grid): a clue's value equals the digit
// at position N in that row/column, counted from the edge nearest the
// clue, where N is the digit in the first (nearest) cell of that same
// row/column. This is exactly ISS's built-in NumberedRoom semantics, so
// each clue is built with NumberedRoom.fromCells from the actual line of
// cells ordered starting at the cell nearest the clue -- the canonical
// corner/direction then comes from the cells themselves rather than being
// hand-picked.
//
// X markers: the two adjacent cells sum to 10 (ISS `X`).
// Black dot markers: the two adjacent cells are in a 1:2 ratio (ISS
// `BlackDot`). The rules state "not all possible dots or X's are
// necessarily given", so no negative constraint is placed on unmarked
// adjacent pairs.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');
const reversed = cells => cells.slice().reverse();

// Outside clue values transcribed from the drawn circle overlays outside
// the board edge.
const numberedRooms = [
  [1, graph.column(4)],            // top C4: reads top-to-bottom
  [5, graph.column(5)],            // top C5
  [5, reversed(graph.column(5))],  // bottom C5: reads bottom-to-top
  [1, reversed(graph.column(6))],  // bottom C6
  [3, graph.row(1)],               // left R1: reads left-to-right
  [3, reversed(graph.row(1))],     // right R1: reads right-to-left
  [4, graph.row(4)],               // left R4
  [2, reversed(graph.row(4))],     // right R4
  [4, graph.row(6)],               // left R6
  [2, reversed(graph.row(6))],     // right R6
  [7, graph.row(9)],               // left R9
  [7, reversed(graph.row(9))],     // right R9
];

// X (sum-to-10) marker pairs, transcribed from the white "X" edge overlays.
const xPairs = [
  ['R1C2', 'R1C3'],
  ['R2C2', 'R2C3'],
  ['R1C8', 'R2C8'],
  ['R5C6', 'R6C6'],
  ['R8C7', 'R8C8'],
  ['R9C7', 'R9C8'],
  ['R8C2', 'R9C2'],
];

// Black dot (1:2 ratio) marker pairs, transcribed from the filled black
// edge overlays.
const blackDotPairs = [
  ['R1C7', 'R2C7'],
  ['R8C3', 'R9C3'],
];

return [
  new Shape('9x9'),
  ...numberedRooms.map(
    ([value, cells]) => NumberedRoom.fromCells(value, cells, geometry)),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...blackDotPairs.map(([a, b]) => new BlackDot(a, b)),
];
