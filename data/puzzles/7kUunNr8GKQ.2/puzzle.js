// Title: Star Battle (Puzzle 2)
// Author: Unknown
// Video: https://www.youtube.com/watch?v=7kUunNr8GKQ
// Source: http://pzv.jp/p.html?starbattle/9/9/2/19526c2rib0r8ago0e48h74h65b5l0

// No Sudoku digit layer at all: the source payload carries genre 'starbattle'
// / 'Star Battle', starCount 2, and no rules text of its own, so the standard
// two-star Star Battle ruleset applies -- confirmed by the video description,
// which states it directly: "Fit in two stars in each row, column and marked
// shape; no star can touch another, even diagonally." Place stars in some
// cells so that:
//   (1) every row, every column, and every one of the 9 marked regions holds
//       exactly two stars;
//   (2) no two stars share an edge or a corner (king-move adjacency).
// There are no givens: the payload marks every cell unfilled.
//
// Modelled as a 2-valued Raw grid (EMPTY / STAR): no Sudoku digit range, no
// row/column/box all-different -- every rule below is stated explicitly.

const EMPTY = 1, STAR = 2;

const shape = new Shape('9x9', 2, 'Raw');
const graph = cellGraph(shape);

// The 9 marked regions, transcribed from the source's own `regionGrid` (one
// letter A-I per cell, row-major; matches the payload's `regions` cell-list
// array cell-for-cell).
const REGION_GRID = [
  'AAAAABBCC',
  'DDAAABBCC',
  'DDDBBBBCB',
  'DDDEBBBBB',
  'DDEEBFFGB',
  'DEEEFFFGG',
  'DEFFFFFFG',
  'HEEFIIFFF',
  'HHHFFIIFF',
];
const regionCells = new Map();
REGION_GRID.forEach((rowStr, rowIdx) => {
  [...rowStr].forEach((letter, colIdx) => {
    const cell = makeCellId(rowIdx + 1, colIdx + 1);
    (regionCells.get(letter) ?? regionCells.set(letter, []).get(letter)).push(cell);
  });
});

// Exactly two stars per row, column and marked region.
const starRows = graph.rows().map(row => new ContainExact(`${STAR}_${STAR}`, ...row));
const starCols = graph.columns().map(col => new ContainExact(`${STAR}_${STAR}`, ...col));
const starRegions = [...regionCells.values()].map(
  cells => new ContainExact(`${STAR}_${STAR}`, ...cells));

// No two stars share an edge or a corner: one Pair template per king
// direction, replicated over every in-grid origin for that offset, so each
// king-move edge of the grid is covered exactly once.
const noStarTouchKey = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), 2);
const KING_TEMPLATE_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const starNoTouch = KING_TEMPLATE_OFFSETS.map(([dr, dc]) => {
  const targets = graph.cells().filter(cell => graph.step(cell, dr, dc) !== null);
  const origin = targets[0];
  const template = graph.step(origin, dr, dc);
  return new Replicate(
    [new Pair(noStarTouchKey, 'star-no-touch', origin, template)],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

return [
  shape,
  ...starRows,
  ...starCols,
  ...starRegions,
  ...starNoTouch,
];
