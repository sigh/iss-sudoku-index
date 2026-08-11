// Title: Jul 7, 2022: Extra Regions
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=PHOuWUax7J8
// Source: https://tinyurl.com/5cmb6bkt

// Normal Sudoku rules apply. Each of the four grey areas must also contain
// each digit 1-9 exactly once, in addition to the normal row/column/box
// constraints.
const givens = [
  ['R1C6', 1], ['R1C7', 2], ['R1C8', 3], ['R1C9', 4],
  ['R2C9', 5], ['R3C9', 6],
  ['R4C2', 1], ['R4C3', 2], ['R4C4', 3], ['R4C5', 5], ['R4C6', 8], ['R4C9', 7],
  ['R5C2', 8], ['R5C6', 9],
  ['R6C2', 6], ['R6C6', 4],
  ['R7C2', 2], ['R7C6', 5],
  ['R8C2', 7], ['R8C3', 8], ['R8C4', 9], ['R8C5', 1], ['R8C6', 6],
];
// Grey extra regions, from the payload's `extraregion` list.
const extraRegions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
  ['R5C3', 'R5C4', 'R5C5', 'R6C3', 'R6C4', 'R6C5', 'R7C3', 'R7C4', 'R7C5'],
];
return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...extraRegions.map(cells => new AllDifferent(...cells)),
];
