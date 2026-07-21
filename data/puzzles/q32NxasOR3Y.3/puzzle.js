// Title: Zodiac Recap: Original Sin
// Author: Nordy?
// Video: https://www.youtube.com/watch?v=q32NxasOR3Y
// Source: https://sudokupad.app/zetsay0l62

// Normal 6x6 sudoku. Six circled cells start six distinct orthogonal paths.
// A circle's digit is its path length, path digits do not repeat, and paths
// neither branch nor touch themselves or each other orthogonally. The apple
// between R3C1 and R3C2 joins digits summing to 5.

const OFF = 7;
const circles = ['R4C2', 'R3C3', 'R2C4', 'R3C5', 'R1C6', 'R6C2'];

// One label per path, anchored at the corresponding circle; 7 means off-path.
const shape = new Shape('6x6', 7);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const path = graph.makeOverlay('VP');
const pathCell = cell => path.at(cell);

// Non-root path cells have one or two same-path neighbours. Together with
// connectivity, this excludes branches and cycles detached from a root.
const pathDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, label, count }, value) => {
    if (phase === 'start') {
      return value === OFF
        ? { phase: 'off' }
        : { phase: 'count', label: value, count: 0 };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === label ? 1 : 0);
    return next > 2 ? undefined : { phase: 'count', label, count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 1 || count === 2,
}, geometry.numValues);

// A root is isolated for a one-cell path; otherwise it is an endpoint.
const rootDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: ({ phase, target, label, count }, value) => {
    if (phase === 'digit') return { phase: 'label', target: value };
    if (phase === 'label') return { phase: 'count', target, label: value, count: 0 };
    const next = count + (value === label ? 1 : 0);
    return next > 1 ? undefined : { phase: 'count', target, label, count: next };
  },
  accept: ({ phase, target, count }) => phase === 'count' &&
    (target === 1 ? count === 0 : count === 1),
}, geometry.numValues);

// Count one chosen path label and require its total to equal its root digit.
function pathLengthMachine(label) {
  return NFA.encodeSpec({
    startState: { phase: 'target', target: null, count: 0 },
    transition: ({ phase, target, count }, value) => {
      if (phase === 'target') return { phase: 'count', target: value, count: 0 };
      const next = count + (value === label ? 1 : 0);
      return next > target ? undefined : { phase: 'count', target, count: next };
    },
    accept: ({ phase, target, count }) => phase === 'count' && count === target,
  }, geometry.numValues);
}

// Scan membership/digit pairs and reject a repeated digit on one chosen path.
function distinctPathDigitsMachine(label) {
  return NFA.encodeSpec({
    startState: { phase: 'membership', seen: 0 },
    transition: ({ phase, seen, selected }, value) => {
      if (phase === 'membership') {
        return { phase: 'digit', seen, selected: value === label };
      }
      if (!selected) return { phase: 'membership', seen };
      const bit = 1 << (value - 1);
      return seen & bit
        ? undefined
        : { phase: 'membership', seen: seen | bit };
    },
    accept: ({ phase }) => phase === 'membership',
  }, geometry.numValues);
}

// Orthogonally adjacent on-path cells must carry the same path label. This is
// both the between-path no-touch rule and, with the degree rules, self-no-touch.
const compatibleLabels = Pair.fnToKey(
  (a, b) => a === OFF || b === OFF || a === b,
  geometry.numValues,
);
const adjacentPathLabels = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new Pair(compatibleLabels, 'path touch', pathCell(cell), pathCell(other))));

const nonRootDegrees = gridCells
  .filter(cell => !circles.includes(cell))
  .map(cell => new NFA(
    pathDegreeMachine,
    'path degree',
    pathCell(cell),
    ...path.at(graph.neighbours(cell)),
  ));

const rootDegrees = circles.map(cell => new NFA(
  rootDegreeMachine,
  'root degree',
  cell,
  pathCell(cell),
  ...path.at(graph.neighbours(cell)),
));

const pathRules = circles.flatMap((circle, index) => {
  const label = index + 1;
  return [
    new Given(pathCell(circle), label),
    new ConnectedValues('VP', label),
    new NFA(pathLengthMachine(label), 'path length', circle, ...path.cells()),
    new NFA(
      distinctPathDigitsMachine(label),
      'path digits',
      ...gridCells.flatMap(cell => [pathCell(cell), cell]),
    ),
  ];
});

return [
  shape,
  // The seventh value exists only for the path overlay.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6)),
  path.toVar('path labels'),
  ...pathRules,
  new AllDifferent(...circles),
  ...adjacentPathLabels,
  ...nonRootDegrees,
  ...rootDegrees,
  new V('R3C1', 'R3C2'),
];
