// Title: Phials
// Author: Groktilian
// Video: https://www.youtube.com/watch?v=ika9jUPtyRA
// Source: https://app.crackingthecryptic.com/sudoku/42bJJPR2q4

// Normal Sudoku applies. Grey thermometers increase bulb-to-tip; each blue
// diagonal is all-different. Cages with printed totals sum to those totals.
// In every cage, cells in one grid row share parity, and no odd row is above
// an even row (oil, the evens, floats on water, the odds).

// Cage cells transcribed from the drawn cage geometry; null means no total.
const cages = [
  { sum: null, cells: ['R1C1', 'R2C1', 'R3C1'] },
  { sum: null, cells: ['R1C2', 'R2C2', 'R3C2'] },
  { sum: null, cells: ['R1C7', 'R2C7', 'R3C7'] },
  { sum: null, cells: ['R1C8', 'R2C8', 'R3C8'] },
  { sum: null, cells: ['R1C9', 'R2C9', 'R3C9'] },
  { sum: null, cells: ['R7C8', 'R8C8', 'R9C8'] },
  { sum: null, cells: ['R7C9', 'R8C9', 'R9C9'] },
  { sum: null, cells: ['R4C4', 'R5C4', 'R6C4'] },
  { sum: null, cells: ['R4C5', 'R5C5', 'R6C5'] },
  { sum: null, cells: ['R4C6', 'R5C6', 'R6C6'] },
  { sum: null, cells: ['R7C1', 'R8C1', 'R9C1'] },
  { sum: null, cells: ['R5C1', 'R5C2', 'R6C1', 'R6C2'] },
  { sum: null, cells: ['R3C4', 'R3C5', 'R3C6'] },
  { sum: null, cells: ['R2C4', 'R2C5'] },
  { sum: null, cells: ['R5C9', 'R6C8', 'R6C9'] },
  { sum: null, cells: ['R4C8', 'R4C9', 'R5C7', 'R5C8', 'R6C7'] },
  { sum: null, cells: ['R7C2', 'R8C2', 'R9C2'] },
  { sum: null, cells: ['R9C4', 'R9C5', 'R9C6'] },
  { sum: null, cells: ['R7C4', 'R7C5', 'R7C6'] },
  { sum: null, cells: ['R8C5', 'R8C6'] },
  { sum: 18, cells: ['R7C7', 'R8C7', 'R9C7'] },
  { sum: 18, cells: ['R1C3', 'R2C3', 'R3C3'] },
  { sum: 9, cells: ['R8C3', 'R9C3'] },
];

// Grey paths are transcribed in bulb-to-tip order from lines[] and their
// matching circular underlays.
const thermos = [
  ['R1C1', 'R2C2', 'R3C3'], ['R6C1', 'R5C1', 'R4C1'],
  ['R1C4', 'R1C5', 'R1C6'], ['R4C9', 'R5C9', 'R6C9'],
  ['R9C5', 'R8C5', 'R7C5'], ['R6C3', 'R7C4'],
  ['R4C7', 'R3C6'], ['R7C3', 'R8C2', 'R9C1'],
  ['R3C7', 'R2C8', 'R1C9'], ['R9C9', 'R8C8', 'R7C7'],
  ['R3C4', 'R4C3'], ['R7C6', 'R6C7'],
];

const sameRowParity = Pair.fnToKey((a, b) => (a % 2) === (b % 2), 9);
const oilAboveWater = Pair.fnToKey((upper, lower) =>
  !(upper % 2 === 1 && lower % 2 === 0), 9);

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
        pairs.push(new Pair(sameRowParity, '', rowCells[i], rowCells[j]));
      }
    }
  }
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      for (const upper of byRow.get(rows[i])) {
        for (const lower of byRow.get(rows[j])) {
          pairs.push(new Pair(oilAboveWater, '', upper, lower));
        }
      }
    }
  }
  return pairs;
}

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...thermos.map(cells => new Thermo(...cells)),
  ...cages.filter(({ sum }) => sum !== null).map(({ sum, cells }) => new Sum(sum, ...cells)),
  ...cages.flatMap(({ cells }) => oilWaterPairs(cells)),
];
