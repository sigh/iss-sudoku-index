// Title: Sep 5, 2021: Multiplication
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=McjswDKMFbI
// Source: https://tinyurl.com/3akz5m2w

// Normal sudoku rules apply. In each shaded 2x2 area, the two single digits
// on the top row multiply to give the two-digit number on the bottom row:
// (top-left * top-right) == 10*bottom-left + bottom-right. "Digits may
// repeat in a shaded area if allowed by the normal rules" adds no
// distinctness of its own beyond the default row/column/box rules, so no
// extra AllDifferent is added for the shaded areas.

const givens = [
  new Given('R1C2', 9),
  new Given('R2C6', 8),
  new Given('R3C2', 1),
  new Given('R3C3', 2),
  new Given('R3C4', 3),
  new Given('R4C1', 4),
  new Given('R5C4', 4),
  new Given('R5C5', 5),
  new Given('R5C6', 6),
  new Given('R6C9', 1),
  new Given('R7C6', 7),
  new Given('R7C7', 8),
  new Given('R7C8', 9),
  new Given('R8C4', 8),
  new Given('R9C8', 4),
];

// Each shaded 2x2 area as [topLeft, topRight, bottomLeft, bottomRight],
// transcribed from the payload's shaded-cell (#A8A8A8) list, grouped into
// consecutive 2x2 blocks in reading order.
const multiplicationAreas = [
  ['R1C2', 'R1C3', 'R2C2', 'R2C3'],
  ['R2C6', 'R2C7', 'R3C6', 'R3C7'],
  ['R4C1', 'R4C2', 'R5C1', 'R5C2'],
  ['R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R7C3', 'R7C4', 'R8C3', 'R8C4'],
  ['R8C7', 'R8C8', 'R9C7', 'R9C8'],
];

// NFA over the 4 cells [a, b, c, d] in that fixed order, checking
// a*b == 10*c + d. `phase` sequences the 4 reads (one discriminant style,
// per iss-constraints guidance); intermediate fields hold only what later
// phases need: the first factor, the running product, then the expected
// ones digit. A tens digit c that doesn't match the product's tens digit
// (including a one-digit product, where floor(product/10) is 0 and no
// sudoku digit 1-9 can equal it) rejects immediately.
const multiplicationSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0:
        return { phase: 1, a: value };
      case 1:
        return { phase: 2, product: state.a * value };
      case 2: {
        const tens = Math.floor(state.product / 10);
        if (value !== tens) return undefined;
        return { phase: 3, ones: state.product % 10 };
      }
      case 3:
        if (value !== state.ones) return undefined;
        return { phase: 4 };
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 4,
}, 9);

const multiplicationConstraints = multiplicationAreas.map(
  cells => new NFA(multiplicationSpec, 'multiplication area', ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...multiplicationConstraints,
];
