// Title: Sept. 13, 2023: 129 Pairs
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=NlyLUsi0lcs
// Source: https://tinyurl.com/3bcykues

// Normal Sudoku with the nine diagonal givens. White and black dots are the
// listed Kropki pairs; V and X marks are the listed 5- and 10-sum pairs.
return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R2C2', 2), new Given('R3C3', 3),
  new Given('R4C4', 4), new Given('R5C5', 5), new Given('R6C6', 6),
  new Given('R7C7', 7), new Given('R8C8', 8), new Given('R9C9', 9),

  // White-dot pairs transcribed from the source's difference entries.
  new WhiteDot('R7C1', 'R8C1'), new WhiteDot('R2C9', 'R3C9'),
  new WhiteDot('R4C1', 'R4C2'), new WhiteDot('R6C8', 'R6C9'),
  new WhiteDot('R3C6', 'R4C6'),

  // Black-dot pairs transcribed from the source's ratio entries.
  new BlackDot('R9C1', 'R8C1'), new BlackDot('R2C9', 'R1C9'),
  new BlackDot('R4C3', 'R5C3'), new BlackDot('R5C7', 'R6C7'),
  new BlackDot('R3C4', 'R4C4'),

  // V and X pairs transcribed from the source's xv entries.
  new V('R1C8', 'R1C9'), new X('R1C7', 'R1C8'),
  new V('R9C2', 'R9C1'), new X('R9C2', 'R9C3'),
  new V('R6C3', 'R5C3'), new X('R4C2', 'R4C3'),
  new V('R4C7', 'R5C7'), new X('R6C8', 'R6C7'),
  new V('R6C4', 'R7C4'), new X('R7C6', 'R6C6'),
];
