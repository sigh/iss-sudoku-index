// Title: Working around the Clock
// Author: Delfuego
// Video: https://www.youtube.com/watch?v=vdBxO3dnpBU
// Source: https://sudokupad.app/44iwy0wv6n

// Standard sudoku rules apply (default rows/columns/boxes).
// White dot: the two digits are consecutive (WhiteDot). Black dot: one digit
// is double the other (BlackDot). Only the drawn dots are clues -- the rules
// state that not every dot is given, so the absence of a dot between a pair
// carries no information and StrictKropki's negative reading is not applied.
// The purple line is a renban line: a set of consecutive digits in any order.

return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C5', 2),
  new Given('R1C9', 5),
  new Given('R4C1', 8),
  new Given('R5C5', 8),
  new Given('R6C9', 8),
  new Given('R8C2', 2),
  new Given('R8C6', 5),
  new Given('R8C7', 9),

  // White dots, as drawn on the board.
  new WhiteDot('R8C6', 'R9C6'),
  new WhiteDot('R8C4', 'R9C4'),
  new WhiteDot('R2C7', 'R2C8'),
  new WhiteDot('R8C2', 'R8C3'),
  new WhiteDot('R6C8', 'R6C9'),
  new WhiteDot('R4C8', 'R4C9'),
  new WhiteDot('R6C1', 'R6C2'),
  new WhiteDot('R4C1', 'R4C2'),
  new WhiteDot('R1C4', 'R2C4'),
  new WhiteDot('R1C6', 'R2C6'),
  new WhiteDot('R7C8', 'R8C8'),
  new WhiteDot('R2C2', 'R3C2'),
  new WhiteDot('R2C2', 'R2C3'),
  new WhiteDot('R2C8', 'R3C8'),
  new WhiteDot('R8C7', 'R8C8'),
  new WhiteDot('R7C2', 'R8C2'),

  // Black dots, as drawn on the board.
  new BlackDot('R1C5', 'R2C5'),
  new BlackDot('R5C8', 'R5C9'),
  new BlackDot('R8C5', 'R9C5'),
  new BlackDot('R5C1', 'R5C2'),

  // Purple renban line, as drawn on the board.
  new Renban('R3C5', 'R4C5', 'R5C5', 'R6C6', 'R7C7'),
];
