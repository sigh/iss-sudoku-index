// Title: August 9, 2021: GAS LXIV
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=i3JiNbn1t_Q
// Source: https://tinyurl.com/rx2t57jk

// Normal sudoku rules apply. Digits in cells separated by an X must sum to
// 10, and digits in cells separated by a V must sum to 5. Not all Xs and Vs
// are given, so absence of a mark carries no information: only the drawn
// markers below are encoded (plain X/V, not StrictXV/StrictKropki).
// Each marker is a single adjacent pair, as drawn.

return [
  new Shape('9x9'),

  new Given('R1C3', 8),
  new Given('R2C8', 3),
  new Given('R4C1', 6),
  new Given('R6C9', 7),
  new Given('R8C2', 4),
  new Given('R9C7', 2),

  new X('R4C5', 'R4C6'),
  new X('R5C6', 'R6C6'),
  new X('R6C4', 'R6C5'),
  new X('R4C4', 'R5C4'),
  new X('R5C7', 'R6C7'),
  new X('R6C1', 'R6C2'),
  new X('R4C8', 'R4C9'),
  new X('R4C3', 'R5C3'),
  new X('R3C7', 'R4C7'),
  new X('R6C3', 'R7C3'),
  new X('R2C4', 'R3C4'),
  new X('R7C6', 'R8C6'),

  new V('R5C7', 'R5C8'),
  new V('R5C2', 'R5C3'),
  new V('R3C3', 'R3C4'),
  new V('R7C6', 'R7C7'),
  new V('R3C5', 'R3C6'),
  new V('R7C4', 'R7C5'),
  new V('R4C7', 'R4C8'),
  new V('R6C2', 'R6C3'),
];
