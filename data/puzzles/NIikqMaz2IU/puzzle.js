// Title: Welcome to Elementary School
// Author: Flipsen
// Video: https://www.youtube.com/watch?v=NIikqMaz2IU
// Source: https://app.crackingthecryptic.com/sudoku/DGjdPjDn9P

// Normal sudoku rules apply, with no givens. Every 9-cell diagonal is a Fibonacci
// line modulo 10 whose first two digits are consecutive with the smaller first.
// Black dots are 1:2 pairs, white dots consecutive pairs, and each arrow arm sums
// to its circle, or to its pill read left to right as a 2-digit number. Fog
// clearing is display behaviour and is not encoded.

// A 9x9 grid has exactly two diagonals of 9 cells, so "9-cell diagonals" names
// these two and nothing else; neither is drawn on the board.
const mainDiagonal = [];
const antiDiagonal = [];
for (let i = 1; i <= 9; i++) {
  mainDiagonal.push(makeCellId(i, i));
  antiDiagonal.push(makeCellId(i, 10 - i));
}

// State (p, q) = the two digits read most recently, null before they exist.
// The second digit must be one more than the first ("starting with two consecutive
// digits", "the first digit ... is always the smaller one"); every later digit is
// the units digit of the sum of its two predecessors. accept only has to confirm
// that at least two digits were read, since transition rejects every violation as
// it happens.
const fibonacciSpec = NFA.encodeSpec({
  startState: { p: null, q: null },
  transition: ({ p, q }, v) => {
    if (q === null) return { p: null, q: v };
    if (p === null) return v === q + 1 ? { p: q, q: v } : undefined;
    return v === (p + q) % 10 ? { p: q, q: v } : undefined;
  },
  accept: ({ p }) => p !== null,
}, 9);

// The rules do not say which end of a diagonal starts its sequence, so each
// diagonal may run either way.
const fibonacciDiagonals = [mainDiagonal, antiDiagonal].map(cells => new Or([
  new NFA(fibonacciSpec, 'fibonacci', cells),
  new NFA(fibonacciSpec, 'fibonacci', [...cells].reverse()),
]));

return [
  new Shape('9x9'),

  ...fibonacciDiagonals,

  // Drawn arrows: total cell(s) first, then the arm.
  new Arrow('R4C6', 'R5C5', 'R6C4'),
  new PillArrow(2, 'R3C1', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2', 'R8C3'),
  new Arrow('R8C5', 'R8C6', 'R9C5'),

  // Drawn Kropki dots.
  new BlackDot('R3C4', 'R4C4'),
  new BlackDot('R5C8', 'R5C9'),
  new BlackDot('R6C1', 'R7C1'),
  new WhiteDot('R5C3', 'R6C3'),
  new WhiteDot('R9C3', 'R9C4'),
];
