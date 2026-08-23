// Title: London 0 - Hull 4
// Author: Krangune
// Video: https://www.youtube.com/watch?v=MgsfUn-8txs
// Source: https://app.crackingthecryptic.com/sudoku/L42H3q38P8

// Rules: 1-9 appear once in each row, column and marked region (9 irregular
// jigsaw regions, replacing the standard 3x3 boxes). Cages show their sums
// (3 drawn 2x2 cages, each with all-different cells). All instances of
// neighbouring cells with a difference of 4 are shown: the 15 marked edges
// below are orthogonally-adjacent pairs differing by exactly 4, and since
// "all instances" are shown, every other orthogonally-adjacent pair must NOT
// differ by 4.

// Jigsaw regions, one per drawn region (regions[] in the source payload).
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R1C8', 'R1C7'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5', 'R6C5', 'R2C4', 'R3C4', 'R3C5', 'R3C6'],
  ['R7C4', 'R7C5', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6', 'R6C4'],
  ['R1C9', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C7', 'R5C7', 'R4C9', 'R5C9'],
  ['R4C8', 'R5C8', 'R6C7', 'R6C8', 'R6C9', 'R4C6', 'R5C6', 'R6C6', 'R7C8'],
  ['R7C7', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9', 'R7C6'],
];

// Cages (cages[] in the source payload; entries without `cells` are metadata
// stubs and are not encoded).
const cages = [
  { total: 20, cells: ['R1C1', 'R1C2', 'R2C2', 'R2C1'] },
  { total: 10, cells: ['R8C1', 'R8C2', 'R9C2', 'R9C1'] },
  { total: 20, cells: ['R1C7', 'R1C8', 'R2C8', 'R2C7'] },
];

// Drawn "difference of 4" edge marks (rounded white "4" overlays; overlays[]
// in the source payload).
const diff4Edges = [
  ['R3C1', 'R3C2'], ['R3C1', 'R4C1'], ['R4C2', 'R5C2'], ['R3C3', 'R4C3'],
  ['R1C4', 'R1C5'], ['R1C5', 'R2C5'], ['R1C6', 'R2C6'], ['R3C4', 'R4C4'],
  ['R5C5', 'R6C5'], ['R5C6', 'R6C6'], ['R6C7', 'R7C7'], ['R6C7', 'R6C8'],
  ['R4C7', 'R5C7'], ['R1C8', 'R1C9'], ['R1C9', 'R2C9'],
];

// "All instances... are shown" is an exhaustiveness clause: every other
// orthogonally-adjacent pair must NOT differ by 4. Derive the unmarked edges
// from the marked ones instead of hand-listing them.
const markedKeys = new Set(diff4Edges.map(([a, b]) => [a, b].sort().join('-')));
const allAdjacentEdges = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const here = makeCellId(r, c);
    if (c < 9) allAdjacentEdges.push([here, makeCellId(r, c + 1)]);
    if (r < 9) allAdjacentEdges.push([here, makeCellId(r + 1, c)]);
  }
}
const unmarkedEdges = allAdjacentEdges.filter(
  ([a, b]) => !markedKeys.has([a, b].sort().join('-')));
// Split by fixed offset (rightward vs downward) so each group can be
// expressed as one Replicate template instead of 100+ individual Pairs.
const unmarkedRight = unmarkedEdges.filter(([a, b]) => a[1] === b[1]); // same row digit
const unmarkedDown = unmarkedEdges.filter(([a, b]) => a[1] !== b[1]);

const diff4Key = Pair.fnToKey((a, b) => Math.abs(a - b) === 4, 9);
const notDiff4Key = Pair.fnToKey((a, b) => Math.abs(a - b) !== 4, 9);

const graph = cellGraph('9x9');
const rightTemplate = new Replicate(
  [new Pair(notDiff4Key, 'NotDiff4', unmarkedRight[0][0], unmarkedRight[0][1])],
  Replicate.encodeTargetCells(
    unmarkedRight.map(([a]) => a), unmarkedRight[0][0], graph),
  unmarkedRight[0][0]);
const downTemplate = new Replicate(
  [new Pair(notDiff4Key, 'NotDiff4', unmarkedDown[0][0], unmarkedDown[0][1])],
  Replicate.encodeTargetCells(
    unmarkedDown.map(([a]) => a), unmarkedDown[0][0], graph),
  unmarkedDown[0][0]);

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  ...cages.map(({ total, cells }) => new Cage(total, ...cells)),
  ...diff4Edges.map(([a, b]) => new Pair(diff4Key, 'Diff4', a, b)),
  rightTemplate,
  downTemplate,
];
