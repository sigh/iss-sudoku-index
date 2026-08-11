// Title: Elementary
// Author: Marushia Dark
// Video: https://www.youtube.com/watch?v=5xu7OpQogfo
// Source: https://app.crackingthecryptic.com/sudoku/jbJ8PNDgR7

// Normal sudoku (9x9, standard rows/columns/3x3 boxes -- the payload's
// regions are the plain 3x3 boxes). Digits separated by a white dot must be
// consecutive; not all dots are drawn, so an undrawn adjacency carries no
// constraint either way. Adjacent digits along a colored line must differ by
// at least the digit given in the same-colored cell elsewhere on the grid
// (rules text, with R4C4=3 worked as the Box 5 example for the grey lines).
// Each color's clue cell sits off its own lines and doubles as a normal
// given. Each color's full line is drawn as several strokes branching from a
// shared cell, so it is encoded per drawn stroke, matching the payload's own
// line entries.

const givens = [
  new Given('R1C3', 6), // red clue: red lines require difference >= 6
  new Given('R4C4', 3), // grey clue: grey lines require difference >= 3 (rules' own Box 5 example)
  new Given('R4C8', 4), // gold clue: gold lines require difference >= 4
  new Given('R7C1', 4), // green clue: green lines require difference >= 4
  new Given('R9C9', 2), // blue clue: blue lines require difference >= 2
];

// White dots: edge overlays from the source payload, each between two
// orthogonally adjacent cells.
const whiteDots = [
  ['R2C1', 'R2C2'],
  ['R2C4', 'R2C5'],
  ['R5C7', 'R5C8'],
  ['R7C8', 'R7C9'],
  ['R8C9', 'R9C9'],
  ['R8C4', 'R8C5'],
  ['R5C2', 'R6C2'],
  ['R5C1', 'R5C2'],
  ['R6C5', 'R6C6'],
].map(cells => new WhiteDot(...cells));

// Colored difference lines, grouped by color's minimum-difference digit.
// Cell paths and grouping into strokes are taken directly from the source
// payload's drawn line entries.
const greyLines = [
  ['R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R6C4', 'R5C5', 'R6C6'],
  ['R5C4', 'R5C5', 'R5C6'],
].map(cells => new Whisper(3, ...cells));

const redLines = [
  ['R1C2', 'R2C2', 'R3C2'],
  ['R2C1', 'R3C2', 'R4C3'],
  ['R2C3', 'R3C2', 'R4C1'],
].map(cells => new Whisper(6, ...cells));

const goldLines = [
  ['R4C7', 'R3C8', 'R2C8', 'R1C8', 'R1C9'],
  ['R4C9', 'R3C8', 'R2C8', 'R1C8', 'R1C7'],
  ['R2C7', 'R2C8', 'R2C9'],
].map(cells => new Whisper(4, ...cells));

const blueLines = [
  ['R6C8', 'R7C8', 'R8C8', 'R9C8', 'R9C7'],
  ['R8C7', 'R7C8', 'R6C9'],
  ['R7C7', 'R7C8', 'R8C9'],
].map(cells => new Whisper(2, ...cells));

const greenLines = [
  ['R9C3', 'R9C2', 'R9C1'],
  ['R8C3', 'R8C2', 'R8C1'],
  ['R7C2', 'R8C2', 'R9C2'],
].map(cells => new Whisper(4, ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDots,
  ...greyLines,
  ...redLines,
  ...goldLines,
  ...blueLines,
  ...greenLines,
];
