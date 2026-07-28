// Title: Tenfold
// Author: Black_Doom
// Video: https://www.youtube.com/watch?v=Vt0yAVd4Uj4
// Source: https://sudokupad.app/2yiw0yc01y

// Standard Sudoku. A one-cell-wide orthogonal loop cannot touch itself,
// including diagonally. Cages are off-loop: their digit counts king-neighbour
// loop cells and their printed corner total is the sum of those digits.
// OMITTED: the loop's ordered contiguous segments each sum to 10.

const ON = 1, OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const cells = graph.cells();
const loop = graph.makeOverlay('VL');

// Drawn cage cells and their printed top-left totals.
const cages = [
  { cell: 'R1C2', total: 21 }, { cell: 'R2C5', total: 10 },
  { cell: 'R3C8', total: 18 }, { cell: 'R5C3', total: 17 },
  { cell: 'R6C7', total: 14 }, { cell: 'R7C4', total: 19 },
  { cell: 'R8C9', total: 5 }, { cell: 'R9C6', total: 9 },
];
const cageCells = new Set(cages.map(({ cell }) => cell));

const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...[...cageCells].map(cell => new Given(loop.at(cell), OFF)),
];

// An on-loop cell has exactly two orthogonal on-loop neighbours. Together with
// ConnectedValues this makes one closed loop; off-loop cells are unconstrained.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, value) => {
    if (phase === 'start') return value === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (value === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = cells.map(cell => new NFA(degreeMachine, 'loop-degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// A 2x2 may not have just a diagonal pair of loop cells.
const noTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === ON];
    if (next.length < 4) return { block: next };
    const [a, b, c, d] = next;
    return (a && d && !b && !c) || (b && c && !a && !d) ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
const noTouchOrigins = cells.filter(cell => graph.block(cell, 2, 2));
const noTouches = loop.makeReplicate(
  new NFA(noTouchMachine, 'no-diagonal-touch', ...loop.at(graph.block('R1C1', 2, 2))),
  loop.at(noTouchOrigins),
);

// Each caged digit is its king-neighbour on-loop count; the printed cage total
// is the corresponding sum of neighbour digits.
function cageCountSpec(neighbourCount) {
  return NFA.encodeSpec({
    startState: { phase: 'cage' },
    transition: (state, value) => {
      if (state.phase === 'cage') return { phase: 'loop', target: value, i: 0, count: 0 };
      const count = state.count + (value === ON ? 1 : 0);
      if (count > state.target) return undefined;
      const i = state.i + 1;
      return i === neighbourCount ? { phase: 'done', target: state.target, count } :
        { phase: 'loop', target: state.target, i, count };
    },
    accept: state => state.phase === 'done' && state.count === state.target,
  }, geometry.numValues);
}
function cageSumSpec(neighbourCount, target) {
  return NFA.encodeSpec({
    startState: { phase: 'loop', i: 0, sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'loop') return { ...state, phase: 'digit', on: value === ON };
      const sum = state.sum + (state.on ? value : 0);
      if (sum > target) return undefined;
      const i = state.i + 1;
      return i === neighbourCount ? { phase: 'done', sum } : { phase: 'loop', i, sum };
    },
    accept: state => state.phase === 'done' && state.sum === target,
  }, geometry.numValues);
}
const cageConstraints = cages.map(({ cell, total }) => {
  const neighbours = graph.kingNeighbours(cell);
  return [
    new NFA(cageCountSpec(neighbours.length), 'cage-loop-count', cell, ...loop.at(neighbours)),
    new NFA(cageSumSpec(neighbours.length, total), 'cage-loop-sum',
      ...neighbours.flatMap(other => [loop.at(other), other])),
  ];
}).flat();

return [
  new Shape('9x9'),
  new Given('R8C2', 3),
  loop.toVar('loop'),
  ...membership,
  ...degrees,
  noTouches,
  new ConnectedValues('VL', ON),
  ...cageConstraints,
];
