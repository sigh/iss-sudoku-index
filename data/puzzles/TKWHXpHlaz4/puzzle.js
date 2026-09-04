// Title: The Popular Pond
// Author: 99%Sneaky
// Video: https://www.youtube.com/watch?v=TKWHXpHlaz4
// Source: https://sudokupad.app/c0rebcbl3j

// Rules (Anglers, from the video description; the payload carries the same
// text as metadata.rules):
//   From each clue outside the grid, draw a path which begins in the nearest
//   cell of the grid and then travels orthogonally from cell to cell until
//   arriving at a fish. All empty cells must be used by a path. Paths may not
//   cross themselves, each other, or fish. A number at the beginning of a
//   path indicates how many cells in the grid the path occupies, including
//   the cell with the fish.
//   Whose Line Is It Anyway?: To avoid confusion among the anglers, no two
//   fishing lines of the same length may touch. This includes both
//   orthogonal and diagonal touching.
//   Answer Check: for each ? clue, fill each cell along the corresponding
//   path with the digit equal to the length of the path (the one's digit
//   when the length is two digits).
//
// Readings. "May not cross themselves, each other, or fish" is satisfied by
// construction: a simple path never revisits a cell, the 19 paths partition
// the grid so no cell is shared, and every fish cell is forced to be some
// path's own terminus (see "degree" below), so no path can pass through a
// fish that is not its own end. Nothing here forbids a path from running
// adjacent to itself away from its own two consecutive neighbours (the rules
// only ban "crossing", and separately ban only *same-length* lines from
// touching) -- a plain same-owner-neighbour-count degree rule would be
// unsound here (a cell one path passes adjacent to itself would read a
// spurious third same-owner neighbour), so the model below carries an
// explicit link direction per cell instead of counting same-owner
// neighbours.
//
// Omitted (declared, not modelled): the general "no two same-length lines
// touch" clause, beyond the three pairs of clues whose lengths are already
// known to coincide (6 at R1C2/R3C1, 7 at R1C8/R13C3, 17 at R12C1/R1C13);
// and the exclusion of a path-shaped cycle disjoint from every clue. Both
// need a per-path identity broadcast over the whole grid, which a 169-cell
// board's hard whole-grid-overlay budget cannot hold at this width alongside
// the size tracking below.

// -------------------------------------------------------------- geometry ---

const DIMS = '13x13';
const shape = new Shape(DIMS, '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// Each clue's near-grid cell (its path's head), its printed length (null for
// a '?' clue), and a small identity tag used only to flag the three known
// same-length pairs (0 = "not one of those six paths"). Transcribed from the
// clue labels' drawn positions outside the grid (row, col, length, tag; a
// row or column past 9 needs makeCellId's letter form, e.g. R10 -> row 10).
const HEADS = [
  [1, 2, 6, 1], [3, 1, 6, 2],
  [1, 8, 7, 3], [13, 3, 7, 4],
  [12, 1, 17, 5], [1, 13, 17, 6],
  [1, 6, 2, 0], [8, 1, 11, 0], [10, 1, 13, 0], [9, 1, 5, 0],
  [9, 13, 8, 0], [7, 13, 4, 0], [6, 13, 12, 0],
  [1, 10, null, 0], [2, 13, null, 0], [5, 13, null, 0],
  [11, 13, null, 0], [13, 7, null, 0], [13, 13, null, 0],
].map(([row, col, len, vi]) => [makeCellId(row, col), len, vi]);

// Each fish's cell, transcribed from the underlay fish-emoji markers' cell field.
const FISH = [
  [1, 1], [1, 4], [1, 7], [2, 4], [2, 10], [4, 4], [6, 4], [7, 2], [7, 10],
  [8, 10], [8, 13], [9, 3], [9, 8], [10, 6], [10, 9], [10, 13], [12, 7],
  [12, 10], [13, 10],
].map(([row, col]) => makeCellId(row, col));

// Build-time sanity: 19 clues, 19 fish, all distinct cells (a transcription
// slip here would silently mis-shape the whole encoding).
if (HEADS.length !== 19) throw new Error(`expected 19 heads, got ${HEADS.length}`);
if (FISH.length !== 19) throw new Error(`expected 19 fish, got ${FISH.length}`);
const headCells = new Set(HEADS.map(h => h[0]));
const fishCells = new Set(FISH);
if (headCells.size !== 19) throw new Error('duplicate head cell');
if (fishCells.size !== 19) throw new Error('duplicate fish cell');
for (const f of FISH) if (headCells.has(f)) throw new Error(`fish/head overlap at ${f}`);

// --------------------------------------------------------- link (mask) layer ---

// Every cell names, in a bitmask, which of its orthogonal neighbours are its
// own path-neighbours (N=1, S=2, E=4, W=8). A path's two ends (its clue's
// entry cell and the fish it reaches) use exactly one bit; every other cell
// on a path uses exactly two (predecessor and successor). This -- not a
// same-owner neighbour count -- is what stays sound when a path may run
// adjacent to itself away from its own consecutive cells.
const DIRS = [
  { bit: 1, back: 2, dRow: -1, dCol: 0 },  // N
  { bit: 2, back: 1, dRow: 1, dCol: 0 },   // S
  { bit: 4, back: 8, dRow: 0, dCol: 1 },   // E
  { bit: 8, back: 4, dRow: 0, dCol: -1 },  // W
];
const popcount = mask => DIRS.filter(d => mask & d.bit).length;
const neighboursOf = cell => DIRS
  .map(dir => ({ dir, other: graph.step(cell, dir.dRow, dir.dCol) }))
  .filter(e => e.other);

const mask = graph.makeOverlay('VM');

// Every non-terminal cell may use any 2-bit "pass-through" pattern (a
// straight or a turn); a border cell additionally has 1-3 directions
// blocked by the grid edge, which a second, narrower Given then excludes
// (the two intersect on that cell, so it still ends up with only the
// masks its real on-grid neighbours support). Terminal cells (a clue's
// head, or a fish) get their own 1-bit legal set instead.
const legalMasksFor = (cell, onGrid) => {
  const isTerminal = headCells.has(cell) || fishCells.has(cell);
  const legal = [];
  for (let v = 1; v < 16; v++) {
    if ((v & ~onGrid) !== 0) continue;
    if (popcount(v) === (isTerminal ? 1 : 2)) legal.push(v);
  }
  if (legal.length === 0) throw new Error(`no legal link mask at ${cell}`);
  return legal;
};

const nonTerminalCells = cells.filter(c => !headCells.has(c) && !fishCells.has(c));
const interiorLegalMasks = [];
for (let v = 1; v < 16; v++) if (popcount(v) === 2) interiorLegalMasks.push(v);
const maskOrigin = cells[0];
const maskNonTerminalReplicate = mask.makeReplicate(
  new Given(mask.at(maskOrigin), ...interiorLegalMasks),
  mask.at(nonTerminalCells));

const FULL_ONGRID = DIRS.reduce((m, d) => m | d.bit, 0);
const maskDomains = cells
  .map(cell => ({ cell, onGrid: neighboursOf(cell).reduce((m, e) => m | e.dir.bit, 0) }))
  .filter(({ cell, onGrid }) => headCells.has(cell) || fishCells.has(cell) || onGrid !== FULL_ONGRID)
  .map(({ cell, onGrid }) => new Given(mask.at(cell), ...legalMasksFor(cell, onGrid)));

// -------------------------------------------------------- path length layer ---

// A path's length (cell count including its clue and its fish) is carried as
// residues modulo 13 and modulo 14 on two overlays: lcm(13, 14) = 182 > 169
// cells, so a residue pair names one integer in 1..169, propagated along the
// link layer (see the edge rule below), and a printed clue Givens its head's
// pair directly.
const MOD_A = 13;
const MOD_B = 14;
const VS = graph.makeOverlay('VS');
const VT = graph.makeOverlay('VT');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const sizeDomains = [
  VS.makeReplicate(new Given(VS.cells()[0], ...range(0, MOD_A - 1))),
  VT.makeReplicate(new Given(VT.cells()[0], ...range(0, MOD_B - 1))),
];

const sizeGivens = HEADS
  .filter(([, len]) => len !== null)
  .flatMap(([cell, len]) => [
    new Given(VS.at(cell), len % MOD_A),
    new Given(VT.at(cell), len % MOD_B),
  ]);

// -------------------------------------------------------------- digit layer ---

// The board itself holds the Answer Check digit: every cell shows its own
// path's length, reduced to one digit. Only '?'-clue cells are ever compared
// against the stored solution (puzzle_sources.solution leaves every other
// cell blank), so the digit this produces elsewhere is unconstrained by
// anything real and simply goes unchecked.
const digitDomain = graph.makeReplicate(new Given(cells[0], ...range(0, 9)));

const LIFT = new Map();
for (let n = 1; n <= 13 * 14 && n <= 169; n++) {
  LIFT.set(`${n % MOD_A}_${n % MOD_B}`, n);
}
const lift = (a, b) => LIFT.get(`${a}_${b}`);

const digitSpec = NFA.encodeSpec({
  startState: { i: 0 },
  transition: (s, v) => {
    switch (s.i) {
      case 0: return { i: 1, a: v };
      case 1: return { i: 2, a: s.a, b: v };
      case 2: {
        const n = lift(s.a, s.b);
        return (n !== undefined && v === n % 10) ? { i: 3 } : undefined;
      }
      default: return undefined;
    }
  },
  accept: s => s.i === 3,
}, shape);

const digitRules = cells.map(cell => new NFA(
  digitSpec, "cell shows its path's length, one's digit", VS.at(cell), VT.at(cell), cell));

// --------------------------------------------------- orthogonal edge rules ---

// Each undirected grid edge once (south and east steps cover every edge).
const edges = cells.flatMap(cell => DIRS
  .filter(d => d.dRow > 0 || d.dCol > 0)
  .flatMap(dir => {
    const other = graph.step(cell, dir.dRow, dir.dCol);
    return other ? [{ cell, other, dir }] : [];
  }));

// Reads [mask(a), mask(b), VS(a), VT(a), VS(b), VT(b)]. `linked` is whether
// a's mask names b as a path-neighbour; b's mask must agree either way. A
// linked pair is two consecutive cells of one path, so they share a length.
const sizeEdgeSpecs = new Map();
const sizeEdgeSpec = (bitAB, bitBA) => {
  const key = `${bitAB}_${bitBA}`;
  if (!sizeEdgeSpecs.has(key)) {
    sizeEdgeSpecs.set(key, NFA.encodeSpec({
      startState: { i: 0 },
      transition: (s, v) => {
        switch (s.i) {
          case 0: return { i: 1, linked: !!(v & bitAB) };
          case 1: return (!!(v & bitBA) === s.linked)
            ? { i: 2, linked: s.linked } : undefined;
          case 2: return { i: 3, linked: s.linked, vsA: v };
          case 3: return { i: 4, linked: s.linked, vsA: s.vsA, vtA: v };
          case 4: return (!s.linked || v === s.vsA)
            ? { i: 5, linked: s.linked, vtA: s.vtA } : undefined;
          case 5: return (!s.linked || v === s.vtA) ? { i: 6 } : undefined;
          default: return undefined;
        }
      },
      accept: s => s.i === 6,
    }, shape));
  }
  return sizeEdgeSpecs.get(key);
};

const sizeEdgeRules = edges.map(({ cell, other, dir }) => new NFA(
  sizeEdgeSpec(dir.bit, dir.back), 'linked cells agree on the link and share a path length',
  mask.at(cell), mask.at(other), VS.at(cell), VT.at(cell), VS.at(other), VT.at(other)));

// ------------------------------------------------- known-equal-length pairs ---

// VI tags a cell's path as one of the six ends of the three same-length
// clue pairs (1/2 = the two length-6 clues, 3/4 = length 7, 5/6 = length 17),
// or 0 for any of the other thirteen paths. This purposely does not give
// every path its own identity (a 19-way tag needs two more whole-grid
// overlays than the 169-cell board's budget allows here), so it only lets
// the three *statically* equal pairs enforce "must not touch"; a
// coincidental equal length involving a '?' clue is not covered.
const VI = graph.makeOverlay('VI');
const viDomain = VI.makeReplicate(new Given(VI.cells()[0], ...range(0, 6)));
const viGivens = HEADS.map(([cell, , vi]) => new Given(VI.at(cell), vi));

const FORBIDDEN_VI_PAIRS = new Set(['1_2', '2_1', '3_4', '4_3', '5_6', '6_5']);

// Reads [mask(a), mask(b), VI(a), VI(b)]. Linked cells (consecutive on one
// path) must share a tag. Unlinked but orthogonally-adjacent cells (two
// different paths sharing an edge, or one path touching itself elsewhere)
// must not be the two ends of one of the three known-equal pairs.
const viEdgeSpecs = new Map();
const viEdgeSpec = (bitAB, bitBA) => {
  const key = `${bitAB}_${bitBA}`;
  if (!viEdgeSpecs.has(key)) {
    viEdgeSpecs.set(key, NFA.encodeSpec({
      startState: { i: 0 },
      transition: (s, v) => {
        switch (s.i) {
          case 0: return { i: 1, linked: !!(v & bitAB) };
          case 1: return (!!(v & bitBA) === s.linked)
            ? { i: 2, linked: s.linked } : undefined;
          case 2: return { i: 3, linked: s.linked, viA: v };
          case 3: {
            if (s.linked) return (v === s.viA) ? { i: 4 } : undefined;
            return FORBIDDEN_VI_PAIRS.has(`${s.viA}_${v}`) ? undefined : { i: 4 };
          }
          default: return undefined;
        }
      },
      accept: s => s.i === 4,
    }, shape));
  }
  return viEdgeSpecs.get(key);
};

const viEdgeRules = edges.map(({ cell, other, dir }) => new NFA(
  viEdgeSpec(dir.bit, dir.back),
  'the two length-6 (or 7, or 17) clue paths do not share an edge',
  mask.at(cell), mask.at(other), VI.at(cell), VI.at(other)));

// Diagonal pairs: the same three known-equal pairs must not touch corner to
// corner either. Walking only the down-right and down-left offsets from
// every cell covers each diagonal pair exactly once; both offsets share the
// same key, so each is one Replicate (its origin cell is only a coordinate
// anchor, not a real diagonal pair).
const diagKey = Pair.fnToKey((a, b) => !FORBIDDEN_VI_PAIRS.has(`${a}_${b}`), shape);
const viOrigin = cells[0];
const diagonalRules = [1, -1].map(dCol => {
  const originOther = graph.step(viOrigin, 1, dCol);
  const targets = cells.filter(c => graph.step(c, 1, dCol));
  return VI.makeReplicate(
    new Pair(diagKey, 'the two length-6 (or 7, or 17) clue paths do not touch diagonally',
      VI.at(viOrigin), VI.at(originOther)),
    VI.at(targets));
});

return [
  shape,
  mask.toVar("link mask: bits set for this cell's own path-neighbours (N=1,S=2,E=4,W=8)"),
  VS.toVar(`path length mod ${MOD_A}`),
  VT.toVar(`path length mod ${MOD_B}`),
  VI.toVar('identity tag for the three known-equal-length clue pairs (0 = none)'),
  digitDomain,
  ...sizeDomains,
  viDomain,
  maskNonTerminalReplicate,
  ...maskDomains,
  ...sizeGivens,
  ...viGivens,
  ...digitRules,
  ...sizeEdgeRules,
  ...viEdgeRules,
  ...diagonalRules,
];
