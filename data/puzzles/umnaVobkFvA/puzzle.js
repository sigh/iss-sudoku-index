// Title: Hang in the Balance
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=umnaVobkFvA
// Source: https://sudokupad.app/0mapot84dm

// Rules:
// - Normal sudoku rules apply.
// - Digits on an arrow sum to the digit in the circle of that arrow.
// - Each purple line contains a set of consecutive digits in any order (Renban).
// - Adjacent digits along a green line differ by at least five (Whisper 5).
// - Black dot: digits in a 1:2 ratio. White dot: digits are consecutive.
//   Not all possible dots are given, so no negative constraint applies.

// Arrows, from the drawn arrows (circle first). The centre circle carries two arrows.
const arrows = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C9', 'R1C8', 'R1C7'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R9C9', 'R8C9', 'R7C9'],
  ['R5C5', 'R5C6', 'R5C7'],
  ['R5C5', 'R5C4', 'R5C3'],
].map((cells) => new Arrow(...cells));

// Purple lines, from the drawn line paths.
const renbans = [
  ['R3C3', 'R2C4', 'R2C5', 'R2C6', 'R3C7'],
  ['R7C3', 'R8C4', 'R8C5', 'R8C6', 'R7C7'],
  ['R6C1', 'R7C2'],
].map((cells) => new Renban(...cells));

// Green lines, from the drawn line paths.
const whispers = [
  ['R4C3', 'R3C4', 'R3C5', 'R3C6', 'R4C7'],
  ['R6C3', 'R7C4', 'R7C5', 'R7C6', 'R6C7'],
  ['R6C9', 'R7C8'],
  ['R4C1', 'R5C2'],
  ['R4C9', 'R5C8'],
].map((cells) => new Whisper(5, ...cells));

// Dots, from the drawn edge marks.
const blackDots = [
  ['R1C7', 'R1C8'],
  ['R7C9', 'R8C9'],
  ['R8C5', 'R9C5'],
  ['R7C1', 'R8C1'],
].map((cells) => new BlackDot(...cells));
const whiteDots = [
  ['R1C2', 'R1C3'],
  ['R6C2', 'R7C2'],
  ['R6C8', 'R7C8'],
].map((cells) => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...arrows,
  ...renbans,
  ...whispers,
  ...blackDots,
  ...whiteDots,
];
