// Title: Turbine
// Author: shye
// Video: https://www.youtube.com/watch?v=yGpRNwdjZzo
// Source: https://app.crackingthecryptic.com/sudoku/R6h7g8rdgf

// Rules: Normal sudoku rules apply. A cell with a grey square must contain
// an even digit. A cell with a grey circle must contain an odd digit. Cells
// separated by a black dot must contain digits in a ratio of 1:2.
//
// Parity is encoded as a candidate restriction: a Given listing only the
// allowed values for the marked cell.
//
// Grey-square (even) cells, from the underlay square markers:
const evenCells = ['R1C1', 'R1C6', 'R6C6', 'R6C1', 'R2C2'];
// Grey-circle (odd) cells, from the underlay circle markers:
const oddCells = ['R2C5', 'R5C2', 'R5C5'];

const evenGivens = evenCells.map((cell) => new Given(cell, 2, 4, 6, 8));
const oddGivens = oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9));

// Black dot (2:1 ratio) marks, one edge each, from the overlay dot positions.
// Four of them (the middle four below) form a closed loop around the 2x2
// block R3C3/R3C4/R4C3/R4C4 -- the drawing's "turbine" hub -- and the other
// four extend outward from that hub in each cardinal direction. The dot
// positions are purely decorative framing; every dot enforces the same
// stated ratio-of-2 relation regardless of its place in the drawing.
const blackDots = [
  ['R1C3', 'R1C4'],
  ['R3C3', 'R3C4'],
  ['R4C3', 'R4C4'],
  ['R6C3', 'R6C4'],
  ['R3C3', 'R4C3'],
  ['R3C4', 'R4C4'],
  ['R3C1', 'R4C1'],
  ['R3C6', 'R4C6'],
].map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),

  // Givens, from the payload's cell values.
  new Given('R1C7', 9),
  new Given('R1C9', 8),
  new Given('R3C9', 6),
  new Given('R7C1', 3),
  new Given('R7C7', 2),
  new Given('R7C9', 1),
  new Given('R8C8', 9),
  new Given('R9C1', 7),
  new Given('R9C3', 6),
  new Given('R9C7', 3),
  new Given('R9C9', 4),

  ...evenGivens,
  ...oddGivens,
  ...blackDots,
];
