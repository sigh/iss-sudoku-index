// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=_9sZ-fccZHw
// Source: https://cracking-the-cryptic.web.app/sudoku/md249PmBGR

// Standard 9x9 sudoku (rows, columns, 3x3 boxes) plus one given and 45 white
// (Kropki-consecutive) dots. The only rules text -- the video description --
// reads: "Each instance of consecutive numbers next to each other is marked
// with a dot." That is an exhaustiveness clause, so every orthogonally-
// adjacent pair with no drawn dot is constrained to not be consecutive. No
// ratio-2 (black dot) relation is mentioned, so only the consecutive family
// is negated.

const graph = cellGraph('9x9');

// Drawn white dots, one edge per dot (all filled white with a black
// border), transcribed from the puzzle's edge geometry.
const dotEdges = [
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C3', 'R1C4'], ['R1C4', 'R1C5'],
  ['R2C5', 'R2C6'], ['R2C5', 'R3C5'], ['R3C4', 'R3C5'], ['R2C4', 'R3C4'],
  ['R2C3', 'R3C3'], ['R2C2', 'R3C2'], ['R2C1', 'R3C1'],
  ['R5C2', 'R5C3'], ['R5C2', 'R6C2'],
  ['R6C1', 'R7C1'], ['R7C1', 'R8C1'], ['R8C1', 'R8C2'],
  ['R7C3', 'R8C3'], ['R7C3', 'R7C4'],
  ['R9C3', 'R9C4'],
  ['R8C4', 'R8C5'], ['R8C5', 'R8C6'],
  ['R7C5', 'R7C6'], ['R6C6', 'R7C6'], ['R6C5', 'R6C6'], ['R6C5', 'R7C5'],
  ['R5C5', 'R5C6'], ['R5C4', 'R5C5'],
  ['R4C4', 'R4C5'],
  ['R3C6', 'R4C6'], ['R3C7', 'R4C7'], ['R4C7', 'R5C7'], ['R5C6', 'R5C7'],
  ['R1C7', 'R2C7'], ['R1C7', 'R1C8'], ['R1C8', 'R1C9'], ['R1C9', 'R2C9'],
  ['R2C8', 'R3C8'],
  ['R4C9', 'R5C9'], ['R5C8', 'R6C8'], ['R6C7', 'R6C8'], ['R6C9', 'R7C9'],
  ['R8C8', 'R8C9'], ['R7C8', 'R8C8'], ['R7C7', 'R7C8'],
  ['R8C7', 'R9C7'],
];

const edgeKey = (a, b) => [a, b].sort().join('-');
const dotKeys = new Set(dotEdges.map(([a, b]) => edgeKey(a, b)));

// Every orthogonally-adjacent pair of cells with no drawn dot: derived from
// the grid adjacency graph, not hand-enumerated. Split into horizontal and
// vertical origin lists (leftmost / topmost cell of each pair) so the
// repeated "not consecutive" relation can be applied with two `Replicate`
// templates instead of 99 individual `Pair` constraints.
const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const seenEdges = new Set();
const horizOrigins = [];
const vertOrigins = [];
for (const cell of graph.cells()) {
  for (const nb of graph.neighbours(cell)) {
    const key = edgeKey(cell, nb);
    if (seenEdges.has(key) || dotKeys.has(key)) continue;
    seenEdges.add(key);
    const pc = parseCellId(cell), pn = parseCellId(nb);
    if (pc.row === pn.row) {
      horizOrigins.push(pc.col < pn.col ? cell : nb);
    } else {
      vertOrigins.push(pc.row < pn.row ? cell : nb);
    }
  }
}

const [hOrigin] = horizOrigins;
const [vOrigin] = vertOrigins;

return [
  new Shape('9x9'),
  new Given('R9C9', 1),
  ...dotEdges.map(([a, b]) => new WhiteDot(a, b)),
  new Replicate(
    [new Pair(
      notConsecutiveKey, 'not consecutive (horizontal)',
      hOrigin, graph.step(hOrigin, 0, 1))],
    Replicate.encodeTargetCells(horizOrigins, hOrigin, graph),
    hOrigin,
  ),
  new Replicate(
    [new Pair(
      notConsecutiveKey, 'not consecutive (vertical)',
      vOrigin, graph.step(vOrigin, 1, 0))],
    Replicate.encodeTargetCells(vertOrigins, vOrigin, graph),
    vOrigin,
  ),
];
