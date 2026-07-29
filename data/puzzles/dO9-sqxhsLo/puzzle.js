// Title: Divide and conquer
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=dO9-sqxhsLo
// Source: https://app.crackingthecryptic.com/5ljgkj9tos

// Normal sudoku, anti-consecutive orthogonal neighbours, and yellow divisor
// lines. On each yellow line, every digit divides that line's maximum digit;
// repeats are allowed.

// Yellow line paths transcribed from the drawn yellow lines.
const divisorLines = [
  ['R8C1', 'R8C2', 'R9C2', 'R9C3'],
  ['R8C3', 'R9C4'],
  ['R8C4', 'R7C3', 'R6C2'],
  ['R7C4', 'R7C5', 'R6C5', 'R5C5'],
  ['R9C5', 'R9C6', 'R8C6'],
  ['R3C3', 'R4C4', 'R3C5', 'R2C5'],
  ['R2C3', 'R1C3', 'R1C4', 'R1C5', 'R2C6'],
  ['R3C1', 'R2C1', 'R2C2', 'R3C2'],
  ['R4C2', 'R4C3', 'R5C3', 'R5C2'],
  ['R3C8', 'R4C8', 'R4C9'],
];

// The state is a bitmask of digits seen. At the end, every present digit must
// divide the greatest present digit, which is the line maximum.
const divisorNfa = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => seen | (1 << (value - 1)),
  accept: seen => {
    const maximum = 32 - Math.clz32(seen);
    for (let digit = 1; digit <= maximum; digit++) {
      if ((seen & (1 << (digit - 1))) && maximum % digit !== 0) return false;
    }
    return true;
  },
}, 9);

const divisors = divisorLines.map(cells => new NFA(divisorNfa, 'divisor', ...cells));

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...divisors,
];
