// Title: Grand Prix
// Author: Blobz
// Video: https://www.youtube.com/watch?v=qJ_ENK7bPUc
// Source: https://app.crackingthecryptic.com/sudoku/J3mq7L7GrN

// Normal sudoku. Digits in each 2-cell cage sum to its total.
// Two cars, blue and green, each draw a simple (non-repeating, non-branching)
// king-move path from some cell in box 1 to a fixed finish cell in box 2 (R1C5
// for blue, R2C5 for green -- the checkered-flag cage). Neither path may enter
// a grey cell or an oil-slick (given-digit) cell, and the two paths never share
// a cell. Five more 2-cell cages mark checkpoints; the rules state that at each
// one, one named cell is passed by the green car and the other by the blue car
// (read off the fill colour drawn on each cage's two cells -- yellowgreen is
// green, deepskyblue is blue). Adjacent cells along the green car's path differ
// by at least 5. The two paths cross exactly 3 times.
//
// Movement is read as king-move (orthogonal or diagonal), not stated in so many
// words but forced by the drawn geometry: checkpoint cell R5C9 is orthogonally
// reachable only via R6C9 (its other neighbours are R4C9, an oil slick, and
// R5C8, the other car's cell), which would make it an unreachable interior
// waypoint under orthogonal-only movement. Diagonal movement also gives "the
// paths cross" its only available reading: two cars' diagonals crossing inside
// one 2x2 block, counted below.
//
// Omitted: "digits along the blue path have an equal sum N within each box it
// passes through" -- the shared target N can reach the sum of up to six
// distinct digits (as high as 39), which exceeds ISS's 16-value Shape alphabet
// cap; expressing it needs a multi-layer base-N decomposition beyond this
// encoding's scope.
// Also not stated anywhere: that the two paths together must cover every
// track cell. This encoding does not require that (the relaxed, safe
// direction), so a car's path may be shorter than the full track.

// The alphabet is widened to 10 so the path Var layers can carry: cell
// membership (off-track / blue / green), a directed step code per king-move
// edge, an is-this-cell-the-start flag (box 1 candidates only), a crossing
// flag per grid corner, and two coprime position counters used only for
// subtour elimination (mod 5 and mod 9; their lcm 45 exceeds the 41-cell
// track, the safe bound on either path's length). The 81 grid cells are
// pinned back to 1-9 below.
const NV = 10;
const MOD_A = 5, MOD_B = 9;
const OFF_POS = 1;                 // counter value for a cell off that layer's path
const START_POS = 2;               // counter value of a path's first numbered cell

const OFF = 1, BLUE = 2, GREEN = 3;               // membership values
const UNUSED = 1, BLUE_FWD = 2, BLUE_BWD = 3, GREEN_FWD = 4, GREEN_BWD = 5; // step values
const NOT_START = 1, IS_START = 2;                // isStart flag values
const NOT_CROSS = 1, IS_CROSS = 2;                // crossing flag values

// --- Drawn geometry ---------------------------------------------------------
// Grey (impassable) cells -- provenance: 34 underlay tiles, fill #cfcfcf.
const GREY = [
  'R1C1', 'R1C2', 'R1C7', 'R1C8', 'R1C9', 'R2C1', 'R2C8', 'R2C9', 'R3C4', 'R3C5',
  'R3C9', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7',
  'R6C3', 'R6C4', 'R6C6', 'R6C7', 'R8C1', 'R8C9', 'R9C1', 'R9C2', 'R9C4', 'R9C5',
  'R9C6', 'R9C7', 'R9C8', 'R9C9',
];
// Oil-slick (given-digit) cells not already grey -- provenance: 6 rounded-rect
// grey-fill/green-border overlay marks, matching these six given cells exactly.
const OIL = ['R1C4', 'R3C3', 'R3C7', 'R4C9', 'R7C3', 'R8C5'];
// All given digits -- provenance: `cells[].value`.
const GIVENS = {
  R1C4: 6, R3C3: 4, R3C7: 8, R4C9: 7, R7C3: 5, R8C5: 3, R9C1: 4, R9C9: 3,
};

// Checkpoint cages -- provenance: `cages` totals plus each cage cell's fill
// colour (yellowgreen = green car, deepskyblue = blue car).
const CHECKPOINTS = [
  { green: 'R1C3', blue: 'R2C3', total: 12 },
  { green: 'R5C1', blue: 'R5C2', total: 12 },
  { green: 'R5C8', blue: 'R5C9', total: 7 },
  { green: 'R8C3', blue: 'R9C3', total: 3 },
  { green: 'R8C7', blue: 'R7C7', total: 5 },
];
// Finish cage -- provenance: cage total 16 plus the chequered-flag edge mark
// on R1C5-R2C5, with R1C5 filled deepskyblue (blue) and R2C5 yellowgreen (green).
const FINISH = { blue: 'R1C5', green: 'R2C5', total: 16 };
// Box-1 cells open to the "start in box 1" rule: every box-1 cell that is
// neither grey nor an oil slick. The rules do not name a single start cell, so
// this is encoded as a disjunction over all of them.
const BOX1_CANDIDATES = ['R1C3', 'R2C2', 'R2C3', 'R3C1', 'R3C2'];

// --- Shape and overlays ------------------------------------------------------
const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();

const mem = graph.makeOverlay('VM');                          // per-cell membership
const posA = graph.makeOverlay('VA');                          // position mod MOD_A
const posB = graph.makeOverlay('VB');                          // position mod MOD_B
const isStartBlue = graph.makeOverlay('VSB', BOX1_CANDIDATES); // box-1 cells only
const isStartGreen = graph.makeOverlay('VSG', BOX1_CANDIDATES);

// --- Step variables: one per king-move grid edge -----------------------------
// Records whether, and by which car and direction, the edge is used. `outX`/
// `inX` are the codes each endpoint reads for a step it exits/enters.
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
const stepIndex = new Map();
for (const cell of gridCells) {
  for (const [dR, dC] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepIndex.set(cell + '|' + other, id);
    stepIndex.set(other + '|' + cell, id);
    stepsAt.get(cell).push({
      id, outBlue: BLUE_FWD, inBlue: BLUE_BWD, outGreen: GREEN_FWD, inGreen: GREEN_BWD,
    });
    stepsAt.get(other).push({
      id, outBlue: BLUE_BWD, inBlue: BLUE_FWD, outGreen: GREEN_BWD, inGreen: GREEN_FWD,
    });
  }
}

// --- Custom NFAs --------------------------------------------------------------
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// Per-cell shape machine. `role` is 'box1' (reads the two start flags first),
// 'finish' (membership fixed by a Given elsewhere; always the path's end,
// degree 1), or 'normal' (interior only: degree 2 if a member, else degree 0).
// After membership, reads the two position counters, then every incident step.
// A cell's counters must be off exactly when it is off-track; each incident
// step must be UNUSED or match this cell's own membership colour -- a step
// coded for the other colour is rejected here, which is what keeps the two
// cars' cells disjoint. Degree is the count of matching in/out codes seen.
function cellRoleNFA(incident, role) {
  const sig = 'cell|' + role + '|' +
    incident.map(s => [s.outBlue, s.inBlue, s.outGreen, s.inGreen].join('/')).join(',');
  return cached(sig, () => {
    const headLen = role === 'box1' ? 3 : 1; // flags(0/1/2) + membership
    return NFA.encodeSpec({
      startState: { k: 0 },
      transition: (s, value) => {
        if (role === 'box1') {
          if (s.k === 0) return { k: 1, sb: value === IS_START };
          if (s.k === 1) return { k: 2, sb: s.sb, sg: value === IS_START };
        }
        if (s.k === headLen - 1) {
          // value = membership
          if (value === OFF) {
            if (role === 'box1' && (s.sb || s.sg)) return undefined;
            return { k: headLen, color: OFF, wantDeg1: false };
          }
          if (value === BLUE) {
            if (role === 'box1' && s.sg) return undefined;
            return {
              k: headLen, color: BLUE,
              wantDeg1: role === 'finish' || (role === 'box1' && s.sb),
            };
          }
          if (value === GREEN) {
            if (role === 'box1' && s.sb) return undefined;
            return {
              k: headLen, color: GREEN,
              wantDeg1: role === 'finish' || (role === 'box1' && s.sg),
            };
          }
          return undefined;
        }
        if (s.k === headLen) {
          // value = posA
          if (s.color === OFF) return value === OFF_POS ? { ...s, k: s.k + 1 } : undefined;
          return value !== OFF_POS ? { ...s, k: s.k + 1 } : undefined;
        }
        if (s.k === headLen + 1) {
          // value = posB
          if (s.color === OFF) {
            return value === OFF_POS ? { ...s, k: s.k + 1, in: 0, out: 0 } : undefined;
          }
          return value !== OFF_POS ? { ...s, k: s.k + 1, in: 0, out: 0 } : undefined;
        }
        const stepIdx = s.k - headLen - 2;
        if (stepIdx < 0 || stepIdx >= incident.length) return undefined;
        const codes = incident[stepIdx];
        let { in: nIn, out: nOut } = s;
        if (s.color === OFF) {
          if (value !== UNUSED) return undefined;
        } else if (s.color === BLUE) {
          if (value === codes.outBlue) nOut++;
          else if (value === codes.inBlue) nIn++;
          else if (value !== UNUSED) return undefined;
        } else {
          if (value === codes.outGreen) nOut++;
          else if (value === codes.inGreen) nIn++;
          else if (value !== UNUSED) return undefined;
        }
        if (nIn > 1 || nOut > 1) return undefined;
        return { ...s, k: s.k + 1, in: nIn, out: nOut };
      },
      accept: (s) => {
        if (s.k !== headLen + 2 + incident.length) return false;
        if (s.color === OFF) return s.in === 0 && s.out === 0;
        const deg = s.in + s.out;
        if (s.wantDeg1) return deg === 1;
        return s.in === 1 && s.out === 1;
      },
    }, NV);
  });
}

const nextPos = (v, mod) => 2 + ((v - 2 + 1) % mod);

// Position counter, shared by both cars: an in-use step advances the
// destination's counter by one past the source's, along its direction of
// travel; a genuine cycle (of either colour) would need its length to be 0
// mod both MOD_A and MOD_B, impossible once their lcm exceeds the track size.
const counterNFA = mod => cached('cnt' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF_POS || value === OFF_POS) return undefined;
    const isFwd = s.dir === BLUE_FWD || s.dir === GREEN_FWD;
    if (isFwd) return value === nextPos(s.a, mod) ? { done: true } : undefined;
    return s.a === nextPos(value, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// Adjacent digits along the green car's path differ by at least 5; a step
// unused, or used by blue, carries no constraint.
const diffNFA = cached('diff', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, isGreen: value === GREEN_FWD || value === GREEN_BWD };
    if (s.k === 1) return { k: 2, isGreen: s.isGreen, a: value };
    if (s.k !== 2) return undefined;
    if (!s.isGreen) return { done: true };
    return Math.abs(s.a - value) >= 5 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// A crossing is one car's diagonal step through a grid corner together with
// the other car's diagonal step through that same corner (an X inside one
// 2x2 block). Reads the block's two diagonal steps, then the crossing flag.
const crossNFA = cached('cross', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, d1: value };
    if (s.k === 1) {
      const blue1 = s.d1 === BLUE_FWD || s.d1 === BLUE_BWD;
      const green1 = s.d1 === GREEN_FWD || s.d1 === GREEN_BWD;
      const blue2 = value === BLUE_FWD || value === BLUE_BWD;
      const green2 = value === GREEN_FWD || value === GREEN_BWD;
      const crossing = (blue1 && green2) || (green1 && blue2);
      return { k: 2, crossing };
    }
    if (s.k !== 2) return undefined;
    return value === (s.crossing ? IS_CROSS : NOT_CROSS) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// --- Assemble ------------------------------------------------------------
const box1Set = new Set(BOX1_CANDIDATES);
const finishCells = new Set([FINISH.blue, FINISH.green]);

// Every inner grid corner (i,j), i,j in 2..9: the two diagonal steps of the
// 2x2 block it sits in the middle of.
const crossCorners = [];
for (let i = 2; i <= 9; i++) {
  for (let j = 2; j <= 9; j++) {
    const d1 = stepIndex.get(makeCellId(i - 1, j - 1) + '|' + makeCellId(i, j));
    const d2 = stepIndex.get(makeCellId(i - 1, j) + '|' + makeCellId(i, j - 1));
    crossCorners.push({ d1, d2, flag: 'VX' + (crossCorners.length + 1) });
  }
}

const layers = [
  mem.toVar('car membership: off-track / blue / green'),
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  isStartBlue.toVar('is this box-1 cell the blue start'),
  isStartGreen.toVar('is this box-1 cell the green start'),
  new Var('S', 'king-move steps', steps.length),
  new Var('X', 'crossing flags', crossCorners.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  mem.makeReplicate(new Given(mem.at(gridCells[0]), OFF, BLUE, GREEN)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
  isStartBlue.makeReplicate(new Given(isStartBlue.at(BOX1_CANDIDATES[0]), NOT_START, IS_START)),
  isStartGreen.makeReplicate(new Given(isStartGreen.at(BOX1_CANDIDATES[0]), NOT_START, IS_START)),
  // Step and crossing-flag Vars take no explicit domain constraint: the
  // per-cell and crossing machines below only ever accept the codes each one
  // defines.
];

// Sudoku givens.
const givens = Object.entries(GIVENS).map(([cell, v]) => new Given(cell, v));

// Checkpoint cages: the sum is a plain 2-cell cage regardless of path colour.
const cages = [...CHECKPOINTS, FINISH].map(cp => new Cage(cp.total, cp.green, cp.blue));

// Grey and oil-slick cells: off both cars' paths.
const blockedCells = [...new Set([...GREY, ...OIL])];
const trackBans = blockedCells.map(cell => new Given(mem.at(cell), OFF));

// Checkpoint / finish colour pins: the named cell is on the named car's path.
const checkpointPins = [
  ...CHECKPOINTS.flatMap(cp => [new Given(mem.at(cp.green), GREEN), new Given(mem.at(cp.blue), BLUE)]),
  new Given(mem.at(FINISH.blue), BLUE),
  new Given(mem.at(FINISH.green), GREEN),
];

// Exactly one box-1 candidate is each car's start (Sum(6,...): five cells each
// NOT_START(1) or IS_START(2); the unique way to reach 6 is one IS_START).
const startCounts = [
  new Sum(6, ...isStartBlue.at(BOX1_CANDIDATES)),
  new Sum(6, ...isStartGreen.at(BOX1_CANDIDATES)),
];

// Per-cell path shape.
const pathShape = gridCells.map(cell => {
  const role = finishCells.has(cell) ? 'finish' : (box1Set.has(cell) ? 'box1' : 'normal');
  const incident = stepsAt.get(cell);
  const nfa = cellRoleNFA(incident, role);
  const cells = role === 'box1'
    ? [isStartBlue.at(cell), isStartGreen.at(cell), mem.at(cell), posA.at(cell), posB.at(cell),
      ...incident.map(s => s.id)]
    : [mem.at(cell), posA.at(cell), posB.at(cell), ...incident.map(s => s.id)];
  return new NFA(nfa, 'path-cell', ...cells);
});

const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

const differences = steps.map(s => new NFA(diffNFA, 'green-difference', s.id, s.a, s.b));

const crossings = crossCorners.map(c => new NFA(crossNFA, 'crossing', c.d1, c.d2, c.flag));
// Exactly 3 crossing flags are set: n cells each NOT_CROSS(1) or IS_CROSS(2)
// sum to n + (number set), so target n+3 forces exactly 3.
const crossingCount = new Sum(crossCorners.length + 3, ...crossCorners.map(c => c.flag));

return [
  shape,
  ...layers,
  ...domains,
  ...givens,
  ...cages,
  ...trackBans,
  ...checkpointPins,
  ...startCounts,
  ...pathShape,
  ...counters,
  ...differences,
  ...crossings,
  crossingCount,
];
