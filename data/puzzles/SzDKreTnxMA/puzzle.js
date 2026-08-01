// Title: I can resist everything but temptation
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=SzDKreTnxMA
// Source: https://sudokupad.app/hwks8iml0a

// Normal Sudoku, anti-knight, and the modulo-3 2x2 rule.
// The six black dots and the grey bulb/line are the drawn clues.
return [
  new Shape('9x9'),
  new AntiKnight(),
  new GlobalMod(),
  new BlackDot('R6C6', 'R7C6'),
  new BlackDot('R6C7', 'R7C7'),
  new BlackDot('R6C5', 'R7C5'),
  new BlackDot('R3C7', 'R4C7'),
  new BlackDot('R3C6', 'R4C6'),
  new BlackDot('R3C8', 'R4C8'),
  new Thermo('R9C3', 'R8C3', 'R8C2'),
];
