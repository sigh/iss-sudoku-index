// Title: Skycagers
// Author: Agent
// Video: https://www.youtube.com/watch?v=B4bO_FBepqs
// Source: https://app.crackingthecryptic.com/sudoku/nh43mpHn8M

// Rules encoded here, in full:
//   * Normal sudoku rules apply.
//   * Divide the grid into cages: non-overlapping, orthogonally connected
//     areas of one or more cells with no repeating digits. Some cells may lie
//     outside every cage.
//   * A clue in the top-left corner of a cell is the sum of the digits in the
//     cage containing that cell. A cage with no clue has a sum the solver
//     determines.
//   * No two cages share the same sum.
//   * Each cage is a building whose height is its sum. A clue outside the grid
//     counts the buildings seen from that side; taller buildings block smaller
//     ones. Cells outside cages cannot be seen.
// Nothing is omitted.
//
// How the unknown cages are carried. Every cell holds the sum of the cage it
// is in, 0 when it is in no cage: VT is the tens digit and VO the ones digit
// of that height. Because no two cages share a sum, the height names the
// cage, so the cages are exactly the sets of cells sharing a non-zero height.
// Each such set is made one connected region by a depth layer VD: 0 on a cell
// outside every cage, 1 on a cage's first cell in reading order (its root),
// and otherwise one more than the cell's distance to the root through the
// cage, so that every cage cell walks down to its root. A cage has no repeated
// digits, so it has at most 9 cells and depths stay within 1..9. The Shape is
// widened to 0-9 to give the layers their 0; the playable grid cells are
// restricted back to 1-9.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const MAX_HEIGHT = DIGITS.reduce((a, b) => a + b);   // 45: a cage repeats no digit
const TENS = [0, 1, 2, 3, 4];                        // tens digits of 0..45
const tensOf = height => Math.floor(height / 10);
const onesOf = height => height % 10;
const OUTSIDE = 0;                                   // height and depth of an uncaged cell
const ROOT = 1;                                      // depth of a cage's first cell

// The ten corner clues, transcribed from the one-cell clue boxes drawn in the
// grid: each names the sum of the cage containing that cell.
const CLUES = [
  { cell: 'R1C5', total: 25 },
  { cell: 'R2C7', total: 32 },
  { cell: 'R4C3', total: 11 },
  { cell: 'R4C9', total: 19 },
  { cell: 'R5C1', total: 22 },
  { cell: 'R5C8', total: 21 },
  { cell: 'R7C6', total: 12 },
  { cell: 'R8C3', total: 45 },
  { cell: 'R9C2', total: 10 },
  { cell: 'R9C7', total: 27 },
];

// The eleven outside clues, transcribed from the numbers drawn outside the
// grid, each with its row or column listed from the clue's side inwards.
const fromEnd = line => [...line].reverse();
const SKYSCRAPERS = [
  { count: 1, line: graph.column(3) },            // above C3
  { count: 4, line: graph.row(3) },               // left of R3
  { count: 4, line: graph.row(5) },               // left of R5
  { count: 3, line: graph.row(9) },               // left of R9
  { count: 3, line: fromEnd(graph.row(3)) },      // right of R3
  { count: 3, line: fromEnd(graph.row(4)) },      // right of R4
  { count: 2, line: fromEnd(graph.row(8)) },      // right of R8
  { count: 3, line: fromEnd(graph.row(9)) },      // right of R9
  { count: 4, line: fromEnd(graph.column(2)) },   // below C2
  { count: 3, line: fromEnd(graph.column(4)) },   // below C4
  { count: 2, line: fromEnd(graph.column(7)) },   // below C7
];

const tens = graph.makeOverlay('VT');
const ones = graph.makeOverlay('VO');
const depth = graph.makeOverlay('VD');

// --- Local shape of the cages --------------------------------------------------
// One machine per cell, over the tens digits of the cell and then of each of
// its orthogonal neighbours, then the ones digits in the same order, then the
// depths. `same` is a bitmask over the neighbours: after the tens pass it
// marks the neighbours whose tens digit matches the cell's, and after the ones
// pass those whose whole height matches, i.e. the neighbours in the same cage.
// The depth pass then reads the cell's depth `own` and checks it against the
// same-cage neighbours: a cell outside every cage has depth OUTSIDE; a cage
// cell has depth >= ROOT and, unless it is the root, some same-cage neighbour
// exactly one shallower and none shallower than that, so the depth is the
// distance to the root and every cage cell reaches it. The ones pass also
// rejects a height above MAX_HEIGHT.
const localMachine = numNeighbours => NFA.encodeSpec({
  startState: { phase: 'tens', i: 0 },
  transition: (state, value) => {
    const bit = 1 << (state.i - 1);
    const last = state.i === numNeighbours;
    switch (state.phase) {
      case 'tens':
        if (state.i === 0) return { phase: 'tens', i: 1, own: value, same: 0 };
        return {
          phase: last ? 'ones' : 'tens',
          i: last ? 0 : state.i + 1,
          own: last ? undefined : state.own,
          tens: last ? state.own : undefined,
          same: value === state.own ? state.same | bit : state.same,
        };
      case 'ones':
        if (state.i === 0) {
          const height = 10 * state.tens + value;
          if (height > MAX_HEIGHT) return undefined;
          const outside = height === OUTSIDE;
          // An outside cell has no same-cage neighbours to compare against.
          return { phase: 'ones', i: 1, own: value, same: outside ? 0 : state.same, outside };
        }
        return {
          phase: last ? 'depth' : 'ones',
          i: last ? 0 : state.i + 1,
          own: last ? undefined : state.own,
          same: value === state.own ? state.same : state.same & ~bit,
          outside: state.outside,
        };
      case 'depth':
        if (state.i === 0) {
          // An outside cell's neighbours' depths are read but not compared.
          if (state.outside) return value === OUTSIDE ? { phase: 'skip', i: 1 } : undefined;
          if (value === OUTSIDE) return undefined;
          return { phase: 'depth', i: 1, own: value, same: state.same, found: value === ROOT };
        }
        if (state.same & bit) {
          if (value < state.own - 1) return undefined;
          if (value === state.own - 1) state = { ...state, found: true };
        }
        if (last) return { phase: 'done', ok: state.found };
        return { ...state, i: state.i + 1 };
      case 'skip':
        return last ? { phase: 'done', ok: true } : { phase: 'skip', i: state.i + 1 };
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done' && state.ok,
}, shape);
const localMachines = new Map();
const localMachineFor = numNeighbours => {
  if (!localMachines.has(numNeighbours)) localMachines.set(numNeighbours, localMachine(numNeighbours));
  return localMachines.get(numNeighbours);
};
const locals = gridCells.map(cell => {
  const around = [cell, ...graph.neighbours(cell)];
  return new NFA(localMachineFor(around.length - 1), 'cage shape',
    ...tens.at(around), ...ones.at(around), ...depth.at(around));
});

// --- One root per cage --------------------------------------------------------
// One machine per possible height, over every cell's tens, ones and depth in
// reading order. Of the cells at that height, the first has depth ROOT and no
// later one does. A height no cage uses has no such cell and is accepted.
const rootMachine = height => NFA.encodeSpec({
  startState: { phase: 'tens', seen: false },
  transition: (state, value) => {
    switch (state.phase) {
      case 'tens':
        return { phase: 'ones', seen: state.seen, match: value === tensOf(height) };
      case 'ones':
        return { phase: 'depth', seen: state.seen, match: state.match && value === onesOf(height) };
      case 'depth':
        if (!state.match) return { phase: 'tens', seen: state.seen };
        if ((value === ROOT) !== !state.seen) return undefined;
        return { phase: 'tens', seen: true };
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'tens',
}, shape);
const HEIGHTS = Array.from({ length: MAX_HEIGHT }, (_, i) => i + 1);
const scanCells = layer => gridCells.flatMap(cell => [tens.at(cell), ones.at(cell), layer(cell)]);
const roots = HEIGHTS.map(height =>
  new NFA(rootMachine(height), 'cage root', ...scanCells(cell => depth.at(cell))));

// --- Digits of each cage ------------------------------------------------------
// One machine per possible height, over every cell's tens, ones and digit in
// reading order, collecting the digits of the cells at that height as a
// bitmask: a digit met twice is rejected, and at the end the collected digits
// sum to the height, or there is no cell at that height. Distinct digits let
// the set stand in for the running sum.
const maskSum = mask => DIGITS.reduce((sum, d) => sum + (mask & (1 << d) ? d : 0), 0);
const cageMachine = height => NFA.encodeSpec({
  startState: { phase: 'tens', mask: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 'tens':
        return { phase: 'ones', mask: state.mask, match: value === tensOf(height) };
      case 'ones':
        return { phase: 'digit', mask: state.mask, match: state.match && value === onesOf(height) };
      case 'digit': {
        if (!state.match) return { phase: 'tens', mask: state.mask };
        // 0 is a layer value only; grid cells hold 1-9.
        if (value === 0 || state.mask & (1 << value)) return undefined;
        const mask = state.mask | (1 << value);
        return maskSum(mask) > height ? undefined : { phase: 'tens', mask };
      }
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'tens' && (state.mask === 0 || maskSum(state.mask) === height),
}, shape);
const cageDigits = HEIGHTS.map(height =>
  new NFA(cageMachine(height), 'cage digits', ...scanCells(cell => cell)));

// --- Skyscraper clues ---------------------------------------------------------
// One machine per outside clue, over the tens and ones of each cell of its
// line from the clue's side inwards. `tallest` is the tallest building met so
// far, 0 before any; a cell is a newly seen building when its height exceeds
// it. An outside cell has height 0 and so is never seen, and a cage met again
// further along the line is never taller than itself. `seen` is bounded by the
// clue: one building too many is a dead branch.
const skyscraperMachine = count => NFA.encodeSpec({
  startState: { phase: 'tens', tallest: 0, seen: 0 },
  transition: (state, value) => {
    if (state.phase === 'tens') {
      // The tens layer holds 0-4; other symbols never occur.
      return value <= tensOf(MAX_HEIGHT) ? { ...state, phase: 'ones', tens: value } : undefined;
    }
    const height = 10 * state.tens + value;
    if (height <= state.tallest) return { phase: 'tens', tallest: state.tallest, seen: state.seen };
    if (state.seen === count) return undefined;
    return { phase: 'tens', tallest: height, seen: state.seen + 1 };
  },
  accept: state => state.phase === 'tens' && state.seen === count,
}, shape);
const skyscrapers = SKYSCRAPERS.map(({ count, line }) =>
  new NFA(skyscraperMachine(count), 'skyscraper',
    ...line.flatMap(cell => [tens.at(cell), ones.at(cell)])));

return [
  shape,
  tens.toVar('cage height tens'),
  ones.toVar('cage height ones'),
  depth.toVar('depth in cage'),
  // The widened alphabet is for the layers; grid digits stay 1-9, and a
  // height is at most 45.
  graph.makeReplicate(new Given(gridCells[0], ...DIGITS)),
  tens.makeReplicate(new Given(tens.cells()[0], ...TENS)),
  // Each clue cell's cage has the clued sum.
  ...CLUES.flatMap(({ cell, total }) => [
    new Given(tens.at(cell), tensOf(total)),
    new Given(ones.at(cell), onesOf(total)),
  ]),
  ...locals,
  ...roots,
  ...cageDigits,
  ...skyscrapers,
];
