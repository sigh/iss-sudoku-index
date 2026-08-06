// Title: Large Area Size of Small Area
// Author: Neofelis
// Video: https://www.youtube.com/watch?v=_-lag2XvXSg
// Source: https://app.crackingthecryptic.com/sudoku/PQ8GmnLdNH

// Normal sudoku rules apply.
// The highlighted area may only contain the numbers 1-5.
// None of the remaining numbers 1-5 are orthogonally adjacent to that area:
// a cell outside the area that shares an edge with an area cell holds 6-9.
// The numbers inside a cage sum to the clue in its top-left corner. The rule
// states only the total, so `Sum` (repeats allowed) rather than `Cage`; all
// three cages lie within a single row or column, so the two agree here anyway.
// A black dot marks a 2:1 ratio; a white dot marks consecutive values. The
// rules do not state the dots are exhaustive, so undotted edges are free.
// Every stated rule is encoded.

const graph = cellGraph('9x9');

// The 38 red-shaded cells, listed row by row.
const area = [
  'R1C1', 'R1C2', 'R1C3', 'R1C8', 'R1C9',
  'R2C3', 'R2C4', 'R2C6', 'R2C7', 'R2C8',
  'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C2', 'R4C6', 'R4C7', 'R4C8', 'R4C9',
  'R5C1', 'R5C2', 'R5C5', 'R5C6', 'R5C9',
  'R6C2', 'R6C3', 'R6C5', 'R6C6',
  'R7C3', 'R7C4', 'R7C5',
  'R8C1', 'R8C4', 'R8C5',
  'R9C1', 'R9C2', 'R9C3', 'R9C4',
];

const areaCells = new Set(area);

// Derived from the shading: the cells orthogonally adjacent to the area but
// not part of it. These are the cells barred from holding a 1-5.
const adjacent = [...new Set(area.flatMap((cell) => graph.neighbours(cell)))]
  .filter((cell) => !areaCells.has(cell));

return [
  new Shape('9x9'),
  new Given('R9C7', 1),

  ...area.map((cell) => new Given(cell, 1, 2, 3, 4, 5)),
  ...adjacent.map((cell) => new Given(cell, 6, 7, 8, 9)),

  // Cage totals, read from the clue in each cage's top-left corner.
  new Sum(18, 'R3C1', 'R3C2', 'R3C3'),
  new Sum(12, 'R1C7', 'R2C7'),
  new Sum(10, 'R6C9', 'R7C9'),

  // Kropki dots, by the edge each is drawn on.
  new WhiteDot('R4C8', 'R4C9'),
  new WhiteDot('R7C9', 'R8C9'),
  new WhiteDot('R9C2', 'R9C3'),
  new WhiteDot('R9C1', 'R9C2'),
  new WhiteDot('R8C1', 'R9C1'),
  new WhiteDot('R5C4', 'R6C4'),
  new WhiteDot('R4C4', 'R5C4'),
  new WhiteDot('R4C4', 'R4C5'),
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R3C6', 'R4C6'),
  new BlackDot('R4C7', 'R4C8'),
  new BlackDot('R7C8', 'R7C9'),
  new BlackDot('R8C7', 'R8C8'),
  new BlackDot('R8C4', 'R9C4'),
];
