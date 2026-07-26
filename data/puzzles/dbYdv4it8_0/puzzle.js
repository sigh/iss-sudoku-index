// Title: Killer dots of the Knight
// Author: Chip Sounder
// Video: https://www.youtube.com/watch?v=dbYdv4it8_0
// Source: https://sudokupad.app/HB7MTHjGmM

// Standard 6x6 sudoku (rows/cols/2x3 boxes) plus anti-knight, two outside
// diagonal-sum clues (repeats allowed along the diagonal), two killer cages
// (no repeats, given sum), and a Kropki dot pair: a black-filled dot (the
// rules text states its 1:2 ratio) and a white-filled dot of the same
// edge-mark shape. The rules text is silent on the white dot specifically,
// so it takes the standard Kropki reading -- consecutive digits.

const graph = cellGraph('6x6');
const geometry = cellGeometry('6x6');

return [
  new Shape('6x6'),

  new AntiKnight(),

  // Diagonal-sum arrows: "9" enters above R1C4 running down-right through
  // R2C5, R3C6; "10" enters beside R3C6 running down-left through R4C5,
  // R5C4, R6C3.
  LittleKiller.fromCells(9, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R3C6', 1, -1), geometry),

  // Dotted (dashed-border) killer cages: R3C2/R3C3 and R5C3/R5C4, no-repeat
  // + given total.
  new Cage(6, 'R3C2', 'R3C3'),
  new Cage(6, 'R5C3', 'R5C4'),

  // Black dot: 1:2 ratio between R2C5 and R2C6.
  new BlackDot('R2C5', 'R2C6'),
  // White dot: standard Kropki reading, consecutive digits.
  new WhiteDot('R6C5', 'R6C6'),
];
