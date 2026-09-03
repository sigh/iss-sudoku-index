// Title: Thermohaline Circulation
// Author: Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=pry83BrP3RQ
// Source: https://sudokupad.app/z7oxi1ve8x

// Standard 9x9 sudoku. Shade some cells to form a 1-cell-wide orthogonally
// connected loop; the loop may not touch itself orthogonally, but may touch
// itself diagonally. The unshaded cells form orthogonally connected groups, and
// a group of size N holds exactly the digits 1 to N. Each of the four arrow
// cells is shaded; its digit is the number of shaded cells visible from it in
// the arrow's direction, where an unshaded cell blocks the sightline and the
// arrow cell itself is not counted; and the digits increase along those visible
// shaded cells, starting from the arrow cell's own digit.
//
// Three whole-grid Var layers carry what the rules leave to the solver:
//   VL  group label 1-9 for an unshaded cell, LOOP for a shaded one;
//   VD  an unshaded cell's step distance from the 1 of its own group;
//   VP  a 9x9 table read as [group label][digit], not as a per-cell overlay:
//       VP[k][v] says whether group k holds digit v.
// The alphabet is widened to 10 so that VL can hold LOOP alongside the nine
// labels; the grid cells are pinned back to 1-9.

const LOOP = 10;   // VL value marking a shaded (on-loop) cell
const NO = 1;      // VP values
const YES = 2;

const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const group = graph.makeOverlay('VL');
const depth = graph.makeOverlay('VD');
const present = graph.makeOverlay('VP');

const groupAt = cell => group.at(cell);
const depthAt = cell => depth.at(cell);
// VP row k is group k's nine digit flags, in digit order.
const presentAt = (k, v) => present.row(k)[v - 1];

// Drawn data: the four given digits.
const givens = [['R1C3', 2], ['R2C2', 6], ['R2C8', 7], ['R3C7', 6]];

// Drawn data: the four arrow ticks, each wholly inside one cell, with the
// direction it points as a (row, column) step.
const arrows = [
  { cell: 'R4C1', dR: 1, dC: 0 },
  { cell: 'R4C6', dR: 0, dC: 1 },
  { cell: 'R9C1', dR: -1, dC: 0 },
  { cell: 'R9C2', dR: 0, dC: 1 },
];

// --- Loop: every shaded cell has exactly two shaded orthogonal neighbours. ---
// Reads the cell's own label, then each neighbour's. Unshaded cells are free.
// Together with the ConnectedValues below this is the whole loop rule: a
// connected 2-regular subgraph of the grid is a single cycle, and its cells can
// meet orthogonally only as loop neighbours, which is "may not touch itself
// orthogonally". Diagonal contact is invisible to both, as the rules require.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, value) => {
    if (phase === 'start') {
      return value === LOOP ? { phase: 'on', count: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === LOOP ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry);

// --- Groups are the connected components of the unshaded cells. ---
// Two adjacent unshaded cells are in the same component, so they share a label.
const sameGroupKey = Pair.fnToKey(
  (a, b) => a === LOOP || b === LOOP || a === b, geometry);

// A group holds exactly one 1 (it holds 1..N), so labelling each group by the
// row of its 1 names every group exactly once and leaves the label layer no
// freedom to permute. One key per row r; unused labels stay empty.
const labelIsRowOfTheOneKeys = graph.rows().map((_, index) => Pair.fnToKey(
  (digit, label) => digit !== 1 || label === LOOP || label === index + 1,
  geometry));

// A shaded cell has no group, so its depth is pinned to 1 to keep it from
// multiplying solutions; an unshaded cell's depth is a real 1-9 value.
const depthPinKey = Pair.fnToKey(
  (label, d) => (label === LOOP ? d === 1 : d <= 9), geometry);

// --- Each unshaded cell is joined to the 1 of its own group. ---
// Reads own label, own depth, own digit, then (label, depth) for each
// neighbour. Depth 1 is the group's 1; every other unshaded cell sits one step
// further out than the nearest unshaded neighbour, so following depths
// downwards from any unshaded cell reaches a 1 inside its own group. With the
// digit rule below giving each group exactly one 1, that is what forces a
// label to cover a single component rather than two of them: two components
// sharing a label would each reach a 1 of their own.
// Depth is the exact step distance (some neighbour is one nearer, none is more
// than one nearer) and a 1 is pinned to depth 1, so the layer is determined by
// the shading and digits rather than being free.
const depthMachine = NFA.encodeSpec({
  startState: { phase: 'label' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'label':
        return value === LOOP ? { phase: 'done' } : { phase: 'depth' };
      case 'depth':
        return { phase: 'digit', d: value };
      case 'digit':
        if (state.d === 1) return value === 1 ? { phase: 'done' } : undefined;
        if (value === 1) return undefined;
        return { phase: 'nLabel', need: state.d - 1, found: false };
      case 'nLabel':
        return value === LOOP
          ? { phase: 'nSkip', need: state.need, found: state.found }
          : { phase: 'nDepth', need: state.need, found: state.found };
      case 'nDepth':
        if (value < state.need) return undefined;
        return {
          phase: 'nLabel',
          need: state.need,
          found: state.found || value === state.need,
        };
      case 'nSkip':   // a shaded neighbour: its depth carries no information
        return { phase: 'nLabel', need: state.need, found: state.found };
      case 'done':
        return { phase: 'done' };
    }
  },
  accept: (state) =>
    state.phase === 'done' || (state.phase === 'nLabel' && state.found),
}, geometry);

// --- A group of size N holds exactly the digits 1 to N. ---
// One machine per (label k, digit v): it reads the VP[k][v] flag, then
// (label, digit) for all 81 cells, and counts the cells that are in group k
// and hold digit v. The count may never exceed the flag, so a group holds a
// digit at most once, and must equal it, so the flag is the group's digit set.
const presenceMachine = (k, v) => NFA.encodeSpec({
  startState: { phase: 'flag' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'flag':
        return { phase: 'label', want: value === YES ? 1 : 0, count: 0 };
      case 'label':
        return {
          phase: 'digit', want: state.want, count: state.count,
          inGroup: value === k,
        };
      case 'digit': {
        const count = state.count + (state.inGroup && value === v ? 1 : 0);
        return count > state.want
          ? undefined
          : { phase: 'label', want: state.want, count };
      }
    }
  },
  accept: (state) => state.phase === 'label' && state.count === state.want,
}, geometry);

// Read down VP row k from digit 9 to digit 1: a group holding a digit holds the
// digit below it too, so its digit set is 1..N with N the number of flags set,
// which is the number of cells in the group.
const nestedKey = Pair.fnToKey((high, low) => !(high === YES && low === NO), geometry);

// --- Arrow sightlines. ---
// Reads the arrow cell's digit, then (label, digit) for each cell along the ray
// out from it. The digit is used as the count of shaded cells still to be seen:
// each must be shaded and hold a digit above the previous one, and the cell
// after them must be unshaded (or the ray must end) so that no further shaded
// cell is visible.
const arrowMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'start':
        return { phase: 'label', need: value, prev: value };
      case 'label':
        if (state.need === 0) {
          return value === LOOP ? undefined : { phase: 'blocked' };
        }
        return value === LOOP
          ? { phase: 'digit', need: state.need, prev: state.prev }
          : undefined;
      case 'digit':
        return value > state.prev
          ? { phase: 'label', need: state.need - 1, prev: value }
          : undefined;
      case 'blocked':   // the blocking cell's digit, then the rest of the ray
        return { phase: 'done' };
      case 'done':
        return { phase: 'done' };
    }
  },
  accept: (state) =>
    state.phase === 'done' || (state.phase === 'label' && state.need === 0),
}, geometry);

return [
  shape,
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...givens.map(([cell, digit]) => new Given(cell, digit)),

  group.toVar('group'),
  depth.toVar('depth'),
  present.toVar('digit-present'),
  depth.makeReplicate(new Given(depth.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  present.makeReplicate(new Given(present.cells()[0], NO, YES)),
  ...gridCells.map(cell =>
    new Pair(depthPinKey, 'depth-domain', groupAt(cell), depthAt(cell))),

  // Loop: one connected region of shaded cells, every one of degree 2.
  new ConnectedValues('VL', LOOP),
  ...gridCells.map(cell =>
    new NFA(degreeMachine, 'degree', groupAt(cell), ...group.at(graph.neighbours(cell)))),

  // Groups: adjacent unshaded cells share a label; each label's 1 sits in the
  // row that names it; each unshaded cell reaches its group's 1.
  ...[[0, 1], [1, 0]].map(([dR, dC]) => {
    const targets = gridCells.filter(cell => graph.step(cell, dR, dC) !== null);
    const origin = targets[0];
    return group.makeReplicate(
      new Pair(sameGroupKey, 'same-group',
        groupAt(origin), groupAt(graph.step(origin, dR, dC))),
      group.at(targets));
  }),
  ...gridCells.map(cell => new Pair(
    labelIsRowOfTheOneKeys[parseCellId(cell).row - 1], 'label-is-row-of-1',
    cell, groupAt(cell))),
  ...gridCells.map(cell =>
    new NFA(depthMachine, 'reaches-1', groupAt(cell), depthAt(cell), cell,
      ...graph.neighbours(cell).flatMap(n => [groupAt(n), depthAt(n)]))),

  // Groups: digit sets. VP[k][v] is read by the machines and constrained to be
  // the group's digit set, then required to be 1..N.
  ...graph.rows().flatMap((_, k0) =>
    Array.from({ length: 9 }, (_unused, v0) =>
      new NFA(presenceMachine(k0 + 1, v0 + 1), 'group-digits',
        presentAt(k0 + 1, v0 + 1),
        ...gridCells.flatMap(cell => [groupAt(cell), cell])))),
  ...graph.rows().map((_, k0) =>
    new Pair(nestedKey, 'digits-from-1', ...present.row(k0 + 1).slice().reverse())),

  // Arrows: the arrow cell is shaded, and its digit counts the shaded cells
  // visible along the ray while their digits increase from it.
  ...arrows.map(({ cell }) => new Given(groupAt(cell), LOOP)),
  ...arrows.map(({ cell, dR, dC }) =>
    new NFA(arrowMachine, 'sightline', cell,
      ...graph.ray(cell, dR, dC).slice(1).flatMap(c => [groupAt(c), c]))),
];
