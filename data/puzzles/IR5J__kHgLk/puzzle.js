// Title: Pathfinder
// Author: KNT
// Video: https://www.youtube.com/watch?v=IR5J__kHgLk
// Source: https://app.crackingthecryptic.com/sudoku/3RJ64FJmQD

// Rules encoded below, in order:
//  1. Divide the grid into regions of nine orthogonally connected cells. Each
//     row, column and region contains 1-9 once each.
//  2. The digit in the top-left cell of a region (its leftmost cell in its
//     highest row) is its region number. All region numbers are different.
//  3. An orthogonally connected path visits every region exactly once, in
//     ascending order of the region numbers.
//  4. Within each region, digits strictly increase along the path.
//  5. A digit in a cell with arrow(s) is the total number of cells in the same
//     region as that cell that are part of the path, in the indicated
//     directions combined; with several arrows, each clued direction holds at
//     least one such cell.
// The grid has no given digits. Nothing is omitted.

const graph = cellGraph('9x9');
const gridCells = graph.cells();          // row-major

// Overlays.
//   CC  region label per cell, owned by ChaosConstruction.
//   VM  region NUMBER of the cell's region (rule 2), one per grid cell.
//   VN  region number per region LABEL, one per label 1-9.
//   VS  the path successor of the cell: which neighbour follows it.
//   VP  the path predecessor of the cell: which neighbour precedes it.
// CC labels are assigned by the solver in its own canonical order, so they are
// not the region numbers; VN maps label -> number and VM spreads that number
// over the label's cells, which lets every path rule below stay local.
const cc = graph.makeOverlay('CC');
const vm = graph.makeOverlay('VM');
const vs = graph.makeOverlay('VS');
const vp = graph.makeOverlay('VP');
const vn = new Var('N', 'regionNumberByLabel', 9);

// Direction codes shared by VS and VP. Code 6 is the far end of the path:
// in VS it means "no successor" (the path ends here), in VP "no predecessor"
// (the path starts here). Code 1 means the cell is not on the path at all.
const OFF = 1, UP = 2, DOWN = 3, LEFT = 4, RIGHT = 5, TERM = 6;
const ORTHO = [
  { code: UP, dr: -1, dc: 0, opposite: DOWN },
  { code: DOWN, dr: 1, dc: 0, opposite: UP },
  { code: LEFT, dr: 0, dc: -1, opposite: RIGHT },
  { code: RIGHT, dr: 0, dc: 1, opposite: LEFT },
];

// Transcribed from the 20 drawn arrow stubs: the cell each stub lies in, and
// each stub's direction as [row step, column step]. Four of the twelve clued
// cells carry diagonal arrows.
const ARROWS = [
  { cell: 'R2C2', dirs: [[0, 1]] },
  { cell: 'R2C4', dirs: [[0, -1], [1, -1]] },
  { cell: 'R2C5', dirs: [[0, -1]] },
  { cell: 'R4C3', dirs: [[-1, -1], [-1, 1], [1, -1], [1, 1]] },
  { cell: 'R4C4', dirs: [[1, 0], [0, -1]] },
  { cell: 'R4C5', dirs: [[0, -1]] },
  { cell: 'R6C1', dirs: [[-1, 0], [0, 1]] },
  { cell: 'R6C6', dirs: [[1, 0]] },
  { cell: 'R7C3', dirs: [[1, -1]] },
  { cell: 'R7C7', dirs: [[-1, 1], [1, 1]] },
  { cell: 'R8C3', dirs: [[-1, 0], [0, -1]] },
  { cell: 'R9C1', dirs: [[0, 1]] },
];
const arrowRays = ARROWS.flatMap(
  ({ cell, dirs }) => dirs.map(
    ([dr, dc]) => ({ cell, ray: graph.ray(cell, dr, dc).slice(1) })));
const vd = new Var('D', 'arrowDirectionCounts', arrowRays.length);

// --- Rule 2: region numbers -------------------------------------------------
// One machine per region label L, reading VN[L] and then, for every grid cell
// in reading order, the triple (region label, region number, digit).
//   `hit`  - this cell carries label L.
//   `seen` - a cell with label L has already been read, so the cell now being
//            read is not the label's first cell in reading order.
// Every L-cell must carry VN[L] as its region number, and the first one in
// reading order -- the region's leftmost cell in its highest row -- must hold
// VN[L] as its digit.
const regionNumberNFA = (label) => NFA.encodeSpec({
  startState: { stage: 'target' },
  transition: (s, value) => {
    if (s.stage === 'target') return { stage: 'cc', target: value, seen: false };
    if (s.stage === 'cc') {
      return { stage: 'vm', target: s.target, seen: s.seen, hit: value === label };
    }
    if (s.stage === 'vm') {
      if (s.hit && value !== s.target) return undefined;
      return { stage: 'digit', target: s.target, seen: s.seen, hit: s.hit };
    }
    // stage 'digit'
    if (s.hit && !s.seen && value !== s.target) return undefined;
    return { stage: 'cc', target: s.target, seen: s.seen || s.hit };
  },
  accept: (s) => s.stage === 'cc' && s.seen,
}, 9);

const regionNumbers = [
  new AllDifferent(...vn.cells()),   // all region numbers are different
  ...vn.cells().map((numberCell, i) => new NFA(
    regionNumberNFA(i + 1), 'regionNumber', numberCell,
    ...gridCells.flatMap(cell => [cc.at(cell), vm.at(cell), cell]))),
];

// --- Rule 3: the path is one orthogonally connected path --------------------
// A cell may only point at a neighbour that exists.
const pathDomains = gridCells.flatMap(cell => {
  const codes = [OFF, TERM, ...ORTHO.filter(
    d => graph.step(cell, d.dr, d.dc)).map(d => d.code)];
  return [new Given(vs.at(cell), ...codes), new Given(vp.at(cell), ...codes)];
});

// A cell is on the path in VS exactly when it is on the path in VP.
const onPathKey = Pair.fnToKey(
  (succ, pred) => (succ === OFF) === (pred === OFF), 9);

// a points to b as its successor exactly when b points back to a as its
// predecessor: the two overlays describe the same step.
const stepAgreesKey = (dir) => Pair.fnToKey(
  (succ, pred) => (succ === dir.code) === (pred === dir.opposite), 9);

// Each cell has at most one successor and at most one predecessor by
// construction, so the path cells form disjoint simple paths and cycles. A
// cycle is impossible: the step rule below forces the region number never to
// decrease along a step, so a cycle stays inside one region, where the strict
// increase makes the digits rise all the way round. One start and one end
// therefore leave exactly one path.
const pathStructure = [
  ...gridCells.map(
    cell => new Pair(onPathKey, 'onPath', vs.at(cell), vp.at(cell))),
  ...ORTHO.flatMap(dir => {
    const key = stepAgreesKey(dir);
    return gridCells
      .filter(cell => graph.step(cell, dir.dr, dir.dc))
      .map(cell => new Pair(
        key, 'step', vs.at(cell), vp.at(graph.step(cell, dir.dr, dir.dc))));
  }),
  new ContainExact(String(TERM), ...vp.at(gridCells)),   // exactly one start
  new ContainExact(String(TERM), ...vs.at(gridCells)),   // exactly one end
];

// The path visits every region, in ascending order of the region numbers, so it
// starts in the region numbered 1 and ends in the region numbered 9.
const startKey = Pair.fnToKey(
  (pred, number) => pred !== TERM || number === 1, 9);
const endKey = Pair.fnToKey(
  (succ, number) => succ !== TERM || number === 9, 9);
const pathEnds = [
  ...gridCells.map(
    cell => new Pair(startKey, 'startsInRegion1', vp.at(cell), vm.at(cell))),
  ...gridCells.map(
    cell => new Pair(endKey, 'endsInRegion9', vs.at(cell), vm.at(cell))),
];

// --- Rules 3 and 4: what one step of the path may do ------------------------
// One machine per ordered pair of orthogonal neighbours a, b, reading
// (VS[a], VM[a], VM[b], digit a, digit b). It only bites when a steps to b.
// Ascending region order makes the region number stay the same (still inside
// the region) or rise by exactly one (the move into the next region); within a
// region the digit must strictly increase.
const stepNFA = (dirCode) => NFA.encodeSpec({
  startState: { stage: 'succ' },
  transition: (s, value) => {
    if (s.stage === 'succ') {
      return value === dirCode ? { stage: 'vma' } : { stage: 'skip', n: 4 };
    }
    if (s.stage === 'skip') {
      return s.n > 1 ? { stage: 'skip', n: s.n - 1 } : { stage: 'done' };
    }
    if (s.stage === 'vma') return { stage: 'vmb', vma: value };
    if (s.stage === 'vmb') {
      if (value === s.vma) return { stage: 'diga' };
      if (value === s.vma + 1) return { stage: 'skip', n: 2 };
      return undefined;
    }
    if (s.stage === 'diga') return { stage: 'digb', diga: value };
    return value > s.diga ? { stage: 'done' } : undefined;   // stage 'digb'
  },
  accept: (s) => s.stage === 'done',
}, 9);

const pathSteps = ORTHO.flatMap(dir => {
  const encoded = stepNFA(dir.code);
  return gridCells
    .filter(cell => graph.step(cell, dir.dr, dir.dc))
    .map(cell => {
      const next = graph.step(cell, dir.dr, dir.dc);
      return new NFA(
        encoded, 'pathStep', vs.at(cell), vm.at(cell), vm.at(next), cell, next);
    });
});

// --- Rule 5: the arrows -----------------------------------------------------
// One count Var per arrowhead, holding how many cells of the clued cell's own
// region lie on the path along that ray; the clued cell's digit is the sum of
// its arrowheads' counts. A count Var takes the grid's value range, 1 to 9, and
// that lower bound of 1 is the "at least one cell on the path in each of the
// clued directions" clause. The clause is read as scoped to the clued cell's
// region, as the video description's fuller quotation of the same rules gives
// it: "at least one cell on the path (in the arrowed cell's region) in each of
// the clued directions".
// A ray runs to the grid edge -- nothing in the rules stops it at a region
// boundary -- and excludes the clued cell, which lies in none of its own
// directions. The machine reads (count, region number of the clued cell) and
// then, for each cell of the ray in turn, (region number, successor code); a
// ray cell counts when it shares the clued cell's region number and is on the
// path.
const arrowCountNFA = NFA.encodeSpec({
  startState: { stage: 'need' },
  transition: (s, value) => {
    if (s.stage === 'need') return { stage: 'origin', need: value };
    if (s.stage === 'origin') return { stage: 'rayVm', need: s.need, vm: value };
    if (s.stage === 'rayVm') {
      return { stage: 'rayPath', need: s.need, vm: s.vm, same: value === s.vm };
    }
    // stage 'rayPath'
    if (s.same && value !== OFF) {
      if (s.need === 0) return undefined;
      return { stage: 'rayVm', need: s.need - 1, vm: s.vm };
    }
    return { stage: 'rayVm', need: s.need, vm: s.vm };
  },
  accept: (s) => s.stage === 'rayVm' && s.need === 0,
}, 9);

const arrowCounts = arrowRays.map(({ cell, ray }, i) => new NFA(
  arrowCountNFA, 'arrowCount', vd.cell(i + 1), vm.at(cell),
  ...ray.flatMap(rayCell => [vm.at(rayCell), vs.at(rayCell)])));

const arrowTotals = ARROWS.map(({ cell }) => new EqualSum(
  [cell],
  arrowRays.flatMap((entry, i) => entry.cell === cell ? [vd.cell(i + 1)] : [])));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  vm.toVar('regionNumber'),
  vs.toVar('pathSuccessor'),
  vp.toVar('pathPredecessor'),
  vn,
  vd,
  ...regionNumbers,
  ...pathDomains,
  ...pathStructure,
  ...pathEnds,
  ...pathSteps,
  ...arrowCounts,
  ...arrowTotals,
];
