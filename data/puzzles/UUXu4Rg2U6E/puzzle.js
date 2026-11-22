// Title: The Little Robot's Crayon
// Author: Kainapple
// Video: https://www.youtube.com/watch?v=UUXu4Rg2U6E
// Source: https://sudokupad.app/05toqchwta

// Rules encoded:
// - Standard sudoku.
// - A robot loops forever: at a cell it reads the digit d, moves d cells in its
//   current direction, turns 90 degrees clockwise (E, S, W, N, E, ...), repeats.
//   The cell where it turns after a move is a "stop". A leg may not leave the grid
//   or cross an X.
// - The robot may re-enter a cell only if it never turns there: each stop occurs
//   once in the loop and no leg passes through a stop.
// - An X joins digits summing to 10. A white dot joins consecutive digits, but a
//   white dot the robot walks over (a leg crosses its edge) is a black dot instead
//   (one digit double the other). A black dot joins digits where one is double the other.
// - The robot is seen moving east across the border R8C6|R8C7, but the cell where
//   that leg began is not shown: some east leg of the loop crosses that border.
// No drawn black dots exist, and the rules claim no exhaustiveness for any mark, so
// unmarked pairs are left free.
//
// Auxiliary layers (Var overlays, one cell per grid cell):
//   VS  stop code: 1 = not a stop, 2..5 = stop whose next move is E, S, W, N.
//   VA, VB  position counters along the loop, residues mod 9 and mod 10 (coprime,
//       lcm 90 > 81 cells, so a second disjoint loop cannot be numbered). Value 1 =
//       not a stop, 2.. = residue + 2. The loop's seam is the stop whose east leg
//       crosses R8C6|R8C7: both counters read 2 there, and nowhere else.
// The grid shape is widened to 11 values for the counters; grid cells are
// restricted back to 1-9.

// Composite helpers: And/Or take one array of constraints.
const all = (...cs) => new And(cs);
const any = (...cs) => new Or(cs);

const OFF = 1;
const E = 0, S = 1, W = 2, N = 3;
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];       // [dRow, dCol] for E, S, W, N
const code = k => 2 + k;                                  // VS value for "next move is direction k"
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const shape = new Shape('9x9', 11);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const stop = graph.makeOverlay('VS');
const ctrA = graph.makeOverlay('VA');
const ctrB = graph.makeOverlay('VB');

// X edges: R4C9-R5C9, R9C6-R9C7, R2C8-R3C8, R5C6-R5C7, R7C9-R8C9, R7C1-R8C1 (X marks drawn on the board).
const xEdges = [['R4C9', 'R5C9'], ['R9C6', 'R9C7'], ['R2C8', 'R3C8'],
                ['R5C6', 'R5C7'], ['R7C9', 'R8C9'], ['R7C1', 'R8C1']];
// White dots: R6C8-R6C9, R3C7-R3C8, R3C8-R3C9, R2C4-R2C5, R7C4-R7C5, R3C3-R4C3, R5C1-R6C1, R8C5-R9C5 (circle marks drawn on the board).
const whiteDots = [['R6C8', 'R6C9'], ['R3C7', 'R3C8'], ['R3C8', 'R3C9'], ['R2C4', 'R2C5'],
                   ['R7C4', 'R7C5'], ['R3C3', 'R4C3'], ['R5C1', 'R6C1'], ['R8C5', 'R9C5']];
const edgeKey = (a, b) => [a, b].sort().join('|');
const xSet = new Set(xEdges.map(([a, b]) => edgeKey(a, b)));

// Cell reached by moving d steps from `cell` in direction k, or null off-grid.
const walk = (cell, k, d) => graph.step(cell, DIRS[k][0] * d, DIRS[k][1] * d);

// Whether a move of d cells from `cell` in direction k stays on the grid and crosses no X.
const legOk = (cell, k, d) => {
  for (let i = 0; i < d; i++) {
    const a = walk(cell, k, i), b = walk(cell, k, i + 1);
    if (!a || !b || xSet.has(edgeKey(a, b))) return false;
  }
  return true;
};

// --- Value ranges: grid cells 1-9, stop codes 1-5, counters 1-10 (mod 9) and 1-11 (mod 10).
const ranges = [
  graph.makeReplicate(new Given('R1C1', ...range(1, 9))),
  stop.makeReplicate(new Given(stop.at('R1C1'), ...range(1, 5))),
  ctrA.makeReplicate(new Given(ctrA.at('R1C1'), ...range(1, 10))),
  ctrB.makeReplicate(new Given(ctrB.at('R1C1'), ...range(1, 11))),
];

// --- A cell is a stop exactly when both counters are non-sentinel.
const stopFlag = Pair.fnToKey((s, c) => (s === OFF) === (c === 1), shape);
const flags = gridCells.flatMap(cell => [
  new Pair(stopFlag, 'stop-vs-counter-a', stop.at(cell), ctrA.at(cell)),
  new Pair(stopFlag, 'stop-vs-counter-b', stop.at(cell), ctrB.at(cell)),
]);

// Counter step along a leg: next residue, wrapping 10 -> 2 (mod 9) and 11 -> 2 (mod 10).
const stepA = Pair.fnToKey((a, b) => a >= 2 && b === (a === 10 ? 2 : a + 1), shape);
const stepB = Pair.fnToKey((a, b) => a >= 2 && b === (a === 11 ? 2 : a + 1), shape);
const atSeam = cell => all(new Given(ctrA.at(cell), 2), new Given(ctrB.at(cell), 2));

// --- Legs. A stop with next-move direction k and digit d sends the robot d cells on:
// the cells passed are not stops, the landing cell is a stop with direction k+1, and
// its counters follow the departing stop's (except at the seam, which restarts them).
// Only moves that stay on the grid and cross no X are branches; others are unavailable.
const legs = gridCells.flatMap(cell => [E, S, W, N].map(k => {
  const branches = range(1, 9).filter(d => legOk(cell, k, d)).map(d => {
    const target = walk(cell, k, d);
    const passed = range(1, d - 1).map(i => walk(cell, k, i));
    return all(
      new Given(cell, d),
      new Given(stop.at(target), code((k + 1) % 4)),
      ...passed.map(p => new Given(stop.at(p), OFF)),
      any(
        atSeam(target),
        all(
          new Pair(stepA, 'counter-a-step', ctrA.at(cell), ctrA.at(target)),
          new Pair(stepB, 'counter-b-step', ctrB.at(cell), ctrB.at(target)))));
  });
  const notThis = range(1, 5).filter(v => v !== code(k));
  return any(new Given(stop.at(cell), ...notThis), ...branches);
}));

// --- Every stop is entered by a leg: with the leg rule this makes the stops a permutation
// (each has exactly one predecessor), so the loop has no tail.
const entered = gridCells.flatMap(cell => [E, S, W, N].map(k => {
  const sources = range(1, 9).map(d => {
    const from = walk(cell, k, -d);
    return from && all(new Given(stop.at(from), code(k)), new Given(from, d));
  }).filter(Boolean);
  const notArrival = range(1, 5).filter(v => v !== code((k + 1) % 4));
  return any(new Given(stop.at(cell), ...notArrival), ...sources);
}));

// --- Seam: both counters read 2 only at a stop whose east leg crosses R8C6|R8C7
// (an east stop in R8C1..R8C6 whose digit reaches column 7), and some cell does.
const notSeam = Pair.fnToKey((a, b) => !(a === 2 && b === 2), shape);
const seamCandidates = range(1, 6).map(col => makeCellId(8, col));
const seamRules = [
  ...gridCells.filter(c => !seamCandidates.includes(c))
    .map(c => new Pair(notSeam, 'not-seam', ctrA.at(c), ctrB.at(c))),
  ...seamCandidates.map(c => any(
    new Pair(notSeam, 'not-seam', ctrA.at(c), ctrB.at(c)),
    all(new Given(stop.at(c), code(E)), new Given(c, ...range(7 - parseCellId(c).col, 9))))),
  any(...seamCandidates.map(atSeam)),
];

// --- Dots. A horizontal (vertical) dot is walked over by an east/west (south/north) leg
// that spans its edge. For a stop at cell s heading k, that is a digit of at least
// `need` (the number of steps to reach the far cell of the edge).
const dotRules = whiteDots.map(([a, b]) => {
  const { row: ra, col: ca } = parseCellId(a);
  const { row: rb, col: cb } = parseCellId(b);
  const horizontal = ra === rb;
  const spans = [];   // {cell, k, need}
  const dirsAcross = horizontal ? [E, W] : [S, N];
  for (const k of dirsAcross) {
    const [dr, dc] = DIRS[k];
    // The first cell the robot occupies is `near`, the one it steps onto is `far`.
    const [near, far] = (dr + dc > 0) ? [a, b] : [b, a];
    // Starting cells: near and every cell behind it on the same line.
    for (let back = 0; ; back++) {
      const from = walk(near, k, -back);
      if (!from) break;
      spans.push({ cell: from, k, need: back + 1 });
    }
  }
  const walked = all(new BlackDot(a, b), any(...spans.map(({ cell, k, need }) =>
    all(new Given(stop.at(cell), code(k)), new Given(cell, ...range(need, 9))))));
  const notWalked = all(new WhiteDot(a, b), ...spans.map(({ cell, k, need }) =>
    any(new Given(stop.at(cell), ...range(1, 5).filter(v => v !== code(k))),
           new Given(cell, ...range(1, need - 1)))));
  return any(walked, notWalked);
});

return [
  shape,
  stop.toVar('stop'),
  ctrA.toVar('counter-a'),
  ctrB.toVar('counter-b'),
  ...ranges,
  ...xEdges.map(([a, b]) => new X(a, b)),
  ...flags,
  ...legs,
  ...entered,
  ...seamRules,
  ...dotRules,
];
