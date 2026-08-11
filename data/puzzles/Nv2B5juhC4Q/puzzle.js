// Title: Lasso Roundup
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=Nv2B5juhC4Q
// Source: https://app.crackingthecryptic.com/sudoku/8664PGThRH

// Normal sudoku rules apply (standard 3x3 boxes, the solver default).
// Digits on an arrow sum to the digit in that arrow's circle.
// Digits on a purple line form a non-repeating consecutive set (any order):
// Renban's semantics exactly.
// Grey opaque circles (without arrows) contain the sum of all their
// orthogonally adjacent cells; this is the same "cell equals sum of those
// cells" relation as Arrow, so it reuses the Arrow class.

return [
  new Shape('9x9'),

  new Given('R1C1', 2),

  // Arrows: circle cell first, then arm cells. R9C7 carries one circle with
  // three separate arrow shafts drawn in the source as three distinct arrow
  // entries (left, right, diagonal) sharing that circle -- kept as three
  // Arrow constraints per the payload's own structure, so each shaft sums to
  // the shared circle independently.
  new Arrow('R4C9', 'R3C9', 'R2C9'),
  new Arrow('R4C6', 'R3C5'),
  new Arrow('R6C4', 'R7C5'),
  new Arrow('R6C1', 'R7C1', 'R8C1'),
  new Arrow('R9C7', 'R9C6', 'R9C5'),
  new Arrow('R9C7', 'R9C8', 'R9C9'),
  new Arrow('R9C7', 'R8C6'),

  // Grey opaque (solid-fill) circles, no arrow drawn: sum of orthogonal
  // neighbours. R1C5 sits on the top row, so it has only 3 orthogonal
  // neighbours.
  new Arrow('R1C5', 'R1C4', 'R1C6', 'R2C5'),
  new Arrow('R6C7', 'R5C7', 'R7C7', 'R6C6', 'R6C8'),
  new Arrow('R4C3', 'R3C3', 'R5C3', 'R4C2', 'R4C4'),

  // Purple lines: non-repeating consecutive digit sets, any order.
  new Renban('R3C1', 'R3C2', 'R3C3', 'R2C4', 'R2C5', 'R2C6'),
  new Renban('R6C8', 'R5C8', 'R4C8', 'R3C7', 'R2C7', 'R1C7'),
  new Renban('R4C2', 'R5C2', 'R6C2', 'R7C3', 'R8C3', 'R9C3'),
  new Renban('R8C4', 'R8C5', 'R8C6', 'R7C7', 'R7C8', 'R7C9'),
  // Closed diamond around R5C5 (R5C5 itself is not on the line); Renban is
  // set-based so the closing edge needs no repeated first cell.
  new Renban('R4C5', 'R5C4', 'R6C5', 'R5C6'),
];
