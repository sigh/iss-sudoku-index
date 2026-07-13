// Title: Coded Pairs
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=YeuTO9A1Prs
// Source: https://sudokupad.app/2vyd84g6u0

// Same labels are represented with SameValues over two-cell multisets.
// Different labels are compared by a four-cell NFA:
// first labelled pair, then second labelled pair, accepting only unequal pairs.

const GIVENS = [
  ['R2C1', 1],
  ['R2C5', 2],
  ['R4C2', 3],
  ['R5C4', 4],
  ['R5C6', 5],
  ['R6C8', 6],
  ['R8C5', 8],
  ['R8C9', 9],
  ['R9C2', 7],
];

const CAGES = {
  A: [['R6C4', 'R7C4'], ['R5C1', 'R6C1']],
  B: [['R6C6', 'R6C7'], ['R1C5', 'R1C6'], ['R3C2', 'R3C3']],
  C: [['R4C3', 'R4C4'], ['R9C4', 'R9C5']],
  D: [['R3C6', 'R4C6'], ['R4C9', 'R5C9'], ['R7C7', 'R7C8']],
  E: [['R2C8', 'R2C9'], ['R8C1', 'R8C2']],
};

const differentPairNFA = NFA.encodeSpec({
  startState: { pos: 0, a: 0, b: 0, c: 0, same: false },
  transition(state, value) {
    if (state.pos === 0) {
      return { pos: 1, a: value, b: 0, c: 0, same: false };
    }
    if (state.pos === 1) {
      return {
        pos: 2,
        a: Math.min(state.a, value),
        b: Math.max(state.a, value),
        c: 0,
        same: false,
      };
    }
    if (state.pos === 2) {
      return { pos: 3, a: state.a, b: state.b, c: value, same: false };
    }
    if (state.pos === 3) {
      const lo = Math.min(state.c, value);
      const hi = Math.max(state.c, value);
      return {
        pos: 4,
        a: state.a,
        b: state.b,
        c: state.c,
        same: lo === state.a && hi === state.b,
      };
    }
    return undefined;
  },
  accept: state => state.pos === 4 && !state.same,
}, 9);

const labels = Object.keys(CAGES);

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...Object.values(CAGES).map(cages => new SameValues(cages.length, ...cages.flat())),
  ...Array.from({ length: labels.length - 1 }, (_, i) =>
    Array.from({ length: labels.length - i - 1 }, (_, j) =>
      new NFA(
        differentPairNFA,
        'different letter pairs',
        ...CAGES[labels[i]][0],
        ...CAGES[labels[i + j + 1]][0],
      )
    )
  ).flat(),
];
