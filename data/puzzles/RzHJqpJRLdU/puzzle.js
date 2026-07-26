// Title: Secret Crossing
// Author: Groktilian
// Video: https://www.youtube.com/watch?v=RzHJqpJRLdU
// Source: https://sudokupad.app/5ygwx6q939

// Normal sudoku rules apply. Standard 3x3 boxes (drawn explicitly in the
// payload, coinciding with the default boxes).
//
// Four blue "region sum" lines: RegionSumLine encodes each directly. RSL4 and
// one whisper line (WL3 below) both pass through R5C7 -- separate strokes of
// different colours that cross at a shared cell, encoded as two independent
// clues rather than merged.
//
// Five green "whisper lines": adjacent digits differ by at least 5, so
// Whisper(5, ...). WL4 and WL5 are closed loops (2x2 squares); the drawn path
// repeats the first cell at the end to cover the wrap-around edge.

return [
  new Shape('9x9'),

  new RegionSumLine('R5C2', 'R5C3', 'R6C4', 'R7C3', 'R8C3'),
  new RegionSumLine('R8C5', 'R7C5', 'R6C6', 'R7C7', 'R7C8'),
  new RegionSumLine('R3C2', 'R3C3', 'R4C4', 'R3C5', 'R2C5'),
  new RegionSumLine('R5C7', 'R4C6', 'R3C7', 'R2C7'),

  new Whisper(5, 'R8C4', 'R9C5', 'R8C6', 'R7C6'),
  new Whisper(5, 'R6C2', 'R5C1', 'R4C2', 'R4C3'),
  new Whisper(5, 'R5C7', 'R5C8', 'R5C9'),
  new Whisper(5, 'R8C8', 'R9C8', 'R9C9', 'R8C9', 'R8C8'),
  new Whisper(5, 'R1C1', 'R2C1', 'R2C2', 'R1C2', 'R1C1'),
];
