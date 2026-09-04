// Title: Build Your Own Star Battle
// Author: Jack Lance
// Video: https://www.youtube.com/watch?v=S9EhMpVOpeQ
// Source: https://app.crackingthecryptic.com/sudoku/F8NB27tqQ7

// Star Battle. Rules: place 2 stars in each row, each column and each region;
// stars cannot touch, even diagonally. Unlike an ordinary Star Battle, no
// region is drawn: the solver must discover the whole 10-region partition,
// using only the handful of region-border segments the source does draw.
// Nothing is omitted.
//
// No digit layer at all -- the grid cell's own value stands for the star
// directly: 1 marks a star, 0 marks an empty cell. The Shape is widened to
// 0-9 so a second, separate overlay (below) can hold ten distinct region
// labels; grid cells are then restricted back to 0-1, and Raw drops every
// implicit rule (no automatic row/column all-different, which a 0/1 alphabet
// could not satisfy over 10 cells anyway -- rows and columns are stated
// explicitly, as a plain Sum(2, ...)).
//
// Region count and size: a 2-star Star Battle's regions are, by the genre's
// own convention, as many as the grid has rows and the same size as a row --
// 10 regions of 10 cells each here. That convention is what fixes the shape
// of the search, not any solved layout; the partition itself is still fully
// free subject to it.
//
// Discovering the partition: one region-label overlay (VS, values 0-9) pairs
// 1:1 with the grid. A label's cells must be a single connected 10-cell
// region (ConnectedValues), and the ten labels are otherwise interchangeable,
// which multiplies every real solution by 10! -- broken by a canonical-order
// NFA requiring label k to first appear (row-major) before label k+1.
// Each of the few drawn region-border segments forces its two cells to
// different labels; nothing else pins the partition.
//
// Region star count: "2 stars per region" is a predicate over an unknown
// region's own cells, so it is one NFA per label scanning the whole board as
// [label, star, label, star, ...], counting cells with that label whose star
// is 1 and accepting when the count is exactly 2.

const shape = new Shape('10x10', '0-9', 'Raw');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const STAR = 1;
const NO_STAR = 0;
const NUM_REGIONS = 10;
const REGION_SIZE = 10;

// Every grid cell is a star flag; nothing else is on the base grid.
const starDomain = graph.makeReplicate(new Given(gridCells[0], NO_STAR, STAR));

// One region-label overlay, full 0-9 range, paired 1:1 with the grid.
const labels = graph.makeOverlay('VS');

// Region borders already drawn, transcribed as the cell pairs they separate
// (edge-path segments along cell borders, source-drawn, black/thick):
// R1C1|R2C1, R1C2|R1C3, R1C4|R1C5, R1C5|R1C6, R1C6|R1C7, R1C7|R1C8,
// R2C10|R3C10, R3C1|R4C1, R4C1|R5C1, R5C1|R6C1, R6C1|R7C1, R10C1|R10C2,
// R10C2|R10C3, R10C3|R10C4, R10C4|R10C5, R10C5|R10C6, R10C7|R10C8,
// R10C8|R10C9.
const cell = (r, c) => makeCellId(r, c);
const WALL_PAIRS = [
  [cell(1, 1), cell(2, 1)],
  [cell(1, 2), cell(1, 3)],
  [cell(1, 4), cell(1, 5)],
  [cell(1, 5), cell(1, 6)],
  [cell(1, 6), cell(1, 7)],
  [cell(1, 7), cell(1, 8)],
  [cell(2, 10), cell(3, 10)],
  [cell(3, 1), cell(4, 1)],
  [cell(4, 1), cell(5, 1)],
  [cell(5, 1), cell(6, 1)],
  [cell(6, 1), cell(7, 1)],
  [cell(10, 1), cell(10, 2)],
  [cell(10, 2), cell(10, 3)],
  [cell(10, 3), cell(10, 4)],
  [cell(10, 4), cell(10, 5)],
  [cell(10, 5), cell(10, 6)],
  [cell(10, 7), cell(10, 8)],
  [cell(10, 8), cell(10, 9)],
];
const givenBorders = WALL_PAIRS.map(([a, b]) =>
  new AllDifferent(labels.at(a), labels.at(b)));

// Each label is one connected 10-cell region; together the ten labels
// necessarily partition the whole grid.
const connectivity = [];
for (let k = 0; k < NUM_REGIONS; k++) {
  connectivity.push(new ConnectedValues('VS', k, REGION_SIZE));
}

// Canonical label order: label k must first appear (row-major) before label
// k+1, which picks one representative out of the 10! interchangeable
// labelings of the same partition.
const canonicalOrderMachine = NFA.encodeSpec({
  startState: { next: 0 },
  transition: ({ next }, label) => {
    if (label > next) return undefined;
    if (label === next) return { next: next + 1 };
    return { next };
  },
  accept: ({ next }) => next === NUM_REGIONS,
}, shape);
const canonicalOrder = new NFA(
  canonicalOrderMachine, 'canonical region order', ...labels.cells());

// Exactly 2 stars in each discovered region: one NFA per label, scanning the
// whole board as [label, star, label, star, ...] and counting stars seen
// while that cell's label equals k.
const scanCells = gridCells.flatMap(c => [labels.at(c), c]);
const regionStarCountMachine = (k) => NFA.encodeSpec({
  startState: { expectLabel: true, pendingIsK: false, count: 0 },
  transition: (state, value) => {
    if (state.expectLabel) {
      return { expectLabel: false, pendingIsK: value === k, count: state.count };
    }
    const hit = (state.pendingIsK && value === STAR) ? 1 : 0;
    return { expectLabel: true, pendingIsK: false, count: Math.min(state.count + hit, 3) };
  },
  accept: (state) => state.expectLabel && state.count === 2,
}, shape);
const regionStarCounts = [];
for (let k = 0; k < NUM_REGIONS; k++) {
  regionStarCounts.push(
    new NFA(regionStarCountMachine(k), 'region star count', ...scanCells));
}

// Exactly 2 stars in each row and column: fixed houses, so a plain Sum.
const houses = [...graph.rows(), ...graph.columns()];
const houseStarCounts = houses.map(house => new Sum(2, ...house));

// Stars cannot touch, even diagonally (king-move no-touch), one template per
// direction replicated over every such adjacent pair.
const notBothStarred = Pair.fnToKey((a, b) => a === NO_STAR || b === NO_STAR, shape);
const TOUCHING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const noTouchPairs = TOUCHING_OFFSETS.map(([dr, dc]) => {
  const origins = graph.cells().filter(c => graph.step(c, dr, dc));
  const anchor = origins[0];
  const template = new Pair(
    notBothStarred, 'stars do not touch',
    anchor, graph.step(anchor, dr, dc));
  return new Replicate(
    [template],
    Replicate.encodeTargetCells(origins, anchor, graph),
    anchor);
});

return [
  shape,
  starDomain,
  labels.toVar('region labels'),
  ...givenBorders,
  ...connectivity,
  canonicalOrder,
  ...regionStarCounts,
  ...houseStarCounts,
  ...noTouchPairs,
];
