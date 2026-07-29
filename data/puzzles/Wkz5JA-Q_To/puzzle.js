// Title: Crac-King the Easter Eggs
// Author: olima
// Video: https://www.youtube.com/watch?v=Wkz5JA-Q_To
// Source: https://app.crackingthecryptic.com/t1fwee4bpz

// Rules encoded:
// - Normal 9x9 Sudoku with standard 3x3 boxes and anti-king.
// - Adjacent digits on green lines differ by at least 5.
// - Each blue line has equal sums in every visited box segment.
// - The drawn black dot is a 1:2 ratio and the white dot is consecutive.
//   Not all dots are given, so there is no negative Kropki rule.

// Green paths, from the source-drawn line entries. The closed loop repeats
// its first cell to retain the drawn closing edge.
const greenLines = [
  ['R5C6', 'R4C7', 'R5C8', 'R4C9'],
  ['R3C3', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C3', 'R8C4',
   'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C4', 'R3C3'],
];

// Blue paths, from the source-drawn line entries. The closed loop omits its
// repeated first cell because its two endpoints are in different boxes.
const blueLines = [
  ['R5C2', 'R6C3', 'R5C4', 'R6C5'],
  ['R2C7', 'R2C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C8',
   'R7C7', 'R6C6', 'R5C6', 'R4C6', 'R3C6'],
];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
  new BlackDot('R7C3', 'R7C4'),
  new WhiteDot('R3C7', 'R3C8'),
];
