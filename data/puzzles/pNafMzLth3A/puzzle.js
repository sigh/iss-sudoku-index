// Title: Arrow Sandwich
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=pNafMzLth3A
// Source: https://app.crackingthecryptic.com/sudoku/7DJ9JQPqG2
//
// Normal sudoku rules apply (standard 3x3 boxes, default row/column/box
// all-different). Cells along an arrow sum to the digit in its attached
// circle (bulb). Each outside-grid number is the sum of the digits strictly
// between the 1 and the 9 in the row or column it sits beside; a sandwich
// sum does not depend on which end of the line the clue is printed at, so
// Sandwich.fromCells is built from either end of each full row/column.

const graph = cellGraph('9x9');

// Arrow bulb + arm cells, transcribed from the payload's `arrows` waypoints
// (7th arrow entry has no waypoints and renders nothing, so it is omitted).
// The bulb (first cell to each Arrow) matches one of the 6 drawn underlay
// circles in every case.
const arrows = [
  ['R2C2', 'R3C2', 'R4C2', 'R5C1'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R5C3', 'R5C4', 'R6C5'],
  ['R5C7', 'R5C6', 'R4C5'],
  ['R8C7', 'R8C6', 'R8C5', 'R8C4'],
  ['R8C8', 'R7C8', 'R6C8', 'R5C9'],
].map(cells => new Arrow(...cells));

// Outside sandwich clues, transcribed from the payload's `overlays` text.
const sandwiches = [
  Sandwich.fromCells(33, graph.column(1), graph.gridGeometry()),
  Sandwich.fromCells(32, graph.column(2), graph.gridGeometry()),
  Sandwich.fromCells(12, graph.row(2), graph.gridGeometry()),
  Sandwich.fromCells(19, graph.row(8), graph.gridGeometry()),
  Sandwich.fromCells(7, graph.column(8), graph.gridGeometry()),
  Sandwich.fromCells(26, graph.column(9), graph.gridGeometry()),
];

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...arrows,
  ...sandwiches,
];
