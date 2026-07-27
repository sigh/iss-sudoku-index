// Title: Rainbow Kropki 2
// Author: LJC
// Video: https://www.youtube.com/watch?v=UGTLE4_445I
// Source: https://sudokupad.app/fgh2j8zmrx
//
// Normal sudoku (row/col/box all-different, 1-9) is the ISS default.
//
// Cages: distinct digits summing to the printed total (Cage). The ">10" and
// "even" cages carry no printed total ("...sum to the given
// total/parity/inequality") so their two cells get a custom Pair relation
// instead, combining distinctness with the inequality/parity in one binary
// predicate.
//
// No three contiguous cells in a row/column may be all even or all odd: an
// NFA per row and per column tracks the parity and run-length (capped at 2)
// of the current same-parity streak; a third same-parity cell in a row
// rejects that branch.
//
// Coloured/lettered dots ("digits separated by a coloured dot must have a
// difference indicated by the colour; same colour = same difference,
// different colours = different differences"): one Var per letter (a-h)
// holds that colour's unknown difference. 8 distinct colours are drawn (see
// the dot table below), and since digit differences on a 1-9 grid only
// range 1-8, the rule's 8-way pairwise distinctness over that same 8-value
// range forces the 8 Vars to be a permutation of 1-8 -- so a plain
// Given(1..8) domain plus AllDifferent captures it without widening Shape.
// Each dot's two grid cells are tied to its letter's Var by an Or of the two
// EqualSum readings of |a-b|=d (a=b+d, or b=a+d).

const CAGES = [
  // Cage geometry, 6 real cages (cells and their printed totals).
  { cells: ['R1C1', 'R1C2', 'R1C3'], total: 20 },
  { cells: ['R1C8', 'R1C9', 'R2C8', 'R2C9'], total: 10 },
  { cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'], total: 28 },
  { cells: ['R9C7', 'R9C8', 'R9C9'], total: 10 },
];
const cages = CAGES.map(c => new Cage(c.total, ...c.cells));

// Sum > 10, distinct: this cage has no printed total, only ">10".
const greaterThan10Cage = new Pair(
  Pair.fnToKey((a, b) => a !== b && (a + b) > 10, 9),
  '>10 cage', 'R3C8', 'R4C8');
// Sum even, distinct: this cage has no printed total, only "even".
const evenSumCage = new Pair(
  Pair.fnToKey((a, b) => a !== b && (a + b) % 2 === 0, 9),
  'even cage', 'R5C3', 'R6C3');

// Dot edges grouped by letter (each letter is one fixed colour).
const DOT_GROUPS = {
  a: [['R1C2', 'R1C3'], ['R5C6', 'R6C6']],
  b: [['R6C5', 'R6C6']],
  c: [['R6C4', 'R6C5'], ['R8C2', 'R9C2'], ['R2C6', 'R2C7']],
  d: [['R5C4', 'R6C4'], ['R8C3', 'R8C4'], ['R8C1', 'R9C1']],
  e: [['R4C4', 'R5C4'], ['R9C7', 'R9C8'], ['R1C9', 'R2C9']],
  f: [['R1C8', 'R2C8'], ['R4C4', 'R4C5']],
  g: [['R4C5', 'R4C6']],
  h: [['R4C6', 'R5C6']],
};
const LETTERS = Object.keys(DOT_GROUPS);

const diffVars = new Var('D', 'letter differences', LETTERS.length);
const diffCell = letter => diffVars.cell(LETTERS.indexOf(letter) + 1);

const diffDomains = LETTERS.map(
  l => new Given(diffCell(l), 1, 2, 3, 4, 5, 6, 7, 8));
const diffsAllDifferent = new AllDifferent(...LETTERS.map(diffCell));

function diffEquals(a, b, dCell) {
  // |a - b| = d, as a disjunction of the two equal-sum readings.
  return new Or([
    new EqualSum([a], [b, dCell]),
    new EqualSum([b], [a, dCell]),
  ]);
}
const dotConstraints = LETTERS.flatMap(
  l => DOT_GROUPS[l].map(([a, b]) => diffEquals(a, b, diffCell(l))));

// State = last-cell-parity*10 + same-parity run length (1 or 2); -1 is the
// "no cells scanned yet" start. A run reaching 3 rejects the branch.
const noTripleParitySpec = NFA.encodeSpec({
  startState: -1,
  transition: (state, v) => {
    const parity = v % 2;
    if (state === -1) return parity * 10 + 1;
    const prevParity = Math.floor(state / 10);
    const run = state % 10;
    if (parity === prevParity) {
      const newRun = run + 1;
      return newRun >= 3 ? undefined : parity * 10 + newRun;
    }
    return parity * 10 + 1;
  },
  accept: () => true,
}, 9);

const graph = cellGraph('9x9');
const noTripleParity = [
  ...graph.rows().map(
    (cells, i) => new NFA(noTripleParitySpec, `row ${i + 1} parity`, ...cells)),
  ...graph.columns().map(
    (cells, i) => new NFA(noTripleParitySpec, `col ${i + 1} parity`, ...cells)),
];

return [
  new Shape('9x9'),
  ...cages,
  greaterThan10Cage,
  evenSumCage,
  diffVars,
  ...diffDomains,
  diffsAllDifferent,
  ...dotConstraints,
  ...noTripleParity,
];
