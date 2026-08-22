// Title: Colorado 2.1
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=g-huo81vX5o
// Source: https://app.crackingthecryptic.com/sudoku/NJTDMGdrHQ

// Standard sudoku (rows, columns, 3x3 boxes) plus:
// - Anti-knight: identical digits cannot be a knight's move apart.
// - X marks a pair summing to 10, V marks a pair summing to 5. The rules say
//   "Not all X's and V's may be given", so only the drawn pairs are
//   constrained (StrictXV, which would forbid the sum on every unmarked
//   pair too, does not apply).
// - The marked diagonal (an off-grid arrow above R1C9, pointing down-left)
//   sums to the printed total. LittleKiller sums the diagonal without
//   requiring its digits to be distinct, matching the rule's silence on
//   that point.

// X pairs (sum to 10), transcribed from the payload's edge overlays.
const xPairs = [
  ["R1C1", "R1C2"],
  ["R2C2", "R2C3"],
  ["R2C1", "R3C1"],
  ["R4C1", "R5C1"],
  ["R6C1", "R7C1"],
  ["R7C1", "R7C2"],
  ["R7C6", "R7C7"],
  ["R6C6", "R6C7"],
  ["R4C8", "R5C8"],
  ["R3C6", "R3C7"],
];

// V pairs (sum to 5), transcribed from the payload's edge overlays.
const vPairs = [
  ["R3C9", "R4C9"],
  ["R3C8", "R3C9"],
  ["R1C7", "R1C8"],
  ["R5C6", "R5C7"],
  ["R4C6", "R5C6"],
  ["R4C4", "R4C5"],
  ["R3C5", "R4C5"],
  ["R3C5", "R3C6"],
  ["R2C4", "R2C5"],
  ["R1C2", "R1C3"],
  ["R2C1", "R2C2"],
];

return [
  new Shape("9x9"),
  new AntiKnight(),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
  // Diagonal runs R1C9-R2C8-R3C7-R4C6-R5C5-R6C4-R7C3-R8C2-R9C1 (the arrow's
  // drawn path, down-left from off-grid above R1C9), sum 55.
  LittleKiller.fromCells(
    55, cellGraph("9x9").ray("R1C9", 1, -1), cellGeometry("9x9")),
];
