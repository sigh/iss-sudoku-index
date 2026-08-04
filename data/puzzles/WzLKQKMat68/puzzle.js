// Title: Not Too High, Not Too Low
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=WzLKQKMat68
// Source: https://app.crackingthecryptic.com/sudoku/MdmM24fgr9

// Normal sudoku rules apply (default row/column/box all-different; the
// payload's regions match the default box layout exactly, so no explicit
// Regions/Jigsaw is needed).
// Cages: digits sum to the corner clue, no repeats within a cage -- Cage(sum,
// ...cells) enforces both.
// Green lines: adjacent digits differ by at least 5 -- Whisper(5, ...cells).
// Six separate green lines are drawn (traced from the payload's line
// segments by shared endpoints); none of them close into a loop.

const cages = [
  new Cage(20, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(20, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(13, 'R4C6', 'R4C7', 'R5C7'),
  new Cage(20, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(20, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
];

const whispers = [
  new Whisper(5, 'R8C4', 'R9C4', 'R9C3'),
  new Whisper(5, 'R3C8', 'R4C8', 'R4C7'),
  new Whisper(5, 'R3C9', 'R4C9'),
  new Whisper(5, 'R7C8', 'R7C9'),
  new Whisper(5, 'R5C7', 'R6C8', 'R6C7', 'R6C6', 'R7C6', 'R8C6', 'R7C5'),
  new Whisper(5, 'R5C3', 'R4C2', 'R4C3', 'R3C2', 'R3C3', 'R2C3', 'R3C4', 'R2C4', 'R3C5', 'R4C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
];
