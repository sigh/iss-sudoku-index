// Title: Snake Pit
// Author: Unknown
// Video: https://www.youtube.com/watch?v=mpTEsEAw7hA
// Source: https://cracking-the-cryptic.web.app/sudoku/rpLjjQF383

// Rules (from the video's on-screen rules panel; the source itself carries
// no rules text):
//   Divide the grid into some one-cell-wide "snakes" so that each given
//   number represents the size of the snake that contains it. Each snake
//   consists of at least 2 cells and must not touch itself (even
//   diagonally). Each snake may contain any number of given numbers
//   (including zero). Two snakes of the same length cannot share an edge.
//
// Readings: a snake is an open path (a head, a tail, no branching, no
// loop); "must not touch itself (even diagonally)" exempts the one diagonal
// pair a 90-degree bend makes between its own predecessor and successor,
// since otherwise no snake could turn; "share an edge" is orthogonal
// adjacency, the rules naming the diagonal case separately. Nothing is
// omitted: the rules put no upper bound on a snake's size and none is
// imposed here.
//
// Model. The board holds each cell's link pattern: which of its four
// neighbours are the previous/next cell of its snake (bits N=1 S=2 E=4 W=8,
// one or two of them set). A snake is a run of cells joined by links. Its
// size, and each cell's position along it (head = 1, tail = size), are
// carried as residues modulo 7 and modulo 8 on two overlays each: lcm 56
// exceeds the 49 cells, so a residue pair names one integer in 1..49, and a
// step along the snake is +1 on both layers. The head's coordinates are
// broadcast over the snake as its identity, which the diagonal rule needs
// in order to tell "same snake" from "same size".

const DIMS = '7x7';
const shape = new Shape(DIMS, '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();
const [NUM_ROWS, NUM_COLS] = DIMS.split('x').map(Number);
const NUM_CELLS = cells.length;

// Transcribed from the nine given numbers drawn on the board (the 11 in R3C2
// is a two-digit text mark centred on the cell).
const GIVENS = [
  [1, 2, 7],
  [2, 2, 9], [2, 5, 6], [2, 6, 7], [2, 7, 9],
  [3, 2, 11],
  [6, 1, 7], [6, 2, 5], [6, 3, 4],
];

// ------------------------------------------------------------ link layer ---

const DIRS = [
  // `back` is the bit a neighbour in this direction uses to link back here.
  { bit: 1, back: 2, dRow: -1, dCol: 0 },   // N
  { bit: 2, back: 1, dRow: 1, dCol: 0 },    // S
  { bit: 4, back: 8, dRow: 0, dCol: 1 },    // E
  { bit: 8, back: 4, dRow: 0, dCol: -1 },   // W
];
const popcount = mask => DIRS.filter(dir => mask & dir.bit).length;
const neighboursOf = cell => DIRS
  .map(dir => ({ dir, other: graph.step(cell, dir.dRow, dir.dCol) }))
  .filter(entry => entry.other);

// Every cell is in a snake of at least 2 cells that is one cell wide: it
// links to one or two neighbours, none of them off the grid.
const linkDomains = cells.map(cell => {
  const onGrid = neighboursOf(cell).reduce((m, e) => m | e.dir.bit, 0);
  const masks = [];
  for (let mask = 1; mask < 16; mask++) {
    if ((mask & ~onGrid) === 0 && popcount(mask) <= 2) masks.push(mask);
  }
  return new Given(cell, ...masks);
});

// --------------------------------------------------------- residue layers ---

const MOD_A = 7;
const MOD_B = 8;   // coprime with MOD_A; MOD_A * MOD_B = 56 > NUM_CELLS

const sizeA = graph.makeOverlay('VS');
const sizeB = graph.makeOverlay('VT');
const sizeVarA = sizeA.toVar(`snake size mod ${MOD_A}`);
const sizeVarB = sizeB.toVar(`snake size mod ${MOD_B}`);
const posA = graph.makeOverlay('VP');
const posB = graph.makeOverlay('VQ');
const headRow = graph.makeOverlay('VR');
const headCol = graph.makeOverlay('VC');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const domains = [
  sizeA.makeReplicate(new Given(sizeA.cells()[0], ...range(0, MOD_A - 1))),
  sizeB.makeReplicate(new Given(sizeB.cells()[0], ...range(0, MOD_B - 1))),
  posA.makeReplicate(new Given(posA.cells()[0], ...range(0, MOD_A - 1))),
  posB.makeReplicate(new Given(posB.cells()[0], ...range(0, MOD_B - 1))),
  headRow.makeReplicate(new Given(headRow.cells()[0], ...range(1, NUM_ROWS))),
  headCol.makeReplicate(new Given(headCol.cells()[0], ...range(1, NUM_COLS))),
];

// A residue pair (a, b) names the one n in 1..56 with n = a (mod 7) and
// n = b (mod 8). A size is 2..NUM_CELLS, a position 1..NUM_CELLS.
const LIFT = new Map();
for (let n = 1; n <= MOD_A * MOD_B; n++) LIFT.set(`${n % MOD_A}_${n % MOD_B}`, n);
const lift = (a, b) => LIFT.get(`${a}_${b}`);
const sizeKey = Pair.fnToKey((a, b) => lift(a, b) >= 2 && lift(a, b) <= NUM_CELLS, shape);
const posKey = Pair.fnToKey((a, b) => lift(a, b) >= 1 && lift(a, b) <= NUM_CELLS, shape);
const residueRanges = cells.flatMap(cell => [
  new Pair(sizeKey, `snake size in 2..${NUM_CELLS}`, sizeA.at(cell), sizeB.at(cell)),
  new Pair(posKey, `position in 1..${NUM_CELLS}`, posA.at(cell), posB.at(cell)),
]);

// Each given number is the size of the snake containing its cell.
const sizeGivens = GIVENS.flatMap(([r, c, v]) => [
  new Given(sizeVarA.cell(r, c), v % MOD_A),
  new Given(sizeVarB.cell(r, c), v % MOD_B),
]);

// ------------------------------------------------------ orthogonal edges ---

const edges = cells.flatMap(cell => DIRS
  .filter(dir => dir.dRow > 0 || dir.dCol > 0)   // each edge once
  .flatMap(dir => {
    const other = graph.step(cell, dir.dRow, dir.dCol);
    return other ? [{ cell, other, dir }] : [];
  }));

// Reads [link(a), link(b), sizeA(a), sizeB(a), sizeA(b), sizeB(b),
// posA(a), posB(a), posA(b), posB(b)] for one edge. `linked` is whether a's
// pattern names b; b's pattern must agree. A linked pair is two consecutive
// cells of one snake: equal size residues, positions one apart with the
// same +1/-1 (`step`) on both layers. An unlinked pair is two different
// snakes sharing an edge (or one snake touching itself), so their sizes
// must differ.
const edgeSpecs = new Map();
const edgeSpec = (bitAB, bitBA) => {
  const key = `${bitAB}_${bitBA}`;
  if (!edgeSpecs.has(key)) {
    edgeSpecs.set(key, NFA.encodeSpec({
      startState: { i: 0 },
      transition: (s, v) => {
        switch (s.i) {
          case 0: return { i: 1, linked: !!(v & bitAB) };
          case 1: return !!(v & bitBA) === s.linked
            ? { i: 2, linked: s.linked } : undefined;
          case 2: return { i: 3, linked: s.linked, a: v };
          case 3: return { i: 4, linked: s.linked, a: s.a, b: v };
          case 4: return { i: 5, linked: s.linked, b: s.b, sameA: v === s.a };
          case 5: {
            const same = s.sameA && v === s.b;
            return same === s.linked ? { i: 6, linked: s.linked } : undefined;
          }
          case 6: return s.linked
            ? { i: 7, linked: true, a: v } : { i: 7, linked: false };
          case 7: return s.linked
            ? { i: 8, linked: true, a: s.a, b: v } : { i: 8, linked: false };
          case 8: {
            if (!s.linked) return { i: 9, linked: false };
            const d = (v - s.a + MOD_A) % MOD_A;
            if (d !== 1 && d !== MOD_A - 1) return undefined;
            return { i: 9, linked: true, b: s.b, step: d === 1 ? 1 : MOD_B - 1 };
          }
          case 9: {
            if (!s.linked) return { i: 10 };
            return (v - s.b + MOD_B) % MOD_B === s.step ? { i: 10 } : undefined;
          }
          default: return undefined;
        }
      },
      accept: s => s.i === 10,
    }, shape));
  }
  return edgeSpecs.get(key);
};

const edgeRules = edges.map(({ cell, other, dir }) => new NFA(
  edgeSpec(dir.bit, dir.back), 'linked cells are consecutive',
  cell, other,
  sizeA.at(cell), sizeB.at(cell), sizeA.at(other), sizeB.at(other),
  posA.at(cell), posB.at(cell), posA.at(other), posB.at(other)));

// Reads [link(a), headRow(a), headRow(b), headCol(a), headCol(b)]: linked
// cells are one snake and name the same head.
const sameHeadSpecs = new Map();
const sameHeadSpec = bitAB => {
  if (!sameHeadSpecs.has(bitAB)) {
    sameHeadSpecs.set(bitAB, NFA.encodeSpec({
      startState: { i: 0 },
      transition: (s, v) => {
        switch (s.i) {
          case 0: return { i: 1, linked: !!(v & bitAB) };
          case 1: return { i: 2, linked: s.linked, a: v };
          case 2: return (!s.linked || v === s.a)
            ? { i: 3, linked: s.linked } : undefined;
          case 3: return { i: 4, linked: s.linked, a: v };
          case 4: return (!s.linked || v === s.a) ? { i: 5 } : undefined;
          default: return undefined;
        }
      },
      accept: s => s.i === 5,
    }, shape));
  }
  return sameHeadSpecs.get(bitAB);
};

const sameHeadRules = edges.map(({ cell, other, dir }) => new NFA(
  sameHeadSpec(dir.bit), 'linked cells share a head',
  cell, headRow.at(cell), headRow.at(other), headCol.at(cell), headCol.at(other)));

// ------------------------------------------------------- per-cell rules ---

// Reads [link(c), posA(c), posA(n) for each on-grid neighbour n, posB(c),
// sizeA(c), sizeB(c)]. A cell has a predecessor (a linked neighbour one
// position behind) unless it is the head, position 1, and a successor (one
// position ahead) unless it is the tail, position = size. The mod-7 layer
// alone tells behind from ahead, the edge machine having already tied the
// two layers together; head and tail are read from both residues.
const cellSpecs = new Map();
const cellSpec = dirBits => {
  const key = dirBits.join('_');
  if (!cellSpecs.has(key)) {
    const k = dirBits.length;
    cellSpecs.set(key, NFA.encodeSpec({
      startState: { i: 0 },
      transition: (s, v) => {
        if (s.i === 0) return { i: 1, mask: v };
        if (s.i === 1) return { i: 2, mask: s.mask, p: v, back: 0, fwd: 0 };
        const j = s.i - 2;
        if (j < k) {
          let { back, fwd } = s;
          if (s.mask & dirBits[j]) {
            const d = (v - s.p + MOD_A) % MOD_A;
            if (d === 1) fwd++;
            else if (d === MOD_A - 1) back++;
            else return undefined;
            if (back > 1 || fwd > 1) return undefined;
          }
          const next = { i: s.i + 1, p: s.p, back, fwd };
          if (j + 1 < k) next.mask = s.mask;
          return next;
        }
        if (j === k) {
          const head = s.p === 1 && v === 1;
          if (s.back !== (head ? 0 : 1)) return undefined;
          return { i: s.i + 1, pA: s.p, pB: v, fwd: s.fwd };
        }
        if (j === k + 1) return { i: s.i + 1, pB: s.pB, fwd: s.fwd, sameA: v === s.pA };
        if (j === k + 2) {
          const tail = s.sameA && v === s.pB;
          return s.fwd === (tail ? 0 : 1) ? { i: s.i + 1 } : undefined;
        }
        return undefined;
      },
      accept: s => s.i === k + 5,
    }, shape));
  }
  return cellSpecs.get(key);
};

const cellRules = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(
    cellSpec(neighbours.map(entry => entry.dir.bit)), 'head, body or tail',
    cell, posA.at(cell), ...neighbours.map(entry => posA.at(entry.other)),
    posB.at(cell), sizeA.at(cell), sizeB.at(cell));
});

// Reads [posA(c), posB(c), headRow(c), headCol(c)]: the head names itself.
const headRules = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(NFA.encodeSpec({
    startState: { i: 0 },
    transition: (s, v) => {
      switch (s.i) {
        case 0: return { i: 1, head: v === 1 };
        case 1: return { i: 2, head: s.head && v === 1 };
        case 2: return (!s.head || v === row) ? { i: 3, head: s.head } : undefined;
        case 3: return (!s.head || v === col) ? { i: 4 } : undefined;
        default: return undefined;
      }
    },
    accept: s => s.i === 4,
  }, shape), 'head names itself',
  posA.at(cell), posB.at(cell), headRow.at(cell), headCol.at(cell));
});

// Reads [posA(c), posB(c), sizeA(c), sizeB(c), headRow(c), headCol(c)]: the
// tail lies after its head in reading order. Which end of a snake is the
// head is this model's choice, not the puzzle's, so it is pinned to the end
// that comes first.
const tailRules = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(NFA.encodeSpec({
    startState: { i: 0 },
    transition: (s, v) => {
      switch (s.i) {
        case 0: return { i: 1, a: v };
        case 1: return { i: 2, a: s.a, b: v };
        case 2: return { i: 3, b: s.b, sameA: v === s.a };
        case 3: return { i: 4, tail: s.sameA && v === s.b };
        case 4:
          if (!s.tail) return { i: 5, tail: false };
          if (v > row) return undefined;
          return { i: 5, tail: true, sameRow: v === row };
        case 5:
          if (!s.tail) return { i: 6 };
          return (!s.sameRow || v < col) ? { i: 6 } : undefined;
        default: return undefined;
      }
    },
    accept: s => s.i === 6,
  }, shape), 'head comes before tail in reading order',
  posA.at(cell), posB.at(cell), sizeA.at(cell), sizeB.at(cell),
  headRow.at(cell), headCol.at(cell));
});

// ------------------------------------------------------- diagonal touch ---

// One machine per diagonal pair (A, B), with K1 and K2 the two cells
// orthogonally adjacent to both, reading [headRow(A), headCol(A),
// headRow(B), headCol(B), link(K1), link(K2)]. Two cells of one snake (same
// head) may be diagonal only across a bend: K1 or K2 links to both of them
// (a cell with those two links has no others, so A-K-B is consecutive).
const diagSpecs = new Map();
const diagSpec = (needK1, needK2) => {
  const key = `${needK1}_${needK2}`;
  if (!diagSpecs.has(key)) {
    diagSpecs.set(key, NFA.encodeSpec({
      startState: { i: 0 },
      transition: (s, v) => {
        switch (s.i) {
          case 0: return { i: 1, r: v };
          case 1: return { i: 2, r: s.r, c: v };
          case 2: return { i: 3, c: s.c, same: v === s.r };
          case 3: return { i: 4, same: s.same && v === s.c };
          case 4: return { i: 5, ok: !s.same || v === needK1 };
          case 5: return (s.ok || v === needK2) ? { i: 6 } : undefined;
          default: return undefined;
        }
      },
      accept: s => s.i === 6,
    }, shape));
  }
  return diagSpecs.get(key);
};

// Walking only the down-right and down-left offsets from every cell covers
// each diagonal pair once, with both corner cells on the grid whenever the
// pair is. K1 is below A (linking N to A, sideways to B); K2 is beside A
// (linking sideways to A, S to B).
const E = 4, W = 8, N = 1, S = 2;
const diagonalRules = cells.flatMap(cell => [1, -1].flatMap(dCol => {
  const other = graph.step(cell, 1, dCol);
  if (!other) return [];
  const k1 = graph.step(cell, 1, 0);
  const k2 = graph.step(cell, 0, dCol);
  const needK1 = N | (dCol > 0 ? E : W);
  const needK2 = S | (dCol > 0 ? W : E);
  return [new NFA(diagSpec(needK1, needK2), 'snake touches itself only at a bend',
    headRow.at(cell), headCol.at(cell), headRow.at(other), headCol.at(other),
    k1, k2)];
}));

return [
  shape,
  sizeVarA,
  sizeVarB,
  posA.toVar(`position along snake mod ${MOD_A}`),
  posB.toVar(`position along snake mod ${MOD_B}`),
  headRow.toVar('head row'),
  headCol.toVar('head column'),
  ...linkDomains,
  ...domains,
  ...residueRanges,
  ...sizeGivens,
  ...edgeRules,
  ...sameHeadRules,
  ...cellRules,
  ...headRules,
  ...tailRules,
  ...diagonalRules,
];
