// Title: Siphon
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=ZB4_9PvpeWE
// Source: https://app.crackingthecryptic.com/sudoku/LnDdRF6R6t

// Normal sudoku rules apply (standard 9x9 grid, standard 3x3 boxes).
// For each of the 8 drawn lines, digits on the line have an equal sum N
// within each 3x3 box the line passes through; a line that revisits a box
// gets a separate segment sum for each visit. N is independent per line.
// RegionSumLine implements this rule verbatim (its own DESCRIPTION matches
// the puzzle's rules text, including the revisit clause) by splitting each
// line's cell list into maximal same-box runs in path order. None of these
// 8 lines is a closed loop, so no start-rotation is needed to avoid a false
// wrap-around split.

const lines = [
  ['R6C1', 'R7C1', 'R8C1', 'R8C2'],
  ['R6C9', 'R7C9', 'R8C9', 'R8C8'],
  ['R8C3', 'R9C3', 'R9C4', 'R8C4', 'R7C4', 'R6C3', 'R5C2'],
  ['R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R8C7', 'R9C7', 'R9C6', 'R8C6', 'R7C6', 'R6C7', 'R5C8'],
  ['R2C4', 'R2C3', 'R3C3', 'R4C4', 'R5C4'],
  ['R2C6', 'R2C7', 'R3C7', 'R4C6', 'R5C6'],
  ['R2C8', 'R3C9', 'R4C9'],
];

return [
  new Shape('9x9'),
  new Given('R1C5', 4),
  new Given('R9C2', 3),
  ...lines.map((cells) => new RegionSumLine(...cells)),
];
