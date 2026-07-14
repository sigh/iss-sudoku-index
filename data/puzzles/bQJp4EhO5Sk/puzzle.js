// Title: Bullseye!
// Author: Lorena
// Video: https://www.youtube.com/watch?v=bQJp4EhO5Sk
// Source: https://sudokupad.app/rrhrws2x7f

// Sudoku with digits 0-9: no repeats in any row, column, or marked 3x3 box
// (the standard boxes). White dots join consecutive digits; black dots join
// digits in a 2:1 ratio. Grey palindrome lines read the same in both
// directions; adjacent digits on green whisper lines differ by at least 5.
// The fog/digit-reveal mechanic is a solve-path rule and is not encoded;
// digit 2 never becomes available, so cells are restricted to 0, 1, 3-9.

const givens = {
  R1C3: 0, R1C5: 1, R1C8: 4,
  R2C5: 7, R2C6: 0, R2C8: 5,
  R3C9: 0,
  R4C8: 0,
  R5C3: 8, R5C7: 3, R5C8: 9,
  R6C2: 0, R6C9: 6,
  R7C1: 0,
  R8C4: 0,
  R9C7: 0,
};

const boxes = [
  ["R1C1", "R1C2", "R1C3", "R2C1", "R2C2", "R2C3", "R3C1", "R3C2", "R3C3"],
  ["R1C4", "R1C5", "R1C6", "R2C4", "R2C5", "R2C6", "R3C4", "R3C5", "R3C6"],
  ["R1C7", "R1C8", "R1C9", "R2C7", "R2C8", "R2C9", "R3C7", "R3C8", "R3C9"],
  ["R4C1", "R4C2", "R4C3", "R5C1", "R5C2", "R5C3", "R6C1", "R6C2", "R6C3"],
  ["R4C4", "R4C5", "R4C6", "R5C4", "R5C5", "R5C6", "R6C4", "R6C5", "R6C6"],
  ["R4C7", "R4C8", "R4C9", "R5C7", "R5C8", "R5C9", "R6C7", "R6C8", "R6C9"],
  ["R7C1", "R7C2", "R7C3", "R8C1", "R8C2", "R8C3", "R9C1", "R9C2", "R9C3"],
  ["R7C4", "R7C5", "R7C6", "R8C4", "R8C5", "R8C6", "R9C4", "R9C5", "R9C6"],
  ["R7C7", "R7C8", "R7C9", "R8C7", "R8C8", "R8C9", "R9C7", "R9C8", "R9C9"],
];

const whispers = [
  ["R5C3", "R4C3", "R3C4", "R3C5"],
  ["R7C5", "R7C6", "R6C7", "R5C7"],
  ["R5C2", "R6C2", "R7C3", "R8C4", "R8C5"],
  ["R2C5", "R2C6", "R3C7", "R4C8", "R5C8"],
  ["R4C1", "R3C1", "R2C2", "R1C3", "R1C4"],
  ["R3C9", "R4C9"],
  ["R7C1", "R8C2"],
  ["R9C3", "R9C4"],
  ["R6C9", "R7C9", "R8C8", "R9C7"],
];

const palindromes = [
  ["R5C3", "R6C3", "R7C4", "R7C5"],
  ["R3C5", "R3C6", "R4C7", "R5C7"],
  ["R5C8", "R6C8", "R7C7", "R8C6", "R8C5"],
  ["R4C2", "R3C3", "R2C4"],
  ["R1C6", "R1C7", "R2C8"],
];

const whiteDots = [
  ["R5C4", "R5C5"],
  ["R6C7", "R7C7"],
  ["R1C6", "R1C7"],
  ["R3C2", "R4C2"],
];

const blackDots = [
  ["R8C9", "R9C9"],
];

const graph = cellGraph("9x9");
const cells = graph.cells();
const availableDigits = [0, 1, 3, 4, 5, 6, 7, 8, 9];

// Every cell is restricted to the same available-digit set, so Replicate
// stamps the template instead of hand-rolling each identical copy.
const availableOrigin = cells[0];
const availableTemplate = [new Given(availableOrigin, ...availableDigits)];

return [
  new Shape("9x9", "0-9"),
  graph.makeReplicate(availableTemplate),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
  ...boxes.map(cells => new Jigsaw("9x9~0-9", ...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...palindromes.map(cells => new Palindrome(...cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
