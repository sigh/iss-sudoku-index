// Title: Threads of Silence
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=acFMVXxSN5A
// Source: https://sudokupad.app/zy1s9y2qi8

// The grey line is partitioned into consecutive groups summing to 10.
// Positive Sudoku digits make each completed group boundary unambiguous.
const sumTenGroups = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => {
    const nextSum = sum + value;
    if (nextSum > 10) return undefined;
    return nextSum === 10 ? 0 : nextSum;
  },
  accept: sum => sum === 0,
}, 9);

const pink = ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R3C4', 'R2C4', 'R1C4'];
const grey = ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5'];
const purple = ['R9C7', 'R9C6', 'R8C6', 'R7C6', 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C9'];
const yellow = ['R6C3', 'R6C2', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C4', 'R7C4'];
const green = ['R2C7', 'R2C6', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R4C8', 'R3C8'];

return [
  new Shape('9x9'),
  new Given('R1C1', 8),
  new Modular(5, ...yellow),
  new NFA(sumTenGroups, 'groups sum to 10', ...grey),
  new Zipper(...purple),
  new Whisper(5, ...green),
  new Renban(...pink),
];
