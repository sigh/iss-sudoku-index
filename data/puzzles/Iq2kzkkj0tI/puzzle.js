// Title: Pac-Man
// Author: Blobz
// Video: https://www.youtube.com/watch?v=Iq2kzkkj0tI
// Source: https://sudokupad.app/blobz/pac-man

// Normal Sudoku. The four coloured ghosts are the digits 1-4 in some order.
// White dots join consecutive digits. The listed pairs are the drawn white dots.
const dots = [
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C3', 'R2C3'],
  ['R1C7', 'R2C7'], ['R1C7', 'R1C8'], ['R1C9', 'R2C9'],
  ['R3C1', 'R3C2'], ['R3C2', 'R3C3'], ['R3C4', 'R3C5'],
  ['R3C5', 'R3C6'], ['R3C8', 'R3C9'], ['R3C8', 'R4C8'],
  ['R3C2', 'R4C2'],
  ['R4C2', 'R5C2'], ['R4C3', 'R5C3'], ['R4C3', 'R4C4'],
  ['R4C8', 'R5C8'], ['R5C8', 'R5C9'], ['R5C3', 'R6C3'],
  ['R6C3', 'R7C3'], ['R6C4', 'R6C5'], ['R6C8', 'R7C8'],
  ['R7C9', 'R8C9'], ['R8C1', 'R9C1'], ['R9C5', 'R9C6'],
  ['R9C7', 'R9C8'], ['R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new Given('R2C1', 1),
  new Given('R2C9', 2),
  new Given('R8C1', 3),
  new Given('R8C9', 4),
  new AllDifferent('R1C6', 'R5C6', 'R6C7', 'R9C4'),
  ...dots.map(([a, b]) => new WhiteDot(a, b)),
];
