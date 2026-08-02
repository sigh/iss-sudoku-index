// Title: Ninety One
// Author: NotThatItMatters
// Video: https://www.youtube.com/watch?v=HiDyddNPHwM
// Source: https://app.crackingthecryptic.com/sudoku/pHm4JTbr9d

// Normal Sudoku with the four drawn givens. Each outlined five-cell cage has
// distinct digits and, in its drawn reading order A-B-C-D-E, (A * B + C) * D
// + E = 91. The two solver-discovered overlapping 1-9-3-2 snake pairs are
// omitted because the source does not identify either traversal or pairing.
const horner91 = NFA.encodeSpec({
  startState: { stage: 0 },
  transition: (state, value) => {
    if (state.stage === 0) return { stage: 1, a: value };
    if (state.stage === 1) return { stage: 2, product: state.a * value };
    if (state.stage === 2) return { stage: 3, subtotal: state.product + value };
    if (state.stage === 3) {
      const beforeLast = state.subtotal * value;
      return beforeLast >= 82 && beforeLast <= 90
        ? { stage: 4, beforeLast }
        : undefined;
    }
    if (state.stage === 4) {
      return state.beforeLast + value === 91 ? { stage: 5 } : undefined;
    }
    return undefined;
  },
  accept: state => state.stage === 5,
}, 9);

// The cell lists transcribe the eight outlined cages in their horizontal or
// vertical reading order.
const cages = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'],
  ['R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
];

return [
  new Shape('9x9'),
  new Given('R2C2', 2),
  new Given('R4C5', 9),
  new Given('R5C9', 1),
  new Given('R8C4', 3),
  ...cages.flatMap(cells => [
    new NFA(horner91, 'Horner 91', cells),
    new AllDifferent(...cells),
  ]),
];
