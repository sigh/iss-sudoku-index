// Title: The Quiet Box
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=iLBL-HqHUwA
// Source: https://app.crackingthecryptic.com/sudoku/D4FB6FHJm7

// Normal sudoku rules apply (standard 3x3 boxes, default). Along green lines,
// neighbouring digits differ by at least 5: Whisper(5, ...). A purple line
// shows a sequence of consecutive digits, not necessarily in order: Renban(...).

// Purple consecutive-set line, drawn coordinates from source-geometry line #0.
const renban = new Renban('R1C3', 'R1C2', 'R2C1', 'R3C1');

// Green difference->=5 lines, drawn coordinates from source-geometry lines #1-#4.
// Whisper binds only consecutive pairs by list order, so each line's cell
// order below follows the drawn path.
const whispers = [
  new Whisper(5, 'R1C6', 'R2C7', 'R3C8'),
  new Whisper(5, 'R6C1', 'R7C2', 'R8C3'),
  new Whisper(5, 'R6C9', 'R7C8', 'R8C7', 'R9C6'),
  new Whisper(5, 'R2C3', 'R3C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C7',
    'R7C6', 'R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C3', 'R3C2'),
];

return [
  new Shape('9x9'),

  new Given('R1C1', 9), new Given('R1C8', 2), new Given('R1C9', 7),
  new Given('R2C9', 8),
  new Given('R4C4', 3), new Given('R4C6', 4),
  new Given('R5C5', 5),
  new Given('R6C4', 1), new Given('R6C6', 7),
  new Given('R8C1', 4), new Given('R8C9', 2),
  new Given('R9C1', 7), new Given('R9C2', 1), new Given('R9C8', 3), new Given('R9C9', 5),

  renban,
  ...whispers,
];
