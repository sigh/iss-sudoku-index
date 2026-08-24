// Title: Little Killer Windoku
// Author: Panda
// Video: https://www.youtube.com/watch?v=nu5dFs4Arzo
// Source: https://app.crackingthecryptic.com/sudoku/fBH6LnhR7h

// Normal sudoku rules apply. The four shaded 3x3 windoku boxes (centred on the
// intersections of the normal box grid) are no-total cages: digits do not
// repeat within them, per "Digits do not repeat in cages." Eight little-killer
// arrows outside the grid each give the sum of the diagonal ray they point
// along; a diagonal is not a row/column/box/cage, so its digits may repeat
// ("which may include repeats"), hence Sum rather than a uniqueness cage.

// Diagonal cell lists transcribed from the payload's arrow paths and their
// paired outside-clue overlay text.
const littleKillers = [
  [31, ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']],
  [9, ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5']],
  [23, ['R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9']],
  [10, ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9']],
  [9, ['R9C7', 'R8C8', 'R7C9']],
  [17, ['R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5']],
  [20, ['R4C9', 'R3C8', 'R2C7', 'R1C6']],
  [27, ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1']],
];

return [
  new Shape('9x9'),
  new Windoku(),
  ...littleKillers.map(([sum, cells]) => new Sum(sum, ...cells)),
];
