// Title: Feb. 12, 2022: Extra Regions
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=lDlym71OqIg
// Source: https://tinyurl.com/2uxbf2b7
//
// Normal sudoku rules apply. Additionally, each shaded region must contain
// the digits from 1-9 exactly once each. Four shaded regions, 9 cells each,
// drawn as the payload's `extraregion` entries.

const extraRegions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C1', 'R2C2', 'R3C1', 'R3C2'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
];

return [
  new Shape('9x9'),

  new Given('R1C5', 8), new Given('R1C6', 2),
  new Given('R3C1', 2), new Given('R3C4', 5), new Given('R3C5', 6),
  new Given('R3C6', 7), new Given('R3C7', 8),
  new Given('R4C1', 6), new Given('R4C3', 1), new Given('R4C7', 7),
  new Given('R5C1', 5), new Given('R5C3', 2), new Given('R5C5', 4),
  new Given('R5C7', 6), new Given('R5C9', 3),
  new Given('R6C3', 3), new Given('R6C7', 5), new Given('R6C9', 2),
  new Given('R7C3', 4), new Given('R7C4', 3), new Given('R7C5', 2),
  new Given('R7C6', 1), new Given('R7C9', 6),
  new Given('R9C4', 6), new Given('R9C5', 9),

  // Each shaded region is a 9-cell all-different set on the 1-9 grid, which
  // forces it to contain each digit exactly once.
  ...extraRegions.map((cells) => new AllDifferent(...cells)),
];
