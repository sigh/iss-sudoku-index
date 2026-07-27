// Title: Ringing Alarm
// Author: EPH
// Video: https://www.youtube.com/watch?v=4ZWWT2Wl2Uk
// Source: https://sudokupad.app/ywvti83rcl
//
// Rules: normal sudoku; killer cages (non-repeating, sum to the corner clue);
// purple lines are Renban (non-repeating consecutive digits, any order);
// green lines are German whispers (adjacent digits differ by >= 5, here
// Whisper(5)). No drawn regions, so the default 3x3 boxes apply.

// Killer cages: cells and sums transcribed from the drawn cage geometry.
const cages = [
  ["R1C1", "R1C2", "R2C1", "R2C2", 19],
  ["R1C8", "R1C9", "R2C8", "R2C9", 17],
  ["R8C1", "R8C2", "R9C1", "R9C2", 18],
  ["R8C8", "R8C9", "R9C8", "R9C9", 15],
  ["R4C9", "R5C9", "R6C9", 11],
  ["R4C1", "R5C1", "R6C1", 23],
];

// Purple Renban lines, transcribed from the drawn line geometry.
const renbanLines = [
  ["R3C5", "R4C5", "R5C5", "R5C4", "R5C3"],
  ["R9C4", "R8C5", "R9C6"],
  ["R2C4", "R1C5", "R2C6"],
];

// Green German-whisper lines, transcribed from the drawn line geometry.
// Drawn as two strokes -- a 12-cell path plus a 2-cell segment (R3C4-R4C3)
// that closes the visual loop between the path's two endpoints. Whisper only
// binds consecutive cells within each list, so encoding both strokes as
// written covers every adjacent pair on the loop, including the join.
const whisperLines = [
  [
    "R3C4", "R3C5", "R3C6", "R4C7", "R5C7", "R6C7",
    "R7C6", "R7C5", "R7C4", "R6C3", "R5C3", "R4C3",
  ],
  ["R3C4", "R4C3"],
];

return [
  new Shape("9x9"),
  ...cages.map(cells => new Cage(cells[cells.length - 1], ...cells.slice(0, -1))),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
];
