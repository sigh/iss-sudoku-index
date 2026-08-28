// Title: Thermocouples
// Author: Ri Sa
// Video: https://www.youtube.com/watch?v=LwkNChSO2yE
// Source: https://cracking-the-cryptic.web.app/sudoku/RPRGmTqNtM

// Normal sudoku rules apply (default row/column/box all-different). Cells a
// knight's move apart may not repeat a digit (AntiKnight). Six thermometers
// require strictly increasing digits from the bulb to the tip (Thermo, one
// per line, listed bulb-first).

return [
  new Shape('9x9'),

  new Given('R2C4', 9),

  new AntiKnight(),

  new Thermo('R2C5', 'R1C4', 'R2C3', 'R3C4'),
  new Thermo('R3C5', 'R2C4'),
  new Thermo('R2C7', 'R3C6', 'R4C5'),
  new Thermo('R3C7', 'R4C8', 'R5C7', 'R4C6'),
  new Thermo('R6C7', 'R7C8', 'R8C7', 'R7C6', 'R6C5'),
  new Thermo('R7C7', 'R8C6', 'R7C5', 'R6C6'),
];
