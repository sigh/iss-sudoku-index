// Title: Ladybird Sudoku
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=QBWa_hCpLMo
// Source: https://app.crackingthecryptic.com/sudoku/BBpPP9jLB8

// Normal sudoku rules apply (default 9x9 grid, standard row/col/box
// all-different). Whenever a digit is larger than the one immediately to its
// right, a dot joins the two horizontally adjacent cells: black if the
// digit difference is odd, red if the difference is even. "Whenever X, a dot
// joins..." is read as exhaustive (every place the described relation holds
// is dotted), so every horizontal edge without a drawn dot instead requires
// the left digit to be less than the right digit. The rule only mentions
// "the one on its right", so vertical adjacencies carry no constraint, and
// none are drawn.

const givens = [
  new Given('R1C5', 7), new Given('R2C3', 3), new Given('R2C7', 9),
  new Given('R3C1', 7), new Given('R3C9', 2), new Given('R5C5', 1),
  new Given('R7C1', 6), new Given('R7C9', 3), new Given('R8C3', 5),
  new Given('R9C5', 4),
];

// Horizontal-edge dots, transcribed from the drawn overlay marks (fill
// #000000 = black = odd difference, #e6261f = red = even difference).
const blackDotEdges = [
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C5', 'R1C6'], ['R1C7', 'R1C8'],
  ['R2C2', 'R2C3'], ['R2C4', 'R2C5'], ['R2C5', 'R2C6'],
  ['R3C1', 'R3C2'], ['R3C3', 'R3C4'], ['R3C4', 'R3C5'], ['R3C8', 'R3C9'],
  ['R4C2', 'R4C3'], ['R4C6', 'R4C7'],
  ['R5C3', 'R5C4'], ['R5C6', 'R5C7'],
  ['R6C1', 'R6C2'], ['R6C5', 'R6C6'], ['R6C8', 'R6C9'],
  ['R7C3', 'R7C4'], ['R7C5', 'R7C6'], ['R7C8', 'R7C9'],
  ['R8C1', 'R8C2'], ['R8C5', 'R8C6'],
  ['R9C1', 'R9C2'], ['R9C2', 'R9C3'], ['R9C3', 'R9C4'],
];

const redDotEdges = [
  ['R1C4', 'R1C5'],
  ['R2C7', 'R2C8'],
  ['R3C5', 'R3C6'],
  ['R4C3', 'R4C4'], ['R4C4', 'R4C5'], ['R4C8', 'R4C9'],
  ['R5C4', 'R5C5'], ['R5C7', 'R5C8'],
  ['R7C2', 'R7C3'], ['R7C6', 'R7C7'],
  ['R8C3', 'R8C4'], ['R8C6', 'R8C7'],
  ['R9C6', 'R9C7'],
];

// Every horizontal edge in the grid, derived (not hand-enumerated) from the
// row/column shape, so the undotted-edge set below is computed as the
// complement of the drawn dots rather than transcribed by hand.
const allHorizontalEdges = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) {
    allHorizontalEdges.push([makeCellId(r, c), makeCellId(r, c + 1)]);
  }
}
const dottedEdgeKeys = new Set(
  [...blackDotEdges, ...redDotEdges].map(([a, b]) => `${a}-${b}`));
const noDotEdges = allHorizontalEdges.filter(
  ([a, b]) => !dottedEdgeKeys.has(`${a}-${b}`));

// Relation keys. `a` is always the left cell, `b` the right cell (Pair binds
// consecutive-in-list-order pairs, matching GreaterThan's "cell must be
// greater than any later adjacent cell" convention).
const blackKey = Pair.fnToKey((a, b) => a > b && (a - b) % 2 === 1, 9);
const redKey = Pair.fnToKey((a, b) => a > b && (a - b) % 2 === 0, 9);

const blackDots = blackDotEdges.map(
  ([a, b]) => new Pair(blackKey, 'black dot (odd, left>right)', a, b));
const redDots = redDotEdges.map(
  ([a, b]) => new Pair(redKey, 'red dot (even, left>right)', a, b));
// Exhaustively-marked-clue negative (every place the "left>right" relation
// holds is dotted, per the rules' "whenever ..." phrasing): every undrawn
// horizontal edge forbids left>right, so it forces left<right. Uses the
// native GreaterThan class in reversed cell order (right, left) so it reads
// as "right must be greater than left".
const noDots = noDotEdges.map(([a, b]) => new GreaterThan(b, a));

return [
  new Shape('9x9'),
  ...givens,
  ...blackDots,
  ...redDots,
  ...noDots,
];
