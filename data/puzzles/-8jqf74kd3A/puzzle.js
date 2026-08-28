// Title: Connect the Dits
// Author: Undar_Beyond; Dance1211
// Video: https://www.youtube.com/watch?v=-8jqf74kd3A
// Source: https://app.crackingthecryptic.com/sudoku/hFdr98R6BQ

// Normal sudoku rules apply.
// Consecutive digits are separated by a white dot.
// Digits in a 1:2 ratio are separated by a black dot.
// Grey dots act as either a white dot or a black dot, and must be deduced.
// A negative constraint applies: an orthogonally adjacent pair with no dot is
// neither consecutive nor in a 1:2 ratio.
//
// Omitted: "decrypting the grey dots reveals the final step". The rules give no
// decryption scheme, so that step is the solver's own closing deduction rather
// than a stated property of the grid; each grey dot is encoded only as the
// disjunction its own rule sentence states.

// Dot tables transcribed from the drawn edge marks, keyed by fill colour:
// white #FFFFFF, black #000000, grey #CFCFCF. Each entry is the pair of cells
// the mark sits between.
const whiteDots = [
  ['R1C2', 'R1C3'], ['R1C6', 'R2C6'], ['R1C9', 'R2C9'], ['R2C1', 'R3C1'],
  ['R2C4', 'R3C4'], ['R2C5', 'R3C5'], ['R3C2', 'R3C3'], ['R3C3', 'R3C4'],
  ['R4C2', 'R4C3'], ['R4C3', 'R4C4'], ['R4C4', 'R5C4'], ['R4C6', 'R5C6'],
  ['R4C9', 'R5C9'], ['R6C7', 'R6C8'], ['R7C4', 'R7C5'], ['R8C1', 'R9C1'],
  ['R8C6', 'R8C7'], ['R9C3', 'R9C4'], ['R9C6', 'R9C7'],
];

const blackDots = [
  ['R1C2', 'R2C2'], ['R1C7', 'R2C7'], ['R2C9', 'R3C9'], ['R3C5', 'R3C6'],
  ['R4C1', 'R5C1'], ['R5C5', 'R5C6'], ['R5C9', 'R6C9'], ['R6C1', 'R6C2'],
  ['R7C4', 'R8C4'], ['R8C3', 'R9C3'],
];

const greyDots = [
  ['R1C5', 'R1C6'], ['R1C6', 'R1C7'], ['R1C7', 'R1C8'], ['R3C2', 'R4C2'],
  ['R3C3', 'R4C3'], ['R3C4', 'R4C4'], ['R3C5', 'R4C5'], ['R3C6', 'R4C6'],
  ['R4C5', 'R4C6'], ['R4C6', 'R4C7'], ['R4C7', 'R4C8'], ['R4C8', 'R4C9'],
  ['R5C1', 'R6C1'], ['R5C2', 'R6C2'], ['R5C3', 'R6C3'], ['R5C4', 'R6C4'],
  ['R5C5', 'R6C5'], ['R7C1', 'R8C1'], ['R7C2', 'R8C2'], ['R7C7', 'R8C7'],
  ['R7C8', 'R8C8'], ['R7C9', 'R8C9'], ['R8C4', 'R9C4'], ['R8C5', 'R9C5'],
  ['R8C6', 'R9C6'], ['R8C7', 'R9C7'], ['R8C8', 'R9C8'],
];

const graph = cellGraph('9x9');
const edgeKey = (a, b) => [a, b].sort().join('|');
const markedEdges = new Set(
  [...whiteDots, ...blackDots, ...greyDots].map(([a, b]) => edgeKey(a, b)));

// The negative constraint's edges: every orthogonally adjacent pair minus the
// marked ones, split by orientation so each group is one translated template.
const unmarkedEdges = graph.cells().flatMap(
  a => graph.neighbours(a)
    .filter(b => a < b && !markedEdges.has(edgeKey(a, b)))
    .map(b => [a, b]));
const acrossColumns = unmarkedEdges.filter(
  ([a, b]) => parseCellId(a).row === parseCellId(b).row);
const acrossRows = unmarkedEdges.filter(
  ([a, b]) => parseCellId(a).col === parseCellId(b).col);

// Neither consecutive nor 1:2 -- the negation of both dot relations at once.
const noDot = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 1 && a !== 2 * b && b !== 2 * a, 9);

// One Replicate per orientation: the template is the pair at the group's first
// (reading-order) edge, stamped onto the top-left cell of every other edge in
// the group.
const noDotGroup = (edges, dRow, dCol) => {
  const origins = edges.map(([a]) => a);
  const [originRow, originCol] = [parseCellId(origins[0]).row,
                                  parseCellId(origins[0]).col];
  return new Replicate(
    [new Pair(noDot, 'no dot', origins[0],
              makeCellId(originRow + dRow, originCol + dCol))],
    Replicate.encodeTargetCells(origins, origins[0], graph),
    origins[0]);
};

return [
  new Shape('9x9'),

  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...greyDots.map(cells => new Or([
    new WhiteDot(...cells),
    new BlackDot(...cells),
  ])),

  noDotGroup(acrossColumns, 0, 1),
  noDotGroup(acrossRows, 1, 0),
];
