// Title: Polychrome
// Author: StartUp
// Video: https://www.youtube.com/watch?v=hUbT36CSWVg
// Source: https://app.crackingthecryptic.com/ouqwb0efmh

// Normal Sudoku, the two odd circles, and drawn Kropki dots are encoded. The
// coloured killer cages are omitted because their freehand boundaries are not
// recoverable from the local payload. Fog is UI-only.
return [
  new Shape('9x9'),
  new Given('R7C5', 1, 3, 5, 7, 9), new Given('R9C9', 1, 3, 5, 7, 9),
  new WhiteDot('R7C4', 'R7C5'), new WhiteDot('R2C2', 'R2C3'),
  new WhiteDot('R1C2', 'R2C2'), new WhiteDot('R1C7', 'R1C8'), new WhiteDot('R7C1', 'R8C1'),
  new BlackDot('R6C5', 'R7C5'), new BlackDot('R3C3', 'R3C4'),
  new BlackDot('R2C3', 'R3C3'), new BlackDot('R1C1', 'R1C2'), new BlackDot('R2C8', 'R2C9'),
];
