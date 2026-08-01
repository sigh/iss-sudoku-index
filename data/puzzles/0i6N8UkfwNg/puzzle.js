// Title: Not Just Once
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=0i6N8UkfwNg
// Source: https://sudokupad.app/james-sinclair/not-just-once

// Rules encoded:
//  - Normal sudoku (rows/columns/boxes, default).
//  - The indicated / diagonal has no repeated digits.
//  - Each killer cage sums to its displayed total with no repeated digit.
//  - White dots join consecutive digits; black dots join digits in a 1:2 ratio.

// Killer cages transcribed from the drawn cage outlines and totals.
const cages = [
  [11, 'R7C1', 'R8C1'], [11, 'R6C2', 'R7C2'], [11, 'R5C3', 'R6C3'],
  [11, 'R4C4', 'R5C4'], [11, 'R3C5', 'R4C5'], [11, 'R2C6', 'R3C6'],
  [11, 'R1C7', 'R2C7'], [11, 'R9C2', 'R9C3'], [11, 'R8C3', 'R8C4'],
  [11, 'R7C4', 'R7C5'], [11, 'R6C5', 'R6C6'], [10, 'R5C6', 'R5C7'],
  [11, 'R4C7', 'R4C8'], [11, 'R3C8', 'R3C9'],
];

// Kropki dots transcribed from the drawn adjacent-cell markers.
const whiteDots = [['R8C7', 'R8C8'], ['R4C1', 'R5C1']];
const blackDots = [['R8C5', 'R9C5'], ['R2C3', 'R2C4']];

return [
  new Shape('9x9'),
  new Diagonal(1),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
];
