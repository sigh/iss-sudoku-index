// Title: Black Math
// Author: Clover
// Video: https://www.youtube.com/watch?v=qWycdTGq0VA
// Source: https://app.crackingthecryptic.com/sudoku/23DdQD4b6f

// Normal sudoku (standard 3x3 boxes, from the payload's own region list).
// White dot: consecutive digits. Black dot: one value double the other.
// V: sum to 5. X: sum to 10. Rules text states "No negative constraint
// applies" -- an unmarked domino may still be consecutive / 2:1 / sum-5 /
// sum-10 -- so no StrictKropki/StrictXV closure is encoded; dots and
// letters are drawn only where they apply.

// White dot pairs (plain white-filled, black-bordered dot marks on the
// grid edges).
const whiteDots = [
  ['R1C1', 'R1C2'], ['R1C1', 'R2C1'], ['R1C4', 'R1C5'], ['R1C5', 'R2C5'],
  ['R2C4', 'R3C4'], ['R3C4', 'R3C5'], ['R4C5', 'R5C5'], ['R5C4', 'R5C5'],
  ['R4C2', 'R4C3'], ['R4C3', 'R5C3'], ['R4C1', 'R5C1'], ['R5C1', 'R5C2'],
  ['R9C2', 'R9C3'], ['R8C3', 'R9C3'], ['R6C6', 'R7C6'], ['R6C6', 'R6C7'],
  ['R7C7', 'R8C7'], ['R7C7', 'R7C8'], ['R1C7', 'R2C7'], ['R1C7', 'R1C8'],
  ['R3C8', 'R3C9'], ['R2C9', 'R3C9'],
];

// Black dot pairs (black-filled dot marks on the grid edges).
const blackDots = [
  ['R8C6', 'R9C6'], ['R6C8', 'R6C9'],
];

// V pairs (edge marks labelled "V").
const vPairs = [
  ['R3C2', 'R3C3'], ['R7C6', 'R8C6'],
];

// X pairs (edge marks labelled "X").
const xPairs = [
  ['R6C7', 'R6C8'],
];

return [
  new Shape('9x9'),
  new Given('R4C4', 4),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...vPairs.map(cells => new V(...cells)),
  ...xPairs.map(cells => new X(...cells)),
];
