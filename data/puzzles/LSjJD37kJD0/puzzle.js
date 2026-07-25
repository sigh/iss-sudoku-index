// Title: Arrow Of Arrows
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=LSjJD37kJD0
// Source: https://sudokupad.app/2ceyxwgi0w

// Normal sudoku rules apply. Digits along an arrow sum to the digit in that
// arrow's circle. The nine circle cells trace an arrow/chevron shape (the
// puzzle's title), which is a visual arrangement only and adds no rule.

const givens = [
  ['R1C8', 7],
  ['R5C2', 3],
  ['R7C4', 9],
  ['R9C9', 8],
].map(([cell, value]) => new Given(cell, value));

// Each entry starts with its circled bulb, followed by the arrow arm.
// Transcribed from the arrow waypoints in the source payload; R3C5 is the
// shared arm cell between the R1C5- and R5C5-circled arrows.
const arrows = [
  ['R4C2', 'R5C2', 'R6C2', 'R7C2'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3'],
  ['R2C4', 'R3C4', 'R4C4', 'R5C4'],
  ['R1C5', 'R2C5', 'R3C5'],
  ['R2C6', 'R3C6', 'R4C6', 'R5C6'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C8'],
  ['R5C5', 'R4C5', 'R3C5'],
  ['R9C5', 'R8C5', 'R7C5', 'R6C5'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...arrows,
];
