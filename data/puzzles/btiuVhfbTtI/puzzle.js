// Title: Brittle Snowflakes
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=btiuVhfbTtI
// Source: https://app.crackingthecryptic.com/sudoku/GnhM7ppj24

// Standard 9x9 sudoku (rows, columns, boxes all-different; the default grid
// covers this, no Raw shape needed).
// Thermometers: digits strictly increase from the bulb (round end).
// Blue lines: every pair of cells joined by a drawn segment must differ by
// at least 6. Several blue lines share an endpoint (branch points R2C1,
// R7C3, R4C5, R6C8), so the fourteen drawn line entries below are kept
// separate rather than merged into fewer paths: each entry's own consecutive
// order already yields exactly the drawn segments, and Whisper binds only
// consecutive pairs in the list it is given, so this reproduces every edge
// of the branching shape without adding or dropping one.

const thermos = [
  // Each thermometer is 2 cells; listed bulb-first. Two of the four are
  // drawn tip-first in the payload, so their cell order is reversed here
  // (per describe-json-puzzle's tip-first note) to put the bulb first.
  new Thermo('R9C3', 'R8C3'),
  new Thermo('R4C8', 'R4C9'), // drawn tip-first; bulb was the last cell
  new Thermo('R8C8', 'R8C7'), // drawn tip-first; bulb was the last cell
  new Thermo('R7C6', 'R6C5'), // drawn tip-first; bulb was the last cell
];

const blueLines = [
  ['R2C3', 'R1C2', 'R2C1', 'R3C2', 'R4C1'],
  ['R2C1', 'R1C1'],
  ['R4C2', 'R5C1'],
  ['R6C1', 'R7C1'],
  ['R7C2', 'R7C3', 'R7C4'],
  ['R8C2', 'R7C3'],
  ['R4C3', 'R3C4', 'R4C5', 'R5C6'],
  ['R5C4', 'R4C5', 'R3C6', 'R2C5'],
  ['R4C7', 'R4C6', 'R4C5'],
  ['R2C7', 'R1C7', 'R2C8'],
  ['R1C4', 'R1C5'],
  ['R8C4', 'R9C5', 'R8C6', 'R9C7'],
  ['R5C8', 'R6C8', 'R7C9'],
  ['R5C9', 'R6C8', 'R7C7'],
].map(cells => new Whisper(6, ...cells));

return [
  new Shape('9x9'),
  ...thermos,
  ...blueLines,
];
