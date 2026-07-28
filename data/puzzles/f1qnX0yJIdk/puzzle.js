// Title: Mexican Standoff
// Author: Mile Lemaic
// Video: https://www.youtube.com/watch?v=f1qnX0yJIdk
// Source: https://sudokupad.app/ays2k7hm6t

// Normal Sudoku, anti-knight, the three arrows, and the three thermometers.
// Every drawn arrow branch sums to its shared circle; paths are transcribed
// from the drawn lines.
return [
  new Shape('9x9'),
  new AntiKnight(),
  new Arrow('R1C7', 'R2C6', 'R3C5'),
  new Arrow('R1C7', 'R1C8', 'R2C9'),
  new Arrow('R3C4', 'R4C5', 'R5C6'),
  new Arrow('R3C4', 'R2C4', 'R1C4'),
  new Arrow('R7C4', 'R8C5', 'R9C5'),
  new Thermo('R6C5', 'R6C6', 'R5C7', 'R4C8'),
  new Thermo('R5C9', 'R4C9', 'R3C8', 'R2C7'),
  new Thermo('R9C7', 'R8C8'),
];
