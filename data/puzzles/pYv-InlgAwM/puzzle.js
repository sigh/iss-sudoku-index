// Title: Two Face
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=pYv-InlgAwM
// Source: https://app.crackingthecryptic.com/sudoku/6tjbqNGt37

// Normal sudoku rules apply (rows, columns, boxes all-different).
// Grey-square cells must hold an even digit -- encoded as a 5-way Given
// (there is no dedicated Odd/Even class; a parity clue is a candidate
// restriction, per the iss-constraints catalog).
// Along a red line, digits must alternate parity -- Modular(2, ...) requires
// every consecutive pair to differ mod 2, which is exactly alternating
// odd/even. The closed loop (loop 4 below) repeats its first cell at the end
// of its cell list to cover the wrap-around edge, per Modular's sequential-
// pair binding.
// Along a blue line, the digits must sum to the same total N within each
// 3x3 box the line passes through -- RegionSumLine, which splits a line's
// cell list into per-box segments (a box visited twice gets one N-sum per
// visit) and requires each segment to sum to the same N. The rules' own
// worked example (r8c6 = r8c7+r7c7 = r6c8+r5c8+r5c9) matches blue line 3
// below, confirming this reading.

const greySquares = [
  'R1C2', 'R1C8', 'R4C5', 'R9C3', 'R9C7',
];

const redLines = [
  ['R9C4', 'R9C5', 'R9C6'],
  ['R8C4', 'R8C3', 'R7C3', 'R6C2', 'R5C2', 'R5C1', 'R4C1'],
  ['R2C1', 'R3C1', 'R4C2', 'R5C3', 'R6C3'],
  ['R6C4', 'R5C5', 'R6C6', 'R6C5', 'R6C4'], // closed loop; first cell repeated
  ['R2C3', 'R3C4', 'R2C4', 'R3C5', 'R2C6', 'R3C6', 'R2C7'],
  ['R2C9', 'R3C9', 'R4C9', 'R4C8', 'R5C7', 'R6C7'],
];

const blueLines = [
  ['R5C4', 'R4C4', 'R4C3', 'R3C2', 'R2C2'],
  ['R5C6', 'R4C6', 'R4C7', 'R3C8', 'R2C8'],
  ['R5C9', 'R5C8', 'R6C8', 'R7C7', 'R8C7', 'R8C6'],
];

return [
  new Shape('9x9'),
  new Given('R1C5', 1),
  new Given('R6C1', 9),
  new Given('R6C9', 3),
  new Given('R7C5', 2),
  ...greySquares.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...redLines.map(cells => new Modular(2, ...cells)),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
];
