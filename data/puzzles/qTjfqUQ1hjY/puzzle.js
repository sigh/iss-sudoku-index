// Title: Oysters
// Author: Blobz
// Video: https://www.youtube.com/watch?v=qTjfqUQ1hjY
// Source: https://sudokupad.app/blobz/oysters

// Normal sudoku rules apply (default 3x3 boxes; the drawn `regions` match them).
//
// Green lines: adjacent digits differ by at least 5 -> Whisper(5, ...).
// Pink lines: digits form a consecutive set in any order -> Renban(...).
// Cages: digits sum to the given total (and are all different) -> Cage(sum, ...).
//
// Each drawn line is a 4-cell, 3-edge open polyline (never closed), so no
// wrap-around repeat of the first cell is needed for the Whisper lines, and
// the Renban lines need nothing beyond their cell list either way. In 5
// places a pink line and a green line share both endpoint cells, together
// tracing a closed 6-cell hexagon ("oyster") -- but the rules state one rule
// per line colour, not a joint rule for the hexagon, so all 10 drawn lines
// are encoded independently.

const cages = [
  // Two-cell cages (cage id / cells / total): from `cages[].cells`.
  new Cage(11, 'R2C3', 'R2C4'),
  new Cage(9, 'R4C6', 'R4C7'),
  new Cage(17, 'R8C3', 'R8C4'),
  new Cage(15, 'R7C7', 'R7C8'),
  new Cage(4, 'R5C2', 'R5C3'),
];

const pinkLines = [
  // Consecutive-set lines: from `lines[]` waypoints (colour #f067f0).
  new Renban('R8C5', 'R9C4', 'R9C3', 'R8C2'),
  new Renban('R7C9', 'R8C8', 'R8C7', 'R7C6'),
  new Renban('R5C1', 'R6C2', 'R6C3', 'R5C4'),
  new Renban('R4C5', 'R5C6', 'R5C7', 'R4C8'),
  new Renban('R2C5', 'R3C4', 'R3C3', 'R2C2'),
];

const greenLines = [
  // Whisper(>=5) lines: from `lines[]` waypoints (colour #67f067).
  new Whisper(5, 'R8C2', 'R7C3', 'R7C4', 'R8C5'),
  new Whisper(5, 'R7C6', 'R6C7', 'R6C8', 'R7C9'),
  new Whisper(5, 'R5C1', 'R4C2', 'R4C3', 'R5C4'),
  new Whisper(5, 'R4C5', 'R3C6', 'R3C7', 'R4C8'),
  new Whisper(5, 'R2C2', 'R1C3', 'R1C4', 'R2C5'),
];

return [
  new Shape('9x9'),
  new Given('R1C8', 9),
  ...cages,
  ...pinkLines,
  ...greenLines,
];
