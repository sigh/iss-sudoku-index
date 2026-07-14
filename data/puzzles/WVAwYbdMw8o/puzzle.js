// Title: 7 Greens 7 Cages
// Author: PuzzleTank
// Video: https://www.youtube.com/watch?v=WVAwYbdMw8o
// Source: https://sudokupad.app/at4s2p5e5e

// German Whisper (green) lines: adjacent cells differ by at least 5.
// Whisper() defaults to a difference of 5 when the first argument is a
// cell rather than a number.
//
// The payload draws 11 separate paths; several share an endpoint cell and
// are one continuous drawn line with a branch point (matching the title's
// "7 Greens"). Encoding each drawn segment directly reproduces every
// adjacent-pair constraint regardless of how the segments are grouped.
const whispers = [
  new Whisper('R8C2', 'R9C2'),
  new Whisper('R6C3', 'R7C3', 'R6C4', 'R5C3'),
  new Whisper('R7C5', 'R6C4'),
  new Whisper('R6C8', 'R6C9', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R8C6'),
  new Whisper('R2C1', 'R3C1', 'R4C1'),
  new Whisper('R2C3', 'R3C3'),
  new Whisper('R2C2', 'R3C3'),
  new Whisper('R2C4', 'R3C3'),
  new Whisper('R4C5', 'R5C6', 'R4C7'),
  new Whisper('R3C5', 'R4C6'),
  new Whisper('R3C4', 'R3C5'),
];

// Killer cages: no repeats within a cage, sum to the total when given.
// One cage (R8C3/R8C4/R9C4) has no total drawn, per the ruleset's
// "if given" qualifier -- a no-total cage is just AllDifferent.
const cages = [
  new Cage(20, 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'),
  new Cage(24, 'R5C3', 'R6C3', 'R6C4', 'R7C3', 'R7C4', 'R7C5'),
  new Cage(35, 'R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R4C2'),
  new AllDifferent('R8C3', 'R8C4', 'R9C4'),
  new Cage(22, 'R6C8', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'),
  new Cage(18, 'R1C7', 'R2C7', 'R2C8'),
  new Cage(12, 'R2C5', 'R3C5', 'R4C5'),
];

return [
  new Shape('9x9'),

  ...whispers,
  ...cages,
];
