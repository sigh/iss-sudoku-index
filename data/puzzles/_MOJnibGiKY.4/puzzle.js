// Title: September 28, 2021: TOWTBART
// Author: clover!
// Video: https://www.youtube.com/watch?v=_MOJnibGiKY
// Source: https://tinyurl.com/ywhwtrns

// Normal sudoku rules apply. Twelve killer cages carry no printed sum, only
// a no-repeat rule (AllDifferent per cage). Each cage also carries one red
// triangle cell (the cage's highest digit) and one blue triangle cell (the
// cage's lowest digit); the highest-cell value exceeds, and the lowest-cell
// value is below, every other cell's value in that same cage. Cage cells
// come from `killercage`; the marker cell and colour (red #FF7DA0 = highest,
// blue #BFB3FF = lowest) come from `text`, matched to its containing cage by
// membership -- every cage has exactly one of each colour, so no clue
// correspondence is left open.
//
// The marker-vs-rest relation is encoded with Pair, not GreaterThan/PairX:
// GreaterThan requires every passed cell to be grid-adjacent to another
// passed cell, which a cage's far corners are not; PairX symmetrizes its
// comparator (fn(a,b) && fn(b,a)), which cannot express an asymmetric
// greater/less relation. A two-cell Pair(key, name, marker, other) instead
// applies the key's binary relation directly between exactly those two
// cells, once per (marker, other-cell) edge in the cage.

const cages = [
  // Cage cells: `killercage`. high/low: the cage's red-triangle (highest)
  // and blue-triangle (lowest) marker cell from `text`.
  { cells: ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5'], high: 'R5C2', low: 'R2C5' },
  { cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R3C1', 'R4C1'], high: 'R4C1', low: 'R1C4' },
  { cells: ['R4C2', 'R4C3'], high: 'R4C3', low: 'R4C2' },
  { cells: ['R2C4', 'R3C4'], high: 'R3C4', low: 'R2C4' },
  { cells: ['R4C6', 'R5C6', 'R6C4', 'R6C5', 'R6C6'], high: 'R6C4', low: 'R5C6' },
  { cells: ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'], high: 'R1C9', low: 'R1C8' },
  { cells: ['R2C7', 'R2C8', 'R3C7', 'R3C8'], high: 'R2C8', low: 'R3C8' },
  { cells: ['R5C7', 'R5C8', 'R5C9', 'R6C9', 'R7C9'], high: 'R7C9', low: 'R5C7' },
  { cells: ['R7C7', 'R7C8', 'R8C7', 'R8C8', 'R8C9', 'R9C8'], high: 'R7C8', low: 'R8C7' },
  { cells: ['R7C5', 'R8C5', 'R9C5', 'R9C6', 'R9C7'], high: 'R9C5', low: 'R9C7' },
  { cells: ['R7C2', 'R7C3', 'R8C2', 'R8C3'], high: 'R8C3', low: 'R8C2' },
  { cells: ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'], high: 'R8C1', low: 'R7C1' },
];

const givens = [
  new Given('R1C9', 5),
  new Given('R4C5', 4),
  new Given('R5C4', 3),
  new Given('R5C6', 5),
  new Given('R6C5', 6),
  new Given('R9C1', 6),
];

const cageAllDifferent = cages.map(c => new AllDifferent(...c.cells));

const highKey = Pair.fnToKey((a, b) => a > b, 9);
const lowKey = Pair.fnToKey((a, b) => a < b, 9);

const highMarkers = cages.flatMap(c =>
  c.cells
    .filter(cell => cell !== c.high)
    .map(cell => new Pair(highKey, 'cage-highest', c.high, cell)));

const lowMarkers = cages.flatMap(c =>
  c.cells
    .filter(cell => cell !== c.low)
    .map(cell => new Pair(lowKey, 'cage-lowest', c.low, cell)));

return [
  new Shape('9x9'),
  ...givens,
  ...cageAllDifferent,
  ...highMarkers,
  ...lowMarkers,
];
