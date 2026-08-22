// Title: A Meandering Path
// Author: 10feet
// Video: https://www.youtube.com/watch?v=k90bwDVb3bw
// Source: https://app.crackingthecryptic.com/sudoku/p89L9JTQB8

// Normal sudoku. One meandering line visits every cell of the grid; circles
// are drawn on 29 of its cells, splitting it into 28 arcs. Each arc's
// interior cells must be strictly between the values of its two bounding
// circles (a between line). Two black dots (grid-adjacent pairs, not
// necessarily line-adjacent) each require one value to be double the other;
// per the rules text not all such ratio pairs are marked, so no negative
// (StrictKropki) constraint is added for unmarked pairs.

// Each entry is one arc, first and last cell circled, walked in the drawn
// path's order (path and circle placement read from the source overlays).
const betweenLines = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C3', 'R1C4', 'R1C5', 'R2C5', 'R2C6'],
  ['R2C6', 'R1C6', 'R1C7', 'R2C7', 'R3C7', 'R3C8'],
  ['R3C8', 'R2C8', 'R1C8'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R2C9', 'R3C9', 'R4C9', 'R4C8', 'R4C7'],
  ['R4C7', 'R4C6', 'R3C6', 'R3C5'],
  ['R3C5', 'R3C4', 'R2C4', 'R2C3', 'R2C2'],
  ['R2C2', 'R2C1', 'R3C1', 'R3C2', 'R3C3'],
  ['R3C3', 'R4C3', 'R4C4'],
  ['R4C4', 'R4C5', 'R5C5'],
  ['R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R5C9', 'R6C9', 'R6C8', 'R6C7'],
  ['R6C7', 'R6C6', 'R6C5', 'R6C4'],
  ['R6C4', 'R5C4', 'R5C3', 'R5C2'],
  ['R5C2', 'R4C2', 'R4C1'],
  ['R4C1', 'R5C1', 'R6C1', 'R6C2'],
  ['R6C2', 'R6C3', 'R7C3'],
  ['R7C3', 'R7C2', 'R7C1', 'R8C1', 'R8C2', 'R8C3'],
  ['R8C3', 'R8C4', 'R7C4'],
  ['R7C4', 'R7C5', 'R8C5', 'R8C6'],
  ['R8C6', 'R7C6', 'R7C7', 'R8C7'],
  ['R8C7', 'R8C8', 'R7C8'],
  ['R7C8', 'R7C9', 'R8C9'],
  ['R8C9', 'R9C9', 'R9C8'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5'],
  ['R9C5', 'R9C4', 'R9C3'],
  ['R9C3', 'R9C2', 'R9C1'],
];

// The two drawn black dots (grid-adjacent cell pairs).
const blackDots = [
  ['R5C7', 'R5C8'],
  ['R6C6', 'R7C6'],
];

return [
  new Shape('9x9'),
  ...betweenLines.map(cells => new Between(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
