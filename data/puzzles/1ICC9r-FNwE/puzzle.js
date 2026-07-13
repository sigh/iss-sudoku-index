// Title: Counting to 7
// Author: zetamath
// Video: https://www.youtube.com/watch?v=1ICC9r-FNwE
// Source: https://sudokupad.app/fyn51hk3yu

// Normal sudoku rules apply.
//
// Renban lines: each line's digits form a set of non-repeating consecutive
// digits, in any order.
const renbanLines = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R2C1', 'R2C2', 'R2C3'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R7C2', 'R8C2', 'R9C2'],
  ['R9C3', 'R9C4', 'R9C5'],
  ['R6C4', 'R7C4', 'R7C5', 'R8C5'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R7C8', 'R6C7', 'R5C6', 'R4C5'],
];

// Numbered Rooms (outside clues): a clue outside the grid indicates the
// digit which has to be placed in the Nth cell in the corresponding
// direction, where N is the digit placed in the first cell in that
// direction (the cell nearest the clue). Build each clue from the actual
// line of cells, ordered starting at the cell nearest the clue, via
// NumberedRoom.fromCells so the canonical corner/direction come from the
// cells themselves.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');
const reversed = cells => cells.slice().reverse();

const numberedRooms = [
  [1, graph.column(1)],            // top of column 1: reads top-to-bottom
  [2, graph.column(2)],            // top of column 2
  [6, reversed(graph.row(2))],     // right of row 2: reads right-to-left
  [6, reversed(graph.row(3))],     // right of row 3
  [3, reversed(graph.column(4))],  // bottom of column 4: reads bottom-to-top
  [3, reversed(graph.column(5))],  // bottom of column 5
  [7, reversed(graph.row(6))],     // right of row 6
  [4, reversed(graph.row(7))],     // right of row 7
  [4, reversed(graph.row(8))],     // right of row 8
  [5, reversed(graph.column(8))],  // bottom of column 8
];

return [
  new Shape('9x9'),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...numberedRooms.map(
    ([value, cells]) => NumberedRoom.fromCells(value, cells, geometry)),
];
