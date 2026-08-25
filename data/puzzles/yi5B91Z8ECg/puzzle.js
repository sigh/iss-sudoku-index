// Title: Multiplication Sudoku
// Author: Sinisa Hrga
// Video: https://www.youtube.com/watch?v=yi5B91Z8ECg
// Source: https://app.crackingthecryptic.com/qQMdFPp9jF

// Normal sudoku rules apply (default 3x3 boxes: the payload's own `regions`
// array is the nine ordinary boxes). Eight 2x2 marked squares are drawn with
// no printed total; each carries a small "x" overlay centred on the vertical
// border between its two top cells, naming that top pair as the pair being
// multiplied. In each marked square the top two cells hold single digits and
// the bottom two cells hold their two-digit product, read left-to-right
// (tens digit on the left, ones digit on the right). The rules note that not
// every possible 2x2 multiplication in the grid need be marked, so only
// these eight drawn squares carry the constraint; the marked squares carry
// no other constraint (no all-different is stated for them).

// Eight marked squares [topLeft, topRight, bottomLeft, bottomRight],
// transcribed from the payload's eight drawn 2x2 cages; each cage's "x"
// overlay sits on the edge between its own top-row pair, confirming which
// row is the factor row and which is the product row.
const squares = [
  ['R3C1', 'R3C2', 'R4C1', 'R4C2'],
  ['R1C2', 'R1C3', 'R2C2', 'R2C3'],
  ['R2C5', 'R2C6', 'R3C5', 'R3C6'],
  ['R3C8', 'R3C9', 'R4C8', 'R4C9'],
  ['R6C1', 'R6C2', 'R7C1', 'R7C2'],
  ['R6C4', 'R6C5', 'R7C4', 'R7C5'],
  ['R6C8', 'R6C9', 'R7C8', 'R7C9'],
  ['R8C3', 'R8C4', 'R9C3', 'R9C4'],
];

// Multiplies the two factor-segment digits and checks the result against the
// two-digit number read from the product segment (tens then ones). Segment 0
// is the two top (factor) cells; segment 1 is the two bottom (product-digit)
// cells.
const productSpec = NFA.encodeSpec({
  startState: {phase: 'factors', product: 1},
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return {phase: 'tens', product: state.product};
    }
    if (state.phase === 'factors') {
      return {phase: 'factors', product: state.product * value};
    }
    if (state.phase === 'tens') {
      return Math.floor(state.product / 10) === value
        ? {phase: 'ones', product: state.product}
        : undefined;
    }
    return state.product % 10 === value
      ? {phase: 'done', product: state.product}
      : undefined;
  },
  accept: state => state.phase === 'done',
  // Two factor cells, one segment break, two product-digit cells.
  maxDepth: 5,
}, 9, {multiSegment: true});

const squareConstraints = squares.map(([tl, tr, bl, br], i) => new NFA(
  productSpec,
  `square ${i + 1}`,
  [tl, tr],
  [bl, br],
));

// Givens, transcribed from the payload's drawn digits.
const givens = [
  ['R1C1', 1], ['R1C5', 5], ['R1C9', 3],
  ['R2C1', 2], ['R2C8', 7],
  ['R3C3', 3], ['R3C4', 7], ['R3C7', 5],
  ['R7C3', 9], ['R7C6', 4], ['R7C7', 6],
  ['R8C2', 8], ['R8C9', 2],
  ['R9C1', 6], ['R9C9', 4],
].map(([cell, value]) => new Given(cell, value));

return [
  new Shape('9x9'),
  ...givens,
  ...squareConstraints,
];
