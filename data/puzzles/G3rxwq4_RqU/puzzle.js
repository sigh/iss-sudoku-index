// Title: Con-Set-Cutive
// Author: Teal
// Video: https://www.youtube.com/watch?v=G3rxwq4_RqU
// Source: https://app.crackingthecryptic.com/LFB3qhjfNB

// Use six unknown digits from 1-9 consistently in every row, column, and box.
// Green lines are whispers, purple lines are consecutive non-repeating sets, and
// the blue line has equal sums in each box segment. Cage totals allow repeats.
// Line and cage coordinates are transcribed from the drawn SudokuPad data.
return [
  new Shape('6x6', 9),
  new RegionSameValues(),

  new Whisper(5, 'R4C3', 'R4C4', 'R4C5'),
  new Whisper(5, 'R2C4', 'R2C5'),

  new Renban('R6C4', 'R5C4', 'R4C4', 'R3C4'),
  new Renban('R4C1', 'R5C1'),
  new Renban('R2C1', 'R2C2'),

  new RegionSumLine('R6C1', 'R6C2', 'R6C3', 'R6C4'),

  new Sum(8, 'R3C1', 'R4C1'),
  new Sum(10, 'R1C2', 'R2C2'),
];
