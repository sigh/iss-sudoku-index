// Title: XV Lines 2
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=Vy-ZnwcvjrQ
// Source: https://app.crackingthecryptic.com/sudoku/QgdG6gP7jq

// Normal sudoku rules apply (Shape + default row/column/box AllDifferent).
// Identical digits cannot be a chess knight's move apart -> AntiKnight.
// Each yellow line: every listed-order-adjacent pair sums to 5 or 10, i.e.
// each edge behaves as an undisclosed X or V dot -> one Pair per line with a
// custom sum-5-or-10 key, applied over the whole ordered cell list.
// Each purple line: the covered cells hold a set of consecutive digits in any
// order -> Renban.
// One black dot is drawn (rules: not all dots are given, so no negative
// information is encoded for the undrawn edges) -> BlackDot on the one drawn
// edge.

const xvSumKey = Pair.fnToKey((a, b) => a + b === 5 || a + b === 10, 9);

// Yellow line cell lists, path order, from the drawn line waypoints
// (diagonal segments interpolated through the cell they visually cross).
const yellowLines = [
  ['R2C1', 'R3C1', 'R2C2'],
  ['R4C2', 'R4C3', 'R3C3'],
  ['R4C6', 'R3C5', 'R2C4', 'R1C5', 'R2C6', 'R3C7'],
  ['R3C8', 'R4C7'],
  ['R4C8', 'R5C8', 'R6C9', 'R5C9'],
  ['R5C5', 'R6C6'],
  ['R7C3', 'R6C4'],
];

// Purple line cell lists, path order, from the drawn line waypoints.
const purpleLines = [
  ['R4C9', 'R3C8'],
  ['R6C5', 'R6C6', 'R7C7'],
];

const xvLines = yellowLines.map(
  (cells, i) => new Pair(xvSumKey, `XV line ${i + 1}`, ...cells));

const renbanLines = purpleLines.map(
  (cells, i) => new Renban(...cells));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...xvLines,
  ...renbanLines,
  new BlackDot('R9C4', 'R9C5'),
];
