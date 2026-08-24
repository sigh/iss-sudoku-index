// Title: Astral Cat
// Author: Philipp Blume
// Video: https://www.youtube.com/watch?v=K1KU6lD9nA8
// Source: https://app.crackingthecryptic.com/sudoku/94DjQp7tBH

// Normal sudoku rules on the 9x9 grid (default rows/columns/boxes). No givens.
//
// Two German Whisper lines (red kitty): Whisper's default difference (5)
// matches "German Whispers" without passing an explicit difference.
// Two Palindrome lines (grey kitty). The two kitties' outlines cross at a
// few shared cells (R3C4, R2C4, R7C5); each cell there sits on one whisper
// line and one palindrome line as independent constraints, per the payload's
// separate line entries.
//
// Eight Quad circles: "the four cells surrounding the circle must contain
// the given digit or digits at least once" is exactly Quad's semantics.
// Quad anchors at the 2x2's top-left cell; corners taken from the payload's
// overlay entries.

const whispers = [
  new Whisper(
    'R3C4', 'R2C4', 'R3C3', 'R2C2', 'R3C2', 'R4C2', 'R5C1', 'R6C1', 'R7C1',
    'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R7C5', 'R6C6', 'R5C6', 'R4C7'),
  new Whisper('R4C4', 'R5C5', 'R6C5'),
];

const palindromes = [
  new Palindrome(
    'R2C6', 'R1C6', 'R2C5', 'R1C4', 'R2C4', 'R3C4', 'R4C3', 'R5C3', 'R6C3',
    'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C8', 'R4C8', 'R3C9'),
  new Palindrome('R5C7', 'R4C7', 'R3C6'),
];

// [topLeftCell, ...digits] per circle, transcribed from the payload's overlay
// corner coordinates and text.
const QUADS = [
  ['R2C3', 1, 2, 8],
  ['R1C5', 5, 9],
  ['R3C1', 2, 6, 7],
  ['R7C6', 4, 6, 7],
  ['R8C4', 2, 5],
  ['R5C1', 5],
  ['R5C5', 9],
  ['R4C7', 7],
];

const quads = QUADS.map(([topLeftCell, ...digits]) =>
  new Quad(topLeftCell, ...digits));

return [
  new Shape('9x9'),
  ...whispers,
  ...palindromes,
  ...quads,
];
