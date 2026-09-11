// Title: Syzygy
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=8DU5IQqUaw8
// Source: https://app.crackingthecryptic.com/sudoku/gJBjt7tP43

// Rules (from the video description, which names this source by its own id):
//   Normal sudoku rules apply. Digits along arrows must sum to the digit in
//   that arrow's attached circle. Digits may repeat along an arrow's path if
//   allowed by other rules. No bifurcation is required!
//
// Standard 9x9 boxes; the grid has no given digits, so the arrows are the
// whole clue set.
//
// "No bifurcation is required" is an assurance about solving method addressed
// to a human solver, not a property of the finished grid, so nothing is
// encoded for it. Everything else in the rules text is encoded below.

// Transcribed from the thirteen drawn arrows: the circled bulb cell first,
// then the arm cells in the order the shaft is drawn. Two circles each anchor
// two arrows (R3C1 and R4C4), which is why eleven circles carry thirteen
// arrows; each arrow is a separate sum onto its own circle.
return [
  new Shape('9x9'),

  new Arrow('R3C1', 'R2C1', 'R1C1'),
  new Arrow('R3C1', 'R4C2', 'R5C2', 'R6C2'),
  new Arrow('R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Arrow('R1C9', 'R2C9', 'R3C9'),
  new Arrow('R6C1', 'R7C2', 'R8C2'),
  new Arrow('R9C5', 'R9C4', 'R9C3'),
  new Arrow('R6C4', 'R5C3', 'R4C3'),
  new Arrow('R4C4', 'R3C3', 'R2C3'),
  new Arrow('R4C4', 'R5C5', 'R6C5'),
  new Arrow('R6C6', 'R6C7', 'R6C8', 'R6C9'),
  new Arrow('R2C6', 'R3C7', 'R4C8'),
  new Arrow('R8C8', 'R8C9', 'R7C9'),
  new Arrow('R9C8', 'R9C9', 'R8C9', 'R7C9'),
];
