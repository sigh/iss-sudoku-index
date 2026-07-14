// Title: Modular Cages
// Author: RandyDan
// Video: https://www.youtube.com/watch?v=YlXeLOWAFSY
// Source: https://sudokupad.app/dl6h49k6yb

// Normal Sudoku rules apply. Adjacent digits on each green loop differ by at
// least 5. Each dashed cage sums to a multiple of its clue; cage digits may
// repeat when the ordinary Sudoku rules permit it.

// A cage is accepted exactly when its running sum has remainder zero. Compile
// one small machine per displayed modulus and reuse it across matching cages.
const modularSumMachine = modulus => NFA.encodeSpec({
  startState: {remainder: 0},
  transition: ({remainder}, value) => ({
    remainder: (remainder + value) % modulus,
  }),
  accept: ({remainder}) => remainder === 0,
}, 9);

const mod3 = modularSumMachine(3);
const mod4 = modularSumMachine(4);
const mod5 = modularSumMachine(5);
const mod7 = modularSumMachine(7);

const modularCages = [
  [mod5, 'mod-5', ['R7C2', 'R8C2', 'R8C3']],
  [mod5, 'mod-5', ['R2C7', 'R2C8', 'R3C8']],
  [mod4, 'mod-4', ['R6C8', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8']],
  [mod7, 'mod-7', ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R4C2']],
  [mod3, 'mod-3', ['R7C9', 'R8C9', 'R9C9']],
  [mod3, 'mod-3', ['R1C8', 'R1C9', 'R2C9', 'R3C9']],
  [mod3, 'mod-3', ['R4C3', 'R5C3', 'R6C3']],
  [mod5, 'mod-5', ['R4C6', 'R5C6', 'R6C6']],
  [mod4, 'mod-4', ['R3C4', 'R3C5', 'R4C4', 'R4C5']],
  [mod3, 'mod-3', ['R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4']],
];

// Repeating the first cell closes each pairwise whisper loop.
const whisperLoops = [
  ['R8C6', 'R8C7', 'R8C8', 'R7C8', 'R6C8', 'R7C7', 'R8C6'],
  ['R7C3', 'R8C4', 'R8C3', 'R8C2', 'R7C2', 'R6C2', 'R7C3'],
  ['R2C2', 'R3C2', 'R4C2', 'R3C3', 'R2C4', 'R2C3', 'R2C2'],
  ['R2C6', 'R3C7', 'R4C8', 'R3C8', 'R2C8', 'R2C7', 'R2C6'],
];

return [
  new Shape('9x9'),
  ...modularCages.map(([machine, name, cells]) =>
    new NFA(machine, name, ...cells)),
  ...whisperLoops.map(cells => new Whisper(5, ...cells)),
];
