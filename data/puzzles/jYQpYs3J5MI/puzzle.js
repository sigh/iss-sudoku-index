// Title: Under the Spell of Sudoku
// Author: Jack Boettcher
// Video: https://www.youtube.com/watch?v=jYQpYs3J5MI
// Source: https://app.crackingthecryptic.com/sudoku/6BQ7BjmQBg

// Normal sudoku rules apply, and each coloured region contains the digits
// 1-9. Along thermometers, digits increase from the bulb.
//
// Six colours are shaded across 54 of the 81 cells (27 cells are left
// uncoloured); each colour's nine cells form one region required to contain
// 1-9, in addition to the rows, columns, and standard 3x3 boxes.

const givens = [
  new Given('R2C7', 6),
  new Given('R3C6', 5),
  new Given('R6C6', 6),
  new Given('R8C1', 8),
];

// Coloured regions (each region's nine cells drawn in one fill colour on
// the board).
const colouredRegions = [
  new AllDifferent('R1C2', 'R1C3', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R4C3', 'R5C2', 'R5C1'), // blue
  new AllDifferent('R6C1', 'R7C1', 'R8C1', 'R6C2', 'R6C3', 'R7C3', 'R8C3', 'R9C3', 'R9C2'), // brown
  new AllDifferent('R9C6', 'R8C5', 'R7C6', 'R6C5', 'R9C4', 'R8C4', 'R7C4', 'R6C4', 'R5C4'), // purple
  new AllDifferent('R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C5', 'R5C6', 'R4C6', 'R3C6', 'R2C6'), // lime
  new AllDifferent('R2C7', 'R2C8', 'R1C9', 'R2C9', 'R3C7', 'R4C7', 'R4C8', 'R3C9', 'R4C9'), // red
  new AllDifferent('R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R8C7', 'R7C7', 'R6C7'), // gold
];

// Thermometers (bulb-first cell order; each bulb is drawn as a filled
// circle at the first cell of its line).
const thermos = [
  new Thermo('R4C5', 'R3C5', 'R2C5', 'R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new Thermo('R5C7', 'R5C8', 'R6C8', 'R7C8', 'R8C8'),
  new Thermo('R9C9', 'R8C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...colouredRegions,
  ...thermos,
];
