// Title: Snake Farm
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=j_eLeCIF6Bk
// Source: https://app.crackingthecryptic.com/ot5h01fnjr

// Normal 9x9 sudoku. The six explicit Kropki dots are encoded. The
// solver-discovered nine-snake partition, including its blue thermosnake, is
// omitted from this partial encoding.
return [
  new Shape('9x9'),
  new WhiteDot('R9C7', 'R9C6'),
  new WhiteDot('R5C2', 'R6C2'),
  new WhiteDot('R1C1', 'R2C1'),
  new WhiteDot('R4C2', 'R5C2'),
  new BlackDot('R3C9', 'R4C9'),
  new BlackDot('R3C5', 'R3C6'),
];
