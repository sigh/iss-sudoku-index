// Title: Clockwork
// Author: shamShaman
// Video: https://www.youtube.com/watch?v=J_3SltyIJ1I
// Source: https://app.crackingthecryptic.com/QbPRdNNRMH

// Standard 9x9 Sudoku, with the listed givens. Each circled digit counts its
// occurrences among all 23 circles.
return [
  new Shape('9x9'),
  new Given('R1C5', 1),
  new Given('R2C2', 8),
  new Given('R2C8', 2),
  new Given('R5C1', 7),
  new Given('R5C9', 3),
  new Given('R6C5', 9),
  new Given('R7C3', 8),
  new Given('R7C7', 2),
  new Given('R8C2', 6),
  new Given('R8C6', 1),
  new Given('R8C8', 4),
  new Given('R9C5', 5),
  // Circled cells transcribed from the drawn circle overlays.
  new CountingCircles(
    'R1C1', 'R1C5', 'R1C9', 'R2C3', 'R2C7', 'R3C2', 'R3C8',
    'R4C4', 'R4C6', 'R4C7', 'R5C1', 'R5C2', 'R5C8', 'R6C3',
    'R6C4', 'R6C6', 'R7C2', 'R7C8', 'R8C3', 'R8C7', 'R9C1',
    'R9C5', 'R9C9'),
];
