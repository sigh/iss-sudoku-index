// Title: June 26, 2022: Excessivenesses
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=idOQ2SbahmQ
// Source: https://tinyurl.com/3p7uuwcj

// Normal sudoku rules apply. Digits in cells separated by a V must sum to 5,
// by an X must sum to 10, and by an XV must sum to 15. The rules explicitly
// state there is no negative constraint: unmarked adjacent pairs may also sum
// to 5, 10, or 15, so only the drawn markers are constrained (StrictXV, which
// would forbid that, is not used). ISS has no built-in 15-sum pair class, so
// XV markers use Sum(15, a, b); V and X markers use the dedicated V/X classes.

return [
  new Shape('9x9'),

  // Givens (R#C#=digit).
  new Given('R1C8', 9),
  new Given('R2C8', 6),
  new Given('R2C9', 8),
  new Given('R3C8', 7),
  new Given('R7C2', 1),
  new Given('R8C1', 4),
  new Given('R8C2', 2),
  new Given('R9C2', 3),

  // V/X/XV markers, one per drawn circle+text pair on a shared cell edge.
  new V('R7C8', 'R8C8'),
  new V('R4C6', 'R5C6'),
  new V('R3C4', 'R3C5'),
  new V('R1C3', 'R2C3'),
  new V('R4C3', 'R5C3'),

  new X('R6C4', 'R6C5'),
  new X('R6C5', 'R7C5'),
  new X('R7C6', 'R8C6'),
  new X('R8C6', 'R8C7'),
  new X('R7C8', 'R7C9'),
  new X('R6C9', 'R7C9'),
  new X('R5C6', 'R5C7'),
  new X('R4C5', 'R4C6'),
  new X('R3C5', 'R4C5'),
  new X('R2C4', 'R3C4'),
  new X('R2C3', 'R2C4'),
  new X('R3C1', 'R3C2'),
  new X('R3C1', 'R4C1'),
  new X('R5C3', 'R5C4'),

  new Sum(15, 'R5C4', 'R6C4'),
  new Sum(15, 'R8C7', 'R9C7'),
  new Sum(15, 'R7C5', 'R7C6'),
  new Sum(15, 'R2C2', 'R3C2'),
  new Sum(15, 'R5C7', 'R6C7'),
];
