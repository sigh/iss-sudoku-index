// Title: Symmetrio
// Author: Epsalon
// Video: https://www.youtube.com/watch?v=_qIBjkX1TMk
// Source: https://app.crackingthecryptic.com/sudoku/4RjT2dp9HN
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens). Both main
// diagonals must not repeat digits. Six 2x2 circles are quadruple clues:
// every listed digit must appear somewhere in its 2x2 square. Black dots
// join digits with a 2:1 ratio; not every such pair is dotted, so absence of
// a dot carries no information (no strict/negative form is used).
//
// The video's general description also mentions white consecutive dots, but
// it covers every puzzle in the multi-puzzle video. This puzzle's own stored
// rules text and overlay geometry carry no white-dot mark, so that rule is
// not part of this puzzle and is omitted.

return [
  new Shape('9x9'),

  new Diagonal(-1), // R1C1-R9C9
  new Diagonal(1),  // R1C9-R9C1

  // Quadruple circles: digit set read off each corner's circle overlay plus
  // its adjacent digit-text overlay(s).
  new Quad('R1C1', 1, 2, 3, 5),
  new Quad('R3C3', 6),
  new Quad('R3C8', 2, 5, 9),
  new Quad('R6C1', 4, 5, 9),
  new Quad('R6C6', 3),
  new Quad('R8C8', 4, 6, 8, 9),

  // Black dots (2:1 ratio), one per drawn edge.
  new BlackDot('R3C3', 'R4C3'),
  new BlackDot('R7C2', 'R7C3'),
  new BlackDot('R8C2', 'R9C2'),
  new BlackDot('R9C1', 'R9C2'),
  new BlackDot('R8C1', 'R9C1'),
  new BlackDot('R8C4', 'R8C5'),
  new BlackDot('R6C7', 'R7C7'),
  new BlackDot('R2C5', 'R2C6'),
  new BlackDot('R3C7', 'R3C8'),
  new BlackDot('R1C9', 'R2C9'),
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R1C8', 'R2C8'),
];
