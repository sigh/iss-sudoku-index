// Title: Thermo Miracle Sudoku
// Author: Wei-Hwa Huang and Bram Cohen
// Video: https://www.youtube.com/watch?v=Tv-48b-KuxI
// Source: https://cracking-the-cryptic.web.app/sudoku/bDQtpNhg4h

// Standard sudoku (rows, columns and the nine standard boxes all-different,
// from the default 9x9 Shape), plus the two drawn thermometers. There are no
// givens.
//
// No rules text accompanies this puzzle anywhere in its source. The video
// that links it calls it "Wei-Hwa Huang and Bram Cohen's Thermo Miracle
// Sudoku", which points at the Miracle Sudoku family -- some combination of
// no repeats a king's move apart, no repeats a knight's move apart, and no
// consecutive digits in orthogonally adjacent cells -- but nothing states
// which of those rules apply, and no drawn mark narrows it, so that rule is
// omitted here.

return [
  new Shape('9x9'),

  // The two grey strokes, each listed bulb-first: the bulb is the end
  // carrying the filled round mark (R3C7 and R7C4 respectively).
  new Thermo('R3C7', 'R2C7'),
  new Thermo('R7C4', 'R7C3', 'R7C2'),
];
