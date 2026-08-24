// Title: Star Wars Day
// Author: Jessica Shaham
// Video: https://www.youtube.com/watch?v=HDmB0BkJrjw
// Source: https://app.crackingthecryptic.com/sudoku/hrHdD39Pqr

// Rules: "Normal sudoku rules apply. Digits increase along thermos from the
// bulb. Clues outside the grid sum the indicated diagonal, which may include
// repeats. Cages' sums are given." Standard rows/columns/boxes (default
// Shape('9x9') regions match the drawn 3x3 box partition). Cages carry only
// a total with no other marking, so they are read as standard killer cages
// (sum + all cells distinct) -- the default convention for a total-only cage.
// Every rule sentence is represented below; nothing is omitted.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Thermometers, bulb cell first. T3/T4 share a tail (two bulbs merging into
// one increasing run); T5/T6 share a bulb (one bulb branching into two runs);
// T7/T8 cross at a shared middle cell with independent bulbs. All read
// directly off the drawn grey lines and their paired bulb circles.
const thermos = [
  ['R4C2', 'R3C2', 'R2C2', 'R3C3', 'R2C4', 'R3C4', 'R4C4'],
  ['R4C5', 'R3C5', 'R2C5', 'R2C6', 'R3C6', 'R4C6'],
  ['R2C7', 'R3C8', 'R4C8'],
  ['R2C9', 'R3C8', 'R4C8'],
  ['R7C5', 'R7C4', 'R7C3', 'R6C4', 'R5C5', 'R6C5'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R9C7', 'R8C8', 'R7C9'],
  ['R9C9', 'R8C8', 'R7C7'],
];

// Cages: cells and totals transcribed from the `cages` array.
const cages = [
  { cells: ['R1C1', 'R2C1'], sum: 5 },
  { cells: ['R9C8', 'R9C9'], sum: 4 },
  { cells: ['R4C1', 'R4C2'], sum: 4 },
  { cells: ['R5C7', 'R5C8'], sum: 5 },
];

return [
  new Shape('9x9'),

  ...thermos.map(cells => new Thermo(...cells)),

  ...cages.map(({ cells, sum }) => new Cage(sum, ...cells)),

  // Outside diagonal-sum clues: LittleKiller allows repeats by definition,
  // matching "which may include repeats". fromCells derives ISS's own
  // canonical corner for each diagonal, which need not be the cell nearest
  // the drawn off-grid arrow.
  LittleKiller.fromCells(45, graph.ray('R1C2', 1, 1), geometry),
  LittleKiller.fromCells(45, graph.ray('R9C2', -1, 1), geometry),
];
