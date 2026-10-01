// Title: Switching circuit
// Author: Neil Armchair
// Video: https://www.youtube.com/watch?v=a5CBygZYSFY
// Source: https://sudokupad.app/fplfqjp556

// Rules encoded below:
//   Normal sudoku with the digits 1-9.
//   Two lines are drawn through cell centres, moving orthogonally: one joins
//   the two "A" cells (R8C2, R7C7), the other the two "B" cells (R1C2, R5C9).
//   Each cell is visited at most once and by at most one line. Lines never
//   enter a blue square or yellow diamond cell. A line may run alongside
//   itself; nothing forbids that.
//   Unique region sum lines: box borders cut each line into segments, every
//   segment of one line sums to that line's N (the two lines may differ). A
//   line that visits a box twice has two segments there.
//   Rotation switch: rotating the middle box (cells and line pieces) by 180
//   degrees must leave exactly two lines, no loose ends or loops, each joining
//   an "A" to a "B".
//   Blue square: its digit counts the line cells among its 8 king neighbours
//   (before rotation).
//   Yellow diamond: its digit counts the line cells in the arrow direction.
// Not encoded:
//   "Each line segment must have a unique combination of digits."
//   "After rotation, the two lines are no longer valid unique region sum lines."

// The overlays carry values up to 15, so the alphabet is widened to 0-15 and
// the playable cells are pinned back to 1-9.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Drawn marks, read from the payload's underlays.
const BLUE = ['R9C2', 'R4C3', 'R6C3', 'R5C5', 'R3C6', 'R8C9'];
const YELLOW = [['R1C8', 1, 0], ['R1C9', 1, 0], ['R8C1', 0, 1]];  // [cell, dR, dC] of the arrow
const BLOCKED = new Set([...BLUE, ...YELLOW.map(([cell]) => cell)]);
// Line ends: [start, end] per line. Which end is the start only orients the
// auxiliary predecessor pointers; the lines themselves are undirected.
const LINES = [['R8C2', 'R7C7'], ['R1C2', 'R5C9']];  // A, B
const STARTS = LINES.map(l => l[0]);
const ENDS = LINES.map(l => l[1]);

const boxOf = (cell) => {
  const { row, col } = parseCellId(cell);
  return ((row - 1) / 3 | 0) * 3 + ((col - 1) / 3 | 0);
};
const MIDDLE_BOX = 4;
const rotate = (cell) => {
  const { row, col } = parseCellId(cell);
  return makeCellId(10 - row, 10 - col);
};

// VP: 0 = not on a line; otherwise 1 + 5*line + k, where line is 0 (A) or
// 1 (B) and k is 0 at the line's start cell, else the direction of the
// previous line cell (1 N, 2 E, 3 S, 4 W).
const OFF = 0;
const code = (line, k) => 1 + 5 * line + k;
const lineOf = (v) => (v - 1) / 5 | 0;
const kOf = (v) => (v - 1) % 5;
const DIRS = [null, [-1, 0], [0, 1], [1, 0], [0, -1]];
const BACK = [null, 3, 4, 1, 2];
const nbAt = (cell, k) => {
  const nb = graph.step(cell, ...DIRS[k]);
  return nb && !BLOCKED.has(nb) ? nb : null;
};
const nbDirs = (cell) => [1, 2, 3, 4].filter(k => nbAt(cell, k));
const codesFrom = (k) => [code(0, k), code(1, k)];
const range = (n) => [...Array(n).keys()];

const vp = graph.makeOverlay('VP');
const vo = graph.makeOverlay('VO');
const vc = graph.makeOverlay('VC');
const vk = graph.makeOverlay('VK');
const vh = graph.makeOverlay('VH');
const vq = graph.makeOverlay('VQ');
const totals = new Var('N', 'line totals: A hi, A lo, B hi, B lo', 4);
const [NAH, NAQ, NBH, NBQ] = totals.cells();
// Cells a line can enter; the rest (marked cells and any cell walled in by
// them) are empty, with every auxiliary value 0.
const free = gridCells.filter(c => !BLOCKED.has(c) && nbDirs(c).length);
const closed = gridCells.filter(c => !free.includes(c));

// ------------------------------------------------------------- line shape
const lineDomains = gridCells.map(cell => {
  if (closed.includes(cell)) return new Given(vp.at(cell), OFF);
  const s = STARTS.indexOf(cell);
  if (s >= 0) return new Given(vp.at(cell), code(s, 0));
  const e = ENDS.indexOf(cell);
  const lines = e >= 0 ? [e] : [0, 1];
  const codes = lines.flatMap(l => nbDirs(cell).map(k => code(l, k)));
  return new Given(vp.at(cell), ...(e >= 0 ? codes : [OFF, ...codes]));
});

// A cell's predecessor pointer must name a line cell of the same line.
// For a neighbour pair (a, b) with b at direction k from a.
const linkKey = (k) => Pair.fnToKey((a, b) => {
  if (b !== OFF && kOf(b) === BACK[k] && (a === OFF || lineOf(a) !== lineOf(b))) return false;
  if (a !== OFF && kOf(a) === k && (b === OFF || lineOf(a) !== lineOf(b))) return false;
  return true;
}, shape);
const links = [2, 3].map(k => {
  const anchors = free.filter(c => nbAt(c, k));
  return vp.makeReplicate(
    new Pair(linkKey(k), 'line link', vp.at(anchors[0]), vp.at(nbAt(anchors[0], k))),
    vp.at(anchors));
});

// Successors are the neighbours pointing back. Every line cell has exactly
// one, except the two end cells which have none; an empty cell has none.
const successorSpec = (backs, successors) => NFA.encodeSpec({
  startState: 'start',
  transition: (state, v) => {
    if (state === 'start') return `${v === OFF ? 0 : successors}:0:0`;
    const [want, i, n] = state.split(':').map(Number);
    const m = n + (v !== OFF && kOf(v) === backs[i] ? 1 : 0);
    return m > want ? undefined : `${want}:${i + 1}:${m}`;
  },
  accept: (state) => state !== 'start' && (([w, , n]) => w === n)(state.split(':').map(Number)),
  maxDepth: 1 + backs.length,
}, shape);
// A cell with a single open neighbour takes the same rule as a Pair.
const successors = free.map(cell => {
  const ks = nbDirs(cell);
  const want = ENDS.includes(cell) ? 0 : 1;
  if (ks.length === 1) {
    return new Pair(Pair.fnToKey((a, b) =>
      (b !== OFF && kOf(b) === BACK[ks[0]] ? 1 : 0) === (a === OFF ? 0 : want), shape),
    'successor count', vp.at(cell), vp.at(nbAt(cell, ks[0])));
  }
  return new NFA(successorSpec(ks.map(k => BACK[k]), want),
    'successor count', vp.at(cell), ...ks.map(k => vp.at(nbAt(cell, k))));
});

// Loops: VC and VK number each line cell modulo 9 and 8, one more than its
// predecessor, 0 at a start cell. A closed loop would need a length divisible
// by 72, and at most 68 cells (72 open cells less the four ends) can form one.
// Empty cells hold 0.
const counterSpec = (ks, mod) => NFA.encodeSpec({
  startState: 'p',
  transition: (state, v) => {
    if (state === 'p') return v === OFF || kOf(v) === 0 ? 'z' : `k${kOf(v)}`;
    if (state === 'z') return v === 0 ? 'w' : undefined;  // own counter is 0
    if (state === 'w') return 'w';                         // rest unread
    if (state[0] === 'k') return v < mod ? `c${state[1]}:${v}:0` : undefined;
    const [k, c, i] = state.slice(1).split(':').map(Number);
    if (ks[i] === k && v !== (c + mod - 1) % mod) return undefined;
    return `c${k}:${c}:${i + 1}`;
  },
  accept: (state) => state === 'w' || state[0] === 'c',
  maxDepth: 2 + ks.length,
}, shape);
const counters = [[vc, 9], [vk, 8]].flatMap(([layer, mod]) => [
  ...free.map(cell => {
    const ks = nbDirs(cell);
    return new NFA(counterSpec(ks, mod), 'position counter',
      vp.at(cell), layer.at(cell), ...ks.map(k => layer.at(nbAt(cell, k))));
  }),
  ...closed.map(cell => new Given(layer.at(cell), 0)),
]);

// ---------------------------------------------------------- rotation switch
// A crossing is a used-or-not border step between the middle box and an
// open cell outside it. VO names the piece each line cell belongs to by where
// it began: 1 / 2 at the A / B start, the crossing's id just after the line
// steps across that crossing (in either direction), else the predecessor's
// VO. Empty cells hold 0.
const crossings = free.filter(c => boxOf(c) === MIDDLE_BOX).flatMap(y =>
  [1, 2, 3, 4].map(k => nbAt(y, k)).filter(x => x && boxOf(x) !== MIDDLE_BOX)
    .map(x => ({ x, y }))).map((c, i) => ({ ...c, id: 3 + i }));
const crossingId = (a, b) => (crossings.find(c =>
  (c.x === a && c.y === b) || (c.x === b && c.y === a)) || {}).id;
const originSpec = (ks, startId, stepIds) => NFA.encodeSpec({
  startState: 'p',
  transition: (state, v) => {
    if (state === 'p') {
      if (v === OFF) return 'e0';
      const k = kOf(v);
      if (k === 0) return `e${startId}`;
      return stepIds[k] ? `e${stepIds[k]}` : `k${k}`;
    }
    if (state[0] === 'e') return v === Number(state.slice(1)) ? 'w' : undefined;
    if (state === 'w') return 'w';
    if (state[0] === 'k') return `c${state.slice(1)}:${v}:0`;
    const [k, o, i] = state.slice(1).split(':').map(Number);
    if (ks[i] === k && v !== o) return undefined;
    return `c${k}:${o}:${i + 1}`;
  },
  accept: (state) => state === 'w' || state[0] === 'c',
  maxDepth: 2 + ks.length,
}, shape);
const origins = [
  ...free.map(cell => {
    const ks = nbDirs(cell);
    const stepIds = [];
    ks.forEach(k => { stepIds[k] = crossingId(cell, nbAt(cell, k)); });
    const s = STARTS.indexOf(cell);
    return new NFA(originSpec(ks, s >= 0 ? 1 + s : -1, stepIds), 'piece origin',
      vp.at(cell), vo.at(cell), ...ks.map(k => vo.at(nbAt(cell, k))));
  }),
  ...closed.map(cell => new Given(vo.at(cell), 0)),
];

// The piece structure is read off VO at both cells of every crossing and at
// the two end cells. Entering at crossing c: VO(inside cell) = c and
// VO(outside cell) = the arriving piece's origin. Leaving at c: VO(outside
// cell) = c and VO(inside cell) = the crossing the line entered by. Unused:
// neither cell holds c. Every pair of crossing sequences for the two lines is
// enumerated below, and kept when after rotation (inside pieces move to the
// rotated crossings) the pieces join into two paths, each from an A to a B,
// with no loop and no crossing left unmatched.
const rotCrossing = (c) => crossings.find(d => d.x === rotate(c.x) && d.y === rotate(c.y));
const switchConfigs = (() => {
  const configs = [];
  // A crossing whose rotated image is not a crossing would leave a loose end.
  const usable = crossings.filter(rotCrossing);
  const lineSeqs = (avail) => {
    const out = [[]];
    const grow = (seq, left) => {
      for (const e of left) for (const f of left) {
        if (e === f) continue;
        const next = [...seq, [e, f]];
        out.push(next);
        grow(next, left.filter(c => c !== e && c !== f));
      }
    };
    grow([], avail);
    return out;
  };
  for (const seqA of lineSeqs(usable)) {
    const usedA = seqA.flat();
    for (const seqB of lineSeqs(usable.filter(c => !usedA.includes(c)))) {
      const seqs = [seqA, seqB];
      const used = [...usedA, ...seqB.flat()];
      if (!used.every(c => used.includes(rotCrossing(c)))) continue;
      // Post-rotation graph: nodes T<line><S|E> (line ends), X<id> / Y<id>
      // (outside / inside cell of a crossing); edges are the outside pieces,
      // the rotated inside pieces, and the used crossing steps.
      const edges = [];
      seqs.forEach((seq, l) => {
        const nodes = [`T${l}S`, ...seq.flatMap(([e, f]) => [`X${e.id}`, `X${f.id}`]), `T${l}E`];
        for (let i = 0; i < nodes.length; i += 2) edges.push([nodes[i], nodes[i + 1]]);
        seq.forEach(([e, f]) => edges.push([`Y${rotCrossing(e).id}`, `Y${rotCrossing(f).id}`]));
      });
      used.forEach(c => edges.push([`X${c.id}`, `Y${c.id}`]));
      // Follow the path from a line end; returns the end reached and the edges used.
      const walk = (from) => {
        const seen = new Set();
        let cur = from;
        do {
          const i = edges.findIndex((e, j) => !seen.has(j) && e.includes(cur));
          if (i < 0) return null;
          seen.add(i);
          cur = edges[i][0] === cur ? edges[i][1] : edges[i][0];
        } while (!cur.startsWith('T'));
        return { end: cur, count: seen.size };
      };
      const wa = walk('T0S'), wb = walk('T0E');
      const isB = (t) => t && t.end.startsWith('T1');
      if (!isB(wa) || !isB(wb) || wa.end === wb.end) continue;
      if (wa.count + wb.count !== edges.length) continue;  // the rest closes a loop
      // VO values each port cell must hold.
      const want = new Map();
      const need = (cell, values) => {
        const prev = want.get(cell) || range(16);
        want.set(cell, prev.filter(v => values.includes(v)));
      };
      seqs.forEach((seq, l) => {
        let origin = 1 + l;
        seq.forEach(([e, f]) => {
          need(e.x, [origin]); need(e.y, [e.id]);
          need(f.y, [e.id]); need(f.x, [f.id]);
          origin = f.id;
        });
        need(ENDS[l], [origin]);
      });
      crossings.filter(c => !used.includes(c)).forEach(c => {
        const notId = range(16).filter(v => v !== c.id);
        need(c.x, notId); need(c.y, notId);
      });
      configs.push(want);
    }
  }
  return configs;
})();
const portCells = [...new Set([...crossings.flatMap(c => [c.x, c.y]), ...ENDS])];
const configSets = switchConfigs.map(want =>
  portCells.map(cell => new Set(want.get(cell) || range(16))));
// Deterministic scan. The state is the position plus the distinct remaining
// suffixes of the configurations still consistent with the values read so
// far; configurations with equal suffixes are merged.
const suffixIds = new Map();
const suffixId = (sets, i) => {
  const key = sets.slice(i).map(set => [...set].join('.')).join('/');
  if (!suffixIds.has(key)) suffixIds.set(key, { id: suffixIds.size, sets: sets.slice(i) });
  return suffixIds.get(key).id;
};
const suffixById = [];
configSets.forEach(sets => portCells.forEach((_, i) => {
  const id = suffixId(sets, i);
  suffixById[id] = suffixIds.get(sets.slice(i).map(set => [...set].join('.')).join('/')).sets;
}));
const startSuffixes = [...new Set(configSets.map(sets => suffixId(sets, 0)))].sort((x, y) => x - y);
const switchSpec = NFA.encodeSpec({
  startState: `0|${startSuffixes.join(',')}`,
  transition: (state, v) => {
    const [pos, alive] = state.split('|');
    const i = Number(pos) + 1;
    if (i > portCells.length) return undefined;
    const next = new Set();
    for (const id of alive.split(',').map(Number)) {
      const sets = suffixById[id];
      if (!sets[0].has(v)) continue;
      if (i === portCells.length) next.add(-1);
      else next.add(suffixId(sets, 1));
    }
    return next.size ? `${i}|${[...next].sort((x, y) => x - y).join(',')}` : undefined;
  },
  accept: (state) => Number(state.split('|')[0]) === portCells.length,
  maxDepth: portCells.length,
}, shape);
const rotationSwitch = new NFA(switchSpec, 'rotation switch', ...vo.at(portCells));

// ------------------------------------------------------ region sum segments
// VH/VQ hold each line cell's running total within its current segment as
// 16*VH + VQ: its digit, plus the predecessor's total when the predecessor is
// in the same box. Empty cells hold 0.
const total = (cell, sign) => [[vh.at(cell), 16 * sign], [vq.at(cell), sign]];
const runningTotals = gridCells.map(cell => {
  if (closed.includes(cell)) return new And([new Given(vh.at(cell), 0), new Given(vq.at(cell), 0)]);
  const ks = nbDirs(cell);
  const same = ks.filter(k => boxOf(nbAt(cell, k)) === boxOf(cell));
  const resets = [code(0, 0), code(1, 0),
    ...ks.filter(k => !same.includes(k)).flatMap(codesFrom)];
  return new Or([
    new And([new Given(vp.at(cell), OFF), new Given(vh.at(cell), 0), new Given(vq.at(cell), 0)]),
    new And([new Given(vp.at(cell), ...resets), new Sum(0, [cell, 1], ...total(cell, -1))]),
    ...same.map(k => new And([new Given(vp.at(cell), ...codesFrom(k)),
      new Sum(0, [cell, 1], ...total(nbAt(cell, k), 1), ...total(cell, -1))])),
  ]);
});
// A segment ends at a line cell with no successor in its own box; there the
// running total equals the line's N.
const lineCodes = (l) => [0, 1, 2, 3, 4].map(k => code(l, k));
const segmentEnds = free.map(cell => {
  const same = nbDirs(cell).filter(k => boxOf(nbAt(cell, k)) === boxOf(cell));
  return new Or([
    new Given(vp.at(cell), OFF),
    ...same.map(k => new Given(vp.at(nbAt(cell, k)), ...codesFrom(BACK[k]))),
    new And([new Given(vp.at(cell), ...lineCodes(0)),
      new Sum(0, ...total(cell, 1), [NAH, -16], [NAQ, -1])]),
    new And([new Given(vp.at(cell), ...lineCodes(1)),
      new Sum(0, ...total(cell, 1), [NBH, -16], [NBQ, -1])]),
  ]);
});

// ------------------------------------------------------------ count clues
const countSpec = NFA.encodeSpec({
  startState: -1,  // before the clue digit is read; then the count still owed
  transition: (state, v) => {
    if (state === -1) return v;
    const left = state - (v === OFF ? 0 : 1);
    return left < 0 ? undefined : left;
  },
  accept: (state) => state === 0,
}, shape);
const blueClues = BLUE.map(cell => new NFA(countSpec, 'blue square count',
  cell, ...vp.at(graph.kingNeighbours(cell))));
const yellowClues = YELLOW.map(([cell, dr, dc]) => new NFA(countSpec, 'yellow arrow count',
  cell, ...vp.at(graph.ray(cell, dr, dc).slice(1))));

return [
  shape,
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  vp.toVar('line predecessor pointers'),
  vo.toVar('piece origins'),
  vc.toVar('position mod 9'),
  vk.toVar('position mod 8'),
  vh.toVar('segment total high'),
  vq.toVar('segment total low'),
  totals,
  vh.makeReplicate(new Given(vh.at(gridCells[0]), 0, 1, 2)),
  new Given(NAH, 0, 1, 2),
  new Given(NBH, 0, 1, 2),
  ...lineDomains,
  ...links,
  ...successors,
  ...counters,
  ...origins,
  rotationSwitch,
  ...runningTotals,
  ...segmentEnds,
  ...blueClues,
  ...yellowClues,
];
