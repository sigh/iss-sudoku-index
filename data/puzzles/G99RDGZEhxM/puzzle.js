// Title: Hidden German Whisper: Sum Up
// Author: 72kchunshuai
// Video: https://www.youtube.com/watch?v=G99RDGZEhxM
// Source: https://sudokupad.app/wsawi47iom

// Standard Sudoku, region sum lines, and at least one hidden whisper of
// length two or more under each blue line. No rules are omitted.
// Blue line paths, in traversal order, transcribed from the drawn strokes.
const lines = [
  [
    "R3C5",
    "R2C4",
    "R3C3",
    "R3C2",
    "R2C2",
    "R1C3",
    "R2C3"
  ],
  [
    "R3C9",
    "R3C8",
    "R2C8",
    "R1C8",
    "R2C7",
    "R3C6",
    "R2C5"
  ],
  [
    "R1C7",
    "R1C6",
    "R1C5"
  ],
  [
    "R5C3",
    "R4C3",
    "R4C2",
    "R3C1"
  ],
  [
    "R6C1",
    "R7C1",
    "R8C1",
    "R9C1"
  ],
  [
    "R4C9",
    "R4C8",
    "R4C7",
    "R3C7"
  ],
  [
    "R6C8",
    "R6C9",
    "R7C9",
    "R8C9",
    "R7C8",
    "R7C7",
    "R8C7"
  ],
  [
    "R6C3",
    "R6C2",
    "R7C2",
    "R7C3"
  ],
  [
    "R8C2",
    "R9C2",
    "R9C3",
    "R9C4",
    "R9C5",
    "R8C5",
    "R8C4",
    "R7C4"
  ]
];
const regionSums = lines.map(cells => new RegionSumLine(...cells));
// A two-cell whisper is allowed, so existence of any qualifying consecutive
// pair is necessary and sufficient for a hidden whisper of length at least two.
const hiddenWhispers = lines.map(cells => new Or(
  cells.slice(1).map((cell, i) => new Whisper(5, cells[i], cell))
));
return [
  new Shape('9x9'),
  // The single printed given.
  new Given('R1C4', 4),
  ...regionSums,
  ...hiddenWhispers,
];
