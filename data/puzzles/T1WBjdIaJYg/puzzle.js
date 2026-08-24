// Title: It's Gonna Be a Long Knight
// Author: Cam Dennis
// Video: https://www.youtube.com/watch?v=T1WBjdIaJYg
// Source: https://app.crackingthecryptic.com/sudoku/74pnqPrLt2
//
// Normal sudoku rules apply (standard 3x3 boxes; no givens).
// Killer cages: digits in a cage do not repeat and sum to the small clue in
// its top-left cell; one cage is drawn with no total (all-different only).
// Digits do not repeat along either of the two marked diagonals.
// Any two cells at taxicab (orthogonal-step) distance exactly 4 cannot hold
// the same digit -- this is a global rule, not tied to any drawn cage/line.

const cages = [
  // R1C2,R2C1,R2C2,R2C3,R3C2 = 33 (top-middle cage)
  ['33', 'R1C2', 'R2C2', 'R3C2', 'R2C1', 'R2C3'],
  // R1C8,R2C7,R2C8,R2C9,R3C8 = 21 (top-middle cage, right side)
  ['21', 'R1C8', 'R2C8', 'R3C8', 'R2C7', 'R2C9'],
  // R4C4,R4C5 = 7
  ['7', 'R4C4', 'R4C5'],
  // R4C6,R5C6, no total shown -- all-different only
  ['', 'R4C6', 'R5C6'],
  // R5C4,R6C4 = 12
  ['12', 'R5C4', 'R6C4'],
  // R6C5,R6C6 = 4
  ['4', 'R6C5', 'R6C6'],
  // R7C8,R8C7,R8C8,R8C9,R9C8 = 33 (bottom-middle cage, right side)
  ['33', 'R7C8', 'R8C8', 'R9C8', 'R8C7', 'R8C9'],
  // R7C2,R8C1,R8C2,R8C3,R9C2 = 17 (bottom-middle cage)
  ['17', 'R7C2', 'R8C2', 'R9C2', 'R8C1', 'R8C3'],
];

// Taxicab-distance-4 non-repeat pairs, derived from the grid geometry rather
// than hand-enumerated. For each cell, only the "forward" offsets (row
// increasing, or same row with column increasing) are used so each unordered
// pair is generated exactly once.
const offsets = [];
for (let dr = 0; dr <= 4; dr++) {
  const dc = 4 - dr;
  if (dr === 0) {
    offsets.push([0, dc]);
  } else if (dc === 0) {
    offsets.push([dr, 0]);
  } else {
    offsets.push([dr, dc]);
    offsets.push([dr, -dc]);
  }
}

const taxicabPairs = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    for (const [dr, dc] of offsets) {
      const r2 = r + dr, c2 = c + dc;
      if (r2 >= 1 && r2 <= 9 && c2 >= 1 && c2 <= 9) {
        taxicabPairs.push([makeCellId(r, c), makeCellId(r2, c2)]);
      }
    }
  }
}

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new Diagonal(-1),
  new Diagonal(1),
  ...taxicabPairs.map(([a, b]) => new AllDifferent(a, b)),
];
