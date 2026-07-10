// Title: Increasing Differences
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=0ASRXrrz-K4
// Source: https://sudokupad.app/inhwpyj59k

// Normal sudoku rules apply. Along each marked diagonal, read left to right,
// neighbouring digits have exact absolute differences 1, 2, 3, ...

const increasingDifferenceNFA = NFA.encodeSpec({
  startState: { previous: null, nextDiff: 1 },

  transition: ({ previous, nextDiff }, value) => {
    if (previous === null) {
      return { previous: value, nextDiff };
    }
    if (previous !== null && Math.abs(value - previous) !== nextDiff) {
      return undefined;
    }
    return { previous: value, nextDiff: nextDiff + 1 };
  },

  accept: () => true,
}, 9);

const lines = [
  ['R3C1', 'R2C2', 'R1C3'],
  ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'],
  ['R9C7', 'R8C8', 'R7C9'],
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
  ['R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9'],
];

const constraints = [
  new Given('R4C2', 2),
  new Given('R8C6', 4),
];

for (const line of lines) {
  constraints.push(new NFA(increasingDifferenceNFA, 'increasing differences', ...line));
}

return constraints;
