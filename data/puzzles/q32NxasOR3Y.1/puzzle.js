// Title: Zodiac Recap: Isolation
// Author: Justin Vitanza?
// Video: https://www.youtube.com/watch?v=q32NxasOR3Y
// Source: https://sudokupad.app/vddaws07i4

// Standard 6x6 Sudoku. A directed orthogonal path runs from R1C2 to R2C6,
// visits every circle, and may touch itself without joining at the touch.
// Circled digits are all different and increase along the directed path. Two
// path cells in the same box differ by at least 2.

const OFF = 1, ON = 2;
const NONE = 1, UP = 2, RIGHT = 3, DOWN = 4, LEFT = 5;

const graph = cellGraph('6x6');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Path membership, incoming direction, outgoing direction, and a two-digit
// base-6 traversal rank. Rank (high, low) represents (high - 1) * 6 + low,
// giving the 36 positions needed for a path on a 6x6 grid.
const path = graph.makeOverlay('VP');
const incoming = graph.makeOverlay('VI');
const outgoing = graph.makeOverlay('VO');
const rankHigh = graph.makeOverlay('VH');
const rankLow = graph.makeOverlay('VL');

const start = 'R1C2';
const end = 'R2C6';
const circles = ['R1C1', 'R2C5', 'R3C5', 'R4C1', 'R6C2', 'R6C5'];

// A boundary cell cannot point beyond the grid. These domains prevent false
// starts or ends whose unmatched edge escapes through the outside boundary.
const directionDomains = gridCells.flatMap(cell => {
  const allowed = [
    NONE,
    ...(graph.step(cell, -1, 0) ? [UP] : []),
    ...(graph.step(cell, 0, 1) ? [RIGHT] : []),
    ...(graph.step(cell, 1, 0) ? [DOWN] : []),
    ...(graph.step(cell, 0, -1) ? [LEFT] : []),
  ];
  return [new Given(incoming.at(cell), ...allowed), new Given(outgoing.at(cell), ...allowed)];
});

const cellSpec = kind => NFA.encodeSpec({
  startState: { phase: 'membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'membership':
        return { phase: 'incoming', membership: value };
      case 'incoming':
        return { phase: 'outgoing', membership: state.membership, inDir: value };
      case 'outgoing': {
        const membership = state.membership;
        const inDir = state.inDir;
        const outDir = value;
        const valid = kind === 'start'
          ? membership === ON && inDir === NONE && outDir !== NONE
          : kind === 'end'
            ? membership === ON && inDir !== NONE && outDir === NONE
            : membership === OFF
              ? inDir === NONE && outDir === NONE
              : inDir !== NONE && outDir !== NONE;
        return valid
          ? { phase: 'rankHigh', membership, inDir, outDir }
          : undefined;
      }
      case 'rankHigh':
        return { phase: 'rankLow', membership: state.membership, high: value };
      case 'rankLow':
        return state.membership === ON || (state.high === 1 && value === 1)
          ? { phase: 'done' }
          : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

const normalCellSpec = cellSpec('normal');
const startCellSpec = cellSpec('start');
const endCellSpec = cellSpec('end');
const localPathRules = gridCells.map(cell => new NFA(
  cell === start ? startCellSpec : cell === end ? endCellSpec : normalCellSpec,
  'path cell',
  path.at(cell), incoming.at(cell), outgoing.at(cell),
  rankHigh.at(cell), rankLow.at(cell),
));

// Neighbouring cells agree on each directed edge: an outgoing edge at one end
// is the matching incoming edge at the other end.
const edgeSpec = (aToB, bToA) => NFA.encodeSpec({
  startState: { phase: 'outA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'outA': return { phase: 'inA', outA: value };
      case 'inA': return { phase: 'outB', outA: state.outA, inA: value };
      case 'outB': return { phase: 'inB', outA: state.outA, inA: state.inA, outB: value };
      case 'inB':
        return ((state.outA === aToB) === (value === bToA)) &&
          ((state.outB === bToA) === (state.inA === aToB))
          ? { phase: 'done' }
          : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

const horizontalEdgeSpec = edgeSpec(RIGHT, LEFT);
const verticalEdgeSpec = edgeSpec(DOWN, UP);

// Every used edge advances the traversal rank by exactly one. This rules out
// detached directed cycles, so the local edge model is one path from start to
// end even when non-consecutive path cells touch orthogonally.
const rankStepSpec = outCode => NFA.encodeSpec({
  startState: { phase: 'out' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'out':
        return value === outCode ? { phase: 'highA' } : { phase: 'skip', left: 4 };
      case 'highA': return { phase: 'lowA', highA: value };
      case 'lowA': return { phase: 'highB', highA: state.highA, lowA: value };
      case 'highB': return { ...state, phase: 'lowB', highB: value };
      case 'lowB': {
        const rankA = (state.highA - 1) * 6 + state.lowA;
        const rankB = (state.highB - 1) * 6 + value;
        return rankB === rankA + 1 ? { phase: 'done' } : undefined;
      }
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 }
          : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

const rankRightSpec = rankStepSpec(RIGHT);
const rankLeftSpec = rankStepSpec(LEFT);
const rankDownSpec = rankStepSpec(DOWN);
const rankUpSpec = rankStepSpec(UP);
const edgeRules = gridCells.flatMap(cell => [[0, 1], [1, 0]].flatMap(([dR, dC]) => {
  const other = graph.step(cell, dR, dC);
  if (!other) return [];
  const agreement = dC ? horizontalEdgeSpec : verticalEdgeSpec;
  const rankForward = dC ? rankRightSpec : rankDownSpec;
  const rankBackward = dC ? rankLeftSpec : rankUpSpec;
  return [
    new NFA(agreement, 'path edge',
      outgoing.at(cell), incoming.at(cell), outgoing.at(other), incoming.at(other)),
    new NFA(rankForward, 'path rank',
      outgoing.at(cell), rankHigh.at(cell), rankLow.at(cell),
      rankHigh.at(other), rankLow.at(other)),
    new NFA(rankBackward, 'path rank',
      outgoing.at(other), rankHigh.at(other), rankLow.at(other),
      rankHigh.at(cell), rankLow.at(cell)),
  ];
}));

// Rank comparator used to make each pair's digit order agree with its traversal
// order. Keeping digit comparison in GreaterThan avoids a large product NFA.
const rankLessSpec = NFA.encodeSpec({
  startState: { phase: 'highA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'highA': return { phase: 'lowA', highA: value };
      case 'lowA': return { ...state, phase: 'highB', lowA: value };
      case 'highB': return { ...state, phase: 'lowB', highB: value };
      case 'lowB': {
        const rankA = (state.highA - 1) * 6 + state.lowA;
        const rankB = (state.highB - 1) * 6 + value;
        return rankA < rankB ? { phase: 'done' } : undefined;
      }
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

const rankLess = (a, b) => new NFA(rankLessSpec, 'path order',
  rankHigh.at(a), rankLow.at(a), rankHigh.at(b), rankLow.at(b));
const circleOrderRules = circles.flatMap((a, i) => circles.slice(i + 1).map(b =>
  new Or([
    new And([new GreaterThan(b, a), rankLess(a, b)]),
    new And([new GreaterThan(a, b), rankLess(b, a)]),
  ])));

// Nabner applies to every pair of path cells sharing a 2x3 box.
const nabnerSpec = NFA.encodeSpec({
  startState: { phase: 'membershipA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'membershipA': return { phase: 'digitA', membershipA: value };
      case 'digitA': return { phase: 'membershipB', membershipA: state.membershipA, digitA: value };
      case 'membershipB': return { ...state, phase: 'digitB', membershipB: value };
      case 'digitB':
        return state.membershipA !== ON || state.membershipB !== ON ||
          Math.abs(state.digitA - value) >= 2
          ? { phase: 'done' }
          : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

const boxStarts = ['R1C1', 'R1C4', 'R3C1', 'R3C4', 'R5C1', 'R5C4'];
const nabnerRules = boxStarts.flatMap(boxStart => {
  const cells = graph.block(boxStart, 2, 3);
  return cells.flatMap((a, i) => cells.slice(i + 1).map(b =>
    new NFA(nabnerSpec, 'path Nabner', path.at(a), a, path.at(b), b)));
});

return [
  new Shape('6x6'),
  path.toVar('path membership'),
  incoming.toVar('path incoming direction'),
  outgoing.toVar('path outgoing direction'),
  rankHigh.toVar('path rank high digit'),
  rankLow.toVar('path rank low digit'),
  path.makeReplicate(new Given(path.cells()[0], OFF, ON)),
  ...directionDomains,
  new Given(rankHigh.at(start), 1),
  new Given(rankLow.at(start), 1),
  ...circles.map(cell => new Given(path.at(cell), ON)),
  ...localPathRules,
  ...edgeRules,
  new AllDifferent(...circles),
  ...circleOrderRules,
  ...nabnerRules,
];
