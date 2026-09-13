// Title: Wheels on the Bus
// Author: Alaric Taqi A. (Crusader175)
// Video: https://www.youtube.com/watch?v=bW1HxqVJKAI
// Source: https://yusitnikov.github.io/puzzletv/#wheels-on-the-bus

// Normal sudoku on a 9x9 grid, no given digits. Disjoint Groups: cells in the
// same relative position across different boxes cannot repeat a digit --
// ISS's built-in DisjointSets is exactly this rule.
//
// Wheels: each of the 9 box-center cells carries a circle touching its four
// orthogonal neighbours within the box (up, right, down, left). Some of
// those four spokes are printed with a digit on the circle; a blank spoke
// carries none. The printed digits rotate 90 degrees clockwise around the
// circle (up -> right -> down -> left -> up), one step for every unit the
// center cell's own (solved) digit N exceeds 1. Wherever a spoke is printed
// with a digit, the touched cell the rotation carries it to must hold that
// digit.
//
// Reading the rotation count as N-1 (rather than N, as the rules text's
// prose literally says) is what the rules text's own worked example forces,
// applied to this puzzle's own R2C8 wheel: R2C8 is printed up=4, left=8
// (right and down blank). The example states that when the center digit is
// 6, the up cell gets 8 and the right cell gets 4 -- i.e. the printed left
// digit (8) lands on "up", and the printed up digit (4) lands on "right".
// Moving up -> right -> down -> left is one clockwise spoke step, so the
// printed digits move exactly one step clockwise for a center digit of 6.
// One step, not the six (or six mod four = two) a literal "N times" would
// give, but exactly N-1 = 5, 5 mod 4 = 1: consistent for every center digit
// residue mod 4, since a full rotation (4 steps) is the identity.

const U = undefined;

// [center, up, right, down, left] -- printed spoke digits, transcribed from
// the puzzle's own wheel definitions.
const WHEELS = [
  ['R2C2', 3, U, 7, U],
  ['R2C5', 2, 6, U, 1],
  ['R2C8', 4, U, U, 8],
  ['R5C2', 4, 5, 8, U],
  ['R5C5', 3, 7, U, U],
  ['R5C8', 2, U, 6, U],
  ['R8C2', 2, U, U, 6],
  ['R8C5', 4, 8, U, U],
  ['R8C8', 3, 9, U, 7],
];

// Spoke order matches WHEELS' printed-digit order: up, right, down, left.
const SPOKE_DELTAS = [[-1, 0], [0, 1], [1, 0], [0, -1]];

const touchedCell = (center, [dr, dc]) => {
  const { row, col } = parseCellId(center);
  return makeCellId(row + dr, col + dc);
};

// One Pair per (center, touched-cell), all sharing the 'wheel' name (same
// family of relation, one canonical constraint tag): the custom relation
// looks up, for the center's digit n, which spoke index the rotation moves
// onto this touched cell's spoke position p -- idx = (p - (n - 1)) mod 4 --
// and requires the touched cell's digit to match that spoke's printed
// digit, when printed at all. A blank spoke imposes no requirement for the
// center digits that rotate it onto this position.
const wheelPairs = WHEELS.flatMap(([center, ...printed]) =>
  SPOKE_DELTAS.map((delta, p) => {
    const touched = touchedCell(center, delta);
    const key = Pair.fnToKey(
      (n, v) => {
        const idx = (((p - (n - 1)) % 4) + 4) % 4;
        const printedDigit = printed[idx];
        return printedDigit === U || v === printedDigit;
      },
      9);
    return new Pair(key, 'wheel', center, touched);
  })
);

return [
  new Shape('9x9'),
  new DisjointSets(),
  ...wheelPairs,
];
