// Title: Spellbinding Square
// Author: shady moon
// Video: https://www.youtube.com/watch?v=6_ilNk3gb54
// Source: https://sudokupad.app/p6660shn47

// Normal Sudoku rules apply.
// The central 3x3 box (box 5) is a magic square: each of its 3 rows, 3
// columns, and 2 diagonals sums to the same total. The box's own
// all-different (from the standard box rule) then forces that total to 15.
// The thermometer's digits strictly increase from its bulb.
// Each purple-marked diagonal pair of cells sums to 10.
// Within the drawn cage, any two cells a king's move apart must not hold
// the same digit and must not sum to 5, 10, or 15; this scope is only
// king's-move pairs inside the cage, not a whole-cage all-different.

const graph = cellGraph('9x9');

// Magic square: box 5 (R4C4..R6C6), reshaped into its 3 rows, 3 columns, and
// 2 diagonals.
const box = graph.box(5);
const magicSegments = [
  [box[0], box[1], box[2]],
  [box[3], box[4], box[5]],
  [box[6], box[7], box[8]],
  [box[0], box[3], box[6]],
  [box[1], box[4], box[7]],
  [box[2], box[5], box[8]],
  [box[0], box[4], box[8]],
  [box[2], box[4], box[6]],
];

// Thermometer bulb-to-tip order, from the drawn waypoints and the bulb
// circle underlay at R4C5: R4C5 -> R5C4 -> R6C4.
const thermo = ['R4C5', 'R5C4', 'R6C4'];

// Purple diagonal-sum-10 marks: each is drawn as a pair of small ticks at a
// shared grid corner, one tick pointing into each of the two diagonally
// touching cells. The four corners and the cell pairs they mark (from the
// drawn line waypoints, grouped by shared corner):
//   corner (R2/R3, C2/C3): R2C3 & R3C2
//   corner (R2/R3, C7/C8): R2C8 & R3C7
//   corner (R7/R8, C2/C3): R7C3 & R8C2
//   corner (R7/R8, C7/C8): R7C8 & R8C7
const sum10Pairs = [
  ['R2C3', 'R3C2'],
  ['R2C8', 'R3C7'],
  ['R7C3', 'R8C2'],
  ['R7C8', 'R8C7'],
];
const sum10Key = Pair.fnToKey((a, b) => a + b === 10, 9);

// The cage (no total: only the king's-move rule applies to it), from the
// drawn cage outline.
const cageCells = [
  'R2C2', 'R2C3', 'R2C5', 'R2C7', 'R3C3', 'R3C4', 'R3C5', 'R3C6',
  'R3C7', 'R3C8', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R5C2',
  'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C3', 'R6C4',
  'R6C5', 'R6C6', 'R6C7', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6',
  'R7C7', 'R8C3', 'R8C5', 'R8C7', 'R8C8',
];
const cageSet = new Set(cageCells);
// Every unordered pair of cage cells that are a king's move apart, derived
// from the cage cell list rather than hand-enumerated.
const kingPairs = [];
const seenPairs = new Set();
for (const cell of cageCells) {
  for (const nb of graph.kingNeighbours(cell)) {
    if (!cageSet.has(nb)) continue;
    const key = cell < nb ? `${cell}|${nb}` : `${nb}|${cell}`;
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    kingPairs.push(cell < nb ? [cell, nb] : [nb, cell]);
  }
}
const cageAdjacentKey = Pair.fnToKey(
  (a, b) => a !== b && a + b !== 5 && a + b !== 10 && a + b !== 15, 9);

return [
  new Shape('9x9'),
  new EqualSum(...magicSegments),
  new Thermo(...thermo),
  ...sum10Pairs.map(([a, b]) => new Pair(sum10Key, 'purple sum 10', a, b)),
  ...kingPairs.map(([a, b]) => new Pair(cageAdjacentKey, 'cage king move', a, b)),
];
