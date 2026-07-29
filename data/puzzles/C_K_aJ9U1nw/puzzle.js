// Title: Zeven
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=C_K_aJ9U1nw
// Source: https://app.crackingthecryptic.com/v8o7if3s6e

// Normal Sudoku rules apply. Orange lines are whispers with adjacent digits
// differing by at least four. Each listed outlined cage has total 7 with no
// repeated digit. The first orange line is the drawn perimeter loop: its two
// source strokes meet at R1C1 and R2C1, so R1C1 is repeated to encode its
// closing edge. Cage cell lists are transcribed from the drawn cage data.
return [
  new Shape('9x9'),
  new Whisper(4,
    'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
    'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8',
    'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1',
    'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1'),
  new Whisper(4,
    'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C7', 'R5C6',
    'R6C5', 'R7C4', 'R8C3'),
  new Cage(7, 'R1C8', 'R2C8', 'R2C9'),
  new Cage(7, 'R9C1', 'R9C2'),
  new Cage(7, 'R3C2', 'R4C1', 'R4C2'),
  new Cage(7, 'R5C3', 'R5C4', 'R5C5'),
  new Cage(7, 'R6C6', 'R6C7', 'R7C6'),
];
