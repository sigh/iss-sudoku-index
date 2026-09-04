// Title: Meidjuizy
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=zJdyKjsliGI
// Source: https://sudokupad.app/t790muspun

// Divide the grid into 12 regions, one of each size 1 to 12 (all sizes
// distinct). Black cells (R1C2, R7C10) are in no region. Regions are
// standard orthogonally-connected grid regions (the rules text does not
// repeat this, but no region-dividing puzzle of this kind means a
// scattered cell set).
//
// A region may not contain repeated numbers, and may only contain factors
// of its own size. In this puzzle the only numbers ever written are the
// counts on the 23 arrow cells (every other cell stays blank), so the
// no-repeat/factor rule is scoped to those written counts: two arrow cells
// in the same region may not carry equal nonzero values, and a nonzero
// value must divide its own region's size. A written 0 is exempt from the
// factor test (0 is not a factor of anything -- the rules' own example
// reads "including none of them" as a region simply having no factor-digit
// cells) but is still a written number, so two arrows in the same region
// cannot both show 0.
//
// Each arrow cell holds the count of cells of its own region seen in a
// straight line in its drawn direction (not counting itself) before the
// first non-same-region cell or the grid edge.
//
// Model: the main grid holds exactly what a solver writes -- an arrow
// cell's count (blank cells and the 57 non-arrow cells are Given 0, so a
// count is only ever meaningful at an arrow). The otherwise-invisible
// region partition is a parallel Var overlay ('VG', one cell per grid
// cell, values 1-12; black cells 0): `ConnectedValues('VG', s, s)` for
// s=1..12 forces exactly one connected s-cell region per size, which also
// forces every size to be used exactly once (78 = 1+2+...+12 non-black
// cells). The grid is widened to 0-12 so the overlay has room for every
// region size; the main grid's own cells are restricted back down to 0-9
// (no arrow's count can exceed the longest ray on this board, 9).

const shape = new Shape('8x10', '0-12', 'Raw');
const at = (r, c) => makeCellId(r, c);
const graph = cellGraph(shape);

// Computed via makeCellId (not hand-typed): column 10 serializes as a
// letter ('Ca' for C10), so a literal 'R7C10' string would never match a
// real cell id.
const BLACK = [at(1, 2), at(7, 10)];

// Arrows: [row, col, dRow, dCol], one per drawn arrow glyph (each a short
// stub inside its own cell, pointing in one of 8 directions). Every ray
// stays inside the drawn 8x10 board (the only drawn line outlines that
// whole board, so there is no smaller framed sub-board an arrow could
// instead belong outside of).
const ARROWS = [
  [1, 5, 1, 0], [1, 7, 1, -1], [1, 4, 1, -1], [3, 3, 1, -1], [3, 5, 1, -1],
  [4, 9, 1, -1], [3, 1, 0, 1], [3, 8, 0, 1], [4, 3, 0, 1], [3, 10, -1, -1],
  [5, 2, -1, -1], [6, 3, -1, -1], [6, 8, -1, -1], [4, 2, -1, 1], [5, 9, -1, 1],
  [7, 8, -1, 1], [8, 7, -1, 1], [8, 1, -1, 1], [8, 3, -1, 1], [8, 10, 0, -1],
  [6, 6, 1, 1], [5, 5, 0, -1], [4, 7, 0, -1],
];

const inBounds = (r, c) => r >= 1 && r <= 8 && c >= 1 && c <= 10;

const arrows = ARROWS.map(([r, c, dr, dc]) => {
  const origin = at(r, c);
  const ray = [];
  for (let rr = r + dr, cc = c + dc; inBounds(rr, cc); rr += dr, cc += dc) {
    ray.push(at(rr, cc));
  }
  return { origin, ray };
});
const arrowCells = arrows.map(a => a.origin);

// Every cell without an arrow is blank (0); an arrow cell's count is
// otherwise free (bounded to 0-9 -- see above). The count range is
// stamped over every cell (blank cells' own narrower {0} given still
// wins there, since the two intersect to {0}); one shifted copy of the
// same Given template per group.
const blankCells = graph.cells().filter(c => !arrowCells.includes(c));
const blankGiven = graph.makeReplicate(new Given(graph.cells()[0], 0), blankCells);
const arrowRange = graph.makeReplicate(
  new Given(graph.cells()[0], ...Array.from({ length: 10 }, (_, i) => i)),
  graph.cells());

// Region-label overlay: dense (every grid cell, so ray/region logic can
// read any cell's label uniformly), values 1-12 off the black cells, 0 on
// them.
const labelOverlay = graph.makeOverlay('VG');
const labelVar = labelOverlay.toVar('region');
const labelCell = cell => labelOverlay.at(cell);

const nonBlackLabelCells = labelOverlay.cells()
  .filter(c => !BLACK.includes(labelOverlay.gridAt(c)));
const nonBlackLabelGiven = labelOverlay.makeReplicate(
  new Given(labelOverlay.cells()[0], ...Array.from({ length: 12 }, (_, i) => i + 1)),
  nonBlackLabelCells);
const blackLabelGivens = BLACK.map(cell => new Given(labelCell(cell), 0));

const regions = [];
for (let s = 1; s <= 12; s++) regions.push(new ConnectedValues('VG', s, s));

// One multi-segment NFA per arrow: segment 1 is the origin cell's label
// (sets the target = this arrow's own region), segment 2 is the ray of
// labels (tally while it keeps matching the target; freeze the tally at
// the first mismatch -- "before the first cell outside the region" --
// rather than resuming on a later coincidental match), segment 3 is the
// written count itself, which must equal the tally.
const rayMax = Math.max(...arrows.map(a => a.ray.length));
const raySpec = NFA.encodeSpec({
  startState: { seg: 0, target: null, count: 0, stopped: false },
  transition: ({ seg, target, count, stopped }, value) => {
    if (value === SEGMENT_BREAK) return { seg: seg + 1, target, count, stopped };
    if (seg === 0) return { seg, target: value, count: 0, stopped: false };
    if (seg === 1) {
      if (stopped) return { seg, target, count, stopped };
      if (value === target) return { seg, target, count: count + 1, stopped };
      return { seg, target, count, stopped: true };
    }
    // seg === 2: the written count itself.
    return value === count ? { seg: 3, target, count, stopped } : undefined;
  },
  accept: ({ seg }) => seg === 3,
  maxDepth: rayMax + 4,
}, shape, { multiSegment: true });

const rayCounts = arrows.map((a, i) =>
  new NFA(raySpec, 'ray' + i, [labelCell(a.origin)], labelOverlay.at(a.ray), [a.origin]));

// Divisibility: a written nonzero count must divide its own cell's region
// size (0 is exempt).
const divideKey = Pair.fnToKey((size, val) => val === 0 || size % val === 0, shape);
const divides = arrows.map((a, i) =>
  new Pair(divideKey, 'divides' + i, labelCell(a.origin), a.origin));

// No-repeat within a region: one NFA per region size, scanning every
// arrow's (own label, own written count) pair. A reserved high bit in
// `seen` tracks a written 0 (still a number, so at most one per region)
// separately from the size's own divisor bits.
const distinctSpecs = [];
for (let s = 1; s <= 12; s++) {
  const divisors = Array.from({ length: 12 }, (_, i) => i + 1).filter(d => s % d === 0);
  const zeroBit = divisors.length;
  distinctSpecs.push(NFA.encodeSpec({
    startState: { expectLabel: true, match: false, seen: 0 },
    transition: ({ expectLabel, match, seen }, value) => {
      if (expectLabel) return { expectLabel: false, match: value === s, seen };
      if (!match) return { expectLabel: true, match: false, seen };
      const bit = value === 0 ? zeroBit : divisors.indexOf(value);
      if (bit === -1) return undefined;
      const mask = 1 << bit;
      if (seen & mask) return undefined;
      return { expectLabel: true, match: false, seen: seen | mask };
    },
    accept: () => true,
    maxDepth: arrows.length * 2,
  }, shape));
}
const distinctByRegion = distinctSpecs.map((spec, i) => {
  const s = i + 1;
  const cells = arrows.flatMap(a => [labelCell(a.origin), a.origin]);
  return new NFA(spec, 'distinct' + s, ...cells);
});

return [
  shape,
  labelVar,
  blankGiven,
  arrowRange,
  nonBlackLabelGiven,
  ...blackLabelGivens,
  ...regions,
  ...rayCounts,
  ...divides,
  ...distinctByRegion,
];
