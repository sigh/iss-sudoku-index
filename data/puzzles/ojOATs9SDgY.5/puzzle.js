// Title: April 27, 2022: Max Arrow
// Author: clover!
// Video: https://www.youtube.com/watch?v=ojOATs9SDgY
// Source: https://tinyurl.com/2p92bcah

// Normal sudoku rules apply. Each arrow's round bulb holds the largest digit
// along its own line: every non-bulb cell on the line is < the bulb's digit,
// and at least one non-bulb cell on the line equals the bulb's digit (so the
// max is achieved a second time, not only at the bulb).
//
// Each arrow is scanned bulb-first, then its line cells in drawn order. The
// state machine reads the bulb's value as the target, rejects any later
// value that exceeds it, and accepts only if some later value matched it.
const spec = NFA.encodeSpec({
  startState: { target: null, sawTarget: false },
  transition: ({ target, sawTarget }, value) => {
    if (target === null) return { target: value, sawTarget: false }; // bulb
    if (value > target) return undefined; // line digit must not exceed the bulb
    return { target, sawTarget: sawTarget || value === target };
  },
  accept: ({ target, sawTarget }) => target !== null && sawTarget,
}, 9);

// Arrows: bulb cell first, then the line cells in drawn order.
const arrows = [
  ['R1C2', 'R2C1', 'R3C1', 'R4C1'],
  ['R2C9', 'R1C8', 'R1C7', 'R1C6'],
  ['R8C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R9C8', 'R8C9', 'R7C9', 'R6C9'],
  ['R7C2', 'R6C1', 'R5C1'],
  ['R2C3', 'R1C4', 'R1C5'],
  ['R3C8', 'R4C9', 'R5C9'],
  ['R8C7', 'R9C6', 'R9C5'],
  ['R6C3', 'R5C3', 'R4C3', 'R3C4', 'R3C5'],
  ['R4C7', 'R5C7', 'R6C7', 'R7C6', 'R7C5'],
  ['R2C7', 'R3C6', 'R4C5', 'R5C4'],
  ['R8C3', 'R7C4', 'R6C5', 'R5C6'],
];

// Givens.
const givens = {
  R1C2: 3, R2C3: 6, R2C9: 4, R3C4: 1, R3C8: 6, R4C5: 5, R4C7: 9, R5C4: 2,
  R5C6: 6, R6C3: 8, R6C5: 1, R7C2: 5, R7C6: 2, R8C1: 6, R8C7: 3, R9C8: 5,
};

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(cells => new NFA(spec, 'MA', cells)),
];
