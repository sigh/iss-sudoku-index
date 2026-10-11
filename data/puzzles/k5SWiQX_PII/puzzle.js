// Title: Segmented Thermo
// Author: FIT7Y
// Video: https://www.youtube.com/watch?v=k5SWiQX_PII
// Source: https://sudokupad.app/yv8tacezb8

// Normal Sudoku. Diamonds divide the line into strictly increasing segments
// in either direction; each dividing diamond belongs to both adjacent segments.

// The continuous grey line, in traversal order from R7C9 to R5C3.
const path = ["R7C9", "R7C8", "R7C7", "R8C7", "R8C8", "R8C9", "R9C9", "R9C8", "R9C7", "R9C6", "R8C6", "R7C6", "R7C5", "R8C5", "R9C5", "R9C4", "R8C4", "R7C4", "R7C3", "R8C3", "R9C3", "R9C2", "R9C1", "R8C1", "R8C2", "R7C2", "R7C1", "R6C1", "R6C2", "R6C3", "R6C4", "R6C5", "R6C6", "R5C6", "R5C5", "R5C4", "R4C4", "R4C5", "R4C6", "R4C7", "R5C7", "R6C7", "R6C8", "R6C9", "R5C9", "R5C8", "R4C8", "R4C9", "R3C9", "R3C8", "R2C8", "R2C9", "R1C9", "R1C8", "R1C7", "R2C7", "R3C7", "R3C6", "R2C6", "R1C6", "R1C5", "R2C5", "R3C5", "R3C4", "R2C4", "R1C4", "R1C3", "R2C3", "R2C2", "R1C2", "R1C1", "R2C1", "R3C1", "R4C1", "R5C1", "R5C2", "R4C2", "R3C2", "R3C3", "R4C3", "R5C3"];
// The 31 grey diamonds drawn at cell centres on the line.
const diamonds = new Set(["R1C1", "R1C3", "R1C8", "R2C6", "R2C3", "R2C1", "R3C3", "R3C4", "R3C7", "R3C8", "R4C9", "R4C6", "R4C2", "R4C1", "R6C3", "R6C4", "R6C7", "R5C9", "R5C5", "R7C9", "R7C7", "R7C4", "R8C2", "R8C3", "R8C6", "R8C8", "R9C7", "R9C5", "R9C1", "R5C3", "R6C1"]);
const cuts = path.map((cell, i) => diamonds.has(cell) ? i : -1)
  .filter(i => i >= 0);
const segments = cuts.slice(1).map((end, i) => path.slice(cuts[i], end + 1));
const segmentedThermos = segments.map(cells =>
  new Or([new Thermo(...cells), new Thermo(...cells.slice().reverse())]));

return [
  new Shape('9x9'),
  // The single printed given.
  new Given('R7C3', 7),
  ...segmentedThermos,
];
