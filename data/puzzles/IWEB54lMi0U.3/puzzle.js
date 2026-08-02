// Title: More Like Funtress, Am I Right
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=IWEB54lMi0U
// Source: https://tinyurl.com/5n8tr6b2

// Standard 9x9 Sudoku with the source givens. Each listed pair is a grey cell
// followed by an orthogonally adjacent white cell; grey cells exceed white cells.
const givens = [
  ['R1C9', 6], ['R2C6', 8], ['R2C9', 9], ['R3C6', 7], ['R3C9', 4],
  ['R4C1', 2], ['R4C2', 3], ['R4C3', 4], ['R4C4', 5], ['R4C6', 6],
  ['R6C4', 3], ['R6C6', 4], ['R6C7', 5], ['R6C8', 6], ['R6C9', 7],
  ['R7C1', 4], ['R7C4', 2], ['R8C1', 9], ['R8C4', 1], ['R9C1', 5],
];

// Border pairs transcribed from the 16 grey cells in the source artwork.
const greyToWhite = [
  ['R3C3', 'R4C3'], ['R3C3', 'R3C2'], ['R2C4', 'R1C4'], ['R2C4', 'R2C5'],
  ['R2C3', 'R1C3'], ['R2C3', 'R2C2'], ['R3C4', 'R4C4'], ['R3C4', 'R3C5'],
  ['R3C7', 'R2C7'], ['R3C7', 'R3C6'], ['R3C8', 'R2C8'], ['R3C8', 'R3C9'],
  ['R4C8', 'R5C8'], ['R4C8', 'R4C9'], ['R4C7', 'R5C7'], ['R4C7', 'R4C6'],
  ['R7C6', 'R6C6'], ['R7C6', 'R7C5'], ['R7C7', 'R6C7'], ['R7C7', 'R7C8'],
  ['R8C7', 'R9C7'], ['R8C7', 'R8C8'], ['R8C6', 'R9C6'], ['R8C6', 'R8C5'],
  ['R7C2', 'R8C2'], ['R7C2', 'R7C1'], ['R7C3', 'R8C3'], ['R7C3', 'R7C4'],
  ['R6C3', 'R5C3'], ['R6C3', 'R6C4'], ['R6C2', 'R5C2'], ['R6C2', 'R6C1'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...greyToWhite.map(([grey, white]) => new GreaterThan(grey, white)),
];
