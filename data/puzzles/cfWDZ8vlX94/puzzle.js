// Title: Tilted
// Author: Alaric Taqi A. (Crusader175)
// Video: https://www.youtube.com/watch?v=cfWDZ8vlX94
// Source: https://sudokupad.app/m35yptjo24

// Rules encoded:
//  - Normal sudoku (rows/cols/boxes, default).
//  - Coordinate: for each 3-cell horizontal pill, reading left to right as
//    digits X, Y, Z: rXcY = Z.
//  - Diagonal: the r=c diagonal ('\', "diagonal-" in the payload) has no
//    repeats.
//  - Modular Lines: every 3 sequential cells along the teal line contain one
//    digit each from {1,4,7}, {2,5,8}, {3,6,9}.
//  - X Pairs: the marked adjacent pairs sum to 10. "Not all X's are given"
//    is a negative-inference warning only -- it does not add a constraint,
//    so no StrictXV/negative pairs are encoded.

// Pill geometry: each pill is a horizontal run of 3 cells (payload "arrow"
// entries with an empty "lines" array -- a cosmetic 3-cell pill, not a real
// sum-arrow). Left-to-right column order in the payload matches the rule's
// "reading left to right".
const pills = [
  ['R3C1', 'R3C2', 'R3C3'],
  ['R4C2', 'R4C3', 'R4C4'],
  ['R5C3', 'R5C4', 'R5C5'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R7C5', 'R7C6', 'R7C7'],
  ['R8C6', 'R8C7', 'R8C8'],
  ['R9C7', 'R9C8', 'R9C9'],
];

// X-Pairs (from payload "xv", all type "X" -- sum to 10).
const xPairs = [
  ['R3C1', 'R3C2'],
  ['R4C2', 'R4C3'],
  ['R5C4', 'R5C3'],
  ['R6C5', 'R6C4'],
  ['R7C5', 'R7C6'],
  ['R8C6', 'R8C7'],
  ['R9C8', 'R9C7'],
];

// Modular line (from payload "line"): the staircase of pill-leader cells.
const modularLine = ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'];

// A Coordinate pill has no native ISS class: cell C's value must equal the
// value of the grid cell addressed by (cell A's value, cell B's value), and
// that address is only known once A and B are solved. Encode it as the
// disjunction of all 81 concrete (row, col) readings of (A, B): pin A and B
// to one candidate pair and require C to match the addressed cell's value.
// Exactly one branch's Givens can hold in any completion, so this is an
// exact case-split, not an approximation.
function coordinateConstraint([a, b, c]) {
  const branches = [];
  for (let x = 1; x <= 9; x++) {
    for (let y = 1; y <= 9; y++) {
      const target = makeCellId(x, y);
      branches.push(new And([
        new Given(a, x),
        new Given(b, y),
        new SameValues(2, c, target),
      ]));
    }
  }
  return new Or(branches);
}

return [
  new Shape('9x9'),
  new Given('R1C7', 2),
  new Given('R3C9', 5),
  new Diagonal(-1),
  new Modular(3, ...modularLine),
  ...pills.map(coordinateConstraint),
  ...xPairs.map(([p, q]) => new X(p, q)),
];
