// Title: Contritum Quadratum
// Author: pecha_berrie
// Video: https://www.youtube.com/watch?v=GOwuZ-BxQLE
// Source: https://app.crackingthecryptic.com/sudoku/JNL7j4DpP6

// Standard sudoku over rows, columns, and 9 irregular (jigsaw) regions; the
// grid has no 3x3 boxes (NoBoxes drops the default box groups).
// X between two cells: that pair sums to 10. V between two cells: that pair
// sums to 5. All X's and V's are drawn, so every other orthogonally
// adjacent pair is confirmed to sum to neither 5 nor 10 (StrictXV).
// Within the shaded 7x7 square (R2C2-R8C8), no digit repeats along a
// bishop's move -- any two cells sharing a diagonal line, any distance
// apart, both inside the square. Encoded as one AllDifferent per maximal
// diagonal segment confined to that square, in both diagonal directions.

// Jigsaw regions, transcribed from the payload's `regions` array (0-indexed
// [row,col] pairs converted to 1-indexed cell ids).
const jigsawRegions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7'],
  ['R2C2', 'R3C1', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R5C1'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R3C8', 'R3C9', 'R4C7', 'R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R7C3', 'R7C4', 'R7C5'],
  ['R6C5', 'R6C6', 'R7C6', 'R8C6', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R9C1', 'R9C2'],
  ['R6C7', 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
];

// Givens, transcribed from the payload's `cells` array.
const givens = [
  new Given('R2C5', 9),
  new Given('R4C1', 2),
  new Given('R4C4', 9),
  new Given('R6C5', 5),
  new Given('R7C9', 9),
  new Given('R9C3', 9),
  new Given('R9C8', 6),
];

// X/V dominoes, transcribed from the payload's `overlays` array (edge marks).
const xPairs = [
  ['R1C1', 'R1C2'], ['R3C1', 'R3C2'], ['R7C1', 'R7C2'], ['R8C1', 'R8C2'],
  ['R6C3', 'R6C4'], ['R5C5', 'R5C6'], ['R4C7', 'R4C8'], ['R8C4', 'R8C5'],
  ['R7C4', 'R7C5'], ['R4C4', 'R4C5'], ['R3C5', 'R3C6'], ['R9C6', 'R9C7'],
  ['R8C6', 'R8C7'], ['R6C6', 'R6C7'], ['R2C7', 'R2C8'], ['R3C7', 'R3C8'],
  ['R7C7', 'R7C8'], ['R5C2', 'R6C2'], ['R2C3', 'R3C3'], ['R1C9', 'R2C9'],
];
const vPairs = [
  ['R1C3', 'R1C4'],
];

// Bishop's-move region: shaded 7x7 square, rows 2-8 and columns 2-8
// (from the payload's `underlays` array).
const grayRows = [2, 3, 4, 5, 6, 7, 8];
const grayCols = [2, 3, 4, 5, 6, 7, 8];

// Group gray-square cells by diagonal: constant (row - col) is the "\"
// direction, constant (row + col) is the "/" direction. Every cell pair on
// the same diagonal must differ, so each group of 2+ becomes one
// AllDifferent.
function addToGroup(map, key, id) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(id);
}
const diagBackslash = new Map();
const diagForwardSlash = new Map();
for (const r of grayRows) {
  for (const c of grayCols) {
    const id = makeCellId(r, c);
    addToGroup(diagBackslash, r - c, id);
    addToGroup(diagForwardSlash, r + c, id);
  }
}
const bishopGroups = [...diagBackslash.values(), ...diagForwardSlash.values()]
  .filter(cells => cells.length >= 2);

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...jigsawRegions.map(cells => new Jigsaw('9x9', ...cells)),
  ...givens,
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
  new StrictXV(),
  ...bishopGroups.map(cells => new AllDifferent(...cells)),
];
