// Title: Psst, I'm in the Loop
// Author: Calvinball
// Video: https://www.youtube.com/watch?v=URampwmtEkk
// Source: https://sudokupad.app/dxgxcqoyeg

// Standard Sudoku; a single orthogonal, non-self-touching loop; adjacent loop
// digits differ by at least 5. Loopwich sums are omitted (see notes).
const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();

const membership = [loop.makeReplicate(new Given(loop.cells()[0], ON, OFF))];

// An on cell has exactly two orthogonally adjacent on cells; off cells are free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, value) => {
    if (phase === 'start') return value === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    if (phase === 'off') return { phase: 'off' };
    const next = onNeighbours + (value === ON ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', onNeighbours: next };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const replicate = (constraint, origin, targets) => new Replicate(
  [constraint], Replicate.encodeTargetCells(targets, origin, loop), origin);
const degreeAt = cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)]));
const degrees = [
  replicate(degreeAt('R2C2'), 'VL11', loop.at(gridCells.filter(cell => {
    const { row, col } = parseCellId(cell);
    return row >= 2 && row <= 8 && col >= 2 && col <= 8;
  }))),
  replicate(degreeAt('R1C2'), 'VL2', loop.at(gridCells.filter(cell => parseCellId(cell).row === 1 && parseCellId(cell).col >= 2 && parseCellId(cell).col <= 8))),
  replicate(degreeAt('R9C2'), 'VL74', loop.at(gridCells.filter(cell => parseCellId(cell).row === 9 && parseCellId(cell).col >= 2 && parseCellId(cell).col <= 8))),
  replicate(degreeAt('R2C1'), 'VL10', loop.at(gridCells.filter(cell => parseCellId(cell).col === 1 && parseCellId(cell).row >= 2 && parseCellId(cell).row <= 8))),
  replicate(degreeAt('R2C9'), 'VL18', loop.at(gridCells.filter(cell => parseCellId(cell).col === 9 && parseCellId(cell).row >= 2 && parseCellId(cell).row <= 8))),
  ...['R1C1', 'R1C9', 'R9C1', 'R9C9'].map(degreeAt),
];

// A 2x2 block cannot have exactly its two diagonal cells on the loop.
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
const noTouches = [replicate(
  new NFA(noTouchMachine, 'no-touch', ...loop.at(graph.block('R1C1', 2, 2))),
  'VL1', loop.at(gridCells.filter(cell => {
    const { row, col } = parseCellId(cell);
    return row <= 8 && col <= 8;
  }))
)];

// Each orthogonally adjacent pair differs by at least 5 when both cells are on.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'aMembership' },
  transition: (state, value) => {
    if (state.phase === 'aMembership') return value === ON ? { phase: 'aDigit' } : { phase: 'skip', left: 3 };
    if (state.phase === 'aDigit') return { phase: 'bMembership', a: value };
    if (state.phase === 'bMembership') return value === ON ? { phase: 'bDigit', a: state.a } : { phase: 'skip', left: 1 };
    if (state.phase === 'bDigit') return Math.abs(state.a - value) >= 5 ? { phase: 'done' } : undefined;
    return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC)).filter(Boolean)
  .map(other => new NFA(whisperMachine, 'whisper', loop.at(cell), cell, loop.at(other), other)));

return [
  new Shape('9x9'),
  new Given('R7C7', 5),
  loop.toVar('loop'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  ...noTouches,
  ...whispers,
];
