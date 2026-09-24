// Title: Crosshair Thermos
// Author: curlingclips
// Video: https://www.youtube.com/watch?v=VkN6sSAFklM
// Source: https://sudokupad.app/098obl852j

// Normal sudoku rules. Thermometers increase strictly from the bulb.
// X pairs sum to 10, V pairs sum to 5; not all XVs are given, so unmarked
// pairs are unconstrained. Fog/reveal behaviour is solving UI only.

// Thermometers, bulb first, from the grey line paths and bulb circles.
const thermos = [
  ['R5C5', 'R4C5', 'R3C5'],
  ['R5C5', 'R5C6', 'R5C7'],
  ['R5C5', 'R6C5', 'R7C5'],
  ['R5C5', 'R5C4', 'R5C3'],
  ['R1C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R4C9', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6'],
  ['R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'],
];

// XV pairs, from the fogged X/V edge markers.
const xPairs = [
  ['R3C4', 'R3C5'],
  ['R5C4', 'R6C4'],
];
const vPairs = [
  ['R4C6', 'R5C6'],
  ['R7C7', 'R8C7'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
];
