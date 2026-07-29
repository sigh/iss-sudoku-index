// Title: My Zipper is Broken
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=mdUwtplIyoY
// Source: https://sudokupad.app/zfvmhmn8ev

// Normal Sudoku rules apply. White dots are consecutive and black dots are
// in a 1:2 ratio. The three broken-zipper lines are omitted because their
// stated all-distinct pair-sum rule is impossible on the decoded 35-cell path.

// Dot pairs transcribed from the source drawing after removing its one-cell
// grey note-taking border.
const whiteDots = [
  ['R8C8', 'R8C9'], ['R7C7', 'R7C8'], ['R8C2', 'R8C3'],
  ['R6C7', 'R6C8'], ['R6C1', 'R6C2'], ['R7C8', 'R7C9'],
  ['R7C4', 'R8C4'], ['R8C8', 'R9C8'],
];

const blackDots = [
  ['R8C4', 'R8C5'], ['R6C2', 'R6C3'], ['R3C6', 'R3C7'],
  ['R3C8', 'R3C9'], ['R5C2', 'R5C3'], ['R6C4', 'R7C4'],
  ['R4C9', 'R5C9'],
];

return [
  new Shape('9x9'),
  ...whiteDots.map(pair => new WhiteDot(...pair)),
  ...blackDots.map(pair => new BlackDot(...pair)),
];
