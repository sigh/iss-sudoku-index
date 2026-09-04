// Title: Yin-Yang-Yong
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=G-rK3UG-Kc8
// Source: https://sudokupad.app/k4g3ubb8qe

// Rules encoded: Somedoku (row n / column n hold exactly n unique digits, the
// rest repeats -- so this is a Raw grid: no default row/column/box
// all-different); Yin-Yang-Yong (divide the grid into three orthogonally
// connected regions, no 2x2 area entirely one region, identical digits never
// split across regions); German Whisper (green, difference >= 5); Nabner
// (yellow, no two cells anywhere on the line -- not just adjacent -- hold
// equal or consecutive digits); Entropic (orange, every 3 consecutive cells
// hold one low/mid/high digit); Same Difference (turquoise, adjacent cells
// share one common difference, undetermined per line); X (adjacent digits
// sum to 10); Blue Arrow (the arrow cell's own digit counts the region
// borders crossed looking along the arrow to the grid edge).

const shape = new Shape('9x9', '1-9', 'Raw');
const graph = cellGraph(shape);

// ---------------------------------------------------------------------------
// Yin-Yang-Yong: an unknown 3-region partition, one label (1/2/3) per cell.
// ---------------------------------------------------------------------------
const A = 1, B = 2, C = 3;
const region = graph.makeOverlay('VRG');
const regionDomain = region.makeReplicate(
  new Given(region.cells()[0], A, B, C));

// Each region is one non-empty orthogonally-connected area; the three labels
// share one layer, so asserting connectivity for each label also makes them
// mutually disjoint (a cell can only hold one label value).
const regionConnectivity = [
  new ConnectedValues('VRG', A),
  new ConnectedValues('VRG', B),
  new ConnectedValues('VRG', C),
];

// No 2x2 block is a single region: scan each block's 4 labels and accept as
// soon as one differs from the first.
const noMono2x2Spec = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, shape);
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = region.makeReplicate(
  new NFA(noMono2x2Spec, 'no-mono-2x2', ...region.at(graph.block(graph.cells()[0], 2, 2))),
  region.at(blockOrigins));

// Canonical labelling: the rules never name a region, so swapping labels
// 1/2/3 throughout the grid describes the same physical partition -- pin one
// representative labelling per partition. Scanning the whole grid in
// row-major order, reject a label appearing for the first time out of order
// (e.g. a 3 before any 2 has been seen): this forces label k's first
// occurrence to precede label k+1's, which has exactly one satisfying
// relabelling per partition.
const canonicalLabelSpec = NFA.encodeSpec({
  startState: { maxSeen: 0 },
  transition: ({ maxSeen }, value) => {
    if (value <= maxSeen) return { maxSeen };
    if (value === maxSeen + 1) return { maxSeen: value };
    return undefined;
  },
  accept: () => true,
}, shape);
const canonicalLabel = new NFA(
  canonicalLabelSpec, 'canonical region labelling', ...region.at(graph.cells()));

// ---------------------------------------------------------------------------
// Identical digits may not appear in different regions: a digit's region is
// the same wherever it occurs, so give each digit value 1-9 its own "home
// region" Var (RD1..RD9), then check every cell's own region against its own
// digit's home region.
// ---------------------------------------------------------------------------
const digitHomeRegion = new Var('RD', 'digit home region', 9);
const digitHomeRegionDomain = digitHomeRegion.cells().map(
  cell => new Given(cell, A, B, C));

// Reads [digit, region] for one cell, then scans the 9 RD cells in order
// (position 1..9); once the position equals the cell's own digit, the RD
// value read there must equal the cell's own region -- after that the
// remaining RD cells are irrelevant and any value is accepted.
const digitRegionLookupSpec = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'region', digit: value };
    if (state.phase === 'region') return { phase: 'scan', digit: state.digit, region: value, pos: 1 };
    if (state.phase === 'scan') {
      if (state.pos === state.digit) {
        return value === state.region ? { phase: 'done' } : undefined;
      }
      return { phase: 'scan', digit: state.digit, region: state.region, pos: state.pos + 1 };
    }
    return { phase: 'done' }; // already matched; remaining RD cells are moot
  },
  accept: (state) => state.phase === 'done',
}, 9);
const digitRegionConsistency = graph.cells().map(cell => new NFA(
  digitRegionLookupSpec, `digit region: ${cell}`,
  cell, region.at(cell), ...digitHomeRegion.cells()));

// ---------------------------------------------------------------------------
// Somedoku: row n / column n hold exactly n unique digits (the rest repeat).
// One target Var per row and per column, pinned to its own index, feeds
// CountDistinct over that row's/column's 9 cells.
// ---------------------------------------------------------------------------
const rowTarget = new Var('RN', 'row unique-digit target', 9);
const colTarget = new Var('CN', 'column unique-digit target', 9);
const rowTargetDomain = rowTarget.cells().map((cell, i) => new Given(cell, i + 1));
const colTargetDomain = colTarget.cells().map((cell, i) => new Given(cell, i + 1));
const rowCounts = graph.rows().map((cells, i) => new CountDistinct(rowTarget.cell(i + 1), ...cells));
const colCounts = graph.columns().map((cells, i) => new CountDistinct(colTarget.cell(i + 1), ...cells));

// ---------------------------------------------------------------------------
// German Whisper (green): adjacent difference >= 5. Cells from lines #18/#19
// (the coloured stroke; #3/#7 are its white halo, same path, so not encoded
// separately).
// ---------------------------------------------------------------------------
const whispers = [
  new Whisper(5, 'R5C4', 'R6C4'),
  new Whisper(5, 'R2C5', 'R2C6'),
];

// ---------------------------------------------------------------------------
// Nabner (yellow): no two cells ANYWHERE on the line -- not just adjacent --
// hold equal or consecutive digits, so every unordered pair within each
// line needs its own Pair (Pair binds consecutive-in-list pairs only).
// Cells from lines #10-#12 (#0/#5/#8 are their white halos).
// ---------------------------------------------------------------------------
const NABNER_LINES = [
  ['R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R6C8', 'R5C7', 'R4C6'],
  ['R3C4', 'R4C5'],
];
const notEqualOrConsecutiveKey = Pair.fnToKey((a, b) => a !== b && Math.abs(a - b) !== 1, 9);
const nabnerPairs = NABNER_LINES.flatMap(cells => {
  const pairs = [];
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      pairs.push(new Pair(notEqualOrConsecutiveKey, 'nabner', cells[i], cells[j]));
    }
  }
  return pairs;
});

// ---------------------------------------------------------------------------
// Entropic (orange): every 3 consecutive cells hold one low (1-3), one mid
// (4-6), one high (7-9) digit -- ISS's Entropic is exactly this sliding-
// window rule. Cells from lines #13-#14 (#1/#2 are their white halos).
// ---------------------------------------------------------------------------
const entropicLines = [
  new Entropic('R3C9', 'R4C9', 'R4C8', 'R3C7', 'R4C7', 'R5C8', 'R5C9', 'R6C9'),
  new Entropic('R2C3', 'R3C3', 'R4C3'),
];

// ---------------------------------------------------------------------------
// Same Difference (turquoise): adjacent cells on the line share one common
// difference, but the puzzle never says what it is -- it is determined per
// line, not read from anywhere else, so it lives only in the NFA's own state
// and is never exposed as a Var. Cells from lines #15-#17 (#4/#6/#9 are their
// white halos); #17 is a closed loop, so its cell list repeats R8C8 at the
// end, to cover the wrap-around edge between the last cell and the first.
// ---------------------------------------------------------------------------
const sameDifferenceSpec = NFA.encodeSpec({
  startState: { phase: 'first' },
  transition: (state, value) => {
    if (state.phase === 'first') return { phase: 'second', prev: value };
    if (state.phase === 'second') return { phase: 'known', diff: Math.abs(value - state.prev), prev: value };
    return Math.abs(value - state.prev) === state.diff
      ? { phase: 'known', diff: state.diff, prev: value } : undefined;
  },
  accept: (state) => state.phase === 'second' || state.phase === 'known',
}, 9);
const sameDifferenceLines = [
  new NFA(sameDifferenceSpec, 'same difference', 'R8C6', 'R7C6', 'R6C6', 'R5C6'),
  new NFA(sameDifferenceSpec, 'same difference', 'R7C7', 'R7C8', 'R7C9'),
  new NFA(sameDifferenceSpec, 'same difference', 'R8C8', 'R9C8', 'R9C7', 'R8C7', 'R8C8'),
];

// ---------------------------------------------------------------------------
// X: adjacent digits sum to 10. Drawn as a small X mark on the shared edge
// (lines #20/#21, #22/#23, #24/#25 -- two crossing diagonal strokes each,
// classified by the geometry helper as a "wall chain" but centred exactly on
// one cell border with no wall rule in the text, matching the X convention).
// ---------------------------------------------------------------------------
const xClues = [
  new X('R3C1', 'R3C2'),
  new X('R6C6', 'R6C7'),
  new X('R6C7', 'R7C7'),
];

// ---------------------------------------------------------------------------
// Blue Arrow: the digit on the arrow cell counts the region borders (label
// changes between orthogonally adjacent cells) crossed looking from that
// cell to the grid edge in the drawn direction; the outer grid edge itself
// is never a border. One NFA per arrow: read the arrow cell's own digit as
// the target, then scan the ray's region labels (starting at the arrow cell
// itself) counting label changes between consecutive ray cells.
// ---------------------------------------------------------------------------
const borderCountSpec = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    if (state.phase === 'target') return { phase: 'ray-start', target: value };
    if (state.phase === 'ray-start') return { phase: 'scan', target: state.target, prev: value, count: 0 };
    // Clamp at 9 (the highest possible target/digit): counts run at most 8
    // (the longest ray has 9 cells, 8 gaps) in any real run, but the clamp
    // keeps the abstract state space finite regardless of ray length.
    const count = value === state.prev ? state.count : Math.min(state.count + 1, 9);
    return { phase: 'scan', target: state.target, prev: value, count };
  },
  accept: (state) => state.phase === 'scan' && state.count === state.target,
}, 9);
const BLUE_ARROWS = [
  { cell: 'R7C1', dR: 0, dC: 1 },
  { cell: 'R8C1', dR: 0, dC: 1 },
  { cell: 'R8C5', dR: -1, dC: 0 },
  { cell: 'R4C4', dR: 0, dC: 1 },
];
const blueArrows = BLUE_ARROWS.map(({ cell, dR, dC }) => new NFA(
  borderCountSpec, `blue arrow ${cell}`,
  cell, ...region.at(graph.ray(cell, dR, dC))));

return [
  shape,
  region.toVar('region'),
  regionDomain,
  ...regionConnectivity,
  noMono2x2,
  canonicalLabel,
  digitHomeRegion,
  ...digitHomeRegionDomain,
  ...digitRegionConsistency,
  rowTarget,
  colTarget,
  ...rowTargetDomain,
  ...colTargetDomain,
  ...rowCounts,
  ...colCounts,
  ...whispers,
  ...nabnerPairs,
  ...entropicLines,
  ...sameDifferenceLines,
  ...xClues,
  ...blueArrows,
];
