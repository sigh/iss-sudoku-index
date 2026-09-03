// Title: 30 Zombies In 20 Minutes
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=WA6HLN6QemY
// Source: https://app.crackingthecryptic.com/sudoku/nFHGGRm34m

// Rules encoded here (nothing is omitted).
//
// Riddle. Four friends must cross a rickety bridge in the dark with a single
// flashlight. At most two may be on the bridge at a time, and after every
// crossing someone must carry the flashlight back until everyone is over.
// Shaun takes 1 minute to cross, Liz 3, Ed 7, Dianne 9. The zombies reach the
// bridge after 20 minutes and everyone must be across before then.
//
// Sudoku. Normal sudoku rules apply. Digits along an arrow sum to the digit in
// that arrow's circle. Digits on each indicated diagonal sum to the number
// printed at the tail of the small arrow that marks it: 30 for the diagonal
// entering the grid at R1C4 and running down-right, 20 for the diagonal
// entering at R1C6 and running down-left.
//
// Rows 1, 3, 5, 7 and 9 are bridge crossings 1 to 5, in order. In such a row
// the arrow (its circle plus its two shaft cells) is the bridge, the cells to
// the left of the arrow are the left bank and the cells to its right are the
// right bank; the two no-total cages drawn in each of those rows outline
// exactly those two banks and so carry no arithmetic of their own. Each friend
// is represented by the digit equal to their crossing time, so the 1, 3, 7 and
// 9 of a crossing row say whether that friend is then on the left bank, on the
// bridge or on the right bank. The friends start on the left bank and are all
// across after crossing 5.
//
// The sandwich clue to the right of a crossing row -- the sum of the digits
// between the 1 and the 9 of that row -- is the total elapsed time after that
// crossing. All five clues are drawn as dashes, so their values are part of
// the solve rather than given.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Crossing times of Shaun, Liz, Ed and Dianne. The time is also the digit that
// represents that friend, and the order fixes which VZ column is whose.
const PEOPLE = [1, 3, 7, 9];
// "The zombies will get to the bridge in 20 minutes."
const DEADLINE = 20;
// Values held by the VZ cells.
const LEFT = 1, BRIDGE = 2, RIGHT = 3;

// The five drawn arrows: [row, circle column, shaft columns in drawn order].
// The shaft runs right of the circle in rows 1, 5 and 9 and left of it in rows
// 3 and 7, which is the alternating direction of travel.
const ARROWS = [
  [1, 6, [7, 8]],
  [3, 7, [6, 5]],
  [5, 4, [5, 6]],
  [7, 5, [4, 3]],
  [9, 2, [3, 4]],
];

const colRange = (row, lo, hi) => {
  const cells = [];
  for (let col = lo; col <= hi; col++) cells.push(makeCellId(row, col));
  return cells;
};

// Each crossing row splits into left bank / bridge / right bank at the drawn
// arrow. The derived bank cells reproduce the two cages drawn in that row.
const crossings = ARROWS.map(([row, circle, shaft]) => {
  const bridgeCols = [circle, ...shaft].sort((a, b) => a - b);
  const first = bridgeCols[0], last = bridgeCols[bridgeCols.length - 1];
  return {
    row,
    rightward: shaft[0] > circle,
    arrow: [makeCellId(row, circle), ...shaft.map(c => makeCellId(row, c))],
    left: colRange(row, 1, first - 1),
    bridge: colRange(row, first, last),
    right: colRange(row, last + 1, 9),
  };
});

// VZ(k, i): where PEOPLE[i - 1] stands during crossing k (LEFT/BRIDGE/RIGHT).
const zones = new Var('Z', 'zone', '5x4');
// VT(k): the minutes crossing k costs.
const times = new Var('T', 'crossing time', 5);
const zoneCell = (k, i) => zones.cell(k, i + 1);

// A friend is on the left bank, on the bridge or on the right bank; during
// crossing 1 nobody has reached the right bank yet, and by crossing 5 -- the
// last one -- nobody may still be on the left bank.
const zoneDomains = crossings.flatMap((crossing, k) => PEOPLE.map((_, i) => {
  const values = [LEFT, BRIDGE, RIGHT].filter(
    z => !(k === 0 && z === RIGHT) && !(k === 4 && z === LEFT));
  return new Given(zoneCell(k + 1, i), ...values);
}));

// A crossing costs the slower walker's time, so it is always one of the four
// friends' times.
const timeDomains = crossings.map(
  (_, k) => new Given(times.cell(k + 1), ...PEOPLE));

// Reads one crossing row as left-bank cells, bridge cells, right-bank cells and
// finally that friend's VZ cell: it locates the friend's digit in the row and
// requires the VZ cell to name the segment it was found in (1, 2 or 3 for the
// first, second and third segment).
const locateSpec = person => NFA.encodeSpec({
  startState: { seg: 0, found: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return { seg: state.seg + 1, found: state.found };
    if (state.seg < 3) {
      if (value !== person) return state;
      return state.found ? undefined : { seg: state.seg, found: state.seg + 1 };
    }
    if (state.seg > 3) return undefined;
    return value === state.found ? { seg: 4, found: state.found } : undefined;
  },
  accept: state => state.seg === 4,
  maxDepth: 13,  // 9 row cells + 1 VZ cell + 3 segment breaks
}, shape, { multiSegment: true });

const locators = crossings.flatMap((crossing, k) => PEOPLE.map(
  (person, i) => new NFA(
    locateSpec(person), `friend ${person} in crossing ${k + 1}`,
    crossing.left, crossing.bridge, crossing.right, [zoneCell(k + 1, i)])));

// Reads the four VZ cells of one crossing and then its VT cell: counts the
// friends standing on the bridge (at least one to carry the flashlight, at most
// two on the bridge at a time) and requires VT to be the largest of their
// times, because a pair walks together under the one flashlight.
const crossingSpec = NFA.encodeSpec({
  startState: { i: 0, count: 0, slowest: 0 },
  transition: (state, value) => {
    if (state.i < PEOPLE.length) {
      const next = { i: state.i + 1, count: state.count, slowest: state.slowest };
      if (value !== BRIDGE) return next;
      if (state.count === 2) return undefined;
      next.count++;
      next.slowest = Math.max(state.slowest, PEOPLE[state.i]);
      return next;
    }
    if (state.i > PEOPLE.length || state.count === 0) return undefined;
    return value === state.slowest
      ? { i: state.i + 1, count: state.count, slowest: state.slowest } : undefined;
  },
  accept: state => state.i === PEOPLE.length + 1,
  maxDepth: PEOPLE.length + 1,
}, shape);

const crossingTimes = crossings.map((_, k) => new NFA(
  crossingSpec, `crossing ${k + 1} time`,
  ...PEOPLE.map((_p, i) => zoneCell(k + 1, i)), times.cell(k + 1)));

// Reads one crossing row and then VT1..VTk: phases 0/1/2 accumulate the
// sandwich sum between the row's 1 and its 9 (in whichever order they appear),
// and phase 3 subtracts the crossing times one by one, so the row's sandwich
// clue equals the elapsed time after crossing k. Running sums above 9k can
// never be matched by k times of at most 9 and are dropped.
const totalSpec = k => NFA.encodeSpec({
  startState: { phase: 0, sum: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return state.phase === 2 ? { phase: 3, sum: state.sum } : undefined;
    }
    switch (state.phase) {
      case 0:
        return (value === 1 || value === 9) ? { phase: 1, sum: 0 } : state;
      case 1:
        if (value === 1 || value === 9) return { phase: 2, sum: state.sum };
        return state.sum + value > 9 * k
          ? undefined : { phase: 1, sum: state.sum + value };
      case 2:
        return state;
      default:
        return state.sum < value ? undefined : { phase: 3, sum: state.sum - value };
    }
  },
  accept: state => state.phase === 3 && state.sum === 0,
  maxDepth: 9 + k + 1,  // 9 row cells + k VT cells + 1 segment break
}, shape, { multiSegment: true });

const elapsed = crossings.map((crossing, k) => new NFA(
  totalSpec(k + 1), `total time after crossing ${k + 1}`,
  graph.row(crossing.row), times.cells().slice(0, k + 1)));

// Consumes VT1..VT5 and rejects as soon as the running total passes 20.
const deadlineSpec = NFA.encodeSpec({
  startState: 0,
  transition: (total, value) => total + value > DEADLINE ? undefined : total + value,
  accept: () => true,
  maxDepth: 5,
}, shape);

const deadline = new NFA(deadlineSpec, 'beat the zombies', ...times.cells());

// After a rightward crossing the friends left behind are still on the left
// bank, and the rest are on the right bank -- so during the next (leftward)
// crossing they are on the left bank exactly when they were before. After a
// leftward crossing the mirror holds for the right bank.
const staysLeft = Pair.fnToKey((a, b) => (a === LEFT) === (b === LEFT), shape);
const staysRight = Pair.fnToKey((a, b) => (a === RIGHT) === (b === RIGHT), shape);

const handovers = crossings.slice(0, -1).flatMap((crossing, k) => PEOPLE.map(
  (_person, i) => new Pair(
    crossing.rightward ? staysLeft : staysRight,
    `crossing ${k + 1} to ${k + 2}`,
    zoneCell(k + 1, i), zoneCell(k + 2, i))));

const arrowSums = crossings.map(crossing => new Arrow(...crossing.arrow));

const diagonals = [
  [30, graph.ray('R1C4', 1, 1)],
  [20, graph.ray('R1C6', 1, -1)],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, graph.gridGeometry()));

return [
  shape,
  zones,
  times,
  ...arrowSums,
  ...diagonals,
  ...zoneDomains,
  ...timeDomains,
  ...locators,
  ...crossingTimes,
  ...elapsed,
  deadline,
  ...handovers,
];
