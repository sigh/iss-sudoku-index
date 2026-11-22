// Title: Hidden Rubies
// Author: AlbinS
// Video: https://www.youtube.com/watch?v=gDLn258-VmY
// Source: https://sudokupad.app/wc3wlqryel

// Rules encoded: normal sudoku; R9C9=2 given. 36 rubies sit on edges between
// orthogonally adjacent cells, 4 inside each box (none on box borders). Each
// box's 4 rubies have 4 different cuts: 1 white kropki (consecutive),
// 2 black kropki (ratio 2:1), 3 V (sum 5), 4 X (sum 10). Which ruby has which
// cut is not drawn, so each ruby gets a cut Var and the cuts in a box differ.
// Fog is UI only and is not encoded.

// Ruby edges, one list per box in reading order; from the 36 drawn diamond overlays.
const boxes = [
  [['R1C2', 'R2C2'], ['R2C1', 'R2C2'], ['R2C2', 'R2C3'], ['R2C2', 'R3C2']],
  [['R2C4', 'R2C5'], ['R1C5', 'R2C5'], ['R1C4', 'R2C4'], ['R1C4', 'R1C5']],
  [['R2C7', 'R3C7'], ['R3C7', 'R3C8'], ['R2C7', 'R2C8'], ['R2C8', 'R3C8']],
  [['R4C2', 'R5C2'], ['R5C2', 'R6C2'], ['R5C2', 'R5C3'], ['R4C1', 'R5C1']],
  [['R5C4', 'R5C5'], ['R5C5', 'R5C6'], ['R4C5', 'R4C6'], ['R6C4', 'R6C5']],
  [['R4C8', 'R5C8'], ['R5C7', 'R5C8'], ['R5C8', 'R5C9'], ['R5C8', 'R6C8']],
  [['R7C2', 'R8C2'], ['R8C1', 'R8C2'], ['R8C2', 'R8C3'], ['R8C2', 'R9C2']],
  [['R7C4', 'R7C5'], ['R7C5', 'R7C6'], ['R8C4', 'R9C4'], ['R8C5', 'R8C6']],
  [['R7C9', 'R8C9'], ['R7C8', 'R7C9'], ['R8C9', 'R9C9'], ['R9C7', 'R9C8']],
];

const cuts = [WhiteDot, BlackDot, V, X]; // cut value k+1 selects cuts[k]
const rubies = boxes.flat();
const cutVar = new Var('C', 'Cut', rubies.length);
const cutCells = cutVar.cells();

return [
  new Shape('9x9'),
  new Given('R9C9', 2),
  cutVar,
  ...cutCells.map(c => new Given(c, 1, 2, 3, 4)),
  ...boxes.map((_, b) => new AllDifferent(...cutCells.slice(4 * b, 4 * b + 4))),
  ...rubies.map(([a, b], i) => new Or(
    cuts.map((Cut, k) => new And([
      new Given(cutCells[i], k + 1),
      new Cut(a, b),
    ]))
  )),
];
