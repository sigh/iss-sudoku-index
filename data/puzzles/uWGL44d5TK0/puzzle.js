// Title: Diamonds
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=uWGL44d5TK0
// Source: https://app.crackingthecryptic.com/sudoku/hGmtRJmhQL

// Normal Sudoku rules apply. The grey central box is a magic square. Each
// coloured diamond contains at most three distinct digits; the yellow line's
// off-grid portions do not contain cells.

const atMostThreeDistinct = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => {
    const next = seen | (1 << (value - 1));
    return next.toString(2).split('1').length - 1 <= 3 ? next : undefined;
  },
  accept: () => true,
}, 9);

// These lists are the in-grid cells traversed by the three drawn diamond outlines.
const diamonds = [
  ['R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R7C6',
    'R6C7', 'R5C8', 'R4C7', 'R3C6'],
  ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1', 'R6C2', 'R7C3', 'R8C4',
    'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C8', 'R3C7', 'R2C6'],
  ['R1C4', 'R2C3', 'R3C2', 'R4C1', 'R6C1', 'R7C2', 'R8C3', 'R9C4',
    'R9C6', 'R8C7', 'R7C8', 'R6C9', 'R4C9', 'R3C8', 'R2C7', 'R1C6'],
];

// The eight equal-sum segments are the rows, columns, and diagonals of the grey box.
const magicSquare = new EqualSum(
  ['R4C4', 'R4C5', 'R4C6'], ['R5C4', 'R5C5', 'R5C6'], ['R6C4', 'R6C5', 'R6C6'],
  ['R4C4', 'R5C4', 'R6C4'], ['R4C5', 'R5C5', 'R6C5'], ['R4C6', 'R5C6', 'R6C6'],
  ['R4C4', 'R5C5', 'R6C6'], ['R4C6', 'R5C5', 'R6C4'],
);

return [
  new Shape('9x9'),
  new Given('R1C2', 7), new Given('R1C8', 4), new Given('R3C5', 7),
  new Given('R4C5', 9), new Given('R8C4', 3), new Given('R8C6', 1),
  magicSquare,
  ...diamonds.map(cells => new NFA(atMostThreeDistinct, 'at most 3 distinct', ...cells)),
];
