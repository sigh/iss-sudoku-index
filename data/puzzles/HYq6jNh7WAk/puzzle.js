// Title: Decoy Snail
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=HYq6jNh7WAk
// Source: https://sudokupad.app/fleyhg6tnu

// Standard 9x9 sudoku: rows, columns and marked 3x3 boxes contain 1-9 without
// repeats (default Shape boxes match the puzzle's drawn 3x3 regions).
//
// Mangoes (given, sparse -- "not all fruit has been given" so absence of a
// mark carries no information) mark an adjacent pair whose digits are
// consecutive. Coconuts mark an adjacent pair where one digit is double the
// other. Cell pairs transcribed by hand from the drawn edge-icon overlays,
// with the 1-cell decorative border stripped so the played grid is
// R1C1-R9C9.
//
// Everything else in the rules text -- Chiki's solver-drawn path, the maze
// walls that block it, the box-border thermometer segments the path forms,
// the ordered golden-coin collection, and the poison digit the path must
// avoid -- is omitted.

return [
  new Shape('9x9'),

  // Mangoes: consecutive pair (Kropki white dot semantics).
  new WhiteDot('R7C9', 'R8C9'),
  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R1C1', 'R2C1'),

  // Coconuts: 2:1 ratio pair (Kropki black dot semantics).
  new BlackDot('R8C8', 'R9C8'),
  new BlackDot('R2C1', 'R3C1'),
  new BlackDot('R1C2', 'R1C3'),
];
