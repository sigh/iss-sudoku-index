// Title: Untitled
// Author: Sed Holaysan
// Video: https://www.youtube.com/watch?v=qXmd4BJgBdg
// Source: https://cracking-the-cryptic.web.app/sudoku/hMQ6gdBggN

// Rules encoded:
//   Normal sudoku -- 1-9 once per row, column and 3x3 box (the engine
//   baseline; the nine regions drawn on the board are the standard boxes).
//
// Omitted: eight small text overlays ("L" x3, "C" x5) sit on cell-to-cell
// borders, styled white-on-white against the white grid background, so they
// render invisible. No rules text exists anywhere in local evidence (the
// payload carries no metadata/rules field, and the video description only
// names the author) to say what the letters mean or that they constrain
// anything, so no constraint is placed on them here.

// Drawn givens, nine in all.
const givens = [
  ['R1C7', 1],
  ['R1C9', 2],
  ['R3C1', 5],
  ['R4C7', 3],
  ['R4C9', 4],
  ['R5C4', 1],
  ['R6C1', 7],
  ['R7C7', 5],
  ['R7C9', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
