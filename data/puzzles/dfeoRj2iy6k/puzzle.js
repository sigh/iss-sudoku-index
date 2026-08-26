// Title: Knight Shift
// Author: elle3113
// Video: https://www.youtube.com/watch?v=dfeoRj2iy6k
// Source: https://sudokupad.app/8w53jb7nc3

// Standard sudoku (default boxes) plus: antiknight; a killer cage (distinct +
// sum, so the cage's own "unique" flag adds nothing new); a green German
// whisper line drawn as an 8-cell bracket around R5C5 (its drawn endpoints,
// R5C4 and R6C4, are grid-adjacent but the waypoints do not return to the
// start, so the line is open, not a closed loop -- no wrap-around edge);
// two grey palindrome lines; a pink renban line; and five X (sum-to-10) edge
// marks. No V marks are drawn, and the rules say not every X/V need be
// marked, so only the drawn X edges are constrained.
return [
  new Shape('9x9'),
  new Given('R1C4', 5),
  new AntiKnight(),
  new Cage(8, 'R3C3', 'R3C4'),
  new Whisper(5,
    'R5C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4'),
  new Palindrome('R8C4', 'R8C5', 'R8C6', 'R7C7', 'R6C8', 'R5C8', 'R4C8'),
  new Palindrome('R5C2', 'R4C2', 'R3C3', 'R2C4', 'R2C5'),
  new Renban('R9C8', 'R8C7', 'R7C8', 'R8C9'),
  new X('R5C1', 'R5C2'),
  new X('R6C2', 'R6C3'),
  new X('R8C1', 'R8C2'),
  new X('R1C7', 'R2C7'),
  new X('R4C6', 'R4C7'),
];
