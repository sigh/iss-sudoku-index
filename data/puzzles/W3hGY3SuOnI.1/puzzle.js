// Title: Killer Global Entropy
// Author: Enchanter73
// Video: https://www.youtube.com/watch?v=W3hGY3SuOnI
// Source: https://sudokupad.app/fd6onhy5dj

// 6x6 global entropy: every 2x2 window contains at least one digit from each
// band {1,2}, {3,4}, and {5,6}. The built-in GlobalEntropy is 9x9-specific.
const graph = cellGraph('6x6');

const bandOf = digit => (digit - 1) >> 1;
const ALL_BANDS = 0b111;
const entropyWindow = NFA.encodeSpec({
  startState: { seen: 0, count: 0 },
  transition: ({ seen, count }, digit) => {
    const nextCount = count + 1;
    if (nextCount > 4) return undefined;
    return {
      seen: seen | (1 << bandOf(digit)),
      count: nextCount,
    };
  },
  accept: ({ seen, count }) => count === 4 && seen === ALL_BANDS,
}, 6);

const entropyConstraints = Array.from(graph.cells())
  .map(cell => {
    const block = graph.block(cell, 2, 2);
    return block ? new NFA(entropyWindow, 'entropy 2x2', ...block) : null;
  })
  .filter(c => c !== null);

const cages = [
  new Cage(7, 'R1C1', 'R2C1'),
  new Cage(13, 'R4C2', 'R5C2', 'R6C2'),
  new Cage(14, 'R1C4', 'R2C4', 'R3C4'),
  new Cage(9, 'R4C6', 'R5C6'),
  new Cage(6, 'R6C3', 'R6C4'),
];

return [
  new Shape('6x6'),
  ...entropyConstraints,
  ...cages,
];
