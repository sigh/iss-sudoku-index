// Title: Anti & Pro Knights
// Author: Eric Bader
// Video: https://www.youtube.com/watch?v=bMlMnsKH4zs
// Source: https://sudokupad.app/n837muu8j6

// Standard sudoku (9x9, standard boxes, no givens). Killer cages (distinct +
// sum). Green lines are German whispers (adjacent cells differ by >= 5).
// Pink lines are renban (the line's cells form a consecutive run, any order,
// no repeats). Digit 9 may not be a knight's move from another 9. Digit 1
// must be a knight's move from at least two other cells holding 1. Every
// knight's move wraps cylindrically in both directions (rows and columns mod
// 9), per the rules' own worked example for R1C2.

// Torus knight-move neighbours of (row, col), 1-indexed. cellGraph()'s
// neighbours/kingNeighbours do not wrap and have no knight-move variant, so
// this wraps row/column by hand (mod 9) instead.
// lint-ok: custom-neighbour-helper
function torusKnightNeighbors(row, col) {
  const deltas = [
    [1, 2], [1, -2], [-1, 2], [-1, -2],
    [2, 1], [2, -1], [-2, 1], [-2, -1],
  ];
  return deltas.map(([dr, dc]) => makeCellId(
    ((row - 1 + dr) % 9 + 9) % 9 + 1,
    ((col - 1 + dc) % 9 + 9) % 9 + 1,
  ));
}

function allCells() {
  const cells = [];
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) {
      cells.push({ row: r, col: c, cell: makeCellId(r, c) });
    }
  }
  return cells;
}

// Every torus-knight edge exactly once (81 cells * 8 neighbours / 2).
function knightEdges() {
  const seen = new Set();
  const edges = [];
  for (const { row, col, cell } of allCells()) {
    for (const n of torusKnightNeighbors(row, col)) {
      const key = [cell, n].sort().join('_');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([cell, n]);
    }
  }
  return edges;
}

// "No two 9s a knight's move apart": a custom Pair per torus-knight edge,
// forbidding both cells being 9. Most edges (the ones that stay in-bounds
// without wrapping for a given knight direction) are shifted copies of one
// template, so those are stamped with Replicate instead of one Pair each;
// only the genuinely wrapping edges (which Replicate's traverse() cannot
// follow off the grid) are emitted as individual Pairs.
const graph = cellGraph('9x9');
const antiKnight9Key = Pair.fnToKey((x, y) => !(x === 9 && y === 9), 9);

function cellRC(cellId) {
  const { row, col } = parseCellId(cellId);
  return [row, col];
}

// Cell (dr, dc) away without wrapping, or null off the grid.
function inGridCell(row, col, dr, dc) {
  const r = row + dr, c = col + dc;
  return (r >= 1 && r <= 9 && c >= 1 && c <= 9) ? makeCellId(r, c) : null;
}

// The 4 knight directions with dr > 0 give each torus edge exactly once
// (its dr < 0 reciprocal is the same edge seen from the other endpoint).
const KNIGHT_DIRECTIONS = [[1, 2], [1, -2], [2, 1], [2, -1]];

// One Replicate per direction, over every origin whose (dr, dc) step from it
// stays on the grid without wrapping (so a plain shift reproduces it).
const antiKnight9Replicated = KNIGHT_DIRECTIONS.map(([dr, dc]) => {
  const origins = allCells()
    .map(({ row, col, cell }) => ({ cell, target: inGridCell(row, col, dr, dc) }))
    .filter(({ target }) => target !== null);
  const anchor = origins[0].cell;
  const [anchorRow, anchorCol] = cellRC(anchor);
  const template = new Pair(
    antiKnight9Key, 'Anti-knight (9)', anchor, inGridCell(anchorRow, anchorCol, dr, dc));
  const targetBitset = Replicate.encodeTargetCells(
    origins.map(o => o.cell), anchor, graph);
  // graph.makeReplicate() always anchors at R1C1, which is off-grid for two
  // of these four directions once shifted by (dr, dc) (e.g. R1C1 + (2, -1)
  // has no column 0) -- the anchor must be the direction's own first clean
  // origin, so this builds the Replicate directly.
  // lint-ok: bare-replicate-constructor
  return new Replicate([template], targetBitset, anchor);
});

// The remaining edges: at least one endpoint needs to wrap to reach the
// other, so no plain (non-wrapping) direction connects them directly.
const antiKnight9Wrapped = knightEdges()
  .filter(([a, b]) => KNIGHT_DIRECTIONS.every(([dr, dc]) => {
    const [ar, ac] = cellRC(a);
    const [br, bc] = cellRC(b);
    return inGridCell(ar, ac, dr, dc) !== b && inGridCell(br, bc, dr, dc) !== a;
  }))
  .map(([a, b]) => new Pair(antiKnight9Key, 'Anti-knight (9)', a, b));

const antiKnight9 = [...antiKnight9Replicated, ...antiKnight9Wrapped];

// "Every 1 is a knight's move from at least two other 1s": per cell, either
// the cell itself is not 1 (Given restricts it away from 1), or its 8
// torus-knight neighbours contain at least two 1s (ContainAtLeast('1_1', ...)
// means the value 1 must appear at least twice among the listed cells).
const proKnight1 = allCells().map(({ row, col, cell }) => new Or([
  new Given(cell, 2, 3, 4, 5, 6, 7, 8, 9),
  new ContainAtLeast('1_1', ...torusKnightNeighbors(row, col)),
]));

const cages = [
  new Cage(12, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(20, 'R4C4', 'R4C5', 'R5C4', 'R5C5'),
  new Cage(13, 'R2C7', 'R2C8', 'R3C7', 'R3C8'),
  new Cage(22, 'R8C2', 'R8C3', 'R9C2', 'R9C3'),
  new Cage(6, 'R9C7', 'R9C8', 'R9C9'),
];

// Whisper (>= 5) lines, one per drawn green stroke. R8C8 is shared by two
// strokes (a branch, not one continuous line), so it is encoded as two
// separate Whisper segments rather than one path through all three arms.
const whispers = [
  new Whisper(5, 'R1C9', 'R2C8', 'R3C7'),
  new Whisper(5, 'R1C1', 'R2C2', 'R3C1'),
  new Whisper(5, 'R5C4', 'R4C4', 'R5C5', 'R4C5'),
  new Whisper(5, 'R7C2', 'R8C3', 'R8C2', 'R9C2', 'R8C1'),
  new Whisper(5, 'R7C7', 'R8C8', 'R9C9'),
  new Whisper(5, 'R8C8', 'R9C7'),
  new Whisper(5, 'R4C8', 'R5C8'),
];

// Renban lines, one per drawn pink stroke.
const renbans = [
  new Renban('R2C6', 'R2C7', 'R1C8', 'R2C8', 'R3C8', 'R2C9'),
  new Renban('R4C5', 'R5C6', 'R6C6', 'R6C5', 'R5C4'),
  new Renban('R9C2', 'R9C3', 'R8C3', 'R9C4'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
  ...renbans,
  ...antiKnight9,
  ...proKnight1,
];
