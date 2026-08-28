// Title: Multiplication Sudoku
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=WRtJwK4FoEA
// Source: https://cracking-the-cryptic.web.app/sudoku/3NQLDHdBBp

// Normal sudoku rules apply. Six shaded 2x2 blocks each show an accurate
// multiplication: the two top cells are the factors, and the two bottom
// cells, read left-to-right, are the tens and units digits of the product.
// Block cells are transcribed from the drawn shading (six 2x2 groups); the
// top-row/bottom-row roles come from the stated rule ("the factors in the
// top row and the product below them").

const multiplicationBlocks = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R3C3', 'R3C4', 'R4C3', 'R4C4'],
  ['R6C6', 'R6C7', 'R7C6', 'R7C7'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
];

// States: {phase:'start'} -> read factor1 -> {phase:'factor1', factor1} ->
// read factor2, compute the product -> {phase:'product', product} -> read
// the tens digit (must equal product's tens digit) -> {phase:'ones', ones}
// -> read the units digit (must equal product's units digit) -> accept.
// Digits are 1-9 (no zero), so a product under 10 has tens digit 0, which no
// cell value can match, correctly rejecting single-digit products.
function multiplicationBlockSpec() {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'start':
          return { phase: 'factor1', factor1: value };
        case 'factor1':
          return { phase: 'product', product: state.factor1 * value };
        case 'product': {
          const tens = Math.floor(state.product / 10);
          if (value !== tens) return undefined;
          return { phase: 'ones', ones: state.product % 10 };
        }
        case 'ones':
          if (value !== state.ones) return undefined;
          return { phase: 'accept' };
      }
    },
    accept: state => state.phase === 'accept',
  }, 9);
}

const givens = [
  new Given('R2C3', 7),
  new Given('R2C7', 6),
  new Given('R3C2', 5),
  new Given('R3C8', 8),
  new Given('R4C6', 9),
  new Given('R6C4', 5),
  new Given('R7C2', 6),
  new Given('R7C8', 9),
  new Given('R8C3', 1),
  new Given('R8C7', 2),
];

const spec = multiplicationBlockSpec();
const multiplications = multiplicationBlocks.map(
  cells => new NFA(spec, 'multiplication block', ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...multiplications,
];
