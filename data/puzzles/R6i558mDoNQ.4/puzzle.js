// Title: Big Fish
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=R6i558mDoNQ
// Source: https://tinyurl.com/2uaaejfy

// Normal sudoku. The visible clues are jokey glyphs that transform into
// givens: 1 stays 1, 2 becomes 5, 5 becomes 2, 6 becomes 9, epsilon marks
// rotate into 3s, orange cells become 6s, and R9C9 is an 8. Only the
// transformed givens below are encoded; the remaining rule text is noise.

const givens = [
  ['R1C2', 1],
  ['R1C3', 2],
  ['R1C5', 3],
  ['R1C6', 4],
  ['R1C8', 5],
  ['R1C9', 6],
  ['R3C3', 6],
  ['R3C6', 7],
  ['R4C2', 6],
  ['R4C5', 7],
  ['R5C2', 2],
  ['R5C5', 4],
  ['R5C6', 5],
  ['R5C8', 6],
  ['R5C9', 7],
  ['R6C2', 4],
  ['R6C5', 6],
  ['R6C8', 2],
  ['R7C3', 9],
  ['R7C9', 4],
  ['R9C3', 4],
  ['R9C5', 5],
  ['R9C6', 6],
  ['R9C8', 7],
  ['R5C3', 3],
  ['R9C2', 3],
  ['R7C6', 3],
  ['R4C8', 3],
  ['R3C9', 3],
  ['R9C9', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];