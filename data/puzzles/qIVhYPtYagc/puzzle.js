// Title: Think inside the box
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=qIVhYPtYagc
// Source: https://app.crackingthecryptic.com/48jp7phsoy

// Normal Sudoku rules apply. Green lines are whispers with difference at least
// five between adjacent cells. Blue lines have equal sums in every 3x3-box
// segment. The purple line is a renban. The listed paths transcribe the drawn
// line geometry; each closed blue loop is rotated so no box segment straddles
// the list boundary.
const greenWhispers = [
  new Whisper(5, 'R1C3', 'R2C2', 'R3C1', 'R4C2', 'R5C3'),
  new Whisper(5, 'R1C3', 'R2C4', 'R3C5', 'R4C4', 'R5C3'),
  new Whisper(5, 'R9C7', 'R8C8', 'R7C9'),
  new Whisper(5, 'R9C7', 'R8C6', 'R7C5', 'R6C6', 'R5C7', 'R6C8', 'R7C9'),
  new Whisper(5, 'R2C7', 'R3C6', 'R4C7'),
  new Whisper(5, 'R2C7', 'R3C8', 'R4C7'),
];

// The blue loops are transcribed from the drawn blue paths.
const blueRegionSumLines = [
  new RegionSumLine('R3C4', 'R2C3', 'R3C2', 'R4C3'),
  new RegionSumLine('R4C6', 'R5C7', 'R4C8', 'R3C9', 'R2C8', 'R1C7', 'R2C6', 'R3C5'),
];

return [
  new Shape('9x9'),
  // Givens transcribed from the source grid.
  new Given('R3C3', 7),
  new Given('R3C7', 5),
  new Given('R7C7', 7),
  ...greenWhispers,
  ...blueRegionSumLines,
  new Renban('R6C7', 'R7C6', 'R8C7', 'R7C8'),
];
