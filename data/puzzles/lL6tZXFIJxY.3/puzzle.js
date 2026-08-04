// Title: Three in a Row Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=lL6tZXFIJxY
// Source: https://tinyurl.com/y6n986a2

// Normal 9x9 sudoku (row/column/box all-different) is the ISS default.
// No three contiguous row/column cells may share parity: an NFA scans each
// row and column, retaining the parity and a same-parity run length capped
// at two. A third cell of that parity rejects the branch.

const GIVENS = [
  // Given digits, from the grid payload.
  ['R1C1', 1], ['R1C2', 3],
  ['R2C1', 5], ['R2C2', 7], ['R2C7', 8], ['R2C8', 6],
  ['R3C4', 3], ['R3C8', 4],
  ['R4C3', 3], ['R4C4', 1], ['R4C5', 6], ['R4C7', 5],
  ['R5C4', 8], ['R5C5', 9],
  ['R7C2', 6], ['R7C4', 7], ['R7C7', 3], ['R7C8', 5],
  ['R8C2', 8], ['R8C3', 2], ['R8C7', 7], ['R8C8', 1],
];
const givens = GIVENS.map(([cell, value]) => new Given(cell, value));

// State encodes parity*10 + same-parity run length; -1 is the empty scan.
const noTripleParitySpec = NFA.encodeSpec({
  startState: -1,
  transition: (state, value) => {
    const parity = value % 2;
    if (state === -1) return parity * 10 + 1;
    const previousParity = Math.floor(state / 10);
    const runLength = state % 10;
    if (parity === previousParity) {
      const nextRunLength = runLength + 1;
      return nextRunLength >= 3 ? undefined : parity * 10 + nextRunLength;
    }
    return parity * 10 + 1;
  },
  accept: () => true,
}, 9);
const graph = cellGraph('9x9');
const noTripleParity = [
  ...graph.rows().map(
    (cells, index) => new NFA(noTripleParitySpec, `row ${index + 1} parity`, ...cells)),
  ...graph.columns().map(
    (cells, index) => new NFA(noTripleParitySpec, `col ${index + 1} parity`, ...cells)),
];

return [
  new Shape('9x9'),
  ...givens,
  ...noTripleParity,
];
