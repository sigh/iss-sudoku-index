// Title: Killer Octopus
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=Ov2gzOS31d8
// Source: https://sudokupad.app/d7siz7tehr

// Rules encoded here, in full:
//  - Normal sudoku.
//  - Digits in a cage sum to the given total (four drawn cages).
//  - Octopus rules: four undrawn lines that (i) do not cross or overlap
//    anywhere except R5C5, where all four intersect; (ii) each have 180-degree
//    rotational symmetry about R5C5; (iii) each visit exactly two cells on the
//    edge of the grid, which are its two endpoints; (iv) are all the same
//    length in cells.
//  - The four lines are Same Difference lines: every pair of adjacent digits
//    along one line differs by the same amount, which may differ between lines.
// Nothing is omitted.
//
// Geometry the rules force, used below (see the description for the argument):
//  - Line steps are king moves. All four lines meet at R5C5 and are disjoint
//    elsewhere, so eight distinct cells adjacent to R5C5 lie on the lines;
//    R5C5 has exactly eight king neighbours and only four orthogonal ones.
//  - A line is R5C5 plus two "arms" that are 180-degree rotations of each
//    other, so the octopus is eight arms leaving R5C5, one through each of its
//    eight neighbours, meeting only at R5C5. All eight arms have the same
//    number of cells m; a line is 2m + 1 cells long. m is at least 4 (R5C5 is
//    four king moves from the border) and at most 7 (the 8 arms use 8(m - 1)
//    distinct cells strictly inside the border, plus R5C5, out of 49).

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const CENTRE = 'R5C5';

// Direction codes 1..8 over the eight king moves, ordered so that code d and
// code 9 - d are opposite; 9 is the shared "not on the octopus" code.
const OFF = 9;
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const DIR_CODES = DIRS.map((_, i) => i + 1);
// The differences a Same Difference line can carry: every value except OFF.
const DIFFERENCES = DIRS.map((_, i) => i + 1);
const opposite = d => (d === OFF ? OFF : 9 - d);
const stepDir = (cell, d) => graph.step(cell, DIRS[d - 1][0], DIRS[d - 1][1]);
// The in-grid king directions out of a cell, in code order.
const dirsAt = cell => DIR_CODES.filter(d => stepDir(cell, d) !== null);
const rotate = cell => {
  const { row, col } = parseCellId(cell);
  return makeCellId(geometry.numRows + 1 - row, geometry.numCols + 1 - col);
};
const onBorder = cell => {
  const { row, col } = parseCellId(cell);
  return row === 1 || col === 1 || row === geometry.numRows || col === geometry.numCols;
};

// Four overlays describe the octopus. Every octopus cell except R5C5 has a
// unique predecessor: its neighbour one step nearer R5C5 along its own arm.
//   VP  the direction code pointing at that predecessor, or OFF.
//   VK  1 at R5C5, k + 1 for a cell k steps along its arm, or OFF. Bounded
//       above by 8 because m <= 7.
//   VD  the difference of the line the cell lies on (1..8), or OFF.
//   VE  the predecessor's digit; pinned to 1 for a cell off the octopus so it
//       carries no free state.
const pred = graph.makeOverlay('VP');
const dist = graph.makeOverlay('VK');
const diff = graph.makeOverlay('VD');
const pdig = graph.makeOverlay('VE');
// VM is m + 1: the VK value every arm's final (border) cell holds, so its
// domain is 5..8 for the 4..7 range of m derived above.
const armEnd = new Var('M', 'armEnd', 1);
const ARM_END = armEnd.cell();

const gridCells = graph.cells();
const centreNeighbours = dirsAt(CENTRE).map(d => stepDir(CENTRE, d));
const inBox5 = new Set([CENTRE, ...centreNeighbours]);
const memo = fn => { const m = new Map(); return k => (m.has(k) ? m : m.set(k, fn(k))).get(k); };
const byDirs = fn => { const m = memo(key => fn(key.split(',').map(Number))); return dirs => m(dirs.join(',')); };

// --- R5C5 and its eight neighbours are fully determined by the rules: all
// eight neighbours are the first cell of an arm, so each points back at R5C5
// and sits one step along its arm. R5C5 itself has no predecessor, and no
// single difference (four lines cross there).
const centrePins = [
  new Given(pred.at(CENTRE), OFF),
  new Given(dist.at(CENTRE), 1),
  new Given(diff.at(CENTRE), OFF),
  new Given(pdig.at(CENTRE), 1),
  ...dirsAt(CENTRE).flatMap(d => [
    new Given(pred.at(stepDir(CENTRE, d)), opposite(d)),
    new Given(dist.at(stepDir(CENTRE, d)), 2),
    new Given(diff.at(stepDir(CENTRE, d)), ...DIFFERENCES),  // on a line, so not OFF
  ]),
  new Given(ARM_END, 5, 6, 7, 8),
];

// --- A predecessor is an in-grid neighbour, so a border cell cannot point off
// the grid.
const predDomains = gridCells
  .filter(cell => !inBox5.has(cell))
  .map(cell => new Given(pred.at(cell), OFF, ...dirsAt(cell)));

// --- Rule (ii), 180-degree rotational symmetry about R5C5. Rotating an arm
// gives its partner arm, and rotating a step reverses its direction, so the
// rotation of every cell points the opposite way. This alone makes the octopus
// symmetric and pairs the arms into lines.
const symmetry = gridCells
  .filter(cell => !inBox5.has(cell) && cell < rotate(cell))
  .map(cell => new Pair(
    Pair.fnToKey((a, b) => b === opposite(a), geometry),
    'octopus-symmetry', pred.at(cell), pred.at(rotate(cell))));

// --- Same Difference is a property of the whole line, and a line's two arms
// meet at R5C5, so the two arms leaving R5C5 in opposite directions carry one
// difference between them.
const lineDifference = [1, 2, 3, 4].map(d => new SameValues(
  2, diff.at(stepDir(CENTRE, d)), diff.at(stepDir(CENTRE, opposite(d)))));

// Each per-cell machine below reads the cell's own overlay values and then one
// value per in-grid king neighbour, in direction-code order; the neighbour the
// cell's VP names is the one the rule constrains.

// --- The arm structure: VK counts steps from R5C5, so a cell on the octopus
// holds one more than its predecessor. VK strictly decreasing back along
// predecessors makes every arm a simple path rooted at R5C5 (no cycles), and
// pointing at an off-octopus cell is rejected. A cell is off the octopus in VK
// exactly when it is in VP.
const distStep = byDirs(dirs => NFA.encodeSpec({
  startState: { phase: 'pred' },
  transition: (state, value) => {
    if (state.phase === 'pred') {
      if (value !== OFF && !dirs.includes(value)) return undefined;
      return { phase: 'own', p: value };
    }
    if (state.phase === 'own') {
      if (state.p === OFF) {
        return value === OFF ? { phase: 'scan', p: OFF, k: OFF, i: 0 } : undefined;
      }
      // 1 is R5C5's own value and OFF is 9, so an arm cell holds 2..8.
      if (value < 2 || value > 8) return undefined;
      return { phase: 'scan', p: state.p, k: value, i: 0 };
    }
    const d = dirs[state.i];
    if (d === undefined) return undefined;
    if (d === state.p && value !== state.k - 1) return undefined;
    return { phase: 'scan', p: state.p, k: state.k, i: state.i + 1 };
  },
  accept: state => state.phase === 'scan' && state.i === dirs.length,
}, geometry));

// --- Rule (iii): each arm runs from R5C5 to a border cell and stops there. A
// cell on the octopus that is not on the border is the predecessor of exactly
// one neighbour; a border cell and an off-octopus cell of none. Reading the
// cell's own VP first tells the machine whether the cell is on the octopus;
// whether it is on the border is fixed by the cell's position.
const successorCount = byDirs(dirs => target => NFA.encodeSpec({
  startState: { phase: 'pred' },
  transition: (state, value) => {
    if (state.phase === 'pred') {
      return { phase: 'scan', need: value === OFF ? 0 : target, count: 0, i: 0 };
    }
    const d = dirs[state.i];
    if (d === undefined) return undefined;
    // The neighbour d away has this cell as its predecessor when it points back.
    const count = state.count + (value === opposite(d) ? 1 : 0);
    if (count > state.need) return undefined;
    return { phase: 'scan', need: state.need, count, i: state.i + 1 };
  },
  accept: state => state.phase === 'scan' && state.i === dirs.length
    && state.count === state.need,
}, geometry));

// --- Same Difference along an arm: every cell inherits its line's difference
// from its predecessor. The eight cells around R5C5 are excluded because their
// predecessor is R5C5, whose VD is OFF; their difference comes from the digit
// rule below instead.
const diffStep = byDirs(dirs => NFA.encodeSpec({
  startState: { phase: 'pred' },
  transition: (state, value) => {
    if (state.phase === 'pred') {
      if (value !== OFF && !dirs.includes(value)) return undefined;
      return { phase: 'own', p: value };
    }
    if (state.phase === 'own') {
      if (state.p === OFF) {
        return value === OFF ? { phase: 'scan', p: OFF, v: OFF, i: 0 } : undefined;
      }
      if (value === OFF) return undefined;
      return { phase: 'scan', p: state.p, v: value, i: 0 };
    }
    const d = dirs[state.i];
    if (d === undefined) return undefined;
    if (d === state.p && value !== state.v) return undefined;
    return { phase: 'scan', p: state.p, v: state.v, i: state.i + 1 };
  },
  accept: state => state.phase === 'scan' && state.i === dirs.length,
}, geometry));

// --- VE copies the predecessor's digit into the cell, so that the difference
// rule below reads three values of one cell instead of reaching for a
// neighbour whose identity is itself a variable.
const predDigit = byDirs(dirs => NFA.encodeSpec({
  startState: { phase: 'pred' },
  transition: (state, value) => {
    if (state.phase === 'pred') {
      if (value !== OFF && !dirs.includes(value)) return undefined;
      return { phase: 'own', p: value };
    }
    if (state.phase === 'own') {
      if (state.p === OFF) {
        return value === 1 ? { phase: 'scan', p: OFF, e: 1, i: 0 } : undefined;
      }
      return { phase: 'scan', p: state.p, e: value, i: 0 };
    }
    const d = dirs[state.i];
    if (d === undefined) return undefined;
    if (d === state.p && value !== state.e) return undefined;
    return { phase: 'scan', p: state.p, e: state.e, i: state.i + 1 };
  },
  accept: state => state.phase === 'scan' && state.i === dirs.length,
}, geometry));

// --- Same Difference, the digit half: reading [digit, predecessor digit,
// difference], an octopus cell's digit differs from its predecessor's by its
// line's difference. Off the octopus VD is OFF and nothing is asserted.
const sameDifference = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'prev', digit: value };
    if (state.phase === 'prev') return { phase: 'diff', digit: state.digit, prev: value };
    if (value === OFF) return { done: true };
    return Math.abs(state.digit - state.prev) === value ? { done: true } : undefined;
  },
  accept: state => state.done === true,
}, geometry);

const perCell = gridCells
  .filter(cell => cell !== CENTRE)
  .flatMap(cell => {
    const dirs = dirsAt(cell);
    const neighbours = dirs.map(d => stepDir(cell, d));
    return [
      new NFA(distStep(dirs), 'arm-step',
        pred.at(cell), dist.at(cell), ...dist.at(neighbours)),
      new NFA(successorCount(dirs)(onBorder(cell) ? 0 : 1), 'arm-continues',
        pred.at(cell), ...pred.at(neighbours)),
      new NFA(predDigit(dirs), 'previous-digit',
        pred.at(cell), pdig.at(cell), ...neighbours),
      new NFA(sameDifference, 'same-difference', cell, pdig.at(cell), diff.at(cell)),
      ...(inBox5.has(cell) ? [] : [new NFA(diffStep(dirs), 'line-difference',
        pred.at(cell), diff.at(cell), ...diff.at(neighbours))]),
    ];
  });

// --- Rule (iv), all four lines the same length, with rule (iii)'s "exactly 2
// edge cells, which are the endpoints": every arm's border cell is at the same
// step count VM from R5C5, and every other octopus cell is nearer than that.
// So a border cell has no successor either: that successor's VK would have to
// exceed VM, which neither branch allows.
const sameLength = gridCells
  .filter(cell => !inBox5.has(cell))
  .map(cell => new Pair(
    onBorder(cell)
      ? Pair.fnToKey((a, b) => a === OFF || a === b, geometry)
      : Pair.fnToKey((a, b) => a === OFF || a < b, geometry),
    onBorder(cell) ? 'arm-ends-here' : 'inside-the-arm',
    dist.at(cell), ARM_END));

// --- Rule (i), "not cross": two diagonal steps on opposite diagonals of the
// same 2x2 block of cells cross between the cells without sharing one, so at
// most one of them may be used. Reading the block's four VP values in reading
// order: the main diagonal is used when the top-left points down-right (8) or
// the bottom-right points up-left (1), the anti-diagonal when the top-right
// points down-left (6) or the bottom-left points up-right (3).
const noCrossing = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, main: value === 8 };
    if (state.phase === 1) return { phase: 2, main: state.main, anti: value === 6 };
    if (state.phase === 2) {
      return { phase: 3, main: state.main, anti: state.anti || value === 3 };
    }
    return (state.main || value === 1) && state.anti ? undefined : { done: true };
  },
  accept: state => state.done === true,
}, geometry);

// The template is anchored on the top-left 2x2 block, which is where
// makeReplicate takes its origin.
const crossings = pred.makeReplicate(
  new NFA(noCrossing, 'no-crossing', ...pred.at(graph.block('R1C1', 2, 2))),
  pred.at(gridCells.filter(cell => graph.block(cell, 2, 2) !== null)));

// --- Killer cages, transcribed from the four drawn cages.
const cages = [
  new Cage(11, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(14, 'R6C3', 'R7C3'),
  new Cage(14, 'R6C7', 'R7C7'),
  new Cage(5, 'R8C8', 'R9C8'),
];

return [
  new Shape('9x9'),
  pred.toVar('pred'),
  dist.toVar('dist'),
  diff.toVar('diff'),
  pdig.toVar('prevDigit'),
  armEnd,
  ...cages,
  ...centrePins,
  ...predDomains,
  ...symmetry,
  ...lineDifference,
  ...perCell,
  ...sameLength,
  crossings,
];
