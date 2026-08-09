// Title: Little Miracle
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=Aq5OlY57S4k
// Source: https://sudokupad.app/zos75s0s5z

// Rules encoded here, all of them:
//
//  - Eight non-overlapping 2x4 regions (2 rows by 4 columns) are placed in the
//    9x9 board. Each holds 1-8 once. A cell in no region holds no digit. No
//    digit repeats in a row or a column.
//  - One orthogonal loop, non-branching, never touching itself even diagonally,
//    passing through no empty cell.
//  - Two cells adjacent along the loop hold one extreme digit (1, 2, 7, 8) and
//    one medium digit (3, 4, 5, 6).
//  - Regions are numbered 1-8 in reading order of their top-left cells; region
//    N contains digit N on the loop.
//  - Two marked diagonals sum to their outside totals.
//  - The given R8C7 = 7.
//
// A row here holds only 4-8 digits and several no-digit cells, so the grid is
// Raw: no implicit constraints, so every rule below (including row/column
// no-repeat) is stated explicitly. 0 means "no digit".
const shape = new Shape('9x9', '0-8', 'Raw');
const graph = cellGraph(shape);

const EMPTY = 0;                 // grid: this cell is in no region
const IN = 1, OUT = 0;           // VO: inside / outside a region
const ON = 1, OFF = 0;           // VL: on / off the loop
const NO_REGION = 0;             // VN: region number of a cell in no region
const EXTREME = [1, 2, 7, 8];
const NUM_REGIONS = 8;
const REGION_ROWS = 2, REGION_COLS = 4;

const inside = graph.makeOverlay('VO');      // 1 if the cell is in a region
const loop = graph.makeOverlay('VL');        // 1 if the cell is on the loop
const labels = graph.makeOverlay('VN');      // region number, or 0
const marks = graph.makeOverlay('VM');       // see regionDigits below

const gridCells = graph.cells();
const binary = [OFF, ON];

// A region is named by its top-left cell, so the placements are every 2x4 block
// that fits. `corners` flags the chosen ones, one flag per cell of a VT layer;
// cells that start no block are pinned off.
const corners = graph.makeOverlay('VT');
const placements = gridCells
  .map(cell => ({ cell, block: graph.block(cell, REGION_ROWS, REGION_COLS) }))
  .filter(({ block }) => block);
const placedCells = new Set(placements.map(({ cell }) => cell));

const domains = [
  inside.makeReplicate(new Given(inside.cells()[0], ...binary)),
  loop.makeReplicate(new Given(loop.cells()[0], ...binary)),
  corners.makeReplicate(new Given(corners.cells()[0], ...binary)),
  corners.makeReplicate(
    new Given(corners.cells()[0], OFF),
    corners.at(gridCells.filter(cell => !placedCells.has(cell)))),
];

// Exactly eight regions, and each cell is covered by at most one of them: the
// flags of the blocks covering a cell sum to that cell's 0/1 membership.
const regionCount = new Sum(NUM_REGIONS, ...corners.cells());
const coverage = gridCells.map(cell => new EqualSum(
  [inside.at(cell)],
  placements
    .filter(({ block }) => block.includes(cell))
    .map(({ cell: corner }) => corners.at(corner))));

// A cell holds a digit exactly when it is in a region, and carries that
// region's number.
const digitMembershipKey = Pair.fnToKey(
  (membership, digit) => membership === (digit === EMPTY ? OUT : IN), shape);
const labelMembershipKey = Pair.fnToKey(
  (membership, label) => membership === (label === NO_REGION ? OUT : IN), shape);
const membership = gridCells.flatMap(cell => [
  new Pair(digitMembershipKey, 'digit in region', inside.at(cell), cell),
  new Pair(labelMembershipKey, 'label in region', inside.at(cell), labels.at(cell)),
]);

// A chosen region holds eight distinct digits -- all non-zero, so 1-8 once each
// -- and one region number across its eight cells.
const regionContents = placements.flatMap(({ cell, block }) => [
  new Or([
    new Given(corners.at(cell), OFF),
    new AllDifferent(...block),
  ]),
  new Or([
    new Given(corners.at(cell), OFF),
    new SameValues(block.length, ...labels.at(block)),
  ]),
]);

const nonZeroDifferentKey = PairX.fnToKey(
  (a, b) => a === EMPTY || b === EMPTY || a !== b, shape);
const rowsAndColumns = [...graph.rows(), ...graph.columns()].map(
  line => new PairX(nonZeroDifferentKey, 'digits differ', ...line));

// Region numbering: reading order of the top-left cells is the reading order of
// each number's first appearance, so scanning the label layer row by row must
// meet 1, then 2, ... then 8. Eight regions and eight numbers all present makes
// the numbering a bijection.
const labelOrderMachine = NFA.encodeSpec({
  startState: { seen: 0 },     // the highest number met so far
  transition: ({ seen }, label) => {
    if (label === NO_REGION || label <= seen) return { seen };
    return label === seen + 1 ? { seen: seen + 1 } : undefined;
  },
  accept: ({ seen }) => seen === NUM_REGIONS,
}, shape);
const labelOrder = new NFA(labelOrderMachine, 'reading order', ...labels.cells());

// The loop runs through cells that hold a digit.
const loopInRegionKey = Pair.fnToKey(
  (onLoop, membership) => onLoop === OFF || membership === IN, shape);
const loopInRegions = gridCells.map(cell => new Pair(
  loopInRegionKey, 'loop avoids empties', loop.at(cell), inside.at(cell)));

// Degree 2: each on-loop cell has exactly two on-loop orthogonal neighbours.
// Reads the membership of the cell, then of each neighbour. Off cells are free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, shape);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// No diagonal self-touch: forbid a 2x2 whose only on cells are a diagonal. A
// 2x2 with three on cells is the loop turning a corner, which is allowed.
// Reads the four membership cells of a 2x2 block, left-to-right, top-to-bottom.
const noDiagonalTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, shape);
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...loop.at(graph.block(gridCells[0], 2, 2))),
  loop.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// Loop alternation: two orthogonally adjacent on-loop cells hold one extreme
// and one medium digit. Reads (membership, digit) for each cell; if either is
// off the loop the pair is unconstrained, and a skip countdown absorbs the
// remaining symbols.
const alternationMachine = NFA.encodeSpec({
  startState: { phase: 'firstOn' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'firstOn':
        return value === ON ? { phase: 'firstDigit' } : { phase: 'skip', left: 3 };
      case 'firstDigit':
        return { phase: 'secondOn', firstDigit: value };
      case 'secondOn':
        return value === ON
          ? { phase: 'secondDigit', firstDigit: state.firstDigit }
          : { phase: 'skip', left: 1 };
      case 'secondDigit':
        return EXTREME.includes(state.firstDigit) !== EXTREME.includes(value)
          ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
// Right/down steps only: each orthogonal pair is covered once.
const alternations = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(alternationMachine, 'alternation',
    loop.at(cell), cell, loop.at(other), other)));

// Region N holds digit N on the loop. The VM layer carries a cell's region
// number when that cell holds its own region's number and is on the loop, and 0
// otherwise, so requiring 1-8 across the layer is the rule for all eight
// regions at once. Reads (region number, digit, loop membership, mark).
const markMachine = NFA.encodeSpec({
  startState: { phase: 'label' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'label':
        return { phase: 'digit', label: value };
      case 'digit':
        return {
          phase: 'loop',
          match: (state.label !== NO_REGION && value === state.label)
            ? state.label : NO_REGION,
        };
      case 'loop':
        return { phase: 'mark', mark: value === ON ? state.match : NO_REGION };
      case 'mark':
        return value === state.mark ? { phase: 'done' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
const regionDigitMarks = gridCells.map(cell => new NFA(markMachine, 'region digit',
  labels.at(cell), cell, loop.at(cell), marks.at(cell)));
const regionDigits = new ContainAtLeast(
  Array.from({ length: NUM_REGIONS }, (_, i) => i + 1).join('_'),
  ...marks.cells());

// The two arrowheads sit on the left border at the row-5/row-6 and row-9/bottom
// lattice corners, pointing down-right and up-right, with the circles "16" and
// "5" beside them; each ray is the grid diagonal leaving its corner.
const diagonals = [
  new Sum(16, ...graph.ray('R6C1', 1, 1)),
  new Sum(5, ...graph.ray('R9C1', -1, 1)),
];

return [
  shape,
  inside.toVar('In a region'),
  loop.toVar('On the loop'),
  labels.toVar('Region number'),
  marks.toVar('Region digit on loop'),
  corners.toVar('Region top-left'),
  ...domains,
  regionCount,
  ...coverage,
  ...membership,
  ...regionContents,
  ...rowsAndColumns,
  labelOrder,
  ...loopInRegions,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...alternations,
  ...regionDigitMarks,
  regionDigits,
  ...diagonals,
  new Given('R8C7', 7),
];
