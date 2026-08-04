// Title: 2/1/23: Tortilla Chips II
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=wq0uqMK6c34
// Source: https://tinyurl.com/5n86d2wx

// Normal sudoku. Digits on either side of an X sum to 10; digits on either
// side of a V sum to 5. Ruleset states "No negative constraint" explicitly,
// so unmarked adjacent pairs are unrestricted -- X/V here, not StrictXV.
// Cell pairs below are transcribed from the payload's `xv` array.

const givens = [
  new Given('R1C3', 3), new Given('R1C5', 1), new Given('R1C9', 9),
  new Given('R3C1', 7), new Given('R3C3', 5),
  new Given('R5C3', 7), new Given('R5C5', 5), new Given('R5C7', 1),
  new Given('R7C7', 7), new Given('R7C9', 1),
  new Given('R9C1', 3), new Given('R9C5', 7), new Given('R9C7', 9),
];

const xPairs = [
  ['R7C2', 'R7C3'], ['R3C2', 'R4C2'], ['R2C6', 'R3C6'], ['R6C1', 'R7C1'],
  ['R5C8', 'R5C9'], ['R2C4', 'R2C5'], ['R2C2', 'R2C3'], ['R8C5', 'R8C6'],
  ['R6C6', 'R6C7'], ['R8C7', 'R8C8'], ['R6C4', 'R6C5'], ['R3C9', 'R4C9'],
].map(cells => new X(...cells));

const vPairs = [
  ['R4C3', 'R4C4'], ['R7C4', 'R8C4'], ['R5C1', 'R5C2'], ['R4C5', 'R4C6'],
  ['R3C7', 'R3C8'], ['R6C8', 'R7C8'],
].map(cells => new V(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...xPairs,
  ...vPairs,
];
