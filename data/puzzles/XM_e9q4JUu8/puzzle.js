// Title: Sunday Surprise
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=XM_e9q4JUu8
// Source: https://app.crackingthecryptic.com/sudoku/jNh79RDfH9

// Normal 9x9 Sudoku and the thermometer runs recoverable in the playable grid.
// Bulb-first paths below are transcribed from the grey circular-bulb strokes;
// a branched figure becomes one Thermo for each arm.
const thermometers = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R4C3', 'R4C2'],
  ['R4C3', 'R3C3', 'R2C3', 'R1C3'],
  ['R5C5', 'R4C4', 'R3C4', 'R3C5', 'R3C6'],
  ['R5C5', 'R6C6', 'R7C6', 'R7C5', 'R7C4'],
  ['R9C7', 'R8C7', 'R7C7', 'R6C8', 'R7C9'],
  ['R8C8', 'R8C9'],
  ['R8C1', 'R7C1'],
];

// The source has no numerical outside visibility clues, so Skyscraper rules
// cannot be instantiated for individual lanes.
return [
  new Shape('9x9'),
  ...thermometers.map(cells => new Thermo(...cells)),
];
