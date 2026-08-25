// Title: Divisible Cage Totals
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=DY-dJPaAfLI
// Source: https://app.crackingthecryptic.com/webapp/6rJrG3JhLq

// Normal sudoku rules apply (standard rows, columns, 3x3 boxes). Digits inside
// each cage do not repeat and sum to the total printed in the cage's
// upper-left cell. Three cages print no total; the solver determines it, and
// that derived total also lives in the cage's upper-left cell. Every cage
// total, printed or derived, must be divisible by the digit in the first
// (column 1) and last (column 9) cell of the row holding that cage's
// upper-left cell, and by the digit in the first (row 1) and last (row 9)
// cell of that column -- "the row and column that contain that cage total" is
// the row/column of the upper-left cell, since that is where every total is
// written. Where that corner cell itself sits in column 1/9 or row 1/9, the
// matching endpoint is the corner cell itself.

// Cages transcribed from the payload's `cages` array; `total: null` marks the
// three cages with no printed total.
const CAGES = [
  { cells: ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'], total: null },
  { cells: ['R3C2', 'R3C3', 'R3C4', 'R3C5'], total: null },
  { cells: ['R2C6', 'R3C6', 'R3C7'], total: 7 },
  { cells: ['R4C2', 'R5C2', 'R4C3'], total: 12 },
  { cells: ['R4C4', 'R4C5', 'R5C4', 'R6C4', 'R6C5'], total: 30 },
  { cells: ['R5C5', 'R5C6', 'R5C7', 'R6C7'], total: 10 },
  { cells: ['R4C8', 'R5C8', 'R5C9'], total: null },
  { cells: ['R6C2', 'R6C3', 'R7C3', 'R8C3'], total: 20 },
  { cells: ['R9C4', 'R8C4', 'R7C4', 'R7C5', 'R7C6', 'R8C6', 'R8C7', 'R8C8'], total: 42 },
];

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// The cage's upper-left cell: minimum row, then (among that row's cells)
// minimum column. This reading-order corner is not always the payload's
// first-listed cell (e.g. the 30-total cage lists R4C5 first, but R4C4 is
// the true corner).
function topLeftOf(cellIds) {
  const parsed = cellIds.map(id => ({ id, ...parseCellId(id) }));
  const minRow = Math.min(...parsed.map(c => c.row));
  const inRow = parsed.filter(c => c.row === minRow);
  const minCol = Math.min(...inRow.map(c => c.col));
  return inRow.find(c => c.col === minCol).id;
}

// The row's first/last cell and the column's first/last cell for the row and
// column through `cornerId`, deduplicated -- a corner already on an edge row
// or column reuses itself as one or two of these.
function divisorCellsFor(cornerId) {
  const { row, col } = parseCellId(cornerId);
  return [...new Set([
    makeCellId(row, 1), makeCellId(row, 9),
    makeCellId(1, col), makeCellId(9, col),
  ])];
}

// For an undetermined cage total: reads the cage's n cells (accumulating
// their sum, order-independent), then one divisor cell, and accepts iff the
// accumulated sum is divisible by the divisor's value. Cached per cage size
// since several divisor cells reuse the same first-n-reads shape.
const cageDivisibleSpecs = new Map();
function cageDivisibleSpec(n) {
  if (!cageDivisibleSpecs.has(n)) {
    cageDivisibleSpecs.set(n, NFA.encodeSpec({
      startState: { sum: 0, i: 0 },
      transition: (s, value) => {
        if (s.i < n) return { sum: s.sum + value, i: s.i + 1 };
        if (s.i === n) return { i: s.i + 1, ok: s.sum % value === 0 };
        return undefined;  // exactly n+1 reads are ever fed; reject any more
      },
      accept: s => s.i === n + 1 && s.ok === true,
    }, 9));
  }
  return cageDivisibleSpecs.get(n);
}

const cageConstraints = CAGES.flatMap(cage => {
  const corner = topLeftOf(cage.cells);
  const divisorCells = divisorCellsFor(corner);

  if (cage.total !== null) {
    // Total is a known constant: "T mod D === 0" reduces to restricting D's
    // own candidates to the divisors of that constant.
    const validDivisors = range(1, 9).filter(d => cage.total % d === 0);
    return [
      new Cage(cage.total, ...cage.cells),
      ...divisorCells.map(cell => new Given(cell, ...validDivisors)),
    ];
  }

  // Total is undetermined: no-repeat cage, plus one divisibility NFA per
  // divisor cell over [cage cells..., divisor cell].
  const spec = cageDivisibleSpec(cage.cells.length);
  return [
    new AllDifferent(...cage.cells),
    ...divisorCells.map(cell =>
      new NFA(spec, 'cage-total-divisor', ...cage.cells, cell)),
  ];
});

return [
  new Shape('9x9'),
  ...cageConstraints,
];
