// Title: Ninja Palindromes
// Author: Testarossa
// Video: https://www.youtube.com/watch?v=Kd_XbdY6_ms
// Source: https://app.crackingthecryptic.com/sudoku/F7GPt8n2ff

// Encoded here:
//   - Normal sudoku (the default 9x9 row/column/box all-different groups).
//   - The single given, R4C2 = 1.
//   - "A number outside the grid indicates the sum of digits between the 1 and
//     the 9 in that row or column" -- one Sandwich per clued lane.
//
// Omitted -- the whole drawn-line ruleset, which the solver would have to draw
// for itself: "Connect circles with lines in pairs", "Lines cannot be
// diagonal", "Lines cannot cross or touch themselves or other lines or circles
// orthogonally", "Lines must be valid palindromes", and "No digit appears more
// than twice on any line". The eight grey circles at R2C8, R3C5, R5C2, R5C5,
// R5C9, R6C7, R7C6 and R9C2 are therefore not referenced below: with the
// palindrome rule absent, nothing would tie a drawn route back to the digits.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside clue values transcribed from the printed numbers along the top and
// left edges of the board.
const sandwiches = [
  Sandwich.fromCells(27, graph.column(1), geometry),
  Sandwich.fromCells(35, graph.column(5), geometry),
  Sandwich.fromCells(23, graph.column(6), geometry),
  Sandwich.fromCells(3, graph.column(7), geometry),
  Sandwich.fromCells(6, graph.column(8), geometry),
  Sandwich.fromCells(4, graph.row(6), geometry),
  Sandwich.fromCells(21, graph.row(7), geometry),
  Sandwich.fromCells(16, graph.row(8), geometry),
  Sandwich.fromCells(9, graph.row(9), geometry),
];

return [
  new Shape('9x9'),
  new Given('R4C2', 1),
  ...sandwiches,
];
