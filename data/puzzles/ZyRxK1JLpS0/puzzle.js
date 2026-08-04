// Title: VanDerWaal
// Author: Logan Wall
// Video: https://www.youtube.com/watch?v=ZyRxK1JLpS0
// Source: https://app.crackingthecryptic.com/sudoku/39GDNpTT9J

// Standard 6x6 sudoku (rows, columns, 2x3 boxes) plus one given. Six purple
// lines are renban: each line's cells must contain a set of consecutive,
// non-repeating digits (source rules text names them "renban" explicitly).
// Line cell lists are transcribed from the drawn line paths.

const renbanLines = [
  ['R2C4', 'R2C3', 'R3C3', 'R3C2'],
  ['R2C2', 'R2C1', 'R1C1'],
  ['R5C2', 'R4C3', 'R3C4', 'R2C5'],
  ['R1C5', 'R1C6', 'R2C6'],
  ['R4C5', 'R4C4', 'R5C4', 'R5C3'],
  ['R6C5', 'R6C6', 'R5C6'],
];

return [
  new Shape('6x6'),
  new Given('R6C1', 6),
  ...renbanLines.map((cells) => new Renban(...cells)),
];
