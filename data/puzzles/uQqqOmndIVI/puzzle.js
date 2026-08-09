// Title: Gemini
// Author: Christounet
// Video: https://www.youtube.com/watch?v=uQqqOmndIVI
// Source: https://sudokupad.app/6xlki7zd3x

// Two standard, independent 9x9 Sudokus sit side by side on the source's 9x19
// canvas ("Normal sudoku rules apply in both grids"), separated by a walled-off,
// unused column 10. Each grid gets its own 9x9 Var group, VL and VR: an ISS
// main grid cannot hold two disjoint sets of rows/columns/boxes, and there is
// no single "the board" group here for the other to be auxiliary to, so both
// stay off-grid behind a pinned 1x1 placeholder. The encoded rules are normal
// Sudoku in each grid, the two complete circle sets, and equality of
// corresponding circled digits. The cage digit/value rules and the doubler
// rule are deliberately omitted.
const graph = cellGraph('9x9');
const left = graph.makeOverlay('VL');
const right = graph.makeOverlay('VR');

// Circle coordinates come from the nine paired circle marks in the artwork; each
// pair sits at the same row and column of its own grid.
const circles = ['R1C6', 'R2C9', 'R3C2', 'R4C8', 'R5C5', 'R6C3', 'R7C4', 'R8C7',
  'R9C1'];

return [
  // The answer lives in VL and VR, so the main grid is a pinned placeholder.
  new Shape('1x1', '1-9'),
  new Given('R1C1', 1),
  left.toVar('left grid'),
  right.toVar('right grid'),
  ...graph.rowsColumnsBoxes().flatMap(region => [
    new AllDifferent(...left.at(region)),
    new AllDifferent(...right.at(region)),
  ]),
  new AllDifferent(...left.at(circles)),
  new AllDifferent(...right.at(circles)),
  ...circles.map(circle => new SameValues(2, left.at(circle), right.at(circle))),
];
