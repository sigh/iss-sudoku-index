// Title: Entropic Toast
// Author: Niks
// Video: https://www.youtube.com/watch?v=WvXfoztQZJc
// Source: https://sudokupad.app/yg5hbdwc6j

// Normal sudoku rules. Fog is solving UI only and is not encoded; R9C5 is
// the one cell not covered by fog at the start, so it is a real given.
//
// Peach entropic lines: every sequential group of 3 cells has one low
// (1-3), one medium (4-6), and one high (7-9) digit.
//
// Each of the following constraint types may not repeat a digit anywhere
// in the puzzle (not just within one instance): white dots, black dots,
// X marks, V marks, killer cages. Each type gets its own AllDifferent over
// the union of cells that type touches, on top of the local relationship.
//
// Killer cages carry no sum; the rules state they behave like Renban
// (purple) lines -- a set of consecutive digits in any order -- so they are
// encoded with Renban rather than Cage.

const whiteDotPairs = [
  ['R9C3', 'R9C4'],
  ['R4C2', 'R4C3'],
  ['R4C5', 'R4C6'],
  ['R7C8', 'R7C9'],
  ['R7C7', 'R7C8'],
];

const blackDotPairs = [
  ['R1C7', 'R1C8'],
  ['R4C4', 'R5C4'],
  ['R4C3', 'R4C4'],
];

const xPairs = [
  ['R1C9', 'R2C9'],
  ['R6C9', 'R7C9'],
  ['R8C3', 'R9C3'],
  ['R8C5', 'R8C6'],
];

const vPairs = [
  ['R7C1', 'R7C2'],
];

const cages = [
  ['R5C2', 'R6C1', 'R6C2', 'R6C3'],
  ['R5C7', 'R5C8', 'R6C8', 'R6C9'],
  ['R1C5'],
];

const uniqueCells = (pairs) => [...new Set(pairs.flat())];

return [
  new Shape('9x9'),

  new Given('R9C5', 7),

  new Entropic(
    'R9C6', 'R9C7', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C9', 'R2C9',
    'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1',
    'R2C1', 'R3C1', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C3', 'R9C4'),
  new Entropic('R7C4', 'R6C5', 'R5C6'),
  new Entropic('R3C6', 'R4C5', 'R5C4'),

  ...whiteDotPairs.map(([a, b]) => new WhiteDot(a, b)),
  new AllDifferent(...uniqueCells(whiteDotPairs)),

  ...blackDotPairs.map(([a, b]) => new BlackDot(a, b)),
  new AllDifferent(...uniqueCells(blackDotPairs)),

  ...xPairs.map(([a, b]) => new Sum(10, a, b)),
  new AllDifferent(...uniqueCells(xPairs)),

  ...vPairs.map(([a, b]) => new Sum(5, a, b)),

  ...cages.map((cells) => new Renban(...cells)),
  new AllDifferent(...uniqueCells(cages)),
];
