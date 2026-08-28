// Title: Feb 27, 2022: Product Arrow
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Y631pjavM3Y
// Source: https://tinyurl.com/56xrhztd

// Normal sudoku rules apply. Digits along each arrow must multiply to give the
// product shown in the circle. Every arrow's circle is a single grid cell that
// happens to carry one of the puzzle's 13 given digits; the shaft (arm) cells
// are not given. There are no cages, lines, or other clue geometry.

// Given digits (13), read from the payload grid. 8 of them are arrow circles
// (see below); the other 5 (R3C5, R4C4, R5C5, R6C6, R7C5) are plain givens.
const givens = [
  new Given('R1C5', 5),
  new Given('R1C9', 6),
  new Given('R2C3', 3),
  new Given('R3C1', 7),
  new Given('R3C5', 4),
  new Given('R4C4', 5),
  new Given('R5C5', 7),
  new Given('R6C6', 9),
  new Given('R7C5', 8),
  new Given('R7C9', 4),
  new Given('R8C7', 9),
  new Given('R9C1', 8),
  new Given('R9C5', 2),
];

// Arrows (8), read from the payload's `arrow` array: each entry's `cells` is
// the circle cell, and `lines[0]` is [circle, ...shaft] in drawn order.
const arrows = [
  { circle: 'R1C5', shaft: ['R2C6', 'R3C7'] },
  { circle: 'R2C3', shaft: ['R3C4', 'R4C5'] },
  { circle: 'R3C1', shaft: ['R4C2', 'R5C3'] },
  { circle: 'R9C1', shaft: ['R8C1', 'R7C1', 'R6C1'] },
  { circle: 'R1C9', shaft: ['R2C9', 'R3C9', 'R4C9'] },
  { circle: 'R7C9', shaft: ['R6C8', 'R5C7'] },
  { circle: 'R8C7', shaft: ['R7C6', 'R6C5'] },
  { circle: 'R9C5', shaft: ['R8C4', 'R7C3'] },
];

// ISS has no built-in product-arrow class (Arrow/DoubleArrow/PillArrow are all
// sums), so each arrow is a custom NFA over [circle, ...shaft] -- the circle
// (control cell) first, arm cells after, matching the native Arrow class's own
// cell order. The first scanned value sets the target (it is whatever digit
// the circle carries -- here always one of the 13 givens above, but the
// machine does not need to assume that); each later value multiplies into a
// running product, rejecting (returning undefined) as soon as it would
// exceed the target.
function productArrowNFA() {
  return NFA.encodeSpec({
    startState: { target: null, product: 1 },
    transition: (state, value) => {
      if (state.target === null) {
        return { target: value, product: 1 };
      }
      const next = state.product * value;
      if (next > state.target) return;
      return { target: state.target, product: next };
    },
    accept: state => state.target !== null && state.product === state.target,
  }, 9);
}

function productArrow(circle, shaftCells) {
  return new NFA(
    productArrowNFA(), 'product arrow', circle, ...shaftCells);
}

const productArrows = arrows.map(a => productArrow(a.circle, a.shaft));

return [
  new Shape('9x9'),
  ...givens,
  ...productArrows,
];
