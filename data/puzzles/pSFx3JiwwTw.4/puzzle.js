// Title: Oct 8, 2021: Extra Regions
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=pSFx3JiwwTw
// Source: https://tinyurl.com/9ydk2vy9

// Standard 9x9 sudoku (rows, columns, 3x3 boxes) plus four extra 9-cell
// regions that must also contain the digits 1-9 exactly once each. Each
// extra region is encoded as AllDifferent, which -- over exactly nine cells
// restricted to the 1-9 domain -- is equivalent to "contains 1-9 once each".
// Region cell lists are transcribed from the payload's `extraregion` array.

const extraRegions = [
  // Region A (bottom-left)
  ['R6C1', 'R7C1', 'R7C2', 'R8C1', 'R8C3', 'R9C1', 'R9C2', 'R9C3', 'R9C4'],
  // Region B (top-left)
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C3', 'R3C1', 'R3C2', 'R4C1'],
  // Region C (bottom-right)
  ['R6C9', 'R7C8', 'R7C9', 'R8C7', 'R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  // Region D (top-right)
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C9', 'R3C8', 'R3C9', 'R4C9'],
];

return [
  new Shape('9x9'),

  ...extraRegions.map((cells) => new AllDifferent(...cells)),

  new Given('R2C5', 8),
  new Given('R3C3', 8), new Given('R3C4', 4), new Given('R3C6', 9), new Given('R3C7', 6),
  new Given('R4C3', 5), new Given('R4C4', 3), new Given('R4C6', 1), new Given('R4C7', 7),
  new Given('R5C2', 9), new Given('R5C5', 2), new Given('R5C8', 3),
  new Given('R6C3', 2), new Given('R6C4', 6), new Given('R6C6', 7), new Given('R6C7', 9),
  new Given('R7C3', 4), new Given('R7C4', 5), new Given('R7C6', 8), new Given('R7C7', 2),
  new Given('R8C5', 7),
];
