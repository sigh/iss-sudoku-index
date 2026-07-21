// Title: Top Right Boi
// Author: Scojo
// Video: https://www.youtube.com/watch?v=XyS3yC_xwhQ
// Source: https://sudokupad.app/uhbdfuaf2r

// The widened 0-9 alphabet lets the effective-value overlay represent the
// initial carried value 0. Real Sudoku cells are restricted back to 1-9.
// VM is path membership, VP/VS are predecessor/successor directions, and VE
// is each cell's effective value. Local direction agreement orients the one
// connected, non-touching path from R9C1 to R1C9. Effective values then copy
// along each directed edge and reset to the Sudoku digit at every required
// top-right box corner.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const cells = graph.cells();

const membership = graph.makeOverlay('VM');
const predecessor = graph.makeOverlay('VP');
const successor = graph.makeOverlay('VS');
const effective = graph.makeOverlay('VE');

const OFF = 1;
const ON = 2;
const NONE = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;
const directions = [
  { code: UP, dr: -1, dc: 0, opposite: DOWN },
  { code: RIGHT, dr: 0, dc: 1, opposite: LEFT },
  { code: DOWN, dr: 1, dc: 0, opposite: UP },
  { code: LEFT, dr: 0, dc: -1, opposite: RIGHT },
];

const START = 'R9C1';
const END = 'R1C9';
const resetCells = [
  'R1C3', 'R1C6', 'R1C9',
  'R4C3', 'R4C6', 'R4C9',
  'R7C3', 'R7C6', 'R7C9',
];
const forbiddenCells = [
  'R3C1', 'R3C4', 'R3C7',
  'R6C1', 'R6C4', 'R6C7',
  'R9C4', 'R9C7',
];

const makeRoleMachine = role => NFA.encodeSpec({
  startState: { phase: 'membership' },
  transition: (state, value) => {
    if (state.phase === 'membership') {
      return { phase: 'predecessor', on: value === ON };
    }
    if (state.phase === 'predecessor') {
      return { phase: 'successor', on: state.on, pred: value };
    }
    if (!state.on) {
      return state.pred === NONE && value === NONE ? { phase: 'done' } : undefined;
    }
    if (role === 'start') {
      return state.pred === NONE && value !== NONE ? { phase: 'done' } : undefined;
    }
    if (role === 'end') {
      return state.pred !== NONE && value === NONE ? { phase: 'done' } : undefined;
    }
    return state.pred !== NONE && value !== NONE && state.pred !== value
      ? { phase: 'done' }
      : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, geometry);
const ordinaryRole = makeRoleMachine('ordinary');
const startRole = makeRoleMachine('start');
const endRole = makeRoleMachine('end');

// An on-path cell has exactly the membership neighbours used by its directed
// predecessor/successor pair. This also forbids orthogonal self-touch.
const makeDegreeMachine = requiredDegree => NFA.encodeSpec({
  startState: { phase: 'cell' },
  transition: ({ phase, count }, value) => {
    if (phase === 'cell') {
      return value === ON ? { phase: 'neighbours', count: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === ON ? 1 : 0);
    return next <= requiredDegree ? { phase: 'neighbours', count: next } : undefined;
  },
  accept: ({ phase, count }) => phase === 'off' || count === requiredDegree,
}, geometry);
const degreeOne = makeDegreeMachine(1);
const degreeTwo = makeDegreeMachine(2);

// Forbid diagonally touching path cells unless one of the orthogonally
// intervening cells is also on the path.
const noDiagonalTouch = NFA.encodeSpec({
  startState: { values: [] },
  transition: ({ values }, value) => {
    if (values === null) return { values: null };
    const next = [...values, value === ON];
    if (next.length < 4) return { values: next };
    const [a, b, c, d] = next;
    const diagonalOnly = (a && d && !b && !c) || (b && c && !a && !d);
    return diagonalOnly ? undefined : { values: null };
  },
  accept: ({ values }) => values === null,
}, geometry);

// Off-path cells retain their digit. Reset cells do likewise even on the path.
const makeEffectiveMachine = reset => NFA.encodeSpec({
  startState: { phase: 'membership' },
  transition: (state, value) => {
    if (state.phase === 'membership') return { phase: 'effective', on: value === ON };
    if (state.phase === 'effective') return { phase: 'digit', on: state.on, effective: value };
    return (!state.on || reset) && state.effective !== value
      ? undefined
      : { phase: 'done' };
  },
  accept: ({ phase }) => phase === 'done',
}, geometry);
const ordinaryEffective = makeEffectiveMachine(false);
const resetEffective = makeEffectiveMachine(true);

const makePropagationMachine = direction => NFA.encodeSpec({
  startState: { phase: 'direction' },
  transition: (state, value) => {
    if (state.phase === 'direction') {
      return { phase: 'from', active: value === direction };
    }
    if (state.phase === 'from') {
      return { phase: 'to', active: state.active, from: value };
    }
    return !state.active || state.from === value ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, geometry);

const edgeConstraints = [];
const propagationConstraints = [];
for (const cell of cells) {
  for (const { code, dr, dc, opposite } of directions) {
    const other = graph.step(cell, dr, dc);
    if (!other) continue;
    // Only process each undirected edge once for agreement, while adding both
    // possible directed propagation constraints.
    if (cells.indexOf(cell) < cells.indexOf(other)) {
      const forwardKey = Pair.fnToKey(
        (succ, pred) => (succ === code) === (pred === opposite), geometry);
      const reverseKey = Pair.fnToKey(
        (succ, pred) => (succ === opposite) === (pred === code), geometry);
      edgeConstraints.push(
        new Pair(forwardKey, 'path-edge', successor.at(cell), predecessor.at(other)),
        new Pair(reverseKey, 'path-edge', successor.at(other), predecessor.at(cell)),
      );
    }
    if (!resetCells.includes(other)) {
      propagationConstraints.push(new NFA(
        makePropagationMachine(code), 'carry-value',
        successor.at(cell), effective.at(cell), effective.at(other)));
    }
  }
}

const roleConstraints = cells.map(cell => new NFA(
  cell === START ? startRole : cell === END ? endRole : ordinaryRole,
  'path-role', membership.at(cell), predecessor.at(cell), successor.at(cell)));

const directionDomains = cells.flatMap(cell => {
  const allowed = [NONE, ...directions
    .filter(({ dr, dc }) => graph.step(cell, dr, dc))
    .map(({ code }) => code)];
  return [
    new Given(predecessor.at(cell), ...allowed),
    new Given(successor.at(cell), ...allowed),
  ];
});

const degreeConstraints = cells.map(cell => new NFA(
  cell === START || cell === END ? degreeOne : degreeTwo,
  'path-degree', membership.at(cell), ...membership.at(graph.neighbours(cell))));

const noTouchAnchors = cells.filter(cell => graph.block(cell, 2, 2));
const noTouchTemplate = membership.at(graph.block(noTouchAnchors[0], 2, 2));
const noTouchConstraint = membership.makeReplicate(
  new NFA(noDiagonalTouch, 'no-diagonal-touch', ...noTouchTemplate),
  membership.at(noTouchAnchors));

const effectiveConstraints = cells.map(cell => new NFA(
  resetCells.includes(cell) ? resetEffective : ordinaryEffective,
  'effective-value', membership.at(cell), effective.at(cell), cell));

const blackDots = [
  ['R9C2', 'R9C3'], ['R8C3', 'R9C3'], ['R7C1', 'R8C1'],
  ['R7C1', 'R7C2'], ['R4C1', 'R5C1'], ['R9C5', 'R9C6'],
  ['R3C2', 'R3C3'],
];
const whiteDots = [
  ['R8C2', 'R9C2'], ['R8C1', 'R8C2'], ['R5C3', 'R6C3'],
  ['R5C2', 'R5C3'], ['R1C4', 'R2C4'], ['R2C3', 'R2C4'],
];
const xClues = [
  ['R2C5', 'R2C6'], ['R4C5', 'R4C6'],
  ['R8C4', 'R8C5'], ['R7C3', 'R7C4'],
];
const vClues = [
  ['R4C4', 'R4C5'], ['R7C8', 'R7C9'], ['R1C8', 'R1C9'],
  ['R7C3', 'R8C3'], ['R6C6', 'R7C6'], ['R3C7', 'R3C8'],
];
const cages = [
  { total: 27, cells: ['R1C3', 'R1C4', 'R1C5', 'R1C6'] },
  { total: 12, cells: ['R2C2', 'R3C2', 'R4C2'] },
  { total: 7, cells: ['R8C6', 'R8C7', 'R8C8'] },
  { total: 43, cells: ['R4C7', 'R5C6', 'R5C7', 'R5C9', 'R6C5',
    'R6C6', 'R6C7', 'R6C8', 'R6C9'] },
];

return [
  shape,
  // Keep ordinary Sudoku digits in 1-9 despite the auxiliary zero value.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9), cells),
  membership.toVar('path membership'),
  predecessor.toVar('path predecessor direction'),
  successor.toVar('path successor direction'),
  effective.toVar('effective value'),
  membership.makeReplicate(new Given(membership.cells()[0], OFF, ON)),
  predecessor.makeReplicate(new Given(predecessor.cells()[0], NONE, UP, RIGHT, DOWN, LEFT)),
  successor.makeReplicate(new Given(successor.cells()[0], NONE, UP, RIGHT, DOWN, LEFT)),
  ...directionDomains,
  new Given(membership.at(START), ON),
  new Given(membership.at(END), ON),
  ...resetCells.map(cell => new Given(membership.at(cell), ON)),
  ...forbiddenCells.map(cell => new Given(membership.at(cell), OFF)),
  new Given(effective.at(START), 0),
  new ConnectedValues('VM', ON),
  ...roleConstraints,
  ...edgeConstraints,
  ...degreeConstraints,
  noTouchConstraint,
  ...effectiveConstraints,
  ...propagationConstraints,
  new AllDifferent(...resetCells),
  ...cages.flatMap(cage => [
    new Sum(cage.total, ...effective.at(cage.cells)),
    new AllDifferent(...cage.cells),
  ]),
  ...blackDots.map(pair => new BlackDot(...effective.at(pair))),
  ...whiteDots.map(pair => new WhiteDot(...effective.at(pair))),
  ...xClues.map(pair => new X(...effective.at(pair))),
  ...vClues.map(pair => new V(...effective.at(pair))),
];
