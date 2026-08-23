// Title: Cornered Colors
// Author: Leonhard Kohl-Lorting
// Video: https://www.youtube.com/watch?v=lGz8_HhoecU
// Source: https://sudokupad.app/bmh85ce33k

// Normal sudoku applies. Each cage has distinct digits and a signed total:
// shaded digits add and unshaded digits subtract. Shading follows the native
// YinYang constraint.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// The drawn cage cells and their printed signed totals.
const cages = [
  [14, ['R2C7', 'R2C8', 'R3C8', 'R4C8']],
  [7, ['R1C2', 'R2C1', 'R2C2']],
  [-7, ['R8C1', 'R8C2', 'R9C2']],
  [7, ['R8C8', 'R8C9', 'R9C8']],
  [16, ['R5C7', 'R6C7', 'R7C7']],
  [7, ['R4C6', 'R4C7']],
  [27, ['R5C5', 'R5C6', 'R6C5', 'R7C5', 'R8C5']],
  [7, ['R7C3', 'R7C4']],
  [7, ['R5C4', 'R6C4']],
  [5, ['R3C1', 'R3C2', 'R3C3']],
  [3, ['R3C4', 'R3C5']],
  [16, ['R4C2', 'R4C3', 'R4C4']],
  [5, ['R6C8', 'R6C9']],
  [5, ['R1C3', 'R2C3']],
  [4, ['R8C6', 'R8C7', 'R9C7']],
  [2, ['R5C3', 'R6C3']],
];

// Read each cage as digit, shade, digit, shade. The NFA's running total adds
// a digit for SHADED and subtracts it for UNSHADED.
function signedCage(total, cells) {
  const machine = NFA.encodeSpec({
    startState: { sum: 0, stage: 'digit' },
    transition: ({ sum, stage, digit }, value) => {
      if (stage === 'digit') return { sum, stage: 'shade', digit: value };
      const next = sum + (value === SHADED ? digit : -digit);
      return { sum: next, stage: 'digit' };
    },
    accept: ({ sum, stage }) => stage === 'digit' && sum === total,
    // Each cage stream has exactly two symbols per cage cell.
    maxDepth: cells.length * 2,
  }, 9);
  const stream = cells.flatMap(cell => [cell, shade.at(cell)]);
  return new NFA(machine, `signed ${total} cage`, ...stream);
}

return [
  new Shape('9x9'),
  new YinYang(),
  ...cages.flatMap(([total, cells]) => [
    new AllDifferent(...cells),
    signedCage(total, cells),
  ]),
];
