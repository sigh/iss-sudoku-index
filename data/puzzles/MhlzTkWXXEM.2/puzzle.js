// Title: March 7, 2023: 24-Trio Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=MhlzTkWXXEM
// Source: https://tinyurl.com/srcecm75

// Normal sudoku rules apply (baseline row/column/box all-different). Each of
// the 11 drawn 3-cell lines carries an arithmetic expression, read in the
// line's drawn cell order, that must equal 24; each of the two gaps between
// consecutive cells carries a "+" or "x" operator (read off the geometry's
// operator glyphs), and multiplication binds before addition. Lines place no
// other restriction on their cells, so digits may repeat along a line.

const givens = [
  new Given('R1C2', 9), new Given('R1C5', 2), new Given('R1C8', 6),
  new Given('R3C3', 4), new Given('R3C5', 6), new Given('R3C7', 3),
  new Given('R5C1', 1), new Given('R5C9', 3),
  new Given('R6C4', 2), new Given('R6C6', 8),
  new Given('R7C3', 6), new Given('R7C7', 8),
  new Given('R8C1', 8), new Given('R8C9', 6),
  new Given('R9C5', 3),
];

// Evaluate a 3-cell line (digits d0, d1, d2) with operators op1 (between d0,
// d1) and op2 (between d1, d2), multiplication before addition, against a
// fixed target. `sum` accumulates completed additive terms; `prod` is the
// still-open multiplicative term. An op of "+" closes the open term into
// `sum` and opens a new one on the next digit; "x" folds the next digit into
// the open term. The final total is sum + prod (the last open term always
// still needs adding in). This generalises correctly to any op1/op2 pair,
// including the two "x then +" / "+ then x" mixed lines below.
function arithmeticTrioNFA(op1, op2, target) {
  return NFA.encodeSpec({
    startState: { pos: 0, sum: 0, prod: 0 },
    transition: ({ pos, sum, prod }, value) => {
      // Reject a 4th symbol: every line is exactly 3 cells.
      if (pos >= 3) return undefined;
      if (pos === 0) return { pos: 1, sum: 0, prod: value };
      const op = pos === 1 ? op1 : op2;
      if (op === 'x') return { pos: pos + 1, sum, prod: prod * value };
      return { pos: pos + 1, sum: sum + prod, prod: value };
    },
    accept: ({ pos, sum, prod }) => pos === 3 && sum + prod === target,
  }, 9);
}

// Each line's two operators, read off the drawn operator glyphs (the glyph
// at the midpoint of a segment names that segment's operator). All-"x" lines
// need only one shared NFA; the three remaining op patterns get their own.
const xxNFA = arithmeticTrioNFA('x', 'x', 24);
const xLines = [
  ['R1C1', 'R2C2', 'R3C3'],
  ['R7C7', 'R8C8', 'R9C9'],
  ['R7C3', 'R8C2', 'R9C1'],
  ['R3C7', 'R2C8', 'R1C9'],
  ['R2C4', 'R1C5', 'R2C6'],
  ['R4C2', 'R5C1', 'R6C2'],
  ['R4C8', 'R5C9', 'R6C8'],
  ['R8C4', 'R9C5', 'R8C6'],
];

// R4C4 + R3C5 x R4C6 = 24, i.e. R4C4 + (R3C5 x R4C6).
const plusXNFA = arithmeticTrioNFA('+', 'x', 24);
// R5C2 x R6C3 + R5C4 = 24, i.e. (R5C2 x R6C3) + R5C4.
const xPlusNFA = arithmeticTrioNFA('x', '+', 24);
// R5C6 + R6C7 + R5C8 = 24.
const plusPlusNFA = arithmeticTrioNFA('+', '+', 24);

const trioConstraints = [
  ...xLines.map(cells => new NFA(xxNFA, 'TRIO24_xx', ...cells)),
  new NFA(plusXNFA, 'TRIO24_+x', 'R4C4', 'R3C5', 'R4C6'),
  new NFA(xPlusNFA, 'TRIO24_x+', 'R5C2', 'R6C3', 'R5C4'),
  new NFA(plusPlusNFA, 'TRIO24_++', 'R5C6', 'R6C7', 'R5C8'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...trioConstraints,
];
