// Title: Product Distribution Network
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=RapTaXSMa-w
// Source: https://sudokupad.app/uyakkp4064

// Normal Sudoku applies. On each teal production line between consecutive white
// endpoint squares, the intervening digits sum to the product of the endpoint
// digits; endpoints are excluded from the sum, and repeated line digits are allowed.
// The cell lists below are transcribed from the teal routes and white endpoint squares.
const lines = [
  ['R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R3C7', 'R2C8', 'R2C7'],
  ['R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2'],
  ['R7C2', 'R8C2', 'R8C3', 'R7C3', 'R7C2'],
  ['R6C8', 'R6C7', 'R7C6', 'R8C6'],
  ['R8C6', 'R8C5', 'R8C4', 'R7C4', 'R6C3'],
  ['R6C3', 'R5C3', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7'],
  ['R5C6', 'R6C5', 'R6C4', 'R5C5'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R7C8', 'R7C7', 'R8C7', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'],
  ['R9C2', 'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R8C8', 'R8C9', 'R9C9', 'R9C8', 'R8C8'],
];

// The machine remembers the first endpoint, the prior interior digit, and the
// bounded interior sum. On the final digit, acceptance compares that sum with
// the product of the two endpoints. A sum above nine times the first endpoint
// cannot be repaired by the final endpoint and is rejected immediately.
const productionLine = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    if (state === null) return { first: value, previous: null, sum: 0 };
    if (state.previous === null) return { first: state.first, previous: value, sum: 0 };
    const sum = state.sum + state.previous;
    if (sum > state.first * 9) return undefined;
    return { first: state.first, previous: value, sum };
  },
  accept: state => state !== null && state.previous !== null && state.sum === state.first * state.previous,
}, 9);

return [
  new Shape('9x9'),
  ...lines.map((cells, index) => new NFA(productionLine, `production line ${index + 1}`, ...cells)),
];
