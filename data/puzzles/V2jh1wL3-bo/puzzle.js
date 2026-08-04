// Title: 71
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=V2jh1wL3-bo
// Source: https://app.crackingthecryptic.com/sudoku/78Q6BLLmLJ

// Normal sudoku rules apply. Adjacent cells on a green line must contain
// digits that differ in value by at least 5 (Whisper(5)) -- applied to every
// consecutive pair of cells along each line's drawn path.
//
// The source draws nine lines; one carries no waypoints and resolves to no
// cells (a degenerate empty stub), so it is not encoded here. The other
// eight paths were transcribed from the drawn line waypoints, interpolating
// each polyline segment into its covered cells.

const LINES = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C2', 'R3C1'],
  ['R2C4', 'R1C5', 'R2C5', 'R3C5'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C8', 'R3C7'],
  ['R5C1', 'R4C2', 'R5C2', 'R6C2'],
  ['R5C7', 'R4C8', 'R5C8', 'R6C8'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C2', 'R9C1'],
  ['R8C4', 'R7C5', 'R8C5', 'R9C5'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C8', 'R9C7'],
];

const whispers = LINES.map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  new Given('R8C1', 7),
  new Given('R8C9', 1),
  ...whispers,
];
