// Title: Pentomino-Rundreise
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=emH5qSvPTes
// Source: https://tinyurl.com/y22mojbw

// Rules encoded here, in full:
//  * Every cell of the 10x15 grid is part of exactly one pentomino.
//  * Orthogonally adjacent pentominoes are different from each other: one
//    cannot be turned into the other by rotation and/or reflection, i.e. they
//    are different free pentominoes (F I L N P T U V W X Y Z).
//  * A single closed loop runs horizontally and vertically between the centres
//    of cells and may not cross or touch itself.
//  * A clue in a cell gives how many cells of that cell's pentomino the loop
//    passes through. Every pentomino contains at most one clue. A pentomino
//    without a clue is visited by the loop at least once.
// Nothing is omitted.
//
// "May not cross or touch itself" is about the drawn line, which meets itself
// only at a reused cell: the loop uses each cell at most once and never
// branches, while two non-consecutive loop cells may be orthogonal neighbours.
//
// The puzzle has no digits. The board is a Raw 10x15 grid whose cells carry
// the type of the pentomino covering them (1..12 in the order F I L N P T U V
// W X Y Z). A pentomino is small enough to be named by the offset from its
// first cell in reading order (the leftmost cell of its top row) to each of its
// cells, so VA/VB hold that offset's row and column parts. VS holds a directed
// loop code per cell and VP/VQ two loop position counters.

const NV = 14;                // widest layer: VP holds OFF plus 13 counter values
const MOD_A = 13, MOD_B = 12; // coprime; lcm 156 > 148, the longest (even) cycle
                              // that could avoid the seam cell on 150 cells
const RIGHT = [0, 1], DOWN = [1, 0];

const shape = new Shape('10x15', NV, 'Raw');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const cellAt = (row, col) => makeCellId(row, col);

// Clue numbers, from the drawn cell digits: [row, column, value].
const CLUES = [
  [1, 1, 1], [1, 2, 2], [1, 4, 2], [1, 10, 2], [1, 13, 5], [1, 15, 1],
  [2, 7, 1],
  [3, 1, 2], [3, 6, 5], [3, 14, 1],
  [4, 2, 1], [4, 3, 1], [4, 5, 1], [4, 7, 2], [4, 9, 2], [4, 12, 4],
  [5, 15, 4],
  [6, 4, 5], [6, 8, 5], [6, 10, 2],
  [7, 5, 3], [7, 7, 1], [7, 14, 3],
  [8, 1, 1], [8, 9, 3],
  [10, 4, 3], [10, 14, 1],
];
const clueAt = new Map(CLUES.map(([r, c, v]) => [cellAt(r, c), v]));
// The loop counter below is only ever compared against a clue or against 1, so
// counting past the largest clue changes no answer. Letting it run to the window
// length instead splits every later state by a count nothing reads.
const MAX_CLUE = Math.max(...CLUES.map(([, , v]) => v));

// --- The twelve free pentominoes ----------------------------------------
// One drawing per type; the board value of a cell is TYPE_ART index + 1.
const TYPE_ART = [
  '.XX\nXX.\n.X.',         // 1 = F
  'XXXXX',                 // 2 = I
  'X.\nX.\nX.\nXX',        // 3 = L
  '.X\n.X\nXX\nX.',        // 4 = N
  'XX\nXX\nX.',            // 5 = P
  'XXX\n.X.\n.X.',         // 6 = T
  'X.X\nXXX',              // 7 = U
  'X..\nX..\nXXX',         // 8 = V
  'X..\nXX.\n.XX',         // 9 = W
  '.X.\nXXX\n.X.',         // 10 = X
  '.X\nXX\n.X\n.X',        // 11 = Y
  'XX.\n.X.\n.XX',         // 12 = Z
];
const NUM_TYPES = TYPE_ART.length;

const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
// Translate a shape so its first cell in reading order sits at [0, 0].
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const parseArt = (art) => normalise(art.split('\n').flatMap(
  (line, r) => [...line].flatMap((ch, c) => ch === 'X' ? [[r, c]] : [])));

// The rotations and reflections of a shape: all images of one free pentomino
// are the same type, which is what "different" means in the adjacency rule.
const orientations = (cells) => {
  const out = new Map();
  let turned = cells;
  for (let i = 0; i < 4; i++) {
    turned = turned.map(([r, c]) => [c, -r]);
    for (const image of [turned, turned.map(([r, c]) => [r, -c])]) {
      const norm = normalise(image);
      out.set(key(norm), norm);
    }
  }
  return [...out.values()];
};

// SHAPES[i] = { offsets, type }: every placement a pentomino may take, as the
// offsets from its first cell, tagged with its type. 63 entries.
const SHAPES = TYPE_ART.flatMap((art, i) =>
  orientations(parseArt(art)).map(offsets => ({ offsets, type: i + 1 })));

// The 21 distinct offsets in reading order; OFFSETS[0] is [0, 0], the first
// cell itself. Rows run 0..4 and columns -3..4.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// VA/VB hold the offset's row and column parts shifted into 1..5 and 1..8.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');

// Compiling an NFA spec is expensive and many cells share one: memoise by the
// spec's parameters so each distinct machine is built once.
const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};

// The cells that could point at `cell` as their first cell, as offset indices.
// Slots are read nearest-first. The order is free -- the machines below check a
// conjunction over the window, and each rule passes its cells in this same order
// -- but it decides how fast a scan narrows its candidate set, and so how many
// states the machine has before ISS minimises it. Minimisation compares every
// pair of states, so its cost grows with the square of that count: reading the
// neighbours that discriminate soonest is worth about a quarter of build time.
const windowOf = (cell) => OFFSETS.map((o, i) => i)
  .filter(i => i > 0 && graph.step(cell, ...OFFSETS[i]))
  .sort((i, j) => {
    const [ar, ac] = OFFSETS[i], [br, bc] = OFFSETS[j];
    return (Math.abs(ar) + Math.abs(ac)) - (Math.abs(br) + Math.abs(bc))
      || ar - br || ac - bc;
  });
const memberAt = (cell, i) => graph.step(cell, ...OFFSETS[i]);

// --- Offset domain ------------------------------------------------------
// A cell's offset must be one a pentomino actually has, and must leave its
// first cell on the grid. Whether that first cell really anchors a pentomino
// containing this cell is settled by the shape machine below.
const offsetDomain = memo((allowed) => Pair.fnToKey(
  (a, b) => allowed.some(([dr, dc]) => encA(dr) === a && encB(dc) === b), NV));

const offsetRules = gridCells.map(cell => new Pair(
  offsetDomain(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'offset', va.at(cell), vb.at(cell)));

// --- Pentomino shape ----------------------------------------------------
// One machine per cell, over that cell and every cell that could point at it.
// If the cell is a pentomino's first cell, the set of cells pointing at it must
// be exactly one placement of the type its board value names, which fixes the
// piece's membership, size, connectedness and shape at once; if it is not a
// first cell, nothing may point at it. Together over all cells this makes the
// pieces a partition of the grid.
// Read as [type, VA, VB of the cell, then VA, VB of each candidate member].
// A member's row code is reduced to "matches this slot" before its column code
// is read, which keeps the state count inside the compile cap.
const shapeNFA = memo((window) => {
  const candidates = SHAPES.map((shape, index) => ({ shape, index }))
    .filter(({ shape }) => shape.offsets.every(
      o => OFFSET_POS.get(key(o)) === 0 || window.includes(OFFSET_POS.get(key(o)))));
  return NFA.encodeSpec({
    startState: { phase: 'type' },
    transition: (state, value) => {
      if (state.phase === 'type') return { phase: 'a', type: value };
      if (state.phase === 'a') {
        return { phase: 'b', type: state.type, firstA: value === FIRST_A };
      }
      if (state.phase === 'b') {
        if (!state.firstA || value !== FIRST_B) return { phase: 'w', i: 0, cand: null };
        const cand = candidates
          .filter(c => c.shape.type === state.type).map(c => c.index);
        return cand.length ? { phase: 'w', i: 0, cand } : undefined;
      }
      if (state.phase === 'w') {
        if (state.i >= window.length) return undefined;
        const [dr] = OFFSETS[window[state.i]];
        return { phase: 'wb', i: state.i, cand: state.cand, rowOk: value === encA(dr) };
      }
      // A member declares the offset of the window slot it sits in.
      const [, dc] = OFFSETS[window[state.i]];
      const points = state.rowOk && value === encB(dc);
      if (state.cand === null) {
        return points ? undefined : { phase: 'w', i: state.i + 1, cand: null };
      }
      const cand = state.cand.filter(
        index => SHAPES[index].offsets.some(
          o => OFFSET_POS.get(key(o)) === window[state.i]) === points);
      if (!cand.length) return undefined;
      return { phase: 'w', i: state.i + 1, cand };
    },
    accept: (state) => state.phase === 'w' && state.i === window.length,
  }, NV);
});

const shapeRules = gridCells.map(cell => {
  const window = windowOf(cell);
  const members = window.flatMap(i => [va.at(memberAt(cell, i)), vb.at(memberAt(cell, i))]);
  return new NFA(shapeNFA(window), 'piece-shape',
    cell, va.at(cell), vb.at(cell), ...members);
});

// --- Type spread and the adjacency rule ---------------------------------
// Two orthogonal neighbours share a pentomino exactly when their offsets
// differ by the step between them. Same piece means the same type; different
// pieces that touch must be of different types, which is the adjacency rule.
// So neighbours carry equal types if and only if they share a piece.
// Read as [VA cell, VA neighbour, VB cell, VB neighbour, type cell, type nb].
const sharedPieceNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      return { phase: 'b1', same: value - state.a === dRow };
    }
    if (state.phase === 'b1') return { phase: 'b2', same: state.same, b: value };
    if (state.phase === 'b2') {
      return { phase: 't1', same: state.same && value - state.b === dCol };
    }
    if (state.phase === 't1') return { phase: 't2', same: state.same, t: value };
    return (state.t === value) === state.same ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, NV));

const pieceTypeRules = gridCells.flatMap(cell =>
  [RIGHT, DOWN].flatMap(([dr, dc]) => {
    const other = graph.step(cell, dr, dc);
    if (!other) return [];
    return [new NFA(sharedPieceNFA(dr, dc), 'piece-type',
      va.at(cell), va.at(other), vb.at(cell), vb.at(other), cell, other)];
  }));

// --- The loop -----------------------------------------------------------
// VS holds a directed shape code per cell: OFF, or the side the loop enters
// the cell from paired with the side it leaves by. An on-loop cell therefore
// uses exactly two of its four edges and no code branches or crosses.
// Edge-agreement Pairs orient each used edge the same way from both ends, so
// the used edges form a disjoint union of directed cycles. Two position
// counters modulo the coprime MOD_A and MOD_B then leave exactly one cycle:
// each advances by one along every used edge except the single edge running
// into the seam cell, so a cycle avoiding the seam would have to close after a
// number of steps divisible by lcm(13, 12) = 156, more cells than the grid has.
const OFF = 1;   // shape code, and counter value, of a cell the loop misses
const POS0 = 2;  // counter value of the seam cell (position 0)

const SIDES = ['U', 'D', 'L', 'R'];
const STEP = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
const OPPOSITE = { U: 'D', D: 'U', L: 'R', R: 'L' };

// Shape codes: OFF, then one code per ordered (entry side, exit side) pair.
const CODES = [null, null];
for (const entry of SIDES) {
  for (const exit of SIDES) {
    if (entry !== exit) CODES.push({ entry, exit });
  }
}
const ALL_CODES = CODES.map((_, code) => code).slice(OFF);
// Values above the last code (the widened alphabet reaches NV) are no code.
const isOnLoop = code => CODES[code] != null;
const entersFrom = (code, side) => isOnLoop(code) && CODES[code].entry === side;
const exitsTo = (code, side) => isOnLoop(code) && CODES[code].exit === side;
const usesSide = (code, side) => entersFrom(code, side) || exitsTo(code, side);

const loop = graph.makeOverlay('VS');
const posA = graph.makeOverlay('VP');
const posB = graph.makeOverlay('VQ');

// Each orthogonal edge once, as (a, b) with `side` the direction a -> b.
const edges = gridCells.flatMap(cell => ['D', 'R'].flatMap(side => {
  const other = graph.step(cell, ...STEP[side]);
  return other ? [{ a: cell, b: other, side }] : [];
}));

// A code is available only if every side it uses leads to an in-grid cell.
const availableCodes = cell => ALL_CODES.filter(code => SIDES.every(
  side => !usesSide(code, side) || graph.step(cell, ...STEP[side]) !== null));

// R1C13 holds the clue 5, so all five cells of its pentomino, itself included,
// are on the loop: it is a safe seam. It sits on the top edge, so its two used
// sides are two of left, right and down. Keeping one directed code per
// unordered pair of sides removes only the choice of which way round the
// single loop is traversed.
const SEAM = cellAt(1, 13);
const seamCodes = availableCodes(SEAM).filter(code => isOnLoop(code)
  && SIDES.indexOf(CODES[code].entry) < SIDES.indexOf(CODES[code].exit));

// Interior cells admit every code and share one stamped Given; edge cells and
// the seam list their own.
const interior = gridCells.filter(
  cell => cell !== SEAM && availableCodes(cell).length === ALL_CODES.length);
const codeDomains = [
  loop.makeReplicate(
    new Given(loop.at(interior[0]), ...ALL_CODES), loop.at(interior)),
  ...gridCells.filter(cell => !interior.includes(cell)).map(cell => new Given(
    loop.at(cell), ...(cell === SEAM ? seamCodes : availableCodes(cell)))),
];

// Edge agreement across the shared border of a cell and its neighbour on
// `side`: a's exit that way is b's entry back, and a's entry that way is b's
// exit back.
const agreementKey = side => Pair.fnToKey(
  (codeA, codeB) => exitsTo(codeA, side) === entersFrom(codeB, OPPOSITE[side])
    && entersFrom(codeA, side) === exitsTo(codeB, OPPOSITE[side]),
  NV);
const agreement = [
  loop.makeReplicate(
    new Pair(agreementKey('R'), 'edge-h', loop.at(gridCells[0]), loop.at(graph.step(gridCells[0], 0, 1))),
    loop.at(gridCells.filter(cell => graph.step(cell, 0, 1)))),
  loop.makeReplicate(
    new Pair(agreementKey('D'), 'edge-v', loop.at(gridCells[0]), loop.at(graph.step(gridCells[0], 1, 0))),
    loop.at(gridCells.filter(cell => graph.step(cell, 1, 0)))),
];

// Counter values run POS0, POS0+1, ... POS0+mod-1 and wrap.
const nextPos = (value, mod) => POS0 + ((value - POS0 + 1) % mod);

// Reads a cell's shape code, then its counter and its `side` neighbour's
// counter. If the loop leaves the first cell towards the second, the second
// counter is one further on, and vice versa; an unused edge says nothing.
// `intoBSeam` / `intoASeam` mark an edge whose target is the seam cell, the
// one edge exempted so that the loop through the seam can close.
const counterSpec = memo((side, mod, intoBSeam, intoASeam) => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (state, value) => {
    if (state.k === 0) return { k: 1, code: value };
    if (state.k === 1) return { k: 2, code: state.code, a: value };
    if (state.k !== 2) return undefined;
    const forward = exitsTo(state.code, side);
    const backward = entersFrom(state.code, side);
    if (!forward && !backward) return { done: true };
    if (state.a === OFF || value === OFF) return undefined;
    if (forward) {
      return intoBSeam || value === nextPos(state.a, mod)
        ? { done: true } : undefined;
    }
    return intoASeam || state.a === nextPos(value, mod)
      ? { done: true } : undefined;
  },
  accept: state => state.done === true,
}, NV));

const counters = edges.flatMap(({ a, b, side }) => [
  new NFA(counterSpec(side, MOD_A, b === SEAM, a === SEAM), 'loop-order',
    loop.at(a), posA.at(a), posA.at(b)),
  new NFA(counterSpec(side, MOD_B, b === SEAM, a === SEAM), 'loop-order',
    loop.at(a), posB.at(a), posB.at(b)),
]);

// A cell is numbered exactly when it is on the loop, so the counters carry no
// choice of their own on cells the loop misses.
const numberedKey = Pair.fnToKey(
  (code, pos) => isOnLoop(code) === (pos !== OFF), NV);
const numbered = gridCells.flatMap(cell => [
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posA.at(cell)),
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posB.at(cell)),
]);

const seam = [
  new Given(posA.at(SEAM), POS0),
  new Given(posB.at(SEAM), POS0),
];

// --- Clues, one clue per piece, and the visit rule ----------------------
// One machine per cell, over that cell and every cell that could point at it,
// i.e. over the whole pentomino the cell anchors when it is a first cell. The
// clue values are fixed per cell, so they are parameters of the machine. For a
// first cell the machine records the piece's clue, rejecting a second one, and
// counts the piece's loop cells; at the end the count must equal the clue, or
// be at least 1 when the piece has no clue. A cell that is not a first cell
// anchors no piece and the machine accepts whatever follows.
// Read as [VA, VB, VS of the cell, then VA, VB, VS of each candidate member].
const pieceLoopNFA = memo((window, rootClue, slotClues) => NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'skip') return { phase: 'skip' };
    if (state.phase === 'a') return { phase: 'b', firstA: value === FIRST_A };
    if (state.phase === 'b') {
      if (!state.firstA || value !== FIRST_B) return { phase: 'skip' };
      return { phase: 's', target: rootClue, loops: 0 };
    }
    if (state.phase === 's') {
      return { phase: 'w', i: 0, target: state.target,
               loops: isOnLoop(value) ? 1 : 0 };
    }
    if (state.phase === 'w') {
      if (state.i >= window.length) return undefined;
      const [dr] = OFFSETS[window[state.i]];
      return { phase: 'wb', i: state.i, target: state.target,
               loops: state.loops, rowOk: value === encA(dr) };
    }
    if (state.phase === 'wb') {
      const [, dc] = OFFSETS[window[state.i]];
      const member = state.rowOk && value === encB(dc);
      let target = state.target;
      if (member && slotClues[state.i] !== null) {
        if (target !== null) return undefined;  // a second clue in one piece
        target = slotClues[state.i];
      }
      return { phase: 'ws', i: state.i, target, loops: state.loops, member };
    }
    // phase 'ws': the member's loop code. The count saturates one past the
    // largest clue: beyond that it can only fail, and the accept test reads it
    // as "equals the clue" or "at least one", both settled by then.
    const loops = Math.min(
      state.loops + (state.member && isOnLoop(value) ? 1 : 0), MAX_CLUE + 1);
    if (state.target !== null && loops > state.target) return undefined;
    return { phase: 'w', i: state.i + 1, target: state.target, loops };
  },
  accept: (state) => state.phase === 'skip' || (
    state.phase === 'w' && state.i === window.length &&
    (state.target === null ? state.loops >= 1 : state.loops === state.target)),
}, NV));

const pieceLoopRules = gridCells.map(cell => {
  const window = windowOf(cell);
  const slotClues = window.map(i => clueAt.get(memberAt(cell, i)) ?? null);
  const members = window.flatMap(i => {
    const member = memberAt(cell, i);
    return [va.at(member), vb.at(member), loop.at(member)];
  });
  return new NFA(pieceLoopNFA(window, clueAt.get(cell) ?? null, slotClues),
    'piece-loop', va.at(cell), vb.at(cell), loop.at(cell), ...members);
});

// --- Domains ------------------------------------------------------------
const range = (n, from) => Array.from({ length: n }, (_, k) => k + from);
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(NUM_TYPES, 1))),
  posA.makeReplicate(new Given(posA.at(gridCells[0]), ...range(MOD_A + 1, 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(MOD_B + 1, 1))),
];

return [
  shape,
  va.toVar('offsetRow'),
  vb.toVar('offsetCol'),
  loop.toVar('loop shape'),
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  ...domains,
  ...offsetRules,
  ...shapeRules,
  ...pieceTypeRules,
  ...codeDomains,
  ...seam,
  ...agreement,
  ...numbered,
  ...counters,
  ...pieceLoopRules,
];
