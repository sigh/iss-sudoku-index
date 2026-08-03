// Title: Tears of the Kropki
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=ceho1f3FBwA
// Source: https://tinyurl.com/cfmajacc

// Normal sudoku rules apply (default row/column/box all-different).
// Difference Pairs (white dots): the two cells must differ by the printed
// value. Ratio Pairs (black dots): one cell's digit is the printed value
// times the other's. Encoded with Pair, one custom binary key per distinct
// printed value, grouped so identical dots share a key/name -- except the
// printed-ratio-2 dots, whose relation (one value double the other) is
// exactly BlackDot's native semantics.
// No givens or other clue types are present in this puzzle.

const diffKey = v => Pair.fnToKey((a, b) => Math.abs(a - b) === v, 9);
const ratioKey = v => Pair.fnToKey((a, b) => a === b * v || b === a * v, 9);

// Difference (white dot) pairs, grouped by printed value.
const differencePairs = {
  3: [['R3C1', 'R3C2'], ['R1C4', 'R1C5'], ['R5C6', 'R6C6'], ['R8C3', 'R9C3']],
  5: [['R5C4', 'R6C4'], ['R5C1', 'R6C1'], ['R4C7', 'R5C7']],
  4: [['R6C4', 'R6C5'], ['R7C2', 'R8C2'], ['R1C3', 'R2C3']],
  6: [['R3C7', 'R4C7'], ['R2C6', 'R2C7']],
  2: [['R4C1', 'R5C1']],
};

// Ratio (black dot) pairs, grouped by printed value, excluding value 2
// (below).
const ratioPairs = {
  5: [['R8C3', 'R8C4'], ['R4C5', 'R4C6']],
  4: [['R4C9', 'R5C9'], ['R4C4', 'R5C4']],
  6: [['R7C8', 'R7C9'], ['R4C6', 'R5C6']],
  9: [['R6C3', 'R7C3']],
  8: [['R5C9', 'R6C9']],
  3: [['R5C3', 'R6C3'], ['R8C7', 'R9C7'], ['R2C8', 'R3C8']],
};

// Printed-ratio-2 dots: BlackDot is the native class for this exact relation.
const ratioTwoPairs = [['R9C4', 'R9C5'], ['R1C7', 'R2C7']];

const differenceConstraints = Object.entries(differencePairs).flatMap(
  ([v, pairs]) => pairs.map(
    cells => new Pair(diffKey(+v), `difference ${v}`, ...cells)));

const ratioConstraints = Object.entries(ratioPairs).flatMap(
  ([v, pairs]) => pairs.map(
    cells => new Pair(ratioKey(+v), `ratio ${v}`, ...cells)));

const blackDotConstraints = ratioTwoPairs.map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...differenceConstraints,
  ...ratioConstraints,
  ...blackDotConstraints,
];
