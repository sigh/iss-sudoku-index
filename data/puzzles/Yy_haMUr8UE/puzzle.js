// Title: Dutch Flat Mates: Pick-up Sticks
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=Yy_haMUr8UE
// Source: https://sudokupad.app/pc6ejr0nze

// Stick order follows the drawing layers, from bottom to top. A later stick is
// above an earlier stick wherever they cross.
const sticks = [
  ['R6C4', 'R5C4', 'R4C4'],
  ['R4C4', 'R5C5'],
  ['R5C5', 'R4C6'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R1C4', 'R2C4', 'R3C4'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R2C1', 'R2C2'],
  ['R3C1', 'R2C1', 'R1C1'],
  ['R1C1', 'R1C2', 'R1C3'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R7C2', 'R8C2', 'R9C2'],
  ['R7C1', 'R7C2', 'R7C3'],
  ['R8C4', 'R8C5'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R7C4', 'R7C5', 'R7C6'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R3C9', 'R2C9', 'R1C9'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R3C7', 'R2C7', 'R1C7'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R6C7', 'R5C7', 'R4C7'],
  ['R6C9', 'R5C9', 'R4C9'],
  ['R4C7', 'R4C8', 'R4C9'],
  ['R8C7', 'R7C7'],
  ['R9C9', 'R8C9'],
  ['R7C9', 'R7C8', 'R7C7'],
  ['R8C7', 'R8C8', 'R8C9'],
  ['R9C7', 'R9C8', 'R9C9'],
];

const dutchWhispers = [0, 1, 2].map(i =>
  new Whisper(4, ...sticks[i]));
const entropicSticks = [9, 10].map(i => new Entropic(...sticks[i]));
const modularSticks = [11].map(i => new Modular(3, ...sticks[i]));
const renbanSticks = [6, 7, 8].map(i => new Renban(...sticks[i]));

const alternatingParityKey = Pair.fnToKey(
  (a, b) => (a % 2) !== (b % 2), 9);
const paritySticks = [3, 14, 15, 16].map(i =>
  new Pair(alternatingParityKey, 'parity stick', ...sticks[i]));

// Each pair is [lower stick, upper stick], determined by their visible drawing
// order at a crossing. Stick indices refer to the literal above.
const stacking = [
  [0, 1], [1, 2], [2, 3], [4, 5], [6, 7], [7, 8],
  [9, 10], [11, 12], [13, 16], [14, 16], [15, 16], [17, 18],
  [17, 20], [18, 19], [19, 20], [21, 22], [21, 23], [22, 24],
  [23, 24], [25, 27], [25, 28], [26, 28], [26, 29],
];

function lowerTotal(lower, upper) {
  // Scan the lower stick and then the upper stick. The final difference is
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
  new Given('R2C3', 2),
  new DutchFlatmates(),
  ...dutchWhispers,
  ...entropicSticks,
  ...modularSticks,
  ...renbanSticks,
  ...paritySticks,
  ...stackingTotals,
];
