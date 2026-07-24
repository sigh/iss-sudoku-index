// Title: Sunblock
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=wmd78ZbRXrI
// Source: https://sudokupad.app/yeb6vd8pem

// Chaos Construction: the solver partitions the grid into nine orthogonally
// connected 9-cell regions, each containing every digit once (ChaosConstruction
// handles size/connectivity/all-different and non-overlap is inherent to a
// one-label-per-cell partition). NoBoxes drops the default 3x3 boxes, which
// this variant does not use.
//
// Suns: the digit in a sun cell counts how many of the up to nine cells in the
// 3x3 square centred on it (including itself) share its region. Modelled as
// one NFA per sun scanning [sun's own digit, sun's own CC label, each in-grid
// king-move neighbour's CC label]: the second symbol fixes the region to match
// (self always counts, hence starting count at 1), each further symbol adds a
// hit when it matches, and accept requires the final count to equal the digit.
// Window size varies (4 at a corner, 6 on an edge, 9 in the interior); the
// rule text's own example (R4C1, a left-edge sun) confirms the 6-cell window.

const SUN_CELLS = [
  'R1C6',
  'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C9',
  'R3C3', 'R3C4', 'R3C5',
  'R4C1', 'R4C4', 'R4C6', 'R4C9',
  'R5C8',
  'R6C1', 'R6C2', 'R6C3', 'R6C8',
  'R7C1', 'R7C2', 'R7C3', 'R7C5', 'R7C6',
  'R8C5', 'R8C9',
  'R9C3',
];

// State: {digit, regionTarget, count}. The first symbol sets digit (the
// count to match); the second sets regionTarget (the sun's own CC label) and
// seeds count at 1 for the trivially-matching sun cell itself; every further
// symbol is a king-move neighbour's CC label, incrementing count on a match
// and clamping at the sink digit+1 once the count can only fail.
const sunCountSpec = {
  startState: 'start',
  transition(state, value) {
    if (state === 'start') return { digit: value, regionTarget: null, count: 0 };
    if (state.regionTarget === null) {
      return { digit: state.digit, regionTarget: value, count: 1 };
    }
    const hit = value === state.regionTarget ? 1 : 0;
    const count = Math.min(state.count + hit, state.digit + 1);
    return { digit: state.digit, regionTarget: state.regionTarget, count };
  },
  accept: (state) => state.regionTarget !== null && state.count === state.digit,
};
const sunCountNFA = NFA.encodeSpec(sunCountSpec, 9);

const grid = cellGraph('9x9');
const cc = grid.makeOverlay('CC');

const sunConstraints = SUN_CELLS.map(cell => new NFA(
  sunCountNFA, 'SunCount',
  cell, cc.at(cell), ...cc.at(grid.kingNeighbours(cell)),
));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  new Given('R5C5', 9),
  ...sunConstraints,
];
