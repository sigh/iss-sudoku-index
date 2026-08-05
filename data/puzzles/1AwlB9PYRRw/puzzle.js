// Title: Yux
// Author: Jakhob & wooferzfg
// Video: https://www.youtube.com/watch?v=1AwlB9PYRRw
// Source: https://app.crackingthecryptic.com/sudoku/Pm3BMQ9tFh

// Normal Sudoku rules apply. Each arrow's arm digits sum to its circular bulb.
// Arrow paths transcribed from the 15 rendered pale arrows; each list begins at its circle.
return [
  new Shape('9x9'),
  new Given('R1C1', 6),
  new Given('R9C9', 3),
  new Arrow('R2C4', 'R1C5', 'R1C6'),
  new Arrow('R2C4', 'R2C5', 'R2C6'),
  new Arrow('R2C4', 'R3C5', 'R3C6'),
  new Arrow('R2C4', 'R1C3', 'R1C2'),
  new Arrow('R2C4', 'R3C3', 'R3C2'),
  new Arrow('R3C1', 'R4C2'),
  new Arrow('R2C7', 'R2C8', 'R2C9'),
  new Arrow('R4C7', 'R5C8', 'R5C9'),
  new Arrow('R6C6', 'R5C6', 'R4C6'),
  new Arrow('R7C4', 'R6C5', 'R5C5'),
  new Arrow('R7C4', 'R8C5', 'R8C6'),
  new Arrow('R7C4', 'R6C3'),
  new Arrow('R7C2', 'R6C1', 'R5C1'),
  new Arrow('R7C2', 'R8C3', 'R9C3'),
  new Arrow('R9C8', 'R8C9', 'R7C9'),
];
