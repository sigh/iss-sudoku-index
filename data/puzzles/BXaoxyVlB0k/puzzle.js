// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=BXaoxyVlB0k
// Source: https://cracking-the-cryptic.web.app/sudoku/rDMqF3Nh3D
//
// Normal sudoku (default rows/cols/boxes; the payload's own regions array is
// exactly the ordinary nine 3x3 boxes). No givens. Nine lines are drawn on
// the grid; only cell pairs that are neighbours along one of these lines are
// subject to the Kropki rule -- every ratio-2 pair on a line carries a black
// dot and every consecutive pair carries a white dot (a 1/2 pair satisfies
// both, so either dot colour is allowed there), and every undotted pair on a
// line is neither ratio-2 nor consecutive (which also excludes 1/2 there).
// Cell pairs off every line are unconstrained.
//
// Geometry: each line steps between orthogonally or diagonally adjacent
// cells; a diagonal step is drawn through a shared grid corner, and where a
// dot sits on such a corner it resolves to the one diagonal pair the line
// actually uses through that corner (not the other diagonal pair sharing the
// same corner). The edge lists below were matched programmatically: every one
// of the 34 drawn dots lines up with exactly one of the 50 total line edges,
// one dot per edge, no edge claimed twice.

const ratioKey = Pair.fnToKey((a, b) => a === b * 2 || b === a * 2, 9);
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const noDotKey = Pair.fnToKey(
  (a, b) => a !== b * 2 && b !== a * 2 && Math.abs(a - b) !== 1, 9);

// Black-dot (ratio 2) line edges between orthogonally adjacent cells --
// provenance: 11 black-filled rounded overlays, each centred on the shared
// edge of the two cells listed.
const blackDotOrth = [
  ['R1C3', 'R1C2'], ['R2C1', 'R3C1'], ['R5C1', 'R6C1'], ['R7C2', 'R7C3'],
  ['R6C9', 'R5C9'], ['R5C9', 'R4C9'], ['R4C3', 'R4C2'], ['R3C4', 'R4C4'],
  ['R4C5', 'R3C5'], ['R2C6', 'R3C6'], ['R6C8', 'R5C8'],
];

// Black-dot (ratio 2) line edges between diagonally adjacent cells --
// provenance: 2 black-filled rounded overlays, each centred on the grid
// corner shared by the two cells listed (the line's own diagonal step
// through that corner).
const blackDotDiag = [
  ['R6C1', 'R7C2'], ['R8C4', 'R9C5'],
];

// White-dot (consecutive) line edges between orthogonally adjacent cells --
// provenance: 12 white-filled rounded overlays, each centred on the shared
// edge of the two cells listed.
const whiteDotOrth = [
  ['R1C4', 'R1C3'], ['R7C7', 'R7C8'], ['R3C2', 'R3C3'], ['R3C3', 'R4C3'],
  ['R4C4', 'R4C5'], ['R2C7', 'R2C6'], ['R4C6', 'R4C7'], ['R6C3', 'R6C2'],
  ['R6C2', 'R5C2'], ['R6C4', 'R7C4'], ['R6C5', 'R6C4'], ['R5C7', 'R6C7'],
];

// White-dot (consecutive) line edges between diagonally adjacent cells --
// provenance: 9 white-filled rounded overlays, each centred on the grid
// corner shared by the two cells listed (the line's own diagonal step
// through that corner).
const whiteDotDiag = [
  ['R9C5', 'R8C6'], ['R8C6', 'R7C7'], ['R7C8', 'R6C9'], ['R2C9', 'R1C8'],
  ['R1C6', 'R2C5'], ['R3C8', 'R2C7'], ['R4C7', 'R3C8'], ['R5C6', 'R6C5'],
  ['R7C6', 'R6C5'],
];

// Line edges with no dot -- provenance: every other consecutive pair on the
// 9 drawn lines (13 orthogonal, 3 diagonal), read off the lines' own
// waypoints. Neither ratio-2 nor consecutive.
const noDot = [
  ['R2C5', 'R1C4'], ['R1C2', 'R2C1'], ['R3C1', 'R4C1'], ['R4C1', 'R5C1'],
  ['R7C3', 'R8C4'], ['R4C9', 'R3C9'], ['R3C9', 'R2C9'], ['R1C8', 'R1C7'],
  ['R1C7', 'R1C6'], ['R2C3', 'R2C2'], ['R2C2', 'R3C2'], ['R3C6', 'R4C6'],
  ['R5C2', 'R5C3'], ['R5C3', 'R6C3'], ['R5C4', 'R6C4'], ['R6C7', 'R6C8'],
];

return [
  new Shape('9x9'),

  ...blackDotOrth.map(([a, b]) => new BlackDot(a, b)),
  ...blackDotDiag.map(([a, b]) => new Pair(ratioKey, 'black-dot (diagonal)', a, b)),
  ...whiteDotOrth.map(([a, b]) => new WhiteDot(a, b)),
  ...whiteDotDiag.map(([a, b]) => new Pair(consecutiveKey, 'white-dot (diagonal)', a, b)),
  ...noDot.map(([a, b]) => new Pair(noDotKey, 'no-dot', a, b)),
];
