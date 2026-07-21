// Title: Because Two pi's Are Better Than One
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=ImW62y8dTRQ
// Source: https://sudokupad.app/yvpjt47o16

// The cyan cell coloring is thematic decoration and has no rule semantics.
const givens = [
  ['R2C6', 3],
  ['R3C7', 1],
  ['R4C8', 4],
  ['R6C2', 6],
  ['R7C3', 2],
  ['R8C4', 8],
].map(([cell, value]) => new Given(cell, value));

// Each source stroke is a separate thermometer, including the overlapping pairs.
const thermometers = [
  ['R6C7', 'R6C8', 'R6C9'],
  ['R6C7', 'R6C8', 'R7C8', 'R8C8', 'R9C8'],
  ['R6C7', 'R6C6', 'R6C5'],
  ['R6C7', 'R6C6', 'R7C6', 'R8C6', 'R9C6'],
  ['R3C8', 'R4C7', 'R3C6'],
  ['R2C7', 'R1C7', 'R1C8', 'R2C8'],
].map(cells => new Thermo(...cells));

// Arrow takes the bulb first, followed by the cells of its arm.
const arrows = [
  ['R1C3', 'R1C2', 'R1C1'],
  ['R1C3', 'R2C2', 'R3C2', 'R4C2'],
  ['R1C3', 'R2C4', 'R3C4', 'R4C4'],
  ['R1C3', 'R1C4', 'R1C5'],
  ['R7C2', 'R6C3', 'R7C4'],
  ['R8C2', 'R9C2', 'R9C3', 'R8C3'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...thermometers,
  ...arrows,
];
