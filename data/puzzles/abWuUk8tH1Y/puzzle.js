// Title: Antechamber
// Author: Blobz
// Video: https://www.youtube.com/watch?v=abWuUk8tH1Y
// Source: https://sudokupad.app/blobz/antechamber

// Standard Sudoku. Box borders split each blue line into equal-sum segments.
// Pink lines are non-repeating consecutive sets. Each Quad lists the digits
// that must appear in the four cells touching its circle.

const blueRegionSumLines = [
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
  // The drawing closes back onto R7C4. Do not repeat that endpoint here:
  // RegionSumLine would interpret it as a new one-cell box segment.
  [
    'R7C4', 'R7C5', 'R6C6', 'R5C7', 'R4C7', 'R3C6',
    'R2C5', 'R2C4', 'R3C3', 'R4C2', 'R5C2', 'R6C3',
  ],
];

const pinkRenbanLines = [
  ['R8C9', 'R9C9', 'R9C8'],
  ['R5C3', 'R6C2', 'R7C3', 'R6C4'],
  ['R2C6', 'R3C5', 'R4C6', 'R3C7'],
  ['R3C2', 'R4C3', 'R3C4', 'R2C3'],
  ['R6C5', 'R7C6', 'R6C7', 'R5C6'],
];

const blueLines = blueRegionSumLines.map(
  cells => new RegionSumLine(...cells));
const pinkLines = pinkRenbanLines.map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...blueLines,
  ...pinkLines,
  new Quad('R4C4', 1, 2, 3, 4),
  new Quad('R4C1', 1, 9),
  new Quad('R4C7', 2, 9),
  new Quad('R1C4', 4, 9),
  new Quad('R7C4', 3, 9),
  new Quad('R8C1', 7, 8),
  new Quad('R1C8', 7, 9),
  new Quad('R8C8', 5),
];
