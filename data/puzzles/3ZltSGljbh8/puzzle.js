// Title: Parity Patrol 101
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=3ZltSGljbh8
// Source: https://sudokupad.app/mvqojfwq9a

// Normal sudoku rules apply. Digits in a cage sum to its clue and do not
// repeat. In every row and column, at most two consecutive cells may have the
// same parity.

const parityRunSpec = NFA.encodeSpec({
  startState: { parity: -1, runLength: 0 },
  transition: (state, value) => {
    const parity = value % 2;
    const runLength = parity === state.parity ? state.runLength + 1 : 1;
    if (runLength > 2) return undefined;
    return { parity, runLength };
  },
  accept: () => true,
}, 9);

const indices = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rows = indices.map(row => indices.map(column => makeCellId(row, column)));
const columns = indices.map(column => indices.map(row => makeCellId(row, column)));

const cages = [
  new Cage(8, 'R2C1', 'R2C2'),
  new Cage(12, 'R2C4', 'R2C5'),
  new Cage(8, 'R2C8', 'R2C9'),
  new Cage(17, 'R2C6', 'R2C7', 'R3C6'),
  new Cage(13, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(18, 'R3C3', 'R4C2', 'R4C3'),
  new Cage(11, 'R1C8', 'R1C9'),
  new Cage(20, 'R4C7', 'R4C8', 'R4C9', 'R5C7'),
  new Cage(14, 'R5C8', 'R6C8', 'R6C9'),
  new Cage(12, 'R5C2', 'R5C3', 'R6C3'),
  new Cage(12, 'R6C6', 'R7C5', 'R7C6'),
  new Cage(21, 'R8C7', 'R8C8', 'R8C9'),
  new Cage(24, 'R8C3', 'R9C3', 'R9C4', 'R9C5'),
  new Cage(9, 'R8C1', 'R8C2'),
  new Cage(24, 'R5C4', 'R5C5', 'R5C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...rows.map(row => new NFA(parityRunSpec, 'maximum parity run 2', ...row)),
  ...columns.map(column => new NFA(parityRunSpec, 'maximum parity run 2', ...column)),
];
