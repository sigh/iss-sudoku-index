// Title: Antiknight Between Lines
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=SK_XMXCcnMU
// Source: https://app.crackingthecryptic.com/sudoku/DRTfdmptP8

// Rules: normal sudoku (standard 3x3 boxes); antiknight (cells a knight's
// move apart cannot repeat a digit); each blue line's interior digits are
// strictly between the digits in the circles at its two ends (`Between`
// takes the circle endpoints as its first and last cells).
//
// The 6 blue line segments below were recovered from the drawn waypoints:
// each segment's stroke starts and ends near one of the 8 grey circles
// (offsets of ~0.3-0.35 cell widths, i.e. drawn short of the circle center,
// consistent across all lines). Three circles (R6C3, R3C6, R7C4) each anchor
// two segments, chaining lines end-to-end through a shared circle; R4C7
// likewise anchors two segments. The remaining four circles (R2C2, R4C2,
// R7C8, R9C9) each anchor exactly one segment.

const betweenLines = [
  ['R2C2', 'R3C2', 'R4C2'],
  ['R6C3', 'R5C4', 'R4C5', 'R3C6'],
  ['R7C4', 'R6C5', 'R5C6', 'R4C7'],
  ['R4C7', 'R3C8', 'R2C7', 'R2C6', 'R3C6'],
  ['R6C3', 'R7C2', 'R8C3', 'R8C4', 'R7C4'],
  ['R7C8', 'R8C8', 'R9C9'],
];

return [
  new Shape('9x9'),

  new Given('R3C9', 7),
  new Given('R4C9', 1),
  new Given('R6C1', 5),
  new Given('R7C1', 9),

  new AntiKnight(),

  ...betweenLines.map(cells => new Between(...cells)),
];
