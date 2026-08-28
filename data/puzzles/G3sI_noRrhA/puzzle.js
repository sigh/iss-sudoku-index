// Title: The One Clue
// Author: ProwlingTiger
// Video: https://www.youtube.com/watch?v=G3sI_noRrhA
// Source: https://cracking-the-cryptic.web.app/sudoku/Jj3bG8NGQF

// Normal sudoku rules apply (standard 3x3 boxes). Normal killer sudoku rules
// apply: digits do not repeat within a cage. Normal little killer sudoku
// rules apply: each arrow gives the sum of the digits along its diagonal,
// and digits may repeat along that diagonal. No cage or arrow shows a
// printed total; instead, every cage sum and every arrow sum equals one of
// exactly two numbers M or N, both of which the solver must deduce. Because
// the rule requires M and N to each be *deducible*, an encoding that left
// either one witnessed by no cage/arrow would leave it free over its whole
// domain rather than pinned by the puzzle -- so at least one structure is
// required to total M and at least one to total N. M and N are otherwise
// unordered labels the rules never distinguish, so `M < N` pins a single
// representative per the result contract instead of admitting a second
// "solution" that only swaps which name holds which value.

// A cage/arrow total can reach 54 (arrow #4: 6 cells, repeats allowed,
// max 9*6), above the Var alphabet's 16-value hard cap, so M and N are each
// split into base-16 hi/lo digit Vars and recombined with a coefficient
// `Sum` everywhere their value is read.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);

// Restrict the playable grid to the true 1-9 digit set (Var cells keep the
// widened 0-15 range).
const digitRange = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

const BASE = 16;
const nonZero = Array.from({ length: BASE - 1 }, (_, i) => i + 1); // 1..15

const mHiVar = new Var('MH', 'M div 16');
const mLoVar = new Var('ML', 'M mod 16');
const nHiVar = new Var('NH', 'N div 16');
const nLoVar = new Var('NL', 'N mod 16');
const sHiVar = new Var('SH', '(N - M) div 16, forces N > M');
const sLoVar = new Var('SL', '(N - M) mod 16, forces N > M');
const [mHi, mLo, nHi, nLo, sHi, sLo] =
  [mHiVar, mLoVar, nHiVar, nLoVar, sHiVar, sLoVar].map(v => v.cell(1));

// sum(cells) == 16*hi + lo, i.e. the structure's total equals the composite
// value.
const sumEqualsComposite = (cells, hi, lo) =>
  new Sum(0, ...cells, [hi, -BASE], [lo, -1]);

// Killer cages, transcribed from the payload's cage cell lists (no printed
// totals).
const cages = [
  ['R2C1', 'R3C1', 'R4C1'],
  ['R2C3', 'R3C3'],
  ['R2C4', 'R3C4', 'R3C5'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R2C5', 'R2C6', 'R3C6'],
  ['R4C3', 'R5C3'],
  ['R6C3', 'R6C4', 'R5C4'],
  ['R4C4', 'R4C5'],
  ['R4C6', 'R5C6'],
  ['R5C5', 'R6C5', 'R6C6'],
  ['R7C4', 'R8C4'],
  ['R9C4', 'R9C3'],
  ['R7C1', 'R8C1', 'R8C2'],
  ['R6C2', 'R7C2'],
  ['R1C7', 'R2C7'],
  ['R2C8', 'R3C8'],
  ['R4C8', 'R5C8'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R7C7', 'R7C8'],
  ['R8C7', 'R8C8'],
  ['R9C7', 'R9C8'],
];

// Little killer diagonals, resolved from the payload's off-grid arrow
// waypoints (bulb + direction cue) to full on-grid cell paths.
const littleKillers = [
  ['R4C1', 'R3C2', 'R2C3', 'R1C4'],
  ['R9C3', 'R8C2', 'R7C1'],
  ['R9C2', 'R8C1'],
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
  ['R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'],
  ['R3C9', 'R2C8', 'R1C7'],
];

const cageConstraints = cages.flatMap(cells => [
  new AllDifferent(...cells),
  new Or([
    sumEqualsComposite(cells, mHi, mLo),
    sumEqualsComposite(cells, nHi, nLo),
  ]),
]);

const littleKillerConstraints = littleKillers.map(cells => new Or([
  sumEqualsComposite(cells, mHi, mLo),
  sumEqualsComposite(cells, nHi, nLo),
]));

const allGroups = [...cages, ...littleKillers];

return [
  shape,
  digitRange,
  mHiVar, mLoVar, nHiVar, nLoVar, sHiVar, sLoVar,
  new Given('R7C5', 9), // the payload's one given digit (raw R7C6, shifted).
  ...cageConstraints,
  ...littleKillerConstraints,
  // M and N are each witnessed by at least one structure (see header note).
  new Or(allGroups.map(cells => sumEqualsComposite(cells, mHi, mLo))),
  new Or(allGroups.map(cells => sumEqualsComposite(cells, nHi, nLo))),
  // N = M + slack, slack >= 1 (i.e. slack's hi or lo digit is nonzero) --
  // forces the canonical ordering M < N.
  new Sum(0, [mHi, BASE], [mLo, 1], [sHi, BASE], [sLo, 1],
    [nHi, -BASE], [nLo, -1]),
  new Or([new Given(sHi, ...nonZero), new Given(sLo, ...nonZero)]),
];
