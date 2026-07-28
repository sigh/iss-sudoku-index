// Title: Pea Soup
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=75FlM1XqepU
// Source: https://sudokupad.app/xqgzhq4bqn

// Normal Sudoku rules apply. Each listed Split-Pea section is ordered from one
// drawn circle to the next: its interior sum is the two circle digits concatenated
// in either order. The listed black dots are 1:2 ratios; other dots are not implied.
const splitPeaSections = [
  ['R4C5', 'R1C5', 'R3C5', 'R2C6'],
  ['R6C6', 'R3C7', 'R5C7', 'R4C7'],
  ['R7C5', 'R3C8', 'R7C6', 'R7C7', 'R6C7', 'R5C8', 'R4C8'],
  ['R8C1', 'R6C1', 'R8C2', 'R8C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R8C8', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C8', 'R2C7', 'R3C6', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R7C2'],
  ['R4C4', 'R3C2', 'R4C3', 'R5C2', 'R4C1'],
  ['R3C2', 'R2C3', 'R4C2', 'R3C3', 'R2C4'],
  ['R2C3', 'R4C4', 'R1C4', 'R2C5', 'R3C4'],
  ['R2C3', 'R3C2', 'R1C3', 'R1C2', 'R1C1', 'R2C2', 'R2C1', 'R3C1'],
];

// Each table row is a section's two circle cells followed by its drawn interior cells.
const splitPeas = splitPeaSections.map(([first, last, ...interior]) => new Or([
  new Sum(0, ...interior, [first, -10], [last, -1]),
  new Sum(0, ...interior, [first, -1], [last, -10]),
]));

// Drawn black-dot edges from the source geometry.
const blackDots = [
  ['R1C1', 'R2C1'], ['R5C5', 'R6C5'], ['R4C5', 'R5C5'],
  ['R7C4', 'R8C4'], ['R2C8', 'R2C9'], ['R1C7', 'R2C7'],
  ['R7C8', 'R8C8'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...splitPeas,
  ...blackDots,
];
