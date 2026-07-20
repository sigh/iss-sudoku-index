// Title: There's a Moose Loose
// Author: billybeth
// Video: https://www.youtube.com/watch?v=dAW5dM7N1Vw
// Source: https://sudokupad.app/kcemnajmao

// A Scottish Sum line follows the Fibonacci recurrence modulo 10 from one of
// its ends. Each Or represents the solver's choice of reading direction.
const scottishSumMachine = NFA.encodeSpec({
  startState: { previous2: null, previous1: null },
  transition: ({ previous2, previous1 }, value) => {
    if (previous2 === null) return { previous2: value, previous1: null };
    if (previous1 === null) return { previous2, previous1: value };
    if (value !== (previous2 + previous1) % 10) return undefined;
    return { previous2: previous1, previous1: value };
  },
  accept: ({ previous1 }) => previous1 !== null,
}, 9);

const scottishSumLines = [
  [
    'R9C8', 'R9C7', 'R8C8', 'R7C8', 'R6C7', 'R5C8', 'R4C8', 'R3C8',
    'R2C8', 'R1C8', 'R1C7', 'R2C6', 'R1C5', 'R2C4', 'R3C5', 'R4C5',
    'R5C4', 'R6C5', 'R7C5', 'R8C5', 'R9C5', 'R9C4', 'R9C3', 'R9C2',
    'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C3', 'R2C2', 'R1C3',
  ],
  ['R4C6', 'R4C7', 'R5C6'],
  ['R4C9', 'R3C9', 'R2C9'],
];

const scottishSums = scottishSumLines.map((cells, index) => new Or([
  new NFA(scottishSumMachine, `Scottish Sum ${index + 1}`, ...cells),
  new NFA(scottishSumMachine, `Scottish Sum ${index + 1}`, ...cells.toReversed()),
]));

return [
  new Shape('9x9'),
  ...scottishSums,
  new BlackDot('R1C7', 'R2C7'),
  new WhiteDot('R2C7', 'R2C8'),
];
