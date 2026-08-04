// Title: Tallmath
// Author: Qodec
// Video: https://www.youtube.com/watch?v=_BaioSscgww
// Source: https://app.crackingthecryptic.com/sudoku/dL2mfgFDn8

// Normal sudoku rules apply. Each grey line joins two circled cells; the sum
// of the digits on the line's non-circled cells equals the sum of the two
// circled cells' digits. Repeats are explicitly allowed within one
// line-circle combination, so no extra distinctness is added along any line
// or between a line and its circles. DoubleArrow(circleA, ...path, circleB)
// encodes exactly this: sum(path) == digit(circleA) + digit(circleB).
// The colour of a circle (two are drawn deepskyblue, the rest white) has no
// stated meaning in the rules text and is not encoded.
//
// Each line below is transcribed from the payload's `lines`/`overlays`
// geometry: every line's two endpoints were matched to the nearest drawn
// circle, and its interior waypoint cells are its path.
const doubleArrows = [
  new DoubleArrow('R6C5', 'R5C4', 'R4C3'),
  new DoubleArrow('R4C7', 'R5C6', 'R6C5'),
  new DoubleArrow('R4C7', 'R3C6', 'R3C5', 'R3C4', 'R4C3'),
  new DoubleArrow('R7C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5'),
  new DoubleArrow('R8C3', 'R9C2', 'R8C2', 'R7C2', 'R7C1'),
  new DoubleArrow('R8C3', 'R7C4', 'R6C5'),
  new DoubleArrow('R8C6', 'R7C6', 'R6C5'),
  new DoubleArrow('R5C9', 'R6C8', 'R7C7', 'R8C6'),
  new DoubleArrow('R3C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3'),
  new DoubleArrow('R1C1', 'R2C2', 'R2C1'),
  new DoubleArrow('R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7'),
  new DoubleArrow('R8C4', 'R8C5', 'R9C6'),
  new DoubleArrow('R1C8', 'R2C9', 'R3C9', 'R4C9'),
];

return [new Shape('9x9'), ...doubleArrows];
