// Title: Swimming in the Reeds
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=jALfyLdDv4Q
// Source: https://sudokupad.app/slyjfc5x9r

// Normal Sudoku rules apply. Green lines are whispers; each blue line has an
// equal digit sum in every 3x3 box segment it visits. The two drawn dots are
// respectively black (1:2 ratio) and white (consecutive); dots are not negative.
// Green and blue line coordinates, and dot edges, are transcribed from the drawn data.
return [
  new Shape('9x9'),
  new Whisper(5, 'R7C2', 'R8C3', 'R9C2'),
  new Whisper(5, 'R7C8', 'R8C7', 'R9C8'),
  new Whisper(5, 'R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Whisper(5, 'R1C1', 'R2C1', 'R3C1', 'R4C1'),
  new Whisper(5, 'R3C3', 'R4C4', 'R4C5', 'R3C6', 'R2C7'),
  new Whisper(5, 'R5C4', 'R6C3', 'R7C4', 'R7C5', 'R6C6', 'R5C7'),
  new RegionSumLine('R3C3', 'R2C4', 'R2C5', 'R3C6', 'R4C7', 'R3C7', 'R2C7'),
  new RegionSumLine('R5C4', 'R5C5', 'R6C6', 'R7C7', 'R6C7', 'R5C7'),
  new BlackDot('R3C3', 'R3C4'),
  new WhiteDot('R6C3', 'R6C4'),
];
