// Title: Knightmare Collaboration
// Author: Skunkworks
// Video: https://www.youtube.com/watch?v=nOm-Qs27mLc
// Source: https://app.crackingthecryptic.com/sudoku/6jmBpM6DP3

// Normal sudoku rules apply (default 9x9 grid, rows/columns/3x3 boxes).
// A V between two orthogonally-adjacent cells means those two cells sum to
// 5; an X means they sum to 10. Not every V/X is drawn, so an undrawn
// adjacent pair carries no constraint (rules: "Not all Vs and Xs are
// necessarily given") -- only the drawn edges below are encoded.
// Any two cells a knight's move apart cannot sum to 5 and cannot sum to 15
// (global negative constraint, independent of the V/X markers).

const graph = cellGraph();

// Drawn V markers (sum to 5): the edge(cellA,cellB) pairs of every "V" text
// overlay in the source.
const vEdges = [
  ['R1C3', 'R2C3'],
  ['R3C1', 'R3C2'],
  ['R6C1', 'R6C2'],
  ['R4C4', 'R5C4'],
  ['R4C8', 'R5C8'],
  ['R7C5', 'R7C6'],
  ['R6C4', 'R7C4'],
  ['R6C8', 'R7C8'],
];

// Drawn X markers (sum to 10): the edge(cellA,cellB) pairs of every "X" text
// overlay in the source.
const xEdges = [
  ['R4C3', 'R4C4'],
  ['R5C7', 'R5C8'],
  ['R9C6', 'R9C7'],
  ['R9C3', 'R9C4'],
  ['R8C2', 'R9C2'],
  ['R7C7', 'R8C7'],
];

// Every knight's-move cell pair on the grid, each taken once: the 8 knight
// offsets collapse to 4 templates under "each pair counted from its
// smaller-dRow direction" (dRow > 0 always picks one of the pair's two
// (cell, other) orderings). Each template is replicated over every grid
// cell where the offset stays on the board, rather than writing one Pair
// per edge.
const KNIGHT_OFFSET_TEMPLATES = [
  [1, -2], [1, 2], [2, -1], [2, 1],
];

// Shared relation key for the knight-move negative: neither cell sum equals
// 5 nor 15.
const knightKey = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 15, 9);

// graph.makeReplicate() always anchors the template at R1C1 (2D position
// (0,0)) and shifts each target by the template cells' own 2D offset from
// that anchor. Two of the four offset templates have a negative dRow/dCol
// component, so no on-grid cell sits at that 2D offset from R1C1 -- the
// template itself would be unbuildable. Anchoring each template at its own
// first valid origin instead (still one Replicate per template, still 4
// total) is the only way to represent those two.
const knightReplicates = KNIGHT_OFFSET_TEMPLATES.map(([dRow, dCol]) => {
  const origins = graph.cells().filter(cell => graph.step(cell, dRow, dCol) !== null);
  const origin = origins[0];
  const other = graph.step(origin, dRow, dCol);
  return new Replicate(
    [new Pair(knightKey, 'KnightNotSum5Or15', origin, other)],
    Replicate.encodeTargetCells(origins, origin, graph),
    origin,
  );
});

return [
  new Given('R1C5', 1),
  new Given('R8C5', 7),
  ...vEdges.map(([a, b]) => new V(a, b)),
  ...xEdges.map(([a, b]) => new X(a, b)),
  ...knightReplicates,
];
