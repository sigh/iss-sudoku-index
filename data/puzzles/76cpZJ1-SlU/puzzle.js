// Title: Oil, Water, Kropki
// Author: Blobz
// Video: https://www.youtube.com/watch?v=76cpZJ1-SlU
// Source: https://sudokupad.app/blobz/oil-water-kropki

// Normal sudoku rules apply; regions are the default 3x3 boxes.
//
// Oil/water cages: "oil" = even digit, "water" = odd digit. Within a cage, all
// cells in the same grid row must be one type; across grid rows, oil floats on
// water, so no cell in an earlier (higher) row may be odd while a cell in a
// later (lower) row of the same cage is even. Cages with a printed total also
// require the distinct-digit sum; cages without one still require the digits
// to be distinct ("Digits in cages do not repeat ... if given" implies the
// no-repeat clause applies regardless of whether a total is shown).
//
// Black dots: Kropki 2:1 ratio, drawn edges only -- "Not all such dots are
// shown" means an undrawn edge carries no constraint (no StrictKropki).

// Cage cell lists, transcribed from the drawn cage geometry.
// `sum: null` marks a real cage with no printed total.
const cages = [
  { sum: 13, cells: ['R1C1', 'R1C2', 'R2C1'] },
  { sum: null, cells: ['R1C4', 'R1C5', 'R1C6', 'R2C5'] },
  { sum: null, cells: ['R1C8', 'R1C9', 'R2C9'] },
  { sum: 12, cells: ['R2C8', 'R3C8', 'R4C8'] },
  { sum: null, cells: ['R3C7', 'R4C6', 'R4C7', 'R5C6'] },
  { sum: null, cells: ['R3C3', 'R4C3', 'R4C4', 'R5C4'] },
  { sum: null, cells: ['R4C1', 'R5C1', 'R6C1'] },
  { sum: null, cells: ['R7C2', 'R7C3', 'R8C3', 'R8C4'] },
  { sum: 20, cells: ['R7C7', 'R7C8', 'R8C6', 'R8C7'] },
  { sum: null, cells: ['R6C5', 'R7C5'] },
  { sum: 10, cells: ['R9C5', 'R9C6'] },
  { sum: null, cells: ['R4C9', 'R5C9', 'R6C9'] },
];

// Black dot edges, transcribed from the drawn overlay marks (each an
// adjacent-cell edge between the two cells listed).
const blackDotEdges = [
  ['R5C1', 'R5C2'],
  ['R1C3', 'R1C4'],
  ['R1C5', 'R2C5'],
  ['R3C7', 'R4C7'],
  ['R4C3', 'R4C4'],
  ['R6C5', 'R7C5'],
  ['R6C6', 'R6C7'],
  ['R7C7', 'R7C8'],
  ['R7C9', 'R8C9'],
  ['R8C3', 'R8C4'],
];

const cageConstraints = cages.flatMap(({ sum, cells }) =>
  sum === null ? [new AllDifferent(...cells)] : [new Cage(sum, ...cells)]);

// Two relation keys, shared across every cage so the oil/water rule stays one
// named Pair group per relation kind instead of one per cage:
// - sameRowKey: two cells in the same grid row must share parity (the
//   cage's row is "of just one type").
// - rowOrderKey: for two cells in different grid rows (first arg the
//   earlier/higher row, second the later/lower row), forbid odd-then-even
//   (water above oil), which is exactly "oil floats on water".
const sameRowKey = Pair.fnToKey((a, b) => (a % 2) === (b % 2), 9);
const rowOrderKey = Pair.fnToKey((a, b) => !(a % 2 === 1 && b % 2 === 0), 9);

// Derive same-row and cross-row cell pairs from each cage's own cell list
// (grouped by grid row via parseCellId) rather than hand-enumerating pairs.
function oilWaterPairs(cells) {
  const byRow = new Map();
  for (const cell of cells) {
    const { row } = parseCellId(cell);
    if (!byRow.has(row)) byRow.set(row, []);
    byRow.get(row).push(cell);
  }
  const rows = [...byRow.keys()].sort((a, b) => a - b);

  const pairs = [];
  for (const row of rows) {
    const rowCells = byRow.get(row);
    for (let i = 0; i < rowCells.length; i++) {
      for (let j = i + 1; j < rowCells.length; j++) {
        pairs.push(new Pair(sameRowKey, '', rowCells[i], rowCells[j]));
      }
    }
  }
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      for (const upper of byRow.get(rows[i])) {
        for (const lower of byRow.get(rows[j])) {
          pairs.push(new Pair(rowOrderKey, '', upper, lower));
        }
      }
    }
  }
  return pairs;
}

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...cages.flatMap(({ cells }) => oilWaterPairs(cells)),
  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),
];
