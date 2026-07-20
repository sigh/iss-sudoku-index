// Title: Half Circles
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=7zSjY2D57PQ
// Source: https://sudokupad.app/j27rj7frco

// Multiply the circle count by two: a full circle has weight 2, a semicircle
// has weight 1, and the cells containing digit N must have total weight 2N.
const fullCircles = [
  'R3C7', 'R4C2', 'R4C5', 'R5C5', 'R5C8', 'R6C8', 'R7C3', 'R7C6',
  'R7C9', 'R8C2', 'R8C6', 'R8C9', 'R9C2', 'R9C5', 'R9C8', 'R9C9',
];
const halfCircles = [
  'R1C1', 'R1C3', 'R1C4', 'R1C6', 'R1C7', 'R2C3', 'R2C4', 'R2C6',
  'R2C7', 'R2C9', 'R3C3', 'R3C6', 'R3C9', 'R4C1', 'R4C4', 'R4C7',
  'R4C8', 'R5C1', 'R5C3', 'R5C4', 'R5C7', 'R6C1', 'R6C3', 'R6C4', 'R6C6',
  'R6C7', 'R6C9', 'R7C1', 'R7C2', 'R7C4', 'R7C5', 'R7C8', 'R8C1',
  'R8C4', 'R8C5', 'R8C7', 'R8C8', 'R9C1', 'R9C4', 'R9C7',
];

const weightedCountMachine = target => NFA.encodeSpec({
  startState: { count: 0, weight: 2 },
  transition: ({ count, weight }, value) => {
    // The segment break switches from full-circle weight to half-circle weight.
    if (value === SEGMENT_BREAK) return { count, weight: 1 };
    const next = count + weight * (value === target);
    if (next > 2 * target) return undefined;
    return { count: next, weight };
  },
  // A digit absent from all marked cells makes no assertion; otherwise its
  // marked occurrences must have the self-counting total.
  accept: ({ count }) => count === 0 || count === 2 * target,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),
  ...Array.from({ length: 9 }, (_, index) => {
    const digit = index + 1;
    return new NFA(
      weightedCountMachine(digit),
      `half-circle-${digit}`,
      fullCircles,
      halfCircles,
    );
  }),
];
