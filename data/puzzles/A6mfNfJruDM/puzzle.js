// Title: Low Tide
// Author: Schwupel
// Video: https://www.youtube.com/watch?v=A6mfNfJruDM
// Source: https://app.crackingthecryptic.com/gmgD4L8pF4

// Normal Sudoku applies. Adjacent digits on each green line differ by at least
// 5. Every outlined cage has equal low/high and even/odd counts; it permits
// repeats and excludes 5.

const GREEN_LINES = [
  ['R1C5', 'R2C6', 'R1C6', 'R2C5', 'R1C4', 'R2C3'],
  ['R4C7', 'R3C7', 'R4C8'],
  ['R7C4', 'R6C4', 'R7C5'],
  ['R4C2', 'R3C3', 'R4C4'],
  ['R5C2', 'R6C3'],
];

// Outlined cage cell lists transcribed from the drawing.
const CAGES = [
  ['R2C8', 'R2C9', 'R3C9', 'R4C9'],
  ['R6C7', 'R6C8', 'R6C9', 'R7C7', 'R7C8', 'R7C9'],
  ['R6C1', 'R7C1'],
  ['R7C3', 'R7C4', 'R7C5', 'R8C2', 'R8C3', 'R9C3'],
  ['R8C5', 'R9C5'],
  ['R8C6', 'R9C6'],
  ['R9C8', 'R9C9'],
  ['R8C7', 'R8C8'],
  ['R4C3', 'R4C4'],
  ['R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
];

// State counts low (1-4) and even digits. A transition rejects 5 and any
// count already above half the cage; the final state requires both halves.
function balancedCageNFA(size) {
  const half = size / 2;
  return NFA.encodeSpec({
    startState: { low: 0, even: 0 },
    transition: ({ low, even }, value) => {
      if (value === 5) return undefined;
      const nextLow = low + (value <= 4 ? 1 : 0);
      const nextEven = even + (value % 2 === 0 ? 1 : 0);
      if (nextLow > half || nextEven > half) return undefined;
      return { low: nextLow, even: nextEven };
    },
    accept: ({ low, even }) => low === half && even === half,
  }, 9);
}

const cages = CAGES.map(cells =>
  cells.length === 2
    ? new Pair(
      Pair.fnToKey((a, b) =>
        a !== 5 && b !== 5 &&
        (a <= 4) !== (b <= 4) &&
        (a % 2 === 0) !== (b % 2 === 0),
      9),
      'balanced cage',
      ...cells
    )
    : new NFA(balancedCageNFA(cells.length), 'balanced cage', ...cells)
);

return [
  new Shape('9x9'),
  new Given('R5C3', 1),
  new Given('R7C8', 8),
  ...GREEN_LINES.map(cells => new Whisper(5, ...cells)),
  ...cages,
];
