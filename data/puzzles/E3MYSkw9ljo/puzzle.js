// Title: Swiss Flag Sudoku
// Author: Rhys Minchin
// Video: https://www.youtube.com/watch?v=E3MYSkw9ljo
// Source: https://cracking-the-cryptic.web.app/sudoku/BBqhg2g6gL

// Normal sudoku (standard 9x9, standard boxes). Killer cages sum to their
// total, no repeats within a cage. Outside clues give the Sandwich total
// (digits strictly between the 1 and the 9 in that row/column). Every cage
// and outside total is printed as one or two letters instead of digits: nine
// distinct letters (A, C, G, H, I, R, U, V, Z) each stand for one digit 1-9,
// consistently, a different digit per letter. A two-letter total is the
// two-digit number the letters spell, first letter = tens, second = units;
// a literal "0" inside a total is a real digit 0, not a cipher letter (0 is
// outside 1-9). `x` is a
// separate single unknown number (not a 1-9 cipher digit): every cage or
// clue printed "x" shares that one value, pinned only by "x is a factor of
// the sum of the digits in the white cells" (the 33 cells outside the drawn
// red Swiss-cross background).
//
// Two payload columns beside the grid print the same nine letters (scrambled
// but spelling "ZURICH"/"GVA") and a blank column; that is a cast-list
// legend outside row/column/box logic, not a tenth clue set, so it is not
// encoded here.
//
// Each of the nine cipher letters gets an auxiliary Var (domain 1-9, the
// grid's own alphabet -- no widened Shape is needed anywhere in this
// script). The nine are pairwise different (AllDifferent), i.e. a bijection
// onto 1-9. A cage whose total is a cipher letter ties the cage's actual sum
// to that letter's Var with EqualSum (cage cells as one segment, the letter
// Var as the other) rather than branching, plus AllDifferent for cages of
// 2+ cells; a 1-cell cage instead SameValues-ties its one cell straight to
// the letter's Var. An outside clue whose total is a cipher letter cannot
// use this trick (Sandwich's own target must be a literal at construction
// time), so it branches over the 9 candidate digits, each branch pinning
// the letter's Var and the Sandwich target to that digit together. A
// two-letter total branches over both letters'
// digits (81 minus the 9 equal-digit branches, which AllDifferent would
// reject anyway); a letter-plus-literal-0 total only branches over the one
// letter, with the total fixed at 10x that digit.
//
// `x` never gets its own persistent Var: every place it appears is folded
// into one Or over the 10 literal values it could take (21..30, the
// intersection of the five x-cages' generic min/max sums for their sizes --
// 4,5,4,6,5 cells respectively -- computed from k distinct digits drawn from
// 1-9), so each branch fixes x as a plain literal shared by all six
// occurrences (five cage sums plus the column-6 top Sandwich) plus the
// factor rule, encoded as a further Or over the literal white-cell-sum
// values that are multiples of that branch's x within the cells' generic
// [33, 297] sum range (33 cells, each 1-9).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// One auxiliary Var per cipher letter.
const letters = ['A', 'C', 'G', 'H', 'I', 'R', 'U', 'V', 'Z'];
const letterVars = Object.fromEntries(
  letters.map(l => [l, new Var('L' + l, `letter ${l} digit`, 1)]));
const letterVar = l => letterVars[l].cell(1);

// Cages whose total is a single cipher letter (not "x").
const singleCellLetterCages = [
  ['R', 'R2C7'],
  ['A', 'R3C9'],
  ['Z', 'R6C2'],
  ['G', 'R7C7'],
];
const multiCellLetterCages = [
  ['I', ['R2C4', 'R3C4']],
  ['U', ['R2C6', 'R3C6']],
  ['G', ['R1C7', 'R1C8']],
  ['R', ['R4C2', 'R4C3', 'R5C2']],
  ['R', ['R4C4', 'R5C4']],
  ['R', ['R5C6', 'R6C6']],
  ['V', ['R5C7', 'R6C7']],
  ['I', ['R5C8', 'R6C8']],
  ['I', ['R9C8', 'R9C9']],
  ['C', ['R7C4', 'R7C5']],
  ['H', ['R8C5', 'R8C6']],
  ['R', ['R9C1', 'R9C2']],
];

// Cages whose total is "x" (sizes 4, 5, 4, 6, 5).
const xCages = [
  ['R1C2', 'R2C2', 'R2C3', 'R3C3'],
  ['R4C5', 'R4C6', 'R5C5', 'R6C4', 'R6C5'],
  ['R7C8', 'R7C9', 'R8C7', 'R8C8'],
  ['R7C1', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C3'],
  ['R1C9', 'R2C8', 'R2C9', 'R3C7', 'R3C8'],
];

// Outside Sandwich clues whose total is one cipher letter.
const letterSandwiches = [
  [graph.column(2), 'I'],
  [graph.column(9), 'V'],
  [graph.row(1), 'C'],
];
// Two-letter (two-digit) totals: [cells, tensLetter, onesLetter].
const twoLetterSandwiches = [
  [graph.column(3), 'A', 'H'],
  [graph.row(3), 'Z', 'V'],
];
// Letter-plus-literal-0 (two-digit, units fixed at 0): [cells, tensLetter].
const letterZeroSandwiches = [
  [graph.column(7), 'U'],
];
// Plain literal totals.
const numericSandwiches = [
  [graph.row(7), 0],
];
// The one Sandwich clue printed "x".
const xSandwichCells = graph.column(6);

// White cells: the 33 cells not covered by the red Swiss-cross background
// (payload `underlays`, background #E6261F).
const whiteCells = [
  'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6',
  'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8',
  'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8',
  'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8',
  'R7C4', 'R7C5', 'R7C6',
  'R8C4', 'R8C5', 'R8C6',
];
const WHITE_SUM_MIN = whiteCells.length * 1;
const WHITE_SUM_MAX = whiteCells.length * 9;

function letterSandwichOr(cells, letter) {
  const v = letterVar(letter);
  return new Or(digits.map(d => new And([
    new Given(v, d),
    Sandwich.fromCells(d, cells, geometry),
  ])));
}

function twoLetterSandwichOr(cells, tensLetter, onesLetter) {
  const t = letterVar(tensLetter);
  const o = letterVar(onesLetter);
  const branches = [];
  for (const td of digits) {
    for (const od of digits) {
      if (td === od) continue;
      branches.push(new And([
        new Given(t, td),
        new Given(o, od),
        Sandwich.fromCells(10 * td + od, cells, geometry),
      ]));
    }
  }
  return new Or(branches);
}

function letterZeroSandwichOr(cells, tensLetter) {
  const t = letterVar(tensLetter);
  return new Or(digits.map(td => new And([
    new Given(t, td),
    Sandwich.fromCells(10 * td, cells, geometry),
  ])));
}

// x: one Or over its 10 literal candidate values, each branch fixing every
// occurrence (5 cage sums, the column-6 Sandwich, and the white-cell factor
// rule) to that literal at once.
const xCandidates = [];
for (let d = 21; d <= 30; d++) xCandidates.push(d);

function multiplesInRange(d, lo, hi) {
  const out = [];
  for (let m = Math.ceil(lo / d) * d; m <= hi; m += d) out.push(m);
  return out;
}

const xClause = new Or(xCandidates.map(d => new And([
  ...xCages.map(cells => new Sum(d, ...cells)),
  Sandwich.fromCells(d, xSandwichCells, geometry),
  new Or(multiplesInRange(d, WHITE_SUM_MIN, WHITE_SUM_MAX)
    .map(m => new Sum(m, ...whiteCells))),
])));

return [
  new Shape('9x9'),

  ...Object.values(letterVars),
  new AllDifferent(...letters.map(letterVar)),

  ...singleCellLetterCages.map(
    ([l, cell]) => new SameValues(2, cell, letterVar(l))),
  ...multiCellLetterCages.flatMap(([l, cells]) => [
    new AllDifferent(...cells),
    new EqualSum(cells, [letterVar(l)]),
  ]),
  ...xCages.map(cells => new AllDifferent(...cells)),
  xClause,

  ...letterSandwiches.map(([cells, l]) => letterSandwichOr(cells, l)),
  ...twoLetterSandwiches.map(
    ([cells, t, o]) => twoLetterSandwichOr(cells, t, o)),
  ...letterZeroSandwiches.map(
    ([cells, t]) => letterZeroSandwichOr(cells, t)),
  ...numericSandwiches.map(
    ([cells, value]) => Sandwich.fromCells(value, cells, geometry)),
];
