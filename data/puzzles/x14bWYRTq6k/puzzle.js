// Title: The Right Distance
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=x14bWYRTq6k
// Source: https://sudokupad.app/3sl8zu9gym

// A ray cell contributes one when its digit equals its distance from the
// diamond. The diamond's digit is the initial quota, so each hit counts it down.
const distanceCountSpec = NFA.encodeSpec({
  startState: { quota: null, distance: 0 },
  transition: ({ quota, distance }, value) => {
    if (quota === null) return { quota: value, distance: 0 };
    if (value === SEGMENT_BREAK) return { quota, distance: 0 };
    if (distance === 8) return undefined;

    const nextDistance = distance + 1;
    const hit = value === nextDistance;
    if (hit && quota === 0) return undefined;
    return {
      quota: quota - Number(hit),
      distance: nextDistance,
    };
  },
  accept: ({ quota }) => quota === 0,
}, 9, { multiSegment: true });

const blueDiamonds = [
  'R1C3', 'R1C4', 'R1C5', 'R1C6',
  'R1C7', 'R6C2', 'R7C1', 'R7C9',
];
const directions = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];
const graph = cellGraph('9x9');
const distanceCounts = blueDiamonds.map(origin => new NFA(
  distanceCountSpec,
  'distance count',
  [origin],
  ...directions
    .map(direction => graph.ray(origin, ...direction).slice(1))
    .filter(ray => ray.length),
));

return [
  new Shape('9x9'),
  ...distanceCounts,
  new AllDifferent(...blueDiamonds),
  new SameValues(2, 'R5C5', 'R6C8'),
];
