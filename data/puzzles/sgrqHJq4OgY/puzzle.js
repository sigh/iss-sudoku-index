// Title: Tough Odds
// Author: Aron
// Video: https://www.youtube.com/watch?v=sgrqHJq4OgY
// Source: https://sudokupad.app/4761am7zw5

// No three consecutive cells in a row or column may have the same parity.
const parityMachine = NFA.encodeSpec({
  startState: {parity: null, runLength: 0},
  transition: (state, value) => {
    const parity = value % 2;
    const runLength = parity === state.parity ? state.runLength + 1 : 1;
    if (runLength >= 3) return undefined;
    return {parity, runLength};
  },
  accept: () => true,
  maxDepth: 9,
}, 9);

const indices = Array.from({length: 9}, (_, index) => index + 1);
const rows = indices.map(row => indices.map(col => makeCellId(row, col)));
const columns = indices.map(col => indices.map(row => makeCellId(row, col)));
const parityConstraints = [...rows, ...columns].map(cells =>
  new NFA(parityMachine, 'No three consecutive cells have the same parity', ...cells));

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R2C2', 2),
  new Given('R3C3', 3),
  new Given('R4C4', 4),
  new Given('R5C5', 5),
  new Given('R6C6', 6),
  new Given('R7C1', 3),
  new Given('R7C2', 9),
  new Given('R7C7', 7),
  new Given('R8C7', 2),
  new Given('R8C8', 8),
  new Given('R8C9', 5),
  new Given('R9C9', 9),
  ...parityConstraints,
];
