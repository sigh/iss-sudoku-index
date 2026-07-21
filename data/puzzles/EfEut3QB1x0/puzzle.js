// Title: Revivify
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=EfEut3QB1x0
// Source: https://sudokupad.app/e9455aftlh

// Blue-line segments have equal sums. Outside segments contain Hitpoints
// clues: a cell at distance d contributes d exactly when its digit is d.

const graph = cellGraph('9x9');

const hitRay = name => {
  const side = name[0];
  const index = Number(name.slice(1));
  if (side === 'L') return graph.row(index);
  if (side === 'R') return graph.row(index).toReversed();
  if (side === 'T') return graph.column(index);
  if (side === 'B') return graph.column(index).toReversed();
  throw new Error(`Unknown Hitpoints clue: ${name}`);
};

// Compare one in-grid segment with one outside segment. The first NFA segment
// accumulates the in-grid target; each later segment is one Hitpoints ray.
const hitpointLineSum = (targetCells, clueNames) => {
  const rays = clueNames.map(hitRay);
  const maxDepth = targetCells.length +
    rays.reduce((total, ray) => total + ray.length, 0) + rays.length;
  const spec = NFA.encodeSpec({
    startState: {phase: 0, remaining: 0, position: 0, distance: 0},
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        if (state.phase === 0 && state.position !== targetCells.length) {
          return undefined;
        }
        return {phase: 1, remaining: state.remaining, position: 0, distance: 0};
      }
      if (state.phase === 0) {
        if (state.position === targetCells.length) return undefined;
        return {
          ...state,
          remaining: state.remaining + value,
          position: state.position + 1,
        };
      }
      const distance = state.distance + 1;
      const remaining = state.remaining - (value === distance ? value : 0);
      if (remaining < 0) return undefined;
      return {phase: 1, remaining, position: 0, distance};
    },
    accept: state => state.phase === 1 && state.remaining === 0,
    maxDepth,
  }, 9, {multiSegment: true});
  return new NFA(spec, 'Hitpoints line sum', targetCells, ...rays);
};

const line1Grid = ['R3C1', 'R3C2', 'R2C2', 'R2C1'];
const line2Grid = ['R2C9', 'R3C9'];
const line4Grid = [
  ['R6C5'],
  ['R7C5', 'R7C4', 'R8C4'],
  ['R9C3'],
];
const line6Grid = ['R8C3', 'R8C2', 'R7C2', 'R7C1'];

return [
  new Shape('9x9'),

  // Line 1: left R4 / grid / left R1 plus top C1-C5.
  hitpointLineSum(line1Grid, ['L4']),
  hitpointLineSum(line1Grid, ['L1', 'T1', 'T2', 'T3', 'T4', 'T5']),

  // Line 2: top C6-C9 plus right R1 / grid / right R4.
  hitpointLineSum(line2Grid, ['T6', 'T7', 'T8', 'T9', 'R1']),
  hitpointLineSum(line2Grid, ['R4']),

  // Lines 3 and 5 remain entirely inside the grid.
  new EqualSum(['R3C7'], ['R4C8', 'R5C8']),
  new EqualSum(
    ['R9C5', 'R8C6'],
    ['R9C7', 'R8C8', 'R7C9']),

  // Line 4 has three in-grid segments and bottom clues C4-C6.
  new EqualSum(...line4Grid),
  hitpointLineSum(line4Grid[0], ['B4', 'B5', 'B6']),

  // Line 6 ends at the left clue for row 6.
  hitpointLineSum(line6Grid, ['L6']),
];
