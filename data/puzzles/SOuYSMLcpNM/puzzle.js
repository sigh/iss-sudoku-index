// Title: Simple Loop Sudoku
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=SOuYSMLcpNM
// Source: https://app.crackingthecryptic.com/sudoku/B4fMfpp3FG

// Normal sudoku. A loop is drawn through every cell except the cells holding
// a 5, and it may not branch, intersect or cross itself. Fourteen outside
// clues (7 row, 7 column) each give the sum of the cells strictly between a
// named border and that row/column's unique 5: grey clues sum only the cells
// where the loop runs straight through, white clues sum only the cells where
// the loop turns a corner.
//
// The rules grant the loop no movement of its own (no diagonal, king, or
// jumping step is named), so it is the unqualified orthogonal cell-centre
// loop. 72 of the 81 cells lie on it (one 5 per row), so the loop must run
// alongside itself somewhere; degree is taken from used edges, not from
// on-loop neighbour count, so self-touching is legal and no no-touch rule is
// encoded, matching the rules' silence on it.
//
// Nothing is omitted.

const OFF_LOOP = 5;                  // the excluded digit
const UNUSED = 1, FWD = 2, BWD = 3;  // a step is unused, or runs a->b or b->a
const MOD_A = 8, MOD_B = 9;          // the two loop-position moduli
const OFF_POS = 1;                   // position value pinned on cells off the loop
const OFF_SEG = 1, STRAIGHT_SEG = 2, TURN_SEG = 3;  // a cell's loop-segment shape

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Position along the loop, mod 8 and mod 9. Value v means position v-1.
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
// Per-cell loop-segment shape: off the loop, a straight run-through, or a
// corner turn. Read by the outside sum clues below.
const seg = graph.makeOverlay('VC');

// --- Steps ---------------------------------------------------------------
// One Var per orthogonally adjacent pair of cells, recording whether the loop
// uses that pair and in which direction, plus the pair's fixed axis (H for a
// left-right step, V for up-down) used to classify straight vs corner below.
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dR, dC, axis] of [[0, 1, 'H'], [1, 0, 'V']]) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other, axis });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD, axis });
    stepsAt.get(other).push({ id, out: BWD, in: FWD, axis });
  }
}
const stepBetween = (p, q) =>
  steps.find(s => (s.a === p && s.b === q) || (s.a === q && s.b === p));

// --- Loop membership, degree, and segment shape ---------------------------
// Reads a cell's digit, then each step it is an endpoint of, then the seg
// overlay cell. A cell holding 5 is off the loop and uses no step; every
// other cell is entered once and left once (branch/cross-free), and its used
// steps' axes classify it straight (both horizontal or both vertical) or a
// corner (one of each) -- which the trailing seg value must match.
const segAndDegreeNFA = incident => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value !== OFF_LOOP, in: 0, out: 0, h: 0, v: 0 };
    if (s.k <= incident.length) {
      const step = incident[s.k - 1];
      let { in: nIn, out: nOut, h: nH, v: nV } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (value === step.in || value === step.out) {
        if (step.axis === 'H') nH++; else nV++;
      }
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: s.k + 1, on: s.on, in: nIn, out: nOut, h: nH, v: nV };
    }
    // Final symbol: the seg overlay cell. Check it against what the scanned
    // digit/steps force.
    let expected;
    if (!s.on) {
      if (s.in !== 0 || s.out !== 0) return undefined;
      expected = OFF_SEG;
    } else {
      if (s.in !== 1 || s.out !== 1) return undefined;
      if (s.h === 2 && s.v === 0) expected = STRAIGHT_SEG;
      else if (s.v === 2 && s.h === 0) expected = STRAIGHT_SEG;
      else if (s.h === 1 && s.v === 1) expected = TURN_SEG;
      else return undefined;
    }
    return value === expected ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, geometry.numValues);
const segments = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(segAndDegreeNFA(incident), 'loop-segment',
    cell, ...incident.map(s => s.id), seg.at(cell));
});

// --- Position counters ----------------------------------------------------
// Degree alone leaves the used steps as any disjoint union of directed cycles
// covering the non-5 cells. Numbering the loop 0, 1, 2, ... along its
// direction of travel is always possible, so requiring the arriving cell's
// position to be the leaving cell's plus one (mod m) adds nothing; but it
// forces every cycle's length to be divisible by m. lcm(8, 9) = 72 and the
// non-5 cells number exactly 72 (one 5 per row), so a second cycle would have
// to be 72 cells long as well. One cycle is all that survives.
const nextPos = (v, mod) => 1 + (v % mod);
const counterNFA = mod => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.dir === FWD) return value === nextPos(s.a, mod) ? { done: true } : undefined;
    return s.a === nextPos(value, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, geometry.numValues);
const counterA = counterNFA(MOD_A), counterB = counterNFA(MOD_B);
const counters = steps.flatMap(s => [
  new NFA(counterA, 'loop-position', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterB, 'loop-position', s.id, posB.at(s.a), posB.at(s.b)),
]);

// A cell off the loop carries no position, so pin it to one value rather than
// leaving nine spare assignments per omitted cell. Key: digit 5 forces OFF_POS.
const offPosKey = Pair.fnToKey(
  (digit, pos) => digit !== OFF_LOOP || pos === OFF_POS, geometry.numValues);
const offPositions = gridCells.flatMap(cell => [
  new Pair(offPosKey, 'off-loop-position', cell, posA.at(cell)),
  new Pair(offPosKey, 'off-loop-position', cell, posB.at(cell)),
]);

// --- Seam -----------------------------------------------------------------
// Numbering a closed loop is free to start anywhere and run either way, an
// artifact of the counters above rather than of the puzzle. Both are pinned
// at the first cell of the grid that is on the loop: R1C1, or R1C2 when R1C1
// holds the row's 5. R1C1 takes position 0 either way -- as the seam when it
// is on the loop, and as an off-loop cell otherwise.
const seamStarts = [
  new Given(posA.at('R1C1'), OFF_POS),
  new Given(posB.at('R1C1'), OFF_POS),
  new Pair(offPosKey, 'loop-seam', 'R1C1', posA.at('R1C2')),
  new Pair(offPosKey, 'loop-seam', 'R1C1', posB.at('R1C2')),
];
// Direction: the seam cell leaves along its rightward step. R1C1 is a corner,
// so when it is on the loop both of its steps are used and one of the two
// directions runs R1C1 -> R1C2; when it is off, R1C2's only other neighbours
// are R1C3 and R2C2, so the step to R1C3 is used and one direction runs that
// way.
const seamDirection = new NFA(NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value !== OFF_LOOP };
    if (s.k === 1) return (s.on && value !== FWD) ? undefined : { k: 2, on: s.on };
    if (s.k !== 2) return undefined;
    return (!s.on && value !== FWD) ? undefined : { k: 3 };
  },
  accept: s => s.k === 3,
}, geometry.numValues), 'loop-seam',
  'R1C1', stepBetween('R1C1', 'R1C2').id, stepBetween('R1C2', 'R1C3').id);

// --- Outside sum clues -----------------------------------------------------
// Each clue scans its row/column from the named border to the far end
// (border cell first), reading (digit, segment-shape) pairs. It stops adding
// once it passes the row/column's 5 -- exactly one, by sudoku -- and requires
// the accumulated sum (over cells whose segment shape matches the clue's
// colour) to equal the printed total.
// Provenance: clue values are transcribed from the puzzle's outside-grid
// cell values and text overlays, classified grey (grey cell-fill ring
// immediately around the grid) vs white (plain background, one cell further
// out).
const borderSumSpec = (segCode, target) => NFA.encodeSpec({
  startState: { phase: 0, seenOff: false, sum: 0, curDigit: null },
  transition: (s, value) => {
    if (s.phase === 0) return { phase: 1, seenOff: s.seenOff, sum: s.sum, curDigit: value };
    // phase 1: value is this cell's segment-shape overlay value.
    if (s.seenOff) return { phase: 0, seenOff: true, sum: s.sum, curDigit: null };
    if (s.curDigit === OFF_LOOP) return { phase: 0, seenOff: true, sum: s.sum, curDigit: null };
    const hit = value === segCode ? s.curDigit : 0;
    return { phase: 0, seenOff: false, sum: Math.min(s.sum + hit, target + 1), curDigit: null };
  },
  accept: s => s.phase === 0 && s.seenOff === true && s.sum === target,
}, geometry.numValues);

const borderSumClue = (lineCells, segCode, target, name) => {
  const args = lineCells.flatMap(c => [c, seg.at(c)]);
  return new NFA(borderSumSpec(segCode, target), name, ...args);
};

// Row clues: [row, side, category, value]. Local (payload-relative) rows 1-9.
const rowClues = [
  [1, 'left', STRAIGHT_SEG, 7],
  [1, 'right', TURN_SEG, 7],
  [4, 'left', TURN_SEG, 35],
  [5, 'left', TURN_SEG, 12],
  [5, 'right', STRAIGHT_SEG, 21],
  [6, 'left', STRAIGHT_SEG, 6],
  [8, 'right', TURN_SEG, 8],
].map(([row, side, cat, value]) => {
  const cells = graph.row(row);
  const ordered = side === 'left' ? cells : [...cells].reverse();
  const catName = cat === STRAIGHT_SEG ? 'straight' : 'corner';
  return borderSumClue(ordered, cat, value, `outside-row${row}-${side}-${catName}`);
});

// Column clues: [col, side, category, value]. Local (payload-relative) cols 1-9.
const colClues = [
  [4, 'top', TURN_SEG, 24],
  [4, 'bottom', STRAIGHT_SEG, 13],
  [4, 'bottom', TURN_SEG, 3],
  [6, 'top', TURN_SEG, 23],
  [6, 'bottom', STRAIGHT_SEG, 9],
  [7, 'top', TURN_SEG, 10],
  [8, 'top', TURN_SEG, 10],
].map(([col, side, cat, value]) => {
  const cells = graph.column(col);
  const ordered = side === 'top' ? cells : [...cells].reverse();
  const catName = cat === STRAIGHT_SEG ? 'straight' : 'corner';
  return borderSumClue(ordered, cat, value, `outside-col${col}-${side}-${catName}`);
});

// --- Givens ----------------------------------------------------------------
// Local (payload-relative) coordinates; transcribed from the puzzle's given
// cell digits.
const givens = [
  new Given('R3C3', 6),
  new Given('R3C7', 2),
  new Given('R7C3', 9),
  new Given('R7C7', 3),
];

return [
  new Shape('9x9'),
  ...givens,
  new Var('S', 'loop steps', steps.length),
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  seg.toVar('loop segment shape'),
  // Position values run 1..MOD; the mod 9 layer already spans the whole range.
  posA.makeReplicate(new Given(posA.at(gridCells[0]), 1, 2, 3, 4, 5, 6, 7, 8)),
  ...segments,
  ...counters,
  ...offPositions,
  ...seamStarts,
  seamDirection,
  ...rowClues,
  ...colClues,
];
