// Title: April 27, 2023: The Odd Couple
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=fW1l8RKcrmM
// Source: https://tinyurl.com/yvk9dwak

// Normal sudoku rules apply. A white dot between adjacent cells means the
// two digits differ by exactly 5; a black dot between adjacent cells means
// the two digits are in a 3:1 ratio. The rules state there is no negative
// constraint, so an undotted adjacent pair may still happen to satisfy
// either relationship: only the drawn dots are encoded.
//
// Neither relation is a built-in dot class (WhiteDot is difference-of-1,
// BlackDot is ratio-2:1), so each dot is a Pair with a custom predicate.
// difference-of-5 and ratio-3:1 are each symmetric in the two cells, so a
// single shared key covers every dot of that colour regardless of order.

const diffKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 5, 9);
const ratioKey = Pair.fnToKey((a, b) => a === b * 3 || b === a * 3, 9);

// White dots (difference of 5), from raw "difference" list.
const diffPairs = [
  ['R8C1', 'R8C2'],
  ['R7C2', 'R7C3'],
  ['R6C3', 'R6C4'],
  ['R5C4', 'R5C5'],
  ['R4C5', 'R4C6'],
  ['R3C6', 'R3C7'],
  ['R2C7', 'R2C8'],
  ['R1C8', 'R1C9'],
  ['R6C9', 'R7C9'],
  ['R8C7', 'R9C7'],
];

// Black dots (ratio 3:1), from raw "ratio" list.
const ratioPairs = [
  ['R7C3', 'R8C3'],
  ['R6C4', 'R7C4'],
  ['R5C5', 'R6C5'],
  ['R4C6', 'R5C6'],
  ['R3C7', 'R4C7'],
  ['R2C8', 'R3C8'],
  ['R8C2', 'R9C2'],
  ['R1C9', 'R2C9'],
  ['R3C1', 'R4C1'],
  ['R1C3', 'R2C3'],
];

return [
  new Shape('9x9'),

  // Givens, from raw grid.
  new Given('R2C4', 5),
  new Given('R2C6', 3),
  new Given('R4C2', 5),
  new Given('R4C8', 1),
  new Given('R6C2', 3),
  new Given('R6C8', 7),
  new Given('R8C4', 1),
  new Given('R8C6', 9),

  ...diffPairs.map(cells => new Pair(diffKey, 'diff5', ...cells)),
  ...ratioPairs.map(cells => new Pair(ratioKey, 'ratio3', ...cells)),
];
