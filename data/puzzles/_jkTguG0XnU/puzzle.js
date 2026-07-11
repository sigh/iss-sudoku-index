// Title: Balance lines
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=_jkTguG0XnU
// Source: https://sudokupad.app/1f9u67dq06

// Normal sudoku rules apply. On each line the sum of the odd digits equals
// the sum of the even digits. Digits joined by a white dot are consecutive.
// The digit in the grey square must be even.
//
// A line's balance condition is order-independent (it only depends on the
// set of digits on the line), so it is modelled as a running-sum NFA: scan
// the line accumulating (+digit) for odd digits and (-digit) for even
// digits, and accept only when the final running total is zero.

// The longest balance line in this puzzle has 8 cells; bound the automaton's
// depth explicitly so the compiler does not explore an unbounded DAG of
// running-sum states.
const MAX_LINE_LEN = 8;
const balanceSpec = {
  startState: { diff: 0, depth: 0 },
  transition: ({ diff, depth }, value) => {
    if (depth >= MAX_LINE_LEN) return undefined;
    return { diff: diff + (value % 2 === 1 ? value : -value), depth: depth + 1 };
  },
  accept: ({ diff }) => diff === 0,
};
const balanceNFA = NFA.encodeSpec(balanceSpec, /* numValues= */ 9);

const lines = [
  ['R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R3C4', 'R2C4', 'R2C5'],
  ['R2C7', 'R2C8', 'R3C8', 'R3C9'],
  ['R4C4', 'R4C3', 'R4C2', 'R4C1'],
  ['R5C2', 'R5C1', 'R6C1'],
  ['R6C2', 'R6C3', 'R7C3', 'R7C4', 'R8C4'],
  ['R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1'],
  ['R9C6', 'R9C5', 'R9C4'],
  ['R4C6', 'R5C6', 'R5C5', 'R4C5'],
  ['R6C6', 'R6C5', 'R6C4', 'R5C4'],
  ['R4C9', 'R4C8', 'R5C8', 'R5C7', 'R6C7'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R8C8', 'R7C8'],
  ['R9C7', 'R8C7', 'R7C7'],
];

return [
  new Shape('9x9'),

  // The digit in the grey square must be even.
  new Given('R2C1', 2, 4, 6, 8),

  // White dots: consecutive digits.
  new WhiteDot('R8C4', 'R9C4'),
  new WhiteDot('R7C2', 'R7C3'),

  // Balance lines: sum of odd digits equals sum of even digits.
  ...lines.map(
    (cells, i) => new NFA(balanceNFA, `BAL${i}`, ...cells)),
];
