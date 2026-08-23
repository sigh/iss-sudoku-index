// Title: July 28, 2021: Begun It Has
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=_YomjQ0aIbg
// Source: https://tinyurl.com/nk6ctb7w

// Normal sudoku rules apply. Six 2x2 cages (shaded blue, no printed total) are
// clones of each other: they must contain the same digits in the same order.
// A no-total cage is still a real cage, so each one is also all-different
// internally.
//
// Cage cell order below is top-left, top-right, bottom-left, bottom-right,
// taken directly from the source payload's `cage[].cells` array order for
// each cage. "Same order" is read against that shared TL/TR/BL/BR layout:
// the clone rule is encoded as one equality group per relative position
// (all six top-left cells equal, all six top-right cells equal, etc.),
// which is strictly stronger than -- and so subsumes -- an unordered
// same-multiset reading.

const cages = [
  ['R1C7', 'R1C8', 'R2C7', 'R2C8'],
  ['R2C5', 'R2C6', 'R3C5', 'R3C6'],
  ['R4C3', 'R4C4', 'R5C3', 'R5C4'],
  ['R5C6', 'R5C7', 'R6C6', 'R6C7'],
  ['R7C4', 'R7C5', 'R8C4', 'R8C5'],
  ['R8C2', 'R8C3', 'R9C2', 'R9C3'],
];

// Cage all-different (no printed total).
const cageAllDifferent = cages.map(
  (cells) => new AllDifferent(...cells));

// Positional clone equality: for each of the 4 within-cage positions, the 6
// corresponding cells (one per cage) must share a value. SameValues with one
// singleton "set" per cell forces exact equality across the whole list.
const clonePositions = [];
for (let pos = 0; pos < 4; pos++) {
  const posCells = cages.map((cage) => cage[pos]);
  clonePositions.push(new SameValues(posCells.length, ...posCells));
}

return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C4', 8),
  new Given('R2C2', 7),
  new Given('R3C3', 6),
  new Given('R4C1', 5),
  new Given('R4C7', 4),
  new Given('R5C5', 3),
  new Given('R6C3', 3),
  new Given('R6C9', 2),
  new Given('R7C7', 6),
  new Given('R8C8', 4),
  new Given('R9C6', 8),
  new Given('R9C9', 1),

  ...cageAllDifferent,
  ...clonePositions,
];
