// Title: May 22, 2023: Multiple Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=i6kxW7s3gd4
// Source: https://tinyurl.com/4e5dnau6

// Normal sudoku rules apply. Additionally, if two digits are separated by a
// gray dot, then one of those digits is a multiple of the other (e.g. 1 and
// 6, or 3 and 9). Not all possible dots are necessarily given, so the dots
// below are the only pairwise constraints; an undotted adjacent pair carries
// no restriction.

const givens = [
  new Given('R1C2', 4),
  new Given('R1C5', 3),
  new Given('R1C8', 1),
  new Given('R3C9', 3),
  new Given('R4C5', 2),
  new Given('R5C1', 9),
  new Given('R5C3', 4),
  new Given('R5C7', 3),
  new Given('R5C9', 5),
  new Given('R6C5', 9),
  new Given('R7C1', 4),
  new Given('R9C2', 1),
  new Given('R9C5', 8),
  new Given('R9C8', 3),
];

// Each pair straddles one drawn gray dot (all filled the same light gray).
// Cell order within a pair is not meaningful.
const dotPairs = [
  ['R1C1', 'R1C2'], ['R1C3', 'R1C2'], ['R1C4', 'R1C3'], ['R1C4', 'R1C5'],
  ['R1C6', 'R1C5'], ['R9C5', 'R9C4'], ['R9C5', 'R9C6'], ['R9C6', 'R9C7'],
  ['R9C8', 'R9C7'], ['R9C9', 'R9C8'], ['R3C9', 'R2C9'], ['R3C9', 'R4C9'],
  ['R7C1', 'R8C1'], ['R7C1', 'R6C1'], ['R4C1', 'R3C1'], ['R7C9', 'R6C9'],
  ['R6C9', 'R6C8'], ['R4C2', 'R4C1'], ['R4C2', 'R5C2'], ['R6C8', 'R5C8'],
  ['R5C2', 'R5C3'], ['R5C7', 'R5C8'], ['R5C3', 'R6C3'], ['R4C7', 'R5C7'],
  ['R8C3', 'R7C3'], ['R7C3', 'R7C4'], ['R6C4', 'R7C4'], ['R6C4', 'R6C5'],
  ['R3C7', 'R2C7'], ['R3C7', 'R3C6'], ['R3C6', 'R4C6'], ['R4C5', 'R4C6'],
  ['R8C4', 'R8C3'], ['R2C6', 'R2C7'],
];

// "one of those digits is a multiple of the other" -- symmetric divisibility,
// true whenever either digit divides the other (1 divides everything).
const multipleKey = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, 9);
const grayDots = dotPairs.map(
  cells => new Pair(multipleKey, 'Gray dot', ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...grayDots,
];
