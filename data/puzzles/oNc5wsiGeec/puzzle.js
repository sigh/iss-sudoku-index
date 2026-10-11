// Title: Hidden German Whisper: Warm Up
// Author: 72kchunshuai
// Video: https://www.youtube.com/watch?v=oNc5wsiGeec
// Source: https://sudokupad.app/86adt4oeim

// Normal Sudoku, bulb-first thermometers, and at least one hidden German
// Whisper of length at least two wholly beneath each thermometer are encoded.
// Drawn grey thermometer paths, ordered from their matching circular bulbs.
const paths = [
  [
    "R1C1",
    "R2C1",
    "R2C2",
    "R1C2"
  ],
  [
    "R7C3",
    "R6C3",
    "R5C3",
    "R4C3",
    "R3C3"
  ],
  [
    "R3C7",
    "R4C7",
    "R5C7",
    "R6C7",
    "R7C7"
  ],
  [
    "R2C9",
    "R2C8",
    "R1C8",
    "R1C9"
  ],
  [
    "R8C9",
    "R8C8",
    "R9C8"
  ],
  [
    "R9C1",
    "R9C2",
    "R8C2",
    "R8C1"
  ],
  [
    "R4C4",
    "R4C5",
    "R3C4",
    "R2C5"
  ],
  [
    "R7C4",
    "R8C5",
    "R8C6"
  ]
];
const thermometers = paths.map(cells => new Thermo(...cells));
// A qualifying hidden line contains a qualifying consecutive pair; conversely
// any qualifying pair is itself an allowed two-cell hidden line. Disjoin over
// every consecutive pair on each drawn path without fixing its hidden position.
const hiddenWhispers = paths.map(cells => new Or(
  cells.slice(1).map((cell, i) => new Whisper(5, cells[i], cell))
));
return [
  new Shape('9x9'),
  // The single printed given.
  new Given('R9C6', 6),
  ...thermometers,
  ...hiddenWhispers,
];
