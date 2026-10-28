// Title: The Greatest Fog
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=x2g0KQHVDPs
// Source: https://sudokupad.app/jni23ia3hh

// Normal Sudoku; each green line has exactly one cell exceeding the sum
// of any other two cells on it. White dots are consecutive. Fog is reveal UI.
const shape = new Shape('9x9');
// Green strokes, including the four closed corner loops (each cell once).
const lines = [
  [
    "R6C3",
    "R5C3",
    "R4C3",
    "R3C3",
    "R3C4",
    "R3C5",
    "R3C6"
  ],
  [
    "R3C7",
    "R4C7",
    "R5C7",
    "R6C7",
    "R7C7"
  ],
  [
    "R7C6",
    "R7C5",
    "R7C4",
    "R7C3"
  ],
  [
    "R8C7",
    "R7C8",
    "R7C9"
  ],
  [
    "R3C2",
    "R2C3",
    "R1C4"
  ],
  [
    "R8C3",
    "R8C4",
    "R8C5"
  ],
  [
    "R7C1",
    "R6C1",
    "R5C2"
  ],
  [
    "R6C4",
    "R5C4",
    "R4C4"
  ],
  [
    "R6C5",
    "R5C5",
    "R4C5"
  ],
  [
    "R6C6",
    "R5C6",
    "R4C6"
  ],
  [
    "R8C8",
    "R8C9",
    "R9C9",
    "R9C8"
  ],
  [
    "R1C8",
    "R1C9",
    "R2C9",
    "R2C8"
  ],
  [
    "R8C1",
    "R8C2",
    "R9C2",
    "R9C1"
  ],
  [
    "R1C1",
    "R1C2",
    "R2C2",
    "R2C1"
  ]
];
// White dots drawn on cell borders.
const dots = [
  [
    "R7C8",
    "R8C8"
  ],
  [
    "R2C4",
    "R2C5"
  ],
  [
    "R2C2",
    "R2C3"
  ],
  [
    "R5C2",
    "R5C3"
  ],
  [
    "R4C8",
    "R4C9"
  ]
];
// State retains the three largest values, with multiplicity. The largest
// exceeds every pair among the other cells iff it exceeds second + third;
// positive digits then make that greatest cell unique.
const spec = NFA.encodeSpec({
  startState: { top: [] },
  transition: ({ top }, value) => ({top: [...top, value].sort((a,b) => b-a).slice(0,3)}),
  accept: ({ top }) => top.length === 3 && top[0] > top[1] + top[2],
}, shape);
return [shape,
  ...lines.map(cells => new NFA(spec, 'Greatest', cells)),
  ...dots.map(cells => new WhiteDot(...cells)),
];
