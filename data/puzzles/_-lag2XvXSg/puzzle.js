// Title: Large Area Size of Small Area
// Author: Neofelis
// Video: https://www.youtube.com/watch?v=_-lag2XvXSg
// Source: https://app.crackingthecryptic.com/sudoku/PQ8GmnLdNH

// Normal Sudoku. The highlighted-area rule is omitted: the source does not make its scope recoverable.
// The listed sum cages, white dots, and black dots are transcribed from the drawn clues.
return [
  new Shape('9x9'),
  new Given('R9C7', 1),
  new Sum(18, 'R3C1', 'R3C2', 'R3C3'),
  new Sum(12, 'R1C7', 'R2C7'),
  new Sum(10, 'R6C9', 'R7C9'),
  new WhiteDot('R4C8', 'R4C9'),
  new WhiteDot('R7C9', 'R8C9'),
  new WhiteDot('R9C2', 'R9C3'),
  new WhiteDot('R9C1', 'R9C2'),
  new WhiteDot('R8C1', 'R9C1'),
  new WhiteDot('R5C4', 'R6C4'),
  new WhiteDot('R4C4', 'R5C4'),
  new WhiteDot('R4C4', 'R4C5'),
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R3C6', 'R4C6'),
  new BlackDot('R4C7', 'R4C8'),
  new BlackDot('R7C8', 'R7C9'),
  new BlackDot('R8C7', 'R8C8'),
  new BlackDot('R8C4', 'R9C4'),
];
