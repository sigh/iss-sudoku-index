// Title: Reegion Suum Kroopki
// Author: Migu
// Video: https://www.youtube.com/watch?v=jHtjzmKBZ8U
// Source: https://app.crackingthecryptic.com/sudoku/j9BgfmMfjN

// Normal sudoku rules apply (rows, columns, and the 9 drawn 3x3 boxes, which
// coincide with the solver's default boxes).
//
// 5 lines are also drawn (not mentioned in the rules text, which covers only
// the dots/doots below). Each line's own per-box segment sums are equal, so
// they are encoded as region sum lines.
//
// Two dot types are drawn, per the rules text's own distinction between a
// "Kropki dot" and the larger "Kroopki doot":
// - A small round Kropki dot sits between two orthogonally adjacent cells:
//   white = the two digits are consecutive, black = one digit is double the
//   other. Not all such dots are given.
// - A long ellipse-shaped Kroopki doot straddles a shared cell edge and is
//   pinched to a point across that edge (the split) while stretched long
//   along the parallel direction (the extend axis): white = the two sets'
//   sums are consecutive, black = one set's sum is double the other's. The
//   extend axis is either 2 cells (a doot centred on a 2x2 corner, one row
//   each side of a column border or vice versa) or 3 cells (a doot centred
//   on one lane, stretched to cover that lane and its neighbour on each
//   side of the split). Not all such doots are given.

const normalDots = [
  // cell pairs transcribed from the drawing's small round overlay markers;
  // fill colour gives white/black.
  { cells: ['R8C8', 'R9C8'], color: 'white' },
  { cells: ['R2C1', 'R2C2'], color: 'white' },
  { cells: ['R5C2', 'R5C3'], color: 'black' },
  { cells: ['R7C5', 'R8C5'], color: 'black' },
];

const regionSumDoots = [
  // left/right (or top/bottom) cell sets transcribed from the drawing's
  // elongated overlay markers, per the split/extend geometry above; fill
  // colour gives white/black.
  //
  // 2x2-corner doots (2 cells per set):
  { left: ['R7C2', 'R7C3'], right: ['R8C2', 'R8C3'], color: 'white' },
  { left: ['R5C7', 'R5C8'], right: ['R6C7', 'R6C8'], color: 'black' },
  { left: ['R4C7', 'R4C8'], right: ['R5C7', 'R5C8'], color: 'black' },
  { left: ['R2C8', 'R2C9'], right: ['R3C8', 'R3C9'], color: 'black' },
  { left: ['R1C8', 'R2C8'], right: ['R1C9', 'R2C9'], color: 'white' },
  { left: ['R5C5', 'R5C6'], right: ['R6C5', 'R6C6'], color: 'white' },
  { left: ['R1C5', 'R2C5'], right: ['R1C6', 'R2C6'], color: 'black' },
  // One-lane-stretched-to-three doots (3 cells per set):
  { left: ['R4C1', 'R5C1', 'R6C1'], right: ['R4C2', 'R5C2', 'R6C2'], color: 'black' },
  { left: ['R7C7', 'R7C8', 'R7C9'], right: ['R8C7', 'R8C8', 'R8C9'], color: 'white' },
  { left: ['R8C4', 'R8C5', 'R8C6'], right: ['R9C4', 'R9C5', 'R9C6'], color: 'black' },
  { left: ['R1C2', 'R2C2', 'R3C2'], right: ['R1C3', 'R2C3', 'R3C3'], color: 'white' },
  { left: ['R3C4', 'R3C5', 'R3C6'], right: ['R4C4', 'R4C5', 'R4C6'], color: 'black' },
  { left: ['R3C7', 'R3C8', 'R3C9'], right: ['R4C7', 'R4C8', 'R4C9'], color: 'white' },
];

const regionSumLines = [
  // cell paths transcribed from the drawing's lines (interpolated waypoints).
  ['R7C3', 'R8C3', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2'],
  ['R7C9', 'R7C8', 'R7C7', 'R6C7', 'R5C7', 'R5C8', 'R6C8'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C6', 'R4C5', 'R4C4', 'R5C4'],
  ['R3C9', 'R3C8', 'R3C7', 'R2C6', 'R2C5'],
];

// sum(left) and sum(right) consecutive: either total is one more than the
// other. Expressed as a single linear equation per direction (coefficient
// Sum), rather than materializing either sum as a Var.
const consecutiveSums = (left, right) => new Or([
  new Sum(1, ...left, ...right.map(c => [c, -1])),
  new Sum(1, ...right, ...left.map(c => [c, -1])),
]);

// sum(left) and sum(right) in a 1:2 ratio: either total is double the other.
const ratioSums = (left, right) => new Or([
  new Sum(0, ...left, ...right.map(c => [c, -2])),
  new Sum(0, ...right, ...left.map(c => [c, -2])),
]);

return [
  new Shape('9x9'),

  ...normalDots.map(({ cells, color }) => color === 'white'
    ? new WhiteDot(...cells)
    : new BlackDot(...cells)),

  ...regionSumDoots.map(({ left, right, color }) => color === 'white'
    ? consecutiveSums(left, right)
    : ratioSums(left, right)),

  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
];
