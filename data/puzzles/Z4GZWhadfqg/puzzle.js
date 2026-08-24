// Title: Discovered Connections
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=Z4GZWhadfqg
// Source: https://app.crackingthecryptic.com/sudoku/FHN86gdPDb

// Normal sudoku rules apply (standard 3x3 boxes). Grey circle = odd, grey
// square = even, both encoded as multi-value Givens (no native Odd/Even
// class). Cell lists below are transcribed from the underlay colour/shape
// (rounded = circle, square otherwise; both `#CFCFCF` fill).
const oddCells = ['R1C2', 'R9C1', 'R2C8', 'R1C9'];
const evenCells = ['R3C7', 'R7C9', 'R9C8', 'R7C3', 'R3C1'];

// White/black dots: each is an independent two-cell edge (no dot forms a
// connected line with another), transcribed from the overlay edge marks by
// fill colour (`#FFFFFF` white, `#000000` black; border is black on both).
const whiteDots = [
  ['R1C1', 'R1C2'], ['R3C1', 'R4C1'], ['R4C1', 'R4C2'], ['R4C3', 'R4C4'],
  ['R6C1', 'R7C1'], ['R9C1', 'R9C2'], ['R7C3', 'R7C4'], ['R6C4', 'R7C4'],
  ['R7C5', 'R8C5'], ['R3C6', 'R4C6'], ['R1C7', 'R2C7'], ['R1C8', 'R2C8'],
  ['R3C8', 'R3C9'], ['R3C9', 'R4C9'], ['R6C7', 'R7C7'],
];
const blackDots = [
  ['R4C8', 'R4C9'], ['R8C7', 'R8C8'], ['R7C5', 'R7C6'], ['R7C4', 'R7C5'],
  ['R8C4', 'R9C4'], ['R7C1', 'R7C2'], ['R5C3', 'R5C4'], ['R3C5', 'R4C5'],
  ['R5C6', 'R5C7'],
];

// "Same difference, discovered by the solver": one shared nonzero absolute
// difference (1-8) holds at every white dot. Existentially quantify over the
// candidate difference: Or over d of And(every white-dot edge has that d).
const differenceKeys = Array.from({ length: 8 }, (_, index) => {
  const difference = index + 1;
  return Pair.fnToKey((a, b) => Math.abs(a - b) === difference, 9);
});
const sameDifference = new Or(differenceKeys.map((key, index) => new And(
  whiteDots.map(([a, b]) => new Pair(key, `white dot diff=${index + 1}`, a, b))
)));

// "Same ratio, discovered by the solver": one shared reduced ratio p:q holds
// at every black dot (p != q, gcd(p,q)=1; not restricted to integer
// multiples 1:n -- the rules text here just says "ratio", unlike a puzzle
// that spells out "ratio of 1:n"). Equal digits are not a "ratio". A pair
// (a,b) matches ratio p:q when {a,b} = {p*k, q*k} for some integer k, i.e.
// a*q===b*p (a on the p side) or a*p===b*q (a on the q side).
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
const ratioPairs = [];
for (let p = 2; p <= 9; p++) {
  for (let q = 1; q < p; q++) {
    if (gcd(p, q) === 1) ratioPairs.push([p, q]);
  }
}
const ratioKey = (p, q) => Pair.fnToKey(
  (a, b) => a * q === b * p || a * p === b * q, 9);
const sameRatio = new Or(ratioPairs.map(([p, q]) => new And(
  blackDots.map(([a, b]) => new Pair(ratioKey(p, q), `black dot ratio=${p}:${q}`, a, b))
)));

return [
  new Shape('9x9'),
  new Given('R2C2', 2),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  sameDifference,
  sameRatio,
];
