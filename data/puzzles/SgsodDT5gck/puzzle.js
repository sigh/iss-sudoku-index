// Title: Eye Of Sauron
// Author: Ricky Cruz
// Video: https://www.youtube.com/watch?v=SgsodDT5gck
// Source: https://app.crackingthecryptic.com/sudoku/GGHBGH8G9g

// Normal sudoku rules apply (default 9x9, standard boxes). Digits along an
// arrow sum to the digit in that arrow's circle. Adjacent digits along a
// green line differ by at least 5 (Whisper).

// Whisper lines: cell lists transcribed from the six drawn green-line
// waypoint sequences (a3e048, thickness 8). Line 3 is a closed loop (the
// eye's iris); its diagonal waypoint segments are expanded to the grid cells
// their straight-line midpoints pass through, and the first cell repeats at
// the end to cover the wrap-around edge.
const whisperLines = [
  ['R2C1', 'R3C1', 'R4C1'],
  ['R2C9', 'R3C9', 'R4C9'],
  ['R1C5', 'R2C4', 'R3C3', 'R4C3', 'R5C4', 'R6C5', 'R5C6', 'R4C7', 'R3C7', 'R2C6', 'R1C5'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C5'],
  ['R7C4', 'R7C3', 'R8C3', 'R9C4'],
  ['R7C6', 'R7C7', 'R8C7', 'R9C6'],
];

// Arrows: bulb cell first, then arm cells. Bulb cells come from the three
// white/grey-bordered underlay circles, each coincident with an arrow's first
// waypoint. R8C5 is shared by two separate arrows (two arms, one circle).
const arrows = [
  ['R8C2', 'R8C1', 'R7C1', 'R6C1'],
  ['R8C5', 'R8C4', 'R7C5'],
  ['R8C5', 'R8C6', 'R9C5'],
  ['R8C8', 'R8C9', 'R7C9', 'R6C9'],
];

return [
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
