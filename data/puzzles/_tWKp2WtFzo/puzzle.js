// Title: Magic Sigil
// Author: Ugonowhere
// Video: https://www.youtube.com/watch?v=_tWKp2WtFzo
// Source: https://app.crackingthecryptic.com/sudoku/jfNRTfqrgg

// Rules: normal sudoku rules apply (default row/column/box all-different;
// the payload's explicit regions match the default 3x3 boxes exactly).
// Digits do not repeat in cages, which show their sums (killer cages).
// Digits along arrows sum to the digit in the attached circle and may
// repeat on the arm. Digits cannot repeat on the marked diagonal. Digits
// increase from the bulb on thermos.

return [
  new Shape('9x9'),

  new Given('R5C5', 6),
  new Given('R8C2', 5),
  new Given('R8C3', 8),

  // Killer cages, transcribed from the drawn cage boxes.
  ...[
    [11, 'R1C3', 'R2C3'],
    [15, 'R3C1', 'R3C2', 'R3C3'],
    [17, 'R1C5', 'R2C5', 'R3C5'],
    [14, 'R1C7', 'R2C7'],
    [17, 'R3C7', 'R3C8', 'R3C9'],
    [16, 'R4C8', 'R4C9', 'R5C9'],
    [14, 'R5C8', 'R6C8', 'R6C9'],
    [11, 'R5C2', 'R6C2', 'R6C1'],
    [18, 'R4C2', 'R4C1', 'R5C1'],
    [17, 'R8C1', 'R8C2', 'R9C2', 'R9C1'],
    [9, 'R8C5', 'R9C5'],
    [10, 'R8C7', 'R9C7'],
    [16, 'R7C7', 'R7C8', 'R7C9'],
  ].map(([sum, ...cells]) => new Cage(sum, ...cells)),

  // Arrows, transcribed from the drawn arrow shafts and circle overlays:
  // each arrow's circle overlay sits on its bulb cell (the sum-holding
  // cell); the rest of the drawn shaft is the arm. Arrow() takes the circle
  // cell first, then the arm cells.
  new Arrow('R4C6', 'R3C6', 'R3C7'),
  new Arrow('R3C5', 'R4C5', 'R4C6'),
  new Arrow('R5C3', 'R5C4', 'R4C4'),
  new Arrow('R4C4', 'R3C4', 'R3C3', 'R4C3'),
  new Arrow('R6C4', 'R7C4', 'R7C3', 'R6C3'),
  new Arrow('R7C5', 'R6C5', 'R5C5'),
  new Arrow('R5C7', 'R5C6', 'R5C5'),
  new Arrow('R6C6', 'R7C6', 'R7C7', 'R6C7'),

  // Marked diagonal (line #0): R1C9-R2C8-...-R9C1, the '/' anti-diagonal.
  new Diagonal(1),

  // Thermo (line #1): drawn tip-first R1C1-R1C2-R2C2-R2C1 with the bulb
  // overlay at R2C1 (the last drawn point), so the increasing order starts
  // at R2C1 and runs to the tip at R1C1.
  new Thermo('R2C1', 'R2C2', 'R1C2', 'R1C1'),
];
