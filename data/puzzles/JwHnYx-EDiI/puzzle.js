// Title: Circuit 8
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=JwHnYx-EDiI
// Source: https://app.crackingthecryptic.com/nwvlk5shkh

// Normal sudoku rules apply. Digits on each thermometer strictly increase from
// its circular bulb to its tip. Every rule is encoded.

// The 18 drawn paths, each transcribed from its bulb underlay through the
// corresponding line entry in bulb-to-tip order.
const thermometers = [
  ['R4C1', 'R3C1', 'R3C2', 'R2C2'],
  ['R2C3', 'R3C3', 'R3C4', 'R4C4'],
  ['R5C2', 'R4C2', 'R4C3'],
  ['R5C3', 'R6C3', 'R6C2'],
  ['R7C5', 'R6C5', 'R6C4', 'R5C4'],
  ['R4C6', 'R5C6', 'R5C5'],
  ['R4C5', 'R3C5', 'R3C6', 'R2C6'],
  ['R1C6', 'R1C5', 'R2C5'],
  ['R2C8', 'R3C8', 'R3C7'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R4C8', 'R4C9', 'R5C9'],
  ['R7C9', 'R6C9', 'R6C8', 'R5C8'],
  ['R5C7', 'R6C7', 'R6C6', 'R7C6'],
  ['R7C7', 'R7C8', 'R8C8'],
  ['R8C1', 'R8C2', 'R7C2'],
  ['R8C4', 'R8C3', 'R9C3', 'R9C2'],
  ['R8C6', 'R9C6', 'R9C5'],
  ['R9C8', 'R9C9', 'R8C9'],
];

return [
  new Shape('9x9'),
  new Given('R4C7', 8),
  ...thermometers.map(cells => new Thermo(...cells)),
];
