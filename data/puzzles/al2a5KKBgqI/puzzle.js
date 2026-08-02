// Title: Dots and Stripes
// Author: GBPack
// Video: https://www.youtube.com/watch?v=al2a5KKBgqI
// Source: https://app.crackingthecryptic.com/sudoku/9hLjJRdRpd

// Normal Sudoku. Grey circles mark thermometer bulbs, whose values increase along
// their drawn paths. The four drawn Kropki dots are positive clues only.
return [
  new Shape('9x9'),
  new Thermo('R2C5', 'R2C4', 'R3C3', 'R3C2', 'R3C1'),
  new Thermo('R2C8', 'R3C8', 'R4C9', 'R5C9', 'R6C9'),
  new Thermo('R7C1', 'R7C2', 'R7C3', 'R8C4', 'R8C5', 'R8C6'),
  new Thermo('R6C1', 'R6C2', 'R5C3', 'R5C4', 'R4C5', 'R4C6'),
  new WhiteDot('R4C2', 'R5C2'),
  new WhiteDot('R5C5', 'R5C6'),
  new BlackDot('R1C7', 'R1C8'),
  new BlackDot('R7C8', 'R7C9'),
];
