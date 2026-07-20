// Title: Harmonic Split
// Author: gdc
// Video: https://www.youtube.com/watch?v=m8Y1iTGkB50
// Source: https://sudokupad.app/pzyl7pacx7

// Shade state is 1 for light and 2 for dark. A contribution layer stores zero
// for light cells and the digit for dark cells, so digit + contribution is the
// ordinary digit or twice the digit.
const LIGHT = 1;
const DARK = 2;

// The zero-based auxiliary range is needed for the dark-cell contribution.
// Sixteen values is ISS's maximum; the puzzle itself remains digit 1-9.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shade = graph.makeOverlay('VS');
const contribution = graph.makeOverlay('VC');

// These are the seven drawn lines, split at their white dots. Each nested pair
// is [segment before the dot, segment after the dot].
const splitLines = [
  [
    ['R1C8', 'R1C9', 'R2C9'],
    ['R3C9', 'R3C8', 'R3C7', 'R4C6', 'R3C5', 'R2C5', 'R1C6', 'R1C7', 'R2C7'],
  ],
  [
    ['R1C5', 'R1C4'],
    ['R2C3', 'R3C2', 'R4C3', 'R4C4', 'R4C5', 'R3C4'],
  ],
  [
    ['R8C6'],
    ['R7C7', 'R6C8', 'R5C8', 'R4C8', 'R5C9'],
  ],
  [
    ['R5C5'],
    ['R5C6'],
  ],
  [
    ['R6C5'],
    ['R7C4', 'R7C3', 'R8C2'],
  ],
  [
    ['R7C2'],
    ['R6C1', 'R5C2', 'R5C3'],
  ],
  [
    ['R7C8'],
    ['R8C8', 'R8C7', 'R9C7', 'R9C6'],
  ],
];

// One small machine enforces contribution = (dark ? digit : 0).
const contributionMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      if (value < 1 || value > 9) return undefined;
      return { phase: 'shade', digit: value };
    }
    if (state.phase === 'shade') {
      if (value !== LIGHT && value !== DARK) return undefined;
      return {
        phase: 'contribution',
        value: value === DARK ? state.digit : 0,
      };
    }
    return value === state.value ? { phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, geometry);

const contributions = gridCells.map(cell => new NFA(
  contributionMachine,
  'dark-contribution',
  cell,
  shade.at(cell),
  contribution.at(cell),
));

// Every 2x2 contains both colours. The NFA rejects exactly the two monochrome
// assignments and is replicated over all 64 block origins.
const noMonochrome2x2Machine = NFA.encodeSpec({
  startState: { first: 0, count: 0, differs: false },
  transition: ({ first, count, differs }, value) => {
    if (value !== LIGHT && value !== DARK) return undefined;
    if (count >= 4) return undefined;
    if (count === 0) return { first: value, count: 1, differs: false };
    return { first, count: count + 1, differs: differs || value !== first };
  },
  accept: ({ count, differs }) => count === 4 && differs,
}, geometry);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMonochrome2x2 = shade.makeReplicate(
  new NFA(
    noMonochrome2x2Machine,
    'no-monochrome-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2)),
  ),
  shade.at(blockOrigins),
);

const segmentRules = splitLines.flatMap(segments => [
  // Each effective sum is the sum of the segment's digits and contributions.
  new EqualSum(...segments.map(segment =>
    segment.flatMap(cell => [cell, contribution.at(cell)]))),
  // Values may repeat, but the underlying Sudoku digits may not repeat within
  // either segment.
  ...segments.filter(segment => segment.length > 1)
    .map(segment => new AllDifferent(...segment)),
]);

return [
  shape,
  // Widening is only for auxiliary effective values; playable cells stay 1-9.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  shade.toVar('light-dark shade'),
  contribution.toVar('dark contribution'),
  shade.makeReplicate(new Given(shade.cells()[0], LIGHT, DARK)),
  new ConnectedValues('VS', LIGHT),
  new ConnectedValues('VS', DARK),
  noMonochrome2x2,
  ...contributions,
  ...segmentRules,
];
