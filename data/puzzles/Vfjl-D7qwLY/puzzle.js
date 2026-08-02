// Title: It's a Non-Factor
// Author: SSG
// Video: https://www.youtube.com/watch?v=Vfjl-D7qwLY
// Source: https://app.crackingthecryptic.com/sudoku/6mwnfr1jiy

// Normal sudoku rules apply. Killer cages are distinct and sum to their shown
// totals. On each Anti-Factor Line, repeats are allowed; excluding 1, a digit
// cannot be a factor or multiple of the line length, and the line sum is a
// multiple of that length.

const antiFactorLines = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R1C5', 'R2C5', 'R3C4', 'R4C4', 'R4C3', 'R3C3'],
  ['R2C3', 'R2C2', 'R3C2', 'R4C1', 'R4C2', 'R5C3'],
  ['R3C7', 'R4C7', 'R5C7'],
  ['R7C3', 'R7C4', 'R7C5'],
  ['R9C5', 'R8C4', 'R8C3', 'R9C3'],
  ['R5C9', 'R4C8', 'R3C8', 'R3C9', 'R2C8'],
  ['R6C7', 'R7C6', 'R8C6', 'R9C6', 'R8C7', 'R8C8', 'R7C8'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R6C8'],
];

// The state is the running sum modulo a line's length. A forbidden factor or
// multiple returns no transition; accepting remainder zero enforces the sum rule.
const antiFactorMachine = length => NFA.encodeSpec({
  startState: 0,
  transition: (remainder, value) => {
    const forbidden = value !== 1 && (length % value === 0 || value % length === 0);
    if (forbidden) return undefined;
    return (remainder + value) % length;
  },
  accept: remainder => remainder === 0,
}, 9);

const antiFactors = antiFactorLines.map(cells =>
  new NFA(antiFactorMachine(cells.length), `anti-factor-${cells.length}`, ...cells));

return [
  new Shape('9x9'),
  new Given('R6C6', 7),

  // Killer cages transcribed from the three outlined, totalled source cages.
  new Cage(22, 'R3C5', 'R4C5', 'R5C4', 'R5C5'),
  new Cage(8, 'R1C4', 'R2C4'),
  new Cage(9, 'R5C1', 'R5C2'),

  ...antiFactors,
];
