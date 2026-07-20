// Title: Lighthouses
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=olOzzZCfIhI
// Source: https://sudokupad.app/cn5h6c34mo

// Each lighthouse counts visible smaller digits across four independent rays.
// A larger digit blocks the remainder of its ray. Row/column uniqueness means
// an equal digit cannot occur on any lighthouse ray.
const lighthouseMachine = NFA.encodeSpec({
  startState: { target: 0, total: 0, blocked: false },
  transition: ({ target, total, blocked }, value) => {
    if (value === SEGMENT_BREAK) {
      return { target, total, blocked: false };
    }
    if (target === 0) {
      return { target: value, total: 0, blocked: false };
    }
    if (blocked) return { target, total, blocked: true };
    if (value > target) return { target, total, blocked: true };
    const nextTotal = total + 1;
    if (nextTotal > target) return undefined;
    return { target, total: nextTotal, blocked: false };
  },
  accept: ({ target, total }) => target !== 0 && total === target,
}, 9, { multiSegment: true });

const rayFrom = (origin, rowStep, colStep) => {
  const { row, col } = parseCellId(origin);
  const cells = [];
  for (let r = row + rowStep, c = col + colStep;
       r >= 1 && r <= 9 && c >= 1 && c <= 9;
       r += rowStep, c += colStep) {
    cells.push(makeCellId(r, c));
  }
  return cells;
};

const lighthouse = (origin) => new NFA(
  lighthouseMachine,
  'lighthouse',
  [origin],
  rayFrom(origin, -1, 0),
  rayFrom(origin, 0, 1),
  rayFrom(origin, 1, 0),
  rayFrom(origin, 0, -1),
);

const lighthouseCells = [
  'R1C1', 'R1C2', 'R1C3', 'R1C8',
  'R3C5', 'R4C4',
  'R5C1', 'R5C3', 'R6C1', 'R6C3',
  'R7C5', 'R7C8',
];

const blackDots = [
  ['R1C5', 'R1C6'],
  ['R2C7', 'R2C8'],
  ['R3C2', 'R3C3'],
  ['R5C4', 'R6C4'],
  ['R8C1', 'R8C2'],
];

return [
  new Shape('9x9'),
  new Given('R8C8', 1),
  new Given('R8C9', 8),
  ...lighthouseCells.map(lighthouse),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
