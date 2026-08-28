// Title: A Strategy Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=29NpcDB_rPs
// Source: https://cracking-the-cryptic.web.app/sudoku/qJDnRT9gDT
//
// 9x9 sudoku, normal rules apply. Nine "grey" cells (the centre cell of each
// 3x3 box) together contain every digit 1-9 once. Twelve 2-cell cages: digits
// sum to the marked total and are distinct within the cage (standard killer
// cage; the rules state no repeat-permission). Nine individual cells are
// labelled A-J (skipping I) -- the digit placed in each named cell is that
// letter's value. A note below the grid gives:
//   A=B*X, C=D*X, E=F+X, H=G+X, J=A+B
// X is a separate unknown, not tied to any grid cell.

// Letter -> grid cell, from the small text overlays drawn next to each cell.
const A = 'R5C8', B = 'R8C5', C = 'R4C4', D = 'R6C7', E = 'R6C5';
const F = 'R4C6', G = 'R3C9', H = 'R3C2', J = 'R5C2';

// X: a lone auxiliary unknown, no grid pairing needed. Its domain defaults to
// the grid's value range (1-9), which is not a tightening here: A=B*X with
// A,B both sudoku digits (1-9) already forces 1 <= X <= 9 (X = A/B, B>=1 so
// X<=9; A>=1,B<=9 so X>0), and C=D*X forces the same bound independently. The
// rules pair "the values of A-J and X" as one kind of unknown (may repeat),
// so we read X as integer-valued like the letters, not fractional.
// (Named `xVar`/`xCell`, not `X`/`VX`: `X` is the sandbox's built-in
// sum-to-10 marker class.)
const xVar = new Var('X', 'X', 1);
const xCell = xVar.cell(1);

// Product relation cell1 = cell2 * X, read in order [cell2, X, cell1]. State
// stages: 0 = start, 1 = have the multiplicand (`factor`), 2 = have the
// product (`product` = factor * X-value), 3 = accepted (third cell matched
// the product). Bounded: <= 1 + 9 + 81 + 1 states.
const productSpec = NFA.encodeSpec({
  startState: { stage: 0 },
  transition: (state, value) => {
    if (state.stage === 0) return { stage: 1, factor: value };
    if (state.stage === 1) return { stage: 2, product: state.factor * value };
    return value === state.product ? { stage: 3 } : undefined;
  },
  accept: (state) => state.stage === 3,
}, 9);

const outsideFormula = [
  new NFA(productSpec, 'A=B*X', B, xCell, A),
  new NFA(productSpec, 'C=D*X', D, xCell, C),
  new EqualSum([E], [F, xCell]),  // E = F + X
  new EqualSum([H], [G, xCell]),  // H = G + X
  new EqualSum([J], [A, B]),      // J = A + B
];

// Cages (drawn 2-cell killer cages).
const cages = [
  new Cage(15, 'R2C3', 'R2C4'),
  new Cage(11, 'R2C6', 'R2C7'),
  new Cage(15, 'R3C2', 'R4C2'),
  new Cage(15, 'R3C5', 'R4C5'),
  new Cage(9, 'R3C8', 'R4C8'),
  new Cage(11, 'R5C3', 'R5C4'),
  new Cage(17, 'R5C6', 'R5C7'),
  new Cage(11, 'R6C2', 'R7C2'),
  new Cage(12, 'R6C5', 'R7C5'),
  new Cage(16, 'R6C8', 'R7C8'),
  new Cage(11, 'R8C3', 'R8C4'),
  new Cage(13, 'R8C6', 'R8C7'),
];

// The nine grey-shaded cells (box centres) together hold
// every digit 1-9. Row/column all-different already separates same-row and
// same-column pairs among them; this adds the remaining (diagonal-ish) pairs.
const greyCells = [
  'R2C2', 'R2C5', 'R2C8',
  'R5C2', 'R5C5', 'R5C8',
  'R8C2', 'R8C5', 'R8C8',
];

return [
  new Shape('9x9'),
  xVar,
  ...cages,
  new AllDifferent(...greyCells),
  ...outsideFormula,
];
