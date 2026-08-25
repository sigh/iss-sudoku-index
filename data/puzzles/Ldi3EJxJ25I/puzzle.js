// Title: Divisible Cage Totals #2
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=Ldi3EJxJ25I
// Source: https://app.crackingthecryptic.com/webapp/B8hF4G7dfG

// Normal sudoku: digits 1-9 once each in every row, column and 3x3 box.
//
// Cages: digits in a cage cannot repeat, and must sum to that cage's own
// total. No total is ever given -- AllDifferent alone leaves the total free,
// which is exactly what "the solver must determine what the cage totals
// are" asks for.
//
// Divisible totals: each cage's total must be divisible by the digits at the
// first and last cell of the row, and of the column, containing that cage's
// blue (total) cell -- see cageTotalDivisibility below for how that is
// checked without ever materializing the total itself.

// Cage cells (source order) and each cage's blue/total cell -- the blue
// marker always lands on the cage's own first-listed cell.
const cages = [
  { cells: ['R1C2', 'R1C3', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R1C6'], blue: 'R1C2' },
  { cells: ['R1C4', 'R1C5'], blue: 'R1C4' },
  { cells: ['R3C1', 'R3C2', 'R3C3', 'R3C4'], blue: 'R3C1' },
  { cells: ['R1C7', 'R1C8', 'R1C9'], blue: 'R1C7' },
  { cells: ['R2C9', 'R2C8', 'R2C7', 'R3C7', 'R3C8'], blue: 'R2C7' },
  { cells: ['R5C8', 'R6C8', 'R6C7', 'R7C7', 'R7C8'], blue: 'R5C8' },
  { cells: ['R4C2', 'R4C3', 'R5C3'], blue: 'R4C2' },
  { cells: ['R4C4', 'R5C4', 'R6C4', 'R5C6', 'R6C6', 'R6C5', 'R4C6', 'R4C5'], blue: 'R4C4' },
  { cells: ['R5C5'], blue: 'R5C5' },
  { cells: ['R7C4', 'R7C5', 'R7C6', 'R8C6', 'R9C6', 'R9C5', 'R9C4'], blue: 'R7C4' },
  { cells: ['R8C5', 'R8C4', 'R8C3'], blue: 'R8C3' },
];

const cageAllDifferent = cages
  .filter(({ cells }) => cells.length > 1)
  .map(({ cells }) => new AllDifferent(...cells));

// The four cells whose digits must divide a cage's total: the first and last
// cell of the blue cell's own row, and of its own column. These can coincide
// with the blue cell itself (when the cage sits against the grid's edge) or
// with each other; de-duplicate so no divisor is checked twice.
function divisorCells(blueCell) {
  const { row, col } = parseCellId(blueCell);
  const ids = [
    makeCellId(row, 1), makeCellId(row, 9),
    makeCellId(1, col), makeCellId(9, col),
  ];
  return [...new Set(ids)];
}

// A cage's total is never materialized as a value anywhere (it would need up
// to 44, past the 16-value cap on a cell's alphabet). For a single-cell cage
// the total is just that cell's own digit, so each divisor check is a plain
// 2-cell relation. `Pair.fnToKey` needs one shared truth table, built once.
const singleCellDivides = Pair.fnToKey((total, divisor) => total % divisor === 0, 9);

// For a multi-cell cage, one NFA per (cage, divisor) reads the cage's own
// cells followed by the divisor cell and accepts iff their sum divides
// evenly. State is {i, sum} while still inside the cage (i counts cells
// read, sum accumulates their digits, both bounded by the cage's own size
// and 9x its size respectively), then {sum, divisor} once the final
// (divisor) cell is read, so `accept` can test `sum % divisor === 0`
// directly. The divisor cell may be one of the cage's own cells; it is then
// simply read again as the final symbol.
const cageTotalSpecBySize = new Map();
function cageTotalSpec(cageSize) {
  if (!cageTotalSpecBySize.has(cageSize)) {
    cageTotalSpecBySize.set(cageSize, NFA.encodeSpec({
      startState: { i: 0, sum: 0 },
      transition: ({ i, sum }, value) => (
        i < cageSize
          ? { i: i + 1, sum: sum + value }
          : { i: i + 1, sum, divisor: value }
      ),
      accept: ({ sum, divisor }) => divisor !== undefined && sum % divisor === 0,
      maxDepth: cageSize + 1,
    }, 9));
  }
  return cageTotalSpecBySize.get(cageSize);
}

const cageTotalDivisibility = cages.flatMap(({ cells, blue }) => {
  if (cells.length === 1) {
    return divisorCells(blue).map(divisor =>
      new Pair(singleCellDivides, 'cage total divisibility', cells[0], divisor));
  }
  const spec = cageTotalSpec(cells.length);
  return divisorCells(blue).map(divisor =>
    new NFA(spec, 'cage total divisibility', ...cells, divisor));
});

return [
  new Shape('9x9'),
  ...cageAllDifferent,
  ...cageTotalDivisibility,
];
