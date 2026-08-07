// Title: Kroopki Wonderland
// Author: MicroStudy
// Video: https://www.youtube.com/watch?v=pJzIaZXDjkQ
// Source: https://app.crackingthecryptic.com/sudoku/4LhtN674Br

// Rules encoded below, in full:
//   Normal sudoku rules apply.
//   Digits separated by a white Kropki dot must be consecutive.
//   Digits separated by a black Kropki dot must have a ratio of 1:2.
//   Sets of digits separated by a white Kroopki 'doot' (the long, ellipse-looking
//     things) must have their respective sums be consecutive.
//   Sets of digits separated by a black Kroopki doot must have their respective
//     sums be in a 1:2 ratio.
// There are no given digits, and the rules never say that every dot or doot is
// drawn, so no negative ("all dots given") constraint is added.

// Kropki dots: the small round marks, each centred on one cell edge.
// Transcribed from the drawn dots.
const whiteDots = [
  ['R7C5', 'R8C5'],
  ['R8C5', 'R9C5'],
  ['R2C2', 'R3C2'],
  ['R6C4', 'R6C5'],
];
const blackDots = [
  ['R1C4', 'R2C4'],
  ['R2C4', 'R3C4'],
  ['R3C7', 'R3C8'],
];

// Kroopki doots: the long capsules. Each one lies along a single grid line and
// runs from the centre of one cell to the centre of another, so it flanks a run
// of cells on one side of that line and the matching run on the other side.
// Those two runs are the sets it separates (a dot separates 1 cell from 1 cell;
// a doot separates n from n).
//
// Transcribed from the drawn capsules as ['V'|'H', line, from, to]:
//   'V': capsule on the vertical line between columns `line` and `line`+1,
//        spanning rows `from`..`to`  -> separates that column run on the left
//        from the same rows in column `line`+1.
//   'H': capsule on the horizontal line between rows `line` and `line`+1,
//        spanning columns `from`..`to`.
const whiteDoots = [
  ['V', 4, 1, 3],  // C4 vs C5, rows 1-3
  ['V', 5, 1, 3],  // C5 vs C6, rows 1-3
  ['V', 8, 8, 9],
  ['V', 1, 3, 4],
  ['H', 4, 4, 6],  // R4 vs R5, columns 4-6
  ['H', 4, 8, 9],
  ['H', 4, 1, 2],
  ['H', 7, 8, 9],
  ['H', 3, 2, 3],
  ['H', 1, 7, 9],
];
const blackDoots = [
  ['V', 4, 7, 9],  // C4 vs C5, rows 7-9
  ['V', 5, 7, 9],  // C5 vs C6, rows 7-9
  ['V', 3, 4, 5],
  ['V', 6, 5, 6],
  ['V', 7, 7, 8],
  ['V', 2, 8, 9],
  ['H', 5, 4, 6],  // R5 vs R6, columns 4-6
  ['H', 6, 1, 3],
  ['H', 3, 7, 9],
  ['H', 6, 8, 9],
];

// The two cell runs a doot separates.
const dootSets = ([axis, line, from, to]) => {
  const lanes = [];
  for (let i = from; i <= to; i++) lanes.push(i);
  return axis === 'V'
    ? [lanes.map(r => makeCellId(r, line)), lanes.map(r => makeCellId(r, line + 1))]
    : [lanes.map(c => makeCellId(line, c)), lanes.map(c => makeCellId(line + 1, c))];
};

// sum(a) - sum(b) = +/-1.
const consecutiveSums = (a, b) => new Or([
  new Sum(1, ...a, ...b.map(c => [c, -1])),
  new Sum(-1, ...a, ...b.map(c => [c, -1])),
]);

// sum(a) = 2*sum(b), or sum(b) = 2*sum(a).
const ratioSums = (a, b) => new Or([
  new Sum(0, ...a, ...b.map(c => [c, -2])),
  new Sum(0, ...a.map(c => [c, 2]), ...b.map(c => [c, -1])),
]);

return [
  new Shape('9x9'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDoots.map(doot => consecutiveSums(...dootSets(doot))),
  ...blackDoots.map(doot => ratioSums(...dootSets(doot))),
];
