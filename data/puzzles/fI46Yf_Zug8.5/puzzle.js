// Title: August 6, 2023: Between Lines
// Author: clover!
// Video: https://www.youtube.com/watch?v=fI46Yf_Zug8
// Source: https://tinyurl.com/wjhemrba

// Normal sudoku rules apply (default rows/columns/boxes). Every line below is
// a 3-cell between line: the two circled endpoints (first and last cell) bound
// the middle cell's digit, which must sit strictly between them. `Between`
// matches this exactly, taking the endpoints first/last with the constrained
// cells in the middle. The two endpoints are not distinguished from each
// other; nothing forces the low/high circle to a fixed position.
// The 16 line cell lists are transcribed from the puzzle's drawn between
// lines. Nothing is omitted.

return [
  new Shape('9x9'),

  new Given('R1C3', 4),
  new Given('R1C5', 6),
  new Given('R2C4', 3),
  new Given('R2C6', 1),
  new Given('R3C3', 3),
  new Given('R3C7', 8),
  new Given('R3C9', 1),
  new Given('R4C2', 1),
  new Given('R4C8', 6),
  new Given('R5C5', 5),
  new Given('R6C2', 4),
  new Given('R6C8', 9),
  new Given('R7C1', 8),
  new Given('R7C3', 7),
  new Given('R7C7', 2),
  new Given('R8C4', 7),
  new Given('R8C6', 9),
  new Given('R9C5', 3),
  new Given('R9C7', 6),

  new Between('R2C4', 'R2C5', 'R2C6'),
  new Between('R8C4', 'R8C5', 'R8C6'),
  new Between('R4C2', 'R5C2', 'R6C2'),
  new Between('R4C8', 'R5C8', 'R6C8'),
  new Between('R5C5', 'R4C4', 'R3C3'),
  new Between('R5C5', 'R6C6', 'R7C7'),
  new Between('R5C5', 'R4C6', 'R3C7'),
  new Between('R5C5', 'R6C4', 'R7C3'),
  new Between('R5C9', 'R4C9', 'R3C9'),
  new Between('R5C1', 'R6C1', 'R7C1'),
  new Between('R5C1', 'R4C1', 'R3C1'),
  new Between('R5C9', 'R6C9', 'R7C9'),
  new Between('R9C5', 'R9C4', 'R9C3'),
  new Between('R9C5', 'R9C6', 'R9C7'),
  new Between('R1C3', 'R1C4', 'R1C5'),
  new Between('R1C5', 'R1C6', 'R1C7'),
];
