// Title: Space settlement
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=lfXT_8yHU6A
// Source: https://sudokupad.app/2gk1e0kvpk

// Normal sudoku rules (standard 3x3 boxes, given by the source regions and
// matching the default ISS boxes). One given digit. The fog/cloud in the
// top-left corner is solving UI, not a grid rule, and is intentionally not
// encoded.
//
// Arrows: sum of the arm cells equals the digit in the connected circle
// (bulb cell first). Two arrows share the bulb at R1C7.
//
// Pink lines: digits along the line form a consecutive run in any order
// (Renban). One pink line is a closed loop; Renban only requires the cell
// set to be a consecutive run, so the closure adds no extra constraint
// beyond the cell membership already listed.

return [
  new Shape('9x9'),

  new Given('R1C1', 7),

  new Arrow('R6C6', 'R7C7', 'R8C8', 'R9C9'),
  new Arrow('R6C5', 'R7C5', 'R7C4', 'R8C4'),
  new Arrow('R5C6', 'R5C7', 'R4C7', 'R4C8'),
  new Arrow('R1C4', 'R1C3', 'R2C2', 'R2C1'),
  new Arrow('R9C1', 'R8C1', 'R7C2'),
  new Arrow('R6C2', 'R5C1', 'R4C1'),
  new Arrow('R1C7', 'R1C8', 'R2C9'),
  new Arrow('R1C7', 'R1C6', 'R2C6'),

  new Renban('R9C3', 'R8C3', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R3C8', 'R3C9'),
  new Renban('R7C6', 'R8C7', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4'),
  new Renban('R6C7', 'R7C8', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9'),
  new Renban('R3C4', 'R3C5', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R5C3', 'R4C3', 'R3C3'),
];
