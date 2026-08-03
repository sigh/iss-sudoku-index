// Title: Six Dots
// Author: Lutterot
// Video: https://www.youtube.com/watch?v=RyLYjW5q7z8
// Source: https://app.crackingthecryptic.com/sudoku/pTDBf2QF42

// Normal sudoku rules apply (default row/column/box all-different, standard
// boxes -- no Jigsaw/NoBoxes needed).
//
// Black dots: cells separated by a black dot have a 2:1 ratio -- BlackDot
// per drawn dot. The rules give no "not all dots given" disclaimer, so only
// the six drawn pairs are constrained (no StrictKropki negative elsewhere).
//
// Box/position rule: boxes are numbered 1-9 in reading order, the standard
// sudoku-variant convention (also used to talk about "box 5" etc.); the
// rule gives no other numbering, so within-box position reuses the same
// reading-order convention (position 1 = a box's top-left cell, ...,
// position 9 = its bottom-right cell). For every pair of distinct labels
// x < y and every position p: the cell at box y's position p holds digit x
// iff the cell at box x's position p holds digit y. That biconditional,
// applied at every position, is equivalent to "digit X in box Y and digit Y
// in box X sit at the same position": whichever position carries digit x in
// box y forces digit y into that same position in box x (and vice versa),
// and at every other position neither side can hold the other's label,
// since each digit occupies exactly one position per box.

const graph = cellGraph('9x9');
const boxes = graph.boxes(); // boxes[b-1][p-1] = cell at box b, position p

const boxSymmetryPairs = [];
for (let x = 1; x <= 9; x++) {
  for (let y = x + 1; y <= 9; y++) {
    const key = Pair.fnToKey((a, b) => (a === x) === (b === y), 9);
    for (let p = 1; p <= 9; p++) {
      boxSymmetryPairs.push(new Pair(
        key, 'box-position-symmetry',
        boxes[y - 1][p - 1], boxes[x - 1][p - 1]));
    }
  }
}

// Drawn black-dot edges.
const blackDotPairs = [
  ['R2C1', 'R3C1'],
  ['R3C8', 'R4C8'],
  ['R4C6', 'R5C6'],
  ['R7C3', 'R7C4'],
  ['R7C5', 'R7C6'],
  ['R7C8', 'R7C9'],
];

return [
  new Shape('9x9'),
  ...blackDotPairs.map(cells => new BlackDot(...cells)),
  ...boxSymmetryPairs,
];
