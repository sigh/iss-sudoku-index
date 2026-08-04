// Title: Double Filtration
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=yL9-Rny_reY
// Source: https://app.crackingthecryptic.com/sudoku/H87DjDq3H9

// Normal sudoku rules apply. Nine cells (one per row, column, and box) are
// "doublers": their value is double their digit; every other cell's value
// equals its digit. Each digit 1-9 appears in exactly one doubler. A cage's
// VALUES (not digits) sum to its total; digits (not values) may not repeat
// in a cage. In row N, the pill's two cells, read left to right, give the
// row and column of the doubler holding digit N.

const graph = cellGraph('9x9');
const cells = graph.cells();

// Doubler flag per grid cell: 1 = normal, 2 = doubler. `value = digit * flag`.
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
const interleave = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);

// One row per row of the board holds one doubler's digit (VRD) and column
// (VRC); these let the pill rule look a digit's doubler up without scanning
// the whole 81-cell grid. Anchored 1:1 against column 1 purely as an index.
const anchors = graph.column(1);
const rowDigit = graph.makeOverlay('VRD', anchors);
const rowCol = graph.makeOverlay('VRC', anchors);

// --- Doubler placement: one flag=2 among nine flag=1 cells sums to 10. ---
const placementSums = graph.rowsColumnsBoxes().map(group =>
  new Sum(10, ...flags.at(group)));

// --- Per-row lookup of the row's doubler digit and column. ---

// Scans a row's interleaved (digit, flag) pairs, capturing the digit where
// flag == 2, then checks it against the row's VRD cell appended at the end.
// `count` (0-9) marks when the 9 pairs are done so the final symbol is read
// as the check value rather than another cell's digit.
const rowDoublerDigitSpec = NFA.encodeSpec({
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

const rowDoublerDigitLinks = Array.from({ length: 9 }, (_, i) => {
  const r = i + 1;
  return new NFA(rowDoublerDigitSpec, `row-${r}-doubler-digit`,
    ...interleave(graph.row(r)), rowDigit.at(anchors[i]));
});

// sum(col * flag) over a row's 9 cells = 45 + (column of the flag=2 cell),
// since the eight flag=1 cells contribute their column once each (summing to
// 45) and the flag=2 cell contributes its column twice.
const rowColSums = Array.from({ length: 9 }, (_, i) => {
  const r = i + 1;
  const flagCells = flags.at(graph.row(r));
  const terms = flagCells.map((c, ci) => [c, ci + 1]);
  return new Sum(45, ...terms, [rowCol.at(anchors[i]), -1]);
});

// Each digit appears in exactly one doubler: the nine rows' doubler digits
// (one doubler per row, from placementSums) are a permutation of 1-9.
const doublerDigitsDistinct = new AllDifferent(...rowDigit.cells());

// --- Pill rule: row N's pill gives the row/column of digit N's doubler. ---

// Scans the 9 (VRD, VRC) row-doubler pairs, in row order (`count`, 0-9, so
// `count + 1` is that row's own number), remembering the (row, column) of
// whichever row's doubler digit equals N -- `foundRow` 0 means "not yet
// found", since real rows are 1-9. Every digit has exactly one doubler, so a
// still-0 foundRow after all 9 rows is a dead branch, cut immediately rather
// than carried on. The pill's two interleaved (digit, flag) cells are then
// checked against foundRow/foundCol one at a time (not carried together) to
// keep the compiled state small.
const pillLinkSpec = digitN => NFA.encodeSpec({
  startState: { phase: 'rd', count: 0, foundRow: 0, foundCol: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 'rd':
        return {
          phase: 'rc', count: state.count, foundRow: state.foundRow, foundCol: state.foundCol,
          isMatch: value === digitN,
        };
      case 'rc': {
        const count = state.count + 1;
        const foundRow = state.isMatch ? state.count + 1 : state.foundRow;
        const foundCol = state.isMatch ? value : state.foundCol;
        if (count === 9) {
          if (foundRow === 0) return undefined; // dead branch: N always has a doubler
          return { phase: 'pillDigit1', foundRow, foundCol };
        }
        return { phase: 'rd', count, foundRow, foundCol };
      }
      case 'pillDigit1':
        return { phase: 'pillFlag1', foundRow: state.foundRow, foundCol: state.foundCol, digit: value };
      case 'pillFlag1': {
        if (value !== 1 && value !== 2) return undefined;
        return state.digit * value === state.foundRow
          ? { phase: 'pillDigit2', foundCol: state.foundCol } : undefined;
      }
      case 'pillDigit2':
        return { phase: 'pillFlag2', foundCol: state.foundCol, digit: value };
      case 'pillFlag2': {
        if (value !== 1 && value !== 2) return undefined;
        return state.digit * value === state.foundCol ? { phase: 'done' } : undefined;
      }
      default:
        return { phase: 'done' };
    }
  },
  accept: state => state.phase === 'done',
}, 9);

// Pills, provenance: the 9 edge-centred rounded-rect underlays, one per row;
// row 5's sits at C1-C2, every other row's at C2-C3.
const pillCells = {
  1: ['R1C2', 'R1C3'], 2: ['R2C2', 'R2C3'], 3: ['R3C2', 'R3C3'],
  4: ['R4C2', 'R4C3'], 5: ['R5C1', 'R5C2'], 6: ['R6C2', 'R6C3'],
  7: ['R7C2', 'R7C3'], 8: ['R8C2', 'R8C3'], 9: ['R9C2', 'R9C3'],
};
const rowDoublerFlat = anchors.flatMap((a, i) => [rowDigit.at(a), rowCol.at(a)]);
const pillLinks = Array.from({ length: 9 }, (_, i) => {
  const n = i + 1;
  return new NFA(pillLinkSpec(n), `pill-row-${n}-digit-${n}`,
    ...rowDoublerFlat, ...interleave(pillCells[n]));
});

// Cages, provenance: the 5 numbered entries of the drawn `cages` array.
const cages = [
  { cells: ['R3C7', 'R3C8', 'R3C9'], total: 20 },
  { cells: ['R2C4', 'R3C4'], total: 17 },
  { cells: ['R4C4', 'R4C5', 'R4C6', 'R5C5'], total: 20 },
  { cells: ['R8C5', 'R9C5'], total: 7 },
  { cells: ['R7C6', 'R7C7', 'R7C8', 'R8C7'], total: 16 },
];

// Scans a cage's interleaved (digit, flag) pairs, summing effective values
// and rejecting a partial sum above the drawn total.
const cageValueSumSpec = target => NFA.encodeSpec({
  startState: { phase: 'digit', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value, sum: state.sum };
    if (value !== 1 && value !== 2) return undefined;
    const sum = state.sum + state.digit * value;
    return sum <= target ? { phase: 'digit', sum } : undefined;
  },
  accept: state => state.phase === 'digit' && state.sum === target,
}, 9);

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(cells[0]), 1, 2), flags.at(cells)),
  rowDigit.toVar('row doubler digit'),
  rowCol.toVar('row doubler column'),
  ...placementSums,
  ...rowDoublerDigitLinks,
  ...rowColSums,
  doublerDigitsDistinct,
  ...pillLinks,
  ...cages.flatMap(({ cells: cageCells, total }) => [
    new AllDifferent(...cageCells),
    new NFA(cageValueSumSpec(total), `cage-sum-${total}`, ...interleave(cageCells)),
  ]),
];
