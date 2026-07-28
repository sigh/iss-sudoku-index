// Title: Diaeresis 2.0
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=79bbb20M_oc
// Source: https://sudokupad.app/qul8bqsp5c

// Normal 9x9 Sudoku rules apply. Red X marks are 2x2 product squares:
// top-right times bottom-left equals top-left times bottom-right. Blue X
// marks are 2x2 sum squares with equal diagonal sums. The two white dots join
// consecutive digits. Fog and its foglight marker are UI-only, and no
// negative constraint applies to unmarked cells.

const PRODUCT_SQUARES = [
  ['R2C1', 'R2C2', 'R3C1', 'R3C2'],
  ['R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ['R5C2', 'R5C3', 'R6C2', 'R6C3'],
  ['R5C4', 'R5C5', 'R6C4', 'R6C5'],
  ['R1C4', 'R1C5', 'R2C4', 'R2C5'],
  ['R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2'],
  ['R8C6', 'R8C7', 'R9C6', 'R9C7'],
];

const SUM_SQUARES = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R5C3', 'R5C4', 'R6C3', 'R6C4'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R3C5', 'R3C6', 'R4C5', 'R4C6'],
  ['R8C5', 'R8C6', 'R9C5', 'R9C6'],
  ['R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R6C8', 'R6C9', 'R7C8', 'R7C9'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9'],
];

// Each NFA reads a 2x2 in row order. It keeps the first three digits, then
// checks the stated diagonal equality when it reads the fourth.
const productSquareSpec = NFA.encodeSpec({
  startState: { pos: 0 },
  transition: (state, value) => {
    if (state.pos === 0) return { pos: 1, tl: value };
    if (state.pos === 1) return { pos: 2, tl: state.tl, tr: value };
    if (state.pos === 2) return { pos: 3, tl: state.tl, tr: state.tr, bl: value };
    if (state.pos === 3 && state.tl * value === state.tr * state.bl) return { pos: 4 };
    return undefined;
  },
  accept: (state) => state.pos === 4,
  maxDepth: 4,
}, 9);

const sumSquareSpec = NFA.encodeSpec({
  startState: { pos: 0 },
  transition: (state, value) => {
    if (state.pos === 0) return { pos: 1, tl: value };
    if (state.pos === 1) return { pos: 2, tl: state.tl, tr: value };
    if (state.pos === 2) return { pos: 3, tl: state.tl, tr: state.tr, bl: value };
    if (state.pos === 3 && state.tl + value === state.tr + state.bl) return { pos: 4 };
    return undefined;
  },
  accept: (state) => state.pos === 4,
  maxDepth: 4,
}, 9);

return [
  new Shape('9x9'),
  ...PRODUCT_SQUARES.map(cells => new NFA(productSquareSpec, 'ProductSquare', ...cells)),
  ...SUM_SQUARES.map(cells => new NFA(sumSquareSpec, 'SumSquare', ...cells)),
  new WhiteDot('R1C2', 'R2C2'),
  new WhiteDot('R3C8', 'R4C8'),
];
