// Title: Legions of Regions
// Author: PDN
// Video: https://www.youtube.com/watch?v=OMmN5GUaFrY
// Source: https://app.crackingthecryptic.com/sudoku/3f6bGR3Mr4

// Rules encoded: normal sudoku (rows/columns/boxes, from the default 9x9
// Shape); each coloured area is an extra all-different region; both main
// diagonals are all-different; each cage sums to its total with distinct
// digits; each drawn black dot is a 2:1 ratio pair. "Not all dots are given"
// is the standard Kropki caveat -- no negative constraint is added for
// unmarked adjacent pairs.

const givens = [
  new Given('R4C6', 3),
  new Given('R6C4', 2),
];

// Purple coloured area (underlay fill #D23BE7), read off its 9 underlay cells.
const purpleArea = new AllDifferent(
  'R2C7', 'R2C8', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C4', 'R5C4', 'R6C4');

// Yellow-green coloured area (underlay fill #A3E048), read off its 9 underlay
// cells.
const yellowGreenArea = new AllDifferent(
  'R4C6', 'R5C6', 'R6C6', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R8C2', 'R8C3');

const cages = [
  new Cage(7, 'R1C5', 'R2C5'),
  new Cage(7, 'R3C9', 'R4C9'),
  new Cage(13, 'R9C1', 'R9C2'),
  new Cage(11, 'R4C4', 'R4C5'),
  new Cage(3, 'R8C5', 'R9C5'),
  new Cage(13, 'R3C5', 'R3C6'),
];

// Black dots (overlay markers), each falling on an edge inside one of the two
// coloured areas.
const blackDots = [
  new BlackDot('R2C7', 'R2C8'),
  new BlackDot('R8C2', 'R8C3'),
];

return [
  new Shape('9x9'),
  ...givens,
  purpleArea,
  yellowGreenArea,
  ...cages,
  ...blackDots,
  new Diagonal(1),
  new Diagonal(-1),
];
