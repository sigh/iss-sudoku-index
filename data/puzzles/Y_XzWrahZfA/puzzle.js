// Title: Four Corners
// Author: tallcat
// Video: https://www.youtube.com/watch?v=Y_XzWrahZfA
// Source: https://app.crackingthecryptic.com/sudoku/jQdTf2Rtp2

// Normal sudoku rules apply (standard rows/columns/boxes from Shape('9x9')).
// Digits along an arrow sum to the digit in that arrow's circle -- Arrow's
// first cell is the circle, the rest are the summed path (cells.js payload
// waypoints, snapped to cell centres; the circle coincides with a drawn
// white/grey underlay on each of the four corner cells).
// In cages, digits sum to the small clue in the top-left cell of the cage
// and cannot repeat within it -- Cage(sum, ...cells).
// Each main diagonal (drawn in blue) has no repeated digit -- Diagonal(-1)
// is the \ diagonal, Diagonal(1) is the / diagonal; the payload draws both
// in the same colour and the rules say "each", so both are encoded.

const arrows = [
  new Arrow('R1C1', 'R2C1', 'R3C2', 'R2C3'),
  new Arrow('R1C9', 'R1C8', 'R1C7', 'R2C7'),
  new Arrow('R9C9', 'R8C9', 'R7C8', 'R8C7'),
  new Arrow('R9C1', 'R9C2', 'R9C3', 'R8C3'),
];

const cages = [
  new Cage(9, 'R1C4', 'R2C4'),
  new Cage(8, 'R1C5', 'R2C5'),
  new Cage(8, 'R4C7', 'R4C8'),
  new Cage(8, 'R6C8', 'R6C9'),
  new Cage(12, 'R8C5', 'R9C5'),
  new Cage(13, 'R8C4', 'R9C4'),
  new Cage(9, 'R5C2', 'R5C3'),
  new Cage(5, 'R6C1', 'R6C2'),
  new Cage(13, 'R4C5', 'R5C5'),
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),
  ...arrows,
  ...cages,
];
