// Title: Ramanujan Sudoku
// Author: Thomas Bui
// Video: https://www.youtube.com/watch?v=vZet0hSCq9c
// Source: https://cracking-the-cryptic.web.app/sudoku/GjgTNN9tNf
//
// Normal sudoku rules apply (standard 3x3 boxes). Givens: R3C1=1, R3C2=8,
// R4C3=8, R4C4=7.
// Taxicab: for digits 1, 7, 2 and 9, no two cells holding the same one of
// these digits may be exactly that many cells apart by taxicab (shortest
// orthogonal-step) distance.
// Diagonal: both long diagonals contain 1-9 (no repeats), which for a 9-cell
// line on a 9-value grid is exactly AllDifferent.
// XV, exhaustively marked: every orthogonally-adjacent pair summing to 10 is
// marked X and every one summing to 12 is marked V; every other adjacent
// pair sums to neither.

const graph = cellGraph('9x9');

// Group same-relation cell pairs [a, b] by their (dRow, dCol) offset and emit
// one Replicate per offset instead of one Pair per pair: every pair sharing
// an offset is a shifted copy of the same template.
function replicatedPairs(pairs, key, name) {
  const groups = new Map(); // "dr,dc" -> [a, ...] (origin cells sharing that offset)
  for (const [a, b] of pairs) {
    const pa = parseCellId(a), pb = parseCellId(b);
    const groupKey = `${pb.row - pa.row},${pb.col - pa.col}`;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(a);
  }
  const replicates = [];
  for (const [groupKey, origins] of groups) {
    const [dr, dc] = groupKey.split(',').map(Number);
    // Row-major order so the first cell has the smallest linear index --
    // Replicate requires every target to be at or after its origin.
    origins.sort((x, y) => {
      const px = parseCellId(x), py = parseCellId(y);
      return (px.row - py.row) || (px.col - py.col);
    });
    const origin = origins[0];
    replicates.push(new Replicate(
      [new Pair(key, name, origin, graph.step(origin, dr, dc))],
      Replicate.encodeTargetCells(origins, origin, graph),
      origin,
    ));
  }
  return replicates;
}

// Taxicab pairs are derived from the grid geometry, not hand-enumerated: for
// each digit d and each cell, walk every (dRow, dCol) offset with
// |dRow| + |dCol| === d, using only "forward" offsets (dRow > 0, or dRow ===
// 0 and dCol > 0) so each unordered pair is produced once. graph.step()
// returns null past the grid edge.
function taxicabOffsets(d) {
  const offsets = [];
  for (let dr = 0; dr <= d; dr++) {
    const dc = d - dr;
    if (dr === 0) {
      offsets.push([0, dc]);
    } else if (dc === 0) {
      offsets.push([dr, 0]);
    } else {
      offsets.push([dr, dc]);
      offsets.push([dr, -dc]);
    }
  }
  return offsets;
}

const taxicabDigits = [1, 7, 2, 9];
const taxicabConstraints = taxicabDigits.flatMap(d => {
  // Not-both-d predicate, keyed per digit so the four families display
  // distinctly; a plain (x,y) => !(x === d && y === d) only forbids the two
  // cells from *both* being d -- it leaves every other combination,
  // including one of them being d, unrestricted, matching the rule's own
  // wording.
  const key = Pair.fnToKey((x, y) => !(x === d && y === d), 9);
  const pairs = [];
  for (const cell of graph.cells()) {
    for (const [dr, dc] of taxicabOffsets(d)) {
      const other = graph.step(cell, dr, dc);
      if (other) pairs.push([cell, other]);
    }
  }
  return replicatedPairs(pairs, key, `taxicab-${d}`);
});

// Every orthogonally-adjacent (edge) pair in the grid, canonicalised as a
// sorted "R#C#|R#C#" key so it can be compared against the drawn X/V marks
// regardless of which cell was listed first.
const edgeKey = (a, b) => [a, b].sort().join('|');
const allEdges = [];
for (const cell of graph.cells()) {
  for (const other of [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]) {
    if (other) allEdges.push([cell, other]);
  }
}

// X marks (sum to 10) -- provenance: the payload's "X" text overlays, each
// centred on the shared edge of the two cells it marks.
const xEdges = [
  ['R1C2', 'R2C2'], ['R1C4', 'R1C5'], ['R1C6', 'R2C6'], ['R2C5', 'R3C5'],
  ['R3C6', 'R4C6'], ['R4C5', 'R4C6'], ['R6C5', 'R7C5'], ['R7C4', 'R7C5'],
  ['R8C4', 'R8C5'], ['R9C5', 'R9C6'], ['R8C7', 'R9C7'], ['R9C3', 'R9C4'],
  ['R8C3', 'R9C3'], ['R5C2', 'R6C2'], ['R6C1', 'R7C1'], ['R2C9', 'R3C9'],
  ['R4C8', 'R4C9'], ['R5C8', 'R6C8'], ['R6C9', 'R7C9'], ['R7C7', 'R7C8'],
  ['R9C8', 'R9C9'],
];
// V marks (sum to 12) -- same provenance, the payload's "V" text overlays.
const vEdges = [
  ['R8C6', 'R8C7'], ['R7C5', 'R7C6'], ['R6C4', 'R6C5'], ['R6C4', 'R7C4'],
  ['R8C2', 'R9C2'], ['R4C2', 'R5C2'], ['R2C2', 'R3C2'], ['R3C4', 'R4C4'],
];

const markedKeys = new Set([
  ...xEdges.map(([a, b]) => edgeKey(a, b)),
  ...vEdges.map(([a, b]) => edgeKey(a, b)),
]);
const unmarkedEdges = allEdges.filter(
  ([a, b]) => !markedKeys.has(edgeKey(a, b)));

const notXVKey = Pair.fnToKey((a, b) => a + b !== 10 && a + b !== 12, 9);
const notXVConstraints = replicatedPairs(unmarkedEdges, notXVKey, 'not-XV');

return [
  new Shape('9x9'),
  new Given('R3C1', 1),
  new Given('R3C2', 8),
  new Given('R4C3', 8),
  new Given('R4C4', 7),
  new Diagonal(-1),
  new Diagonal(1),
  ...taxicabConstraints,
  ...xEdges.map(([a, b]) => new Sum(10, a, b)),
  ...vEdges.map(([a, b]) => new Sum(12, a, b)),
  ...notXVConstraints,
];
