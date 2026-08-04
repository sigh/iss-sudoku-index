// Title: Wonderful Christmaslime
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=oh_RAQFadik
// Source: https://tinyurl.com/5p2asymy

// Normal sudoku rules apply (default 9x9 boxes; no drawn regions).
// Each green "lime" is a closed six-cell hexagonal loop. Every line-adjacent
// pair around the loop, including the edge that closes it back to the start,
// must differ by at least 5 (Whisper, difference 5). The loop encloses a pair
// of cells; the sum of the six loop digits equals the two-digit number formed
// by reading that pair top-to-bottom or left-to-right (PillArrow). Which two
// cells each loop encloses was established geometrically, by plotting the
// hexagon's vertices, not from the solution.

return [
  new Shape('9x9'),

  new Given('R1C1', 6), new Given('R1C2', 5),
  new Given('R1C7', 4), new Given('R1C8', 3), new Given('R1C9', 9),
  new Given('R2C1', 7), new Given('R2C7', 8), new Given('R2C9', 5),
  new Given('R3C1', 1), new Given('R3C2', 8),
  new Given('R7C8', 7), new Given('R7C9', 4),
  new Given('R8C1', 4), new Given('R8C3', 5), new Given('R8C9', 6),
  new Given('R9C1', 8), new Given('R9C2', 3), new Given('R9C3', 9),
  new Given('R9C8', 5), new Given('R9C9', 1),

  // Top lime: hexagon encloses R2C3,R2C4 (read left to right).
  new Whisper(5, 'R1C3', 'R1C4', 'R2C5', 'R3C4', 'R3C3', 'R2C2', 'R1C3'),
  new PillArrow(2, 'R2C3', 'R2C4', 'R1C3', 'R1C4', 'R2C5', 'R3C4', 'R3C3', 'R2C2'),

  // Right lime: hexagon encloses R3C8,R4C8 (read top to bottom).
  new Whisper(5, 'R3C7', 'R4C7', 'R5C8', 'R4C9', 'R3C9', 'R2C8', 'R3C7'),
  new PillArrow(2, 'R3C8', 'R4C8', 'R3C7', 'R4C7', 'R5C8', 'R4C9', 'R3C9', 'R2C8'),

  // Bottom lime: hexagon encloses R8C6,R8C7 (read left to right).
  new Whisper(5, 'R7C6', 'R7C7', 'R8C8', 'R9C7', 'R9C6', 'R8C5', 'R7C6'),
  new PillArrow(2, 'R8C6', 'R8C7', 'R7C6', 'R7C7', 'R8C8', 'R9C7', 'R9C6', 'R8C5'),

  // Left lime: hexagon encloses R6C2,R7C2 (read top to bottom).
  new Whisper(5, 'R6C3', 'R7C3', 'R8C2', 'R7C1', 'R6C1', 'R5C2', 'R6C3'),
  new PillArrow(2, 'R6C2', 'R7C2', 'R6C3', 'R7C3', 'R8C2', 'R7C1', 'R6C1', 'R5C2'),
];
