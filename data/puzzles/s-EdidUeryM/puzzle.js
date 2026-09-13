// Title: Renbarrows: Consecutive Consequences
// Author: LogzMort & MaizeGator
// Video: https://www.youtube.com/watch?v=s-EdidUeryM
// Source: https://sudokupad.app/jkljkw93m8

// Rules encoded below:
//   Normal sudoku with the digits 1-9.
//   Renban: digits along a pink line form a non-repeating consecutive set.
//   Arrow: digits along an arrow's tip sum to the digit in the arrow's bulb,
//     and the tip is itself a renban line (the bulb is excluded from that
//     renban set).
// Each arrow is drawn as one straight pink stroke from its bulb to its tip,
// the same pink used by the standalone renban lines -- the arrow is already
// coloured as the rules describe. A short grey line plus a white/grey circle
// overlay sits on top of the bulb end of every arrow; the grey line's two
// endpoints exactly match the arrow's own bulb cell and first tip cell, so it
// is the bulb's rendering (a hollow marker capping the pink stroke) and not a
// second clue -- there is no rules text for a distinct grey line type, and the
// payload has exactly one grey line and one circle per arrow.

const shape = new Shape('9x9');

// Standalone renban lines, transcribed from the four pink lines that are not
// part of an arrow.
const RENBAN_LINES = [
  ['R4C6', 'R5C5'],
  ['R5C8', 'R6C8'],
  ['R6C1', 'R7C2', 'R8C3'],
  ['R3C2', 'R4C3'],
];

// Arrows, transcribed from the payload's arrow paths: bulb first, then the
// tip cells in order away from the bulb.
const ARROWS = [
  ['R6C4', 'R5C3', 'R4C2'],
  ['R6C6', 'R7C7', 'R8C8'],
  ['R6C7', 'R7C8', 'R8C9'],
  ['R6C5', 'R5C6', 'R4C7', 'R3C8'],
  ['R8C6', 'R8C5', 'R8C4'],
  ['R3C3', 'R2C2', 'R1C1'],
  ['R1C5', 'R1C6', 'R1C7'],
  ['R6C3', 'R5C2', 'R4C1'],
];

const renbans = RENBAN_LINES.map(cells => new Renban(...cells));

const arrows = ARROWS.flatMap(([bulb, ...tip]) => [
  new Arrow(bulb, ...tip),
  new Renban(...tip),
]);

return [
  shape,
  ...renbans,
  ...arrows,
];
