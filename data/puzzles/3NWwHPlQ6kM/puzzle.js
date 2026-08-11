// Title: Your ways are numbered
// Author: Chilly
// Video: https://www.youtube.com/watch?v=3NWwHPlQ6kM
// Source: https://app.crackingthecryptic.com/sudoku/Nd33PPmjB7

// Normal sudoku rules apply (standard 3x3 boxes; default row/column/box
// all-different).
//
// "Digits cannot repeat in the same position in different 3x3 boxes" is
// exactly ISS's DisjointSets rule.
//
// "Digits in cells marked in red in columns 1, 5 and 9 indicate the position
// of the 1, 5 and 9 respectively in the corresponding row" is ISS's Column
// Indexing: a control cell (R, C) with value V forces cell (R, V) = C. Since
// the marked cells sit in columns 1, 5 and 9, C is always 1, 5 or 9, matching
// the rule's "1, 5 and 9 respectively" by construction -- no separate mapping
// is encoded.
//
// "All possible red cells are given" is an exhaustively-marked clue: every
// cell in columns 1, 5, 9 where this indexing relationship could be drawn
// but isn't must NOT satisfy it. For each such unmarked control cell (R, C):
// its value cannot be C itself (that would trivially satisfy the relationship
// via cell(R,C)=C), and for every other column i its value cannot be i while
// cell(R,i) holds C. The first is a plain Given restriction; the second is one
// negated-predicate Pair per (control, other-row-cell) pair, generated from
// the same drawn column/row data as the positive case above (not
// hand-enumerated).
//
// "All cages must contain digits which sum to the same total, which must be
// determined by the solver" is EqualSum over every drawn cage (no printed
// total on any of them). Every cage's cells lie entirely inside one row,
// column or box already, so the normal sudoku all-different groups make each
// cage's digits distinct without a separate AllDifferent/Cage constraint.

const N = 9;
const allValues = Array.from({ length: N }, (_, k) => k + 1);

const indexColumns = [
  // col: the indexed digit (and column); markedRows: rows with a drawn red
  // cell in that column.
  { col: 1, markedRows: [1, 4, 5, 8] },
  { col: 5, markedRows: [1, 4, 5] },
  { col: 9, markedRows: [4, 5, 9] },
];

const redCells = indexColumns.flatMap(
  ({ col, markedRows }) => markedRows.map(row => makeCellId(row, col)));

const antiIndexKeys = new Map();
const antiIndexKey = (i, col) => {
  const cacheKey = `${i}_${col}`;
  if (!antiIndexKeys.has(cacheKey)) {
    antiIndexKeys.set(
      cacheKey, Pair.fnToKey((a, b) => !(a === i && b === col), N));
  }
  return antiIndexKeys.get(cacheKey);
};

const antiIndexConstraints = indexColumns.flatMap(({ col, markedRows }) =>
  allValues
    .filter(row => !markedRows.includes(row))
    .flatMap(row => {
      const control = makeCellId(row, col);
      const selfExclusion = new Given(control, ...allValues.filter(v => v !== col));
      const otherColumnPairs = allValues
        .filter(i => i !== col)
        .map(i => new Pair(
          antiIndexKey(i, col), 'not-index', control, makeCellId(row, i)));
      return [selfExclusion, ...otherColumnPairs];
    }));

const cages = [
  // the drawn cages (12 total; none carries a printed total)
  ['R1C9', 'R1C8'],
  ['R2C9', 'R2C8', 'R2C7'],
  ['R2C1', 'R3C1'],
  ['R2C4', 'R3C4'],
  ['R5C2', 'R5C1'],
  ['R4C4', 'R4C5', 'R5C5'],
  ['R5C4', 'R6C4'],
  ['R4C7', 'R5C7'],
  ['R4C8', 'R4C9', 'R5C9'],
  ['R8C7', 'R8C6'],
  ['R8C5', 'R9C5'],
  ['R8C4', 'R8C3'],
];

return [
  new Shape('9x9'),
  new Given('R5C7', 7),

  new DisjointSets(),

  new Indexing('C', ...redCells),
  ...antiIndexConstraints,

  new EqualSum(...cages),
];
