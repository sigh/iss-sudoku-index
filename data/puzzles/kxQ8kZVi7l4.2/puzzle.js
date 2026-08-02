// Title: Search Nine Sudoku
// Author: Menderbug
// Video: https://www.youtube.com/watch?v=kxQ8kZVi7l4
// Source: https://tinyurl.com/y8z9a7nu

// Normal Sudoku. Each arrow cell gives the distance in its arrow direction to a 9.
// The fixed auxiliary value represents the digit sought by every arrow.
return [
  new Shape('9x9'),
  new Given('R1C1', 2), new Given('R1C9', 3),
  new Given('R3C3', 3), new Given('R3C5', 8), new Given('R3C7', 6),
  new Given('R5C3', 5), new Given('R5C7', 2),
  new Given('R7C3', 1), new Given('R7C5', 4), new Given('R7C7', 7),
  new Given('R9C1', 5), new Given('R9C9', 4),

  new Var('N', 'fixed nine', 1),
  new Given('VN', 9),

  // Drawn arrow cells and their in-grid rays, transcribed from the source payload.
  new ValueIndexing('VN', 'R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5'),
  new ValueIndexing('VN', 'R7C6', 'R7C7', 'R7C8', 'R7C9'),
  new ValueIndexing('VN', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'),
  new ValueIndexing('VN', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R1C7'),
  new ValueIndexing('VN', 'R6C3', 'R7C3', 'R8C3', 'R9C3'),
  new ValueIndexing('VN', 'R5C9', 'R5C8', 'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1'),
  new ValueIndexing('VN', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'),
  new ValueIndexing('VN', 'R4C7', 'R3C7', 'R2C7', 'R1C7'),
  new ValueIndexing('VN', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3'),
  new ValueIndexing('VN', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1'),
  new ValueIndexing('VN', 'R3C4', 'R3C3', 'R3C2', 'R3C1'),
  new ValueIndexing('VN', 'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
];
