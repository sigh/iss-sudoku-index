// Title: Some Sequence
// Author: Asaddu
// Video: https://www.youtube.com/watch?v=B80frgsBICQ
// Source: https://app.crackingthecryptic.com/sudoku/4GQ6fL4j6R

// Standard sudoku rows/columns/boxes (default 3x3 boxes, no jigsaw regions).
// Five cages, one of each size from 2 through 6 cells, none carrying a
// printed total: each is all-different internally ("Cages must not repeat
// digits"), and their totals -- ordered by cage size -- form a run of five
// consecutive integers, each one more than the smaller cage's total ("must
// have sequential sums from the smallest to largest cage, eg the 3-cell cage
// has a total one larger than the 2-cell cage"). Encoded directly as the
// linear relation total(next size) - total(prev size) = 1 via coefficient
// Sums, rather than materializing either total as a Var: a 6-cell cage's
// total can reach 39, above the 16-value hard limit on any widened Shape/Var
// domain, but the difference between two adjacent totals never needs to be
// materialized as a value.
// White dots: consecutive digits. Black dots: ratio 1:2.

const cage2 = ['R3C1', 'R4C1'];
const cage3 = ['R7C1', 'R8C1', 'R9C1'];
const cage4 = ['R5C3', 'R6C3', 'R6C4', 'R7C4'];
const cage5 = ['R3C7', 'R4C6', 'R4C7', 'R5C5', 'R5C6'];
const cage6 = ['R7C2', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R9C3'];

// Consecutive-size cage pairs, smaller first, in increasing size order.
const cageSizeChain = [cage2, cage3, cage4, cage5, cage6];

const cageSumSteps = cageSizeChain.slice(1).map((bigger, i) => {
  const smaller = cageSizeChain[i];
  return new Sum(
    1,
    ...bigger.map(c => [c, 1]),
    ...smaller.map(c => [c, -1]));
});

// White dots (consecutive), from the drawn white-filled edge marks.
const whiteDots = [
  ['R5C3', 'R6C3'],
  ['R9C5', 'R9C6'],
  ['R5C5', 'R5C6'],
  ['R6C5', 'R6C6'],
  ['R1C9', 'R2C9'],
].map(cells => new WhiteDot(...cells));

// Black dots (ratio 1:2), from the drawn black-filled edge marks.
const blackDots = [
  ['R7C7', 'R7C8'],
  ['R2C7', 'R3C7'],
  ['R6C7', 'R7C7'],
  ['R1C4', 'R1C5'],
  ['R3C1', 'R3C2'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),

  new Given('R4C2', 7),
  new Given('R5C4', 1),
  new Given('R5C8', 2),
  new Given('R9C5', 7),

  new AllDifferent(...cage2),
  new AllDifferent(...cage3),
  new AllDifferent(...cage4),
  new AllDifferent(...cage5),
  new AllDifferent(...cage6),
  ...cageSumSteps,

  ...whiteDots,
  ...blackDots,
];
