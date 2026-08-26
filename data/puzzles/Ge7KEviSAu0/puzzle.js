// Title: The Moons of Saturn
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=Ge7KEviSAu0
// Source: https://tinyurl.com/bdect8rt

// Rules encoded here:
//  - Normal sudoku, no givens.
//  - The 60 white (unshaded) cells are divided into 12 five-cell cages, one
//    of each of the 12 pentomino shapes (any rotation/reflection); digits do
//    not repeat inside a cage. Which cage is which pentomino, and where each
//    one sits, is discovered by the solver -- nothing in the rules fixes it.
//  - Large moon (drawn as a sized, per-instance-coloured circle): the two
//    cells straddle a boundary between two *different* cages, whose totals
//    differ by 1 (white) or by a factor of 2 (black).
//  - Small moon (drawn as the native, always-white "difference" / always-black
//    "ratio" dot): the two cells are in the *same* cage, and their digits
//    differ by 1 (white) or by a factor of 2 (black). The drawn markers'
//    sizes settle which family is "large" and which is "small": the large
//    moon is a bigger, per-instance-coloured circle than the small,
//    fixed-size native dot used for the small moon.
//  - "There may be undiscovered moons" -- the drawn markers are not
//    exhaustive, so no negative ("no other pair differs by X") rule is
//    encoded.
// Nothing is omitted.

const graph = cellGraph('9x9');

// Shaded cells excluded from the pentomino partition (drawn fill #A8A8A8).
// The remaining 60 cells are white.
const shadedCells = [
  'R1C1', 'R1C2', 'R2C1', 'R3C6', 'R3C7', 'R4C4', 'R4C5', 'R4C6', 'R4C7',
  'R5C4', 'R5C5', 'R5C6', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R7C3', 'R7C4',
  'R8C9', 'R9C8', 'R9C9',
];
const shadedSet = new Set(shadedCells);
const whiteCells = graph.cells().filter(cell => !shadedSet.has(cell));

// Large moons: boundary between different cages. [cellA, cellB, colour].
const largeMoons = [
  ['R8C7', 'R8C8', 'white'],
  ['R3C8', 'R4C8', 'white'],
  ['R8C6', 'R9C6', 'black'],
  ['R8C3', 'R8C4', 'black'],
  ['R3C9', 'R4C9', 'black'],
  ['R1C6', 'R1C5', 'black'],
  ['R3C4', 'R3C3', 'black'],
  ['R2C2', 'R3C2', 'black'],
];

// Small moons: same cage. [cellA, cellB, kind] with kind 'difference' (white,
// differ by 1) or 'ratio' (black, one double the other).
const smallMoons = [
  ['R1C8', 'R1C7', 'difference'],
  ['R6C1', 'R7C1', 'difference'],
  ['R1C5', 'R2C5', 'difference'],
  ['R2C3', 'R3C3', 'difference'],
  ['R9C4', 'R9C3', 'difference'],
  ['R7C2', 'R8C2', 'ratio'],
  ['R4C8', 'R4C9', 'ratio'],
  ['R7C6', 'R8C6', 'ratio'],
];

// --- Pentomino shapes -------------------------------------------------
// Standard free pentominoes (one canonical orientation each, as [row, col]
// offsets), independent of this puzzle -- geometric fact, not drawn data.
const PENTOMINOES = {
  F: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
  I: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  L: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
  N: [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]],
  P: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],
  T: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
  U: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]],
  V: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  W: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
  X: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  Y: [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]],
  Z: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]],
};
// Fixed label numbers 1-12, one per shape, in this order.
const SHAPE_NAMES = Object.keys(PENTOMINOES);

function normalizeOffsets(cells) {
  const minR = Math.min(...cells.map(c => c[0]));
  const minC = Math.min(...cells.map(c => c[1]));
  return cells.map(([r, c]) => [r - minR, c - minC])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}
function rot90(cells) { return cells.map(([r, c]) => [c, -r]); }
function mirror(cells) { return cells.map(([r, c]) => [r, -c]); }
function offsetsKey(cells) { return cells.map(c => c.join(',')).join(';'); }

// All distinct orientations of a shape under rotation and reflection.
function orientationsOf(base) {
  const seen = new Map();
  let cur = base;
  for (let m = 0; m < 2; m++) {
    for (let i = 0; i < 4; i++) {
      const norm = normalizeOffsets(cur);
      const key = offsetsKey(norm);
      if (!seen.has(key)) seen.set(key, norm);
      cur = rot90(cur);
    }
    cur = mirror(cur);
  }
  return [...seen.values()];
}

const whiteSet = new Set(whiteCells);

// Every placement of `shapeName` that lies entirely within the white cells.
function candidatePlacements(shapeName) {
  const placements = [];
  for (const orient of orientationsOf(PENTOMINOES[shapeName])) {
    for (let r = 1; r <= 9; r++) {
      for (let c = 1; c <= 9; c++) {
        const cells = orient.map(([dr, dc]) => {
          const row = r + dr, col = c + dc;
          if (row < 1 || row > 9 || col < 1 || col > 9) return null;
          return makeCellId(row, col);
        });
        if (cells.every(cell => cell !== null && whiteSet.has(cell))) {
          placements.push(cells);
        }
      }
    }
  }
  return placements;
}

// --- Region-label overlay: which cage (pentomino) each white cell is in ---
// Values 1-12, one per shape in SHAPE_NAMES order. Every label's Or below
// picks exactly one candidate placement of that shape and stamps its label
// on those 5 cells; the resulting labelled sets are forced pairwise disjoint
// (two different labels stamping the same cell is a Given conflict), and
// since every label's placement has exactly 5 cells, 12 x 5 = 60 = the
// number of white cells forces the 12 chosen placements to cover every
// white cell exactly once -- no separate coverage constraint is needed.
const region = graph.makeOverlay('VR', whiteCells);
const regionCells = region.at(whiteCells);
new Replicate(
  [new Given(regionCells[0], ...SHAPE_NAMES.map((_, i) => i + 1))],
  Replicate.encodeTargetCells(regionCells, regionCells[0], region),
  regionCells[0],
);

// --- Cage-total split vars, for the large-moon (cage-total) relations ---
// A cage total (5 distinct digits from 1-9) ranges 15-35, which does not fit
// in the solver's 16-value cap for any single Var. Split it in base 16 as
// total = 16*hi + lo - 2, with hi in {1,2} (bit 0/1, +1) and lo in 1-16
// (value 0-15, +1): for total 15-30, hi=1 and lo=total-14; for total 31-35,
// hi=2 and lo=total-30. The two ranges are disjoint, so (hi, lo) is the
// unique pair satisfying the equation for any real total -- no extra
// solution multiplicity from these auxiliary cells.
const neededCells = [...new Set(largeMoons.flatMap(([a, b]) => [a, b]))];
const hi = graph.makeOverlay('VH', neededCells);
const lo = graph.makeOverlay('VL', neededCells);
const hiCells = hi.at(neededCells);
const loCells = lo.at(neededCells);
new Replicate(
  [new Given(hiCells[0], 1, 2)],
  Replicate.encodeTargetCells(hiCells, hiCells[0], hi),
  hiCells[0],
);
new Replicate(
  [new Given(loCells[0], ...Array.from({ length: 16 }, (_, i) => i + 1))],
  Replicate.encodeTargetCells(loCells, loCells[0], lo),
  loCells[0],
);

// Sum constraint pinning a placement's actual digit total into its hi/lo pair
// (see the split explained above): total - 16*hiVar - loVar = -2.
function linkTotal(cells, hiVar, loVar) {
  return new Sum(-2, ...cells.map(c => [c, 1]), [hiVar, -16], [loVar, -1]);
}

// --- The 12 per-shape placement choices --------------------------------
const shapeConstraints = SHAPE_NAMES.map((name, i) => {
  const label = i + 1;
  const placements = candidatePlacements(name);
  return new Or(placements.map(cells => new And([
    ...cells.map(cell => new Given(region.at(cell), label)),
    new AllDifferent(...cells), // "digits may not repeat in a cage"
    ...neededCells
      .filter(needed => cells.includes(needed))
      .map(needed => linkTotal(cells, hi.at(needed), lo.at(needed))),
  ])));
});

// --- Large moons: different cages, cage totals related -----------------
const largeMoonConstraints = largeMoons.flatMap(([a, b, colour]) => {
  const hiA = hi.at(a), loA = lo.at(a), hiB = hi.at(b), loB = lo.at(b);
  const totalRelation = colour === 'white'
    // totals differ by 1
    ? new Or([
      new Sum(1, [hiA, 16], [loA, 1], [hiB, -16], [loB, -1]),
      new Sum(-1, [hiA, 16], [loA, 1], [hiB, -16], [loB, -1]),
    ])
    // one total is double the other
    : new Or([
      new Sum(-2, [hiA, 16], [loA, 1], [hiB, -32], [loB, -2]),
      new Sum(-2, [hiB, 16], [loB, 1], [hiA, -32], [loA, -2]),
    ]);
  return [
    new AllDifferent(region.at(a), region.at(b)), // different cages
    totalRelation,
  ];
});

// --- Small moons: same cage, digits related ------------------------------
const smallMoonConstraints = smallMoons.flatMap(([a, b, kind]) => [
  new SameValues(2, region.at(a), region.at(b)),
  kind === 'difference' ? new WhiteDot(a, b) : new BlackDot(a, b),
]);

// Grid digits are restricted back to 1-9 (the widened Shape below allows up
// to 16, for the region labels and cage-total split vars above).
const gridCells = graph.cells();
const digitDomain = new Replicate(
  [new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
  Replicate.encodeTargetCells(gridCells, gridCells[0], graph),
  gridCells[0],
);

return [
  new Shape('9x9', 16),
  digitDomain,
  region.toVar('Region'),
  hi.toVar('CageTotalHi'),
  lo.toVar('CageTotalLo'),
  ...shapeConstraints,
  ...largeMoonConstraints,
  ...smallMoonConstraints,
];
