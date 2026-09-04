// Title: Ophidiophobia
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=d3cNde2G9A4
// Source: https://sudokupad.app/zmckmtohx1

// Rules encoded:
//   Normal sudoku. Four snakes move orthogonally; they never branch, cross
//   themselves, share a cell or enter a cage, but may touch themselves and
//   each other. Every circled cell is an end of a snake and its digit is the
//   number of 3x3 boxes that snake visits. Cage digits sum to the printed
//   total; X sums to 10; a black dot is a 1:2 ratio. Each snake follows
//   exactly one of ALTERNATING PARITY, GERMAN WHISPER, PALINDROME and
//   NON-VENOMOUS (no consecutive pair sums to the venom value, one value shared
//   by all snakes), a different rule per snake, and breaks each of the other
//   three rules at least once.
// Nothing is omitted.
//
// A snake is named by the rule it follows, so the label of a cell or step is
// also its rule and there is no label symmetry. Steps live on two edge layers
// (horizontal and vertical) carrying the snake's label, so two snake cells may
// be adjacent without being joined. Each snake cell carries a level K, its
// distance in cells from the nearer end counting itself; levels are pinned by
// local facts only (below), and two cells of one snake sharing a level are
// mirror images, which is what the palindrome rule and its breaking read.

const NV = 9;
const OFF = 1, PAR = 2, WHI = 3, PAL = 4, VEN = 5;   // cell and step labels
const LABELS = [PAR, WHI, PAL, VEN];
const NO_LEVEL = 7;                                  // VH/VL of a cell off every snake
const BASE = 6;                                      // K = BASE * (VH - 1) + VL, so K in 1..36
const F_OK = 1, F_BAD = 2;                           // VF: digit equals / differs from its mirror
const NOT_VISITED = 1, VISITED = 2;                  // VB flags
const BIT_PAR = 1, BIT_WHI = 2, BIT_VEN = 4;         // VX = 1 + broken-rule bits of a step
const BREAKS_NEEDED = {                              // every rule but the snake's own
  [PAR]: BIT_WHI | BIT_VEN, [WHI]: BIT_PAR | BIT_VEN,
  [PAL]: BIT_PAR | BIT_WHI | BIT_VEN, [VEN]: BIT_PAR | BIT_WHI,
};

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const label = graph.makeOverlay('VS');
const levelHigh = graph.makeOverlay('VH');
const levelLow = graph.makeOverlay('VL');
const mirror = graph.makeOverlay('VF');
// Step layers are indexed by the step's top/left cell: horizontal step
// (r, c) joins RrCc and RrC(c+1); vertical step (r, c) joins RrCc and R(r+1)Cc.
const hGraph = cellGraph('9x8');
const vGraph = cellGraph('8x9');
const hStep = hGraph.makeOverlay('VEH');
const vStep = vGraph.makeOverlay('VEV');
const hBreak = hGraph.makeOverlay('VXH');
const vBreak = vGraph.makeOverlay('VXV');
const boxVisited = new Var('B', 'boxes visited per snake', '4x9');  // row = snake (LABELS order), column = box
const boxCount = new Var('C', 'boxes visited per snake', LABELS.length);
const venom = new Var('W', 'venom value as base-9 digits', 2);

// Drawn data: the eight circled cells and the six two-cell cages (the cage
// R1C6-R1C7 has no total).
const CIRCLES = ['R2C2', 'R2C5', 'R2C8', 'R5C2', 'R5C8', 'R8C2', 'R8C5', 'R8C8'];
const CAGES = [
  [15, ['R1C1', 'R1C2']], [0, ['R1C6', 'R1C7']], [13, ['R3C8', 'R4C8']],
  [13, ['R5C3', 'R6C3']], [15, ['R9C2', 'R9C3']], [12, ['R9C4', 'R9C5']],
];
const circleSet = new Set(CIRCLES);
const cageCells = new Set(CAGES.flatMap(([, cells]) => cells));
const snakeCells = gridCells.filter(cell => !cageCells.has(cell));

// The step and break cells between `cell` and its neighbour (dR, dC) away.
const stepTo = (cell, dR, dC) => {
  const next = graph.step(cell, dR, dC);
  if (next === null) return null;
  const { row, col } = parseCellId(cell);
  if (dR === 0) {
    const id = makeCellId(row, Math.min(col, col + dC));
    return { next, step: hStep.at(id), brk: hBreak.at(id) };
  }
  const id = makeCellId(Math.min(row, row + dR), col);
  return { next, step: vStep.at(id), brk: vBreak.at(id) };
};
const DIRS = [[-1, 0], [0, -1], [0, 1], [1, 0]];
const stepsAround = cell => DIRS.map(([dR, dC]) => stepTo(cell, dR, dC)).filter(s => s !== null);
const allSteps = gridCells.flatMap(cell =>
  [[0, 1], [1, 0]].map(([dR, dC]) => stepTo(cell, dR, dC)).filter(s => s !== null)
    .map(s => ({ a: cell, ...s })));

// --- Domains ---------------------------------------------------------------
const domains = [
  label.makeReplicate(new Given(label.cells()[0], OFF, ...LABELS)),
  levelHigh.makeReplicate(new Given(levelHigh.cells()[0], 1, 2, 3, 4, 5, 6, NO_LEVEL)),
  levelLow.makeReplicate(new Given(levelLow.cells()[0], 1, 2, 3, 4, 5, 6, NO_LEVEL)),
  mirror.makeReplicate(new Given(mirror.cells()[0], F_OK, F_BAD)),
  hStep.makeReplicate(new Given(hStep.cells()[0], OFF, ...LABELS)),
  vStep.makeReplicate(new Given(vStep.cells()[0], OFF, ...LABELS)),
  hBreak.makeReplicate(new Given(hBreak.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8)),
  vBreak.makeReplicate(new Given(vBreak.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8)),
  cellGraph('4x9').makeOverlay('VB').makeReplicate(
    new Given(boxVisited.cell(1, 1), NOT_VISITED, VISITED)),
  new Given(venom.cell(1), 1, 2),
  // Venom value 9*(W1-1)+W2 lies in 3..17, the sums of two distinct digits:
  // three snakes must each contain a consecutive pair summing to it.
  new Pair(Pair.fnToKey((hi, lo) => (hi === 1 && lo >= 3) || (hi === 2 && lo <= 8), NV),
    'venom value 3..17', venom.cell(1), venom.cell(2)),
  ...[...cageCells].map(cell => new Given(label.at(cell), OFF)),
];

// --- Snake shape -----------------------------------------------------------
// Per cell, over [label, VH, VL, incident steps]: an off cell has no level and
// no step; a snake cell's steps are off or carry its own label, a circle has
// one step and level 1, any other snake cell has two steps and a level above
// 1. Levels are read here only as "is it 1", so hi1 is that half-test.
const degreeMachine = isCircle => NFA.encodeSpec({
  startState: { phase: 'label' },
  transition: (st, v) => {
    switch (st.phase) {
      case 'label':
        if (v === OFF) return isCircle ? undefined : { phase: 'offHi' };
        return LABELS.includes(v) ? { phase: 'hi', s: v } : undefined;
      case 'offHi': return v === NO_LEVEL ? { phase: 'offLo' } : undefined;
      case 'offLo': return v === NO_LEVEL ? { phase: 'offSteps' } : undefined;
      case 'offSteps': return v === OFF ? { phase: 'offSteps' } : undefined;
      case 'hi': return v === NO_LEVEL ? undefined : { phase: 'lo', s: st.s, hi1: v === 1 };
      case 'lo': {
        if (v === NO_LEVEL) return undefined;
        const level1 = st.hi1 && v === 1;
        return level1 === isCircle ? { phase: 'steps', s: st.s, deg: 0 } : undefined;
      }
      case 'steps': {
        if (v === OFF) return st;
        if (v !== st.s) return undefined;
        const deg = st.deg + 1;
        return deg > (isCircle ? 1 : 2) ? undefined : { phase: 'steps', s: st.s, deg };
      }
    }
    return undefined;
  },
  accept: st => st.phase === 'offSteps' ||
    (st.phase === 'steps' && st.deg === (isCircle ? 1 : 2)),
}, NV);
const circleDegree = degreeMachine(true);
const bodyDegree = degreeMachine(false);
const degreeRules = gridCells.map(cell => new NFA(
  circleSet.has(cell) ? circleDegree : bodyDegree, 'snake degree',
  label.at(cell), levelHigh.at(cell), levelLow.at(cell),
  ...stepsAround(cell).map(s => s.step)));

// Per cell, over [VH, VL, VF, (step, neighbour VH, neighbour VL) per side]:
// levels of joined cells differ by at most one, and a cell above level 1 is
// joined to a cell one level below it. With the ends at level 1 that makes the
// levels along a snake 1, 2, ..., m, ..., 2, 1 (a level-k cell is the k-th
// from an end), and a closed loop of steps has no cell that can be its lowest.
// A cell joined to two lower cells is the odd middle cell and has no mirror,
// so its VF is F_OK; every other VF is pinned by the mirror pairs below.
// `lower` is clamped at 1 once the flag is F_OK since only 0 vs some matters.
const levelMachine = NFA.encodeSpec({
  startState: { phase: 'hi' },
  transition: (st, v) => {
    switch (st.phase) {
      case 'hi': return v === NO_LEVEL ? { phase: 'offLo' } : v > BASE ? undefined : { phase: 'lo', hi: v };
      case 'offLo': return v === NO_LEVEL ? { phase: 'offF' } : undefined;
      case 'offF': return v === F_OK ? { phase: 'sink' } : undefined;
      case 'sink': return { phase: 'sink' };
      case 'lo': return v > BASE ? undefined : { phase: 'f', K: BASE * (st.hi - 1) + v };
      case 'f': return { phase: 'step', K: st.K, bad: v === F_BAD, lower: 0 };
      case 'step': return v === OFF
        ? { phase: 'skipHi', K: st.K, bad: st.bad, lower: st.lower }
        : { phase: 'nHi', K: st.K, bad: st.bad, lower: st.lower };
      case 'skipHi': return { phase: 'skipLo', K: st.K, bad: st.bad, lower: st.lower };
      case 'skipLo': return { phase: 'step', K: st.K, bad: st.bad, lower: st.lower };
      case 'nHi': return v > BASE ? undefined
        : { phase: 'nLo', K: st.K, bad: st.bad, lower: st.lower, nHi: v };
      case 'nLo': {
        if (v > BASE) return undefined;
        const Kn = BASE * (st.nHi - 1) + v;
        if (Math.abs(Kn - st.K) > 1) return undefined;
        let lower = st.lower + (Kn === st.K - 1 ? 1 : 0);
        if (lower === 2 && st.bad) return undefined;
        if (!st.bad) lower = Math.min(lower, 1);
        return { phase: 'step', K: st.K, bad: st.bad, lower };
      }
    }
    return undefined;
  },
  accept: st => st.phase === 'sink' || (st.phase === 'step' && (st.K === 1 || st.lower >= 1)),
}, NV);
const levelRules = gridCells.map(cell => new NFA(levelMachine, 'snake level',
  levelHigh.at(cell), levelLow.at(cell), mirror.at(cell),
  ...stepsAround(cell).flatMap(s => [s.step, levelHigh.at(s.next), levelLow.at(s.next)])));

// Four snakes, one per rule: each label sits on exactly two circled ends.
const fourSnakes = new ContainExact(
  LABELS.flatMap(s => [s, s]).join('_'), ...label.at(CIRCLES));

// --- Mirror pairs ----------------------------------------------------------
// Per unordered pair of non-cage cells, over [label a, label b, VH a, VH b,
// VL a, VL b, digit a, digit b, VF a, VF b]: when both cells are on the same
// snake at the same level they are mirror images, and both flags say whether
// their digits differ. Any other pair is unconstrained.
const pairMachine = NFA.encodeSpec({
  startState: { phase: 'sa' },
  transition: (st, v) => {
    switch (st.phase) {
      case 'sink': return st;
      case 'sa': return v === OFF ? { phase: 'sink' } : { phase: 'sb', x: v };
      case 'sb': return v === st.x ? { phase: 'ha' } : { phase: 'sink' };
      case 'ha': return { phase: 'hb', x: v };
      case 'hb': return v === st.x ? { phase: 'la' } : { phase: 'sink' };
      case 'la': return { phase: 'lb', x: v };
      case 'lb': return v === st.x ? { phase: 'da' } : { phase: 'sink' };
      case 'da': return { phase: 'db', x: v };
      case 'db': return { phase: 'fa', bad: v !== st.x };
      case 'fa': return v === (st.bad ? F_BAD : F_OK) ? { phase: 'fb', bad: st.bad } : undefined;
      case 'fb': return v === (st.bad ? F_BAD : F_OK) ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: st => st.phase === 'sink' || st.phase === 'done',
}, NV);
const mirrorPairs = snakeCells.flatMap((a, i) => snakeCells.slice(i + 1).map(b =>
  new NFA(pairMachine, 'mirror pair',
    label.at(a), label.at(b), levelHigh.at(a), levelHigh.at(b),
    levelLow.at(a), levelLow.at(b), a, b, mirror.at(a), mirror.at(b))));

// --- Digit rules along the steps -------------------------------------------
// Per step, over [step, digit a, digit b, W1, W2, break flags]: an unused
// step has no break flags; a used step obeys its snake's own rule (parity,
// whisper or non-venomous; a palindrome step has no pairwise rule) and its
// break flags record which of the three pairwise rules the pair breaks.
const stepRuleMachine = NFA.encodeSpec({
  startState: { phase: 'e' },
  transition: (st, v) => {
    switch (st.phase) {
      case 'e':
        if (v === OFF) return { phase: 'unused', left: 4 };
        return LABELS.includes(v) ? { phase: 'da', s: v } : undefined;
      case 'unused':
        if (st.left > 0) return { phase: 'unused', left: st.left - 1 };
        return v === 1 ? { phase: 'done' } : undefined;
      case 'da': return { phase: 'db', s: st.s, a: v };
      case 'db': {
        const p = st.a % 2 === v % 2;
        const w = Math.abs(st.a - v) < 5;
        if ((st.s === PAR && p) || (st.s === WHI && w)) return undefined;
        return { phase: 'w1', s: st.s, p, w, sum: st.a + v };
      }
      case 'w1': return v > 2 ? undefined
        : { phase: 'w2', s: st.s, p: st.p, w: st.w, sum: st.sum, w1: v };
      case 'w2': {
        const ven = st.sum === NV * (st.w1 - 1) + v;
        if (st.s === VEN && ven) return undefined;
        return {
          phase: 'x',
          bits: 1 + (st.p ? BIT_PAR : 0) + (st.w ? BIT_WHI : 0) + (ven ? BIT_VEN : 0),
        };
      }
      case 'x': return v === st.bits ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: st => st.phase === 'done',
}, NV);
const stepRules = allSteps.map(s => new NFA(stepRuleMachine, 'step rule',
  s.step, s.a, s.next, venom.cell(1), venom.cell(2), s.brk));

// Per snake, over [step, break flags] of every step: the steps carrying its
// label break every rule other than its own at least once between them.
const breaksMachine = s => NFA.encodeSpec({
  startState: { phase: 'e', mask: 0 },
  transition: (st, v) => st.phase === 'e'
    ? { phase: 'x', mine: v === s, mask: st.mask }
    : { phase: 'e', mask: st.mine ? st.mask | (v - 1) : st.mask },
  accept: st => st.phase === 'e' && (st.mask & BREAKS_NEEDED[s]) === BREAKS_NEEDED[s],
}, NV);
const breakRules = LABELS.map(s => new NFA(breaksMachine(s), `breaks other rules ${s}`,
  ...allSteps.flatMap(st => [st.step, st.brk])));

// Per snake, over [label, VF] of every non-cage cell: the palindrome snake has
// no mirror mismatch, every other snake has at least one.
const mirrorRuleMachine = s => NFA.encodeSpec({
  startState: { phase: 's', found: false },
  transition: (st, v) => {
    if (st.phase === 's') return { phase: 'f', mine: v === s, found: st.found };
    const hit = st.mine && v === F_BAD;
    if (s === PAL && hit) return undefined;
    return { phase: 's', found: st.found || hit };
  },
  accept: st => st.phase === 's' && (s === PAL || st.found),
}, NV);
const mirrorRules = LABELS.map(s => new NFA(mirrorRuleMachine(s), `palindrome ${s}`,
  ...snakeCells.flatMap(cell => [label.at(cell), mirror.at(cell)])));

// --- Circles ---------------------------------------------------------------
// Per (snake, box), over [flag, labels of the box]: the flag says whether the
// snake has a cell in the box. The count of flagged boxes is the snake's VC.
const visitMachine = s => NFA.encodeSpec({
  startState: { want: null, seen: false },
  transition: (st, v) => st.want === null
    ? { want: v === VISITED, seen: false }
    : { want: st.want, seen: st.seen || v === s },
  accept: st => st.want !== null && st.seen === st.want,
}, NV);
const boxRules = LABELS.flatMap((s, i) => [
  ...graph.boxes().map((box, b) => new NFA(visitMachine(s), 'box visited',
    boxVisited.cell(i + 1, b + 1), ...label.at(box))),
  // nine flags of 1 or 2 sum to 9 + visited boxes
  new Sum(NV, ...graph.boxes().map((_, b) => boxVisited.cell(i + 1, b + 1)),
    [boxCount.cell(i + 1), -1]),
]);

// Per circle, over [label, digit, VC per snake in LABELS order]: the digit is
// the box count of the snake the circle belongs to.
const circleMachine = NFA.encodeSpec({
  startState: { phase: 's' },
  transition: (st, v) => {
    if (st.phase === 's') return LABELS.includes(v) ? { phase: 'd', s: v } : undefined;
    if (st.phase === 'd') return { phase: 'c', s: st.s, d: v, i: 0 };
    if (st.i === LABELS.length) return undefined;
    if (LABELS[st.i] === st.s && v !== st.d) return undefined;
    return { phase: 'c', s: st.s, d: st.d, i: st.i + 1 };
  },
  accept: st => st.phase === 'c' && st.i === LABELS.length,
}, NV);
const circleRules = CIRCLES.map(cell => new NFA(circleMachine, 'circle box count',
  label.at(cell), cell, ...boxCount.cells()));

return [
  new Shape('9x9'),
  ...CAGES.filter(([total]) => total > 0).map(([total, cells]) => new Cage(total, ...cells)),
  new X('R6C7', 'R6C8'),
  new BlackDot('R5C1', 'R5C2'),
  new BlackDot('R7C5', 'R7C6'),
  label.toVar('snake label (rule)'),
  levelHigh.toVar('snake level, high part'),
  levelLow.toVar('snake level, low part'),
  mirror.toVar('digit differs from its mirror'),
  hStep.toVar('horizontal steps'),
  vStep.toVar('vertical steps'),
  hBreak.toVar('horizontal step rule breaks'),
  vBreak.toVar('vertical step rule breaks'),
  boxVisited,
  boxCount,
  venom,
  ...domains,
  ...degreeRules,
  ...levelRules,
  fourSnakes,
  ...mirrorPairs,
  ...stepRules,
  ...breakRules,
  ...mirrorRules,
  ...boxRules,
  ...circleRules,
];
