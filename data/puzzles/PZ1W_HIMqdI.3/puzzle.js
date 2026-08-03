// Title: June 9, 2023: Regifting
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=PZ1W_HIMqdI
// Source: https://tinyurl.com/5n7vwdt4

// Normal sudoku rules apply.
// German Whispers: digits in cells directly connected by a green line must
// differ by at least 5. Encoded as one Whisper over the drawn line's cell
// order (payload `line`/`whispers` arrays); default difference is 5, so the
// difference argument is omitted per the Whisper constructor's German-whisper
// shorthand.

return [
  new Shape('9x9'),

  new Given('R1C1', 1), new Given('R1C9', 4),
  new Given('R2C2', 2), new Given('R2C8', 5),
  new Given('R3C3', 3), new Given('R3C7', 8),
  new Given('R4C4', 4), new Given('R4C6', 2),
  new Given('R6C4', 7), new Given('R6C6', 5),
  new Given('R7C3', 1), new Given('R7C7', 6),
  new Given('R8C2', 6), new Given('R8C8', 7),
  new Given('R9C1', 3), new Given('R9C9', 8),

  new Whisper(
    'R5C5', 'R5C6', 'R5C7', 'R6C8', 'R7C8', 'R8C7', 'R8C6', 'R8C5',
    'R8C4', 'R8C3', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C3',
    'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R3C8'),
];
