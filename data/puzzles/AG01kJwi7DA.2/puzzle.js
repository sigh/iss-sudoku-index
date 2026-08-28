// Title: Apr 4, 2022: Odd/Even Killer
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=AG01kJwi7DA
// Source: https://tinyurl.com/mv32hbkf

// Normal sudoku rules apply. Each killer cage (Cage) holds distinct digits
// summing to its total. Grey-circle cells must hold an odd digit; grey-square
// cells must hold an even digit -- there is no Odd/Even class, so each is a
// multi-value Given restricting the cell to {1,3,5,7,9} or {2,4,6,8}.

const givens = [
  new Given('R1C5', 5),
  new Given('R3C4', 4),
  new Given('R4C7', 1),
  new Given('R5C1', 6),
  new Given('R5C5', 7),
  new Given('R5C9', 9),
  new Given('R6C3', 3),
  new Given('R7C6', 2),
  new Given('R9C5', 8),
];

// Grey circle cells: digit must be odd.
const oddCells = ['R1C9', 'R2C2', 'R3C6', 'R7C4', 'R8C8', 'R9C1'];
const oddGivens = oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9));

// Grey square cells: digit must be even.
const evenCells = ['R1C1', 'R2C8', 'R4C3', 'R6C7', 'R8C2', 'R9C9'];
const evenGivens = evenCells.map(cell => new Given(cell, 2, 4, 6, 8));

// Killer cages: [total, ...cells], transcribed from the payload's
// `killercage` array (cells, value).
const cageSpecs = [
  [6, 'R1C1', 'R1C2', 'R2C1'],
  [8, 'R8C1', 'R9C1', 'R9C2'],
  [15, 'R2C2', 'R2C3', 'R3C2'],
  [9, 'R8C9', 'R9C8', 'R9C9'],
  [7, 'R1C8', 'R1C9', 'R2C9'],
  [24, 'R2C7', 'R2C8', 'R3C8'],
  [7, 'R3C5', 'R3C6', 'R4C6'],
  [14, 'R7C2', 'R8C2', 'R8C3'],
  [12, 'R4C3', 'R4C4', 'R5C3'],
  [9, 'R6C4', 'R7C4', 'R7C5'],
  [16, 'R7C8', 'R8C7', 'R8C8'],
  [11, 'R5C7', 'R6C6', 'R6C7'],
];
const cages = cageSpecs.map(([total, ...cells]) => new Cage(total, ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...oddGivens,
  ...evenGivens,
  ...cages,
];
