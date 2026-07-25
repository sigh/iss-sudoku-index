// Title: Low Five
// Author: tzvibess
// Video: https://www.youtube.com/watch?v=5qN9jUhLFy4
// Source: https://sudokupad.app/w0kzyq172m

// Normal sudoku rules apply (default row/column/box all-different).
// Every digit d has a "value" of |d - 5| (the difference between the digit
// and 5): 1<->4, 2<->3, 3<->2, 4<->1, 5<->0, 6<->1, 7<->2, 8<->3, 9<->4.
// Cages: digits inside a cage do not repeat; the cage's VALUES sum to the
// small clue in its top-left cell.
// Red lines: the VALUES along the line are a consecutive set of distinct
// values, increasing or decreasing along the line.
// Arrows (small marks drawn between two orthogonally adjacent cells) point
// towards the smaller of the two adjacent DIGITS -- digit comparison, not
// value comparison.

const graph = cellGraph('9x9');

// Cage cells, provenance: geometry helper's Cages section (14 cages).
const cageCellLists = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R2C2'],
  ['R3C1', 'R3C2'],
  ['R4C1', 'R4C2'],
  ['R5C1', 'R5C2'],
  ['R9C8', 'R9C9'],
  ['R8C8', 'R8C9'],
  ['R7C8', 'R7C9'],
  ['R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R6C6', 'R6C7', 'R7C6'],
  ['R6C4', 'R7C4', 'R8C4'],
  ['R4C6', 'R4C7', 'R4C8'],
  ['R8C6', 'R9C6'],
];
const cageTotals = [8, 6, 4, 7, 4, 1, 3, 5, 10, 6, 11, 8, 3, 3];

// Line cells, provenance: geometry helper's Lines section (3 red lines).
const lineCellLists = [
  ['R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R4C3', 'R4C4', 'R3C4'],
];

// Every arrow spans exactly two adjacent cells; [bigger, smaller] by DIGIT.
// Provenance: geometry helper's Arrows section (9 arrows) -- endpoint order
// is the raw wayPoints order, so the arrowhead (smaller digit) is each
// entry's second cell.
const arrowPairs = [
  ['R4C8', 'R4C9'],
  ['R8C4', 'R9C4'],
  ['R4C9', 'R3C9'],
  ['R7C1', 'R8C1'],
  ['R8C1', 'R9C1'],
  ['R3C9', 'R2C9'],
  ['R2C7', 'R2C6'],
  ['R4C3', 'R5C3'],
  ['R4C2', 'R4C3'],
];

// Parallel Var overlay holding each cell's value, shifted by +1 (range 1-5)
// so it fits the grid's default 1-9 Var domain -- an unshifted 0 would be
// dropped when a Given intersects it with that domain. Only cells that
// participate in a cage or line total need the overlay.
const valueCells = [...new Set([
  ...cageCellLists.flat(),
  ...lineCellLists.flat(),
])];
const values = graph.makeOverlay('VV', valueCells);
const value = cell => values.at(cell);

// value(cell) - 1 === |digit - 5|.
const valueLinkKey = Pair.fnToKey((d, v) => v === Math.abs(d - 5) + 1, 9);

return [
  new Shape('9x9'),
  values.toVar('digit value (|d-5|, shifted +1)'),
  ...valueCells.map(cell => new Given(value(cell), 1, 2, 3, 4, 5)),
  ...valueCells.map(cell => new Pair(valueLinkKey, 'value-link', cell, value(cell))),

  // Cages: distinct digits, values sum to the cage total.
  ...cageCellLists.map(cells => new AllDifferent(...cells)),
  ...cageCellLists.map((cells, i) =>
    new Sum(cageTotals[i] + cells.length, ...values.at(cells))),

  // Red lines: distinct values; each adjacent pair of values differs by
  // exactly 1. A no-repeat walk with unit steps is necessarily monotonic
  // (a direction reversal would revisit the value just left), so this pair
  // of constraints already forces the whole line to be a strictly
  // increasing or strictly decreasing run of consecutive values -- no
  // separate "in order" constraint is needed.
  ...lineCellLists.map(cells => new AllDifferent(...values.at(cells))),
  ...lineCellLists.map(cells => new Pair(
    Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9), 'line-step',
    ...values.at(cells))),

  // Arrows: the pointed-to cell holds the smaller digit.
  ...arrowPairs.map(([bigger, smaller]) => new GreaterThan(bigger, smaller)),
];
