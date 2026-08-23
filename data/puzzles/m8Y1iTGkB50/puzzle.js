// Title: Harmonic Split
// Author: gdc
// Video: https://www.youtube.com/watch?v=m8Y1iTGkB50
// Source: https://sudokupad.app/pzyl7pacx7

// Shading is native YinYang, whose two shades are the grid's two lowest
// values (this puzzle's Shape starts at 0): LIGHT=0, DARK=1. A contribution
// layer stores zero for light cells and the digit for dark cells, so
// digit + contribution is the ordinary digit or twice the digit.
const LIGHT = 0;
const DARK = 1;

// The zero-based auxiliary range is needed for the dark-cell contribution.
// Sixteen values is ISS's maximum; the puzzle itself remains digit 1-9.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shade = graph.makeOverlay('YY');
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
  new YinYang(),
  contribution.toVar('dark contribution'),
  ...contributions,
  ...segmentRules,
];
