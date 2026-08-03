// Title: Rika's Endless Summer
// Author: SUDOOOOOKUfan87
// Video: https://www.youtube.com/watch?v=7f9Ebmslh5c
// Source: https://app.crackingthecryptic.com/sudoku/3QPdQd6Grn

// Rules encoded here:
//   * Normal sudoku.
//   * Every cell is island or water. Each island is an orthogonally-connected
//     group of island cells containing exactly one shaded (totalled) cell;
//     the printed total equals the sum of the *distinct* digit values the
//     island's cells hold (repeats within the island collapse to one entry
//     before summing -- the rule's "set of non-repeating digits").
//   * Different islands may not touch each other orthogonally.
//   * Water cells (every non-island cell) form one connected region, and no
//     2x2 area is all water.
// Nothing is omitted. ("Island totals are not necessarily in the top left
// most cell" is a UI note about where the total is drawn, not an extra
// constraint -- each totalled cell is already the whole clue, at its own
// drawn position.)
//
// Model: one Var per grid cell holds the label of the island owning it, or a
// dedicated water label. Each of the eleven totalled cells is Given its own
// label, which both pins that cell into its own island and breaks the
// label-permutation symmetry -- no ordering choice is being made. Every other
// cell's label is a free choice among all eleven island labels or water.

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Transcribed from the single-cell `cages` entries, each confirmed shaded by
// a matching grey underlay drawn at the same cell.
const ISLANDS = [
  { cell: 'R1C2', total: 20 },
  { cell: 'R2C3', total: 8 },
  { cell: 'R2C7', total: 8 },
  { cell: 'R1C5', total: 20 },
  { cell: 'R4C1', total: 8 },
  { cell: 'R5C6', total: 8 },
  { cell: 'R6C9', total: 24 },
  { cell: 'R9C9', total: 24 },
  { cell: 'R7C6', total: 20 },
  { cell: 'R8C3', total: 8 },
  { cell: 'R9C2', total: 8 },
];
const WATER = ISLANDS.length + 1;       // 12: the dedicated water label
const LABEL_COUNT = WATER;              // widened Shape range: 11 islands + water

const shape = new Shape('9x9', LABEL_COUNT);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Grid cells hold digits; the widened value range exists only for labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

const label = graph.makeOverlay('VI');

// Pin each totalled cell to its own island's label (1-indexed by ISLANDS
// order). Every other cell keeps the overlay's default full 1..LABEL_COUNT
// domain: any island label, or water.
const anchors = ISLANDS.map((island, i) => new Given(label.at(island.cell), i + 1));

// Each island label forms exactly one connected region (non-empty, since its
// own totalled cell already carries that label); likewise the water label.
const connectivity = [
  ...ISLANDS.map((_, i) => new ConnectedValues('VI', i + 1)),
  new ConnectedValues('VI', WATER),
];

// Different islands may not touch orthogonally: for every grid edge, the two
// labels must agree unless at least one side is water. All horizontal edges
// are one shifted template, all vertical edges another, so each direction is
// a single Replicate rather than one Pair per edge.
const touchKey = Pair.fnToKey(
  (a, b) => a === b || a === WATER || b === WATER, LABEL_COUNT);
const rightTouch = label.makeReplicate(
  new Pair(touchKey, 'islands-dont-touch', ...label.at(graph.block(gridCells[0], 1, 2))),
  label.at(gridCells.filter(cell => graph.block(cell, 1, 2))));
const downTouch = label.makeReplicate(
  new Pair(touchKey, 'islands-dont-touch', ...label.at(graph.block(gridCells[0], 2, 1))),
  label.at(gridCells.filter(cell => graph.block(cell, 2, 1))));

// No 2x2 area of all water: a 4-symbol scan counting water labels, rejecting
// only when every one of the four is water.
const noQuadWaterMachine = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => count + (value === WATER ? 1 : 0),
  accept: (count) => count < 4,
  maxDepth: 4,   // always applied to exactly 4 cells (one 2x2 block)
}, LABEL_COUNT);
const quadOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noQuadWater = label.makeReplicate(
  new NFA(noQuadWaterMachine, 'no-2x2-water',
    ...label.at(graph.block(gridCells[0], 2, 2))),
  label.at(quadOrigins));

// Per island: scan every (label, digit) pair in grid order, accumulating a
// bitmask of the digit values seen while the label matches this island, then
// check the mask's digit sum against the printed total. Digits may repeat
// within the island -- the mask absorbs a repeat for free -- so nothing
// rejects a repeat; only the summed distinct set is checked.
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const islandTotals = ISLANDS.map((island, i) => {
  const own = i + 1;
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inIsland: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inIsland: value === own };
      }
      if (!state.inIsland) {
        return { mask: state.mask, reading: false, inIsland: false };
      }
      // Grid cells never exceed 9; the wider alphabet is only for labels.
      if (value > DIGITS.length) return undefined;
      return { mask: state.mask | (1 << (value - 1)), reading: false, inIsland: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const sum = digitsOfMask(state.mask).reduce((a, b) => a + b, 0);
      return sum === island.total;
    },
  }, geometry);
  return new NFA(machine, `island-${own}-total`,
    ...gridCells.flatMap(cell => [label.at(cell), cell]));
});

return [
  shape,
  label.toVar('island'),
  digitDomain,
  ...anchors,
  ...connectivity,
  rightTouch,
  downTouch,
  noQuadWater,
  ...islandTotals,
];
