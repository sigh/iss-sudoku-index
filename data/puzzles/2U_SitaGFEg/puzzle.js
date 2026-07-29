// Title: Apologetic Airlines
// Author: olima
// Video: https://www.youtube.com/watch?v=2U_SitaGFEg
// Source: https://sudokupad.app/1pcuk5mpn2

// Normal Sudoku. A red-square digit gives the column position of the 5 in its row.
// Green lines are whispers with difference 5; purple lines are renbans.
// Blue lines have equal sums in every 3x3-box segment. White dots are
// consecutive and black dots have a 1:2 ratio; dots are not exhaustive.
return [
  new Shape('9x9'),
  // The only red square is at R1C5. Its value selects the row-1 cell holding 5.
  new Or(Array.from({ length: 9 }, (_, index) => new And([
    new Given('R1C5', index + 1),
    new Given(makeCellId(1, index + 1), 5),
  ]))),

  new Whisper(5, 'R2C1', 'R3C2'),
  new Whisper(5, 'R2C9', 'R3C8'),
  new Whisper(5, 'R4C4', 'R5C5', 'R4C6', 'R3C7', 'R2C6', 'R3C5', 'R2C4', 'R3C3', 'R4C4'),

  new Renban('R6C2', 'R6C3', 'R6C4'),
  new Renban('R6C6', 'R6C7', 'R6C8'),
  new Renban('R1C1', 'R2C2'),
  new Renban('R1C9', 'R2C8'),
  new Renban('R4C1', 'R3C1', 'R3C2'),
  new Renban('R4C9', 'R3C9', 'R3C8'),

  new RegionSumLine('R8C6', 'R7C6', 'R6C6', 'R5C6', 'R4C7', 'R5C8', 'R6C8', 'R7C8', 'R8C8'),
  new RegionSumLine('R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C3', 'R5C4', 'R6C4', 'R7C4', 'R8C4'),

  // White-dot positions transcribed from the drawn dominoes.
  new WhiteDot('R8C5', 'R8C6'), new WhiteDot('R8C4', 'R8C5'),
  new WhiteDot('R3C8', 'R3C9'), new WhiteDot('R3C1', 'R3C2'),
  new WhiteDot('R1C7', 'R1C8'), new WhiteDot('R1C2', 'R1C3'),
  new WhiteDot('R3C1', 'R4C1'), new WhiteDot('R3C9', 'R4C9'),
  new WhiteDot('R3C3', 'R4C3'), new WhiteDot('R3C7', 'R4C7'),

  // Black-dot positions transcribed from the drawn dominoes.
  new BlackDot('R5C5', 'R6C5'), new BlackDot('R7C5', 'R8C5'),
  new BlackDot('R2C5', 'R3C5'), new BlackDot('R1C1', 'R1C2'),
  new BlackDot('R1C8', 'R1C9'),
];
