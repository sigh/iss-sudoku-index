// Title: Forget to Remember
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=fI46Yf_Zug8
// Source: https://tinyurl.com/kvext6y9

// Normal sudoku rules apply. 16 cells are shaded grey; every other cell is
// white. Each grey cell must be larger than every orthogonally adjacent
// digit. No two grey cells are orthogonally adjacent to each other, so this
// is exactly the rule "grey > adjacent white": one GreaterThan(greyCell,
// ...itsNeighbours) per grey cell, listing the grey cell first so
// _adjacentCellPairs orders every pair (grey, neighbour).
const greyNeighbours = {
  R3C1: ['R2C1', 'R4C1', 'R3C2'],
  R4C2: ['R3C2', 'R5C2', 'R4C1', 'R4C3'],
  R5C3: ['R4C3', 'R6C3', 'R5C2', 'R5C4'],
  R6C4: ['R5C4', 'R7C4', 'R6C3', 'R6C5'],
  R9C3: ['R8C3', 'R9C2', 'R9C4'],
  R8C4: ['R7C4', 'R9C4', 'R8C3', 'R8C5'],
  R7C5: ['R6C5', 'R8C5', 'R7C4', 'R7C6'],
  R6C6: ['R5C6', 'R7C6', 'R6C5', 'R6C7'],
  R7C9: ['R6C9', 'R8C9', 'R7C8'],
  R6C8: ['R5C8', 'R7C8', 'R6C7', 'R6C9'],
  R5C7: ['R4C7', 'R6C7', 'R5C6', 'R5C8'],
  R4C6: ['R3C6', 'R5C6', 'R4C5', 'R4C7'],
  R4C4: ['R3C4', 'R5C4', 'R4C3', 'R4C5'],
  R3C5: ['R2C5', 'R4C5', 'R3C4', 'R3C6'],
  R2C6: ['R1C6', 'R3C6', 'R2C5', 'R2C7'],
  R1C7: ['R2C7', 'R1C6', 'R1C8'],
};

const greaterThans = Object.entries(greyNeighbours).map(
  ([grey, neighbours]) => new GreaterThan(grey, ...neighbours));

return [
  new Shape('9x9'),
  new Given('R1C2', 3), new Given('R2C1', 1), new Given('R2C3', 6),
  new Given('R2C5', 4), new Given('R3C2', 8), new Given('R3C4', 3),
  new Given('R4C3', 7), new Given('R4C5', 3), new Given('R5C1', 2),
  new Given('R5C4', 4), new Given('R5C6', 1), new Given('R5C9', 5),
  new Given('R6C5', 2), new Given('R6C7', 6), new Given('R7C6', 5),
  new Given('R7C8', 8), new Given('R8C5', 6), new Given('R8C7', 4),
  new Given('R8C9', 2), new Given('R9C8', 6),
  ...greaterThans,
];
