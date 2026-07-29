// Title: Spread
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=x793CREN40E
// Source: https://sudokupad.app/0m0zb2b86m

// Normal Sudoku rules apply. Each double-arrow segment has a total equal to
// the sum of its two circled endpoints; intermediate circles split a continuous
// stroke into separate segments. Each marked 2x2 product square has equal
// products on its two diagonals; unmarked squares are unrestricted.

const doubleArrows = [
  ['R6C3', 'R7C3', 'R7C2'],
  ['R7C5', 'R7C4', 'R6C4'],
  ['R6C4', 'R5C4', 'R5C3'],
  ['R5C3', 'R4C3', 'R4C2'],
  ['R4C2', 'R5C2', 'R5C1'],
  ['R4C6', 'R5C6', 'R5C7'],
  ['R3C9', 'R4C9', 'R4C8'],
  ['R4C8', 'R5C8', 'R5C9'],
  ['R9C6', 'R8C6', 'R8C7'],
  ['R8C7', 'R7C7', 'R7C8'],
  ['R2C4', 'R3C4', 'R3C5'],
  ['R1C6', 'R2C6', 'R1C7'],
  ['R3C7', 'R2C8', 'R3C8'],
];

// Drawn product-square X marks, transcribed as each 2x2 block in row-major
// order: top-left, top-right, bottom-left, bottom-right.
const productSquares = [
  ['R5C3', 'R5C4', 'R6C3', 'R6C4'],
  ['R6C2', 'R6C3', 'R7C2', 'R7C3'],
  ['R4C6', 'R4C7', 'R5C6', 'R5C7'],
  ['R3C8', 'R3C9', 'R4C8', 'R4C9'],
  ['R8C3', 'R8C4', 'R9C3', 'R9C4'],
  ['R7C3', 'R7C4', 'R8C3', 'R8C4'],
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9'],
];

// The NFA reads a product square row-major. It stores the first three digits,
// then accepts the fourth exactly when top-left * bottom-right equals
// top-right * bottom-left.
const productSquareNFA = NFA.encodeSpec({
  startState: { phase: 'topLeft' },
  transition: (state, value) => {
    if (state.phase === 'topLeft') return { phase: 'topRight', topLeft: value };
    if (state.phase === 'topRight') return {
      phase: 'bottomLeft', topLeft: state.topLeft, topRight: value,
    };
    if (state.phase === 'bottomLeft') return {
      phase: 'bottomRight', topLeft: state.topLeft, topRight: state.topRight,
      bottomLeft: value,
    };
    return state.topLeft * value === state.topRight * state.bottomLeft
      ? { phase: 'done' }
      : undefined;
  },
  accept: state => state.phase === 'done',
  maxDepth: 4,
}, 9);

return [
  new Shape('9x9'),
  ...doubleArrows.map(cells => new DoubleArrow(...cells)),
  ...productSquares.map(cells => new NFA(productSquareNFA, 'product-square', ...cells)),
];
