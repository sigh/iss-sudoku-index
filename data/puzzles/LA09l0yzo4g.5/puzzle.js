// Title: Oct 15, 2021: Shamrock
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=LA09l0yzo4g
// Source: https://app.crackingthecryptic.com/sudoku/NDjdjJp2t2

// Normal sudoku rules apply. Along green lines, digits must differ from
// their neighbors on the line by at least 5 -- a German Whisper line
// (default Whisper difference is 5, matching the drawn threshold).
// Whisper binds only consecutive cells in a line's given order; three of
// the four lines revisit a box (walking through it in separate runs), but
// since the rule only relates line-neighbors, that revisiting adds no
// extra constraint beyond the consecutive pairs listed below.

const whisperLines = [
  ['R7C8', 'R6C9', 'R5C8', 'R4C9', 'R3C8', 'R4C7', 'R5C6'],
  ['R3C6', 'R2C7', 'R1C6', 'R2C5', 'R1C4', 'R2C3', 'R3C4', 'R4C5'],
  ['R3C2', 'R4C1', 'R5C2', 'R6C1', 'R7C2', 'R6C3', 'R5C4'],
  ['R6C5', 'R7C4', 'R8C4', 'R9C3'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C9', 7),
  new Given('R2C2', 2),
  new Given('R2C5', 8),
  new Given('R2C8', 4),
  new Given('R5C2', 7),
  new Given('R5C5', 5),
  new Given('R5C8', 3),
  new Given('R8C2', 6),
  new Given('R8C5', 1),
  new Given('R8C8', 9),
  new Given('R9C1', 5),
  new Given('R9C9', 4),

  ...whisperLines.map(cells => new Whisper(...cells)),
];
