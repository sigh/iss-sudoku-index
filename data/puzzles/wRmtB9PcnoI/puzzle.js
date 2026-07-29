// Title: Slogermo
// Author: Catmandoku
// Video: https://www.youtube.com/watch?v=wRmtB9PcnoI
// Source: https://app.crackingthecryptic.com/QJ2QgfFn9b

// Normal Sudoku applies. Green lines are whispers with difference at least 5.
// Grey SLOW thermos are non-decreasing from their circular bulbs. Disjoint sets
// forbid a digit in the same relative position of two 3x3 boxes.
const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);
const whispers = [
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R2C6', 'R1C6', 'R1C5'],
  ['R4C9', 'R5C9'],
  ['R8C1', 'R9C2', 'R9C1', 'R8C2'],
  ['R8C5', 'R8C6', 'R7C6', 'R7C7', 'R8C8', 'R7C8'],
];
// Drawn green line paths, transcribed from the source geometry.
const slowThermos = [
  ['R1C1', 'R2C1', 'R2C2', 'R3C3', 'R2C4', 'R2C5', 'R1C6'],
  ['R8C8', 'R9C7', 'R8C7', 'R9C8', 'R8C9', 'R7C8', 'R7C7'],
  ['R5C7', 'R5C8'],
  ['R6C3', 'R5C4', 'R5C3', 'R4C4', 'R3C5', 'R4C6', 'R5C5', 'R6C6'],
];
// Each list begins at its matching grey circular bulb in the source drawing.

return [
  new Shape('9x9'),
  new DisjointSets(),
  ...whispers.map((cells) => new Whisper(5, ...cells)),
  ...slowThermos.map((cells) => new Pair(slowThermoKey, 'slow thermo', ...cells)),
];
