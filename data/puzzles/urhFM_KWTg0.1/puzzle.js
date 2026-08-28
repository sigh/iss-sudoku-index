// Title: Nov 9, 2021: Symmetric Unequal
// Author: clover!
// Video: https://www.youtube.com/watch?v=urhFM_KWTg0
// Source: https://tinyurl.com/we2zmjym

// Normal Sudoku rules apply. Any two cells related by 180-degree rotational
// symmetry about the grid center must not hold the same digit.

// Build every symmetric cell pair (R,C) <-> (10-R, 10-C), skipping the
// self-paired center cell R5C5. Each pair gets its own AllDifferent(a, b),
// which forbids the two cells from sharing a digit.
const symmetricPairs = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const r2 = 10 - r;
    const c2 = 10 - c;
    if (r2 === r && c2 === c) continue; // center cell, no partner
    // Only add each unordered pair once.
    if (r2 < r || (r2 === r && c2 < c)) continue;
    symmetricPairs.push([makeCellId(r, c), makeCellId(r2, c2)]);
  }
}

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C3', 3), new Given('R1C5', 5),
  new Given('R1C7', 7), new Given('R1C9', 9),
  new Given('R2C4', 3),
  new Given('R3C1', 7), new Given('R3C9', 4),
  new Given('R4C2', 6), new Given('R4C4', 7), new Given('R4C6', 8), new Given('R4C8', 9),
  new Given('R6C1', 5), new Given('R6C3', 4), new Given('R6C5', 3), new Given('R6C7', 2), new Given('R6C9', 1),
  new Given('R8C1', 4), new Given('R8C9', 5),
  new Given('R9C2', 2), new Given('R9C4', 4), new Given('R9C6', 6), new Given('R9C8', 8),
  ...symmetricPairs.map(([a, b]) => new AllDifferent(a, b)),
];
