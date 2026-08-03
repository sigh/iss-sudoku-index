// Title: Add It Up
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=g4GVEbgzQrA
// Source: https://tinyurl.com/55rdxvn7
//
// Normal sudoku rules apply.
// Two pairs of identically-shaped, identically-coloured 5-cell regions are
// clones: each region's cell must equal the value in the corresponding cell
// (same relative position) of its clone partner. The source's `clone` array
// lists both regions of each pair in matching relative order, so each index
// below pairs a region-A cell with its region-B counterpart directly (no
// inferred correspondence).

// Lavender clone pair: plus-shape at R2C3 <-> plus-shape at R3C7.
const lavenderA = ['R1C3', 'R2C2', 'R2C3', 'R2C4', 'R3C3'];
const lavenderB = ['R2C7', 'R3C6', 'R3C7', 'R3C8', 'R4C7'];

// Pale-green clone pair: plus-shape at R7C3 <-> plus-shape at R8C7.
const greenA = ['R6C3', 'R7C2', 'R7C3', 'R7C4', 'R8C3'];
const greenB = ['R7C7', 'R8C6', 'R8C7', 'R8C8', 'R9C7'];

// SameValues(2, a, b) with two singleton sets forces a === b; used once per
// corresponding cell pair to encode positional (cell-for-cell) clone equality
// rather than a weaker same-multiset-per-region reading.
const cloneEqualities = [];
for (let i = 0; i < lavenderA.length; i++) {
  cloneEqualities.push(new SameValues(2, lavenderA[i], lavenderB[i]));
}
for (let i = 0; i < greenA.length; i++) {
  cloneEqualities.push(new SameValues(2, greenA[i], greenB[i]));
}

return [
  new Shape('9x9'),

  new Given('R1C1', 1), new Given('R1C2', 2),
  new Given('R1C8', 4), new Given('R1C9', 5),
  new Given('R2C1', 3), new Given('R2C8', 9), new Given('R2C9', 6),
  new Given('R4C5', 2),
  new Given('R5C4', 8), new Given('R5C6', 7),
  new Given('R6C5', 9),
  new Given('R8C1', 8), new Given('R8C2', 6), new Given('R8C9', 4),
  new Given('R9C1', 9), new Given('R9C2', 4), new Given('R9C8', 1), new Given('R9C9', 7),

  ...cloneEqualities,
];
