// Title: Diamond In The Rough
// Author: fjam
// Video: https://www.youtube.com/watch?v=xbiM6WWjUOE
// Source: https://sudokupad.app/D7HLp6nQB6

// Normal Sudoku rules apply. Box borders split each blue feature into segments
// with a common sum. Black dots mark adjacent 1:2 digit pairs; unmarked edges
// are not restricted.
// The first four blue strokes join at their shared endpoints into one feature;
// these are its box-bounded connected segments, transcribed from that drawing.
const centralDiamondSegments = [
  ['R5C1', 'R5C2', 'R5C3'],
  ['R5C4', 'R4C5', 'R5C6', 'R6C5'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R1C5', 'R2C5', 'R3C5'],
  ['R5C7', 'R5C8', 'R5C9'],
];

// The remaining blue strokes are transcribed in their drawn order.
const blueLines = [
  ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R3C4', 'R2C4', 'R1C4'],
  ['R6C2', 'R6C3', 'R7C4', 'R8C4'],
  ['R2C6', 'R3C6', 'R4C7', 'R4C8'],
  ['R9C8', 'R8C7', 'R8C6', 'R7C6', 'R7C7', 'R6C7', 'R6C8', 'R7C8', 'R8C9'],
  ['R9C4', 'R9C3', 'R8C2'],
  ['R4C9', 'R3C9', 'R2C8'],
];

// Black-dot edges are transcribed from the six drawn black dots.
const blackDots = [
  ['R1C3', 'R2C3'], ['R1C6', 'R1C7'], ['R4C6', 'R5C6'],
  ['R5C4', 'R6C4'], ['R6C1', 'R7C1'], ['R3C1', 'R3C2'],
];

return [
  new Shape('9x9'),
  new EqualSum(...centralDiamondSegments),
  ...blueLines.map((cells) => new RegionSumLine(...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
];
