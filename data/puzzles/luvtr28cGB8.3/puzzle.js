// Title: 6/14/22: Shout Thru the Heart
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=luvtr28cGB8
// Source: https://tinyurl.com/wbhca443

// Standard sudoku. Killer cages: digits cannot repeat and must sum to the
// given total (Cage bakes in both halves of that rule). Green lines: digits
// directly connected by the line must differ by at least 5 (Whisper,
// difference 5). The heart-shaped outline is drawn as two strokes in the
// payload -- an open 20-cell path and a 2-cell stroke closing it back to its
// start -- so it is encoded as two separate Whisper constraints; every other
// green stroke is a single connected pair, one Whisper each. Cage and line
// cell lists transcribed from the puzzle's drawn cages and green lines.
const cages = [
  new Cage(3, 'R3C3', 'R3C4'),
  new Cage(10, 'R2C2', 'R2C3'),
  new Cage(14, 'R3C1', 'R3C2'),
  new Cage(7, 'R3C6', 'R3C7'),
  new Cage(11, 'R2C7', 'R2C8'),
  new Cage(16, 'R3C8', 'R3C9'),
  new Cage(5, 'R4C1', 'R4C2'),
  new Cage(16, 'R5C1', 'R5C2'),
  new Cage(5, 'R4C8', 'R4C9'),
  new Cage(12, 'R5C8', 'R5C9'),
  new Cage(10, 'R6C7', 'R6C8'),
  new Cage(10, 'R7C6', 'R7C7'),
  new Cage(5, 'R6C2', 'R6C3'),
  new Cage(15, 'R7C3', 'R7C4'),
  new Cage(19, 'R8C4', 'R8C5', 'R8C6', 'R9C5'),
  new Cage(24, 'R4C4', 'R4C5', 'R4C6', 'R5C5'),
];

const whispers = [
  new Whisper(5,
    'R3C4', 'R2C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C2', 'R7C3',
    'R8C4', 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C9', 'R3C9',
    'R2C8', 'R2C7', 'R3C6', 'R4C5'),
  new Whisper(5, 'R3C4', 'R4C5'),
  new Whisper(5, 'R5C5', 'R4C4'),
  new Whisper(5, 'R3C3', 'R3C2'),
  new Whisper(5, 'R4C2', 'R5C2'),
  new Whisper(5, 'R6C3', 'R7C4'),
  new Whisper(5, 'R8C5', 'R7C6'),
  new Whisper(5, 'R6C7', 'R5C8'),
  new Whisper(5, 'R4C8', 'R3C8'),
  new Whisper(5, 'R3C7', 'R4C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
];
