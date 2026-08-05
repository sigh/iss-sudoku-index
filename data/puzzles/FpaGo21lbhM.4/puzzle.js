// Title: Oct. 16, 2022: 10 Lines
// Author: clover!
// Video: https://www.youtube.com/watch?v=FpaGo21lbhM
// Source: https://tinyurl.com/42t7c2rd

// Standard 9x9 Sudoku with the nine givens below.  Each drawn line is partitioned
// into consecutive groups whose digit sums are 10; the NFA state is the unfinished
// group's sum, and returning to state 0 closes a group.
const tenLine = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => {
    const next = sum + value;
    if (next > 10) return undefined;
    return next === 10 ? 0 : next;
  },
  accept: sum => sum === 0,
}, 9);

// Ordered paths transcribed from the nine drawn lines.
const lines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R3C9', 'R3C8', 'R3C7', 'R3C6', 'R3C5'],
  ['R1C6', 'R2C7', 'R2C8', 'R1C9'],
  ['R3C4', 'R2C3', 'R2C2', 'R3C1'],
  ['R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5'],
  ['R7C6', 'R8C7', 'R8C8', 'R7C9', 'R6C9', 'R5C8', 'R5C7', 'R6C6'],
  ['R4C1', 'R3C2', 'R3C3', 'R4C4', 'R5C4', 'R6C4'],
  ['R6C2', 'R6C1', 'R5C1', 'R5C2'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 7), new Given('R1C2', 2),
  new Given('R3C8', 3), new Given('R3C9', 6),
  new Given('R6C6', 5),
  new Given('R7C3', 5), new Given('R7C4', 6),
  new Given('R9C6', 8), new Given('R9C7', 5),
  ...lines.map((cells, index) => new NFA(tenLine, `ten-line-${index}`, ...cells)),
];
