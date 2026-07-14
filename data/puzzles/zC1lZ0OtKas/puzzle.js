// Title: RAT RUN 21: Friendly
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=zC1lZ0OtKas
// Source: https://sudokupad.app/bbcodg1b5w

// Rat Run family: the maze/path rules (self-avoiding fixed-endpoint paths for
// Finkz and Phinx, thick walls, diagonal 2x2 moves, round wall-spot corner
// restriction, forbidden-door pass-through, and the visited-cell "test
// constraint") have no ISS primitive and are omitted -- see
// known-families.md "Rat Run (Marty Sears)". Only the path-independent digit
// relations below are encoded.
//
// Blackcurrant (one digit double the other, adjacent cells) -> BlackDot.
// Grape (difference >= 5, adjacent cells) -> Whisper(5, ...).
// Forbidden door (sum to 10, adjacent cells) -> X.
return [
  new Shape('9x9'),

  // Blackcurrants.
  new BlackDot('R8C3', 'R9C3'),
  new BlackDot('R5C3', 'R6C3'),
  new BlackDot('R3C2', 'R4C2'),

  // Grapes.
  new Whisper(5, 'R5C1', 'R6C1'),
  new Whisper(5, 'R6C6', 'R6C7'),
  new Whisper(5, 'R8C5', 'R8C6'),
  new Whisper(5, 'R3C9', 'R4C9'),

  // Forbidden doors.
  new X('R5C2', 'R6C2'),
  new X('R4C4', 'R5C4'),
  new X('R8C9', 'R9C9'),
];
