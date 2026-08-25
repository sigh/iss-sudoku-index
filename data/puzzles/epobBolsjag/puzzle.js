// Title: Nurikabe Killer
// Author: Akash Jain
// Video: https://www.youtube.com/watch?v=epobBolsjag
// Source: https://app.crackingthecryptic.com/sudoku/qPBhLFBjPh

// Rules encoded here:
//   * Normal sudoku.
//   * The grid splits into 9 white ("Nurikabe") areas, each anchored on one
//     of the 9 clue cells below (a clue cell is never shaded); every other
//     cell is either shaded or belongs to exactly one area, and no white
//     area may split into two pieces or merge with another.
//   * A clue cell's own solved digit gives its area's cell count; the number
//     printed in its corner gives the area's digit sum -- an exact total for
//     8 of the 9 clues, and only an upper bound (sum < 8) for R4C6, whose
//     corner reads "<8". (Both a size clue and a sum clue are stated for the
//     same cell; an area's digits are distinct 1-9 values, so its size can
//     never exceed 9 -- ruling out reading the corner total, up to 29 here,
//     as the size too. Digit = size, corner = sum.)
//   * Digits do not repeat within an area.
//   * Two different areas never share an edge (a point-touch is fine).
//   * Shaded cells form one orthogonally-connected region and never fill a
//     2x2 block (a bigger all-shaded rectangle would contain one).
//   * A "<" mark on the R4C4|R5C4 border: R4C4 < R5C4 (an ordinary digit
//     inequality between two adjacent cells, unrelated to the areas).
// Nothing omitted.

// Model: one Var per cell (widened alphabet) names the area that owns it,
// 1-9, or BLACK for a shaded cell. Each area's label is pinned at its own
// clue cell, so it needs no symmetry break. Two NFAs per area, scanning
// (label, digit) pairs over the whole grid, split the per-area checks so
// neither carries every field at once: one accumulates the digit set as a
// bitmask for the no-repeat and sum checks, the other -- scanning the clue
// cell first -- just counts the area's cells against the clue's own
// captured digit.

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const BLACK = 10;

// Clue cells, top-left-corner reading order (top-to-bottom, left-to-right).
// `sum` is the printed corner total; `sumBelow` is the one clue printed as
// an inequality ("<8") instead, giving only an exclusive upper bound.
const CLUES = [
  { cell: 'R1C7', sum: 6 },
  { cell: 'R2C3', sum: 10 },
  { cell: 'R3C2', sum: 17 },
  { cell: 'R3C5', sum: 22 },
  { cell: 'R3C9', sum: 10 },
  { cell: 'R4C6', sumBelow: 8 },
  { cell: 'R7C9', sum: 29 },
  { cell: 'R8C4', sum: 10 },
  { cell: 'R9C5', sum: 19 },
];
const labelOf = (i) => i + 1;

const shape = new Shape('9x9', BLACK);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shade = graph.makeOverlay('VS');

// Grid cells hold ordinary 1-9 digits; the widened range exists only to give
// the area-label overlay a BLACK code.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Every clue cell is pinned to its own area's label (never BLACK, never
// another area's label); every other cell keeps the full default domain
// (any area label, or BLACK), which is what lets the solver both shade it
// and choose which area a white cell belongs to.
const labelPins = CLUES.map(
  (clue, i) => new Given(shade.at(clue.cell), labelOf(i)));

// Each white area is one connected component, anchored at its own clue
// cell; the shaded cells form the tenth, unlabelled component.
const connectivity = [
  ...CLUES.map((_, i) => new ConnectedValues('VS', labelOf(i))),
  new ConnectedValues('VS', BLACK),
];

// No two different areas share an edge: an adjacent pair of cells must
// carry the same label, or one of them must be shaded. Every such pair is a
// shifted copy of one of two templates (a cell and its right neighbour, or a
// cell and its neighbour below), so each is one Replicate rather than 144
// hand-built Pairs.
const noTouchKey = Pair.fnToKey(
  (a, b) => a === b || a === BLACK || b === BLACK, geometry);
const origin = gridCells[0];
const noTouchTemplate = (neighbour) => new Pair(
  noTouchKey, 'no-touch-different-areas', ...shade.at([origin, neighbour]));
const noTouch = [
  shade.makeReplicate(
    noTouchTemplate(graph.step(origin, 0, 1)),
    shade.at(gridCells.filter(cell => graph.step(cell, 0, 1)))),
  shade.makeReplicate(
    noTouchTemplate(graph.step(origin, 1, 0)),
    shade.at(gridCells.filter(cell => graph.step(cell, 1, 0)))),
];

// No 2x2 block is entirely shaded: a small counting machine over each block
// rejects only once all 4 of its cells read BLACK.
const blockAllBlackMachine = NFA.encodeSpec({
  startState: { count: 0 },
  transition: (state, value) => {
    const count = state.count + (value === BLACK ? 1 : 0);
    return count === 4 ? undefined : { count };
  },
  accept: () => true,
}, geometry);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const no2x2Shaded = shade.makeReplicate(
  new NFA(blockAllBlackMachine, 'no-2x2-shaded',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// An area's digit sum (exact, or bounded for R4C6) and its no-repeat rule
// are both functions of the set of digits it holds, independent of which
// cell supplies the clue's own digit: one machine per area scans every grid
// cell as (label, digit) pairs and accumulates that set as a bitmask.
// `reading` is true while the next symbol is the digit belonging to the
// label just seen.
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const areaSums = CLUES.map((clue, i) => {
  const label = labelOf(i);
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inArea: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inArea: value === label };
      }
      if (!state.inArea) {
        return { mask: state.mask, reading: false, inArea: false };
      }
      // Grid cells never exceed 9; the wider alphabet is only for labels.
      if (value > DIGITS.length) return undefined;
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;  // digits do not repeat
      return { mask: state.mask | bit, reading: false, inArea: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const total = digitsOfMask(state.mask).reduce((a, b) => a + b, 0);
      return clue.sumBelow !== undefined
        ? total < clue.sumBelow
        : total === clue.sum;
    },
  }, geometry);
  return new NFA(machine, `area-${i + 1}-sum`,
    ...gridCells.flatMap(cell => [shade.at(cell), cell]));
});

// An area's cell count must equal its own clue cell's solved digit. One
// machine per area counts its cells; the clue cell's own (label, digit) pair
// is scanned first, so `first` marks it and `sizeDigit` records its digit
// (always set -- the clue cell is always pinned into its own area).
const areaSizes = CLUES.map((clue, i) => {
  const label = labelOf(i);
  const machine = NFA.encodeSpec({
    startState: { count: 0, sizeDigit: 0, reading: false, inArea: false, first: true },
    transition: (state, value) => {
      if (!state.reading) {
        return { ...state, reading: true, inArea: value === label };
      }
      if (!state.inArea) {
        return { ...state, reading: false, first: false };
      }
      if (value > DIGITS.length) return undefined;
      const count = state.count + 1;
      if (count > DIGITS.length) return undefined;
      return {
        count,
        sizeDigit: state.first ? value : state.sizeDigit,
        reading: false,
        inArea: false,
        first: false,
      };
    },
    accept: (state) => !state.reading && state.count === state.sizeDigit,
  }, geometry);
  const scanned = [clue.cell, ...gridCells.filter(cell => cell !== clue.cell)];
  return new NFA(machine, `area-${i + 1}-size`,
    ...scanned.flatMap(cell => [shade.at(cell), cell]));
});

// The drawn "<" mark straddles the R4C4|R5C4 border with its point -- the
// smaller side -- in R4C4.
const inequality = new GreaterThan('R5C4', 'R4C4');

return [
  shape,
  shade.toVar('shade'),
  digitDomain,
  ...labelPins,
  ...connectivity,
  ...noTouch,
  no2x2Shaded,
  ...areaSums,
  ...areaSizes,
  inequality,
];
