// Title: Super Squares
// Author: Hakan Holgersson
// Video: https://www.youtube.com/watch?v=gpI0fmsY6Sc
// Source: https://cracking-the-cryptic.web.app/sudoku/3mLfG7M484

// Rules:
// Normal sudoku rules apply. 1-9 appear on each marked diagonal (both drawn
// grey diagonals, R1C1-R9C9 and R1C9-R9C1). Each coloured area can be read as
// a 3-digit square number, and similar-coloured areas are exactly identical.
//
// There are 3 colours (gold, yellow-green, brown/chocolate), each covering 3
// separate horizontal 3-cell areas (one row-triple sitting in each of the
// three diagonal boxes: R1, R5 and R9). Cell membership and layout are from
// the payload's coloured `underlays`. Reading direction for "read as a
// 3-digit number" is left-to-right (ascending column): 8 of the 9 areas are
// already listed column-ascending in the payload, no arrow/marker anywhere
// suggests a reversed direction for the ninth (brown, R5C1-C3, listed
// descending), and this is the universal CTC convention for a horizontal
// digit-string clue.

const squares = [];
for (let n = 10; n <= 31; n++) {
  const sq = n * n;
  // Grid digits are 1-9, so a square containing a 0 digit can never appear;
  // excluding it here keeps the pattern's alternatives all reachable.
  if (!String(sq).includes('0')) squares.push(sq);
}
const squarePattern = squares.join('|');

// Coloured areas, cells ordered left-to-right (ascending column) per the
// decode note above. Each colour lists its 3 areas in the same order so the
// per-position SameValues calls below line up area-for-area.
const gold = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R9C7', 'R9C8', 'R9C9'],
];
const yellowGreen = [
  ['R1C4', 'R1C5', 'R1C6'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R9C1', 'R9C2', 'R9C3'],
];
const brown = [
  ['R9C4', 'R9C5', 'R9C6'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R1C7', 'R1C8', 'R1C9'],
];
const colours = [gold, yellowGreen, brown];

// Each area reads as a 3-digit square number.
const squareRules = colours.flatMap(areas =>
  areas.map(area => new Regex(squarePattern, ...area)));

// Same-coloured areas are exactly identical: for each colour and each
// position within the triple, the 3 areas' cells at that position form 3
// size-1 sets that must hold the same (single) value, i.e. that position's
// digit is equal across all 3 areas.
const identicalAreaRules = colours.flatMap(areas =>
  [0, 1, 2].map(pos => new SameValues(
    3, ...areas.map(area => area[pos]))));

return [
  new Shape('9x9'),
  new Given('R3C4', 2),
  new Given('R4C2', 4),
  new Given('R4C7', 2),
  new Given('R6C3', 2),
  new Given('R6C8', 3),
  new Given('R7C6', 2),
  new Diagonal(-1),
  new Diagonal(1),
  ...squareRules,
  ...identicalAreaRules,
];
