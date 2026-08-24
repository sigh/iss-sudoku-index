// Title: Thermo Arrow Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=xPg2Vmug9LY
// Source: https://app.crackingthecryptic.com/sudoku/FTdq68MLg7

// Normal sudoku rules apply (default 9x9 grid, standard 3x3 boxes -- the
// payload's regions match the default box partition exactly). Digits along
// an arrow sum to the digit in that arrow's circle. Along thermometers,
// digits must increase from the bulb end.
//
// Arrow and thermometer cell paths are transcribed from the payload's
// `arrows` and `lines` entries (bulb cell first in each). One extra
// deepskyblue "line" entry in the payload has no waypoints and renders
// nothing; it is not encoded.

const arrows = [
  ['R1C2', 'R2C1', 'R3C1'],
  ['R1C3', 'R2C4', 'R3C4'],
  ['R1C5', 'R2C6', 'R3C6'],
  ['R2C9', 'R1C8', 'R1C7'],
  ['R3C9', 'R4C8', 'R4C7'],
  ['R5C1', 'R4C2', 'R4C3'],
  ['R7C1', 'R6C2', 'R6C3'],
  ['R8C1', 'R9C2', 'R9C3'],
  ['R9C5', 'R8C4', 'R7C4'],
  ['R9C7', 'R8C6', 'R7C6'],
  ['R9C8', 'R8C9', 'R7C9'],
  ['R5C9', 'R6C8', 'R6C7'],
  ['R5C6', 'R4C5', 'R3C5'],
  ['R6C5', 'R5C4', 'R4C4'],
].map((cells) => new Arrow(...cells));

const thermos = [
  ['R2C3', 'R2C4', 'R3C4', 'R3C5'],
  ['R4C4', 'R5C4', 'R5C3', 'R4C3'],
  ['R6C7', 'R6C6'],
  ['R8C7', 'R9C6'],
  ['R8C8', 'R9C9'],
].map((cells) => new Thermo(...cells));

return [
  new Shape('9x9'),
  ...arrows,
  ...thermos,
];
