// Title: Greater Yin than Yang
// Author: PrissyP
// Video: https://www.youtube.com/watch?v=2TSVm0Xq9So
// Source: https://sudokupad.app/9q6g79ru09

// Normal sudoku. Yin-Yang: shade some cells so that shaded cells form one
// orthogonally-connected region, unshaded cells form another, and no 2x2 box
// is entirely one shade -- the native YinYang() constraint and its YY layer.
//
// Greatest lines: on each of the 12 drawn lines, every shaded cell's digit is
// greater than the sum of any two (distinct) unshaded cells' digits on that
// line, and each line carries at least 1 shaded and at least 2 unshaded cells.
// "Every shaded digit exceeds every unshaded pair-sum" is exactly "the
// smallest shaded digit exceeds the largest unshaded pair-sum", i.e. the sum
// of the two largest unshaded digits on the line -- so one NFA per line,
// scanning [digit, shade] pairs in drawn order, carries the running minimum
// shaded digit and the running two largest unshaded digits (both computable
// in one left-to-right pass), and accepts when the minimum shaded digit beats
// the top-two unshaded sum and at least one shaded and two unshaded cells were
// actually seen. That last part is encoded explicitly (not left as a
// vacuously-true edge case) precisely so that "top two unshaded digits" and
// "minimum shaded digit" always denote a real pair/digit rather than a
// sentinel standing in for "none seen".

const graph = cellGraph('9x9');
const numValues = graph.gridGeometry().numValues;
const shade = graph.makeOverlay('YY');
const SHADED = 1;
const UNSHADED = 2;

// Drawn line paths (darkseagreen), transcribed from the puzzle's drawn line
// geometry in the order each line was drawn.
const lines = [
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R9C6', 'R9C5', 'R9C4', 'R8C4'],
  ['R1C6', 'R1C5', 'R1C4', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'],
  ['R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R1C1', 'R2C2', 'R3C2', 'R3C3'],
  ['R3C8', 'R4C8', 'R5C8', 'R4C7', 'R4C6'],
  ['R4C2', 'R4C3', 'R4C4', 'R4C5'],
  ['R8C7', 'R8C8', 'R7C8', 'R6C8'],
  ['R7C2', 'R6C2', 'R6C3'],
  ['R8C3', 'R7C4', 'R6C4', 'R5C3'],
  ['R5C5', 'R5C6', 'R6C7'],
];

// One state per half-processed cell (waiting for its shade symbol) plus one
// per fully-processed cell. NO_SHADED is a digit-range value one above the
// alphabet, standing for "no shaded cell read yet" (min-of-empty-set).
// countShaded/countUnshaded are not carried directly -- they are recoverable
// from the fields already kept: minShaded < NO_SHADED iff a shaded cell has
// been seen, and (since every digit is >= 1) top2 > 0 iff a second unshaded
// digit has been folded in, because inserting a second value into an
// initially-empty top-two always leaves a positive value in top2. Carrying
// the counts as separate fields would only multiply the compiled state count.
const NO_SHADED = 10;

const greatestLineSpec = NFA.encodeSpec({
  startState: { pendingDigit: null, minShaded: NO_SHADED, top1: 0, top2: 0 },
  transition: (state, value) => {
    if (state.pendingDigit === null) {
      // First half of a cell: remember its digit, wait for its shade.
      return { ...state, pendingDigit: value };
    }
    // Second half: value is this cell's shade (SHADED or UNSHADED).
    const digit = state.pendingDigit;
    let { minShaded, top1, top2 } = state;
    if (value === SHADED) {
      minShaded = Math.min(minShaded, digit);
    } else if (digit > top1) {
      top2 = top1; top1 = digit;
    } else if (digit > top2) {
      top2 = digit;
    }
    // Dead-branch pruning: minShaded only falls and top1 + top2 only rises as
    // more of the line is read, so once the comparison fails it can never
    // recover. Rejecting here (rather than only at `accept`) keeps the
    // reachable state count small enough to compile.
    if (minShaded <= top1 + top2) return undefined;
    return { pendingDigit: null, minShaded, top1, top2 };
  },
  accept: (state) =>
    state.pendingDigit === null
    && state.minShaded < NO_SHADED
    && state.top2 > 0
    && state.minShaded > state.top1 + state.top2,
}, numValues);

const greatestLines = lines.map(cells => new NFA(
  greatestLineSpec, 'greatest-line',
  ...cells.flatMap(cell => [cell, shade.at(cell)]),
));

return [
  new Shape('9x9'),
  new YinYang(),
  ...greatestLines,
];
