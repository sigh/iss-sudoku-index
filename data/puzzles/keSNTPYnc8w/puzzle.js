// Title: Reef
// Author: zetamath
// Video: https://www.youtube.com/watch?v=keSNTPYnc8w
// Source: https://app.crackingthecryptic.com/sudoku/dhm2Md99Mt

// Normal sudoku rules apply.
//
// Shading: every cell is shaded CORAL or left WATER. All coral cells form
// one orthogonally-connected region ("shade some cells" -- rules text --
// guarantees coral is non-empty, matching ConnectedValues' non-empty
// requirement). No 2x2 block is entirely coral or entirely water.
//
// OMITTED: "All bodies of water connect to the edge of the grid." Unlike
// coral, the rules text allows water to be several separate bodies, each
// merely touching the border -- not one connected region. ISS's
// ConnectedValues only asserts a single connected region per value; a
// per-component border-reach mode does not exist yet. Left unconstrained;
// see blockers.
//
// Cages (15; none carry a printed total): digits do not repeat within a
// cage, and the sum of the coral digits in a cage equals the sum of the
// water digits in that cage -- a per-cage running-difference NFA over
// interleaved (digit, shade) symbols (coral counts +digit, water counts
// -digit; accept when the total is 0).
//
// Circled cells (8 of the 15 cages): the circle cell's own digit equals
// the number of cells in its cage sharing the circle cell's shade,
// counting the circle cell itself. Encoded as a per-cage NFA that reads
// the target digit, then the circle cell's own shade (establishing the
// reference colour and counting itself), then every other cage cell's
// shade.

const CORAL = 1;
const WATER = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either CORAL or WATER.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, CORAL, WATER));

// No 2x2 block may be all-coral or all-water: one NFA on the top-left
// block, replicated to every block origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 9);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Cage cell lists and circle-cell membership, transcribed from the drawn
// cages and the 8 circle overlays (each matched to the cage containing it).
const cages = [
  { cells: ['R1C8', 'R1C9', 'R2C8', 'R2C9'], circle: 'R1C9' },
  { cells: ['R2C7', 'R3C7', 'R3C8', 'R3C9'], circle: 'R3C9' },
  { cells: ['R1C6', 'R1C7', 'R2C6', 'R3C6'], circle: 'R3C6' },
  { cells: ['R1C1', 'R1C2', 'R2C2', 'R2C3'], circle: 'R1C1' },
  { cells: ['R2C1', 'R2C4', 'R3C1', 'R3C2', 'R3C3', 'R3C4'], circle: 'R2C1' },
  { cells: ['R1C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R4C5'], circle: 'R4C5' },
  { cells: ['R4C2', 'R4C3', 'R4C4', 'R5C3', 'R5C4'], circle: 'R4C4' },
  { cells: ['R4C1', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R6C3'], circle: null },
  { cells: ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C9', 'R6C7'], circle: 'R5C7' },
  { cells: ['R5C8', 'R6C8', 'R6C9', 'R7C7', 'R7C8'], circle: null },
  { cells: ['R7C9', 'R8C9', 'R9C8', 'R9C9'], circle: null },
  { cells: ['R5C5', 'R5C6', 'R6C4', 'R6C5'], circle: null },
  { cells: ['R6C6', 'R7C5', 'R7C6', 'R8C6'], circle: null },
  { cells: ['R7C3', 'R7C4', 'R8C4', 'R9C4'], circle: null },
  { cells: ['R7C1', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'], circle: null },
];

const cageAllDifferent = cages.map(({ cells }) => new AllDifferent(...cells));

// Running difference (coral digits positive, water digits negative) over
// one cage; accept only when it returns to 0. maxDepth bounds state
// creation at twice the largest cage (7 cells -> 14 digit/shade symbols).
const balanceMachine = NFA.encodeSpec({
  startState: { phase: 'digit', diff: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'shade', diff: state.diff, pending: value };
    }
    const delta = value === CORAL ? state.pending : -state.pending;
    return { phase: 'digit', diff: state.diff + delta };
  },
  accept: (state) => state.phase === 'digit' && state.diff === 0,
  maxDepth: 14,
}, 9);
const interleaveShade = cells => cells.flatMap(cell => [cell, shade.at(cell)]);
const cageBalance = cages.map(
  ({ cells }) => new NFA(balanceMachine, 'coral-water-balance',
    ...interleaveShade(cells)));

// Circle count: reads the circle's target digit, then its own shade (the
// reference colour, counted once for itself), then every other cage cell's
// shade, incrementing on a match (clamped at target+1 to bound state).
const countMachine = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    if (state.phase === 'target') {
      return { phase: 'ref', target: value };
    }
    if (state.phase === 'ref') {
      return { phase: 'count', target: state.target, ref: value, count: 1 };
    }
    const hit = value === state.ref ? 1 : 0;
    return {
      phase: 'count', target: state.target, ref: state.ref,
      count: Math.min(state.count + hit, state.target + 1),
    };
  },
  accept: (state) => state.phase === 'count' && state.count === state.target,
  maxDepth: 8,
}, 9);
const circleCounts = cages
  .filter(({ circle }) => circle)
  .map(({ cells, circle }) => {
    const rest = cells.filter(cell => cell !== circle);
    return new NFA(countMachine, 'circle-colour-count',
      circle, shade.at(circle), ...shade.at(rest));
  });

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new Given('R9C2', 5),
  new ConnectedValues('VS', CORAL),
  noMono2x2,
  ...cageAllDifferent,
  ...cageBalance,
  ...circleCounts,
];
