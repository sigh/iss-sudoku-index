// Title: Threes in the Corners
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=KLfu8wAxVck
// Source: https://app.crackingthecryptic.com/7cpn3mkodg

// Normal Sudoku; equal digits may not be a chess knight's move apart. A 9-cell
// south-east thermometer starts at R1C1. The distinct 6-cell thermometer has an
// unknown bulb in column 1, so one of the three non-overlapping placements applies.
const shortThermos = [2, 3, 4].map(row =>
  new Thermo(...Array.from({ length: 6 }, (_, offset) => makeCellId(row + offset, 1 + offset)))
);

return [
  new Shape('9x9'),
  new Given('R1C9', 3),
  new Given('R9C1', 3),
  new AntiKnight(),
  new Thermo('R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
  new Or(shortThermos),
];
