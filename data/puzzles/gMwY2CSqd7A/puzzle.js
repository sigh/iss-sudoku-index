// Title: Aquanuradoku
// Author: Mennoo_
// Video: https://www.youtube.com/watch?v=gMwY2CSqd7A
// Source: https://sudokupad.app/3gdgz1a4il

// Normal Sudoku; the cyan main diagonals are all-different. Purple lines are
// Renbans, and the listed white dots are consecutive pairs (other such pairs
// may be unmarked). R5C5 and the crowned frog at R9C1 are odd.
const renbans = [
  ['R6C3', 'R5C4', 'R5C5', 'R5C6', 'R6C7'],
  ['R5C9', 'R6C8'],
  ['R5C1', 'R6C2'],
  ['R9C4', 'R8C5', 'R9C6'],
  ['R2C6', 'R3C6', 'R2C7', 'R1C6'],
  ['R1C4', 'R2C3', 'R3C4', 'R2C4'],
];
const whiteDots = [
  ['R6C4', 'R6C5'], ['R6C5', 'R6C6'], ['R3C1', 'R3C2'],
  ['R3C8', 'R3C9'], ['R6C1', 'R7C1'],
];

// A corner frog with digit N runs N steps toward the centre, so its
// frog-fountain is a strictly increasing thermometer of N+1 cells. The four
// drawn corner-to-centre diagonals have at most four steps.
const frogFountain = (cells) => new Or([1, 2, 3, 4].map((steps) => new And([
  new Given(cells[0], steps),
  new Thermo(...cells.slice(0, steps + 1)),
])));
const fountains = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5'],
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5'],
  ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...renbans.map((cells) => new Renban(...cells)),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  new Given('R5C5', 1, 3, 5, 7, 9),
  new Given('R9C1', 1, 3, 5, 7, 9),
  ...fountains.map(frogFountain),
];
