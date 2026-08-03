// Title: Mystery Product
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=QDd4tK5XNLY
// Source: https://sudokupad.app/lkztmzmo88

// Normal Sudoku rules apply. Fog-of-war is solving UI only, omitted; it adds
// no final-grid condition.
//
// Product-Sum Lines: 14 clues, each a chain of cells with two marked ends (a
// clue whose two ends are the same physical square repeats that cell id). The
// digits strictly between the two ends sum to the product of the two ends'
// digits (that digit squared when both ends are the same square). Digits may
// repeat on a line if other rules allow it.

// One small NFA per product-sum clue: the first cell sets `a`; every interior
// cell adds to a running `sum`; the last cell (state.step === lastIndex)
// compares `sum` to a*(its own value) and collapses straight to a pass/fail
// `done` state -- carrying `a`/`b`/`sum` any further would multiply the small
// per-step state count (a x sum-so-far) by another a x b for no reason, since
// nothing downstream needs them once the comparison is made.
function productSum(...cells) {
  const lastIndex = cells.length - 1;
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (state, value) => {
      if (state === 0) return { step: 1, a: value, sum: 0 };
      if (state.step === 'done') return undefined; // longer than this clue
      if (state.step === lastIndex) {
        return { step: 'done', ok: state.sum === state.a * value };
      }
      return { step: state.step + 1, a: state.a, sum: state.sum + value };
    },
    accept: (state) => state !== 0 && state.step === 'done' && state.ok,
  }, 9);
  return new NFA(spec, 'Product-Sum line', ...cells);
}

// Cell chains for the 14 clues, each split from a drawn line at the cells
// where a marked-end overlay lands.
const productSumLines = [
  productSum('R3C5', 'R3C6', 'R2C7', 'R1C6'),
  productSum('R1C6', 'R1C7', 'R1C8', 'R2C8', 'R3C7'),
  productSum('R1C9', 'R2C9', 'R3C9', 'R4C9', 'R4C8', 'R4C7'),
  productSum('R4C5', 'R5C6', 'R6C7', 'R5C7'),
  productSum('R6C9', 'R6C8', 'R7C8', 'R8C8', 'R7C9'),
  productSum('R9C8', 'R9C7', 'R8C7', 'R8C6', 'R7C6', 'R6C6'),
  productSum('R5C4', 'R5C5', 'R6C5', 'R7C5'),
  productSum('R7C5', 'R7C4', 'R8C3', 'R9C3'),
  productSum('R6C4', 'R7C3', 'R8C2', 'R9C1'),
  productSum('R8C1', 'R7C1', 'R6C1', 'R6C2', 'R5C3'),
  productSum('R2C6', 'R1C5', 'R1C4', 'R2C5', 'R2C6'),
  productSum('R3C3', 'R4C2', 'R4C3', 'R4C4', 'R3C4'),
  productSum('R3C4', 'R2C4', 'R3C3'),
  productSum('R1C1', 'R1C2', 'R1C3', 'R2C3', 'R2C2', 'R3C2', 'R3C1', 'R2C1', 'R1C1'),
];

return [
  new Shape('9x9'),
  ...productSumLines,
];
