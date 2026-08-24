// Title: X-Cages
// Author: AFrayedKnot
// Video: https://www.youtube.com/watch?v=yPre64PZCBQ
// Source: https://app.crackingthecryptic.com/sudoku/PRmP9dLgBM

// Rules encoded here:
//   * Normal sudoku.
//   * 17 single-cell markers, each printing a small total. The marked cell (the
//     "anchor") belongs to its own region: an orthogonally connected set of
//     cells, discovered by the solver, whose size equals the digit placed in
//     the anchor cell, whose digits sum to the printed total, and whose digits
//     are all different. Regions may not overlap. A cell with no marker need
//     not belong to any region.
// Nothing is omitted.
//
// Model: one label per anchor, held in a per-cell Var overlay ("which region,
// if any, does this cell belong to"). 17 labels plus a not-in-this-layer/
// no-region marker exceeds a single overlay's value cap, so the labels split
// across two overlays (VA: 9 labels, VB: 8 labels), each cell carrying one
// value per overlay plus that overlay's own OTHER marker, tied together by a
// Pair so a cell is "labelled" on exactly one overlay. Per region:
//   - a Given pins the anchor cell to its own label (the region is *this*
//     cell's own region, not a differently-clued cell's);
//   - ConnectedValues makes that label's cells one connected component;
//   - a bounded-counting NFA ties the region's cell count to the digit
//     actually placed at the anchor cell;
//   - a seen-digit-mask NFA checks the region's digits sum to the printed
//     total and never repeat.
// Each label's candidate zone is bounded to cells within Manhattan distance
// (max feasible region size - 1) of the anchor: a connected region of m cells
// cannot reach further than m-1 steps from any one of its own cells.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Transcribed from the drawn corner totals, one per marked cell.
const ANCHORS = [
  { cell: 'R1C1', total: 10 },
  { cell: 'R1C2', total: 29 },
  { cell: 'R2C2', total: 43 },
  { cell: 'R3C3', total: 11 },
  { cell: 'R5C1', total: 15 },
  { cell: 'R6C2', total: 21 },
  { cell: 'R5C4', total: 28 },
  { cell: 'R9C2', total: 27 },
  { cell: 'R9C3', total: 20 },
  { cell: 'R7C4', total: 21 },
  { cell: 'R9C6', total: 39 },
  { cell: 'R9C7', total: 28 },
  { cell: 'R9C8', total: 10 },
  { cell: 'R5C7', total: 10 },
  { cell: 'R3C7', total: 26 },
  { cell: 'R2C9', total: 7 },
  { cell: 'R1C9', total: 12 },
];

// Split point: the first 9 anchors label overlay VA (values 1-9, no room for a
// tenth value alongside the OTHER marker), the remaining 8 label overlay VB
// (values 1-8, plus OTHER and NONE). Both overlays then fit in a widened
// value range of 10 -- comfortably under the 16-value overlay cap.
const SPLIT = 9;
const OTHER_A = 10;
const OTHER_B = 9;
const NONE_B = 10;
const NUM_VALUES = 10;

const layerOf = (i) => (i < SPLIT ? 'A' : 'B');
const labelOf = (i) => (i < SPLIT ? i + 1 : i - SPLIT + 1);

// Cell counts a region can have: with n distinct digits its sum lies between
// 1+..+n and 9+..+(10-n); the printed total fixes that sum.
const feasibleSizes = (total) => DIGITS.filter(
  (n) => total >= (n * (n + 1)) / 2 && total <= (n * (19 - n)) / 2);

const shape = new Shape(GRID, NUM_VALUES);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const overlayA = graph.makeOverlay('VA');
const overlayB = graph.makeOverlay('VB');
const overlayOf = (i) => (layerOf(i) === 'A' ? overlayA : overlayB);

// Grid cells hold digits; the widened value range exists only for the labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Manhattan distance in cell units.
const manhattan = (a, b) => {
  const pa = parseCellId(a);
  const pb = parseCellId(b);
  return Math.abs(pa.row - pb.row) + Math.abs(pa.col - pb.col);
};

const regions = ANCHORS.map((anchor, i) => {
  const sizes = feasibleSizes(anchor.total);
  const limit = Math.max(...sizes) - 1;
  const zone = gridCells.filter((cell) => manhattan(cell, anchor.cell) <= limit);
  return { ...anchor, index: i, layer: layerOf(i), label: labelOf(i), sizes, zone };
});

// Each cell's domain on each overlay: OTHER_X (and, on B, NONE) plus every
// region label on that overlay whose zone reaches the cell.
const layerDomains = ['A', 'B'].flatMap((layer) => {
  const other = layer === 'A' ? OTHER_A : OTHER_B;
  const base = layer === 'A' ? [other] : [other, NONE_B];
  const overlay = layer === 'A' ? overlayA : overlayB;
  return gridCells.map((cell) => new Given(
    overlay.at(cell),
    ...base,
    ...regions.filter((r) => r.layer === layer && r.zone.includes(cell))
      .map((r) => r.label)));
});

// A cell is labelled on exactly one overlay: OTHER_A holds (label lives on B,
// or the cell is in no region at all) iff OTHER_B does not (a real label on B
// is present). A real label on A forces OTHER_B; no region at all forces
// OTHER_A paired with the genuine NONE_B.
const layerConsistencyKey = Pair.fnToKey(
  (a, b) => (a === OTHER_A) !== (b === OTHER_B), geometry);
const layerConsistency = gridCells.map((cell) => new Pair(
  layerConsistencyKey, 'layer-consistency', overlayA.at(cell), overlayB.at(cell)));

// Anchor pins: the region is *this* cell's own region.
const anchorPins = regions.map((r) => new Given(overlayOf(r.index).at(r.cell), r.label));

// Connectivity: each region's cells (whichever overlay holds its label) form
// one connected component. The anchor pin above already forces a non-empty
// value, which ConnectedValues requires.
const connectivity = regions.map((r) => new ConnectedValues(
  r.layer === 'A' ? 'VA' : 'VB', r.label));

// Region size = the digit placed at the anchor cell. Bounded-counting NFA:
// the origin segment reads the anchor's own digit as `target`; the zone
// segment counts how many of its cells carry this region's label, clamped
// at target + 1 so the state stays finite.
const sizeChecks = regions.map((r) => {
  const overlay = overlayOf(r.index);
  const spec = NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (value === SEGMENT_BREAK) return { target, count: 0 };
      if (target === null) return { target: value, count: 0 };
      const hit = value === r.label ? 1 : 0;
      return { target, count: Math.min(count + hit, target + 1) };
    },
    accept: ({ target, count }) => target !== null && count === target,
  }, geometry, { multiSegment: true });
  return new NFA(spec, `region-${r.index}-size`, [r.cell], overlay.at(r.zone));
});

// Region contents = printed total, no repeats. One mask-accumulating NFA per
// region: scan the zone as interleaved (label, digit) pairs, track the set of
// digits seen while the label matches this region, reject a repeat outright,
// and check the accumulated sum against the total once the scan ends.
const digitsOfMask = (mask) => DIGITS.filter((d) => mask & (1 << (d - 1)));
const contentChecks = regions.map((r) => {
  const overlay = overlayOf(r.index);
  const spec = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inRegion: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inRegion: value === r.label };
      }
      if (!state.inRegion) return { mask: state.mask, reading: false, inRegion: false };
      // Grid cells never exceed 9; the wider alphabet is only for labels.
      if (value > DIGITS.length) return undefined;
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined; // digits do not repeat
      return { mask: state.mask | bit, reading: false, inRegion: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const digits = digitsOfMask(state.mask);
      if (!digits.length) return false;
      const sum = digits.reduce((a, b) => a + b, 0);
      return sum === r.total;
    },
  }, geometry);
  return new NFA(spec, `region-${r.index}-contents`,
    ...r.zone.flatMap((cell) => [overlay.at(cell), cell]));
});

return [
  shape,
  overlayA.toVar('regionA'),
  overlayB.toVar('regionB'),
  digitDomain,
  ...layerDomains,
  ...layerConsistency,
  ...anchorPins,
  ...connectivity,
  ...sizeChecks,
  ...contentChecks,
];
