// Title: Sums and Products
// Author: PixelPlucker
// Video: https://www.youtube.com/watch?v=jogCM8Im9C8
// Source: https://app.crackingthecryptic.com/sudoku/p6Gq7dJBJ7
//
// Normal sudoku (default 3x3 boxes, no givens). Every cage forbids repeated
// digits. A cage with a known total (a number, or a ">"-prefixed lower bound)
// must reach it by adding its cells, except that any two cells joined by a
// drawn "x" mark are multiplied together first and that product is added in
// place of the pair. A cage with no drawn total at all is all-different only.
//
// Cage table transcribed from the puzzle's drawn cages (cell membership,
// totals) and the "x" marks drawn on some adjacent cage-cell pairs. `op`
// marks a ">"-range total; omitted `total` marks a cage with no drawn total.
const cages = [
  { cells: ['R1C1', 'R1C2', 'R2C1'], pairs: [['R1C1', 'R1C2']], total: 20 },
  { cells: ['R2C3', 'R3C2', 'R3C3'], pairs: [['R3C2', 'R3C3']], total: 20 },
  { cells: ['R1C3', 'R1C4', 'R2C4'], pairs: [['R1C3', 'R1C4']], total: 15 },
  { cells: ['R1C8', 'R1C9', 'R2C9'], pairs: [['R1C8', 'R1C9']], total: 11 },
  { cells: ['R3C9', 'R4C9', 'R5C9'], pairs: [], total: 15 },
  {
    cells: ['R4C1', 'R4C2', 'R5C1', 'R5C2'],
    pairs: [['R4C1', 'R5C1'], ['R4C2', 'R5C2']],
    total: 37,
  },
  {
    cells: ['R7C1', 'R7C2', 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
    pairs: [['R7C1', 'R8C1'], ['R8C2', 'R9C2']],
    total: 49,
  },
  { cells: ['R8C3', 'R8C4', 'R9C3', 'R9C4'], pairs: [] }, // no drawn total ("?")
  {
    cells: ['R8C5', 'R8C6', 'R8C7', 'R9C5'],
    pairs: [['R8C5', 'R8C6']],
    total: 20,
    op: '>',
  },
  { cells: ['R8C9', 'R9C8', 'R9C9'], pairs: [['R8C9', 'R9C9']], total: 43 },
  {
    cells: ['R5C7', 'R6C7', 'R7C7', 'R7C8', 'R7C9'],
    pairs: [['R5C7', 'R6C7'], ['R7C8', 'R7C9']],
    total: 38,
  },
  { cells: ['R4C8', 'R5C8', 'R6C8'], pairs: [['R4C8', 'R5C8']], total: 25 },
  { cells: ['R5C5', 'R5C6', 'R6C5', 'R6C6'], pairs: [], total: 19 },
  { cells: ['R7C4', 'R7C5', 'R7C6'], pairs: [], total: 17 },
  {
    cells: ['R3C4', 'R4C4', 'R4C5', 'R4C6', 'R4C7'],
    pairs: [['R4C5', 'R4C6']],
    total: 56,
  },
  { cells: ['R3C5', 'R3C6', 'R3C7', 'R3C8'], pairs: [['R3C7', 'R3C8']], total: 58 },
];

// Group a cage's cells into arithmetic terms: each x-pair is one two-cell
// term (multiplied); every other cell is its own one-cell term (added).
function cageTerms(cage) {
  const paired = new Set(cage.pairs.flat());
  const singles = cage.cells.filter(c => !paired.has(c));
  return [...cage.pairs, ...singles.map(c => [c])];
}

// One NFA per cage with a known total: it scans the cage's terms in order,
// carrying {i: term index, sum: running total, pending: first value of a
// two-cell term not yet multiplied in}. A one-cell term adds straight to
// `sum`; a two-cell term holds its first value in `pending` and multiplies
// it into `sum` on the second. Accept once every term is consumed and `sum`
// meets the cage's total (exact match, or the ">" bound for a range cage).
function cageArithmetic(cage) {
  if (cage.total === undefined) return null;
  const terms = cageTerms(cage);
  const meetsTotal = cage.op === '>'
    ? sum => sum > cage.total
    : sum => sum === cage.total;
  const spec = NFA.encodeSpec({
    startState: { i: 0, sum: 0, pending: null },
    transition: (state, value) => {
      // Compile-time exploration probes every state with every value,
      // including past the last term; reject rather than index past the
      // end of `terms`.
      if (state.i >= terms.length) return undefined;
      if (state.pending !== null) {
        return { i: state.i + 1, sum: state.sum + state.pending * value, pending: null };
      }
      const term = terms[state.i];
      if (term.length === 1) {
        return { i: state.i + 1, sum: state.sum + value, pending: null };
      }
      return { i: state.i, sum: state.sum, pending: value };
    },
    accept: state => state.i === terms.length && meetsTotal(state.sum),
  }, 9);
  const label = `cage total (${cage.op || '='}${cage.total})`;
  return new NFA(spec, label, ...terms.flat());
}

const cageAllDifferents = cages.map(cage => new AllDifferent(...cage.cells));
const cageArithmetics = cages.map(cageArithmetic).filter(c => c !== null);

return [
  new Shape('9x9'),
  ...cageAllDifferents,
  ...cageArithmetics,
];
