// Title: 4-color killer sudoku #2
// Author: Nylimb
// Video: https://www.youtube.com/watch?v=rAuRTeRk5dk
// Source: https://sudokupad.app/l0oqoyhsxw

// Standard sudoku on digits 1-9. The dashed cages cover the grid; digits do
// not repeat in a cage. Cage sums take exactly four distinct values, and
// edge-adjacent cages have different sums.

// The 1-10 domain lets auxiliary cells store decimal digits with 0 represented
// by 1, while grid cells are restricted back to the puzzle's digits 1-9.
const shape = new Shape('9x9', 10);
const graph = cellGraph('9x9');

const cages = [
  ['R1C1', 'R1C2', 'R2C2', 'R2C3', 'R3C3', 'R4C3'],
  ['R2C4', 'R3C4', 'R4C4'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R3C7', 'R3C8', 'R3C9'],
  ['R2C8', 'R2C9'],
  ['R3C5', 'R3C6', 'R4C5', 'R4C6', 'R5C3', 'R5C4', 'R5C5'],
  ['R5C2', 'R6C2'],
  ['R2C1', 'R3C1', 'R3C2', 'R4C2'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2'],
  ['R7C3', 'R8C3'],
  ['R6C3', 'R6C4', 'R6C5', 'R7C4', 'R7C5'],
  ['R8C1', 'R8C2', 'R8C4', 'R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R8C5', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R5C6', 'R6C6', 'R7C6', 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R9C9'],
  ['R4C7', 'R4C8', 'R5C7', 'R5C8', 'R6C7', 'R6C8'],
  ['R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R7C7', 'R7C8'],
];

const gridDomains = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Each cage chooses one of four ordered palette entries. A palette total is
// stored as decimal digits T,O using values T+1,O+1, so
// sum(cage) = 10*(T-1) + (O-1) becomes sum(cage)-10*T-O = -11.
const cageColors = new Var('C', 'cage sum palette index', cages.length);
const paletteTens = new Var('T', 'palette total tens digit plus one', 4);
const paletteOnes = new Var('O', 'palette total ones digit plus one', 4);

const cageRules = cages.flatMap((cells, i) => [
  new AllDifferent(...cells),
  new Or([0, 1, 2, 3].map(k => new And([
    new Given(cageColors.cell(i + 1), k + 1),
    new Sum(-11, ...cells,
      [paletteTens.cell(k + 1), -10],
      [paletteOnes.cell(k + 1), -1]),
  ]))),
]);

// Derive the cage adjacency graph from the drawn partition. Each grid cell is
// in exactly one cage, so an orthogonal grid edge with different owners is a
// shared cage edge. Corner-only contacts never appear here.
const owner = new Map(cages.flatMap((cells, cage) =>
  cells.map(cell => [cell, cage])));
const adjacentCagePairs = [];
const seenEdges = new Set();
for (const cell of graph.cells()) {
  for (const neighbour of graph.neighbours(cell)) {
    const a = owner.get(cell);
    const b = owner.get(neighbour);
    if (a === b) continue;
    const pair = a < b ? [a, b] : [b, a];
    const key = pair.join(',');
    if (!seenEdges.has(key)) {
      seenEdges.add(key);
      adjacentCagePairs.push(pair);
    }
  }
}

const adjacentSumsDiffer = adjacentCagePairs.map(([a, b]) =>
  new AllDifferent(cageColors.cell(a + 1), cageColors.cell(b + 1)));

// All four palette entries are used. Ordering their represented totals removes
// arbitrary colour-label permutations and also makes the four totals distinct.
const distinctCount = new Var('D', 'number of distinct cage sums', 1);
const greaterKey = Pair.fnToKey((a, b) => a > b, 10);
const orderedPalette = [0, 1, 2].map(i => new Or([
  new Pair(greaterKey, 'next cage total has greater tens digit',
    paletteTens.cell(i + 2), paletteTens.cell(i + 1)),
  new And([
    new SameValues(2, paletteTens.cell(i + 2), paletteTens.cell(i + 1)),
    new Pair(greaterKey, 'equal tens, next cage total has greater ones digit',
      paletteOnes.cell(i + 2), paletteOnes.cell(i + 1)),
  ]),
]));

return [
  shape,
  gridDomains,
  cageColors,
  ...cageColors.cells().map(cell => new Given(cell, 1, 2, 3, 4)),
  paletteTens,
  ...paletteTens.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5)),
  paletteOnes,
  ...cageRules,
  ...adjacentSumsDiffer,
  distinctCount,
  new Given(distinctCount.cell(), 4),
  new CountDistinct(distinctCount.cell(), ...cageColors.cells()),
  ...orderedPalette,
];
