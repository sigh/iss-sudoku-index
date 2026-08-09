// Title: Arithmetic Quiz
// Author: mnasti2
// Video: https://www.youtube.com/watch?v=gSX8vz3Yjbc
// Source: https://app.crackingthecryptic.com/sudoku/ghJHG6qMMH

// Normal sudoku rules apply (standard 3x3 boxes). Column 1 is given 1-9 top
// to bottom (drawn digits, not an equation clue).
//
// Each of rows 1-9 (columns 2-9) draws one equation from small white circles
// (single-digit cells), rounded pill outlines spanning 2 or 3
// horizontally-adjacent cells (2- or 3-digit numbers, most-significant digit
// first, left to right), and `+ - x / = ( )` glyphs printed between the
// circled cells. Every equation is linear (sum/difference of digits and
// place-value numbers) except six that involve a product: rows 1, 3, 4, 7
// (both halves) and 8. Linear equations are encoded with coefficient `Sum`;
// the six product equations are encoded with a small custom NFA per shape
// (`chainNFA` below), since ISS has no general multiplication primitive.
// Digits are 1-9 (no zero), so no leading-digit/zero-handling is needed.

// Builds an NFA over an ordered cell list from a list of per-cell step
// functions `(acc, value) -> acc | undefined`; `acc` carries whatever partial
// arithmetic state a shape needs, `undefined` rejects the branch. Accepts iff
// every step consumed a cell and the final `acc.ok` is true.
function chainNFA(steps) {
  const spec = NFA.encodeSpec({
    startState: { i: 0, acc: {} },
    transition: (state, value) => {
      const step = steps[state.i];
      if (!step) return undefined;
      const acc = step(state.acc, value);
      if (acc === undefined) return undefined;
      return { i: state.i + 1, acc };
    },
    accept: state => state.i === steps.length && !!state.acc.ok,
  }, 9);
  return spec;
}

function nfa(steps, label, ...cells) {
  return new NFA(chainNFA(steps), label, ...cells);
}

// (10*A + B) * C = 10*D + E  -- cells [A,B,C,D,E]. Row 1.
const twoDigitTimesDigitEqTwoDigit = [
  (acc, v) => ({ tens: v }),
  (acc, v) => ({ num: acc.tens * 10 + v }),
  (acc, v) => ({ product: acc.num * v }),
  (acc, v) => (Math.floor(acc.product / 10) === v ? { product: acc.product } : undefined),
  (acc, v) => (acc.product % 10 === v ? { ok: true } : undefined),
];

// A * (10*B + C) = 100*D + 10*E + F -- cells [A,B,C,D,E,F]. Row 3.
const digitTimesTwoDigitEqThreeDigit = [
  (acc, v) => ({ factor: v }),
  (acc, v) => ({ factor: acc.factor, tens: v }),
  (acc, v) => ({ product: acc.factor * (acc.tens * 10 + v) }),
  (acc, v) => (Math.floor(acc.product / 100) === v ? { product: acc.product } : undefined),
  (acc, v) => (Math.floor((acc.product % 100) / 10) === v ? { product: acc.product } : undefined),
  (acc, v) => (acc.product % 10 === v ? { ok: true } : undefined),
];

// 10*A + B = C * D -- cells [C,D,A,B] (factors read before the two-digit
// target, matching the product-first pattern used for the other shapes).
const twoDigitEqDigitTimesDigit = [
  (acc, v) => ({ factor: v }),
  (acc, v) => ({ product: acc.factor * v }),
  (acc, v) => (Math.floor(acc.product / 10) === v ? { product: acc.product } : undefined),
  (acc, v) => (acc.product % 10 === v ? { ok: true } : undefined),
];

// A * C = B -- cells [A,B,C]. Row 7 first equality (A = B/C).
const digitTimesDigitEqDigit = [
  (acc, v) => ({ factor: v }),
  (acc, v) => ({ factor: acc.factor, target: v }),
  (acc, v) => (acc.factor * v === acc.target ? { ok: true } : undefined),
];

// A * (E - F) = D -- cells [A,D,E,F]. Row 7 second equality (A = D/(E-F)).
const digitTimesDiffEqDigit = [
  (acc, v) => ({ factor: v }),
  (acc, v) => ({ factor: acc.factor, target: v }),
  (acc, v) => ({ factor: acc.factor, target: acc.target, minuend: v }),
  (acc, v) => (acc.factor * (acc.minuend - v) === acc.target ? { ok: true } : undefined),
];

// 10*D + E = F * (G - H) -- cells [F,G,H,D,E] (product computed before the
// place-value digits are read, to keep the compiled state count small: the
// two-digit target and the two-cell diff are never both live at once).
const twoDigitEqDigitTimesDiff = [
  (acc, v) => ({ factor: v }),
  (acc, v) => ({ factor: acc.factor, minuend: v }),
  (acc, v) => ({ product: acc.factor * (acc.minuend - v) }),
  (acc, v) => (Math.floor(acc.product / 10) === v ? { product: acc.product } : undefined),
  (acc, v) => (acc.product % 10 === v ? { ok: true } : undefined),
];

return [
  new Shape('9x9'),

  // Column 1 givens, top to bottom.
  new Given('R1C1', 1), new Given('R2C1', 2), new Given('R3C1', 3),
  new Given('R4C1', 4), new Given('R5C1', 5), new Given('R6C1', 6),
  new Given('R7C1', 7), new Given('R8C1', 8), new Given('R9C1', 9),

  // Row 1: R1C2R1C3 x R1C4 = R1C5R1C6
  nfa(twoDigitTimesDigitEqTwoDigit, 'row1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'),

  // Row 2: R2C2 + R2C3 + R2C4 + R2C5 = R2C6R2C7
  new Sum(0, 'R2C2', 'R2C3', 'R2C4', 'R2C5', ['R2C6', -10], ['R2C7', -1]),

  // Row 3: R3C2 x R3C3R3C4 = R3C5R3C6R3C7
  nfa(digitTimesTwoDigitEqThreeDigit, 'row3', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),

  // Row 4: R4C2 + R4C3 = R4C4R4C5 = R4C6 x R4C7
  new Sum(0, 'R4C2', 'R4C3', ['R4C4', -10], ['R4C5', -1]),
  nfa(twoDigitEqDigitTimesDigit, 'row4b', 'R4C6', 'R4C7', 'R4C4', 'R4C5'),

  // Row 5: R5C2R5C3 - R5C4 = R5C5
  new Sum(0, ['R5C2', 10], 'R5C3', ['R5C4', -1], ['R5C5', -1]),

  // Row 6: R6C2 - R6C3 = R6C4, i.e. R6C2 = R6C3 + R6C4
  new EqualSum(['R6C2'], ['R6C3', 'R6C4']),

  // Row 7: R7C2 = R7C3/R7C4 = R7C5/(R7C6-R7C7), cross-multiplied
  nfa(digitTimesDigitEqDigit, 'row7a', 'R7C2', 'R7C3', 'R7C4'),
  nfa(digitTimesDiffEqDigit, 'row7b', 'R7C2', 'R7C5', 'R7C6', 'R7C7'),

  // Row 8: R8C2 + R8C3R8C4 = R8C5R8C6 = R8C7 x (R8C8-R8C9)
  new Sum(0, 'R8C2', ['R8C3', 10], 'R8C4', ['R8C5', -10], ['R8C6', -1]),
  nfa(twoDigitEqDigitTimesDiff, 'row8b', 'R8C7', 'R8C8', 'R8C9', 'R8C5', 'R8C6'),

  // Row 9: R9C2+R9C3 = R9C4+R9C5 = R9C6 = R9C7+R9C8
  new EqualSum(['R9C2', 'R9C3'], ['R9C4', 'R9C5'], ['R9C6'], ['R9C7', 'R9C8']),
];
