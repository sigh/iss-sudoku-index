// Title: Underling
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=sCW4Y5P2Y8Y
// Source: https://sudokupad.app/james-sinclair/underling?setting-arrowsabovelines=1

// Normal sudoku rules apply, and all clues are standard.
//
// Cages: digits cannot repeat within a cage (no totals are given).
// Arrows: the sum of the digits along an arrow equals the digit in the
//   connected circle; digits can repeat on the arm if allowed elsewhere.
// German whispers: along the green line, adjacent digits differ by at
//   least 5.
// Digits in cells with a shaded circle are odd.
// Digits in cells separated by a white dot are consecutive.

const cages = [
  // Three 9-cell irregular cages: all-different only, no stated total.
  new AllDifferent(
    'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C4', 'R3C1', 'R4C1', 'R4C2'),
  new AllDifferent(
    'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'),
  new AllDifferent(
    'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C9', 'R3C9', 'R4C8', 'R4C9'),
];

const arrows = [
  // Four arrows share the single circle at R5C5, each with a 2-cell arm
  // running to a corner of the grid.
  new Arrow('R5C5', 'R4C6', 'R3C7'),
  new Arrow('R5C5', 'R4C4', 'R3C3'),
  new Arrow('R5C5', 'R6C4', 'R7C3'),
  new Arrow('R5C5', 'R6C6', 'R7C7'),
];

const whispers = [
  // Closed German whisper loop (difference >= 5, the default); repeat the
  // first cell to close it.
  new Whisper(
    'R8C4', 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C8', 'R3C7', 'R2C6',
    'R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1', 'R6C2', 'R7C3', 'R8C4'),
];

const oddCells = [
  // Shaded circles: restrict to odd candidates.
  new Given('R7C3', 1, 3, 5, 7, 9),
  new Given('R7C9', 1, 3, 5, 7, 9),
];

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
  ...whispers,
  ...oddCells,
  // White dot: R1C1/R1C2 are consecutive.
  new WhiteDot('R1C1', 'R1C2'),
];
