// Title: Gatekeeper
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=niiEGoMLoE8
// Source: https://sudokupad.app/pnli3vy6ph

// Rules encoded here, in full:
//   1. Normal sudoku rules apply.
//   2. Along a line, each set of 3 adjacent digits sums to a multiple of 5.
//   3. Digits around a black dot must have a ratio of 2:1.
// Nothing is omitted. The grid has no givens. The dots are not declared
// exhaustive, so unmarked borders are unconstrained (no StrictKropki).

// The ten light-blue lines, each in drawn order; "adjacent" in rule 2 means
// consecutive in these lists. Every line steps one cell at a time, diagonally
// or orthogonally.
const LINES = [
  ['R5C4', 'R6C5', 'R5C6'],
  ['R6C4', 'R7C5', 'R6C6'],
  ['R2C2', 'R3C3', 'R4C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8'],
  ['R3C4', 'R4C5', 'R3C6', 'R2C5'],
  ['R6C8', 'R7C7', 'R8C6', 'R9C5', 'R8C4', 'R7C3', 'R6C2'],
  ['R7C4', 'R8C5', 'R7C6'],
  ['R3C1', 'R4C2', 'R5C3'],
  ['R3C9', 'R4C8', 'R5C7'],
  ['R7C1', 'R8C2', 'R8C3'],
  ['R8C7', 'R8C8', 'R7C9'],
];

// The five black dots, each named by the two cells its border separates.
const BLACK_DOTS = [
  ['R5C4', 'R6C4'],
  ['R5C5', 'R6C5'],
  ['R5C6', 'R6C6'],
  ['R9C2', 'R9C3'],
  ['R9C7', 'R9C8'],
];

// Rule 2 is a sliding window: cells i, i+1, i+2 of a line for every i. Only the
// window total mod 5 is ever read, so the machine carries the residues of the
// two most recently read digits -- p2 two back, p1 one back, null while that
// many digits have not been read yet -- and rejects as soon as a window's three
// residues fail to sum to 0 mod 5. 31 reachable states, independent of length.
const windowSumsToMultipleOf5 = NFA.encodeSpec({
  startState: { p2: null, p1: null },
  transition: ({ p2, p1 }, value) => {
    const r = value % 5;
    if (p1 === null) return { p2: null, p1: r };   // first digit of the line
    if (p2 === null) return { p2: p1, p1: r };     // second: no window yet
    if ((p2 + p1 + r) % 5 !== 0) return undefined;
    return { p2: p1, p1: r };
  },
  // Every window was checked in transition; the final state is unconstrained.
  // Every line here is at least 3 cells long, so each carries a real window.
  accept: () => true,
}, 9);

return [
  new Shape('9x9'),
  ...LINES.map((cells) => new NFA(windowSumsToMultipleOf5, 'sum3-mod5', ...cells)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
];
