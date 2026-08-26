// Title: Heart Brea-King
// Author: olima
// Video: https://www.youtube.com/watch?v=l_UOIrqJ4mo
// Source: https://sudokupad.app/djo2zcf7eo

// Normal sudoku rules (rows, columns, standard 3x3 boxes). Anti-king: cells a
// king's move apart differ. Six green lines: adjacent cells differ by at
// least 5 (Whisper). Six edge dots: one black (2:1 ratio), five white
// (consecutive); the rules note not all such dots are necessarily given, so
// no exhaustiveness is assumed for undrawn edges.
//
// The green lines are drawn as one continuous heart-shaped outline that
// branches at R5C6 and R5C7 (three polylines meet there), plus one separate
// closed loop. Each drawn polyline is encoded as its own Whisper group; the
// rule is a per-adjacent-pair difference, so the branch point needs no
// special handling beyond listing every drawn segment.

const lines = [
  // upper-right lobe, three segments sharing endpoints R5C6 and R5C7
  ['R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6'],
  ['R5C6', 'R5C7', 'R6C8', 'R7C9'],
  ['R5C7', 'R4C8', 'R3C9'],
  // top and bottom straight runs
  ['R3C8', 'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2'],
  ['R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R7C2'],
  // closed loop (left lobe); first cell repeated to close it
  ['R4C1', 'R5C1', 'R6C2', 'R7C3', 'R6C4', 'R5C5', 'R4C5', 'R3C4', 'R4C3', 'R3C2', 'R4C1'],
];

const whispers = lines.map((cells) => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  new AntiKing(),
  ...whispers,
  new BlackDot('R8C4', 'R9C4'),
  new WhiteDot('R1C6', 'R2C6'),
  new WhiteDot('R8C3', 'R9C3'),
  new WhiteDot('R6C3', 'R7C3'),
  new WhiteDot('R3C3', 'R4C3'),
  new WhiteDot('R1C3', 'R2C3'),
];
