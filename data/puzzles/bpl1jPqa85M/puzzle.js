// Title: The Unfrayed Modified German Whisper Loop
// Author: AFrayedKnot
// Video: https://www.youtube.com/watch?v=bpl1jPqa85M
// Source: https://sudokupad.app/e99mf1heg8

// Normal Sudoku rules apply. Each pair of digits connected by a line segment
// must either differ by at least 5, or sum to at most 5.
//
// The single closed loop's cell order (repeating the first cell at the end)
// is transcribed from the drawn line's waypoints, closing the loop back to
// its start.
const loop = [
  'R1C3', 'R2C3', 'R2C4', 'R3C4', 'R3C5', 'R2C5', 'R2C6', 'R2C7', 'R3C7',
  'R3C8', 'R3C9', 'R4C9', 'R4C8', 'R5C8', 'R6C8', 'R6C9', 'R7C9', 'R7C8',
  'R8C8', 'R8C7', 'R7C7', 'R7C6', 'R6C6', 'R6C5', 'R7C5', 'R8C5', 'R8C6',
  'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R8C3', 'R8C2', 'R9C2', 'R9C1', 'R8C1',
  'R7C1', 'R6C1', 'R6C2', 'R5C2', 'R4C2', 'R4C1', 'R3C1', 'R2C1', 'R1C1',
  'R1C2', 'R1C3',
];

return [
  new Shape('9x9'),
  new Pair(
    Pair.fnToKey((a, b) => Math.abs(a - b) >= 5 || a + b <= 5, 9),
    'Modified German Whisper',
    ...loop),
];
