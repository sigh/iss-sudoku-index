// Title: Frenemy
// Author: Alaric Taqi A. (Crusader175)
// Video: https://www.youtube.com/watch?v=6QeAsJVTS8U
// Source: https://tinyurl.com/ycnbex9w
//
// Normal sudoku rules. A cell is "friendly" when its digit equals its own row
// number, column number, or box number (boxes numbered 1-9 left-to-right,
// top-to-bottom). Each marked X pair sums to 10 and each marked V pair sums
// to 5; every marked pair must contain exactly one friendly cell. Not all X/V
// are necessarily drawn, so undrawn adjacent pairs carry no constraint (no
// StrictXV reading).

const shape = new Shape('9x9');

const given = new Given('R4C4', 5);

// Friendliness is fixed by a cell's own position, so it reduces to a fixed
// set of digits per cell -- no solver-side derivation needed.
const friendlyDigits = (cellId) => {
  const { row, col } = parseCellId(cellId);
  const box = 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
  return new Set([row, col, box]);
};

// XV clue table, transcribed from the puzzle's drawn X/V marks (cell order as drawn).
// R2C2-R1C2 is held out below: both cells share the friendly set {1,2} (row
// 2/col 2/box 1 and row 1/col 2/box 1), and for any a+b=5 exactly one of a,b
// always lies in {1,2} -- so the friendly-XOR is forced whenever the sum
// holds, and the compound relation is provably identical to plain V here.
const xvClues = [
  ['X', 'R7C4', 'R7C3'],
  ['X', 'R7C3', 'R6C3'],
  ['V', 'R2C8', 'R1C8'],
  ['X', 'R2C8', 'R2C9'],
  ['V', 'R9C2', 'R9C1'],
  ['X', 'R8C1', 'R9C1'],
  ['X', 'R8C8', 'R8C9'],
  ['X', 'R4C2', 'R4C3'],
  ['V', 'R4C6', 'R3C6'],
  ['V', 'R4C7', 'R4C6'],
  ['X', 'R2C5', 'R3C5'],
  ['X', 'R5C7', 'R5C8'],
  ['X', 'R9C5', 'R8C5'],
];

// One Pair per edge: the target sum plus "exactly one of the two cells is
// friendly" (XOR over each cell's own fixed friendly-digit set). Each pair
// gets its own key since the friendly sets are position-specific.
const xvPairs = xvClues.map(([mark, cellA, cellB]) => {
  const target = mark === 'X' ? 10 : 5;
  const friendlyA = friendlyDigits(cellA);
  const friendlyB = friendlyDigits(cellB);
  const key = Pair.fnToKey(
    (a, b) => (a + b === target) && (friendlyA.has(a) !== friendlyB.has(b)),
    shape);
  return new Pair(key, mark, cellA, cellB);
});

const r2c2r1c2 = new V('R2C2', 'R1C2');

return [shape, given, ...xvPairs, r2c2r1c2];
