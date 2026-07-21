// Title: Pick-up Sticks (Blue)
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=95I8TShQuNY
// Source: https://sudokupad.app/rge5pbwzk4

// Box borders split each blue stick into equal-sum segments. At every crossing,
// the lower stick has a strictly smaller total than the stick above it.

const sticks = [
  ['R6C3', 'R7C4'],
  ['R8C2', 'R7C3', 'R6C4', 'R5C5'],
  ['R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7'],
  ['R4C2', 'R3C3'],
  ['R8C6', 'R7C7'],
  ['R6C2', 'R7C3', 'R8C4'],
  ['R5C3', 'R4C4', 'R3C5', 'R2C6'],
  ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'],
  ['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'],
  ['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'],
  ['R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
];

function boxIndex(cell) {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
}

function boxSegments(cells) {
  const segments = [];
  for (const cell of cells) {
    const last = segments.at(-1);
    if (!last || boxIndex(last[0]) !== boxIndex(cell)) segments.push([]);
    segments.at(-1).push(cell);
  }
  return segments;
}

const equalSegmentSums = sticks.map(cells =>
  new EqualSum(...boxSegments(cells)));

// Each pair is [lower stick, upper stick], determined by the visible drawing
// order at a crossing. Stick indices follow the literal above.
const stacking = [
  [0, 1], [1, 2], [1, 5], [2, 3], [2, 4], [2, 6], [2, 7],
  [2, 9], [6, 8], [7, 8], [7, 11], [8, 9], [9, 10],
];

function lowerTotal(lower, upper) {
  // Scan the lower stick, then the upper stick. The final difference is
  // sum(lower) - sum(upper), which must be negative.
  const machine = NFA.encodeSpec({
    startState: { phase: 'lower', difference: 0 },
    transition: ({ phase, difference }, value) => {
      if (value === SEGMENT_BREAK) {
        return { phase: 'upper', difference };
      }
      return phase === 'lower'
        ? { phase, difference: difference + value }
        : { phase, difference: difference - value };
    },
    accept: ({ phase, difference }) =>
      phase === 'upper' && difference < 0,
    maxDepth: lower.length + upper.length + 1,
  }, 9, { multiSegment: true });
  return new NFA(machine, 'lower stick total', lower, upper);
}

const stackingTotals = stacking.map(([lower, upper]) =>
  lowerTotal(sticks[lower], sticks[upper]));

return [
  new Shape('9x9'),
  ...equalSegmentSums,
  ...stackingTotals,
];
