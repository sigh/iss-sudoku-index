// Title: Mislabeled Killers
// Author: CaptZebraCakes
// Video: https://www.youtube.com/watch?v=v8F3ISG8ZHE
// Source: https://sudokupad.app/ejfmnsdqaf

// Normal sudoku. Every outlined cage is a killer cage: its digits do not
// repeat. Each cage holds one two-digit pill; read left to right the pill
// spells a two-digit number, and that number is the total of a killer cage
// other than the one the pill sits in. No two killer cages have the same
// total. One digit is given: R8C8 = 6.
// Nothing is omitted.

// Drawn geometry. Nine outlined cages, none of them carrying a printed total,
// and nine two-cell pills. Each pill lies wholly inside one cage, so the
// pill-to-cage pairing below is derived from the cell lists rather than
// transcribed.
const CAGE_CELLS = [
  ['R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C1'],
  ['R9C2', 'R9C3'],
  ['R6C2', 'R6C3', 'R7C2', 'R7C3', 'R8C2'],
  ['R2C8', 'R2C9', 'R3C8', 'R3C9'],
  ['R1C1', 'R1C2', 'R2C2'],
  ['R8C5', 'R8C6', 'R9C6', 'R9C7'],
  ['R1C4', 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C6'],
  ['R4C7', 'R4C8', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C7', 'R6C8', 'R7C7'],
  ['R5C3', 'R5C4', 'R6C4', 'R6C5', 'R7C5'],
];
const PILL_CELLS = [
  ['R1C4', 'R1C5'],
  ['R4C1', 'R4C2'],
  ['R5C3', 'R5C4'],
  ['R6C2', 'R6C3'],
  ['R9C2', 'R9C3'],
  ['R8C5', 'R8C6'],
  ['R5C5', 'R5C6'],
  ['R1C1', 'R1C2'],
  ['R2C8', 'R2C9'],
];

// Every pill is a horizontal domino, so "read from left to right" is reading
// order: the lower column holds the tens digit.
const leftToRight = (cells) => [...cells].sort((a, b) => {
  const A = parseCellId(a);
  const B = parseCellId(b);
  return A.row - B.row || A.col - B.col;
});

const cages = CAGE_CELLS.map((cells) => ({
  cells,
  pill: leftToRight(PILL_CELLS.find((pill) => pill.every(
    (cell) => cells.includes(cell)))),
}));

// A cage total runs from 3 (the two-cell cage at its lowest) to 45 (the
// nine-cell cage), which is wider than a single 1-9 cell can hold, so each
// total is carried across two Var layers in base 9:
//     total(i) = 9 * VA(i) + VB(i) - 7.
// Both components run over the ordinary 1-9 grid values, and every integer
// from 3 to 45 has exactly one representation of that form, so two cages have
// equal totals exactly when they agree in both layers.
const totalHigh = new Var('A', 'cage total, high base-9 component', 9);
const totalLow = new Var('B', 'cage total, low base-9 component', 9);
const high = (i) => totalHigh.cell(i + 1);
const low = (i) => totalLow.cell(i + 1);

// Nine pills carry the nine cage totals between them, so which pill labels
// which cage is a one-to-one matching that the drawing does not show. VL(i)
// holds the index of the cage whose total pill i spells; the pills are
// distinguishable and the cages are distinct, so an AllDifferent over the
// nine selectors is what makes the matching one-to-one.
const label = new Var('L', 'cage whose total this cage\'s pill spells', 9);

const cagePairs = cages.flatMap(
  (_, i) => cages.slice(i + 1).map((_, k) => [i, i + 1 + k]));

return [
  new Shape('9x9'),
  totalHigh,
  totalLow,
  label,

  new Given('R8C8', 6),

  // Killer cages: a total of 0 means the cage has no printed total, leaving
  // just the no-repeats rule.
  ...cages.map((cage) => new Cage(0, ...cage.cells)),

  // Each cage's total, recorded in the two Var layers.
  ...cages.map((cage, i) =>
    new Sum(-7, ...cage.cells, [high(i), -9], [low(i), -1])),

  // No two killer cages have the same sum: differ in at least one component.
  ...cagePairs.map(([i, j]) => new Or([
    new AllDifferent(high(i), high(j)),
    new AllDifferent(low(i), low(j)),
  ])),

  // Each cage's total is spelled by exactly one pill, and never by its own.
  new AllDifferent(...label.cells()),

  // The pill in cage i spells the total of cage VL(i): 10*tens + ones equals
  // that cage's cell total. The candidate list omits i itself, which is the
  // "a different killer cage" clause.
  ...cages.map((cage, i) => new Or(
    cages.flatMap((other, j) => j === i ? [] : [new And([
      new Sum(0, ...other.cells, [cage.pill[0], -10], [cage.pill[1], -1]),
      new Given(label.cell(i + 1), j + 1),
    ])]))),
];
