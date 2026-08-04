// Title: A E.
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=FiWWRYRKG4Y
// Source: https://app.crackingthecryptic.com/sudoku/mq9fhhbHFq

// Normal sudoku rules apply. One cell in each row, column, and box is a
// "negator" (9 negator cells total); their nine digits are all different, so
// each digit 1-9 is negated exactly once. A cage's or diagonal's printed
// total is the signed sum of its cells' digits: a negator cell subtracts its
// digit, every other cell adds it. Cage digits (not signed values) may not
// repeat; diagonal digits may repeat. Which cells are negators is
// solver-deduced state, not drawn.
//
// Negator flag per cell (Var overlay 'VN'): 1 = normal, 2 = negator. Mirrors
// the doubler-flag construction used for value-modifier puzzles in this
// corpus (e.g. a doubler flag valued 1/2, effective value = digit * flag),
// widened here to a sign flip instead of a multiplier.

const graph = cellGraph('9x9');
const cells = graph.cells();
const flags = graph.makeOverlay('VN');
const flag = cell => flags.at(cell);
const flagDomain = flags.makeReplicate(new Given(flag(cells[0]), 1, 2));

// Interleaves a clue's cells with their flag cells: [digit1, flag1, digit2,
// flag2, ...], the alphabet every NFA below reads.
const interleave = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);

// ---- Placement: exactly one flag=2 among the nine flag={1,2} cells of each
// row/column/box. Eight flag=1 cells plus one flag=2 cell sum to 10; any
// other count of flag=2 cells sums to something else (9, 8, ...).
const placementSums = graph.rowsColumnsBoxes().map(group =>
  new Sum(10, ...flags.at(group)));

// ---- Row-negator-digit selector: one aux cell per row (VRD, anchored 1:1
// against column 1) holding that row's negator's digit. Scans the row's
// interleaved (digit, flag) pairs, capturing the digit where flag == 2, then
// checks the capture against the appended VRD cell.
const anchors = graph.column(1);
const rowDigit = graph.makeOverlay('VRD', anchors);

const rowNegatorDigitSpec = NFA.encodeSpec({
  startState: { phase: 'digit', count: 0, captured: null },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', count: state.count, captured: state.captured, digit: value };
    }
    if (state.phase === 'flag') {
      if (value !== 1 && value !== 2) return undefined;
      const captured = value === 2 ? state.digit : state.captured;
      const count = state.count + 1;
      return { phase: count === 9 ? 'check' : 'digit', count, captured };
    }
    if (state.phase === 'check') {
      return state.captured === value ? { phase: 'done' } : undefined;
    }
    return { phase: 'done' };
  },
  accept: state => state.phase === 'done',
}, 9);

const rowNegatorDigitLinks = Array.from({ length: 9 }, (_, i) => {
  const r = i + 1;
  return new NFA(rowNegatorDigitSpec, `row-${r}-negator-digit`,
    ...interleave(graph.row(r)), rowDigit.at(anchors[i]));
});

// "The nine negator cells are also a set of the digits 1-9": one negator per
// row (from placementSums), and the nine row-negator digits are pairwise
// distinct.
const negatorDigitsDistinct = new AllDifferent(...rowDigit.cells());

// ---- Signed sum: scans a clue's interleaved (digit, flag) pairs, adding the
// digit when flag == 1 and subtracting it when flag == 2, and matches the
// printed total exactly once every cell has been read. Unlike a doubler's
// effective value (always >= digit), a negated term can make the running sum
// go up or down, so it cannot be pruned by "sum <= target" alone -- `length`
// bounds the compiled state graph instead (maxDepth = 2 symbols/cell).
const signedSumSpec = (target, length) => NFA.encodeSpec({
  startState: { phase: 'digit', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value, sum: state.sum };
    if (value !== 1 && value !== 2) return undefined;
    const sum = state.sum + (value === 2 ? -state.digit : state.digit);
    return { phase: 'digit', sum };
  },
  accept: state => state.phase === 'digit' && state.sum === target,
  maxDepth: length * 2,
}, 9);

// Cages, provenance: the drawn cage cell lists and printed totals. `distinct`
// is false for the two 2-cell cages that already share a column (redundant
// with the column all-different).
const cages = [
  { cells: ['R6C3', 'R7C3', 'R7C4'], total: 0, distinct: true },
  { cells: ['R3C3', 'R3C4', 'R4C3'], total: 0, distinct: true },
  { cells: ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6'], total: 0, distinct: true },
  { cells: ['R5C6', 'R5C7', 'R5C8'], total: 5, distinct: true },
  { cells: ['R6C2', 'R7C2'], total: 5, distinct: false },
  { cells: ['R3C2', 'R4C2'], total: 5, distinct: false },
];
const cageConstraints = cages.flatMap(({ cells: cageCells, total, distinct }, i) => [
  ...(distinct ? [new AllDifferent(...cageCells)] : []),
  new NFA(signedSumSpec(total, cageCells.length), `cage-${i}-sum-${total}`,
    ...interleave(cageCells)),
]);

// Diagonals, provenance: the four off-grid arrows paired with their nearest
// outside total badge, walked cell-by-cell to the grid edge. No distinctness
// rule (repeats are explicitly permitted along a diagonal).
const diagonals = [
  { cells: ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'], total: 40 },
  { cells: ['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'], total: 20 },
  { cells: ['R6C9', 'R7C8', 'R8C7', 'R9C6'], total: 20 },
  { cells: ['R7C9', 'R8C8', 'R9C7'], total: 10 },
];
const diagonalConstraints = diagonals.map(({ cells: diagCells, total }, i) =>
  new NFA(signedSumSpec(total, diagCells.length), `diagonal-${i}-sum-${total}`,
    ...interleave(diagCells)));

return [
  new Shape('9x9'),
  new Given('R5C9', 2),
  new Given('R7C5', 7),

  flags.toVar('negator flags'),
  flagDomain,
  rowDigit.toVar('row negator digit'),
  ...placementSums,
  ...rowNegatorDigitLinks,
  negatorDigitsDistinct,

  ...cageConstraints,
  ...diagonalConstraints,
];
