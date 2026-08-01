// Title: Wayfinder
// Author: Nordy
// Video: https://www.youtube.com/watch?v=QUw6l2yUi2s
// Source: https://app.crackingthecryptic.com/RHQ6GJGg3r

// Normal Sudoku rules apply. Arrow shaft digits sum to the digit in its circled
// cell. Each drawn X joins two cells whose digits sum to 10.
// Arrow and X coordinates are transcribed from the corresponding drawn paths
// and edge labels.
return [
  new Shape('9x9'),

  new Arrow('R4C2', 'R4C1', 'R5C1', 'R6C1'),
  new Arrow('R6C8', 'R6C9', 'R5C9', 'R4C9'),
  new Arrow('R1C2', 'R2C2', 'R3C2', 'R3C3'),
  new Arrow('R1C8', 'R2C8', 'R3C8', 'R3C7'),
  new Arrow('R4C5', 'R3C5', 'R2C5', 'R1C5'),
  new Arrow('R6C4', 'R7C4', 'R8C5'),
  new Arrow('R8C2', 'R8C3', 'R7C3', 'R7C2'),
  new Arrow('R8C8', 'R8C7', 'R7C7', 'R7C8'),

  new X('R4C8', 'R5C8'),
  new X('R5C2', 'R6C2'),
  new X('R5C4', 'R5C5'),
  new X('R2C1', 'R3C1'),
  new X('R2C9', 'R3C9'),
  new X('R6C5', 'R6C6'),
];
