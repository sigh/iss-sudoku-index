// Title: Beats
// Author: Arun Iyer
// Video: https://www.youtube.com/watch?v=X1sl9JmkzJs
// Source: https://app.crackingthecryptic.com/sudoku/6TR7LtD2bm

// Rules: Normal sudoku rules apply. Small circles show the difference
// between the cells they join (a "difference dot" with the value printed
// inside). Large circles show digits that each must appear in a touching
// cell (standard quadruple semantics over the four cells of the 2x2 block
// the circle sits on). Lines are palindromes, read the same each way.
// All rules are encoded; nothing is omitted.

// Difference dots (diff 1) are exactly Kropki's WhiteDot relation
// (consecutive values); use the native class for those.
const whiteDots = [
  new WhiteDot('R2C4', 'R3C4'),
  new WhiteDot('R4C1', 'R4C2'),
];

// Difference dots (diff != 1): one Pair per edge, keyed by the printed
// difference. Cells and printed values transcribed from the drawn
// edge-sized rounded overlay marks.
const diffEdges = [
  [2, 'R1C1', 'R2C1'],
  [2, 'R1C1', 'R1C2'],
  [2, 'R1C2', 'R2C2'],
  [2, 'R1C8', 'R1C9'],
  [2, 'R1C9', 'R2C9'],
  [2, 'R2C8', 'R2C9'],
  [2, 'R8C1', 'R8C2'],
  [2, 'R8C1', 'R9C1'],
  [2, 'R9C1', 'R9C2'],
  [2, 'R9C8', 'R9C9'],
  [2, 'R8C8', 'R9C8'],
  [4, 'R8C9', 'R9C9'],
  [3, 'R8C5', 'R8C6'],
  [3, 'R6C5', 'R6C6'],
];
const diffKeys = {};
for (const [n] of diffEdges) {
  if (!(n in diffKeys)) {
    diffKeys[n] = Pair.fnToKey((a, b) => Math.abs(a - b) === n, 9);
  }
}
const differenceDots = diffEdges.map(
  ([n, a, b]) => new Pair(diffKeys[n], `Diff ${n}`, a, b));

// Quadruple circles: transcribed from the drawn large circles centred on
// a 2x2 intersection, whose text lists the required digits.
const quads = [
  new Quad('R5C1', 3, 5, 7),
  new Quad('R1C5', 3, 5, 7),
  new Quad('R5C8', 2, 6),
];

// Palindrome lines: transcribed from the drawn diagonal grey strokes;
// each line's cell list is walked as drawn.
const palindromes = [
  new Palindrome('R3C6', 'R4C7'),
  new Palindrome('R3C5', 'R4C6', 'R5C7'),
  new Palindrome('R5C3', 'R6C4', 'R7C5'),
  new Palindrome('R6C3', 'R7C4'),
];

return [
  new Shape('9x9'),
  ...whiteDots,
  ...differenceDots,
  ...quads,
  ...palindromes,
];
