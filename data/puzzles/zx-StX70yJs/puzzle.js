// Title: Palindrome Sums II
// Author: tzael
// Video: https://www.youtube.com/watch?v=zx-StX70yJs
// Source: https://app.crackingthecryptic.com/sudoku/QfnM22HGtP

// Normal sudoku rules (default 3x3 boxes). Ten grey lines are drawn; each
// must read as a palindrome along its own order, and all ten lines must
// share one common digit sum. Cell paths transcribed from the ten drawn
// lines; an eleventh drawn entry has no coordinates and renders nothing,
// so it is omitted.

const lines = [
  ['R3C5', 'R2C6', 'R1C7', 'R1C8'],
  ['R3C3', 'R3C2', 'R4C1', 'R5C1'],
  ['R4C3', 'R3C4'],
  ['R4C4', 'R5C4', 'R6C3', 'R6C2'],
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C5', 'R3C6'],
  ['R6C5', 'R7C5', 'R8C4'],
  ['R8C5', 'R9C6', 'R8C7', 'R7C8'],
  ['R6C6', 'R7C7'],
  ['R4C6', 'R5C6', 'R6C7', 'R6C8'],
  ['R3C7', 'R3C8', 'R4C9', 'R5C9'],
];

return [
  new Shape('9x9'),
  new Given('R2C4', 2),
  new Given('R9C9', 4),
  ...lines.map((cells) => new Palindrome(...cells)),
  // "must sum to the same total" ties every line's sum to every other
  // line's, all as one EqualSum group.
  new EqualSum(...lines),
];
