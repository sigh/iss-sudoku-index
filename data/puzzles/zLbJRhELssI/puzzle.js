// Title: Bow Fishing
// Author: Scott Williams
// Video: https://www.youtube.com/watch?v=zLbJRhELssI
// Source: https://sudokupad.app/huv80pdliu

// Standard Sudoku. The drawn killer cages have distinct digits summing to their
// printed totals; arrow shafts sum to their circles; thermometers increase from
// bulb to tip.

// Cage cells and totals transcribed from the drawn killer-cage clues.
const cages = [
  new Cage(14, 'R9C3', 'R9C4'),
  new Cage(29, 'R3C3', 'R3C4', 'R4C3', 'R4C4'),
  new Cage(17, 'R3C9', 'R4C9'),
  new Cage(25, 'R6C3', 'R6C4', 'R7C3', 'R7C4'),
  new Cage(15, 'R9C6', 'R9C7'),
  new Cage(22, 'R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new Cage(9, 'R3C1', 'R4C1'),
  new Cage(10, 'R1C3', 'R1C4'),
  new Cage(15, 'R6C6', 'R6C7', 'R7C6', 'R7C7'),
  new Cage(7, 'R6C9', 'R7C9'),
  new Cage(12, 'R6C1', 'R7C1'),
  new Cage(3, 'R1C6', 'R1C7'),
];

// Arrow paths are transcribed from each drawn shaft, circle first. The shared
// R7C7 circle has two shafts, so each shaft is a separate arrow constraint.
const arrows = [
  new Arrow('R3C1', 'R2C2', 'R1C3'),
  new Arrow('R3C9', 'R2C8', 'R1C7'),
  new Arrow('R9C3', 'R8C2', 'R7C1'),
  new Arrow('R7C7', 'R7C8', 'R8C9'),
  new Arrow('R7C7', 'R8C7', 'R9C8'),
];

// Thermometer paths are transcribed bulb first.
const thermometers = [
  new Thermo('R7C2', 'R6C2'),
  new Thermo('R2C7', 'R2C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
  ...thermometers,
];
