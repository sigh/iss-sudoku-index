// Title: Incomplete Squares
// Author: gdc
// Video: https://www.youtube.com/watch?v=-tuEhXyXV8s
// Source: https://app.crackingthecryptic.com/sudoku/7ugarx7gji

// Normal Sudoku rules apply. Each listed lavender Zipper Line has symmetric
// pairs summing to its middle digit; the paths are transcribed from the lines.
return [
  new Shape('9x9'),
  new Zipper('R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3'),
  new Zipper('R8C2', 'R7C3', 'R6C4', 'R7C5', 'R8C6'),
  new Zipper('R8C5', 'R9C5', 'R9C6', 'R9C7', 'R8C7', 'R7C7', 'R7C6'),
  new Zipper('R1C8', 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9'),
  new Zipper('R3C5', 'R3C4', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C6'),
  new Zipper('R2C5', 'R3C6', 'R4C5'),
  new Zipper('R4C8', 'R4C7', 'R5C7', 'R6C7', 'R6C8', 'R6C9', 'R5C9'),
  new Zipper('R5C1', 'R5C2', 'R5C3'),
];
