// Title: carved out
// Author: Wypman
// Video: https://www.youtube.com/watch?v=05JtoGSWGiY
// Source: https://sudokupad.app/q4ysz7id1i

// Normal sudoku rules apply (9x9, standard 3x3 boxes, no givens).
//
// The pumpkin (orange) is an entropic line: every 3 consecutive cells along
// it hold one low (1-3), one mid (4-6) and one high (7-9) digit. It is drawn
// as a closed loop (the source path repeats its first cell to close it), so
// the sliding window-of-3 also has to wrap past the last cell back to the
// first two -- done below by appending the loop's first two cells.
//
// The stem (green) is a German whisper: adjacent digits differ by >= 5. It
// is drawn as two strokes meeting at R3C5 (a straight run R3C4-R3C5-R3C6,
// and a bent run R3C5-R2C5-R1C5-R1C6); encoded as two Whisper lines sharing
// that cell.
//
// The face is two thermometers (digits increase from the bulb; the bulb
// cells are the ones marked by the grey circle underlays, R4C4 and R4C6):
// a short two-cell one and a long zig-zag one.
//
// Cells separated by a marked X sum to 10, by a marked V sum to 5. The rules
// state not every X/V is given, so only the marked edges below are
// constrained.

// Pumpkin outline, traced from the drawn closed loop.
const pumpkinLoop = [
  'R7C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R7C8', 'R6C8', 'R5C8',
  'R4C8', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R4C2', 'R5C2', 'R6C2',
];

const stems = [
  new Whisper(5, 'R3C4', 'R3C5', 'R3C6'),
  new Whisper(5, 'R3C5', 'R2C5', 'R1C5', 'R1C6'),
];

const thermos = [
  new Thermo('R4C4', 'R5C5'),
  new Thermo('R4C6', 'R5C7', 'R6C7', 'R7C6', 'R6C5', 'R7C4', 'R6C3', 'R5C3'),
];

// Drawn X/V edge marks; the rules state not every X/V is given, so only
// these marked edges are constrained.
const xvClues = [
  new V('R5C7', 'R6C7'),
  new X('R8C4', 'R8C5'),
  new X('R7C8', 'R7C9'),
  new V('R5C1', 'R6C1'),
  new X('R7C3', 'R8C3'),
  new X('R5C5', 'R6C5'),
  new X('R3C8', 'R3C9'),
  new V('R1C8', 'R1C9'),
  new V('R3C3', 'R3C4'),
];

return [
  new Shape('9x9'),
  // Closed loop: repeat the first two cells so the window-of-3 rule also
  // covers the two wrap-around windows (..last,first.. and last,first,second).
  new Entropic(...pumpkinLoop, pumpkinLoop[0], pumpkinLoop[1]),
  ...stems,
  ...thermos,
  ...xvClues,
];
