// Title: Oct. 3, 2021: Sagittarius II
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=nwmF0fIEiC8
// Source: https://tinyurl.com/5xvujcb9

// Normal sudoku rules apply. Digits along arrows sum to the circled total.
// Digits separated by a V sum to 5; digits separated by an X sum to 10.
// Not every XV pair is necessarily marked, so no StrictXV negative
// constraint is used.

return [
  new Shape('9x9'),

  // Arrows: circle cell first, then shaft cells, per the source payload.
  new Arrow('R3C5', 'R4C4', 'R5C3'),
  new Arrow('R1C3', 'R2C4', 'R3C5'),
  new Arrow('R5C7', 'R6C8', 'R7C9'),
  new Arrow('R7C5', 'R6C6', 'R5C7'),
  new Arrow('R9C7', 'R8C6', 'R7C5'),
  new Arrow('R9C9', 'R9C8', 'R9C7'),
  new Arrow('R3C1', 'R4C2', 'R5C3'),
  new Arrow('R4C5', 'R4C6', 'R4C7'),
  new Arrow('R6C3', 'R6C4', 'R6C5'),
  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R9C3', 'R8C2', 'R7C1'),
  new Arrow('R1C7', 'R2C8', 'R3C9'),

  // XV pairs, from the source payload.
  new V('R1C2', 'R1C3'),
  new X('R9C8', 'R9C9'),
  new V('R5C4', 'R4C4'),
  new X('R5C6', 'R6C6'),
  new V('R6C5', 'R6C6'),
  new X('R4C5', 'R4C4'),
  new X('R8C1', 'R7C1'),
  new V('R2C9', 'R3C9'),
  new X('R9C4', 'R9C3'),
  new X('R1C8', 'R1C7'),
  new X('R2C2', 'R2C3'),
  new X('R8C9', 'R8C8'),
  new X('R5C3', 'R6C3'),
  new V('R4C7', 'R5C7'),
];
