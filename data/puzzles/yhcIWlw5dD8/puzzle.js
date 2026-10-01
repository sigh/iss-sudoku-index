// Title: Maverick and Simon
// Author: Deckatron
// Video: https://www.youtube.com/watch?v=yhcIWlw5dD8
// Source: https://sudokupad.app/f9jwzjz6ug

// Rules encoded:
// - Normal sudoku.
// - The 12 houses (Simon's at R5C5) are counting circles.
// - One continuous loop through cell centres, king moves allowed. It enters no
//   cell twice and never crosses itself, except at R5C5, which it enters and
//   leaves four times.
// - Box borders cut the loop into segments, all with the same sum; each
//   segment contains exactly one house. Box 5 holds four separate segments,
//   each containing R5C5.
// - Red X: the two digits sum to 10 and the loop does not step across it.
// - Green arrow: points at the smaller digit, and the loop steps across it in
//   the arrow's direction.
// - The plane's cell R3C2 is on the loop.
// Nothing is omitted.
//
// Readings forced by arithmetic and the rules text:
// - "Enters and leaves the middle cell 4 times" is 8 loop steps at R5C5, which
//   has exactly 8 neighbours, so every box-5 cell steps directly to or from R5C5.
// - "Four separate segments each including the digit on Simon's house": each
//   box-5 segment is (neighbour, R5C5, neighbour), so the other step of each
//   box-5 neighbour leaves box 5.
//
// Model. The loop is directed (the arrows give its direction). Every cell but
// R5C5 carries OUT (direction to its successor) and IN (direction to its
// predecessor); R5C5 carries no route state. Cutting the loop at R5C5 leaves
// four arcs, each from a cell R5C5 steps to (an "exit" cell) to a cell that
// steps into R5C5 (an "entry" cell). Per-arc layers, each one step per cell
// along its arc:
// - two position counters, mod 8 and mod 9, reset to 0 at each exit cell. A
//   cycle avoiding R5C5 would need a length divisible by 72; it could use only
//   the 72 cells outside box 5, i.e. all of them, leaving no cell for the step
//   out of box 5 that every box-5 neighbour needs. So no such cycle exists.
// - an arc label mod 4, constant along an arc. Passing through R5C5 from an
//   entry cell to the exit cell its box-5 segment pairs it with adds 1, so the
//   four arcs form one cycle (two 2-cycles or a 1+3 split cannot add up to 0
//   mod 4). The label of the arc through the plane's cell is pinned to 0: the
//   labels are an artifact of the model, not puzzle content.
// - Outside box 5, the running segment sum as residues mod 5 and mod 9, and the
//   running house count (0/1). The common segment sum S is two Vars holding
//   its residues. A box-5 segment sums to at most 7+8+9 = 24 and any segment to
//   at most 45, so residues mod 45 decide equality with S.

const OFF = 9;                     // OUT/IN value of a cell off the loop
// Direction codes 1-8: N, NE, E, SE, S, SW, W, NW (as [dRow, dCol]).
const DIRS = [null, [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];
const ALL_DIRS = [1, 2, 3, 4, 5, 6, 7, 8];
const opp = d => ((d + 3) % 8) + 1;
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const CENTRE = 'R5C5';
const PLANE = 'R3C2';
// Drawn house markers (underlays), Simon's first.
const HOUSES = ['R5C5', 'R2C3', 'R3C5', 'R3C9', 'R5C8', 'R5C3', 'R4C1',
  'R7C6', 'R8C6', 'R8C8', 'R9C4', 'R9C3'];
// Red X overlays, as the two cells each sits between.
const X_MARKS = [['R1C3', 'R1C4'], ['R4C7', 'R4C8'], ['R4C4', 'R4C5'],
  ['R4C6', 'R5C6'], ['R5C4', 'R6C4'], ['R7C3', 'R7C4'], ['R8C3', 'R9C3'],
  ['R2C7', 'R3C7']];
// Green arrow overlays as [from, to]: the glyph (rotated clockwise by its
// angle) points at `to`.
const ARROWS = [['R3C5', 'R4C5'], ['R6C5', 'R5C5'], ['R8C5', 'R8C6'],
  ['R9C7', 'R9C6'], ['R9C5', 'R9C4'], ['R6C1', 'R5C1'], ['R2C4', 'R2C5'],
  ['R5C7', 'R5C8'], ['R3C8', 'R3C7'], ['R5C2', 'R5C3'], ['R6C6', 'R7C6'],
  ['R5C6', 'R5C7']];

const graph = cellGraph('9x9');
const cells = graph.cells();
const vOut = graph.makeOverlay('VO');
const vIn = graph.makeOverlay('VI');
const vCnt8 = graph.makeOverlay('VA');
const vCnt9 = graph.makeOverlay('VB');
const vLabel = graph.makeOverlay('VL');
const vSum5 = graph.makeOverlay('VP');
const vSum9 = graph.makeOverlay('VQ');
const vHouse = graph.makeOverlay('VH');
const S5 = 'VS1', S9 = 'VS2';      // residues of the common segment sum

const nb = (cell, d) => graph.step(cell, DIRS[d][0], DIRS[d][1]);
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
};
const dirTo = (a, b) => ALL_DIRS.find(d => nb(a, d) === b);
const isRing = cell => cell !== CENTRE && boxOf(cell) === 5;
const toCentre = cell => dirTo(cell, CENTRE);
const routeCells = cells.filter(c => c !== CENTRE);
const outerCells = cells.filter(c => boxOf(c) !== 5);
const ringCells = cells.filter(isRing);
const isHouse = new Set(HOUSES);
// Directions from `cell` to its in-grid neighbours other than R5C5, in order.
const scanDirs = cell => ALL_DIRS.filter(d => nb(cell, d) && nb(cell, d) !== CENTRE);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};
const mod = (a, m) => ((a % m) + m) % m;

// --- Domains -----------------------------------------------------------------
// OUT/IN may point only at an in-grid neighbour. A box-5 neighbour steps to or
// from R5C5 or out of box 5 (the four-separate-segments clarification). An X
// edge is never stepped across. An arrow fixes its tail's OUT. The plane's
// cell is on the loop.
const outDom = new Map(), inDom = new Map();
for (const cell of routeCells) {
  const ok = ALL_DIRS.filter(d => {
    const n = nb(cell, d);
    if (!n) return false;
    if (isRing(cell)) return n === CENTRE || boxOf(n) !== 5;
    return true;
  });
  outDom.set(cell, new Set([...ok, OFF]));
  inDom.set(cell, new Set([...ok, OFF]));
}
for (const [a, b] of X_MARKS) {
  outDom.get(a).delete(dirTo(a, b)); inDom.get(a).delete(dirTo(a, b));
  outDom.get(b).delete(dirTo(b, a)); inDom.get(b).delete(dirTo(b, a));
}
for (const [a, b] of ARROWS) {
  if (a !== CENTRE) outDom.set(a, new Set([dirTo(a, b)]));
  if (b !== CENTRE) inDom.set(b, new Set([dirTo(b, a)]));
}
outDom.get(PLANE).delete(OFF);
// One value-set restriction stamped over a whole layer.
const layerDomain = (ov, values) => ov.makeReplicate(new Given(ov.at(cells[0]), ...values));
const domains = [
  ...routeCells.flatMap(c => [
    new Given(vOut.at(c), ...[...outDom.get(c)].sort()),
    new Given(vIn.at(c), ...[...inDom.get(c)].sort())]),
  // R5C5 has no route state; its layer cells are fixed placeholders.
  ...[vOut, vIn, vCnt8, vCnt9, vLabel, vSum5, vSum9, vHouse].map(
    ov => new Given(ov.at(CENTRE), 1)),
  // Running sums and house counts are carried outside box 5 only.
  ...ringCells.flatMap(c => [vSum5, vSum9, vHouse].map(ov => new Given(ov.at(c), 1))),
  layerDomain(vCnt8, range(1, 8)),
  layerDomain(vLabel, range(1, 4)),
  layerDomain(vSum5, range(1, 5)),
  layerDomain(vHouse, [1, 2]),
  new Given(S5, ...range(1, 5)),
];

// --- Loop shape --------------------------------------------------------------
// On the loop iff OUT is not OFF iff IN is not OFF; no immediate reversal.
const shapeKey = Pair.fnToKey((o, i) => (o === OFF) === (i === OFF) &&
  (o === OFF || o !== i), 9);
// Edge agreement: a steps to its neighbour b in direction d iff b's
// predecessor lies in direction opp(d).
const agreeKey = d => cached('agree' + d, () =>
  Pair.fnToKey((o, i) => (o === d) === (i === opp(d)), 9));
// A box-5 neighbour has one of its two steps to/from R5C5.
const ringKey = t => cached('ring' + t, () =>
  Pair.fnToKey((o, i) => o === t || i === t, 9));
const loopShape = [
  ...routeCells.map(c => new Pair(shapeKey, 'loop-cell', vOut.at(c), vIn.at(c))),
  ...routeCells.flatMap(a => scanDirs(a).map(d =>
    new Pair(agreeKey(d), 'loop-edge', vOut.at(a), vIn.at(nb(a, d))))),
  ...ringCells.map(c => new Pair(ringKey(toCentre(c)), 'simons-house',
    vOut.at(c), vIn.at(c))),
];

// No crossing: in each 2x2 block, the two diagonal steps are not both used.
// Read as [OUT(TL), IN(TL), OUT(TR), IN(TR)]; TL uses SE (4), TR uses SW (6).
// Blocks containing R5C5 need nothing: their other diagonal joins two box-5
// neighbours, which the domains already forbid.
const noCrossNFA = NFA.encodeSpec({
  startState: { k: 0, a: false, b: false },
  transition: (s, v) => {
    if (s.k === 0 || s.k === 1) return { k: s.k + 1, a: s.a || v === 4, b: false };
    if (s.k === 2 || s.k === 3) {
      const b = s.b || v === 6;
      if (s.a && b) return undefined;
      return { k: s.k + 1, a: s.a, b };
    }
    return undefined;
  },
  accept: s => s.k === 4,
}, 9);
const noCross = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const tl = makeCellId(r, c), tr = makeCellId(r, c + 1);
    const block = [tl, tr, makeCellId(r + 1, c), makeCellId(r + 1, c + 1)];
    if (block.includes(CENTRE)) continue;
    noCross.push(new NFA(noCrossNFA, 'no-cross',
      vOut.at(tl), vIn.at(tl), vOut.at(tr), vIn.at(tr)));
  }
}

// --- Per-arc layers ------------------------------------------------------------
// Shared tail of the predecessor machines: after the cell's own value, scan the
// layer values of its neighbours (directions `dirs`); the one in direction
// `dir` must equal `need`.
const tailStep = (dirs, s, v) => {
  const d = dirs[s.i];
  if (d === undefined) return undefined;
  if (d === s.dir && v !== s.need) return undefined;
  return { p: 'tail', i: s.i + 1, dir: s.dir, need: s.need };
};
const tailAccept = (dirs, s) => s.p === 'done' || (s.p === 'tail' && s.i === dirs.length);
const doneStep = s => ({ p: 'done' });

// Counter mod m (values 1..m = residue 0..m-1), over [IN, own, neighbours...]:
// off the loop or right after R5C5 it is 0, else predecessor + 1.
const counterNFA = (cell, m) => {
  const dirs = scanDirs(cell), tc = isRing(cell) ? toCentre(cell) : 0;
  return cached('cnt' + m + '|' + tc + '|' + dirs.join(''), () => NFA.encodeSpec({
    startState: { p: 'in' },
    transition: (s, v) => {
      if (s.p === 'done') return doneStep(s);
      if (s.p === 'in') return { p: 'own', dir: v };
      if (s.p === 'own') {
        if (s.dir === OFF || s.dir === tc) return v === 1 ? { p: 'done' } : undefined;
        return { p: 'tail', i: 0, dir: s.dir, need: v === 1 ? m : v - 1 };
      }
      return tailStep(dirs, s, v);
    },
    accept: s => tailAccept(dirs, s),
  }, 9));
};

// Arc label (values 1..4): 1 off the loop; equal to the predecessor's along an
// arc. An exit cell's label is set by the R5C5 pairing below.
const labelNFA = cell => {
  const dirs = scanDirs(cell), tc = isRing(cell) ? toCentre(cell) : 0;
  return cached('lab|' + tc + '|' + dirs.join(''), () => NFA.encodeSpec({
    startState: { p: 'in' },
    transition: (s, v) => {
      if (s.p === 'done') return doneStep(s);
      if (s.p === 'in') return { p: 'own', dir: v };
      if (s.p === 'own') {
        if (s.dir === OFF) return v === 1 ? { p: 'done' } : undefined;
        if (s.dir === tc) return { p: 'done' };
        return { p: 'tail', i: 0, dir: s.dir, need: v };
      }
      return tailStep(dirs, s, v);
    },
    accept: s => tailAccept(dirs, s),
  }, 9));
};

// Does a step from `cell` in direction d cross a box border? (Off-grid
// directions are excluded by the domains; treat them as crossing.)
const crossesFrom = cell => d => !nb(cell, d) || boxOf(nb(cell, d)) !== boxOf(cell);
const crossMask = cell => ALL_DIRS.map(d => crossesFrom(cell)(d) ? 1 : 0).join('');

// Running segment sum mod m outside box 5, over
// [OUT, S residue, IN, digit, own, neighbours...]. Off the loop: 0. A segment
// restarts when the predecessor is in another box; the cell whose successor is
// in another box ends its segment, and its running sum must equal S.
const sumNFA = (cell, m) => {
  const dirs = scanDirs(cell);
  const crosses = crossesFrom(cell);
  return cached('sum' + m + '|' + crossMask(cell) + '|' + dirs.join(''), () => NFA.encodeSpec({
    startState: { p: 'out' },
    transition: (s, v) => {
      if (s.p === 'done') return doneStep(s);
      if (s.p === 'out') return { p: 's', end: v !== OFF && crosses(v) };
      if (s.p === 's') return { p: 'in', sr: s.end ? v - 1 : -1 };
      if (s.p === 'in') return { p: 'digit', sr: s.sr, dir: v };
      if (s.p === 'digit') {
        if (s.dir === OFF) return { p: 'own', sr: -1, want: 0 };
        if (crosses(s.dir)) return { p: 'own', sr: s.sr, want: mod(v, m) };
        return { p: 'own', sr: s.sr, dir: s.dir, d: v };
      }
      if (s.p === 'own') {
        const r = v - 1;
        if (s.sr >= 0 && r !== s.sr) return undefined;
        if (s.want !== undefined) return r === s.want ? { p: 'done' } : undefined;
        return { p: 'tail', i: 0, dir: s.dir, need: mod(r - s.d, m) + 1 };
      }
      return tailStep(dirs, s, v);
    },
    accept: s => tailAccept(dirs, s),
  }, 9));
};

// Houses so far in the segment outside box 5 (values 1, 2 = count 0, 1), over
// [OUT, IN, own, neighbours...]: never above 1, exactly 1 at the segment end.
const houseNFA = cell => {
  const dirs = scanDirs(cell), h = isHouse.has(cell) ? 1 : 0;
  const crosses = crossesFrom(cell);
  return cached('house' + h + '|' + crossMask(cell) + '|' + dirs.join(''), () => NFA.encodeSpec({
    startState: { p: 'out' },
    transition: (s, v) => {
      if (s.p === 'done') return doneStep(s);
      if (s.p === 'out') return { p: 'in', end: v !== OFF && crosses(v) };
      if (s.p === 'in') return { p: 'own', end: s.end, dir: v };
      if (s.p === 'own') {
        const n = v - 1;
        if (s.dir === OFF) return n === 0 ? { p: 'done' } : undefined;
        if (s.end && n !== 1) return undefined;
        if (crosses(s.dir)) return n === h ? { p: 'done' } : undefined;
        if (n - h < 0) return undefined;
        return { p: 'tail', i: 0, dir: s.dir, need: n - h + 1 };
      }
      return tailStep(dirs, s, v);
    },
    accept: s => tailAccept(dirs, s),
  }, 9));
};

// Pairing at R5C5, one machine per box-5 neighbour X, over
// [IN(X), S mod 5, S mod 9, digit(R5C5), digit(X), label(X), then for each
// other box-5 neighbour Y: OUT(Y), digit(Y), label(Y)]. If X is an exit cell,
// some entry cell Y has digit(Y) + digit(R5C5) + digit(X) = S (that box-5
// segment), and label(X) = label(Y) + 1 mod 4. Box-5 digits are distinct, so
// each exit has one partner and the pairing is a bijection.
const crt = (r5, r9) => range(0, 44).find(n => n % 5 === r5 && n % 9 === r9);
const pairingNFA = (cell, others) => {
  const tc = toCentre(cell), otc = others.map(toCentre);
  return cached('pair|' + tc + '|' + otc.join(''), () => NFA.encodeSpec({
    startState: { p: 'in' },
    transition: (s, v) => {
      switch (s.p) {
        case 'free': return s;
        case 'in': return v === tc ? { p: 's5' } : { p: 'free' };
        case 's5': return { p: 's9', r5: v - 1 };
        case 's9': return { p: 'c', S: crt(s.r5, v - 1) };
        case 'c': return { p: 'x', rest: s.S - v };
        case 'x': {
          const need = s.rest - v;
          return need >= 1 && need <= 9 ? { p: 'lab', need } : undefined;
        }
        case 'lab':
          if (v > 4) return undefined;
          return { p: 'y', i: 0, k: 0, need: s.need, want: v === 1 ? 4 : v - 1 };
        case 'y': {
          // Once a partner is found, the rest of the scan only counts cells.
          if (s.i >= otc.length) return undefined;
          const i = s.k === 2 ? s.i + 1 : s.i, k = (s.k + 1) % 3;
          if (s.hit) return { p: 'y', i, k, hit: true };
          const next = { p: 'y', i, k, need: s.need, want: s.want };
          if (s.k === 0) next.cand = v === otc[s.i];
          else if (s.k === 1) next.cand = s.cand && v === s.need;
          else if (s.cand && v === s.want) return { p: 'y', i, k, hit: true };
          return next;
        }
      }
      return undefined;
    },
    accept: s => s.p === 'free' || (s.p === 'y' && s.i === otc.length && s.hit),
  }, 9));
};

const arcs = [
  ...routeCells.flatMap(c => [[vCnt8, 8], [vCnt9, 9]].map(([ov, m]) =>
    new NFA(counterNFA(c, m), 'arc-position', vIn.at(c), ov.at(c),
      ...scanDirs(c).map(d => ov.at(nb(c, d)))))),
  ...routeCells.map(c => new NFA(labelNFA(c), 'arc-label', vIn.at(c),
    vLabel.at(c), ...scanDirs(c).map(d => vLabel.at(nb(c, d))))),
  new Given(vLabel.at(PLANE), 1),
];

const segments = [
  ...outerCells.flatMap(c => [[vSum5, 5, S5], [vSum9, 9, S9]].map(([ov, m, sv]) =>
    new NFA(sumNFA(c, m), 'segment-sum', vOut.at(c), sv, vIn.at(c), c,
      ov.at(c), ...scanDirs(c).map(d => ov.at(nb(c, d)))))),
  ...outerCells.map(c => new NFA(houseNFA(c), 'one-house', vOut.at(c), vIn.at(c),
    vHouse.at(c), ...scanDirs(c).map(d => vHouse.at(nb(c, d))))),
  ...ringCells.map(c => {
    const others = ringCells.filter(o => o !== c);
    return new NFA(pairingNFA(c, others), 'simons-segments', vIn.at(c), S5, S9,
      CENTRE, c, vLabel.at(c), ...others.flatMap(o => [vOut.at(o), o, vLabel.at(o)]));
  }),
];

// --- Digit clues -----------------------------------------------------------------
const clues = [
  new CountingCircles(...HOUSES),
  ...X_MARKS.map(([a, b]) => new X(a, b)),
  ...ARROWS.map(([a, b]) => new GreaterThan(a, b)),
];

return [
  new Shape('9x9'),
  ...[vOut, vIn, vCnt8, vCnt9, vLabel, vSum5, vSum9, vHouse].map((ov, i) =>
    ov.toVar(['loop out', 'loop in', 'arc position mod 8', 'arc position mod 9',
      'arc label', 'segment sum mod 5', 'segment sum mod 9', 'segment houses'][i])),
  new Var('S', 'common segment sum residues', 2),
  ...domains,
  ...loopShape,
  ...noCross,
  ...arcs,
  ...segments,
  ...clues,
];
