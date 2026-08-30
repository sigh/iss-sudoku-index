// Title: A Superb Renban Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qGG8cw-1Ea0
// Source: https://cracking-the-cryptic.web.app/sudoku/7L22pTT9DH

// Normal sudoku (default 9x9 with standard boxes; the payload's `regions`
// are exactly the 9 default boxes). The payload carries no rules text; the
// only prose is the video description's renban-line rule.
// 16 given digits, transcribed from the payload's `overlays` (see below).
// Seven grey lines, each a Renban: its own drawn cell count is the
// consecutive run length, in any order.

// Givens (overlays): each is a digit centred in its own cell, drawn as an
// `overlays` entry sized to be invisible against the board (white box on a
// white background) -- this payload's way of rendering a plain fixed digit,
// since `cells` itself carries no values here.
const givens = [
  new Given('R1C1', 3), new Given('R1C6', 7),
  new Given('R2C2', 7), new Given('R2C5', 1),
  new Given('R3C4', 9),
  new Given('R4C3', 1), new Given('R4C9', 9),
  new Given('R5C2', 2), new Given('R5C8', 8),
  new Given('R6C1', 9), new Given('R6C7', 7),
  new Given('R7C6', 4),
  new Given('R8C5', 3), new Given('R8C8', 7),
  new Given('R9C4', 2), new Given('R9C9', 6),
];

// Renban lines, from `lines`. The payload draws its 5th and 8th `lines`
// entries as separate strokes (R5C4-R6C4-R7C4-R7C5 and R5C3-R5C4), but they
// share the cell R5C4 end-to-end and together form one unbroken 5-cell run,
// matching the length of every other line here -- encoded below as the
// single merged line.
const renbanLines = [
  ['R1C7', 'R1C8', 'R2C8', 'R3C8', 'R3C9'],
  ['R2C6', 'R2C7', 'R3C7', 'R4C7', 'R4C8'],
  ['R3C5', 'R3C6', 'R4C6', 'R5C6', 'R5C7'],
  ['R4C4', 'R4C5', 'R5C5', 'R6C5', 'R6C6'],
  ['R5C3', 'R5C4', 'R6C4', 'R7C4', 'R7C5'],
  ['R6C2', 'R6C3', 'R7C3', 'R8C3', 'R8C4'],
  ['R7C1', 'R7C2', 'R8C2', 'R9C2', 'R9C3'],
].map((cells) => new Renban(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...renbanLines,
];
