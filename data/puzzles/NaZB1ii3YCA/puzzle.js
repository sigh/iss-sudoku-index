// Title: The 12 Regions Of Christmas
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=NaZB1ii3YCA
// Source: https://sudokupad.app/laj1tzweyh

// Rules encoded here:
//   1. Normal sudoku.
//   2. Draw 12 orthogonally connected regions of different sizes which do not
//      overlap; they need not cover the whole grid.
//   3. Within a region a digit may only repeat if it appears on a gold ring, in
//      which case it can only appear on gold rings.
//   4. A digit on a gold ring indicates the number of gold rings in its region.
//   5. A digit on a pear tree equals the number of cells in its region.
//   6. The 3 digits on red baubles sum to 25.
// Rules 4 and 5 speak of "its region", so a gold ring and a pear tree are each
// required to lie inside one of the 12 regions. Red baubles carry no region
// rule and are left free to lie inside or outside a region.

// Model: one label per grid cell in the VL overlay. Labels 1..12 name the 12
// regions, label 13 (OUT) means "in no region". Region sizes live in the 12
// cells collected by SIZE_CELLS below.

const NUM_REGIONS = 12;
const OUT = NUM_REGIONS + 1;             // label 13: cell belongs to no region
// 12 distinct positive sizes summing to at most 81 cannot exceed 81 - (1+..+11)
// = 15, so 15 values carry labels (<= 13), sizes (<= 15) and digits (<= 9).
const NUM_VALUES = 15;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('9x9', NUM_VALUES);
const graph = cellGraph(shape);
const label = graph.makeOverlay('VL');
const gridCells = graph.cells();

// Drawn clues, read from the puzzle art. Gold rings are the gold-outlined
// circles; pear trees are the green-and-brown trees; red baubles are the red
// circles.
const GOLD_RINGS = [
  'R3C2', 'R3C4', 'R3C7', 'R4C3', 'R4C6', 'R6C3', 'R7C5', 'R7C6', 'R7C7',
];
const PEAR_TREES = [
  'R2C1', 'R2C2', 'R2C5', 'R2C9', 'R4C5', 'R5C9', 'R6C1', 'R7C3', 'R7C4',
];
const RED_BAUBLES = ['R5C7', 'R9C3', 'R9C7'];

const isGold = new Set(GOLD_RINGS);
const nonGoldCells = gridCells.filter(cell => !isGold.has(cell));

// The alphabet is widened to 15 for the label and size cells, so the playable
// grid is restricted back to 1-9.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));
// Labels only ever run 1..13.
const labelDomain = label.makeReplicate(
  new Given(label.at(gridCells[0]), ...Array.from(
    { length: OUT }, (unused, i) => i + 1)));

// Two pear trees in one region would both hold that region's size, i.e. the
// same digit twice on two cells that are not gold rings, which rule 3 forbids.
// So the nine pear trees lie in nine different regions, and the labels -- which
// are interchangeable names -- can be fixed by naming region i for the i-th
// pear tree in reading order. That leaves the three regions holding no pear
// tree as labels 10, 11 and 12, ordered canonically by the order in which they
// first appear (labelOrder below).
const pearAnchors = PEAR_TREES.map(
  (cell, i) => new Given(label.at(cell), i + 1));
// Rule 4 presupposes a gold ring has a region.
const goldInRegion = GOLD_RINGS.map(cell => new Given(
  label.at(cell),
  ...Array.from({ length: NUM_REGIONS }, (unused, i) => i + 1)));

// Each region is one orthogonally connected group; asserting all 12 also forces
// each label to be used, so exactly 12 regions are drawn. Label OUT carries no
// connectivity rule, which is what lets the regions miss part of the grid.
const connected = Array.from(
  { length: NUM_REGIONS }, (unused, i) => new ConnectedValues('VL', i + 1));

// Symmetry pin for the three pear-tree-free regions: label 10 must first appear
// before label 11, and 11 before 12, in reading order. State counts how many of
// the three have been introduced so far.
const labelOrderSpec = NFA.encodeSpec({
  startState: 0,
  transition: (introduced, value) => {
    // Labels 1-9 are pinned to pear trees and OUT is not a region.
    if (value <= PEAR_TREES.length || value === OUT) return introduced;
    const rank = value - PEAR_TREES.length;             // 10 -> 1, 11 -> 2, 12 -> 3
    if (rank <= introduced) return introduced;          // already introduced
    return rank === introduced + 1 ? rank : undefined;
  },
  accept: () => true,
}, shape);
const labelOrder = new NFA(
  labelOrderSpec, 'label order', label.at(gridCells));

// Region sizes. The size of region k is compared against a cell holding it:
// for regions 1-9 that is the pear tree itself (rule 5), for the three
// pear-tree-free regions it is a free variable.
const freeSizes = new Var('VS', 'unclued region size', 3);
const SIZE_CELLS = [
  ...PEAR_TREES,
  ...[1, 2, 3].map(i => freeSizes.cell(i)),
];

// Count how many grid cells carry label k, then compare with the size cell.
// `count` saturates one past the alphabet, where no size cell can match it.
const sizeSpec = k => NFA.encodeSpec({
  startState: { count: 0, counting: true },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return { count: state.count, counting: false };
    if (state.counting) {
      const hit = value === k ? 1 : 0;
      return { count: Math.min(state.count + hit, NUM_VALUES + 1), counting: true };
    }
    return value === state.count ? { count: state.count, matched: true } : undefined;
  },
  accept: state => state.matched === true,
}, shape, { multiSegment: true });
const regionSizes = SIZE_CELLS.map((sizeCell, i) => new NFA(
  sizeSpec(i + 1), `size of region ${i + 1}`,
  label.at(gridCells), [sizeCell]));

const differentSizes = new AllDifferent(...SIZE_CELLS);

// Rule 4: read the ring's own label, count the gold rings sharing it, then
// check the ring's digit against that count.
const goldLabelCells = label.at(GOLD_RINGS);
const goldCountSpec = NFA.encodeSpec({
  startState: { phase: 0, mine: 0, count: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      // Clamped: the machine has three segments, and an unbounded phase would
      // not compile.
      return { phase: Math.min(state.phase + 1, 2), mine: state.mine, count: state.count };
    }
    if (state.phase === 0) return { phase: 0, mine: value, count: 0 };
    if (state.phase === 1) {
      const hit = value === state.mine ? 1 : 0;
      // Saturate one past the largest digit, where no ring can match it.
      return { phase: 1, mine: state.mine, count: Math.min(state.count + hit, 10) };
    }
    return value === state.count
      ? { phase: 2, mine: state.mine, count: state.count, matched: true }
      : undefined;
  },
  accept: state => state.matched === true,
}, shape, { multiSegment: true });
const goldCounts = GOLD_RINGS.map(ring => new NFA(
  goldCountSpec, `gold rings in the region of ${ring}`,
  [label.at(ring)], goldLabelCells, [ring]));

// Rule 3, split per (region, digit). Let A be the number of cells of region k
// that hold digit v and are not gold rings, and B the number that are. The rule
// allows a repeat only when every copy sits on a gold ring, which is exactly
// A <= 1 and not (A >= 1 and B >= 1). The gold-ring cells are scanned first so
// B is settled before any A is counted. Each cell contributes its label then
// its digit, so `pending` holds whether the label just read was k.
const goldPairs = GOLD_RINGS.flatMap(cell => [label.at(cell), cell]);
const nonGoldPairs = nonGoldCells.flatMap(cell => [label.at(cell), cell]);
const repeatSpec = (k, v) => NFA.encodeSpec({
  startState: { pending: null, onGold: false, plain: 0, gold: true },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { pending: null, onGold: state.onGold, plain: state.plain, gold: false };
    }
    if (state.pending === null) {
      return { pending: value === k, onGold: state.onGold, plain: state.plain, gold: state.gold };
    }
    const hit = state.pending && value === v;
    if (!hit) {
      return { pending: null, onGold: state.onGold, plain: state.plain, gold: state.gold };
    }
    if (state.gold) {
      return { pending: null, onGold: true, plain: state.plain, gold: true };
    }
    // A second plain copy, or a plain copy alongside a gold-ring copy, is a
    // repeat that is not confined to gold rings.
    if (state.plain >= 1 || state.onGold) return undefined;
    return { pending: null, onGold: false, plain: 1, gold: false };
  },
  accept: () => true,
}, shape, { multiSegment: true });
const repeats = Array.from({ length: NUM_REGIONS }, (unused, i) => i + 1)
  .flatMap(k => DIGITS.map(v => new NFA(
    repeatSpec(k, v), `digit ${v} in region ${k}`, goldPairs, nonGoldPairs)));

const baubles = new Sum(25, ...RED_BAUBLES);

return [
  shape,
  digitDomain,
  label.toVar('region'),
  labelDomain,
  freeSizes,
  ...pearAnchors,
  ...goldInRegion,
  ...connected,
  labelOrder,
  ...regionSizes,
  differentSizes,
  ...goldCounts,
  ...repeats,
  baubles,
];
