// Title: Jan 6, 2023: CHAOS CONSTRUCTION
// Author: clover!
// Video: https://www.youtube.com/watch?v=B8l5A-lrSJA
// Source: https://tinyurl.com/2gxnd8qw

// Rules:
//   Fill the grid with the digits 1 through 6 so that each digit appears once
//   in each row, column, and 6-cell region. The regions aren't provided, so
//   you'll have to find them!
//
//   The digit in each cell with a circle tells you how many of the
//   orthogonally adjacent cells - plus the circle cell itself - are part of
//   the same region. For instance, if a circle cell contains a 5, then all
//   four of the adjacent cells, plus the circle cell itself, are in the same
//   6-cell region.
//
// The rules' closing sentence ("For answer check, draw all edges ... with the
// 'edge' tool") is a submission instruction for the host and is not encoded.
// Everything else is encoded; nothing is omitted.

const graph = cellGraph('6x6');
// Region label per grid cell; the solver assigns the labels.
const cc = graph.makeOverlay('CC');

// Drawn digits, from the source's 12 number entries.
const GIVENS = [
  ['R1C1', 1], ['R1C3', 2], ['R1C5', 3],
  ['R2C2', 5], ['R2C4', 4], ['R2C6', 3],
  ['R5C2', 2], ['R5C4', 3], ['R5C6', 1],
  ['R6C1', 3], ['R6C3', 4], ['R6C5', 6],
];

// Cells carrying a circle, from the source's 7 symbol entries (all circle_L).
const CIRCLES = ['R2C2', 'R2C4', 'R2C6', 'R3C5', 'R4C3', 'R6C1', 'R6C3'];

// ChaosCount(control, offset, ...regionCells): the control digit counts how
// many of the listed region cells share the region of the *first* listed one.
// Listing the circle's own region cell first makes the circle's region the one
// being matched; offset 0 includes that first cell in the count, which is the
// rule's "plus the circle cell itself".
const circleCounts = CIRCLES.map(circle => new ChaosCount(
  circle, 0, cc.at(circle), ...cc.at(graph.neighbours(circle))));

return [
  new Shape('6x6'),
  // The 6-cell regions replace the default boxes and are deduced by the solver.
  new NoBoxes(),
  new ChaosConstruction(),
  ...GIVENS.map(([cell, digit]) => new Given(cell, digit)),
  ...circleCounts,
];
