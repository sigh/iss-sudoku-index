// Title: Just 3 arrows
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=8EJ9KCtLpdM
// Source: https://app.crackingthecryptic.com/pRbFdgnRBr

// Place 1-7 in each row, column, and marked region. Each arrow's arm sums to
// its attached circle; arm digits may repeat if other rules allow them.
// The seven Jigsaw tables transcribe the seven marked regions in the drawing.
return [
  new Shape('7x7'),
  new NoBoxes(),
  new Jigsaw('7x7', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C1'),
  new Jigsaw('7x7', 'R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C6', 'R5C7', 'R6C6'),
  new Jigsaw('7x7', 'R6C7', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'),
  new Jigsaw('7x7', 'R2C2', 'R3C1', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1'),
  new Jigsaw('7x7', 'R2C3', 'R2C4', 'R3C3', 'R4C2', 'R4C3', 'R5C2', 'R6C2'),
  new Jigsaw('7x7', 'R2C5', 'R3C4', 'R3C5', 'R4C4', 'R5C3', 'R5C4', 'R6C3'),
  new Jigsaw('7x7', 'R2C6', 'R3C6', 'R4C5', 'R4C6', 'R5C5', 'R6C4', 'R6C5'),
  // Arrow paths are transcribed from the three circle-and-shaft drawings.
  new Arrow('R6C2', 'R5C2', 'R5C1', 'R4C1'),
  new Arrow('R2C6', 'R3C6', 'R3C7', 'R4C7'),
  new Arrow('R7C7', 'R7C6', 'R7C5'),
];
