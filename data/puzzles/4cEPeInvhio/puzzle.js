// Title: Czarne Kropki
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=4cEPeInvhio
// Source: https://app.crackingthecryptic.com/sudoku/RmQ7hGm7BL

// Rules: normal sudoku. Digits along an arrow sum to the digit in its
// attached circle. A black dot joins two orthogonally-adjacent cells whose
// digits are in a 1:2 ratio; every such pair in the grid is marked, so any
// unmarked adjacent pair must NOT be in a 1:2 ratio. (The rules make no
// promise about consecutive digits, so the negative below only excludes the
// 1:2 relation -- it is not StrictKropki's white+black ban.)

const graph = cellGraph('9x9');

// Bulb-first arrows (drawn geometry: arrow #2 shares its bulb/circle with
// arrow #1 at R1C9 -- two separate arrows summing into the same circle).
const arrows = [
  new Arrow('R3C3', 'R2C3', 'R1C3'),
  new Arrow('R1C9', 'R2C9', 'R3C9'),
  new Arrow('R1C9', 'R1C8', 'R2C8'),
];

// Black dot edges, transcribed from the drawn rounded, black-filled,
// edge-centred marks.
const blackDotEdges = [
  ['R1C1', 'R2C1'], ['R1C2', 'R2C2'],
  ['R3C4', 'R4C4'], ['R3C4', 'R3C5'], ['R3C6', 'R4C6'], ['R4C5', 'R4C6'],
  ['R3C7', 'R3C8'], ['R4C9', 'R5C9'], ['R5C7', 'R6C7'], ['R5C6', 'R6C6'],
  ['R5C2', 'R6C2'], ['R5C1', 'R6C1'], ['R6C3', 'R7C3'], ['R7C2', 'R7C3'],
  ['R7C3', 'R7C4'], ['R7C4', 'R7C5'], ['R7C4', 'R8C4'], ['R8C4', 'R8C5'],
  ['R8C3', 'R9C3'], ['R9C1', 'R9C2'], ['R9C8', 'R9C9'], ['R8C7', 'R8C8'],
];
const dotKey = (a, b) => [a, b].sort().join('-');
const dottedEdges = new Set(blackDotEdges.map(([a, b]) => dotKey(a, b)));

const blackDots = blackDotEdges.map(([a, b]) => new BlackDot(a, b));

// Every remaining orthogonally-adjacent pair in the grid, so the "all
// possible black dots are given" exhaustiveness clause forbids the 1:2
// ratio anywhere it isn't drawn. Split into the two fixed relative offsets
// (right neighbour, down neighbour) and replicate each template, since the
// undotted edges are otherwise identical shifted copies of one relation.
const notBlackKey = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const rightOrigins = [];
const downOrigins = [];
for (const cell of graph.cells()) {
  const right = graph.step(cell, 0, 1);
  if (right && !dottedEdges.has(dotKey(cell, right))) rightOrigins.push(cell);
  const down = graph.step(cell, 1, 0);
  if (down && !dottedEdges.has(dotKey(cell, down))) downOrigins.push(cell);
}

const undottedPairs = [
  graph.makeReplicate(
    new Pair(notBlackKey, 'not 1:2', 'R1C1', 'R1C2'), rightOrigins),
  graph.makeReplicate(
    new Pair(notBlackKey, 'not 1:2', 'R1C1', 'R2C1'), downOrigins),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...blackDots,
  ...undottedPairs,
];
