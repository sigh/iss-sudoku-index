// Title: 10/25/22: First Seen Odd/Even
// Author: GAS Who?
// Video: https://www.youtube.com/watch?v=q9emJvhqMxk
// Source: https://tinyurl.com/mrb57c2t

// Normal 6x6 Sudoku rules apply. Each outside clue gives the first digit of
// its parity encountered from that side. Regex prefixes therefore contain only
// digits of the opposite parity before the clued digit.
return [
  new Shape('6x6'),
  new Given('R2C3', 3),
  new Given('R3C4', 4),
  new Given('R4C3', 6),
  new Given('R5C4', 5),

  // Outside-clue values and directions transcribed from the eight labels.
  new Regex('[135]*1[1-6]*', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6'),
  new Regex('[135]*2[1-6]*', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1'),
  new Regex('[246]*4[1-6]*', 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6'),
  new Regex('[246]*3[1-6]*', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1'),
  new Regex('[135]*2[1-6]*', 'R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3'),
  new Regex('[246]*5[1-6]*', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2'),
  new Regex('[246]*5[1-6]*', 'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5'),
  new Regex('[135]*2[1-6]*', 'R6C4', 'R5C4', 'R4C4', 'R3C4', 'R2C4', 'R1C4'),
];
