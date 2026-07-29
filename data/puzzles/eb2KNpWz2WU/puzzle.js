// Title: Putting Green
// Author: Brinel
// Video: https://www.youtube.com/watch?v=eb2KNpWz2WU
// Source: https://sudokupad.app/97xewlvvf5

// Normal Sudoku rules apply. The purple line is a renban; the green branches
// are whisper lines with difference 5. The blue box-border segments have equal
// sums. The white dot is consecutive, R6C6 is odd, and the labelled circle
// contains both displayed digits.
const greenWhispers = [
  // Green drawing, transcribed from its eight coloured stroke paths.
  new Whisper(5, 'R5C5', 'R5C4', 'R5C3', 'R6C2', 'R7C2', 'R8C3', 'R9C4',
      'R9C5', 'R8C6', 'R8C7', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C7',
      'R3C6', 'R3C5', 'R4C4', 'R5C3'),
  new Whisper(5, 'R6C2', 'R6C3', 'R6C4', 'R6C5'),
  new Whisper(5, 'R7C2', 'R7C3'),
  new Whisper(5, 'R8C6', 'R8C5', 'R8C4'),
  new Whisper(5, 'R7C8', 'R7C7', 'R7C6', 'R7C5'),
  new Whisper(5, 'R6C8', 'R6C7'),
  new Whisper(5, 'R5C8', 'R5C7'),
  new Whisper(5, 'R4C8', 'R4C7'),
];

return [
  new Shape('9x9'),
  // Purple line: the returned endpoint is a drawing closure, not a second cell.
  new Renban('R6C6', 'R5C6', 'R4C6', 'R3C6', 'R2C6', 'R2C7', 'R1C7', 'R1C6'),
  ...greenWhispers,
  // Blue cells grouped by the three connected portions separated by box borders.
  new EqualSum(
      ['R5C1', 'R5C2', 'R4C3'],
      ['R3C4', 'R2C4'],
      ['R2C1', 'R2C2', 'R2C3', 'R3C2']),
  new WhiteDot('R6C4', 'R7C4'),
  new Given('R6C6', 1, 3, 5, 7, 9),
  new Quad('R1C6', 1, 8),
];
