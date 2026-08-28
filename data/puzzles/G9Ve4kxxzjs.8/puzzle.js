// Title: May 12, 2022: Product/Sum
// Author: clover!
// Video: https://www.youtube.com/watch?v=G9Ve4kxxzjs
// Source: https://tinyurl.com/mtx9ucu8

// Normal sudoku rules apply. Each two- or three-cell cage is marked "+" (the
// sum of its digits) or "x" (the product of its digits); no repeat-digit
// clause is stated for cages. Every cage here lies entirely within one row,
// one column, or one box (checked against the transcription below), so
// within-cage all-different is already implied by the standard row/column/box
// constraints -- no separate rule is needed to get it.

const givens = [
  new Given('R4C6', 6),
  new Given('R6C4', 7),
  new Given('R6C6', 2),
];

// Sum ("+") cages: [total, ...cells]. Transcribed from the drawn cage labels
// prefixed "+".
const sumCages = [
  [5, 'R1C2', 'R1C3'],
  [6, 'R3C2', 'R4C2'],
  [6, 'R1C7', 'R1C8'],
  [7, 'R2C6', 'R2C7'],
  [7, 'R9C7', 'R9C8'],
  [8, 'R6C8', 'R7C8'],
  [8, 'R7C1', 'R8C1'],
  [9, 'R8C3', 'R8C4'],
  [20, 'R4C4', 'R4C5', 'R5C4'],
].map(([total, ...cells]) => new Cage(total, ...cells));

// Product ("x") cages: [target, ...cells]. Transcribed from the drawn cage
// labels prefixed "x". ISS has no built-in product-cage
// class. A 2-cell product cage is a binary relation, so it is a Pair keyed
// by a*b === target. The one 3-cell product cage cannot be a Pair (Pair only
// relates consecutive pairs, and a*b===target for each consecutive pair is
// not the same rule as a*b*c===target), so it is an NFA that carries the
// running product (starting at 1), rejects a branch once the product
// exceeds the target, and accepts iff the product after the last cell
// equals the target.
function productPair(target, cellA, cellB) {
  const key = Pair.fnToKey((a, b) => a * b === target, 9);
  return new Pair(key, `product ${target}`, cellA, cellB);
}
function productCageNFA(target) {
  return NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      if (state > target) return;
      return state * value;
    },
    accept: state => state === target,
  }, 9);
}
function productCage3(target, cells) {
  return new NFA(productCageNFA(target), `product ${target}`, ...cells);
}
const productPairDefs = [
  [5, 'R2C1', 'R3C1'],
  [6, 'R2C3', 'R2C4'],
  [6, 'R2C9', 'R3C9'],
  [7, 'R3C8', 'R4C8'],
  [7, 'R7C9', 'R8C9'],
  [8, 'R8C6', 'R8C7'],
  [8, 'R9C2', 'R9C3'],
  [9, 'R6C2', 'R7C2'],
];
const productPairs = productPairDefs.map(([target, a, b]) =>
  productPair(target, a, b));
const productCages3 = [
  productCage3(20, ['R5C5', 'R5C6', 'R6C5']),
];

return [
  new Shape('9x9'),
  ...givens,
  ...sumCages,
  ...productPairs,
  ...productCages3,
];
