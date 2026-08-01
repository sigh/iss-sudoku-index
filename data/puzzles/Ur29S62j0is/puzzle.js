// Title: Dutch Baby
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=Ur29S62j0is
// Source: https://app.crackingthecryptic.com/hm580ts3a9

// Encodes normal Sudoku, the three given digits, and the stated white dot.
// Omitted: the solver-discovered snake and its solver-discovered killer regions.
return [
  new Shape('9x9'),
  new Given('R4C4', 5),
  new Given('R6C7', 8),
  new Given('R8C2', 9),
  new WhiteDot('R1C2', 'R2C2'),
];
