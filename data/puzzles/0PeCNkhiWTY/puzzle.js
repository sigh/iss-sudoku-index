// Title: Magical Rose
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=0PeCNkhiWTY
// Source: https://app.crackingthecryptic.com/sudoku/FbFqNLGhND

// Normal sudoku rules apply. Both main diagonals are non-repeat (drawn blue,
// lines #0/#1 in the payload). Four arrows: circled digit equals the sum of
// its shaft. Two outside clues give the sum along a diagonal parallel to one
// of the main diagonals but offset by one row/col; digits may repeat there
// (rules text: "Digits may repeat along such a diagonal if allowed by other
// rules"), so no non-repeat constraint is added to them.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  // Both main diagonals drawn blue -> non-repeat on each (direction value is
  // just ISS's internal `/` vs `\` label; both are present here).
  new Diagonal(1),
  new Diagonal(-1),

  // Arrows: circle cell first, then shaft cells outward.
  // R2C2 circle, shaft R1C3-R1C4 (arrow #0).
  new Arrow('R2C2', 'R1C3', 'R1C4'),
  // R2C8 circle, shaft R1C7-R1C6-R1C5 (arrow #1).
  new Arrow('R2C8', 'R1C7', 'R1C6', 'R1C5'),
  // R8C8 circle, shaft R9C7-R9C6 (arrow #2).
  new Arrow('R8C8', 'R9C7', 'R9C6'),
  // R8C2 circle, shaft R9C3-R9C4-R9C5 (arrow #3).
  new Arrow('R8C2', 'R9C3', 'R9C4', 'R9C5'),

  // Outside diagonal sums (arrow #4/#5 + overlay "35"/"26" in the payload).
  // "35": enters at the corner between R1C9/R2C9, running down-left.
  LittleKiller.fromCells(35, graph.ray('R2C9', 1, -1), geometry),
  // "26": enters at the corner between R5C9/R6C9, running up-left.
  LittleKiller.fromCells(26, graph.ray('R5C9', -1, -1), geometry),
];
