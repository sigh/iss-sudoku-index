// Title: Chaotic Wrogn
// Author: Undar Beyond
// Video: https://www.youtube.com/watch?v=zfIomUELg6c
// Source: https://app.crackingthecryptic.com/sudoku/6dP4FN27HB

// Normal sudoku rules apply (default row/col/box all-different from
// Shape('9x9') -- the payload's own regions are the ordinary boxes).
// Every drawn clue on the grid is stated to be INVALID under the "valid if"
// definition given in the rules text, so every clue below is encoded as the
// NEGATION of that definition -- never the definition itself.
//
// Clue families, all negated:
//  - killer cages: NOT(sum of cage cells == printed total). The rules name
//    only the total as what makes a cage "valid" (no uniqueness clause), so
//    cages are sum regions here, not `Cage`s -- repeats within a cage are
//    not forbidden.
//  - outside clues: each printed lane number is ambiguously either an
//    X-sum or a skyscraper clue (the rules give both readings and nothing
//    in the source marks which applies to which lane), so BOTH readings
//    are negated wherever each is arithmetically possible for that lane
//    (X-sum: 1-45; skyscraper: 1-9 -- see the per-lane table below). A
//    printed value outside a reading's possible range already can never
//    satisfy that reading, so no constraint is added for it.
//  - thermometers: NOT(strictly increasing from the bulb).
//  - white dots: NOT(consecutive). Black dots: NOT(one cell double the
//    other). X: NOT(sum to 10). V: NOT(sum to 5).
//  - circles ("all listed digits appear in the touching 4 cells"):
//    NOT(every listed digit appears among the 4 cells) -- i.e. at least one
//    listed digit is missing from all 4 cells.
//  - maximum cells ("larger than all 4 orthogonal neighbours"):
//    NOT(larger than all 4 neighbours) -- i.e. at least one neighbour is
//    >= the marked cell.

const grid = new Shape('9x9');

// ---------- custom relation / NFA builders ----------

// NOT(sum of the scanned cells == target). Running total clamped at
// target+1 once it can no longer return to target.
function notSumSpec(target) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (state, value) => Math.min(state + value, target + 1),
    accept: (state) => state !== target,
  }, 9);
}

// NOT(valid X-sum clue of value `target`), scanned nearest-grid-first. X is
// the value of the first scanned cell; valid iff the sum of the first X
// cells equals target. State freezes (fin) once the X-length prefix is
// consumed so later cells in the 9-cell lane don't add extra states, and
// the frozen state drops the (p, X) fields so equal outcomes canonicalize
// to the same state instead of multiplying the state count.
function notXSumSpec(target) {
  return NFA.encodeSpec({
    startState: { fin: false, p: 0, X: null, s: 0 },
    transition: (state, value) => {
      if (state.fin) return state;
      const p = state.p + 1;
      if (state.X === null) {
        // This cell's own value fixes X.
        const X = value;
        const s = Math.min(value, target + 1);
        return (p === X) ? { fin: true, s } : { fin: false, p, X, s };
      }
      const s = Math.min(state.s + value, target + 1);
      return (p === state.X)
        ? { fin: true, s }
        : { fin: false, p, X: state.X, s };
    },
    accept: (state) => state.fin ? (state.s !== target) : true,
  }, 9);
}

// NOT(valid skyscraper clue of value `target`), scanned nearest-grid-first:
// count new running maxima; valid iff the count equals target.
function notSkyscraperSpec(target) {
  return NFA.encodeSpec({
    startState: { max: 0, count: 0 },
    transition: (state, value) => (value > state.max)
      ? { max: value, count: Math.min(state.count + 1, target + 1) }
      : state,
    accept: (state) => state.count !== target,
  }, 9);
}

const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const notRatio2Key = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const notSum10Key = Pair.fnToKey((a, b) => a + b !== 10, 9);
const notSum5Key = Pair.fnToKey((a, b) => a + b !== 5, 9);
// "next <= prev" -- true exactly when a strictly-increasing step fails here.
const notIncreasingKey = Pair.fnToKey((a, b) => b <= a, 9);
// "neighbour >= marked cell" -- true exactly when the maximum claim fails
// at this neighbour.
const geKey = Pair.fnToKey((a, b) => b >= a, 9);

// ---------- killer cages ----------
// Transcribed from the drawn killer cages (id order). Cage 10 (R5C4,R6C4,
// R6C5, total 42) is omitted: the max possible sum of 3 distinct 1-9
// digits is 24, so 42 can never be a valid total and the negation needs no
// constraint.
const cageDefs = [
  { cells: ['R2C1', 'R1C1', 'R1C2'], total: 9 },
  { cells: ['R1C4', 'R1C5', 'R1C6', 'R2C6'], total: 16 },
  { cells: ['R2C4', 'R2C5', 'R3C5'], total: 15 },
  { cells: ['R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6'], total: 28 },
  { cells: ['R1C7', 'R1C8', 'R2C8', 'R2C9', 'R3C9'], total: 30 },
  { cells: ['R5C7', 'R5C8'], total: 17 },
  { cells: ['R6C7', 'R7C7'], total: 8 },
  { cells: ['R7C8', 'R8C8', 'R9C8'], total: 7 },
  { cells: ['R7C1', 'R8C1', 'R9C1'], total: 18 },
  { cells: ['R6C1', 'R5C1', 'R4C1', 'R4C2'], total: 14 },
];
// 2-cell cages are a plain pairwise sum relation, not a scan; use Pair for
// those instead of a 2-symbol NFA.
const cageConstraints = cageDefs.map((c, i) => {
  if (c.cells.length === 2) {
    const key = Pair.fnToKey((a, b) => a + b !== c.total, 9);
    return new Pair(key, `cage${i}-not${c.total}`, ...c.cells);
  }
  return new NFA(notSumSpec(c.total), `cage${i}-not${c.total}`, ...c.cells);
});

// ---------- outside clues ----------

const topLane = (col) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, col));
const bottomLane = (col) => Array.from({ length: 9 }, (_, i) => makeCellId(9 - i, col));
const leftLane = (row) => Array.from({ length: 9 }, (_, i) => makeCellId(row, i + 1));
const rightLane = (row) => Array.from({ length: 9 }, (_, i) => makeCellId(row, 9 - i));

// side, lane index, printed value, cells in nearest-grid-first order.
// Values transcribed from the drawn outside-clue overlays.
const laneClues = [
  { tag: 'top1', val: 1, cells: topLane(1) },
  { tag: 'top2', val: 1, cells: topLane(2) },
  { tag: 'top3', val: 1, cells: topLane(3) },
  { tag: 'top4', val: 11, cells: topLane(4) },
  { tag: 'top5', val: 111, cells: topLane(5) },
  { tag: 'top6', val: 11, cells: topLane(6) },
  { tag: 'top7', val: 11, cells: topLane(7) },
  { tag: 'top8', val: 111, cells: topLane(8) },
  { tag: 'top9', val: 1111, cells: topLane(9) },
  { tag: 'left1', val: 1, cells: leftLane(1) },
  { tag: 'left2', val: 23, cells: leftLane(2) },
  { tag: 'left3', val: 45, cells: leftLane(3) },
  { tag: 'left4', val: 67, cells: leftLane(4) },
  { tag: 'left5', val: 898, cells: leftLane(5) },
  { tag: 'left6', val: 76, cells: leftLane(6) },
  { tag: 'left7', val: 54, cells: leftLane(7) },
  { tag: 'left8', val: 32, cells: leftLane(8) },
  { tag: 'left9', val: 1, cells: leftLane(9) },
  { tag: 'right1', val: 1, cells: rightLane(1) },
  { tag: 'right2', val: 2, cells: rightLane(2) },
  { tag: 'right3', val: 3, cells: rightLane(3) },
  { tag: 'right4', val: 4, cells: rightLane(4) },
  { tag: 'right5', val: 5, cells: rightLane(5) },
  { tag: 'right6', val: 6, cells: rightLane(6) },
  { tag: 'right7', val: 7, cells: rightLane(7) },
  { tag: 'right8', val: 8, cells: rightLane(8) },
  { tag: 'right9', val: 9, cells: rightLane(9) },
  { tag: 'bottom1', val: 123, cells: bottomLane(1) },
  { tag: 'bottom2', val: 456, cells: bottomLane(2) },
  { tag: 'bottom3', val: 789, cells: bottomLane(3) },
  { tag: 'bottom4', val: 42, cells: bottomLane(4) },
  { tag: 'bottom5', val: 707, cells: bottomLane(5) },
  { tag: 'bottom6', val: 42, cells: bottomLane(6) },
  { tag: 'bottom7', val: 987, cells: bottomLane(7) },
  { tag: 'bottom8', val: 654, cells: bottomLane(8) },
  { tag: 'bottom9', val: 321, cells: bottomLane(9) },
];

const outsideConstraints = [];
for (const lane of laneClues) {
  // X-sum max achievable value is 45 (X=9 sums the whole distinct 1-9 lane).
  if (lane.val <= 45) {
    outsideConstraints.push(
      new NFA(notXSumSpec(lane.val), `xsum-not-${lane.tag}-${lane.val}`, ...lane.cells));
  }
  // Skyscraper count is always between 1 and 9.
  if (lane.val <= 9) {
    outsideConstraints.push(
      new NFA(notSkyscraperSpec(lane.val), `sky-not-${lane.tag}-${lane.val}`, ...lane.cells));
  }
}

// ---------- thermometers ----------
// Bulb-first cell order (bulb matched 1:1 to the grey circle underlays).
const thermoDefs = [
  ['R3C1', 'R2C1'],
  ['R3C4', 'R2C4'],
  ['R1C6', 'R2C6', 'R2C7'],
  ['R1C8', 'R2C9'],
  ['R3C9', 'R4C9'],
  ['R5C6', 'R4C5'],
  ['R4C3', 'R3C3'],
  ['R7C2', 'R8C3', 'R9C4', 'R9C5', 'R8C6', 'R7C7'],
  ['R7C4', 'R6C3'],
  ['R7C5', 'R6C6'],
];
// NOT(strictly increasing along the whole thermo) == at least one step
// fails to increase.
const thermoConstraints = thermoDefs.map((cells, i) => {
  const edges = [];
  for (let k = 0; k < cells.length - 1; k++) {
    edges.push(new Pair(notIncreasingKey, `thermo${i}-edge${k}`, cells[k], cells[k + 1]));
  }
  return new Or(edges);
});

// ---------- dots / X / V ----------

const whiteDotEdges = [
  ['R1C2', 'R1C3'], ['R1C4', 'R1C5'], ['R2C5', 'R2C6'], ['R3C5', 'R3C6'],
  ['R1C8', 'R2C8'], ['R2C9', 'R3C9'], ['R2C2', 'R3C2'], ['R3C1', 'R4C1'],
  ['R5C1', 'R6C1'], ['R5C2', 'R6C2'], ['R8C3', 'R9C3'], ['R6C6', 'R7C6'],
  ['R8C8', 'R8C9'], ['R7C9', 'R8C9'], ['R6C8', 'R6C9'], ['R5C7', 'R6C7'],
  ['R5C8', 'R5C9'], ['R4C6', 'R4C7'], ['R3C5', 'R4C5'], ['R3C8', 'R4C8'],
];
const blackDotEdges = [
  ['R1C1', 'R1C2'], ['R3C7', 'R3C8'], ['R3C6', 'R4C6'], ['R3C4', 'R4C4'],
  ['R4C2', 'R5C2'], ['R8C2', 'R9C2'], ['R7C6', 'R8C6'], ['R8C7', 'R9C7'],
  ['R7C8', 'R8C8'], ['R5C8', 'R6C8'], ['R5C6', 'R5C7'], ['R5C3', 'R5C4'],
];
const vEdges = [
  ['R1C2', 'R2C2'], ['R4C1', 'R5C1'], ['R7C1', 'R8C1'], ['R2C6', 'R3C6'],
  ['R1C9', 'R2C9'], ['R8C9', 'R9C9'], ['R7C6', 'R7C7'], ['R6C4', 'R6C5'],
  ['R3C6', 'R3C7'], ['R9C2', 'R9C3'],
];
const xEdges = [
  ['R2C4', 'R2C5'], ['R2C1', 'R2C2'], ['R1C7', 'R2C7'], ['R4C7', 'R4C8'],
  ['R5C9', 'R6C9'], ['R8C8', 'R9C8'], ['R8C2', 'R8C3'], ['R5C2', 'R5C3'],
  ['R2C5', 'R3C5'],
];

const whiteDotConstraints = whiteDotEdges.map((e, i) =>
  new Pair(notConsecutiveKey, `wdot${i}`, ...e));
const blackDotConstraints = blackDotEdges.map((e, i) =>
  new Pair(notRatio2Key, `bdot${i}`, ...e));
const vConstraints = vEdges.map((e, i) =>
  new Pair(notSum5Key, `vneg${i}`, ...e));
const xConstraints = xEdges.map((e, i) =>
  new Pair(notSum10Key, `xneg${i}`, ...e));

// ---------- circles ----------
// "All digits in a circle appear in the 4 cells touching it", negated: at
// least one listed digit is absent from all 4 cells. Branch per candidate
// missing digit; within a branch every cell is restricted to the other 8
// values.
const circleDefs = [
  { cells: ['R1C4', 'R1C5', 'R2C4', 'R2C5'], digits: [1, 3, 8] },
  { cells: ['R1C7', 'R1C8', 'R2C7', 'R2C8'], digits: [8, 9] },
  { cells: ['R2C2', 'R2C3', 'R3C2', 'R3C3'], digits: [1, 9] },
  { cells: ['R3C1', 'R3C2', 'R4C1', 'R4C2'], digits: [3, 5] },
  { cells: ['R5C2', 'R5C3', 'R6C2', 'R6C3'], digits: [5, 7, 8] },
  { cells: ['R7C4', 'R7C5', 'R8C4', 'R8C5'], digits: [6, 8] },
  { cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'], digits: [4, 6, 9] },
  { cells: ['R5C7', 'R5C8', 'R6C7', 'R6C8'], digits: [2, 4] },
  { cells: ['R4C8', 'R4C9', 'R5C8', 'R5C9'], digits: [3, 6, 9] },
];
const allDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const circleConstraints = circleDefs.map((c) => {
  const branches = c.digits.map((d) => {
    const rest = allDigits.filter((v) => v !== d);
    return new And(c.cells.map((cell) => new Given(cell, ...rest)));
  });
  return new Or(branches);
});

// ---------- maximum cells ----------
const maxDefs = [
  { cell: 'R2C3', neighbours: ['R1C3', 'R3C3', 'R2C2', 'R2C4'] },
  { cell: 'R5C5', neighbours: ['R4C5', 'R6C5', 'R5C4', 'R5C6'] },
];
const maxConstraints = maxDefs.map((m, i) =>
  new Or(m.neighbours.map((n, j) => new Pair(geKey, `max${i}-nb${j}`, m.cell, n))));

return [
  grid,
  ...cageConstraints,
  ...outsideConstraints,
  ...thermoConstraints,
  ...whiteDotConstraints,
  ...blackDotConstraints,
  ...vConstraints,
  ...xConstraints,
  ...circleConstraints,
  ...maxConstraints,
];
