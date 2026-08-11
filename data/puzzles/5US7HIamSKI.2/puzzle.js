// Title: 8/4/22: Diagon Dillydally
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=5US7HIamSKI
// Source: https://tinyurl.com/4sn5a7ac

// Rules encoded:
//  - Normal sudoku (rows/cols/boxes, default).
//  - Diagonal: digits do not repeat along either marked main diagonal
//    (payload "diagonal+" and "diagonal-", both set).

return [
  new Shape('9x9'),

  new Given('R2C6', 1), new Given('R2C7', 8),
  new Given('R3C5', 2), new Given('R3C8', 1),
  new Given('R4C5', 1), new Given('R4C8', 5),
  new Given('R5C4', 2), new Given('R5C6', 3), new Given('R5C7', 4),
  new Given('R6C2', 5), new Given('R6C3', 4), new Given('R6C5', 9),
  new Given('R7C1', 6), new Given('R7C4', 5), new Given('R7C8', 3), new Given('R7C9', 4),
  new Given('R8C1', 5), new Given('R8C4', 7), new Given('R8C7', 6), new Given('R8C9', 1),
  new Given('R9C2', 8), new Given('R9C3', 7), new Given('R9C7', 5), new Given('R9C8', 2),

  // diagonal+ (payload) is the '/' diagonal, R9C1-R1C9.
  new Diagonal(1),
  // diagonal- (payload) is the '\' diagonal, R1C1-R9C9.
  new Diagonal(-1),
];
