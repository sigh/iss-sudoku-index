// Title: Giza
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=J2YnRpU042k
// Source: https://sudokupad.app/2vnskp4zft

// Horizontal lines are renbans, vertical lines are German whispers, and
// diagonal lines are region sum lines.
const renbans = [
  new Renban('R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new Renban('R7C3', 'R7C4', 'R7C5', 'R7C6'),
  new Renban('R5C5', 'R5C6', 'R5C7', 'R5C8'),
  new Renban('R1C6', 'R1C7', 'R1C8', 'R1C9'),
];

const whispers = [
  new Whisper(5, 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Whisper(5, 'R7C3', 'R6C3', 'R5C3', 'R4C3'),
  new Whisper(5, 'R2C5', 'R3C5', 'R4C5', 'R5C5'),
  new Whisper(5, 'R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Whisper(5, 'R1C3', 'R2C3'),
];

const regionSumLines = [
  new RegionSumLine('R6C1', 'R7C2', 'R8C3', 'R9C4'),
  new RegionSumLine('R4C3', 'R5C4', 'R6C5', 'R7C6'),
  new RegionSumLine('R2C5', 'R3C6', 'R4C7', 'R5C8'),
  new RegionSumLine('R3C8', 'R4C9'),
  new RegionSumLine('R1C6', 'R2C7'),
];

return [
  new Shape('9x9'),
  ...renbans,
  ...whispers,
  ...regionSumLines,
];
