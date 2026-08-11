// Title: Equation Sudoku 12
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=3POiEtEtf9Y
// Source: https://app.crackingthecryptic.com/sudoku/mnPH4dRJMB

// Normal sudoku (default Shape('9x9') box regions) plus ten drawn
// equations. Each equation is a 3-cell span (horizontal, read left-to-right,
// or vertical, read downwards) with an operator between its first two cells
// and "=" between its last two: cell1 OP cell2 = cell3. Cell/operator
// assignment transcribed from the drawn overlay geometry.

// One NFA per operator, reused across every equation of that operator.
// State: pos 0 reads the first operand; pos 1 reads the second operand and
// computes the result, rejecting immediately if it falls outside 1-9 (grid
// cells only hold 1-9, so an out-of-range result can never match cell3); pos
// 2 reads the third cell and accepts only if it equals the computed result.
function equationMachine(op) {
  return NFA.encodeSpec({
    startState: { pos: 0 },
    transition: (state, value) => {
      if (state.pos === 0) return { pos: 1, a: value };
      if (state.pos === 1) {
        const result = op(state.a, value);
        if (!Number.isInteger(result) || result < 1 || result > 9) return undefined;
        return { pos: 2, result };
      }
      return value === state.result ? { pos: 3 } : undefined;
    },
    accept: (state) => state.pos === 3,
  }, 9);
}

const addMachine = equationMachine((a, b) => a + b);
const subMachine = equationMachine((a, b) => a - b);
const mulMachine = equationMachine((a, b) => a * b);
const divMachine = equationMachine((a, b) => (b !== 0 && a % b === 0) ? a / b : NaN);
const powMachine = equationMachine((a, b) => Math.pow(a, b));

// [operator label, machine, [cell1, cell2, cell3]] per equation, in reading
// order (left-to-right or downwards), transcribed from the overlay geometry.
const equations = [
  ['multiplication', mulMachine, ['R1C1', 'R1C2', 'R1C3']],
  ['subtraction', subMachine, ['R3C7', 'R3C8', 'R3C9']],
  ['multiplication', mulMachine, ['R4C1', 'R4C2', 'R4C3']],
  ['subtraction', subMachine, ['R6C7', 'R6C8', 'R6C9']],
  ['subtraction', subMachine, ['R9C7', 'R9C8', 'R9C9']],
  ['addition', addMachine, ['R7C1', 'R7C2', 'R7C3']],
  ['power', powMachine, ['R3C2', 'R4C2', 'R5C2']],
  ['division', divMachine, ['R5C8', 'R6C8', 'R7C8']],
  ['addition', addMachine, ['R7C6', 'R8C6', 'R9C6']],
  ['addition', addMachine, ['R1C4', 'R2C4', 'R3C4']],
];

return [
  new Shape('9x9'),

  new Given('R1C5', 5),
  new Given('R1C9', 7),
  new Given('R2C6', 8),
  new Given('R2C8', 5),
  new Given('R8C2', 1),
  new Given('R8C4', 8),
  new Given('R9C1', 7),
  new Given('R9C5', 9),

  ...equations.map(([label, machine, cells]) =>
    new NFA(machine, `${label} equation`, ...cells)),
];
