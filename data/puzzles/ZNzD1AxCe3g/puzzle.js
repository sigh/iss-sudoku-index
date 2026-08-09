// Title: SVS #381 - Short sandwiches
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=ZNzD1AxCe3g
// Source: https://app.crackingthecryptic.com/sudoku/Jb973GNQmd

// Normal sudoku rules apply (default row/column/box all-different).
// Each outside clue gives the sum of the digits positionally between the
// largest and the smallest digit among the six cells nearest that clue,
// counted inward from its side (the far three cells of that row/column are
// not part of the clue). This is exactly Lunchbox's "sandwiched between the
// smallest and largest of the given cells" semantics, applied to that
// six-cell subset instead of a whole line.

// Six-cell cell lists, transcribed from the drawn outside overlay clues.
const shortSandwiches = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 10], // top C1
  ['R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 0],  // top C2
  ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 3],  // top C6
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 14], // top C9
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 20], // bottom C1
  ['R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4', 10], // bottom C4
  ['R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8', 0],  // bottom C8
  ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 2],  // bottom C9
  ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 17], // left R3
  ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 10], // left R4
  ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 19], // left R7
  ['R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9', 25], // right R3
  ['R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9', 19], // right R6
  ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9', 8],  // right R7
  ['R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9', 12], // right R8
];

return [
  new Shape('9x9'),
  ...shortSandwiches.map(
    ([a, b, c, d, e, f, sum]) => new Lunchbox(sum, a, b, c, d, e, f)),
];
