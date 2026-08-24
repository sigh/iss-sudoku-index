// Title: Arrow Twist
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Gkdh7pYKMbo
// Source: https://app.crackingthecryptic.com/sudoku/gFgtmMjPRm

// Normal sudoku rules apply, and identical digits cannot be within a king's
// move of each other. Digits do not repeat on the blue diagonals. Cages show
// their sums. Digits along an arrow sum to the number in the circle.
//
// Twelve arrows share only five circles: four ordinary two-cell arrows each
// with their own circle, and eight two-cell arrows that all share the single
// circle drawn at the grid centre (R5C5), one running outward in each
// compass direction. Arrow() takes the bulb/circle cell first followed by
// the arm cells, so the eight centre arrows are eight separate Arrow
// constraints that all name R5C5 as their first argument.

return [
  new Shape('9x9'),

  new Given('R1C4', 7),
  new Given('R2C7', 8),
  new Given('R3C2', 4),
  new Given('R4C9', 3),
  new Given('R6C1', 3),
  new Given('R7C8', 7),
  new Given('R8C3', 3),
  new Given('R9C6', 7),

  new AntiKing(),

  // Diagonal(-1) is the main diagonal (R1C1..R9C9); Diagonal(1) is the
  // anti-diagonal (R1C9..R9C1) -- per sudoku_builder.js's direction>0 case.
  new Diagonal(-1),
  new Diagonal(1),

  // Four 2x2 corner cages, total 18 each.
  new Cage(18, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(18, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(18, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(18, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),

  // Four ordinary arrows, each with its own circle.
  new Arrow('R2C4', 'R3C4', 'R4C3'),
  new Arrow('R4C8', 'R4C7', 'R3C6'),
  new Arrow('R8C6', 'R7C6', 'R6C7'),
  new Arrow('R6C2', 'R6C3', 'R7C4'),

  // Eight arrows sharing the centre circle R5C5, one per compass direction.
  new Arrow('R5C5', 'R5C4', 'R5C3'),
  new Arrow('R5C5', 'R4C4', 'R3C3'),
  new Arrow('R5C5', 'R4C5', 'R3C5'),
  new Arrow('R5C5', 'R4C6', 'R3C7'),
  new Arrow('R5C5', 'R5C6', 'R5C7'),
  new Arrow('R5C5', 'R6C6', 'R7C7'),
  new Arrow('R5C5', 'R6C5', 'R7C5'),
  new Arrow('R5C5', 'R6C4', 'R7C3'),
];
