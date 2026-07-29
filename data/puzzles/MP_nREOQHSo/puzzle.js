// Title: One Knight's Pilgrimage
// Author: Meggen033
// Video: https://www.youtube.com/watch?v=MP_nREOQHSo
// Source: https://sudokupad.app/dvtdkz8qc2

// Normal Sudoku rules apply. Cells a chess knight's move apart differ.
// Cages have distinct digits totaling their printed clues. Thermometers increase from bulb to tip.
// Fog only controls the puzzle's presentation and reveal behavior, so it has no solver constraint.
return [
  new Shape('9x9'),
  new AntiKnight(),

  // Cage cells and totals transcribed from the drawn killer cages.
  new Cage(3, 'R2C3', 'R3C3'),
  new Cage(7, 'R2C5', 'R3C5'),
  new Cage(5, 'R3C7', 'R3C8'),
  new Cage(7, 'R4C4', 'R4C5'),
  new Cage(5, 'R5C6', 'R6C6'),
  new Cage(7, 'R8C5', 'R8C6'),
  new Cage(5, 'R7C8', 'R8C8'),
  new Cage(5, 'R5C1', 'R6C1'),
  new Cage(8, 'R6C2', 'R6C3'),

  // Thermometer paths transcribed from the drawn bulbs toward their tips.
  new Thermo('R9C9', 'R8C9', 'R7C9'),
  new Thermo('R5C5', 'R5C4'),
];
