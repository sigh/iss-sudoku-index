// Title: Same old, same old
// Author: Tavaritz
// Video: https://www.youtube.com/watch?v=os1ETGT9LoM
// Source: https://app.crackingthecryptic.com/sudoku/bh74qbjB36

// Normal sudoku rules apply (default row/column/box all-different; the two
// clone blocks below are not standard boxes, so boxes stay untouched).
// Arrows: digits along the arm sum to the bulb digit (Arrow's first cell).
// Palindrome lines: read the same both ways.
// Clone regions: two 3x3 blocks (not sudoku boxes) each contain all of 1-9,
// with the same digit in the same relative position in both blocks.

const arrows = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5'],
  ['R5C9', 'R6C8', 'R7C7', 'R8C6'],
  ['R9C9', 'R8C8', 'R7C7', 'R6C6'],
  ['R5C1', 'R6C2', 'R7C3', 'R8C4'],
].map(cells => new Arrow(...cells));

const palindromes = [
  ['R4C2', 'R5C2', 'R6C2', 'R7C3', 'R8C3', 'R9C3'],
  ['R4C5', 'R5C6', 'R6C7', 'R7C8'],
  ['R2C9', 'R3C8', 'R4C7'],
  ['R2C3', 'R3C2', 'R4C1'],
].map(cells => new Palindrome(...cells));

// Clone regions: region A occupies R2C2-R4C4, region B is region A
// translated by (+4 rows, +4 cols) to R6C6-R8C8 -- the only correspondence
// consistent with two identically-shaped, identically-oriented 3x3 blocks.
const regionA = [];
const regionB = [];
for (let dr = 0; dr < 3; dr++) {
  for (let dc = 0; dc < 3; dc++) {
    regionA.push(makeCellId(2 + dr, 2 + dc));
    regionB.push(makeCellId(6 + dr, 6 + dc));
  }
}

const cloneRegions = [
  new AllDifferent(...regionA),
  new AllDifferent(...regionB),
];
// Position-wise clone pairing: SameValues with numSets=2 over a single pair
// splits into two size-1 sets, so "same values" is exactly cell-to-cell
// equality -- one instance per relative position within the blocks.
const clonePairs = regionA.map((cell, i) => new SameValues(2, cell, regionB[i]));

return [
  new Shape('9x9'),
  ...arrows,
  ...palindromes,
  ...cloneRegions,
  ...clonePairs,
];
