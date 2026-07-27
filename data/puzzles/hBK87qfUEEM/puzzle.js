// Title: Make It Count
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=hBK87qfUEEM
// Source: https://sudokupad.app/mwpu102gkm

// Rules encoded:
// - Normal sudoku rules (default row/column/box all-different from Shape).
// - Counting Circles: the value in a circle equals the number of circles
//   (among this single set of 26) holding that same value. Native
//   `CountingCircles`.
// - Index Lines: on a line of length L, number its cells 1..L starting from
//   the diamond end. If the digit at position N is V, then V must itself be
//   a valid position (1..L) -- "indicates the position along the line" only
//   makes sense for a digit that names a real position -- and the digit at
//   position V must be N. This is a self-inverse (involution) relation
//   between line positions; for lines of length 9 (A and C) the domain
//   restriction is a no-op since 1..9 is already the full grid range.

// Circle cells (26), one circle per cell; transcribed from the drawn
// single-cell circle markers (one colour/style -- one counting set).
const circleCells = [
  'R1C7', 'R1C8', 'R2C3', 'R2C7', 'R2C9', 'R3C1', 'R3C2', 'R3C3', 'R4C4',
  'R4C7', 'R5C8', 'R6C2', 'R6C3', 'R6C4', 'R6C8', 'R6C9', 'R7C1', 'R7C5',
  'R7C7', 'R7C9', 'R8C1', 'R8C2', 'R9C3', 'R9C5', 'R9C6', 'R9C9',
];

// Index-line cell orders, transcribed from the diamond end of each drawn line.
const indexLines = [
  ['R9C3', 'R8C3', 'R7C3', 'R7C4', 'R6C4', 'R5C4', 'R4C4', 'R3C4', 'R3C5'],
  ['R7C6', 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R7C9', 'R7C8', 'R7C7'],
  ['R6C3', 'R6C2', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3'],
];

// For every pair of positions (i, j), i < j, on one index line: the digit at
// position i equals j exactly when the digit at position j equals i. This
// pairwise iff is equivalent to the full "digit at N gives the position of
// digit N" rule and needs no running state.
function indexLineConstraints(cells) {
  const length = cells.length;
  const domainCap = cells.map(cell => new Given(
    cell, ...Array.from({ length }, (_, k) => k + 1)));
  const pairs = [];
  for (let i = 1; i <= length; i++) {
    for (let j = i + 1; j <= length; j++) {
      pairs.push(new Pair(
        Pair.fnToKey((a, b) => (a === j) === (b === i), 9),
        '', cells[i - 1], cells[j - 1]));
    }
  }
  return length < 9 ? [...domainCap, ...pairs] : pairs;
}

return [
  new Shape('9x9'),
  new CountingCircles(...circleCells),
  ...indexLines.flatMap(indexLineConstraints),
];
