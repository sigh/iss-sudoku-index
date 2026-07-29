// Title: Four Sided Calcunundrum
// Author: Paws
// Video: https://www.youtube.com/watch?v=UXqsaS7K40Q
// Source: https://app.crackingthecryptic.com/430df4fh2w

// Normal Sudoku rules apply. In every labelled 2x2, its diagonal pairs have
// equal sums, positive differences, products, or larger/smaller quotients; a
// numeric prefix requires each pair's value to equal that number.

// This NFA reads the diagonals as top-left, bottom-right, top-right, bottom-left.
// It remembers the first diagonal's operation value and compares it after the
// second diagonal has been read.
function fourSided(operation, target) {
  return NFA.encodeSpec({
    startState: { first: null, value: null, third: null, done: false },
    transition: (state, digit) => {
      if (state.first === null) return { ...state, first: digit };
      if (state.value === null) {
        const value = operation(state.first, digit);
        if (target !== null && value !== target) return undefined;
        return { ...state, value };
      }
      if (state.third === null) return { ...state, third: digit };
      const value = operation(state.third, digit);
      return (value === state.value && (target === null || value === target))
        ? { ...state, done: true }
        : undefined;
    },
    accept: state => state.done,
    maxDepth: 4,
  }, 9);
}

const add = (a, b) => a + b;
const subtract = (a, b) => Math.abs(a - b);
const multiply = (a, b) => a * b;
const divide = (a, b) => Math.max(a, b) / Math.min(a, b);

// Transcribed from the operation labels centred on the drawn 2x2 squares.
const clues = [
  [divide, 2, 'R1C5'],
  [subtract, null, 'R2C2'], [multiply, null, 'R2C7'],
  [add, null, 'R3C4'],
  [add, 12, 'R4C1'], [multiply, null, 'R4C5'],
  [multiply, null, 'R5C4'], [add, 13, 'R5C6'],
  [subtract, 4, 'R6C3'], [add, 11, 'R6C5'],
  [subtract, 2, 'R7C2'], [subtract, 2, 'R7C4'],
  [divide, 2, 'R8C1'], [divide, 2, 'R8C7'],
];

const constraints = clues.map(([operation, target, topLeft]) => {
  const { row, col } = parseCellId(topLeft);
  const tl = makeCellId(row, col);
  const br = makeCellId(row + 1, col + 1);
  const tr = makeCellId(row, col + 1);
  const bl = makeCellId(row + 1, col);
  return new NFA(fourSided(operation, target), '', tl, br, tr, bl);
});

return [
  new Shape('9x9'),
  ...constraints,
];
