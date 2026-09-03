// Title: Lupin's Loop 3 - Successorless
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=HFiQBcazPFU
// Source: https://sudokupad.app/zsmtekox43

// Rules encoded below, in full:
//
//   Normal Sudoku rules apply. Digits separated by a white Kropki dot are
//   consecutive.
//   Draw a single electricity cable that travels orthogonally from cell to cell,
//   never branching, crossing, or overlapping, and eventually closes into a
//   loop. The loop must pass through every hut. Water drops mark river borders
//   that the loop cannot cross. Any two cells that are adjacent along the loop
//   must contain non-consecutive digits, unless the loop is passing through a
//   white dot (where consecutive digits may appear). Any two huts directly
//   connected by the loop form a segment (including both huts). A digit in a hut
//   equals the length of the longest segment containing it.
//
// Nothing is omitted.
//
// The loop is a directed successor pointer per cell (VR), from which four
// determined overlays follow: VD, the inclusive count of cells from the previous
// hut along the loop; VF, the inclusive count of cells to the next hut; and
// VJ/VK, two counters of huts passed, modulo 4 and modulo 5.

const OFF = 1, N = 2, E = 3, S = 4, W = 5;   // VR: no loop here, or where it exits to
const DIRS = [N, E, S, W];
const STEPS = { [N]: [-1, 0], [E]: [0, 1], [S]: [1, 0], [W]: [0, -1] };
const BACK = { [N]: S, [E]: W, [S]: N, [W]: E };

// A segment holds at most 9 cells: each of its two end huts holds the length of
// the longer of the two segments meeting there, so each holds at least this
// segment's length, and a digit is at most 9. VD therefore runs 1 (at a hut) to
// 8 (the cell before the next hut) and VF runs 2 (the cell before a hut) to 9.
const MAX_ARC = 9;
const MAX_D = MAX_ARC - 1;    // 8
const D_OFF = MAX_D + 1;      // 9: VD of a cell off the loop
const F_OFF = 1;              // VF of a cell off the loop; on-loop VF is 2..9

// Hut counters. A cycle carrying no hut is already impossible, because VD would
// have to increase at every one of its steps; a cycle carrying huts but not the
// seam hut advances both counters once per hut and closes on itself, so its hut
// count would have to be a multiple of lcm(4, 5) = 20. At most 18 huts lie off
// the seam's own cycle, so every cycle contains the seam and the loop is single.
const MOD_J = 4, MOD_K = 5;
const J_OFF = MOD_J + 1;      // 5
const K_OFF = MOD_K + 1;      // 6

const graph = cellGraph('9x9');
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();

const dir = graph.makeOverlay('VR');    // successor direction, or OFF
const back = graph.makeOverlay('VD');   // cells since the last hut, inclusive
const fwd = graph.makeOverlay('VF');    // cells to the next hut, inclusive
const cntJ = graph.makeOverlay('VJ');   // huts passed, modulo MOD_J
const cntK = graph.makeOverlay('VK');   // huts passed, modulo MOD_K

// Drawn markers: one hut emoji per cell, in reading order.
const HUTS = [
  'R1C5', 'R3C1', 'R3C2', 'R3C6', 'R3C7', 'R5C5', 'R5C9', 'R6C2', 'R7C6',
  'R8C1', 'R8C2', 'R8C5', 'R8C7', 'R8C8', 'R9C1', 'R9C2', 'R9C5', 'R9C6',
  'R9C7',
];
const hutSet = new Set(HUTS);
// The counters are seamed at the first hut in reading order: the rules put every
// hut on the loop, so this cell is forced onto it.
const SEAM = HUTS[0];

// Drawn water drops (river borders), as the cell pairs each one separates.
const RIVERS = [
  ['R1C3', 'R1C4'], ['R4C6', 'R5C6'], ['R5C4', 'R6C4'], ['R6C9', 'R7C9'],
  ['R8C6', 'R8C7'],
];
// Drawn white Kropki dots, as the cell pairs each one sits between.
const WHITE_DOTS = [
  ['R1C1', 'R1C2'], ['R2C4', 'R3C4'], ['R2C5', 'R3C5'], ['R3C8', 'R4C8'],
];

const river = new Set(RIVERS.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));
const dotted = new Set(WHITE_DOTS.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));

// The neighbour the loop may step to, or null at the grid edge or a river.
const exitTo = (cell, d) => {
  const other = graph.step(cell, ...STEPS[d]);
  return other && !river.has(`${cell}|${other}`) ? other : null;
};
const exits = (cell) => DIRS.filter(d => exitTo(cell, d) !== null);

const memo = (fn) => {
  const m = new Map();
  return (...args) => {
    const k = JSON.stringify(args);
    if (!m.has(k)) m.set(k, fn(...args));
    return m.get(k);
  };
};

// --- Domains -----------------------------------------------------------------
// A cell may only leave towards a neighbour it is not separated from by a river,
// and the loop must use every hut, so hut cells cannot be OFF.
const domains = gridCells.map(cell => new Given(
  dir.at(cell), ...(hutSet.has(cell) ? [] : [OFF]), ...exits(cell)));

// --- Every overlay is at its sentinel exactly where the loop is off -----------
const offMatches = memo((sentinel, lo, hi) => Pair.fnToKey(
  (route, value) => route === OFF
    ? value === sentinel
    : value >= lo && value <= hi, numValues));
const membership = gridCells.flatMap(cell => [
  new Pair(offMatches(D_OFF, 1, MAX_D), 'loop-d', dir.at(cell), back.at(cell)),
  new Pair(offMatches(F_OFF, 2, MAX_ARC), 'loop-f', dir.at(cell), fwd.at(cell)),
  new Pair(offMatches(J_OFF, 1, MOD_J), 'loop-j', dir.at(cell), cntJ.at(cell)),
  new Pair(offMatches(K_OFF, 1, MOD_K), 'loop-k', dir.at(cell), cntK.at(cell)),
]);

// --- One entry per exit ------------------------------------------------------
// Reads the cell's own exit direction, then each open neighbour's; a neighbour
// lying `delta` away enters this cell exactly when it exits towards BACK[delta].
// A loop cell therefore has exactly one predecessor and one successor, and they
// must be different cells, which is what "never branching, crossing, or
// overlapping" asks of a cable drawn through cell centres.
//
// At the seam the entry direction is also required to sort after the exit
// direction. Running a solved loop the other way round satisfies every rule
// equally, so this pins one of the two orientations of an overlay the puzzle
// never mentions.
const degreeMachine = memo((deltas, atSeam) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (st, value) => {
    if (st.p === 0) return { p: 1, out: value, cnt: 0, in: 0 };
    const delta = deltas[st.p - 1];
    if (value !== BACK[delta]) return { ...st, p: st.p + 1 };
    return st.cnt === 1 ? undefined : { p: st.p + 1, out: st.out, cnt: 1, in: delta };
  },
  accept: (st) => st.out === OFF
    ? st.cnt === 0
    : st.cnt === 1 && st.in !== st.out && (!atSeam || st.in > st.out),
  // The position index is the only unbounded state field; the scan is this long.
  maxDepth: deltas.length + 1,
}, numValues));
const degrees = gridCells.map(cell => {
  const deltas = exits(cell);
  return new NFA(degreeMachine(deltas, cell === SEAM), 'entry',
    dir.at(cell), ...deltas.map(d => dir.at(exitTo(cell, d))));
});

// --- What one loop step relates ----------------------------------------------
// Listed in the order the step machine reads them, source cell before target.
//   digit  the non-consecutive rule, dropped on the four white-dotted borders
//          where the rules allow consecutive digits instead
//   cntJ/cntK  carried unchanged onto a plain cell, advanced onto a hut, and
//          left free onto the seam, which is where the counter chain is cut
//   back   one further from the previous hut; at a hut it is reset to 1 instead
//   fwd    one nearer the next hut, or exactly 2 when the next cell is the hut
const stepChecks = (isDotted, toHut, toSeam) => [
  ...(isDotted ? [] : [
    { layer: 'digit', arity: 2, test: (a, b) => Math.abs(a - b) !== 1 }]),
  ...(toSeam ? [] : [
    { layer: 'cntJ', arity: 2,
      test: toHut ? (a, b) => b === (a % MOD_J) + 1 : (a, b) => b === a },
    { layer: 'cntK', arity: 2,
      test: toHut ? (a, b) => b === (a % MOD_K) + 1 : (a, b) => b === a },
  ]),
  ...(toHut ? [] : [{ layer: 'back', arity: 2, test: (a, b) => b === a + 1 }]),
  toHut
    ? { layer: 'fwd', arity: 1, test: (a) => a === 2 }
    : { layer: 'fwd', arity: 2, test: (a, b) => a === b + 1 },
];
// The machine stands down unless the source cell really exits towards the
// target; otherwise it reads each check's one or two cells and applies its test.
const stepMachine = memo((delta, isDotted, toHut, toSeam) => {
  const checks = stepChecks(isDotted, toHut, toSeam);
  return NFA.encodeSpec({
    startState: { i: -1 },
    transition: (st, value) => {
      if (st.skip) return { skip: true };
      if (st.i === -1) return value === delta ? { i: 0 } : { skip: true };
      const check = checks[st.i];
      if (!check) return undefined;                        // no more cells expected
      if (check.arity === 2 && st.a === undefined) return { i: st.i, a: value };
      const ok = check.arity === 2 ? check.test(st.a, value) : check.test(value);
      return ok ? { i: st.i + 1 } : undefined;
    },
    accept: (st) => st.skip === true || st.i === checks.length,
  }, numValues);
});
const steps = gridCells.flatMap(cell => exits(cell).map(delta => {
  const to = exitTo(cell, delta);
  const layers = {
    digit: [cell, to],
    cntJ: [cntJ.at(cell), cntJ.at(to)],
    cntK: [cntK.at(cell), cntK.at(to)],
    back: [back.at(cell), back.at(to)],
    fwd: [fwd.at(cell), fwd.at(to)],
  };
  const isDotted = dotted.has(`${cell}|${to}`);
  const toHut = hutSet.has(to);
  const toSeam = to === SEAM;
  return new NFA(stepMachine(delta, isDotted, toHut, toSeam), 'step',
    dir.at(cell),
    ...stepChecks(isDotted, toHut, toSeam)
      .flatMap(check => layers[check.layer].slice(0, check.arity)));
}));

// --- Where the measurements start --------------------------------------------
const seeds = [
  ...HUTS.map(cell => new Given(back.at(cell), 1)),
  new Given(cntJ.at(SEAM), 1),
  new Given(cntK.at(SEAM), 1),
];

// --- A hut's digit is its longer segment -------------------------------------
// Fires on the step that enters this hut from `delta`-wards. The entering cell's
// VD counts the cells of the incoming segment bar the hut itself, so that
// segment holds VD + 1 cells; the hut's own VF is the length of the outgoing
// segment. The hut lies in these two segments and no others.
const hutLink = memo((delta) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (st, value) => {
    if (st.skip) return { skip: true };
    switch (st.p) {
      case 0: return value === BACK[delta] ? { p: 1 } : { skip: true };
      case 1: return value <= MAX_D ? { p: 2, into: value + 1 } : undefined;
      case 2: return { p: 3, arc: Math.max(st.into, value) };
      case 3: return value === st.arc ? { done: true } : undefined;   // hut digit
    }
  },
  accept: (st) => st.skip === true || st.done === true,
}, numValues));
const hutRules = HUTS.flatMap(cell => exits(cell).map(delta => {
  const from = exitTo(cell, delta);
  return new NFA(hutLink(delta), 'segment',
    dir.at(from), back.at(from), fwd.at(cell), cell);
}));

return [
  new Shape('9x9'),
  dir.toVar('cable'),
  back.toVar('from-hut'),
  fwd.toVar('to-hut'),
  cntJ.toVar('hut-counter-4'),
  cntK.toVar('hut-counter-5'),
  ...WHITE_DOTS.map(pair => new WhiteDot(...pair)),
  ...domains,
  ...membership,
  ...degrees,
  ...steps,
  ...seeds,
  ...hutRules,
];
