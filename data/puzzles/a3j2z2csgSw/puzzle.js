// Title: Foggy Killer
// Author: Visumation
// Video: https://www.youtube.com/watch?v=a3j2z2csgSw
// Source: https://sudokupad.app/5idku2te8l

// Normal sudoku (regions are the standard 3x3 boxes, matching the drawn
// regions). Ten killer cages, each all-different and summing to its clue.
// Kropki dots between orthogonally adjacent cells: white = consecutive,
// black = 1:2 ratio; unmarked adjacent pairs carry no claim either way.
// Fog is a solving-progress display only (rules text: "the fog will clear
// from surrounding cells when a digit is placed correctly") -- it constrains
// nothing about the finished grid and is not encoded.

const cages = [
  new Cage(45, 'R1C3', 'R2C1', 'R2C3', 'R3C1', 'R3C3', 'R3C4', 'R4C1', 'R4C2', 'R4C3'),
  new Cage(18, 'R1C2', 'R2C2', 'R3C2'),
  new Cage(8, 'R7C3', 'R8C3', 'R9C3'),
  new Cage(8, 'R4C7', 'R4C8', 'R4C9'),
  new Cage(8, 'R8C9', 'R9C8', 'R9C9'),
  new Cage(16, 'R5C8', 'R6C8', 'R7C8', 'R8C8'),
  new Cage(15, 'R8C4', 'R9C4'),
  new Cage(15, 'R8C7', 'R9C7'),
  new Cage(10, 'R5C3', 'R6C3'),
  new Cage(45, 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R7C5'),
];

const blackDots = [
  new BlackDot('R3C2', 'R4C2'),
  new BlackDot('R7C5', 'R7C6'),
];

const whiteDots = [
  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R2C7', 'R3C7'),
  new WhiteDot('R3C4', 'R3C5'),
  new WhiteDot('R4C8', 'R4C9'),
  new WhiteDot('R6C6', 'R7C6'),
  new WhiteDot('R7C3', 'R8C3'),
  new WhiteDot('R7C6', 'R8C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...blackDots,
  ...whiteDots,
];
