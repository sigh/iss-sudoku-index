// Title: Kid Leader
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=PL7GZMdSzzg
// Source: https://sudokupad.app/kccvhsp1ff

// Normal Sudoku rules apply. No givens; standard 3x3 boxes.
// Green lines: adjacent digits differ by at least 5 (Whisper).
// Pink lines: the whole line's digits form a consecutive, non-repeating set
// in any order (Renban). One pink line branches (a "T" junction); its rule
// applies across the union of the branch's cells.
// Gray lines: digits on the line sum to 10. Every gray line here has 2 or 3
// cells, so no shorter contiguous split can also sum to 10 (a 1-cell segment
// would need a digit of 10), so SumLine(10) reduces to "the whole line sums
// to 10" for each of them.

const whispers = [
  // Green line cells, transcribed from the drawn wayPoints.
  new Whisper('R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4'),
  new Whisper('R3C4', 'R3C5', 'R2C5', 'R1C5'),
  new Whisper('R4C5', 'R5C5'),
  new Whisper('R8C5', 'R9C5', 'R9C6'),
  new Whisper('R5C6', 'R6C5', 'R7C6'),
  new Whisper('R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'),
  new Whisper('R3C2', 'R3C3'),
  new Whisper('R7C8', 'R7C9'),
  new Whisper('R9C7', 'R9C8', 'R9C9'),
];

const renbans = [
  // Pink line cells, transcribed from the drawn wayPoints.
  new Renban('R5C3', 'R5C2', 'R5C1', 'R4C1', 'R3C1'),
  // Branching pink line: a straight run down column 9 (R5C9-R8C9) with a
  // side branch to R6C8 off its R6C9 cell. Renban applies pairwise across
  // all listed cells regardless of order, so the branch cell is simply
  // included in the same list.
  new Renban('R5C9', 'R6C9', 'R7C9', 'R8C9', 'R6C8'),
  new Renban('R9C6', 'R9C7'),
];

const sumLines = [
  // Gray line cells, transcribed from the drawn wayPoints.
  new SumLine(10, 'R5C6', 'R6C7', 'R7C6'),
  new SumLine(10, 'R3C5', 'R4C5'),
  new SumLine(10, 'R3C1', 'R3C2'),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...renbans,
  ...sumLines,
];
