// Title: 3 Snakes
// Author: Jeet Sampat
// Video: https://www.youtube.com/watch?v=EIhBncZoWo4
// Source: https://app.crackingthecryptic.com/sudoku/NFmh8mPGjG

// Standard sudoku (rows/cols/3x3 boxes are the default) plus:
//   - Knight's move: cells a knight's move apart differ.
//   - Both marked diagonals (\ and /) are all-different.
//   - Two "snake" cages: each is all-different (killer cage with no total).
//     Each cage is also drawn with a green whisper line requiring every
//     adjacent pair on the line to differ by at least 5 (Whisper,
//     difference 5). Snake 1's line is one continuous drawn stroke over
//     all 8 cage cells. Snake 2's line is drawn as two separate strokes
//     (a vertical run then a horizontal run) whose endpoints happen to sit
//     on adjacent cells; only the pairs inside each stroke are asserted by
//     the line, so the whisper difference is not applied across that
//     visual join (R7C7/R7C6) -- the all-different cage still covers all
//     8 cells regardless.
//   - One black (Kropki) dot: 2:1 ratio between the two named cells. The
//     rules state that not every such pair is dotted, so no dot elsewhere
//     implies nothing.

// Snake cage cells, transcribed from the puzzle's cage geometry, which each
// cover exactly one snake regardless of how many line strokes render the
// green whisper line on top of them.
const snake1 = ['R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'];
const snake2 = ['R4C7', 'R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3'];
// Snake 2's green line as its two separate drawn strokes.
const snake2LineA = ['R4C7', 'R5C7', 'R6C7', 'R7C7'];
const snake2LineB = ['R7C6', 'R7C5', 'R7C4', 'R7C3'];

return [
  new Shape('9x9'),

  new AntiKnight(),

  // \ main diagonal, / anti-diagonal (both drawn, colour #34BBE6).
  new Diagonal(-1),
  new Diagonal(1),

  // Snake 1: all-different cage, whisper line is one continuous stroke.
  new AllDifferent(...snake1),
  new Whisper(5, ...snake1),
  // Snake 2: all-different cage, whisper line is two separate strokes.
  new AllDifferent(...snake2),
  new Whisper(5, ...snake2LineA),
  new Whisper(5, ...snake2LineB),

  // Single drawn black dot, edge(R2C2, R3C2).
  new BlackDot('R2C2', 'R3C2'),
];
