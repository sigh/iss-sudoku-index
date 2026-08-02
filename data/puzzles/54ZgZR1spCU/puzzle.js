// Title: Chaos Circles
// Author: Senator Gronk
// Video: https://www.youtube.com/watch?v=54ZgZR1spCU
// Source: https://app.crackingthecryptic.com/sudoku/9Lbt638t9N

// Rules encoded: irregular nine-cell connected regions each contain 1-9;
// circled digits count equal digits among all circles; a cage digit counts its
// own region's orthogonally visible cells, including itself. No rule is omitted.
const CIRCLES = [
  'R9C4', 'R8C4', 'R7C4', 'R5C4', 'R4C4', 'R2C4', 'R1C4', 'R7C2', 'R7C1',
  'R1C9', 'R2C9', 'R2C2', 'R2C1', 'R3C3', 'R3C5', 'R3C6', 'R3C7', 'R3C8',
  'R4C8', 'R4C9', 'R5C9', 'R5C7', 'R5C6', 'R5C5', 'R5C3', 'R4C3', 'R4C2',
  'R5C1', 'R8C1', 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R3C9', 'R3C2',
];
// Source-drawn one-cell cages.
const CAGES = [
  'R7C1', 'R7C2', 'R6C1', 'R4C2', 'R1C4', 'R2C4', 'R3C5', 'R1C9', 'R3C8',
  'R8C7', 'R8C6', 'R5C6', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4',
  'R5C7', 'R9C9',
];

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

function ray(cell, rowStep, colStep) {
  return cc.ray(cc.at(cell), rowStep, colStep).slice(1);
}

// State machine reads [cage digit, its CC label], then one directional CC ray
// per segment. It counts matching labels only until the first border on each ray.
const sightCount = NFA.encodeSpec({
  startState: { stage: 0 },
  transition(state, value) {
    if (state.stage === 0) return { stage: 1, target: value };
    if (state.stage === 1) {
      return { stage: 2, target: state.target, label: value, count: 1, open: true };
    }
    if (value === SEGMENT_BREAK) return { ...state, open: true };
    if (state.open && value === state.label) {
      return { ...state, count: Math.min(state.count + 1, state.target + 1) };
    }
    return { ...state, open: false };
  },
  accept: state => state.stage === 2 && state.count === state.target,
}, 9, { multiSegment: true });

const sightCounts = CAGES.map(cell => new NFA(
  sightCount,
  'region sight count',
  [cell, cc.at(cell)],
  ray(cell, -1, 0), ray(cell, 1, 0), ray(cell, 0, -1), ray(cell, 0, 1),
));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  new CountingCircles(...CIRCLES),
  ...sightCounts,
];
