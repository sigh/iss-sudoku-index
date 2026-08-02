// Title: Sept. 25, 2023: 129 Pills
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=IWEB54lMi0U
// Source: https://tinyurl.com/3k3tcxx9

// Normal Sudoku with each two-cell pill read left-to-right or top-to-bottom;
// each resulting number is the sum of its arrow. Single-cell circles are
// ordinary arrows.
return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R2C2', 2), new Given('R3C3', 3),
  new Given('R4C4', 4), new Given('R5C5', 5), new Given('R6C6', 6),
  new Given('R7C7', 7), new Given('R8C8', 8), new Given('R9C9', 9),

  // Pills and arrow paths transcribed from the drawn arrows.
  new PillArrow(2, 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new PillArrow(2, 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'),
  new PillArrow(2, 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'),
  new PillArrow(2, 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Arrow('R6C6', 'R6C7', 'R6C8'),
  new PillArrow(2, 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3'),
  new PillArrow(2, 'R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7'),
  new Arrow('R6C4', 'R5C4', 'R4C4'),
  new Arrow('R4C6', 'R5C6', 'R6C6'),
  new Arrow('R4C2', 'R4C3', 'R4C4'),
];
