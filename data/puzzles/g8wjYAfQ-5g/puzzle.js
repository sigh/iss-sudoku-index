// Title: Sightline Sum Whisper Loop
// Author: yttrio
// Video: https://www.youtube.com/watch?v=g8wjYAfQ-5g
// Source: https://sudokupad.app/yttrio/sightline-sum-whisper-loop

// A VL overlay marks loop membership: 1 is on the loop and 2 is off it.
// Degree two, diagonal non-touching, and ConnectedValues make the on cells one
// orthogonally-connected simple cycle. Conditional NFAs apply the German
// Whispers rule to its edges and sum each clue's unobstructed loop-cell rays.
const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const loopCell = cell => loop.at(cell);
const gridCells = graph.cells();

const sightlineClues = [
  ['R2C2', 34],
  ['R2C5', 31],
  ['R3C2', 33],
  ['R9C4', 36],
  ['R9C7', 15],
];

const origin = loop.cells()[0];
const membership = [
  loop.makeReplicate(new Given(origin, ON, OFF)),
  ...sightlineClues.map(([cell]) => new Given(loopCell(cell), ON)),
];

// An on cell has exactly two on-loop orthogonal neighbours; an off cell is free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, value) => {
    if (phase === 'start') {
      return value === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === ON ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// A diagonal-only pair of on cells in a 2x2 would make the loop self-touch.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { cells: [] },
  transition: ({ cells }, value) => {
    if (cells === null) return { cells: null };
    const next = [...cells, value === ON];
    if (next.length < 4) return { cells: next };
    const [a, b, c, d] = next;
    return (a && d && !b && !c) || (b && c && !a && !d)
      ? undefined : { cells: null };
  },
  accept: ({ cells }) => cells === null,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(new NFA(
  noDiagonalTouchMachine, 'no-diagonal-touch',
  ...loop.at(graph.block('R1C1', 2, 2))), loop.at(blockOrigins));

// Reads membership/digit pairs for an orthogonal pair. If both cells are on the
// loop, their digits differ by at least 5; otherwise the pair is unconstrained.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'a-membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'a-membership':
        return value === ON ? { phase: 'a-digit' } : { phase: 'skip', left: 3 };
      case 'a-digit':
        return { phase: 'b-membership', a: value };
      case 'b-membership':
        return value === ON ? { phase: 'b-digit', a: state.a } :
          { phase: 'skip', left: 1 };
      case 'b-digit':
        return Math.abs(state.a - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } :
          { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(whisperMachine, 'german-whisper',
    loopCell(cell), cell, loopCell(other), other)));

// The first segment is the clue digit. Each later segment is one outward ray of
// membership/digit pairs. Digits contribute only through the leading run of on
// cells; the first off cell blocks the rest of that ray.
function sightlineMachine(total) {
  return NFA.encodeSpec({
    startState: { phase: 'clue', sum: 0, blocked: false, visible: false },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return state.phase === 'membership'
          ? { ...state, blocked: false, visible: false }
          : undefined;
      }
      if (state.phase === 'clue') {
        return value > total ? undefined :
          { phase: 'membership', sum: value, blocked: false, visible: false };
      }
      if (state.phase === 'membership') {
        const visible = !state.blocked && value === ON;
        return {
          phase: 'digit',
          sum: state.sum,
          blocked: state.blocked || value === OFF,
          visible,
        };
      }
      const sum = state.sum + (state.visible ? value : 0);
      return sum > total ? undefined : {
        phase: 'membership', sum, blocked: state.blocked, visible: false,
      };
    },
    accept: ({ phase, sum }) => phase === 'membership' && sum === total,
  }, geometry.numValues, { multiSegment: true });
}

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const sightlineSums = sightlineClues.map(([clue, total]) => new NFA(
  sightlineMachine(total), `sightline-${total}`,
  [clue],
  ...RAY_DIRECTIONS
    .map(([dRow, dCol]) => graph.ray(clue, dRow, dCol).slice(1))
    .filter(ray => ray.length)
    .map(ray => ray.flatMap(cell => [loopCell(cell), cell]))));

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...whispers,
  ...sightlineSums,
];
