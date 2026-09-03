// Title: Grand Prix
// Author: Blobz
// Video: https://www.youtube.com/watch?v=qJ_ENK7bPUc
// Source: https://app.crackingthecryptic.com/sudoku/J3mq7L7GrN

// Normal sudoku. Digits in cages sum to the clue in the top left corner. Two
// race cars, blue and green, start in box 1 and race around the track to the
// chequered flag line in box 2 (the 16 cage); each car's path is a line drawn
// through cell centres, stepping to an orthogonal or diagonal neighbour. Each
// checkpoint (cage) carries one blue and one green marker showing the cell that
// car passes through. The cars may not enter grey shaded cells and must avoid
// all oil slicks (the given digits). The paths cross exactly 3 times and do not
// share cells. Digits along the blue path have an equal sum N within each 3x3
// box that path passes through. Adjacent digits along the green path differ by
// at least 5.
//
// Nothing is omitted. Three readings the prose leaves open are settled where
// they are encoded: where each car starts, what a diagonal step may pass, and
// what "cross" counts.

const NV = 10;                       // one spare value above 9 for the Var layers
const MOD_A = 6, MOD_B = 7;          // lcm 42 > the 41 open cells (see counters)
const OFF = 1;                       // position value for a cell a path misses
const START_POS = 2;                 // position value of a car's starting cell
const UNUSED = 1;                    // step values: unused, then blue/green a->b, b->a
const B_FWD = 2, B_BWD = 3, G_FWD = 4, G_BWD = 5;
const NO_CROSS = 1, CROSS = 2;       // crossing-marker values
const CROSSINGS = 3;                 // "the paths cross exactly 3 times"

// --- The drawn board ------------------------------------------------------
// Transcribed from the grey cell shading and from the given digits (each drawn
// with an oil-slick marker, except R9C1 and R9C9 which sit on grey cells).
// A car may enter neither, so the two maps together give the open track.
const SHADING = [
  '##....###',
  '#......##',
  '...##...#',
  '..####...',
  '..#####..',
  '..##.##..',
  '.........',
  '#.......#',
  '##.######',
];
const GIVENS = [
  '...6.....',
  '.........',
  '..4...8..',
  '........7',
  '.........',
  '.........',
  '..5......',
  '....3....',
  '4.......3',
];
// Cage totals and cells, read from the six two-cell cages.
const CAGES = [
  [12, 'R1C3', 'R2C3'], [16, 'R1C5', 'R2C5'], [7, 'R5C8', 'R5C9'],
  [5, 'R7C7', 'R8C7'], [3, 'R8C3', 'R9C3'], [12, 'R5C1', 'R5C2'],
];
// The checkpoint markers, read off their fill colours: deepskyblue cells belong
// to the blue car, yellowgreen cells to the green car, one of each per cage.
// The pair in the 12 cage of box 1 is drawn as two upright car-shaped rectangles
// rather than the round checkpoint markers used everywhere else, and sits on the
// red start line; those are the cars on the starting grid, so they are the two
// paths' first cells. The chequered flag sits on the 16-cage line, so the
// matching marker in that cage is each path's last cell.
const BLUE = {
  start: 'R2C3', end: 'R1C5',
  checkpoints: ['R2C3', 'R5C2', 'R9C3', 'R7C7', 'R5C9', 'R1C5'],
};
const GREEN = {
  start: 'R1C3', end: 'R2C5',
  checkpoints: ['R1C3', 'R5C1', 'R8C3', 'R8C7', 'R5C8', 'R2C5'],
};
// The blue path is forced through these boxes by its checkpoints, so each of
// them is a box "the path passes through"; the other three are conditional.
const BLUE_BOXES = [1, 2, 4, 6, 7, 9];
const OTHER_BOXES = [3, 5, 8];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const at = (map, cell) => {
  const { row, col } = parseCellId(cell);
  return map[row - 1][col - 1];
};
const givenAt = cell => at(GIVENS, cell) === '.' ? null : +at(GIVENS, cell);
// A car may not enter a grey cell or an oil slick, so the path layers below are
// built over the open cells only: a blocked cell has no path variable at all.
const isOpen = cell => at(SHADING, cell) === '.' && givenAt(cell) === null;
const track = gridCells.filter(isOpen);

// --- Path layers ----------------------------------------------------------
// Each car gets two position layers and shares one step layer. A step Var per
// open king-move adjacency records whether a path uses it, whose it is, and
// which way that car travels along it.
const bposA = graph.makeOverlay('VBA', track);
const bposB = graph.makeOverlay('VBB', track);
const gposA = graph.makeOverlay('VGA', track);
const gposB = graph.makeOverlay('VGB', track);
// The contribution layer covers the whole grid so that every box offers the
// same nine cells to the sums below; a blocked cell is pinned off-path.
const blueDigit = graph.makeOverlay('VBD');

// The rule bars a car from entering a blocked cell, and a diagonal step enters
// neither of the two cells flanking the corner it passes through, so a step
// between two open cells is available whatever sits either side of it.
const STEP_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(track.map(cell => [cell, []]));
for (const cell of track) {
  for (const [dR, dC] of STEP_OFFSETS) {
    const other = graph.step(cell, dR, dC);
    if (!other || !isOpen(other)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, bOut: B_FWD, bIn: B_BWD, gOut: G_FWD, gIn: G_BWD });
    stepsAt.get(other).push({ id, bOut: B_BWD, bIn: B_FWD, gOut: G_BWD, gIn: G_FWD });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);

// Two paths drawn through cell centres meet only where their strokes pass
// through the same lattice corner, and only a diagonal step does that: so a
// crossing is one 2x2 square whose two diagonals are used by different cars.
// One marker Var per square that has both diagonals available.
const crossings = [];
for (let i = 2; i <= 9; i++) {
  for (let j = 2; j <= 9; j++) {
    const d1 = stepBetween(makeCellId(i - 1, j - 1), makeCellId(i, j));
    const d2 = stepBetween(makeCellId(i - 1, j), makeCellId(i, j - 1));
    if (d1 && d2) {
      crossings.push({ id: 'VX' + (crossings.length + 1), d1: d1.id, d2: d2.id });
    }
  }
}

// --- State machines -------------------------------------------------------
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};
const positionValues = mod => Array.from({ length: mod + 1 }, (_, n) => n + 1);
const nextPos = (v, mod) => START_POS + ((v - START_POS + 1) % mod);
const usesBlue = v => v === B_FWD || v === B_BWD;
const usesGreen = v => v === G_FWD || v === G_BWD;

// A car's start cell is left but never entered, its finish cell entered but
// never left, and every other cell it visits is entered once and left once.
const degreeOk = (role, visited, into, outOf) => {
  if (role === 'start') return visited && into === 0 && outOf === 1;
  if (role === 'finish') return visited && into === 1 && outOf === 0;
  return visited ? (into === 1 && outOf === 1) : (into === 0 && outOf === 0);
};

// Per-cell machine: reads the cell's four position values, then every step it is
// an endpoint of. It ties "on this path" (a position other than OFF, agreeing
// across that car's two layers) to that car's step degrees, and rejects a cell
// both cars visit -- the paths do not share cells.
const cellNFA = (incident, blueRole, greenRole) => cached(
  'cell|' + blueRole + '|' + greenRole + '|' + incident.map(s => s.bOut).join(','),
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, bv: value !== OFF };
      if (s.k === 1) {
        return (value !== OFF) === s.bv ? { k: 2, bv: s.bv } : undefined;
      }
      if (s.k === 2) {
        const gv = value !== OFF;
        if (gv && s.bv) return undefined;
        return { k: 3, bv: s.bv, gv };
      }
      if (s.k === 3) {
        if ((value !== OFF) !== s.gv) return undefined;
        return { k: 4, bv: s.bv, gv: s.gv, bi: 0, bo: 0, gi: 0, go: 0 };
      }
      const n = s.k - 4;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      let { bi, bo, gi, go } = s;
      if (value === step.bIn) bi++;
      else if (value === step.bOut) bo++;
      else if (value === step.gIn) gi++;
      else if (value === step.gOut) go++;
      else if (value !== UNUSED) return undefined;
      if (bi > 1 || bo > 1 || gi > 1 || go > 1) return undefined;
      return { k: s.k + 1, bv: s.bv, gv: s.gv, bi, bo, gi, go };
    },
    accept: s => s.k === 4 + incident.length &&
      degreeOk(blueRole, s.bv, s.bi, s.bo) &&
      degreeOk(greenRole, s.gv, s.gi, s.go),
  }, NV));

// Position counter over one step: a used step advances that car's counter by one
// in the direction of travel. Degree alone would also admit a closed loop of
// steps sitting beside a path; a loop of length L must have L = 0 mod 6 and
// mod 7, so the shortest one that could be numbered is 42 cells long, and only
// 41 cells are open.
const counterNFA = (fwd, bwd, mod) => cached('count|' + fwd + '|' + mod,
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, dir: value };
      if (s.k === 1) return { k: 2, dir: s.dir, a: value };
      if (s.k !== 2) return undefined;
      if (s.dir !== fwd && s.dir !== bwd) return { done: true };
      if (s.a === OFF || value === OFF) return undefined;
      if (s.dir === fwd) return value === nextPos(s.a, mod) ? { done: true } : undefined;
      return s.a === nextPos(value, mod) ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));

// Digits joined by a green step differ by at least 5.
const greenDiffNFA = () => cached('greendiff', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: usesGreen(value) };
    if (s.k === 1) return { k: 2, on: s.on, a: value };
    if (s.k !== 2) return undefined;
    if (!s.on) return { done: true };
    return Math.abs(s.a - value) >= 5 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// Reads a 2x2 square's two diagonal steps and sets its marker: CROSS exactly
// when one diagonal is blue and the other green. A square whose two diagonals
// belong to the same car is that car's path crossing itself, which the rules
// neither forbid nor count.
const crossNFA = () => cached('cross', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, v1: value };
    if (s.k === 1) return { k: 2, v1: s.v1, v2: value };
    if (s.k !== 2) return undefined;
    const crossed = (usesBlue(s.v1) && usesGreen(s.v2)) ||
      (usesGreen(s.v1) && usesBlue(s.v2));
    return value === (crossed ? CROSS : NO_CROSS) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// Reads a cell's blue position and digit and sets its blue-sum contribution to
// digit + 1 when the blue path visits it and to 1 when it does not. The offset
// keeps the value inside the 1..10 alphabet; every box compared below holds the
// same nine cells, so the offsets cancel and the comparison is unaffected.
const contributionNFA = () => cached('contribution', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value !== OFF };
    if (s.k === 1) return { k: 2, on: s.on, d: value };
    if (s.k !== 2) return undefined;
    return value === (s.on ? s.d + 1 : 1) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// --- Constraints ----------------------------------------------------------
const layers = [
  bposA.toVar('blue position mod ' + MOD_A),
  bposB.toVar('blue position mod ' + MOD_B),
  gposA.toVar('green position mod ' + MOD_A),
  gposB.toVar('green position mod ' + MOD_B),
  blueDigit.toVar('blue path digit contribution'),
  new Var('S', 'path steps', steps.length),
  new Var('X', 'path crossings', crossings.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...track.flatMap(cell => [
    new Given(bposA.at(cell), ...positionValues(MOD_A)),
    new Given(bposB.at(cell), ...positionValues(MOD_B)),
    new Given(gposA.at(cell), ...positionValues(MOD_A)),
    new Given(gposB.at(cell), ...positionValues(MOD_B)),
  ]),
];
// The step and crossing Vars need no domain of their own: the per-cell and
// crossing machines accept no other value on them.

const givens = gridCells.filter(cell => givenAt(cell) !== null)
  .map(cell => new Given(cell, givenAt(cell)));
// The rules give the cages a total but no no-repeat clause, so Sum, not Cage.
const cages = CAGES.map(([total, ...cells]) => new Sum(total, ...cells));

const roleOf = (car, cell) =>
  cell === car.start ? 'start' : cell === car.end ? 'finish' : 'through';
const pathShape = track.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(
    cellNFA(incident, roleOf(BLUE, cell), roleOf(GREEN, cell)), 'path-cell',
    bposA.at(cell), bposB.at(cell), gposA.at(cell), gposB.at(cell),
    ...incident.map(s => s.id));
});
// Pinning each car's first cell to the first position stops the whole numbering
// sliding round; it carries no rule of its own.
const seams = [
  new Given(bposA.at(BLUE.start), START_POS),
  new Given(bposB.at(BLUE.start), START_POS),
  new Given(gposA.at(GREEN.start), START_POS),
  new Given(gposB.at(GREEN.start), START_POS),
];
// A checkpoint's marked cell is on that car's path: any position but OFF.
const onPath = (layer, mod, cell) =>
  new Given(layer.at(cell), ...positionValues(mod).filter(v => v !== OFF));
const checkpoints = [
  ...BLUE.checkpoints.map(cell => onPath(bposA, MOD_A, cell)),
  ...GREEN.checkpoints.map(cell => onPath(gposA, MOD_A, cell)),
];
const counters = steps.flatMap(s => [
  new NFA(counterNFA(B_FWD, B_BWD, MOD_A), 'path-order', s.id, bposA.at(s.a), bposA.at(s.b)),
  new NFA(counterNFA(B_FWD, B_BWD, MOD_B), 'path-order', s.id, bposB.at(s.a), bposB.at(s.b)),
  new NFA(counterNFA(G_FWD, G_BWD, MOD_A), 'path-order', s.id, gposA.at(s.a), gposA.at(s.b)),
  new NFA(counterNFA(G_FWD, G_BWD, MOD_B), 'path-order', s.id, gposB.at(s.a), gposB.at(s.b)),
]);
const crossingRule = [
  ...crossings.map(x => new NFA(crossNFA(), 'crossing', x.d1, x.d2, x.id)),
  new Sum(crossings.length * NO_CROSS + CROSSINGS * (CROSS - NO_CROSS),
    ...crossings.map(x => x.id)),
];
const greenWhisper = steps.map(
  s => new NFA(greenDiffNFA(), 'green-whisper', s.id, s.a, s.b));

const contributions = gridCells.map(cell => isOpen(cell)
  ? new NFA(contributionNFA(), 'blue-contribution',
    bposA.at(cell), cell, blueDigit.at(cell))
  : new Given(blueDigit.at(cell), 1));
const boxCells = n => blueDigit.at(graph.box(n));
// A box with no blue cell in it has every contribution at 1, and the rule then
// says nothing about it.
const emptyBox = n => new Sum(boxCells(n).length, ...boxCells(n));
const blueBoxSums = [
  new EqualSum(...BLUE_BOXES.map(boxCells)),
  ...OTHER_BOXES.map(n => new Or([
    emptyBox(n), new EqualSum(boxCells(n), boxCells(BLUE_BOXES[0]))])),
];

return [
  shape,
  ...layers,
  ...domains,
  ...givens,
  ...cages,
  ...pathShape,
  ...seams,
  ...checkpoints,
  ...counters,
  ...crossingRule,
  ...greenWhisper,
  ...contributions,
  ...blueBoxSums,
];
