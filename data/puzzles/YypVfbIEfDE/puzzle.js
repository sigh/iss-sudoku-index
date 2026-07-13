// Title: Ubiquitous
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=YypVfbIEfDE
// Source: https://sudokupad.app/clz0fj2mwt

// Normal sudoku rules apply.
// Box borders divide each blue line into segments with the same sum.
//
// The drawn blue geometry is 10 polyline strokes, but several strokes touch
// each other at a shared cell (a graph-degree check on the decoded waypoints
// finds 5 cells each touched by two different strokes). Grouping strokes by
// where they touch gives 5 connected blue networks; three of them (the
// right-hand line and the two bottom lines) are simple paths with no
// touching, encoded directly as RegionSumLine. The other two networks
// (top three boxes; bottom-middle three boxes) branch where strokes meet,
// so they are encoded as EqualSum over each maximal same-box run of cells
// in the network -- this is what "segments with the same sum" reduces to
// once a line is allowed to branch, and it is exactly what a plain ordered
// RegionSumLine cannot express for a non-simple-path shape.

// Network 1 (top three boxes): four strokes meeting at R3C4, R4C4, R3C6.
const topNetworkSegments = [
  ['R3C2', 'R3C3'],
  ['R3C4', 'R2C4'],
  ['R4C4', 'R4C5', 'R4C6'],
  ['R3C6', 'R2C6'],
  ['R3C7', 'R3C8'],
  ['R4C3', 'R4C2', 'R4C1'],
  ['R3C1', 'R2C1', 'R1C2', 'R1C3'],
];

// Network 2 (bottom-middle three boxes): three strokes meeting at R7C4, R7C6.
const midNetworkSegments = [
  ['R7C2', 'R7C3'],
  ['R7C4', 'R8C4'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R7C6', 'R8C6'],
  ['R7C7', 'R7C8'],
];

// Network 3 (top-right box column): one simple stroke, no branching.
const rightLine = ['R4C7', 'R4C8', 'R4C9', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7'];

// Network 4 (bottom-left): one simple stroke, no branching.
const bottomLeftLine = ['R8C5', 'R9C5', 'R9C4', 'R9C3', 'R8C2', 'R7C1', 'R6C1', 'R5C2', 'R5C3', 'R6C3'];

// Network 5 (bottom-right): one simple stroke, no branching.
const bottomRightLine = ['R9C7', 'R8C7', 'R8C8', 'R8C9', 'R7C9', 'R6C9', 'R5C8', 'R5C7', 'R6C7'];

return [
  new Shape('9x9'),
  new EqualSum(...topNetworkSegments),
  new EqualSum(...midNetworkSegments),
  new RegionSumLine(...rightLine),
  new RegionSumLine(...bottomLeftLine),
  new RegionSumLine(...bottomRightLine),
];
