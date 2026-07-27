// Title: Bubblicious
// Author: Blobz
// Video: https://www.youtube.com/watch?v=gk0EHtaNQHY
// Source: https://sudokupad.app/blobz/bubblicious

// Rules encoded:
// - Normal sudoku rules (default Shape row/column/box groups).
// - "A digit in a circle indicates how many circles contain that digit":
//   CountingCircles over the full set of circled cells. The rule does not
//   scope circles into separate groups, so all 21 are one set.
// - "Digits separated by a white dot are consecutive": WhiteDot per marked
//   edge. The rules text does not say every consecutive pair is dotted, so
//   no negative (non-dotted-pairs-are-non-consecutive) constraint is added.
// - "Digits do not repeat along the marked diagonal": the marked diagonal
//   runs corner to corner from R9C1 to R1C9 (the anti-diagonal), matching
//   both the drawn line and the payload's hidden unique-flagged "cage" over
//   the same 9 cells -- both are the same rule, encoded once as Diagonal(1).

return [
  new Shape('9x9'),

  new Diagonal(1),

  // Circle cells: 21 drawn circles. 16 trace a ring (5x5 block perimeter
  // minus corners); 5 sit apart.
  new CountingCircles(
    'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3',
    'R7C4', 'R7C5', 'R7C6', 'R7C7',
    'R6C7', 'R5C7', 'R4C7', 'R3C7',
    'R3C6', 'R3C5', 'R3C4',
    'R1C6', 'R1C9', 'R2C2', 'R4C9', 'R8C8',
  ),

  // White dots: 18 drawn dots, one per orthogonally adjacent cell pair.
  ...[
    ['R1C1', 'R1C2'], ['R1C2', 'R2C2'], ['R2C1', 'R2C2'],
    ['R1C3', 'R1C4'], ['R2C3', 'R2C4'],
    ['R2C5', 'R3C5'],
    ['R2C6', 'R2C7'],
    ['R2C8', 'R2C9'], ['R2C8', 'R3C8'],
    ['R4C1', 'R5C1'],
    ['R4C7', 'R4C8'],
    ['R5C4', 'R6C4'],
    ['R5C8', 'R5C9'],
    ['R6C8', 'R7C8'], ['R7C8', 'R7C9'],
    ['R8C3', 'R8C4'], ['R8C7', 'R8C8'],
    ['R9C2', 'R9C3'],
  ].map(cells => new WhiteDot(...cells)),
];
