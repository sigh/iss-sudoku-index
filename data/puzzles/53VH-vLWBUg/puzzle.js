// Title: Little Killer Variant
// Author: Seungjae Kwak
// Video: https://www.youtube.com/watch?v=53VH-vLWBUg
// Source: https://cracking-the-cryptic.web.app/sudoku/7TLmFJFf4R

// Normal sudoku (rows, columns, boxes) plus one given.
// Sixteen diagonal arrows point into the grid from outside it; each one's
// printed number is EITHER the sum OR the product of the digits it runs
// through (rules panel: "Clues outside the grid give either the sum or the
// product of all digits in the direction of the arrow."). Which of the two
// applies is not stated and can differ per arrow, so each diagonal is
// encoded as an Or between a Sum and a running-product NFA sharing the same
// target.

// Running product of the digits read so far (empty product = 1). Every digit
// is >= 1, so a branch that overshoots the target can never come back down;
// cutting it there keeps the compiled state small (all our targets are <= 49).
function productNFA(target) {
  return NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      if (state > target) return;
      return state * value;
    },
    accept: state => state === target,
  }, 9);
}

function sumOrProduct(target, cells) {
  // A 2-cell product is a plain pairwise relation, not a scan.
  const productConstraint = cells.length === 2
    ? new Pair(Pair.fnToKey((a, b) => a * b === target, 9),
      `product=${target}`, ...cells)
    : new NFA(productNFA(target), `product=${target}`, ...cells);
  return new Or([
    new Sum(target, ...cells),
    productConstraint,
  ]);
}

// Diagonal cell runs and printed numbers, transcribed from the drawn arrow
// direction/endpoint and its paired outside-badge number.
const diagonals = [
  [15, ['R1C2', 'R2C1']],
  [9, ['R1C3', 'R2C2', 'R3C1']],
  [24, ['R1C4', 'R2C3', 'R3C2', 'R4C1']],
  [6, ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1']],
  [14, ['R2C9', 'R1C8']],
  [9, ['R3C9', 'R2C8', 'R1C7']],
  [21, ['R4C9', 'R3C8', 'R2C7', 'R1C6']],
  [29, ['R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5']],
  [16, ['R9C8', 'R8C9']],
  [10, ['R9C7', 'R8C8', 'R7C9']],
  [23, ['R9C6', 'R8C7', 'R7C8', 'R6C9']],
  [49, ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9']],
  [12, ['R8C1', 'R9C2']],
  [18, ['R7C1', 'R8C2', 'R9C3']],
  [24, ['R6C1', 'R7C2', 'R8C3', 'R9C4']],
  [8, ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5']],
];

return [
  new Shape('9x9'),
  new Given('R5C4', 9),
  ...diagonals.map(([target, cells]) => sumOrProduct(target, cells)),
];
