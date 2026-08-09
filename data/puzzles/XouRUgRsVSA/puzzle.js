// Title: 'Leven
// Author: mormagli
// Video: https://www.youtube.com/watch?v=XouRUgRsVSA
// Source: https://app.crackingthecryptic.com/sudoku/jtgN8Hd7f6

// Normal sudoku rules apply on the 9x9 grid with standard 3x3 boxes (default
// Shape regions). Cells separated by a black dot must contain digits in a
// 1:2 ratio (BlackDot). Each purple line holds a set of 4 non-repeating,
// consecutive digits, in any order (Renban).
//
// Black-dot cell pairs and purple-line cell paths are hand-transcribed from
// the drawn overlay/line geometry; no rule clause is omitted.

const blackDots = [
  ['R3C5', 'R3C6'],
  ['R4C7', 'R5C7'],
  ['R1C7', 'R1C8'],
  ['R2C9', 'R3C9'],
].map((cells) => new BlackDot(...cells));

const purpleLines = [
  ['R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C6'],
  ['R2C3', 'R2C4', 'R3C4', 'R4C4'],
  ['R3C1', 'R4C1', 'R5C1', 'R5C2'],
  ['R5C4', 'R5C3', 'R6C3', 'R7C3'],
  ['R5C5', 'R5C6', 'R6C6', 'R7C6'],
  ['R6C7', 'R7C7', 'R8C7', 'R8C6'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ['R9C3', 'R9C4', 'R8C4', 'R7C4'],
  ['R4C8', 'R4C9', 'R5C9', 'R6C9'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8'],
].map((cells) => new Renban(...cells));

return [
  new Shape('9x9'),
  new Given('R3C7', 1),
  ...blackDots,
  ...purpleLines,
];
