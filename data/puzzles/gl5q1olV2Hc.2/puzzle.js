// Title: Four Pairs Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=gl5q1olV2Hc
// Source: https://tinyurl.com/3ct5y5pm

// Normal Sudoku rules apply. Each coloured eight-cell path has four distinct
// digits, with each of those four digits occurring exactly twice.
const givens = [
  ['R1C1', 1], ['R1C3', 2], ['R1C6', 8], ['R1C7', 5], ['R1C8', 6], ['R1C9', 7],
  ['R2C1', 3], ['R2C7', 8], ['R3C2', 4], ['R7C8', 1], ['R8C3', 5], ['R8C9', 2],
  ['R9C1', 6], ['R9C2', 7], ['R9C3', 8], ['R9C4', 5], ['R9C7', 3], ['R9C9', 4],
].map(([cell, value]) => new Given(cell, value));

// The NFA records the distinct digits seen once and twice; a third occurrence
// or a fifth distinct digit has no transition. Four completed pairs accept.
const fourPairs = NFA.encodeSpec({
  startState: { once: '', twice: '' },
  transition: ({ once, twice }, value) => {
    const digit = String(value);
    if (twice.includes(digit)) return undefined;
    if (once.includes(digit)) {
      return { once: once.replace(digit, ''), twice: [...twice, digit].sort().join('') };
    }
    if (once.length + twice.length === 4) return undefined;
    return { once: [...once, digit].sort().join(''), twice };
  },
  accept: ({ once, twice }) => once === '' && twice.length === 4,
  maxDepth: 8,
}, 9);

// The paths are transcribed from the four coloured lines.
const paths = [
  ['R8C1', 'R8C2', 'R7C2', 'R7C3', 'R6C3', 'R6C4', 'R5C4', 'R5C5'],
  ['R9C8', 'R8C8', 'R8C7', 'R7C7', 'R7C6', 'R6C6', 'R6C5', 'R5C5'],
  ['R2C9', 'R2C8', 'R3C8', 'R3C7', 'R4C7', 'R4C6', 'R5C6', 'R5C5'],
  ['R1C2', 'R2C2', 'R2C3', 'R3C3', 'R3C4', 'R4C4', 'R4C5', 'R5C5'],
];

return [
  new Shape('9x9'),
  ...givens,
  ...paths.map((path) => new NFA(fourPairs, 'four pairs', path)),
];
