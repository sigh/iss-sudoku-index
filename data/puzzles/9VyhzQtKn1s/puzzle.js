// Title: Fowey River 59
// Author: Cornishjohn
// Video: https://www.youtube.com/watch?v=9VyhzQtKn1s
// Source: https://sudokupad.app/ybb0m5tr4e

// Normal sudoku rules apply. Digits along the arrow sum to the number in the
// pill which is a 2-digit number reading left-to-right. Digits along a
// thermometer increase from the bulb end. Digits in cages do not repeat, and
// sum to the small clue, if given. A clue outside the grid gives the sum of
// the digits in the indicated direction.

const givens = [
  new Given('R1C8', 7),
  new Given('R3C8', 6),
];

const thermometer = new Thermo(
  'R7C6', 'R6C6', 'R5C6', 'R4C6', 'R3C6', 'R2C6', 'R1C6');

// One arrow's pill is a rounded rectangle drawn over R8C8/R8C9 (an in-grid
// edge-centred overlay), not a separate outside clue: those two grid cells
// read left-to-right form the 2-digit total for the arm below.
const pillArrow = new PillArrow(
  2, 'R8C8', 'R8C9',
  'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2',
  'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7');

// The other two arrows point in from off-grid corners along the full
// diagonals; their pills are printed outside the grid as a fixed "59" (the
// puzzle's title number) rather than read from cells, so each is a plain
// fixed-sum arrow along its diagonal.
const diagonalArrows = [
  new Sum(59, 'R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'),
  new Sum(59, 'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
];

const cages = [
  new Cage(5, 'R1C5'),
  new Cage(24, 'R2C4', 'R2C5', 'R3C3', 'R3C4', 'R3C5'),
  new Cage(36, 'R4C3', 'R4C4', 'R4C5', 'R5C2', 'R5C3', 'R5C4', 'R5C5'),
  new AllDifferent(
    'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5'),
  new Cage(15, 'R3C7', 'R4C7'),
  new Cage(11, 'R5C7', 'R5C8'),
  new Cage(14, 'R6C7', 'R6C8'),
  new Cage(17, 'R7C7', 'R7C8', 'R7C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  thermometer,
  pillArrow,
  ...diagonalArrows,
  ...cages,
];
