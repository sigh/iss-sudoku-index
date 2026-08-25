// Title: Kropki Spirals
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=q9n61GR-Y-Q
// Source: https://app.crackingthecryptic.com/sudoku/TqJrFmPN8d

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes). Black dots join cells in a 2:1 ratio, white dots join cells
// differing by 1. The rules state "not all dots are shown", so absence of a
// dot is not information: no StrictKropki/negative constraint is added, only
// the drawn dots below.

// Each pair below is one drawn Kropki dot (an edge-sized rounded overlay,
// distinguished by backgroundColor), transcribed from the payload's overlay
// list. The two chains trace spiral shapes from the border toward the
// centre, per the title, but each dot is still encoded independently.

const blackDots = [
  ['R1C7', 'R2C7'],
  ['R2C8', 'R3C8'],
  ['R4C9', 'R5C9'],
  ['R5C9', 'R6C9'],
  ['R7C8', 'R7C9'],
  ['R8C7', 'R9C7'],
  ['R9C5', 'R9C6'],
  ['R8C3', 'R8C4'],
  ['R6C3', 'R7C3'],
  ['R5C3', 'R6C3'],
  ['R4C4', 'R5C4'],
  ['R4C5', 'R4C6'],
  ['R4C6', 'R5C6'],
].map(cells => new BlackDot(...cells));

const whiteDots = [
  ['R5C6', 'R6C6'],
  ['R6C4', 'R6C5'],
  ['R5C4', 'R6C4'],
  ['R4C7', 'R5C7'],
  ['R3C7', 'R4C7'],
  ['R2C6', 'R2C7'],
  ['R1C4', 'R1C5'],
  ['R1C3', 'R2C3'],
  ['R3C1', 'R3C2'],
  ['R4C1', 'R5C1'],
  ['R5C1', 'R6C1'],
  ['R7C2', 'R8C2'],
  ['R8C3', 'R9C3'],
].map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...blackDots,
  ...whiteDots,
];
