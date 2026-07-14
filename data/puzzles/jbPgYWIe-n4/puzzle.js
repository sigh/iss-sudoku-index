// Title: Stretching
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=jbPgYWIe-n4
// Source: https://sudokupad.app/dd1oxg0w6b
//
// Chaos construction: divide the grid into nine 9-cell orthogonally
// connected regions (no fixed boxes); digits 1-9 once each in every row,
// column, and region. In cells with arrows, the digit equals the number of
// cells of its own region (including itself) visible along the drawn arrow
// direction(s); sight is blocked by a region border or the grid edge.
//
// Encoding notes: ChaosConstruction is the native ISS handler for the
// unknown region partition; ChaosArrow is the native handler for a
// region-relative visibility run length, matching this clue exactly
// (offset 0: the displayed digit already includes the start cell). 24
// cells carry drawn arrows: either a full 4-way star (all four orthogonal
// directions) or a straight double-headed arrow (2 opposite directions
// only) -- the two-direction cells use explicit arms so the omitted
// directions are not constrained.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');   // chaos-construction region-label cell per grid cell

const DIRS = { N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] };
const arm = (cell, dir) => cc.ray(cc.at(cell), ...DIRS[dir]);

// 2-direction (double-headed) arrow cells, by direction pair.
const NORTH_SOUTH = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  'R5C4',
];
const EAST_WEST = [
  'R2C1', 'R2C2', 'R2C5', 'R3C1', 'R5C1', 'R8C5', 'R8C8', 'R9C1', 'R9C6',
];
// 4-direction (star) arrow cells: all four orthogonal arms drawn.
const FOUR_WAY = ['R2C6', 'R3C3', 'R6C4', 'R6C7', 'R8C6'];

const stretchArrows = [
  ...NORTH_SOUTH.map(cell => new ChaosArrow(cell, 0, arm(cell, 'N'), arm(cell, 'S'))),
  ...EAST_WEST.map(cell => new ChaosArrow(cell, 0, arm(cell, 'E'), arm(cell, 'W'))),
  ...FOUR_WAY.map(cell => new ChaosArrow(cell, 0)),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...stretchArrows,
];
