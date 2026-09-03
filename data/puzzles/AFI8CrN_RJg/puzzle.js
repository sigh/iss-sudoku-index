// Title: Lupin's Loop 5 - Countercount
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=AFI8CrN_RJg
// Source: https://sudokupad.app/ybaev4x39i

// Rules encoded below, in full:
//
//   Normal Sudoku rules apply. A greater than sign points to the smaller number.
//   Draw a single route for the airplane that travels orthogonally from cell to
//   cell, never branching, crossing, or overlapping, and eventually closes into a
//   loop. The route starts at the airplane, passes through every country, and
//   returns to its starting point. Thick black borders represent heavy turbulence
//   that the airplane cannot cross. If a digit N appears on the route, then the
//   digit N appears exactly N times in cells not on the route. If two countries
//   are directly connected by the route, their digits differ by the length of the
//   segment connecting them. If a country and the airplane are directly connected
//   by the route, the digit in the airplane equals the length of the segment
//   connecting them.
//   Note: Segment lengths include both endpoints. Two objects are directly
//   connected by the route if no other object lies between them along the route.
//
// Nothing is omitted. The flags' identities are decoration: no rule tells one
// country from another.
//
// The route is carried as a directed successor pointer per cell (VR), from which
// four determined overlays follow: two modular position counters (VK, VJ) that
// exclude disjoint sub-loops, the inclusive distance since the last object along
// the route (VD), and the identity of that last object (VP).

const OFF = 1, N = 2, E = 3, S = 4, W = 5;   // VR: no route here, or where it exits to
const DIRS = [N, E, S, W];
const STEPS = { [N]: [-1, 0], [E]: [0, 1], [S]: [1, 0], [W]: [0, -1] };
const BACK = { [N]: S, [E]: W, [S]: N, [W]: E };

// Both bounds are forced by the rules, and both are needed to keep every overlay
// inside a 10-value alphabet.
//   MAX_ARC: a country-country segment equals a digit difference (<= 8) and an
//   airplane-country segment equals the airplane's digit (<= 9).
//   The loop length: digit N on the route leaves 9 - N of the nine Ns on it, so
//   the route is at most 8 + 7 + ... + 1 = 36 cells long.
const MAX_ARC = 9;

// Position counters modulo two coprime numbers whose lcm (40) exceeds 36.
const MOD_K = 8, MOD_J = 5;
const K_OFF = MOD_K + 1;          // 9: sentinel for a cell off the route
const J_OFF = MOD_J + 1;          // 6
const MAX_D = MAX_ARC - 1;        // 8: VD of the cell just before an object
const D_OFF = MAX_D + 1;          // 9
const PLANE_SRC = 10;             // VP: last object was the airplane; also the
                                  // sentinel for a cell off the route

// 10 values so the overlays fit; the grid itself is restricted back to 1-9.
const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const gridCells = graph.cells();

const dir = graph.makeOverlay('VR');    // successor direction, or OFF
const cntK = graph.makeOverlay('VK');   // position counter mod MOD_K
const cntJ = graph.makeOverlay('VJ');   // position counter mod MOD_J
const dist = graph.makeOverlay('VD');   // cells since the last object, inclusive
const prev = graph.makeOverlay('VP');   // that object's digit, or PLANE_SRC

// Drawn markers: one flag emoji per country cell, one airplane emoji.
const COUNTRIES = [
  'R1C5', 'R1C7', 'R2C8', 'R2C9', 'R3C3', 'R4C7', 'R4C9', 'R5C6',
  'R7C1', 'R7C7', 'R8C1', 'R8C2', 'R8C4', 'R8C5', 'R9C2', 'R9C3',
];
const PLANE = 'R4C6';
const OBJECTS = new Set([...COUNTRIES, PLANE]);

// Drawn thick black borders (turbulence), as the cell pairs they separate.
const WALLS = [['R4C5', 'R5C5'], ['R8C5', 'R9C5'], ['R6C1', 'R7C1']];
const walled = new Set(WALLS.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));

// The neighbour the route may step to, or null for the grid edge or a wall.
const exitTo = (cell, d) => {
  const other = graph.step(cell, ...STEPS[d]);
  return other && !walled.has(`${cell}|${other}`) ? other : null;
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
// The grid holds ordinary digits; the wider alphabet exists only for the overlays.
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  cntK.makeReplicate(new Given(cntK.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, K_OFF)),
  cntJ.makeReplicate(new Given(cntJ.cells()[0], 1, 2, 3, 4, 5, J_OFF)),
  dist.makeReplicate(new Given(dist.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, D_OFF)),
  // A cell may only leave towards a neighbour it is not walled off from, and the
  // route must use every object cell, so those cells cannot be OFF.
  ...gridCells.map(cell => new Given(
    dir.at(cell), ...(OBJECTS.has(cell) ? [] : [OFF]), ...exits(cell))),
];

// --- Overlays are off exactly where the route is off -------------------------
const offMatches = memo((sentinel, maxOn) => Pair.fnToKey(
  (route, value) => route === OFF ? value === sentinel : value <= maxOn, shape));
const membership = gridCells.flatMap(cell => [
  new Pair(offMatches(K_OFF, MOD_K), 'route-k', dir.at(cell), cntK.at(cell)),
  new Pair(offMatches(J_OFF, MOD_J), 'route-j', dir.at(cell), cntJ.at(cell)),
  new Pair(offMatches(D_OFF, MAX_D), 'route-d', dir.at(cell), dist.at(cell)),
  new Pair(offMatches(PLANE_SRC, PLANE_SRC), 'route-p', dir.at(cell), prev.at(cell)),
]);

// --- One entry per exit ------------------------------------------------------
// Reads the cell's own exit direction, then each open neighbour's; a neighbour
// lying `delta` away enters this cell exactly when it exits towards BACK[delta].
// A route cell therefore has exactly one predecessor and one successor, which is
// what "never branching, crossing, or overlapping" asks for, and they must be
// different cells (a two-cell loop would re-use one border).
//
// At the airplane the entry direction is also forced to sort after the exit
// direction. Reversing a solved route satisfies every rule equally, so this pins
// one of the two orientations of an overlay the puzzle never mentions.
const degreeMachine = memo((deltas, atPlane) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (st, value) => {
    if (st.p === 0) return { p: 1, out: value, cnt: 0, in: 0 };
    const delta = deltas[st.p - 1];
    if (value !== BACK[delta]) return { ...st, p: st.p + 1 };
    return st.cnt === 1 ? undefined : { p: st.p + 1, out: st.out, cnt: 1, in: delta };
  },
  accept: (st) => st.out === OFF
    ? st.cnt === 0
    : st.cnt === 1 && st.in !== st.out && (!atPlane || st.in > st.out),
  // The position index is the only unbounded state field; the scan is this long.
  maxDepth: deltas.length + 1,
}, shape));
const degrees = gridCells.map(cell => {
  const deltas = exits(cell);
  return new NFA(degreeMachine(deltas, cell === PLANE), 'entry',
    dir.at(cell), ...deltas.map(d => dir.at(exitTo(cell, d))));
});

// --- What each route step carries forward ------------------------------------
// Built for one directed pair: the machine reads the source cell's exit
// direction first and stands down unless it points at the target. When it does:
//   both counters advance by one, modulo their own base;
//   at a plain cell the distance since the last object advances and the last
//   object is carried over unchanged.
// At an object cell the distance and last-object values are reset instead (see
// `objectResets`), and the airplane additionally breaks the counter chain: the
// counters run round the route from the airplane and never close on themselves,
// so a second, disjoint loop would have to satisfy both moduli round its own
// length, which needs a length divisible by 40 - longer than any possible route.
const stepMachine = memo((delta, plainTarget) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (st, value) => {
    if (st.skip) return { skip: true };
    switch (st.p) {
      case 0: return value === delta ? { p: 1 } : { skip: true };
      case 1: return value <= MOD_K ? { p: 2, a: value } : undefined;
      case 2: return value === (st.a % MOD_K) + 1 ? { p: 3 } : undefined;
      case 3: return value <= MOD_J ? { p: 4, a: value } : undefined;
      case 4: return value !== (st.a % MOD_J) + 1 ? undefined
        : (plainTarget ? { p: 5 } : { done: true });
      // MAX_D - 1 here, not MAX_D: the next cell is a plain one, so the segment
      // it belongs to still has its far object to come.
      case 5: return value < MAX_D ? { p: 6, a: value } : undefined;
      case 6: return value === st.a + 1 ? { p: 7 } : undefined;
      case 7: return { p: 8, a: value };
      case 8: return value === st.a ? { done: true } : undefined;
    }
  },
  accept: (st) => st.skip === true || st.done === true,
}, shape));
const steps = gridCells.flatMap(cell => DIRS.flatMap(delta => {
  const to = exitTo(cell, delta);
  if (!to || to === PLANE) return [];
  const plainTarget = !OBJECTS.has(to);
  const carried = plainTarget
    ? [dist.at(cell), dist.at(to), prev.at(cell), prev.at(to)]
    : [];
  return [new NFA(stepMachine(delta, plainTarget), 'step',
    dir.at(cell), cntK.at(cell), cntK.at(to), cntJ.at(cell), cntJ.at(to),
    ...carried)];
}));

// --- Each object restarts the segment measurement ----------------------------
// A country announces its own digit as the last object seen; the airplane
// announces PLANE_SRC, and also seeds the two counters.
const objectResets = [
  ...COUNTRIES.flatMap(cell => [
    new Given(dist.at(cell), 1),
    new SameValues(2, prev.at(cell), cell),
  ]),
  new Given(dist.at(PLANE), 1),
  new Given(prev.at(PLANE), PLANE_SRC),
  new Given(cntK.at(PLANE), 1),
  new Given(cntJ.at(PLANE), 1),
];

// --- Segment rules at each object --------------------------------------------
// Fires on the step that enters this object from `delta`-wards. The entering
// cell's distance is the segment's length minus one (both endpoints counted), and
// its carried last-object value is the far end of that segment.
const countryLink = memo((delta) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (st, value) => {
    if (st.skip) return { skip: true };
    switch (st.p) {
      case 0: return value === BACK[delta] ? { p: 1 } : { skip: true };
      case 1: return { p: 2, src: value };
      case 2: return value <= MAX_D ? { p: 3, src: st.src, arc: value + 1 } : undefined;
      // Own digit: compared with the previous country's, or skipped when the
      // previous object was the airplane.
      case 3: return st.src === PLANE_SRC ? { p: 4, arc: st.arc }
        : (Math.abs(value - st.src) === st.arc ? { skip: true } : undefined);
      case 4: return value === st.arc ? { done: true } : undefined;   // airplane digit
    }
  },
  accept: (st) => st.skip === true || st.done === true,
}, shape));
const planeLink = memo((delta) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (st, value) => {
    if (st.skip) return { skip: true };
    switch (st.p) {
      case 0: return value === BACK[delta] ? { p: 1 } : { skip: true };
      case 1: return value <= MAX_D ? { p: 2, arc: value + 1 } : undefined;
      case 2: return value === st.arc ? { done: true } : undefined;   // airplane digit
    }
  },
  accept: (st) => st.skip === true || st.done === true,
}, shape));
const segmentRules = [
  ...COUNTRIES.flatMap(cell => exits(cell).map(delta => {
    const from = exitTo(cell, delta);
    return new NFA(countryLink(delta), 'segment',
      dir.at(from), prev.at(from), dist.at(from), cell, PLANE);
  })),
  ...exits(PLANE).map(delta => {
    const from = exitTo(PLANE, delta);
    return new NFA(planeLink(delta), 'segment-plane',
      dir.at(from), dist.at(from), PLANE);
  }),
];

// --- Countercount ------------------------------------------------------------
// Per digit: either no N is on the route, or exactly N of the nine are off it and
// so 9 - N are on it. One machine per digit scans the whole grid, reading each
// cell's digit and then whether that cell is on the route.
const countMachine = memo((digit) => {
  const onRoute = 9 - digit;
  return NFA.encodeSpec({
    startState: { n: 0, isDigit: null },
    transition: (st, value) => {
      if (st.isDigit === null) return { n: st.n, isDigit: value === digit };
      const next = st.n + (st.isDigit && value !== OFF ? 1 : 0);
      return next > onRoute ? undefined : { n: next, isDigit: null };
    },
    accept: (st) => st.isDigit === null && (st.n === 0 || st.n === onRoute),
  }, shape);
});
const counterCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit =>
  new NFA(countMachine(digit), `count-${digit}`,
    ...gridCells.flatMap(cell => [cell, dir.at(cell)])));

return [
  shape,
  dir.toVar('route'),
  cntK.toVar('counter-8'),
  cntJ.toVar('counter-5'),
  dist.toVar('segment-distance'),
  prev.toVar('last-object'),
  // Drawn greater-than signs, each pointing at the smaller of the pair.
  new GreaterThan('R5C9', 'R5C8'),
  new GreaterThan('R8C6', 'R8C7'),
  ...domains,
  ...membership,
  ...degrees,
  ...steps,
  ...objectResets,
  ...segmentRules,
  ...counterCounts,
];
