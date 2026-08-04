// Title: 22(2)!
// Author: Spelldaddy
// Video: https://www.youtube.com/watch?v=nIUATjEW3HI
// Source: https://app.crackingthecryptic.com/sudoku/dhB32HBp3j

// Normal sudoku rules apply (default row/column/box all-different).
// Anti-king: no two cells a king's move apart share a digit.
// Thermo: 8 two-cell "domino" thermometers, bulb cell listed first.
// The three cages below are clones of each other: the digit at each
// relative position must match across all three. The cages carry no total
// and, at 11 cells each, cannot themselves be all-different regions (more
// cells than available digits) -- per the rules text they exist only to
// mark the clone shape.

// Cage cell lists transcribed from the three drawn cage outlines, each
// listed in the source's own cell order.
const cageA = ['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1', 'R4C1', 'R5C1', 'R5C3', 'R5C2'];
const cageB = ['R5C4', 'R5C5', 'R5C6', 'R4C6', 'R3C6', 'R3C5', 'R3C4', 'R6C4', 'R7C4', 'R7C5', 'R7C6'];
const cageC = ['R5C7', 'R5C9', 'R5C8', 'R7C8', 'R7C7', 'R6C9', 'R9C8', 'R8C7', 'R7C9', 'R9C9', 'R9C7'];

// Match cells across the three cages by their offset from that cage's own
// bounding-box corner (min row, min col) -- this is "the same relative
// position" the rules refer to, derived from the cage cell lists rather
// than hand-matched.
const byOffset = [cageA, cageB, cageC].map(cage => {
  const cells = cage.map(parseCellId);
  const minRow = Math.min(...cells.map(c => c.row));
  const minCol = Math.min(...cells.map(c => c.col));
  const map = new Map();
  for (const c of cells) {
    map.set(`${c.row - minRow},${c.col - minCol}`, makeCellId(c.row, c.col));
  }
  return map;
});
const offsets = [...byOffset[0].keys()];
if (offsets.length !== cageA.length ||
  !offsets.every(k => byOffset[1].has(k) && byOffset[2].has(k))) {
  throw new Error('Clone cages are not congruent translates of each other.');
}
// SameValues(3, x, y, z) with 3 singleton sets pins x, y and z to one
// shared digit -- one such constraint per matched relative position.
const clones = offsets.map(key => new SameValues(
  3, byOffset[0].get(key), byOffset[1].get(key), byOffset[2].get(key)));

// Thermometers: bulb cell (the end marked with a filled circle) listed
// first for each of the 8 drawn two-cell thermometer lines.
const thermos = [
  ['R2C1', 'R2C2'],
  ['R2C5', 'R2C4'],
  ['R3C7', 'R4C6'],
  ['R4C9', 'R4C8'],
  ['R8C9', 'R8C8'],
  ['R6C3', 'R6C4'],
  ['R8C2', 'R7C1'],
  ['R9C6', 'R8C5'],
].map(cells => new Thermo(...cells));

return [
  new Shape('9x9'),
  new AntiKing(),
  ...thermos,
  ...clones,
];
