// Title: Vivian
// Author: Jakhob and wooferzfg
// Video: https://www.youtube.com/watch?v=h-ymyScJa2s
// Source: https://app.crackingthecryptic.com/sudoku/9RBP7TJD3f

// Rules encoded here in full:
//   Normal sudoku rules apply. Each purple line contains a set of consecutive
//   and non-repeating digits, in any order.
// Nothing is omitted.

// Cells of the thirteen purple lines, transcribed from the drawn purple
// (#D23BE7) strokes; a line's cells are listed in drawn order, which the set
// rule does not depend on.
const purpleLines = [
  ['R1C1', 'R1C2', 'R2C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C7'],
  ['R2C8', 'R3C9'],
  ['R4C8', 'R4C7', 'R5C7'],
  ['R5C8', 'R5C9', 'R4C9'],
  ['R6C7', 'R6C8', 'R6C9', 'R7C9'],
  ['R6C6', 'R7C5', 'R7C4', 'R8C4'],
  ['R5C4', 'R5C3', 'R6C3'],
  ['R4C1', 'R5C1'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R6C2', 'R7C3', 'R8C3', 'R9C3'],
  ['R9C6', 'R9C7', 'R8C7'],
  ['R8C8', 'R9C8'],
];

return [
  new Shape('9x9'),

  new Given('R2C9', 2),
  new Given('R9C5', 9),

  ...purpleLines.map((cells) => new Renban(...cells)),
];
