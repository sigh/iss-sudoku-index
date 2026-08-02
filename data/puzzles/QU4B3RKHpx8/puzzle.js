// Title: Funhouse
// Author: zetamath
// Video: https://www.youtube.com/watch?v=QU4B3RKHpx8
// Source: https://app.crackingthecryptic.com/sudoku/MB4PFfrnn3

// Normal Sudoku rules apply. Green lines are German whispers (adjacent digits
// differ by at least 5). Each grey line is partitioned into consecutive groups
// that sum to 10; the R5C3-to-R9C1 stroke is one line despite its two payload entries.
return [
  new Shape('9x9'),
  new SumLine(10, 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new SumLine(10, 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R3C7', 'R3C6'),
  new SumLine(10, 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R6C2'),
  new SumLine(10, 'R5C3', 'R6C3', 'R7C3', 'R7C2', 'R8C2', 'R9C1'),
  new SumLine(10, 'R8C3', 'R8C4', 'R9C5'),
  new SumLine(10, 'R6C5', 'R7C4', 'R8C5'),
  new Whisper(5, 'R1C4', 'R1C3', 'R1C2', 'R1C1'),
  new Whisper(5, 'R2C4', 'R2C3', 'R2C2', 'R3C2', 'R3C3', 'R3C4'),
  new Whisper(5, 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R6C8'),
  new Whisper(5, 'R5C7', 'R6C7', 'R7C7', 'R7C8', 'R8C8', 'R9C9'),
  new Whisper(5, 'R8C7', 'R8C6', 'R9C5'),
  new Whisper(5, 'R6C5', 'R7C6', 'R8C5'),
];
