// Title: The Pyramid
// Author: Willy Wonka
// Video: https://www.youtube.com/watch?v=kGWUZfi0saQ
// Source: https://cracking-the-cryptic.web.app/sudoku/Tpb6rjjRtN

// Normal sudoku rules (rows/columns/boxes) plus killer sudoku rules (cage
// cells sum to the printed total and may not repeat within the cage) plus
// an anti-knight constraint (cells a knight's move apart may not repeat).
// No givens. Cage cell lists below are transcribed from the payload's
// `cages` array (source-verified against the drawn "pyramid" cage shape).

return [
  new Shape('9x9'),

  new Cage(15, 'R4C5', 'R5C4', 'R5C5', 'R5C6'),
  new Cage(18, 'R6C3', 'R6C4', 'R6C5', 'R7C3'),
  new Cage(14, 'R7C4', 'R7C5', 'R7C6'),
  new Cage(15, 'R6C6', 'R6C7', 'R7C7', 'R8C7'),
  new Cage(21, 'R7C2', 'R8C2', 'R8C3', 'R8C4'),
  new Cage(15, 'R8C5', 'R8C6', 'R9C5', 'R9C6'),
  new Cage(15, 'R7C8', 'R8C8', 'R8C9'),
  new Cage(11, 'R9C7', 'R9C8', 'R9C9'),
  new Cage(25, 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),

  new AntiKnight(),
];
