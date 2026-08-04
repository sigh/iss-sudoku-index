// Title: Sumdotty Once Told Me
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=3Onsq24T0Ug
// Source: https://tinyurl.com/4mvcec2a

// Normal Sudoku rules apply. Digits in dots give the sum of the cells they
// connect: each circle straddles the shared edge of two orthogonally
// adjacent cells and shows the total of that pair. Every pair below is
// already forced distinct by its shared row/column, but the rule text
// asserts only a sum, so each dot is modelled as `Sum` (repeats allowed),
// not `Cage` (which would also assert distinctness the rule never states).

// Cell pairs and totals transcribed from the payload's `circle` array.
const dots = [
  [['R1C2', 'R1C3'], 6],
  [['R1C3', 'R2C3'], 12],
  [['R1C5', 'R1C6'], 10],
  [['R1C6', 'R2C6'], 16],
  [['R2C4', 'R3C4'], 8],
  [['R3C4', 'R3C5'], 10],
  [['R2C1', 'R3C1'], 4],
  [['R3C1', 'R3C2'], 8],
  [['R4C2', 'R4C3'], 8],
  [['R4C3', 'R5C3'], 14],
  [['R5C1', 'R6C1'], 10],
  [['R6C1', 'R6C2'], 6],
  [['R5C7', 'R6C7'], 4],
  [['R6C7', 'R6C8'], 6],
  [['R4C8', 'R4C9'], 14],
  [['R4C9', 'R5C9'], 8],
  [['R7C8', 'R7C9'], 4],
  [['R7C9', 'R8C9'], 12],
  [['R8C7', 'R9C7'], 6],
  [['R9C7', 'R9C8'], 10],
  [['R7C5', 'R7C6'], 12],
  [['R7C6', 'R8C6'], 6],
  [['R8C4', 'R9C4'], 12],
  [['R9C4', 'R9C5'], 10],
];

return [
  new Shape('9x9'),
  ...dots.map(([cells, sum]) => new Sum(sum, ...cells)),
];
