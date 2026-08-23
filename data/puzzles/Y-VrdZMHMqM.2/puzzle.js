// Title: August 14, 2021: Surplus Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Y-VrdZMHMqM
// Source: https://app.crackingthecryptic.com/sudoku/4dgGmtf6RQ

// Place 1-7 so each row and column contains each digit exactly once (normal
// Sudoku lines). Each outlined region holds 8 cells and must contain each
// digit at least once -- by pigeonhole at least one digit repeats in every
// region, and the rule places no cap on repeats.
//
// The six regions tile 48 of the grid's 49 cells (a pinwheel around one
// uncovered center cell); they are not standard boxes, so the engine's
// default box all-different is disabled and each region is instead given a
// ContainAtLeast over all 7 digits, which requires every value present at
// least as many times as it is repeated in the value list -- once each here.

const shape = new Shape('7x7');

const givens = [
  new Given('R1C2', 1), new Given('R1C6', 5),
  new Given('R2C1', 2), new Given('R2C3', 3), new Given('R2C5', 6), new Given('R2C7', 4),
  new Given('R3C2', 4), new Given('R3C6', 3),
  new Given('R5C2', 7), new Given('R5C6', 2),
  new Given('R6C1', 4), new Given('R6C3', 5), new Given('R6C5', 1), new Given('R6C7', 3),
  new Given('R7C2', 6), new Given('R7C6', 4),
];

// Regions transcribed from the puzzle's drawn region outlines. R4C4 belongs
// to no region.
const regions = [
  ['R1C1', 'R1C2', 'R2C2', 'R3C2', 'R3C3', 'R2C3', 'R2C4', 'R3C4'],
  ['R1C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R2C6', 'R1C6', 'R1C7'],
  ['R2C7', 'R3C7', 'R3C6', 'R4C6', 'R4C5', 'R4C7', 'R5C7', 'R6C7'],
  ['R7C7', 'R7C6', 'R6C6', 'R5C6', 'R5C5', 'R6C5', 'R6C4', 'R5C4'],
  ['R7C5', 'R7C4', 'R7C3', 'R6C3', 'R5C3', 'R6C2', 'R7C2', 'R7C1'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R5C2', 'R4C2', 'R4C3'],
];
const ALL_DIGITS = '1_2_3_4_5_6_7';
const regionConstraints = regions.map(
  cells => new ContainAtLeast(ALL_DIGITS, ...cells));

return [
  shape,
  new NoBoxes(),
  ...givens,
  ...regionConstraints,
];
