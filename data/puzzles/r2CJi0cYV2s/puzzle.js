// Title: RAT RUN 9: Shock Value
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=r2CJi0cYV2s
// Source: https://sudokupad.app/vaeya6u829

// Normal sudoku rules apply. The two yellow A teleports contain the same
// digit. Cells joined by a blackcurrant have a 1:2 ratio. The rat path and
// the cage/shock-value rule are omitted: the archived artwork does not retain
// the cage boundaries needed to tell which cells are safe or to model a path
// through teleports.

// The two yellow A markers in the drawing.
const teleports = new SameValues(2, 'R5C6', 'R9C9');

// The seven black edge discs (blackcurrants) drawn in the source artwork.
const blackcurrants = [
  ['R9C7', 'R9C8'], ['R4C9', 'R5C9'], ['R1C6', 'R1C7'],
  ['R1C7', 'R1C8'], ['R2C3', 'R3C3'], ['R7C3', 'R8C3'],
  ['R6C5', 'R7C5'],
];

return [
  new Shape('9x9'),
  teleports,
  ...blackcurrants.map(([a, b]) => new BlackDot(a, b)),
];
