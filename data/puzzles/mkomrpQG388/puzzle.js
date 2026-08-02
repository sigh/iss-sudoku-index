// Title: 10 (Types of) Lines
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=mkomrpQG388
// Source: https://app.crackingthecryptic.com/sudoku/Ftfnn4L2tQ

// Normal Sudoku rules apply. The numbered corner circles require each displayed
// digit at least once in their four surrounding cells. The ten coloured lines
// encode, in source order: thermo, between, entropic, modular, Nabner, parity,
// region sum, renban, 10 line, and whisper.
const nabner = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),

  // Numbered circles, transcribed from the six drawn corner circles.
  new Quad('R3C8', 3),
  new Quad('R2C6', 2, 7),
  new Quad('R2C3', 2, 8),
  new Quad('R7C3', 2, 5, 8),
  new Quad('R7C6', 8, 9),
  new Quad('R6C1', 9),

  new Thermo('R4C3', 'R3C3', 'R2C3', 'R1C3'),
  new Between('R1C7', 'R2C7', 'R3C7', 'R4C7'),
  new Entropic('R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Modular(3, 'R6C7', 'R7C7', 'R8C7', 'R9C7'),
  // Nabner forbids consecutive digits in every pair of cells on its line.
  new PairX(nabner, 'Nabner', 'R6C3', 'R7C3', 'R8C3', 'R9C3'),
  new Modular(2, 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new RegionSumLine('R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Renban('R1C5', 'R2C5', 'R3C5', 'R4C5'),
  new SumLine(10, 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Whisper(5, 'R1C1', 'R2C1', 'R3C1', 'R4C1'),
];
