// Title: July 3, 2022: Liar Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=glCWGqNR2U0
// Source: https://tinyurl.com/3ftnaw64
//
// Normal sudoku rules apply. Each of the 31 marked cells carries a "liar"
// clue value that is exactly 1 away from the true digit in that cell (the
// clue value itself never appears there): "if a cage is marked with a 2, it
// must contain either a 1 or a 3. If a cage is marked with a 9, it must
// contain an 8." No digits are given outright.
//
// Each clue is a candidate restriction (never a sum, despite the payload
// calling it a single-cell "cage"), so it is encoded as a multi-value
// Given over {clue-1, clue+1}, clamped to the 1-9 range per the rule's own
// worked example for a clue of 9.

// Cell, printed clue value, transcribed from the puzzle's clue cells.
const clues = [
  ["R3C1", 2], ["R4C1", 2], ["R1C3", 2], ["R1C4", 2],
  ["R1C6", 3], ["R1C7", 3], ["R3C9", 3], ["R4C9", 3],
  ["R3C3", 4], ["R3C4", 4], ["R3C6", 5], ["R3C7", 5],
  ["R4C5", 8], ["R5C5", 8], ["R2C5", 7],
  ["R4C2", 6], ["R4C8", 6], ["R6C4", 7], ["R6C6", 7],
  ["R5C7", 3], ["R5C3", 3], ["R6C2", 4], ["R7C2", 4],
  ["R6C8", 8], ["R7C8", 2], ["R8C4", 5], ["R8C6", 5],
  ["R9C6", 6], ["R9C4", 6], ["R9C3", 7], ["R9C7", 8],
];

return [
  new Shape("9x9"),
  ...clues.map(([cell, value]) => {
    const candidates = [value - 1, value + 1].filter(v => v >= 1 && v <= 9);
    return new Given(cell, ...candidates);
  }),
];
