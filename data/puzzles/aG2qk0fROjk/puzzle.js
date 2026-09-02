// Title: Loop Sum
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=aG2qk0fROjk
// Source: https://app.crackingthecryptic.com/sudoku/ML8NMNhdGH

// The rules encoded below, in full; nothing is omitted.
//  - Digits 1-9. Every row, column and region holds each digit once. The nine
//    regions are nine orthogonally connected cells apiece and are the solver's
//    to find: ChaosConstruction, with NoBoxes because the grid has no 3x3 boxes.
//  - A loop travels horizontally and vertically from cell to cell.
//  - The loop enters and exits every region exactly once.
//  - A small clue in the top left corner of a cell is the sum of the digits of
//    all the cells the loop visits in that cell's region.
//
// Var layers, one cell per grid cell:
//   VD  the loop step leaving this cell: OFF, or UP / DOWN / LEFT / RIGHT.
//   VO  where this cell's region falls in the loop's tour of the regions, 1-9.
//   VC  2 if the step leaving this cell crosses into another region, else 1.
//   VA/VB  the running total of loop digits since the loop entered the region
//          it is currently in, as base-9 digits stored one greater than their
//          value: total = 9*(VA - 1) + (VB - 1).
//   VS/VT  the loop total of this cell's own region, same encoding.
//
// VO is the piece that turns "enters and exits every region exactly once" into
// local rules. It is constant across a region and takes each of 1-9 exactly
// nine times, so its level sets are exactly the nine nine-cell regions; and it
// rises by exactly 1 mod 9 at every step that crosses a region border. One step
// out of each visited cell and one step into each visited cell makes the
// visited cells a disjoint union of directed cycles, and then:
//   (a) VO returns to its starting value around any cycle, so every cycle
//       crosses a multiple of 9 borders;
//   (b) a cycle crossing no border would have the running total of (a)
//       increasing all the way round back to itself, which no total can do, so
//       no cycle crosses 0 borders;
//   (c) the Sum over VC below fixes the number of border crossings at 9.
// Hence exactly one cycle, crossing exactly 9 borders, whose nine runs carry 9
// consecutive VO residues -- all different, so all nine regions, each entered
// and left exactly once.
//
// Two symmetries belong to the VO layer rather than to the puzzle, and each is
// pinned to one representative below: which rotation of the tour is numbered 1
// (R1C1's region), and which of the loop's two traversal directions VO counts
// along (region 2 must first appear before region 9 in reading order).

const OFF = 1, UP = 2, DOWN = 3, LEFT = 4, RIGHT = 5;
const STEPS = [
  { code: UP, dRow: -1, dCol: 0, back: DOWN },
  { code: DOWN, dRow: 1, dCol: 0, back: UP },
  { code: LEFT, dRow: 0, dCol: -1, back: RIGHT },
  { code: RIGHT, dRow: 0, dCol: 1, back: LEFT },
];

// A region holds the nine different digits, so the loop's total within one
// region -- and every running total on the way to it -- is at most 45.
const MAX_TOTAL = 45;
const NUM_REGIONS = 9;

// The nine small corner numbers, each transcribed from the text overlay drawn
// just inside the top-left corner of the named cell.
const CORNER_CLUES = {
  R1C1: 43, R1C2: 1, R2C4: 23, R2C8: 21, R3C1: 1,
  R5C2: 2, R5C8: 31, R6C7: 29, R7C1: 6,
};

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const NV = geometry.numValues;
const gridCells = graph.cells();

const dir = graph.makeOverlay('VD');
const order = graph.makeOverlay('VO');
const cross = graph.makeOverlay('VC');
const runHi = graph.makeOverlay('VA');
const runLo = graph.makeOverlay('VB');
const sumHi = graph.makeOverlay('VS');
const sumLo = graph.makeOverlay('VT');
const region = graph.makeOverlay('CC');   // ChaosConstruction's own label layer

// A total 0..80 packed into two cells, each holding its base-9 digit plus 1.
const packHi = total => Math.floor(total / NV) + 1;
const packLo = total => (total % NV) + 1;
const unpack = (hi, lo) => (hi - 1) * NV + (lo - 1);
const HI_VALUES = Array.from(
  { length: packHi(MAX_TOTAL) }, (_, n) => n + 1);

// The in-grid orthogonal steps out of a cell, with the neighbour each reaches.
const stepsFrom = cell => STEPS
  .map(step => ({ ...step, other: graph.step(cell, step.dRow, step.dCol) }))
  .filter(step => step.other);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Layer domains --------------------------------------------------------
// A cell may only step to a neighbour that exists, so border cells lose the
// directions that point off the grid.
const dirDomains = gridCells.map(cell =>
  new Given(dir.at(cell), OFF, ...stepsFrom(cell).map(step => step.code)));

const otherDomains = [
  cross.makeReplicate(new Given(cross.cells()[0], 1, 2)),
  runHi.makeReplicate(new Given(runHi.cells()[0], ...HI_VALUES)),
  sumHi.makeReplicate(new Given(sumHi.cells()[0], ...HI_VALUES)),
];

// --- Degree ---------------------------------------------------------------
// Reads [VD, VA, VB] of the cell, then the VD of each neighbour. A neighbour
// steps into this cell exactly when its own VD holds the direction back
// towards it, which is `back` of the step that reaches the neighbour. A cell
// the loop misses is stepped into by nobody and carries the zero total; a cell
// the loop visits is stepped into exactly once (and steps out exactly once,
// which its own VD already says).
const degreeNFA = inCodes => cached('deg|' + inCodes.join(','), () =>
  NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, on: value !== OFF };
      if (s.k <= 2) {   // VA then VB: pinned to the zero total when off-loop
        if (!s.on && value !== 1) return undefined;
        return { k: s.k + 1, on: s.on, in: 0 };
      }
      const index = s.k - 3;
      if (index >= inCodes.length) return undefined;
      const seen = s.in + (value === inCodes[index] ? 1 : 0);
      if (seen > 1) return undefined;
      return { k: s.k + 1, on: s.on, in: seen };
    },
    accept: s => s.k === 3 + inCodes.length && s.in === (s.on ? 1 : 0),
  }, NV));

const degrees = gridCells.map(cell => {
  const steps = stepsFrom(cell);
  return new NFA(
    degreeNFA(steps.map(step => step.back)), 'loop-degree',
    dir.at(cell), runHi.at(cell), runLo.at(cell),
    ...steps.map(step => dir.at(step.other)));
});

// --- Region tour ----------------------------------------------------------
// Reads [VD, VO] of the cell, then the VO of each neighbour, then its VC. The
// neighbour the cell steps to is either in the same region (VO equal, no
// crossing) or in the region next in the tour (VO one greater mod 9, a
// crossing). A cell the loop misses crosses nothing.
const tourNFA = outCodes => cached('tour|' + outCodes.join(','), () =>
  NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, d: value };
      if (s.k === 1) {
        return s.d === OFF
          ? { k: 2, need: 1 }
          : { k: 2, d: s.d, o: value, need: null };
      }
      const index = s.k - 2;
      if (index === outCodes.length) {   // the cell's own VC closes the scan
        return s.need === value ? { done: true } : undefined;
      }
      if (index > outCodes.length) return undefined;
      if (outCodes[index] !== s.d) return { ...s, k: s.k + 1 };
      const need = value === s.o ? 1
        : value === (s.o % NUM_REGIONS) + 1 ? 2
          : null;
      return need === null ? undefined : { k: s.k + 1, need };
    },
    accept: s => s.done === true,
  }, NV));

const tours = gridCells.map(cell => {
  const steps = stepsFrom(cell);
  return new NFA(
    tourNFA(steps.map(step => step.code)), 'loop-region-tour',
    dir.at(cell), order.at(cell),
    ...steps.map(step => order.at(step.other)),
    cross.at(cell));
});

// Exactly nine crossings: 81 cells contribute 1 each, and the 9 that cross
// contribute a second.
const crossingCount = new Sum(
  gridCells.length + NUM_REGIONS, ...cross.cells());

// VO is constant across a region and holds each of 1-9 nine times, so its level
// sets are unions of regions of nine cells each -- one region apiece.
const orderIsRegional = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [right, down].filter(other => other).map(other =>
    new NFA(sameKeySameValue(1), 'region-order',
      ...region.at([cell, other]), ...order.at([cell, other])));
});
const orderCounts = new ContainExact(
  Array.from({ length: NUM_REGIONS },
    (_, n) => Array(NUM_REGIONS).fill(n + 1).join('_')).join('_'),
  ...order.cells());

// Reads two key cells then `pairs` pairs of payload cells: whenever the keys
// agree, each payload pair must agree too.
function sameKeySameValue(pairs) {
  return cached('same|' + pairs, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.free) return { free: true };
      if (s.k === 0) return { k: 1, key: value };
      if (s.k === 1) return value === s.key ? { k: 2 } : { free: true };
      const index = s.k - 2;
      if (index >= 2 * pairs) return undefined;
      return index % 2 === 0
        ? { k: s.k + 1, held: value }
        : (value === s.held ? { k: s.k + 1 } : undefined);
    },
    accept: s => s.free === true || s.k === 2 + 2 * pairs,
  }, NV));
}

// The region total is a property of the region, so neighbours sharing a region
// carry the same VS/VT.
const regionSumIsRegional = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [right, down].filter(other => other).map(other =>
    new NFA(sameKeySameValue(2), 'region-sum-constant',
      ...order.at([cell, other]),
      ...sumHi.at([cell, other]), ...sumLo.at([cell, other])));
});

// --- The corner clues -----------------------------------------------------
const clues = Object.entries(CORNER_CLUES).flatMap(([cell, total]) => [
  new Given(sumHi.at(cell), packHi(total)),
  new Given(sumLo.at(cell), packLo(total)),
]);

// --- Accumulating the loop total --------------------------------------------
// One machine per (cell, direction), reading
// [VD_a, VO_a, VO_b, VA_a, VB_a, VS_a, VT_a, digit_b, VA_b, VB_b].
// It is inert unless the cell's step is the one this machine is built for.
// Where the step stays inside the region, b's running total is a's plus b's
// digit; where it crosses, a was the last cell of its region's visit, so a's
// running total is that region's loop total, and b's running total restarts at
// b's own digit.
const stepNFA = code => cached('step|' + code, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.inert) return { inert: true };
    switch (s.k) {
      case 0:                                        // VD of a
        return value === code ? { k: 1 } : { inert: true };
      case 1:                                        // VO of a
        return { k: 2, o: value };
      case 2:                                        // VO of b
        return { k: 3, same: value === s.o };
      case 3:                                        // VA of a
        return { k: 4, same: s.same, hi: value };
      case 4: {                                      // VB of a
        const total = unpack(s.hi, value);
        if (total > MAX_TOTAL) return undefined;
        return { k: 5, same: s.same, total };
      }
      case 5:                                        // VS of a
        return s.same
          ? { k: 6, same: true, total: s.total }
          : { k: 6, same: false, total: s.total, hi: value };
      case 6:                                        // VT of a
        if (s.same) return { k: 7, total: s.total };
        return unpack(s.hi, value) === s.total
          ? { k: 7, total: 0 }                       // the run restarts at b
          : undefined;
      case 7: {                                      // the digit in b
        const total = s.total + value;
        if (total > MAX_TOTAL) return undefined;
        return { k: 8, total };
      }
      case 8:                                        // VA of b
        return value === packHi(s.total)
          ? { k: 9, lo: packLo(s.total) }
          : undefined;
      case 9:                                        // VB of b
        return value === s.lo ? { done: true } : undefined;
      default:
        return undefined;
    }
  },
  accept: s => s.inert === true || s.done === true,
}, NV));

const steps = gridCells.flatMap(cell => stepsFrom(cell).map(step =>
  new NFA(stepNFA(step.code), 'loop-sum-step',
    dir.at(cell), ...order.at([cell, step.other]),
    runHi.at(cell), runLo.at(cell), sumHi.at(cell), sumLo.at(cell),
    step.other, runHi.at(step.other), runLo.at(step.other))));

// --- Pinning the VO layer's own two symmetries ------------------------------
// Which rotation of the tour is called 1.
const tourStart = new Given(order.at(gridCells[0]), 1);

// Which way round the loop VO counts. Reversing the traversal swaps the region
// numbered 2 with the region numbered 9 (and 3 with 8, and so on), so requiring
// region 2 to appear before region 9 in reading order admits exactly one of the
// two directions.
const tourDirection = new NFA(NFA.encodeSpec({
  startState: { seen: 0 },
  transition: (s, value) => s.seen !== 0 ? s
    : { seen: value === 2 ? 2 : value === NUM_REGIONS ? NUM_REGIONS : 0 },
  accept: s => s.seen === 2,
}, NV), 'tour-direction', ...order.cells());

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  new Given('R8C1', 9),
  new Given('R9C6', 3),
  dir.toVar('loop step out of the cell'),
  order.toVar('position of the cell region in the loop tour'),
  cross.toVar('the step out of the cell leaves its region'),
  runHi.toVar('running loop total, base-9 high digit'),
  runLo.toVar('running loop total, base-9 low digit'),
  sumHi.toVar('region loop total, base-9 high digit'),
  sumLo.toVar('region loop total, base-9 low digit'),
  ...dirDomains,
  ...otherDomains,
  ...degrees,
  ...tours,
  crossingCount,
  ...orderIsRegional,
  orderCounts,
  ...regionSumIsRegional,
  ...clues,
  ...steps,
  tourStart,
  tourDirection,
];
