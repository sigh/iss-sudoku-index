// Title: Crux
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=KJZlrqKGMb8
// Source: https://app.crackingthecryptic.com/sudoku/r89wh6qj90

// Rules encoded here:
//   1. Normal sudoku.
//   2. The grid is divided entirely into '15-clumps': non-overlapping
//      orthogonally connected groups of cells, each with no repeated digit and
//      summing to 15.
//   3. An arrow's digit is the number of 15-clumps seen along the arrow's
//      direction. The arrow's own cell is not counted, but its clump is counted
//      when another of its cells lies in that direction. Two arrows in one cell
//      are independent clues.
// Nothing is omitted.
//
// The whole grid sums to 405 = 27 * 15, so the partition has exactly 27 clumps.
// Each clump is named by a label 1..27 carried on a per-cell overlay. ISS values
// stop at 16, so the labels are split: labels 1..15 are VA codes 2..16, labels
// 16..27 are VB codes 2..13, and code 1 means "this overlay is not the one
// naming me". Every cell activates exactly one of the two overlays.

const CLUMP_TOTAL = 15;
const CLUMP_COUNT = 27;      // 405 / 15
const VALUE_COUNT = 16;      // widened alphabet, for the label codes
const DIGIT_MAX = 9;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const INACTIVE = 1;
const A_LABELS = 15;         // labels 1..15 live in VA
const B_MAX_CODE = CLUMP_COUNT - A_LABELS + 1;   // 13

// Label <-> overlay code, in both directions.
const labelOf = (a, b) => (a > INACTIVE ? a - 1 : b - 1 + A_LABELS);
const codeA = (label) => (label <= A_LABELS ? label + 1 : INACTIVE);
const codeB = (label) => (label <= A_LABELS ? INACTIVE : label - A_LABELS + 1);

// Sum of the digits held in a bit set of digits (bit d-1 means digit d).
const maskSum = (mask) => DIGITS.reduce(
  (sum, d) => sum + ((mask >> (d - 1)) & 1 ? d : 0), 0);

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');

// The 19 arrow glyphs, each drawn inside its own cell: cell, then the row/column
// step the arrowhead points along.
const ARROWS = [
  ['R1C5', 0, -1], ['R1C5', 1, 0], ['R1C7', 0, 1], ['R2C3', 1, 0],
  ['R3C3', 0, 1], ['R4C3', -1, 0], ['R4C4', 0, 1], ['R5C1', -1, 0],
  ['R5C1', 0, 1], ['R5C7', 0, 1], ['R5C9', 0, -1], ['R5C9', 1, 0],
  ['R7C7', 0, -1], ['R8C5', -1, 0], ['R8C5', 0, 1], ['R9C1', -1, 0],
  ['R9C3', 0, 1], ['R9C5', 0, -1], ['R9C8', -1, 0],
];
// What the arrow sees: its ray to the grid edge, minus its own cell.
const rays = ARROWS.map(([cell, dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1));

// One clump: scanning (label cell, grid cell) pairs over the whole grid, the
// digits of the cells carrying this label must be distinct and total 15. `mask`
// is the set of digits taken so far; a repeat or an overshoot is a dead branch.
const clumpMachine = (code) => NFA.encodeSpec({
  startState: { stage: 'label', mask: 0 },
  transition: ({ stage, mask, member }, value) => {
    if (stage === 'label') return { stage: 'digit', mask, member: value === code };
    if (!member) return { stage: 'label', mask };
    if (value > DIGIT_MAX) return undefined;
    const bit = 1 << (value - 1);
    if (mask & bit) return undefined;
    const next = mask | bit;
    if (maskSum(next) > CLUMP_TOTAL) return undefined;
    return { stage: 'label', mask: next };
  },
  accept: ({ stage, mask }) => stage === 'label' && maskSum(mask) === CLUMP_TOTAL,
  maxDepth: 2 * 81,
}, VALUE_COUNT);

// Which of the 27 labels names which clump is an artifact of this encoding, so
// the labels are pinned to one representative: scanning (VA, VB) row-major, a
// label may exceed every earlier label by at most one, so label k first appears
// before label k+1. `max` is the largest label used so far; all 27 must be used.
const canonicalLabelsMachine = NFA.encodeSpec({
  startState: { stage: 'a', max: 0 },
  transition: ({ stage, max }, value) => {
    if (value === INACTIVE) return { stage: stage === 'a' ? 'b' : 'a', max };
    if (stage === 'b' && value > B_MAX_CODE) return undefined;
    const label = stage === 'a' ? value - 1 : value - 1 + A_LABELS;
    if (label > max + 1) return undefined;
    return { stage: stage === 'a' ? 'b' : 'a', max: Math.max(max, label) };
  },
  accept: ({ stage, max }) => stage === 'a' && max === CLUMP_COUNT,
  maxDepth: 2 * 81,
}, VALUE_COUNT);

// Is a ray cell the first sighting of its clump? The scan reads the flag, then
// that cell's own (VA, VB) pair, then the (VA, VB) pairs of the ray cells before
// it. Two cells share a clump when both overlay codes agree. NEW must reach the
// end with no agreement found; REPEAT must find one.
const NEW = 1;
const REPEAT = 2;
const MAX_RAY = 8;
const firstSightMachine = NFA.encodeSpec({
  startState: { stage: 'flag' },
  transition: (state, value) => {
    const { stage, isNew, label } = state;
    if (stage === 'flag') {
      if (value !== NEW && value !== REPEAT) return undefined;
      return { stage: 'a', isNew: value === NEW };
    }
    if (stage === 'a') return { stage: 'b', isNew, a: value };
    if (stage === 'b') {
      // Exactly one overlay names this cell's clump, and a VB code is in range.
      if ((state.a === INACTIVE) === (value === INACTIVE)) return undefined;
      if (value > B_MAX_CODE) return undefined;
      return { stage: 'scanA', isNew, label: labelOf(state.a, value) };
    }
    if (stage === 'scanA') {
      return { stage: 'scanB', isNew, label, aMatch: value === codeA(label) };
    }
    if (stage === 'scanB') {
      if (!(state.aMatch && value === codeB(label))) return { stage: 'scanA', isNew, label };
      return isNew ? undefined : { stage: 'matched' };
    }
    return { stage: 'matched' };
  },
  accept: ({ stage, isNew }) => stage === 'matched' || (stage === 'scanA' && isNew),
  maxDepth: 3 + 2 * (MAX_RAY - 1),
}, VALUE_COUNT);

// The first ray cell always sights a new clump, so it needs no flag; ray cell
// index+1 carries flag `index`. Each flag is the first cell of its own machine
// above, which is what holds it to {REPEAT, NEW}.
const flagCount = rays.reduce((total, ray) => total + ray.length - 1, 0);
const flags = new Var('F', 'first sighting along each arrow ray', flagCount);
let flagBase = 0;
const flagRows = rays.map((ray) => {
  const row = flags.cells().slice(flagBase, flagBase + ray.length - 1);
  flagBase += ray.length - 1;
  return row;
});

const firstSights = flagRows.flatMap((row, arrowIndex) => row.map(
  (flag, offset) => {
    const index = offset + 1;
    const ray = rays[arrowIndex];
    return new NFA(firstSightMachine, 'first sighting', flag,
      va.at(ray[index]), vb.at(ray[index]),
      ...ray.slice(0, index).flatMap(cell => [va.at(cell), vb.at(cell)]));
  }));

// The arrow's digit counts the sightings: the unflagged first ray cell plus the
// flags set to NEW. Over a ray of m cells the m-1 flags total (m-1) + (repeats),
// and the digit is m - (repeats), so the flags and the digit total 2m - 1.
const arrowCounts = ARROWS.map(([cell], arrowIndex) => new Sum(
  2 * rays[arrowIndex].length - 1, ...flagRows[arrowIndex], cell));

// A cell is named by exactly one overlay.
const oneOverlayKey = Pair.fnToKey(
  (a, b) => (a === INACTIVE) !== (b === INACTIVE), VALUE_COUNT);
const oneOverlay = gridCells.map(cell => new Pair(
  oneOverlayKey, 'one clump label per cell', va.at(cell), vb.at(cell)));

const labels = Array.from({ length: CLUMP_COUNT }, (_, i) => i + 1);
const clumps = labels.flatMap((label) => {
  const inA = label <= A_LABELS;
  const overlay = inA ? va : vb;
  const code = inA ? codeA(label) : codeB(label);
  return [
    new ConnectedValues(inA ? 'VA' : 'VB', code),
    new NFA(clumpMachine(code), '15-clump', ...gridCells.flatMap(
      cell => [overlay.at(cell), cell])),
  ];
});

return [
  new Shape('9x9', VALUE_COUNT),
  graph.makeReplicate(new Given(gridCells[0], ...DIGITS)),
  va.toVar('clump labels 1-15'),
  vb.toVar('clump labels 16-27'),
  vb.makeReplicate(new Given(vb.cells()[0], ...Array.from(
    { length: B_MAX_CODE }, (_, i) => i + 1))),
  flags,
  ...oneOverlay,
  new NFA(canonicalLabelsMachine, 'canonical clump labels',
    ...gridCells.flatMap(cell => [va.at(cell), vb.at(cell)])),
  ...clumps,
  ...firstSights,
  ...arrowCounts,
];
