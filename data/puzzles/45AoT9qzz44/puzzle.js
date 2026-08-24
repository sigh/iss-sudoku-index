// Title: Happy 40th, Jessica!
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=45AoT9qzz44
// Source: https://app.crackingthecryptic.com/sudoku/r4QbD3Bb6F

// Normal sudoku rules apply. A single, orthogonally connected region of
// cells must be shaded (the unshaded cells carry no connectivity
// requirement). Circles are unshaded; a circle's digit counts the shaded
// cells among its up-to-8 king-move neighbours -- the rules give circles no
// direction qualifier, unlike squares, so "surrounding" is read as the full
// king neighbourhood. Squares are shaded; a square's digit counts shaded
// cells the square sees orthogonally (up/down/left/right), including
// itself, stopping at the first unshaded cell (or the grid edge) in each
// direction.

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const SHADED = 1;
const UNSHADED = 2;

// Circle/square cells, transcribed from the payload's overlay list
// (rounded=true -> circle, rounded=false -> square).
const circles = [
  'R1C5', 'R1C6', 'R1C8', 'R2C2', 'R2C4', 'R2C5', 'R3C1', 'R4C2', 'R4C5',
  'R4C8', 'R5C7', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R7C3', 'R8C4', 'R8C5',
  'R8C6', 'R8C8',
];
const squares = [
  'R1C3', 'R1C9', 'R2C7', 'R3C4', 'R3C6', 'R4C4', 'R5C1', 'R5C4', 'R6C7',
  'R7C6', 'R9C7',
];

// Plain sudoku givens, transcribed from the payload's cell values.
const givens = [
  ['R1C9', 9], ['R3C1', 1], ['R3C4', 9], ['R5C1', 7],
  ['R6C7', 7], ['R8C8', 7], ['R9C2', 9],
];

// --- Shading: every cell is shaded (1) or unshaded (2). The shade Var
// group's domain is restricted to {SHADED, UNSHADED} by replicating a
// two-value Given across the whole overlay.
const shadeOrigin = shade.cells()[0];

// --- Single connected shaded region: ConnectedValues over the shaded
// value forces the shaded cells into exactly one orthogonally-connected
// group, matching "a single, orthogonally connected region must be
// shaded." No connectivity is asserted for the unshaded cells.

// --- Circle counts: king-neighbour count machine (nordschleife-style).
// Reads the circle's own digit as the target, then each king neighbour's
// shade; accepts when the number of SHADED neighbours equals the target.
// Handles edge/corner circles (fewer than 8 neighbours) automatically,
// since the neighbour list itself is shorter there.
const circleCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === SHADED ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);

// --- Square counts: one Var per (square, direction) holding one plus the
// shaded run length outward in that direction (stopping at the first
// unshaded cell or the grid edge); summing the four and subtracting the
// square's own digit leaves 3, since the square cell itself is counted
// once by every direction's Var instead of once overall.
const DIRECTIONS = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];
const sightCounts = new Var(
  'C', 'square directional sight counts', `${squares.length}x4`);
const sightCountVar = (squareIndex, directionIndex) =>
  sightCounts.cell(squareIndex + 1, directionIndex + 1);

// Reads [directional count, ray cell shades...]. The square itself is
// always SHADED (squares are always shaded by rule), so the run is
// measured directly against SHADED rather than against a read centre
// colour. remaining tracks the shaded run still expected beyond the
// square itself (count - 1); a differing value while remaining > 0, or a
// same value once remaining hits 0, rejects.
const sightCountSpec = NFA.encodeSpec({
  startState: { phase: 'count' },
  transition: (state, value) => {
    if (state.phase === 'count') return { phase: 'visible', remaining: value - 1 };
    if (state.phase === 'blocked') return state;
    if (value !== SHADED) {
      return state.remaining === 0 ? { phase: 'blocked' } : undefined;
    }
    if (state.remaining === 0) return undefined;
    return { ...state, remaining: state.remaining - 1 };
  },
  accept: state =>
    (state.phase === 'visible' && state.remaining === 0) ||
    state.phase === 'blocked',
}, 9);

function squareConstraints() {
  return squares.flatMap((cell, squareIndex) => {
    const directionalCounts = DIRECTIONS.map((direction, directionIndex) => {
      const ray = shade.at(graph.ray(cell, ...direction).slice(1));
      return new NFA(
        sightCountSpec,
        `square sight ${cell} direction ${directionIndex + 1}`,
        sightCountVar(squareIndex, directionIndex),
        ...ray,
      );
    });
    const vars = DIRECTIONS.map((_, directionIndex) =>
      sightCountVar(squareIndex, directionIndex));
    return [
      ...directionalCounts,
      new Sum(3, ...vars, [cell, -1]),
    ];
  });
}

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  sightCounts,
  ...givens.map(([cell, value]) => new Given(cell, value)),
  shade.makeReplicate(new Given(shadeOrigin, SHADED, UNSHADED)),
  ...circles.map(cell => new Given(shade.at(cell), UNSHADED)),
  ...squares.map(cell => new Given(shade.at(cell), SHADED)),
  new ConnectedValues('VS', SHADED),
  ...circles.map(cell =>
    new NFA(
      circleCountMachine, 'circle-count', cell,
      ...shade.at(graph.kingNeighbours(cell)))),
  ...squareConstraints(),
];
