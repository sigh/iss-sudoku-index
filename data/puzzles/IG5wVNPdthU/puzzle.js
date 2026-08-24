// Title: Pierced Cages
// Author: Mark Sweep
// Video: https://www.youtube.com/watch?v=IG5wVNPdthU
// Source: https://app.crackingthecryptic.com/sudoku/8dH9tbt3h8

// Normal sudoku rules apply. In cages, digits sum to the small clue in the
// top left corner of the cage. Digits cannot repeat in a cage. Digits along
// an arrow sum to the digit in that arrow's circle. Digits may repeat along
// an arrow (if allowed by the other constraints). The rules text names no
// other global rule (no anti-knight/anti-king/disjoint/diagonal/negative
// constraint), and standard 3x3 box regions are used (default Shape).

return [
  new Shape('9x9'),

  ...[
    [20, 'R1C4', 'R1C5', 'R2C5', 'R3C5'],
    [10, 'R2C6', 'R3C6'],
    [19, 'R3C7', 'R3C8', 'R3C9', 'R2C9'],
    [30, 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R6C7'],
    [25, 'R4C6', 'R5C6', 'R5C5', 'R5C4', 'R6C4'],
    [29, 'R3C2', 'R3C3', 'R4C3', 'R5C3', 'R6C3'],
    [18, 'R7C3', 'R7C2', 'R7C1', 'R8C1'],
    [15, 'R7C5', 'R8C5', 'R9C5', 'R9C6'],
  ].map(([sum, ...cells]) => new Cage(sum, ...cells)),

  // Arrow(bulb, ...arm) - bulb cell first, per Arrow's constructor.
  new Arrow('R1C4', 'R2C3', 'R3C2', 'R4C3'),
  new Arrow('R3C7', 'R4C6', 'R5C6'),
  new Arrow('R1C9', 'R2C8', 'R3C8', 'R4C9'),
  new Arrow('R7C3', 'R6C4', 'R5C4'),
  new Arrow('R9C2', 'R8C1', 'R7C1', 'R6C2'),
  new Arrow('R9C6', 'R8C7', 'R7C8', 'R6C8'),
];
