// Title: RAT RUN 5: Disparity
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=CqSAzDMgWkI
// Source: https://sudokupad.app/wv01avmfs9

// Normal sudoku and the blackcurrants are encoded. The maze path, its walls
// and rounded corners, the purple one-way doors, and the path's alternating
// parity rule are omitted; see the puzzle description and notes.

// The six drawn blackcurrant dots, transcribed from their edge positions.
const blackcurrants = [
  ['R4C1', 'R5C1'], ['R5C1', 'R6C1'], ['R7C7', 'R8C7'],
  ['R7C8', 'R8C8'], ['R8C5', 'R9C5'], ['R9C4', 'R9C5'],
];

return [
  new Shape('9x9'),
  ...blackcurrants.map(([a, b]) => new BlackDot(a, b)),
];
