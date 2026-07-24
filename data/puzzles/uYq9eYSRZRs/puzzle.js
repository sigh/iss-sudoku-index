// Title: Let there be chaos
// Author: Rosie
// Video: https://www.youtube.com/watch?v=uYq9eYSRZRs
// Source: https://sudokupad.app/qs5gewd34w

// Divide the grid into regions of orthogonally connected cells. Place the
// digits 1-9 once each in every row, column, and region (chaos construction:
// the regions are not given).
//
// A digit in a circle indicates exactly how many circles (out of all circles
// in the grid) contain that digit -- CountingCircles over the full circle set.
// A digit in a circle also indicates how many of the up-to nine surrounding
// cells (including itself) are in the same region as that circle --
// ChaosCount per circle over its own region cell plus its king neighbours.
//
// Digits in cells separated by a white dot are consecutive (WhiteDot). Digits
// in cells separated by an X sum to ten (X). Not all dots and X's are
// necessarily given, so these are positive-only clues.

const circles = [
  'R1C1', 'R2C1', 'R2C4', 'R2C5', 'R3C7', 'R3C8', 'R4C3', 'R4C4',
  'R5C1', 'R5C2', 'R5C3', 'R5C7', 'R6C5', 'R6C8', 'R7C1', 'R7C7',
  'R7C8', 'R8C6', 'R9C2', 'R9C4', 'R9C7',
];

const whiteDots = [
  ['R1C3', 'R1C4'],
  ['R5C5', 'R5C6'],
];

const xPairs = [
  ['R8C1', 'R8C2'],
];

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

const chaosCounts = circles.map(cell => {
  const set = [cc.at(cell), ...cc.at(graph.kingNeighbours(cell))];
  return new ChaosCount(cell, 0, ...set);
});

const whiteDotConstraints = whiteDots.map(pair => new WhiteDot(...pair));
const xConstraints = xPairs.map(pair => new X(...pair));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  new CountingCircles(...circles),
  ...chaosCounts,
  ...whiteDotConstraints,
  ...xConstraints,
];
