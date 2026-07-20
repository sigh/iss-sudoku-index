// Title: Bits and arrows
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=9ecB_ZFdXUI
// Source: https://sudokupad.app/wut7orsq8b

// Each clue lists its arrow cell, followed by its four orthogonal neighbours
// starting in the arrow direction and proceeding clockwise.
const arrows = [
  ['R5C3', 'R5C4', 'R6C3', 'R5C2', 'R4C3'],
  ['R3C5', 'R3C6', 'R4C5', 'R3C4', 'R2C5'],
  ['R8C2', 'R8C3', 'R9C2', 'R8C1', 'R7C2'],
  ['R7C7', 'R7C8', 'R8C7', 'R7C6', 'R6C7'],
  ['R2C6', 'R3C6', 'R2C5', 'R1C6', 'R2C7'],
  ['R6C5', 'R7C5', 'R6C4', 'R5C5', 'R6C6'],
  ['R6C4', 'R7C4', 'R6C3', 'R5C4', 'R6C5'],
  ['R5C2', 'R6C2', 'R5C1', 'R4C2', 'R5C3'],
  ['R4C4', 'R5C4', 'R4C3', 'R3C4', 'R4C5'],
  ['R3C3', 'R3C2', 'R2C3', 'R3C4', 'R4C3'],
  ['R2C5', 'R2C4', 'R1C5', 'R2C6', 'R3C5'],
  ['R5C6', 'R5C5', 'R4C6', 'R5C7', 'R6C6'],
  ['R7C8', 'R7C7', 'R6C8', 'R7C9', 'R8C8'],
  ['R5C4', 'R5C3', 'R4C4', 'R5C5', 'R6C4'],
  ['R8C4', 'R9C4', 'R8C3', 'R7C4', 'R8C5'],
  ['R8C8', 'R7C8', 'R8C9', 'R9C8', 'R8C7'],
  ['R3C7', 'R2C7', 'R3C8', 'R4C7', 'R3C6'],
  ['R4C5', 'R3C5', 'R4C6', 'R5C5', 'R4C4'],
  ['R4C6', 'R3C6', 'R4C7', 'R5C6', 'R4C5'],
  ['R5C8', 'R4C8', 'R5C9', 'R6C8', 'R5C7'],
  ['R5C5', 'R4C5', 'R5C6', 'R6C5', 'R5C4'],
  ['R6C6', 'R5C6', 'R6C7', 'R7C6', 'R6C5'],
  ['R6C8', 'R5C8', 'R6C9', 'R7C8', 'R6C7'],
];

const binaryParityMachine = NFA.encodeSpec({
  startState: { digit: null, bit: 0 },
  transition: ({ digit, bit }, value) => {
    if (digit === null) return { digit: value, bit: 0 };
    if (bit >= 4) return undefined;

    // The code is the ordinary four-bit representation of the digit, most
    // significant bit first. Even neighbour digits represent a 1 (ON).
    const expectedEven = (digit >> (3 - bit)) & 1;
    if (Number(value % 2 === 0) !== expectedEven) return undefined;
    return { digit, bit: bit + 1 };
  },
  accept: ({ digit, bit }) => digit !== null && bit === 4,
}, 9);

const arrowConstraints = arrows.map(
  cells => new NFA(binaryParityMachine, 'binary parity', ...cells));

return [
  new Shape('9x9'),
  ...arrowConstraints,
];
