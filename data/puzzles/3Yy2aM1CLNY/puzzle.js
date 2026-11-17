// Title: Magic Centre
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=3Yy2aM1CLNY
// Source: https://sudokupad.app/pp1t6f58l1

// Normal Sudoku; box 5 has equal row, column and diagonal sums.
// Green lines are whispers. Black dots have ratio 1:2; dots are not exhaustive.
// The eight green loops, with their closing endpoints retained.
const greenLoops = [
  [
    "R1C4",
    "R2C4",
    "R3C5",
    "R3C6",
    "R2C6",
    "R1C5",
    "R1C4"
  ],
  [
    "R8C4",
    "R9C5",
    "R9C6",
    "R8C6",
    "R7C5",
    "R7C4",
    "R8C4"
  ],
  [
    "R8C7",
    "R9C7",
    "R9C8",
    "R8C9",
    "R7C9",
    "R7C8",
    "R8C7"
  ],
  [
    "R5C7",
    "R6C7",
    "R6C8",
    "R5C9",
    "R4C9",
    "R4C8",
    "R5C7"
  ],
  [
    "R1C8",
    "R2C7",
    "R3C7",
    "R3C8",
    "R2C9",
    "R1C9",
    "R1C8"
  ],
  [
    "R8C1",
    "R9C1",
    "R9C2",
    "R8C3",
    "R7C3",
    "R7C2",
    "R8C1"
  ],
  [
    "R5C1",
    "R6C1",
    "R6C2",
    "R5C3",
    "R4C3",
    "R4C2",
    "R5C1"
  ],
  [
    "R1C2",
    "R2C1",
    "R3C1",
    "R3C2",
    "R2C3",
    "R1C3",
    "R1C2"
  ]
];
// The four drawn black dots.
const blackDots = [
  ['R8C8', 'R9C8'], ['R8C9', 'R9C9'],
  ['R3C2', 'R4C2'], ['R4C7', 'R5C7'],
];
const magicRows = [4, 5, 6].map(r => [4, 5, 6].map(c => makeCellId(r, c)));
const magicColumns = [4, 5, 6].map(c => [4, 5, 6].map(r => makeCellId(r, c)));
const magicDiagonals = [
  [0, 1, 2].map(i => makeCellId(4 + i, 4 + i)),
  [0, 1, 2].map(i => makeCellId(4 + i, 6 - i)),
];
return [
  new Shape('9x9'),
  new EqualSum(...magicRows, ...magicColumns, ...magicDiagonals),
  ...greenLoops.map(cells => new Whisper(5, ...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
