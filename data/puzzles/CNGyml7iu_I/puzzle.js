// Title: Green and Blue
// Author: Souradip Das
// Video: https://www.youtube.com/watch?v=CNGyml7iu_I
// Source: https://sudokupad.app/x1ssacf45h

// Classic sudoku. Box borders divide a blue line into segments which have the
// same sum (RegionSumLine). Neighbouring digits along a green line differ by at
// least 5 (Whisper).

return [
  new Shape('9x9'),

  // Blue lines: equal sum per box segment.
  new RegionSumLine('R6C1', 'R7C2', 'R8C3', 'R9C4'),
  new RegionSumLine('R3C4', 'R4C5', 'R5C6', 'R6C7'),
  new RegionSumLine('R2C1', 'R3C1', 'R4C1'),
  new RegionSumLine('R6C5', 'R7C5', 'R7C4'),

  // Green lines: adjacent digits differ by at least 5.
  new Whisper(5,
    'R3C4', 'R4C3', 'R5C2', 'R6C1', 'R7C1', 'R8C1', 'R9C1',
    'R9C2', 'R9C3', 'R9C4', 'R8C5', 'R7C6', 'R6C7'),
  new Whisper(5, 'R3C6', 'R4C7'),
  new Whisper(5,
    'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'),
  new Whisper(5,
    'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8'),
];
