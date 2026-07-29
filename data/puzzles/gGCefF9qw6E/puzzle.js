// Title: Diagonal Snakes
// Author: MonkeyApprentice
// Video: https://www.youtube.com/watch?v=gGCefF9qw6E
// Source: https://app.crackingthecryptic.com/QFgMQf2NpF

// Normal Sudoku and the negative diagonal are used. Grey circles are odd.
// White dots are consecutive, the black dot is a 2:1 ratio, X clues sum to 10,
// and V clues sum to 5. The two unknown snakes are not represented here.
return [
  new Shape('9x9'),
  new Given('R1C7', 7),
  new Given('R2C4', 5),
  new Given('R3C5', 7),
  new Given('R4C6', 2),
  new Given('R9C1', 7),
  new Diagonal(-1),

  // The three drawn grey circles are odd.
  new Given('R1C2', 1, 3, 5, 7, 9),
  new Given('R3C8', 1, 3, 5, 7, 9),
  new Given('R9C8', 1, 3, 5, 7, 9),

  // Drawn dominoes.
  new WhiteDot('R3C1', 'R4C1'),
  new WhiteDot('R7C9', 'R8C9'),
  new WhiteDot('R2C2', 'R2C3'),
  new WhiteDot('R6C6', 'R6C7'),
  new WhiteDot('R3C4', 'R4C4'),
  new BlackDot('R4C3', 'R5C3'),
  new X('R9C8', 'R9C9'),
  new X('R7C7', 'R8C7'),
  new V('R4C2', 'R4C3'),
  new V('R6C4', 'R7C4'),
];
