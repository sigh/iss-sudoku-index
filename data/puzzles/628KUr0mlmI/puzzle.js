// Title: clover's expert maths class
// Author: Qodec
// Video: https://www.youtube.com/watch?v=628KUr0mlmI
// Source: https://app.crackingthecryptic.com/sudoku/tmDnmJRL7m

// Normal sudoku rules apply. Ten circles sit at cell-corner intersections,
// each touching a 2x2 block of four cells. A circle with an operator
// (+,-,x,/) requires that applying the operator to each of the block's two
// diagonal pairs (TL,BR) and (TR,BL) gives the printed number both times. A
// "?" circle requires the same equality between the two diagonal results,
// but the shared value itself is not given. A circle with no operator lists
// plain digit(s) that must each appear in at least one of the four touching
// cells (native `Quad`).
//
// Subtraction/division diagonal pairs are read unordered (larger digit
// first for division; absolute difference for subtraction) since the rules
// give no left/right or top/bottom order within a diagonal pair.

// Diagonal-pair helpers, shared by every operator circle.
const diff = (a, b) => Math.abs(a - b);
const sum = (a, b) => a + b;
const product = (a, b) => a * b;
// Ratio of the larger digit to the smaller; undefined when not exact.
const quotient = (a, b) => {
  if (a % b === 0) return a / b;
  if (b % a === 0) return b / a;
  return undefined;
};

// One fixed-target circle: two diagonal pairs, each pair's op(a,b) must
// equal `target`. Cells given as [TL, TR, BL, BR].
function targetCircle(opName, opFn, target, [tl, tr, bl, br]) {
  const fn = (a, b) => opFn(a, b) === target;
  const key = Pair.fnToKey(fn, 9);
  return [
    new Pair(key, `${opName}${target}-diag1`, tl, br),
    new Pair(key, `${opName}${target}-diag2`, tr, bl),
  ];
}

// A "?" circle: the two diagonal pairs must give equal op(a,b) results, but
// that shared value is not fixed. This is a 4-cell relation, so it needs an
// NFA scanning [TL, BR, TR, BL] (each diagonal read consecutively): after
// the first pair it records the diagonal-1 result as the NFA state, then
// requires the diagonal-2 result to match it before accepting.
function unknownResultCircle(name, opFn, [tl, tr, bl, br]) {
  const spec = NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      switch (state.phase) {
        case 0:
          return { phase: 1, a: value };
        case 1: {
          const r = opFn(state.a, value);
          if (r === undefined) return undefined;
          return { phase: 2, r };
        }
        case 2:
          return { phase: 3, r: state.r, c: value };
        case 3: {
          const r2 = opFn(state.c, value);
          if (r2 === undefined || r2 !== state.r) return undefined;
          return { phase: 4 };
        }
      }
    },
    accept: (state) => state.phase === 4,
  }, 9);
  return new NFA(spec, name, tl, br, tr, bl);
}

return [
  new Shape('9x9'),

  // Fixed-target operator circles: cells as [TL, TR, BL, BR].
  ...targetCircle('sub', diff, 4, ['R2C2', 'R2C3', 'R3C2', 'R3C3']),
  ...targetCircle('sub', diff, 6, ['R1C4', 'R1C5', 'R2C4', 'R2C5']),
  ...targetCircle('add', sum, 11, ['R1C5', 'R1C6', 'R2C5', 'R2C6']),
  ...targetCircle('add', sum, 13, ['R6C1', 'R6C2', 'R7C1', 'R7C2']),
  ...targetCircle('div', quotient, 2, ['R3C7', 'R3C8', 'R4C7', 'R4C8']),
  ...targetCircle('add', sum, 7, ['R6C8', 'R6C9', 'R7C8', 'R7C9']),

  // "?" circles: same result both diagonals, value undetermined.
  unknownResultCircle('div?', quotient, ['R6C3', 'R6C4', 'R7C3', 'R7C4']),
  unknownResultCircle('mul?', product, ['R6C6', 'R6C7', 'R7C6', 'R7C7']),

  // No-operator circles: each listed digit must appear somewhere in the
  // touching 2x2 block.
  new Quad('R7C3', 3, 5, 9),
  new Quad('R1C6', 2),
];
