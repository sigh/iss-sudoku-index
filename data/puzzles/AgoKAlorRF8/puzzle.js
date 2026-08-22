// Title: Snowman
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=AgoKAlorRF8
// Source: https://app.crackingthecryptic.com/sudoku/99TDP9D7B2

// Standard sudoku rules apply (default Shape gives rows/cols/boxes).
//
// Four outside arrows give diagonal sums, repeats allowed on the diagonal
// (LittleKiller is exactly this: no all-different across the diagonal).
//
// R5C5 has a drawn gray square meaning it holds an even digit: encoded as a
// candidate restriction (there is no dedicated Even class).
//
// One connected "snowman" shape is drawn as six strokes (a loop at the head,
// three branch "feet" at the base of the body); every cell adjacent along any
// stroke must alternate parity. Modular(2) is the alternating odd/even line
// primitive, applied once per drawn stroke per the per-segment convention for
// branching/multi-stroke lines.
//
// Kropki dots (white = consecutive, black = ratio 1:2) are drawn standalone,
// not on the snowman strokes; not all possible dots are given, so no negative
// inference is drawn from an unmarked pair.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Gray square: R5C5 is even.
  new Given('R5C5', 2, 4, 6, 8),

  // Outside diagonal-sum arrows.
  LittleKiller.fromCells(24, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(41, graph.ray('R3C1', 1, 1), geometry),
  LittleKiller.fromCells(53, graph.ray('R3C9', 1, -1), geometry),
  LittleKiller.fromCells(44, graph.ray('R1C9', 1, -1), geometry),

  // Snowman line, one Modular(2) per drawn stroke.
  new Modular(2,
    'R3C4', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C4', 'R8C5', 'R8C6',
    'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C6'),
  new Modular(2, 'R8C4', 'R9C3'),
  new Modular(2, 'R8C5', 'R9C5'),
  new Modular(2, 'R8C6', 'R9C7'),
  new Modular(2, 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),
  new Modular(2, 'R3C4', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6'),

  // Kropki dots.
  new WhiteDot('R6C4', 'R7C4'),
  new WhiteDot('R6C6', 'R7C6'),
  new WhiteDot('R7C4', 'R7C5'),
  new WhiteDot('R7C5', 'R7C6'),
  new BlackDot('R4C4', 'R4C5'),
  new BlackDot('R4C5', 'R4C6'),
];
