// Title: Thermohaline Circulation
// Author: Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=pry83BrP3RQ
// Source: https://sudokupad.app/z7oxi1ve8x

// Standard Sudoku with the four drawn givens. A one-cell-wide orthogonal loop is
// represented by VL values 1 (on) and 2 (off). The loop must be connected, and
// every on-loop cell has exactly two orthogonal on-loop neighbours. The four
// arrow cells are on the loop; their digit counts the consecutive on-loop cells
// visible along the drawn ray, and digits strictly increase across that run.
// The rule assigning 1 through N to each non-loop component is omitted.

const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const cells = graph.cells();

// The drawn givens in the source grid.
const givens = [
  new Given('R1C3', 2), new Given('R2C2', 6),
  new Given('R2C8', 7), new Given('R3C7', 6),
];

const membership = loop.makeReplicate(new Given(loop.cells()[0], ON, OFF));

// For an on-loop cell, count its orthogonal on-loop neighbours; off-loop cells
// impose no neighbour count.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, value) => {
    if (phase === 'start') return value === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === ON ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry.numValues);
const degrees = cells.map(cell => new NFA(degreeMachine, 'loop-degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// The four drawn arrow cells and their rays, transcribed from the source marks.
const arrows = [
  ['R9C2', ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9']],
  ['R9C1', ['R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1']],
  ['R4C1', ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1']],
  ['R4C6', ['R4C7', 'R4C8', 'R4C9']],
];

// Read an arrow cell as (membership, digit), then each ray cell likewise. The
// state counts the initial uninterrupted on-loop run and checks its digits rise.
const sightlineMachine = NFA.encodeSpec({
  startState: { phase: 'origin-membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'origin-membership': return value === ON ? { phase: 'origin-digit' } : undefined;
      case 'origin-digit': return { phase: 'ray-membership', target: value, count: 0, previous: value };
      case 'ray-membership':
        return value === ON
          ? { phase: 'ray-digit', target: state.target, count: state.count, previous: state.previous }
          : state.count === state.target ? { phase: 'done' } : undefined;
      case 'ray-digit': {
        if (value <= state.previous) return undefined;
        const count = state.count + 1;
        return count > state.target ? undefined
          : { phase: 'ray-membership', target: state.target, count, previous: value };
      }
      case 'done': return { phase: 'done' };
    }
  },
  accept: state => state.phase === 'done' ||
    (state.phase === 'ray-membership' && state.count === state.target),
}, geometry.numValues);
const sightlines = arrows.map(([origin, ray]) => new NFA(sightlineMachine, 'sightline',
  loop.at(origin), origin, ...ray.flatMap(cell => [loop.at(cell), cell])));

return [
  new Shape('9x9'),
  ...givens,
  loop.toVar('loop'),
  membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  ...sightlines,
];
