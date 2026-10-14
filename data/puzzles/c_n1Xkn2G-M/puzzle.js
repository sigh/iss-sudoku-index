// Title: Quartet
// Author: Qodec
// Video: https://www.youtube.com/watch?v=c_n1Xkn2G-M
// Source: https://sudokupad.app/rf7exik4cu

// Normal Sudoku and Greatest Cell Lines; all drawn lines are included.
const shape = new Shape('9x9');
// The fourteen drawn line paths.
const lines = [
  [
    "R6C4",
    "R6C3",
    "R6C2",
    "R6C1"
  ],
  [
    "R5C1",
    "R4C1",
    "R4C2",
    "R5C3"
  ],
  [
    "R2C1",
    "R3C1",
    "R3C2",
    "R2C3"
  ],
  [
    "R1C4",
    "R1C3",
    "R1C2",
    "R1C1"
  ],
  [
    "R1C6",
    "R1C7",
    "R1C8",
    "R2C7"
  ],
  [
    "R2C6",
    "R3C6",
    "R4C6",
    "R5C6"
  ],
  [
    "R6C5",
    "R5C5",
    "R4C5",
    "R5C4"
  ],
  [
    "R2C9",
    "R3C9",
    "R4C9",
    "R5C9"
  ],
  [
    "R4C8",
    "R5C8",
    "R6C8",
    "R7C8"
  ],
  [
    "R5C7",
    "R6C7",
    "R7C7",
    "R8C7"
  ],
  [
    "R9C7",
    "R9C8",
    "R9C9",
    "R8C9"
  ],
  [
    "R7C5",
    "R7C6",
    "R8C6"
  ],
  [
    "R7C3",
    "R7C4",
    "R8C4"
  ],
  [
    "R9C5",
    "R9C4",
    "R9C3",
    "R9C2"
  ]
];
// Sorted digits retain multiplicity. The greatest digit beats every other
// pair precisely when it exceeds the second and third greatest digits' sum.
// Positive digits then ensure that no other cell can also meet the condition.
const greatest = lines.map(cells => {
  const spec = NFA.encodeSpec({
    startState: { digits: [] },
    transition: ({ digits }, value) => ({
      digits: [...digits, value].sort((a, b) => b - a),
    }),
    accept: ({ digits }) => digits.length === cells.length &&
      digits[0] > digits[1] + digits[2],
    maxDepth: cells.length,
  }, shape);
  return new NFA(spec, 'Greatest Cell', cells);
});
return [shape, ...greatest];
