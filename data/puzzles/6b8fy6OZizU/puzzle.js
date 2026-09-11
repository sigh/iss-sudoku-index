// Title: Myriad of Triad
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=6b8fy6OZizU
// Source: https://app.crackingthecryptic.com/sudoku/LTdPqqtpFq

// Rules encoded in full:
//   Normal sudoku rules apply, and clues outside the grid show the sum of the
//   indicated diagonal, which may include repeat digits. All instances of
//   neighbouring digits having a difference of 3 are shown, so two
//   orthogonally neighbouring cells not marked with a circled 3 do NOT have a
//   difference of 3.
// There are no given digits. Nothing is omitted. A blank circle drawn in the
// margin below the bottom-left corner carries no numeral and no arrow, so it
// states no total and points at no diagonal; it is decoration.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

// The 25 circled 3s, each as the orthogonally adjacent pair its circle
// straddles. Transcribed from the edge marks drawn on the board.
const triadEdges = [
  ['R1C3', 'R2C3'], ['R2C3', 'R2C4'], ['R3C3', 'R3C4'], ['R3C3', 'R4C3'],
  ['R2C1', 'R3C1'], ['R4C1', 'R5C1'], ['R6C1', 'R7C1'], ['R6C2', 'R7C2'],
  ['R8C2', 'R9C2'], ['R8C4', 'R8C5'], ['R9C4', 'R9C5'], ['R8C8', 'R9C8'],
  ['R7C8', 'R8C8'], ['R7C9', 'R8C9'], ['R6C8', 'R6C9'], ['R4C8', 'R5C8'],
  ['R3C8', 'R4C8'], ['R1C9', 'R2C9'], ['R1C7', 'R1C8'], ['R1C5', 'R1C6'],
  ['R1C6', 'R2C6'], ['R2C6', 'R2C7'], ['R3C6', 'R4C6'], ['R4C5', 'R4C6'],
  ['R5C5', 'R5C6'],
];

// Difference of exactly 3, and its negation for the unmarked edges. The shape
// supplies the 1-9 value range the predicates are tabulated over.
const isTriad = Pair.fnToKey((a, b) => Math.abs(a - b) === 3, shape);
const notTriad = Pair.fnToKey((a, b) => Math.abs(a - b) !== 3, shape);

// The negative half of the rule needs the pairs with no circle, so derive the
// full orthogonal adjacency and subtract the drawn ones. Taking each cell's
// right neighbour and its lower neighbour lists every undirected edge once;
// the key is order-independent, so a drawn pair matches whichever way round it
// was transcribed.
const edgeKey = (edge) => edge.slice().sort().join(',');
const drawn = new Set(triadEdges.map(edgeKey));
const edgeDirs = [[0, 1], [1, 0]];
const plainEdgesByDir = edgeDirs.map(([dRow, dCol]) => graph.cells()
  .map((cell) => [cell, graph.step(cell, dRow, dCol)])
  .filter(([, neighbour]) => neighbour !== null)
  .filter((edge) => !drawn.has(edgeKey(edge))));

// 119 edges carry no circle. Each direction's constraints are the same
// two-cell template stamped onto every unmarked edge of that direction, so
// each is one Replicate over the anchor (upper/left) cell of those edges.
const plainRules = plainEdgesByDir.map((edges, i) => {
  const [dRow, dCol] = edgeDirs[i];
  const template = new Pair(
    notTriad, 'no difference of 3', 'R1C1', makeCellId(1 + dRow, 1 + dCol));
  return graph.makeReplicate(template, edges.map(([anchor]) => anchor));
});

// Each outside clue is the down-left ray entering the board at the corner its
// arrow tip touches; ray() derives the diagonal so the clue does not depend on
// which end the constraint class treats as canonical.
const littleKillers = [
  [9, 'R1C3'], [26, 'R1C4'], [42, 'R1C9'], [28, 'R4C9'], [21, 'R7C9'],
].map(([total, entry]) =>
  LittleKiller.fromCells(total, graph.ray(entry, 1, -1), geometry));

return [
  shape,
  ...triadEdges.map(([a, b]) => new Pair(isTriad, 'difference of 3', a, b)),
  ...plainRules,
  ...littleKillers,
];
