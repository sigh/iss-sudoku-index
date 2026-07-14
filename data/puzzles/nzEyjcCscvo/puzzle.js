// Title: Simon's Sigil
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=nzEyjcCscvo
// Source: https://sudokupad.app/kszsitwn8p

// Normal sudoku + standard boxes.
// Thermo: increasing from bulb to tip.
// Modular lines: every 3 sequential cells contain one digit each of
// 1 mod 3 (147), 2 mod 3 (258), 0 mod 3 (369).
// Every thermometer is also a modular line over the same cells. Two
// thermometers (the ones through R5C5) share a bulb, so per the rules text
// the modular constraint is taken over their combined 5-cell line while the
// increasing (Thermo) constraint stays split into the two arms from the
// shared bulb.

const thermos = [
  ['R7C3', 'R7C4', 'R6C4', 'R6C3', 'R5C3', 'R5C4'],
  ['R3C7', 'R3C6', 'R4C6', 'R4C7', 'R5C7', 'R5C6'],
  ['R5C5', 'R4C4', 'R3C3'],
  ['R5C5', 'R6C6', 'R7C7'],
  ['R2C4', 'R3C4', 'R3C5', 'R2C6'],
  ['R8C6', 'R7C6', 'R7C5', 'R8C4'],
  ['R9C7', 'R8C8', 'R7C9', 'R6C9'],
  ['R1C3', 'R2C2', 'R3C1', 'R4C1'],
  ['R7C1', 'R8C2', 'R9C1'],
  ['R1C9', 'R2C8', 'R3C9'],
];

// Modular lines: same as the thermometers, except the two sharing a bulb at
// R5C5 combine into one 5-cell line for this rule.
const modularLines = [
  ['R7C3', 'R7C4', 'R6C4', 'R6C3', 'R5C3', 'R5C4'],
  ['R3C7', 'R3C6', 'R4C6', 'R4C7', 'R5C7', 'R5C6'],
  ['R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7'],
  ['R2C4', 'R3C4', 'R3C5', 'R2C6'],
  ['R8C4', 'R7C5', 'R7C6', 'R8C6'],
  ['R9C7', 'R8C8', 'R7C9', 'R6C9'],
  ['R1C3', 'R2C2', 'R3C1', 'R4C1'],
  ['R7C1', 'R8C2', 'R9C1'],
  ['R1C9', 'R2C8', 'R3C9'],
];

return [
  new Shape('9x9'),

  new Given('R1C5', 5),
  new Given('R4C9', 2),
  new Given('R6C1', 4),
  new Given('R9C5', 4),

  ...thermos.map((cells) => new Thermo(...cells)),
  ...modularLines.map((cells) => new Modular(3, ...cells)),
];
