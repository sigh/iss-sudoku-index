// Title: Happy 49th
// Author: Blobz
// Video: https://www.youtube.com/watch?v=lknRYxjlRe4
// Source: https://tinyurl.com/happy-49th-blobz

// Normal sudoku rules apply. Givens R1C5..R1C8 = 1,9,7,3 spell "1973"
// (theming only, no extra rule).
// Two thermometers share a bulb at R8C3 and must strictly increase from it
// (Thermo's built-in semantics).
// One palindrome line mirrors its cell list about the centre (Palindrome's
// built-in semantics).
// Nine 2-cell killer cages each sum to 7. The rules also state a negative:
// no orthogonally-adjacent domino left unmarked by one of those cages may
// sum to 7. That set is derived below as every adjacent cell pair in the
// grid graph minus the nine cage edges, rather than hand-enumerated.
// One drawn white dot (R9C2-R8C2, differ by 1); the rules note "not all dots
// are shown", so no negative dot constraint applies to the rest of the grid.

const cages = [
  ['R2C5', 'R2C6'],
  ['R2C7', 'R3C7'],
  ['R2C8', 'R3C8'],
  ['R4C7', 'R5C7'],
  ['R4C6', 'R5C6'],
  ['R4C4', 'R5C4'],
  ['R6C2', 'R6C3'],
  ['R8C3', 'R9C3'],
  ['R9C5', 'R9C6'],
];

const graph = cellGraph('9x9');
const cageEdgeKeys = new Set(cages.map(([a, b]) => `${a}-${b}`));

// Every in-grid adjacent pair, minus the nine cage edges, split by direction
// so each direction can be applied as one Replicate-stamped template instead
// of 135 individual Pair constraints.
const notSevenKey = Pair.fnToKey((a, b) => a + b !== 7, 9);
const rightNeighbourTargets = []; // left cell of each included horizontal edge
const downNeighbourTargets = []; // top cell of each included vertical edge
for (const cell of graph.cells()) {
  const { row, col } = parseCellId(cell);
  const right = graph.step(cell, 0, 1);
  if (right && !cageEdgeKeys.has(`${cell}-${right}`)) {
    rightNeighbourTargets.push(cell);
  }
  const down = graph.step(cell, 1, 0);
  if (down && !cageEdgeKeys.has(`${cell}-${down}`)) {
    downNeighbourTargets.push(cell);
  }
}

const notSevenPairs = [
  graph.makeReplicate(
    new Pair(notSevenKey, 'not-7-domino', 'R1C1', 'R1C2'), rightNeighbourTargets),
  graph.makeReplicate(
    new Pair(notSevenKey, 'not-7-domino', 'R1C1', 'R2C1'), downNeighbourTargets),
];

return [
  new Shape('9x9'),

  new Given('R1C5', 1),
  new Given('R1C6', 9),
  new Given('R1C7', 7),
  new Given('R1C8', 3),

  new Thermo('R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3'),
  new Thermo('R8C3', 'R7C3', 'R6C3', 'R6C2', 'R6C1', 'R5C1', 'R4C1'),

  new Palindrome(
    'R8C6', 'R7C7', 'R6C8', 'R5C8', 'R4C8', 'R3C7', 'R3C6', 'R4C5', 'R5C6', 'R5C7'),

  ...cages.map(cells => new Cage(7, ...cells)),

  new WhiteDot('R9C2', 'R8C2'),

  ...notSevenPairs,
];
