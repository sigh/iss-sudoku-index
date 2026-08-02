// Title: BETWEEEEEEEEN
// Author: Twototenth
// Video: https://www.youtube.com/watch?v=8gFTYxHEAls
// Source: https://app.crackingthecryptic.com/sudoku/bn8DQjnR7D

// Normal Sudoku rules apply. Grey lines are between lines, with the circled
// endpoint digits bounding all intervening digits. Each black 2x2-corner
// circle lists digits that occur within its four touching cells.
return [
  new Shape('9x9'),
  new Between('R3C4', 'R4C3', 'R5C3', 'R5C4', 'R6C5', 'R6C6', 'R7C6', 'R7C5', 'R7C4'),
  new Between('R6C7', 'R5C7', 'R4C7', 'R4C8', 'R5C8', 'R6C8'),
  new Between('R6C9', 'R7C9', 'R7C8', 'R7C7', 'R8C6', 'R8C5', 'R8C4', 'R7C3'),
  new Between('R2C4', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new Between('R9C8', 'R8C8', 'R8C9', 'R9C9'),
  new Between('R1C2', 'R1C3', 'R2C3', 'R3C3'),
  new Between('R8C2', 'R9C3', 'R9C4', 'R9C5'),
  // Black-circle digit lists transcribed from the six drawn 2x2 corner circles.
  new Quad('R4C5', 3, 5, 6),
  new Quad('R5C1', 4, 6, 8),
  new Quad('R2C5', 8),
  new Quad('R3C1', 3),
  new Quad('R2C7', 1, 6),
  new Quad('R2C6', 2),
];
