// Title: For Daniel.
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=XHtBWmDLsA0
// Source: https://sudokupad.app/cveeva5iz3

// Normal Sudoku rules apply. Killer cages have the indicated sum and no
// repeated digit. Box 5 has a parity anti-knight rule. Equal even digits may
// not be a king's move apart. The X sums to 10 and all possible Xs are shown.
// White dots join consecutive digits, but their negative rule does not apply.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const cages = [
  new Cage(17, 'R4C1', 'R5C1'),
  new Cage(15, 'R9C5', 'R9C6'),
  new Cage(9, 'R5C9', 'R6C9'),
  new Cage(7, 'R1C7', 'R2C7'),
];

const whiteDots = [
  new WhiteDot('R2C9', 'R3C9'),
  new WhiteDot('R8C5', 'R8C6'),
];

// A knight edge is constrained when either endpoint lies in the central box.
const centralCells = graph.block('R4C4', 3, 3);
const knightOffsets = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];
const centralKnightEdges = new Map();
for (const cell of centralCells) {
  for (const [rowOffset, colOffset] of knightOffsets) {
    const other = graph.step(cell, rowOffset, colOffset);
    if (other !== null) {
      const edge = [cell, other].sort();
      centralKnightEdges.set(edge.join('|'), edge);
    }
  }
}
const differentParityKey = Pair.fnToKey(
  (a, b) => (a % 2) !== (b % 2), geometry.numValues);
const centralParityAntiKnight = [...centralKnightEdges.values()].map(
  ([a, b]) => new Pair(differentParityKey, 'different parity', a, b));

// Only repeated even digits are forbidden at a king's move. Applying this to
// every king edge states the rule directly; ordinary Sudoku already makes
// some of these instances redundant.
const evenSameMoveKey = Pair.fnToKey(
  (a, b) => !(a === b && a % 2 === 0), geometry.numValues);
const horizontalAnchors = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalAnchors = graph.cells().filter(cell => graph.step(cell, 1, 0));
const squareAnchors = graph.cells().filter(cell => graph.step(cell, 1, 1));
const evenSameMoveConstraints = [
  graph.makeReplicate(
    new Pair(evenSameMoveKey, 'even anti-king', 'R1C1', 'R1C2'),
    horizontalAnchors),
  graph.makeReplicate(
    new Pair(evenSameMoveKey, 'even anti-king', 'R1C1', 'R2C1'),
    verticalAnchors),
  graph.makeReplicate(
    new Pair(evenSameMoveKey, 'even anti-king', 'R1C1', 'R2C2'),
    squareAnchors),
  graph.makeReplicate(
    new Pair(evenSameMoveKey, 'even anti-king', 'R1C2', 'R2C1'),
    squareAnchors),
];

// All possible Xs are shown. StrictXV would also forbid unmarked sum-5 pairs,
// so enumerate only the required negative sum-10 rule.
const xCells = ['R6C1', 'R6C2'];
const notTenKey = Pair.fnToKey(
  (a, b) => a + b !== 10, geometry.numValues);
const noHiddenX = [
  graph.makeReplicate(
    new Pair(notTenKey, 'not X', 'R1C1', 'R1C2'),
    horizontalAnchors.filter(cell => cell !== 'R6C1')),
  graph.makeReplicate(
    new Pair(notTenKey, 'not X', 'R1C1', 'R2C1'),
    verticalAnchors),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whiteDots,
  new X(...xCells),
  ...centralParityAntiKnight,
  ...evenSameMoveConstraints,
  ...noHiddenX,
];
