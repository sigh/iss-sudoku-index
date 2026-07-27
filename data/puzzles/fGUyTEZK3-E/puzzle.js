// Title: Original Sin
// Author: Nordy
// Video: https://www.youtube.com/watch?v=fGUyTEZK3-E
// Source: https://sudokupad.app/zaputh99gx

// Normal 9x9 sudoku. Nine circled cells start nine distinct orthogonal
// snakes. A circle's digit is its snake's length (including the circle),
// snake digits do not repeat, and snakes neither branch nor touch
// themselves or each other orthogonally. Six clue cells give the total of
// the digits in the snake or garden (an orthogonally-connected group of
// non-snake cells) that contains them; a clue on a garden cell is not
// checked here -- see the "clue sum" section below. Six apple-joined cell
// pairs are Forbidden Fruit: no 5, and not both low (1-4), both high (6-9),
// both even, or both odd.

const OFF = 10;
const circles = [
  'R4C2', 'R3C3', 'R2C4', 'R1C9', 'R7C1', 'R8C6', 'R9C7', 'R5C8', 'R6C5',
];
const clues = [
  { cell: 'R2C2', sum: 12 },
  { cell: 'R1C7', sum: 7 },
  { cell: 'R3C7', sum: 45 },
  { cell: 'R8C4', sum: 8 },
  { cell: 'R4C9', sum: 18 },
  { cell: 'R1C5', sum: 34 },
];
const appleEdges = [
  ['R2C2', 'R3C2'],
  ['R1C5', 'R2C5'],
  ['R3C5', 'R3C6'],
  ['R5C7', 'R6C7'],
  ['R6C1', 'R6C2'],
  ['R4C5', 'R5C5'],
];

// One label per snake, anchored at the corresponding circle; 10 means
// off-snake (in some garden).
const shape = new Shape('9x9', OFF);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const path = graph.makeOverlay('VP');
const pathCell = cell => path.at(cell);

// Non-root snake cells have one or two same-label neighbours. Together with
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

// A root is isolated for a one-cell snake; otherwise it is an endpoint.
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

// Count one chosen snake label and require its total to equal its root digit.
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

// Scan membership/digit pairs and reject a repeated digit on one chosen snake.
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

// Orthogonally adjacent on-snake cells must carry the same snake label. This
// is both the between-snake no-touch rule and, with the degree rules, the
// self-no-touch rule. One Replicate template per direction (rightward,
// downward): a fixed-offset shift stays valid for every cell filtered to
// have that neighbour, so this covers the same 144 edges as a per-cell loop.
const compatibleLabels = Pair.fnToKey(
  (a, b) => a === OFF || b === OFF || a === b,
  geometry.numValues,
);
const origin = path.cells()[0];
const adjacentPathLabels = [[0, 1], [1, 0]].map(([dRow, dCol]) => {
  const targets = path.at(gridCells.filter(cell => graph.step(cell, dRow, dCol)));
  return path.makeReplicate(
    [new Pair(compatibleLabels, 'snake touch', origin, path.step(origin, dRow, dCol))],
    targets,
  );
});

const nonRootDegrees = gridCells
  .filter(cell => !circles.includes(cell))
  .map(cell => new NFA(
    pathDegreeMachine,
    'snake degree',
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
    new NFA(pathLengthMachine(label), 'snake length', circle, ...path.cells()),
    new NFA(
      distinctPathDigitsMachine(label),
      'snake digits',
      ...gridCells.flatMap(cell => [pathCell(cell), cell]),
    ),
  ];
});

// A clue cell's snake/garden sum. The clue cell's own snake label picks
// which label to total; an off-snake (garden) clue label is accepted
// unconditionally, since garden membership/extent is not modelled -- see
// omitted_rules. Reading is (label-of-clue, then (label, digit) for every
// grid cell in turn), so the clue cell's own digit is included in its total.
function clueSumMachine(targetSum) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, label, sum, match }, value) => {
      if (phase === 'start') {
        return value === OFF
          ? { phase: 'skip' }
          : { phase: 'label', label: value, sum: 0 };
      }
      if (phase === 'skip') return { phase: 'skip' };
      if (phase === 'label') {
        return { phase: 'digit', label, sum, match: value === label };
      }
      const next = sum + (match ? value : 0);
      return next > targetSum ? undefined : { phase: 'label', label, sum: next };
    },
    accept: ({ phase, sum }) => phase === 'skip' || (phase === 'label' && sum === targetSum),
  }, geometry.numValues);
}

const clueSums = clues.map(({ cell, sum }) => new NFA(
  clueSumMachine(sum),
  `clue sum ${cell}`,
  pathCell(cell),
  ...gridCells.flatMap(c => [pathCell(c), c]),
));

// Forbidden Fruit: neither cell is 5; not both low (1-4), both high (6-9),
// both even, or both odd. 5 is excluded from every low/high/even/odd class.
// Keyed at the widened geometry.numValues (10, not 9): the solver's lookup
// tables for Pair/Binary keys are sized from the whole puzzle's (widened)
// value range, not from the smaller range these two grid cells actually
// play in. Value 10 never occurs on a real grid cell, so its rows are dead.
const LOW = [1, 2, 3, 4], HIGH = [6, 7, 8, 9], EVEN = [2, 4, 6, 8], ODD = [1, 3, 7, 9];
const bothIn = (set, a, b) => set.includes(a) && set.includes(b);
const appleKey = Pair.fnToKey((a, b) =>
  a !== 5 && b !== 5 &&
  !bothIn(LOW, a, b) && !bothIn(HIGH, a, b) &&
  !bothIn(EVEN, a, b) && !bothIn(ODD, a, b),
  geometry.numValues);
const apples = appleEdges.map(([a, b]) => new Pair(appleKey, 'forbidden fruit', a, b));

return [
  shape,
  // Values 10 exists only for the snake-label overlay.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  path.toVar('snake labels'),
  ...pathRules,
  new AllDifferent(...circles),
  ...adjacentPathLabels,
  ...nonRootDegrees,
  ...rootDegrees,
  ...clueSums,
  ...apples,
];
