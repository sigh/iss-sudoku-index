// Title: 3/10/23: Consecutive Sequences
// Author: clover!
// Video: https://www.youtube.com/watch?v=BqmW8Cw_Mn8
// Source: https://tinyurl.com/4be45sxk

// Normal sudoku rules apply. The digits along each line must form a
// consecutive sequence in order (either increasing or decreasing), such as
// 5 6 7.
//
// CONSECUTIVE_SEQUENCE below is an NFA that enforces this per line: each
// step from one cell to the next along the drawn order must be exactly +1
// or -1, and once the first step fixes a direction (increasing/decreasing)
// every later step on that line must keep it.
const spec = {
  startState: { last: null, dir: null },
  transition: ({ last, dir }, value) => {
    if (last === null) return { last: value, dir: null };
    const step = value - last;
    if (step !== 1 && step !== -1) return undefined;
    if (dir !== null && step !== dir) return undefined;
    return { last: value, dir: step };
  },
  accept: () => true,
};
const CONSECUTIVE_SEQUENCE = NFA.encodeSpec(spec, 9);

// Lines, cells listed start-to-end as drawn.
const LINES = [
  ['R1C2', 'R1C1', 'R2C1'],
  ['R3C2', 'R2C2', 'R2C3'],
  ['R3C8', 'R2C8', 'R2C7'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R7C2', 'R8C2', 'R8C3'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R9C8', 'R9C9', 'R8C9'],
  ['R8C7', 'R8C8', 'R7C8'],
  ['R8C5', 'R8C4'],
  ['R7C5', 'R7C6'],
  ['R9C6', 'R9C5'],
  ['R6C4', 'R6C5'],
  ['R5C5', 'R5C6'],
  ['R4C5', 'R4C4'],
  ['R3C5', 'R3C6'],
  ['R2C5', 'R2C4'],
  ['R1C5', 'R1C6'],
  ['R6C3', 'R5C3', 'R4C3'],
  ['R4C7', 'R5C7', 'R6C7'],
];

return [
  new Shape('9x9'),

  new Given('R1C2', 3),
  new Given('R1C8', 6),
  new Given('R3C2', 4),
  new Given('R3C8', 7),
  new Given('R4C5', 9),
  new Given('R6C5', 4),
  new Given('R7C2', 7),
  new Given('R7C8', 1),
  new Given('R9C2', 2),
  new Given('R9C8', 5),

  ...LINES.map(cells => new NFA(CONSECUTIVE_SEQUENCE, 'ConsecutiveSequence', ...cells)),
];
