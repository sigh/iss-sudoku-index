// Title: Icon
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=XPvyHdvLgV0
// Source: https://sudokupad.app/iqv3bub9ae

// Encode normal Sudoku with nine solver-discovered connected 9-cell regions.
// The rectangular-shape and two-circled-cell dimension rules are omitted: the
// payload has only 16 distinct circles, not the 18 required by those clauses.
// Grey strokes are Between segments; a circle encountered by a stroke is an
// attached endpoint for each adjoining segment.
const betweenLines = [
  ['R8C1', 'R7C1', 'R8C2', 'R9C1'],
  ['R5C1', 'R5C2', 'R4C2', 'R3C2', 'R2C2'],
  ['R6C7', 'R5C8', 'R4C8', 'R3C7'],
  ['R3C7', 'R4C6', 'R4C5'],
  ['R1C2', 'R2C3', 'R3C4', 'R2C4'],
  ['R2C4', 'R3C5', 'R2C6', 'R1C7', 'R2C8'],
  ['R8C6', 'R9C7', 'R8C8', 'R7C9'],
  ['R7C9', 'R7C8', 'R6C9', 'R5C9', 'R4C9'],
  ['R7C9', 'R6C8', 'R7C7', 'R6C6', 'R6C5', 'R7C4', 'R7C3'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...betweenLines.map(cells => new Between(...cells)),
];
