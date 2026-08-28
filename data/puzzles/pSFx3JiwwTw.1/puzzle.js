// Title: Oct 5, 2021: Gamma and Epsilon
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=pSFx3JiwwTw
// Source: https://tinyurl.com/yvtskrnb

// Normal sudoku. A black dot between two cells means their digits have a
// ratio of 3 (one is 3x the other). A white dot means their digits differ by
// 5. "There is no negative constraint" -- unmarked adjacent pairs are
// unrestricted, so no exhaustive/negative dot class is used.

// No named class carries an arbitrary ratio/difference value, so each dot
// family is a custom two-cell Pair keyed by fnToKey; the predicate mirrors
// the rule text directly.
const ratioKey = Pair.fnToKey((a, b) => a === 3 * b || b === 3 * a, 9);
const differenceKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 5, 9);

// Provenance: the puzzle's 10 drawn white dots.
const differenceDots = [
  ['R5C5', 'R5C6'],
  ['R3C8', 'R4C8'],
  ['R4C7', 'R4C8'],
  ['R6C2', 'R6C3'],
  ['R5C2', 'R5C3'],
  ['R5C8', 'R5C7'],
  ['R1C4', 'R1C3'],
  ['R8C4', 'R8C5'],
  ['R2C7', 'R1C7'],
  ['R7C8', 'R6C8'],
];

// Provenance: the puzzle's 14 drawn black dots.
const ratioDots = [
  ['R2C4', 'R3C4'],
  ['R3C4', 'R4C4'],
  ['R7C6', 'R6C6'],
  ['R7C6', 'R8C6'],
  ['R5C5', 'R5C4'],
  ['R1C1', 'R2C1'],
  ['R1C1', 'R1C2'],
  ['R8C9', 'R9C9'],
  ['R9C8', 'R9C9'],
  ['R7C2', 'R6C2'],
  ['R9C6', 'R9C7'],
  ['R2C5', 'R2C6'],
  ['R9C3', 'R8C3'],
  ['R3C2', 'R4C2'],
];

return [
  new Shape('9x9'),
  new Given('R5C1', 1),
  new Given('R5C9', 5),
  ...differenceDots.map(([a, b]) => new Pair(differenceKey, 'white dot (diff 5)', a, b)),
  ...ratioDots.map(([a, b]) => new Pair(ratioKey, 'black dot (ratio 3)', a, b)),
];
