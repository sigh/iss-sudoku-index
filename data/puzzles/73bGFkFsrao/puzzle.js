// Title: Short, Sweet and Simple
// Author: Cassadilla
// Video: https://www.youtube.com/watch?v=73bGFkFsrao
// Source: https://app.crackingthecryptic.com/sudoku/2gj4qQd4Qd

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Purple lines: digits form a consecutive set, any order -> Renban.
// Green lines: adjacent digits differ by >= 5 -> Whisper(5, ...).
// Red circles: high (6-9). Yellow circles: low (1-4). Blue circles: odd.
// Black dots: adjacent cells in a 1:2 ratio -> BlackDot; "all possible black
// dots are given" also constrains every other orthogonally adjacent pair to
// NOT be in a 1:2 ratio (encoded below as a negated-predicate Pair per edge,
// since only a black-dot negative is stated -- no white-dot/consecutive rule
// is in play, so StrictKropki's white-dot half would over-constrain).
// One inequality mark sits on the shared edge between R7C5 and R8C5. Its
// waypoints ([[6.85,4.35],[7.2,4.5],[6.85,4.65]], row-first) put the apex at
// the higher row value (7.2, the R8C5 side) and the flared base at the lower
// row value (6.85, the R7C5 side): the point touches R8C5. Per the rules,
// the pointed-to cell holds the lower digit, so R7C5 > R8C5.

// Purple (consecutive-set) lines, from the drawn line paths.
const purpleLines = [
  ['R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R2C1', 'R3C1'],
  ['R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4'],
  ['R2C9', 'R2C8', 'R2C7', 'R2C6', 'R2C5'],
];

// Green (difference >= 5) lines, from the drawn line paths.
const greenLines = [
  ['R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2'],
  ['R4C4', 'R4C5'],
  ['R4C6', 'R4C7'],
  ['R4C8', 'R4C9'],
];

// Coloured circle underlays.
const highCells = ['R2C1', 'R4C1'];  // red
const lowCells = ['R4C5', 'R1C9'];   // yellow
const oddCells = ['R1C2', 'R2C2'];   // blue

// Black dot edges, from the drawn edge overlays.
const blackDotEdges = [
  ['R2C4', 'R2C5'],
  ['R3C4', 'R3C5'],
  ['R2C5', 'R3C5'],
  ['R2C6', 'R3C6'],
  ['R2C8', 'R2C9'],
  ['R4C6', 'R5C6'],
  ['R5C5', 'R5C6'],
  ['R5C7', 'R5C8'],
  ['R8C8', 'R9C8'],
  ['R8C7', 'R9C7'],
  ['R7C4', 'R8C4'],
  ['R7C1', 'R7C2'],
];

// Every other orthogonally adjacent pair must NOT be in a 1:2 ratio. Grouped
// by offset (right neighbour, down neighbour) into two Replicates, since the
// undotted edges are otherwise 132 separate same-key Pair instances.
const graph = cellGraph('9x9');
const edgeKey = (a, b) => [a, b].sort().join('_');
const dotted = new Set(blackDotEdges.map(([a, b]) => edgeKey(a, b)));
const notRatioKey = Pair.fnToKey((a, b) => a !== b * 2 && b !== a * 2, 9);
const rightTargets = [];
const downTargets = [];
for (const cell of graph.cells()) {
  const right = graph.step(cell, 0, 1);
  if (right && !dotted.has(edgeKey(cell, right))) rightTargets.push(cell);
  const down = graph.step(cell, 1, 0);
  if (down && !dotted.has(edgeKey(cell, down))) downTargets.push(cell);
}
// graph.makeReplicate() anchors at R1C1 (index 0), always <= every target's
// index, so R1C1 plus its right/down neighbour is a valid template for any
// target subset.

return [
  new Shape('9x9'),
  ...purpleLines.map(cells => new Renban(...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...highCells.map(cell => new Given(cell, 6, 7, 8, 9)),
  ...lowCells.map(cell => new Given(cell, 1, 2, 3, 4)),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),
  graph.makeReplicate(new Pair(notRatioKey, '', 'R1C1', 'R1C2'), rightTargets),
  graph.makeReplicate(new Pair(notRatioKey, '', 'R1C1', 'R2C1'), downTargets),
  new GreaterThan('R7C5', 'R8C5'),
];
