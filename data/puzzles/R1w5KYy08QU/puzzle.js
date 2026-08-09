// Title: Escher
// Author: Starwarigami
// Video: https://www.youtube.com/watch?v=R1w5KYy08QU
// Source: https://app.crackingthecryptic.com/sudoku/22Thbg68Hp

// Normal Sudoku rules apply.
//
// Product-Sum Lines: 14 clues, each a chain of cells with two marked ends
// (a circle overlay sits on each end cell). The rule reads "digits along a
// red line sum to the product of the digits in the two connected squares",
// with no "strictly between" qualifier, so all digits on the line -- the two
// marked ends included -- sum to the product of the two ends' digits.
// Digits may repeat on a line if other rules allow it.

// One small NFA per product-sum clue: the first cell sets `a` and starts
// `sum` at its own value; every later cell (including the last) adds to
// `sum`; the last cell (state.step === lastIndex) additionally compares the
// running total to a*(its own value) and collapses straight to a pass/fail
// `done` state.
function productSum(...cells) {
  const lastIndex = cells.length - 1;
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (state, value) => {
      if (state === 0) return { step: 1, a: value, sum: value };
      if (state.step === 'done') return undefined; // longer than this clue
      if (state.step === lastIndex) {
        return { step: 'done', ok: state.sum + value === state.a * value };
      }
      return { step: state.step + 1, a: state.a, sum: state.sum + value };
    },
    accept: (state) => state !== 0 && state.step === 'done' && state.ok,
  }, 9);
  return new NFA(spec, 'Product-Sum line', ...cells);
}

// Cell chains for the 14 clues; each drawn line has exactly two marked-end
// cells (overlay circles) with no interior mark, so each line is one clue.
const productSumLines = [
  productSum('R1C7', 'R2C6', 'R3C5', 'R4C4'),
  productSum('R4C4', 'R5C3', 'R6C2', 'R7C1', 'R8C1'),
  productSum('R2C9', 'R3C9', 'R4C8', 'R5C7'),
  productSum('R6C6', 'R7C5', 'R8C4', 'R9C3'),
  productSum('R6C7', 'R7C8', 'R7C9'),
  productSum('R7C7', 'R8C7', 'R9C7', 'R9C8'),
  productSum('R7C7', 'R8C8', 'R8C9', 'R9C9'),
  productSum('R2C9', 'R2C8', 'R2C7'),
  productSum('R3C8', 'R3C7', 'R3C6'),
  productSum('R4C7', 'R4C6', 'R4C5'),
  productSum('R4C4', 'R5C4', 'R5C5', 'R5C6'),
  productSum('R6C3', 'R6C4', 'R6C5'),
  productSum('R7C4', 'R7C3', 'R7C2'),
  productSum('R8C3', 'R8C2', 'R8C1'),
];

return [
  new Shape('9x9'),
  ...productSumLines,
];
