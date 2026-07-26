// Title: Thermonuclear Reaction
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=FLtAlIA_lVk
// Source: https://sudokupad.app/wf01kkrga1

// Normal sudoku rules apply. Four 9-cell cages have no printed total, so each
// is encoded as an all-different constraint only ("Digits cannot repeat
// within a cage"). Five thermometers increase from the bulb. Five black dots
// mark a 1:2 ratio between their two cells; the ruleset states not all dots
// are given, so absence of a dot elsewhere carries no information and no
// negative constraint is added.

// Cage cells, transcribed from the payload's killercage entries.
const cages = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C3', 'R2C4', 'R2C6', 'R2C7'],
  ['R3C1', 'R3C2', 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R6C2', 'R7C1', 'R7C2'],
  ['R8C3', 'R8C4', 'R8C6', 'R8C7', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R3C8', 'R3C9', 'R4C8', 'R4C9', 'R5C9', 'R6C8', 'R6C9', 'R7C8', 'R7C9'],
];

// Thermometer paths (bulb cell first), transcribed from the payload's
// thermometer entries.
const thermos = [
  ['R1C3', 'R2C2', 'R3C1'],
  ['R1C7', 'R2C8', 'R3C9'],
  ['R5C2', 'R4C3', 'R3C4', 'R2C5'],
  ['R6C1', 'R7C1', 'R8C2', 'R9C3'],
  ['R6C9', 'R7C9', 'R8C8', 'R9C7'],
];

// Black-dot pairs, transcribed from the payload's ratio entries.
const dots = [
  ['R9C6', 'R9C5'],
  ['R7C4', 'R6C4'],
  ['R6C1', 'R6C2'],
  ['R3C7', 'R4C7'],
  ['R2C8', 'R2C9'],
];

return [
  new Shape('9x9'),
  ...cages.map((cells) => new AllDifferent(...cells)),
  ...thermos.map((cells) => new Thermo(...cells)),
  ...dots.map(([a, b]) => new BlackDot(a, b)),
];
