// Title: Ninja Turtle
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=F4WvF5yIhQI
// Source: https://app.crackingthecryptic.com/sudoku/DN7P93mMt9

// Rules encoded here:
//   Irregular Sudoku - 1-9 once each in every row, column and outlined region
//     (there are no standard 3x3 boxes).
//   Arrow - digits along an arrow sum to the digit in that arrow's circle;
//     the circle cell is itself a normal grid cell. Two of the six circles
//     each have two arrows radiating from them (see ARROWS below): both
//     arrows from a shared circle must independently sum to that circle's
//     digit.
// Nothing is omitted.

// The nine outlined regions, transcribed from the payload's `regions` array
// (irregular areas drawn on the grid, replacing the standard boxes).
const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R4C1'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C6', 'R3C4', 'R3C5', 'R3C6', 'R4C5'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C9'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C1', 'R5C2', 'R5C4', 'R6C2', 'R6C3', 'R6C4'],
  ['R2C2', 'R2C5', 'R2C8', 'R5C3', 'R5C5', 'R5C7', 'R8C2', 'R8C5', 'R8C8'],
  ['R4C6', 'R4C7', 'R4C8', 'R5C6', 'R5C8', 'R5C9', 'R6C6', 'R6C7', 'R6C8'],
  ['R6C1', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
  ['R6C5', 'R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],
  ['R6C9', 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
];

// Each entry is one arrow: circle cell first, then its path cells, read off
// the payload's `arrows` waypoints (snapped to cell centres) and matched to
// the nearest of the payload's six `overlays` circles. Two circles (R8C2 and
// R2C8) each anchor two separate arrows.
const ARROWS = [
  ['R5C3', 'R5C4', 'R6C4', 'R7C4'],
  ['R5C7', 'R5C6', 'R4C6', 'R3C6'],
  ['R8C2', 'R7C2', 'R7C3'],
  ['R8C2', 'R9C2', 'R9C1'],
  ['R2C8', 'R3C8', 'R3C7'],
  ['R2C8', 'R1C8', 'R1C9'],
  ['R8C5', 'R9C5', 'R9C4'],
  ['R9C7', 'R9C8', 'R8C8'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...REGIONS.map(cells => new Jigsaw('9x9', ...cells)),
  ...ARROWS.map(cells => new Arrow(...cells)),
];
