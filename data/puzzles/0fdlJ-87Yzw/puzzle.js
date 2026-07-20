// Title: Overlooked
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=0fdlJ-87Yzw
// Source: https://sudokupad.app/7t1yva729p

// Each square scans four separate rays. Smaller digits are visible and count
// down its quota until the first larger digit blocks that ray.
const sightlineSpec = NFA.encodeSpec({
  startState: { target: null, quota: null, blocked: false },
  transition: ({ target, quota, blocked }, value) => {
    if (value === SEGMENT_BREAK) {
      return target === null ? undefined : { target, quota, blocked: false };
    }
    if (target === null) return { target: value, quota: value, blocked: false };
    if (blocked) return { target, quota, blocked };
    if (value > target) return { target, quota, blocked: true };
    if (quota === 0) return undefined;
    return { target, quota: quota - 1, blocked: false };
  },
  accept: ({ quota }) => quota === 0,
}, 9, { multiSegment: true });

const renbanLines = [
  ['R5C2', 'R5C3', 'R5C4', 'R5C5'],
  ['R3C1', 'R4C1', 'R4C2'],
  ['R6C1', 'R7C1'],
  ['R7C6', 'R8C6'],
  ['R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R3C2', 'R3C3'],
  ['R7C2', 'R8C3', 'R9C4', 'R9C5', 'R8C5'],
  ['R5C8', 'R6C9', 'R7C9', 'R8C9', 'R9C8'],
];
const squareCells = ['R5C1', 'R5C6', 'R3C8', 'R2C5', 'R8C4', 'R8C7'];
const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const graph = cellGraph('9x9');

const sightlines = squareCells.map(origin => new NFA(
  sightlineSpec,
  'orthogonal sight count',
  [origin],
  ...directions
    .map(([dRow, dCol]) => graph.ray(origin, dRow, dCol).slice(1))
    .filter(ray => ray.length),
));

return [
  new Shape('9x9'),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...sightlines,
];
