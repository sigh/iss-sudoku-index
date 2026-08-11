// Title: Pressure Cooker
// Author: Derek Rocco
// Video: https://www.youtube.com/watch?v=wDBvFoul4ig
// Source: https://app.crackingthecryptic.com/sudoku/R2QR3QgL3p

// Normal sudoku rules apply. Digits along thermometers increase from the
// bulb. Two cells separated by a chess knight's move cannot contain
// identical digits. No givens.

// Thermometers, bulb cell first (drawn as a filled circle at that end),
// transcribed from the drawn line geometry.
const thermometers = [
  new Thermo('R1C9', 'R2C8'),
  new Thermo('R2C3', 'R3C3'),
  new Thermo('R7C4', 'R6C3', 'R5C3', 'R4C3', 'R3C4', 'R3C5', 'R3C6', 'R4C7'),
  new Thermo('R6C9', 'R5C8', 'R6C7'),
  new Thermo('R5C6', 'R4C6', 'R4C5'),
  new Thermo('R6C5', 'R6C4', 'R5C4'),
  new Thermo('R6C6', 'R5C5', 'R4C4'),
  new Thermo('R7C2', 'R8C1'),
  new Thermo('R9C4', 'R8C5', 'R7C6'),
];

return [
  new Shape('9x9'),
  ...thermometers,
  new AntiKnight(),
];
