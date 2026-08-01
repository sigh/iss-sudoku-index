// Title: YNWA - Jurgen Klopp Tribute
// Author: Celery
// Video: https://www.youtube.com/watch?v=UUlkoYlSW4k
// Source: https://sudokupad.app/gjyydhf4pm

// Normal sudoku rules apply. The four grey 3x3 squares are additional
// all-different regions. Consecutive cells on each red YNWA stroke are German
// whispers (difference at least 5). A digit in a white circle counts white
// circles containing that digit.
return [
  new Shape('9x9'),

  // Four grey 3x3 squares drawn offset from the standard boxes.
  new AllDifferent('R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'),
  new AllDifferent('R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'),
  new AllDifferent('R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'),
  new AllDifferent('R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'),

  // Seven red rendered strokes from the source geometry.
  new Whisper(5, 'R1C4', 'R2C5', 'R1C6'),
  new Whisper(5, 'R2C5', 'R3C5'),
  new Whisper(5, 'R6C1', 'R5C1', 'R4C1', 'R5C2', 'R6C3', 'R5C3', 'R4C3'),
  new Whisper(5, 'R4C7', 'R5C7', 'R6C7'),
  new Whisper(5, 'R6C7', 'R5C8', 'R6C9', 'R5C9', 'R4C9'),
  new Whisper(5, 'R9C4', 'R8C4', 'R7C5', 'R8C6', 'R9C6'),
  new Whisper(5, 'R8C6', 'R8C5', 'R8C4'),

  // The 16 white football circles drawn in the source.
  new CountingCircles(
    'R1C1', 'R2C2', 'R1C8', 'R3C9', 'R4C4', 'R4C6', 'R7C3', 'R9C5',
    'R9C8', 'R8C7', 'R5C4', 'R2C9', 'R8C8', 'R3C3', 'R2C1', 'R7C1'
  ),
];
