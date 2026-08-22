// Title: Soft-spoken Pedestrian
// Author: apetersen
// Video: https://www.youtube.com/watch?v=fDBtEMZXfMA
// Source: https://app.crackingthecryptic.com/sudoku/p7RR7MBh9h

// Normal sudoku rules (9x9, default rows/columns/boxes) plus:
// one thermo (Thermo), five sum arrows (Arrow), and three green
// difference-of-at-least-5 lines (Whisper(5)).

return [
  new Shape('9x9'),

  new Given('R2C3', 5),

  // Thermo bulb overlay sits on R2C5, the last cell of the drawn path
  // (R5C5-R4C5-R3C5-R2C5): the line is drawn tip-first, so the
  // increasing-from-bulb order is R2C5,R3C5,R4C5,R5C5.
  new Thermo('R2C5', 'R3C5', 'R4C5', 'R5C5'),

  // Arrows: bulb cell first, then arm cells, per the drawn circle/line.
  new Arrow('R3C8', 'R2C7', 'R2C8', 'R2C9'),
  new Arrow('R3C2', 'R4C1'),
  new Arrow('R5C6', 'R5C7', 'R5C8'),
  new Arrow('R7C2', 'R6C3'),
  new Arrow('R9C2', 'R8C3', 'R8C2', 'R7C1'),

  // Green lines: neighbouring cells differ by >= 5. The closed loop repeats
  // its first cell at the end to cover the wrap-around edge.
  new Whisper(5, 'R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1', 'R6C2', 'R7C3',
    'R8C4', 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C8', 'R3C7', 'R2C6',
    'R1C5'),
  new Whisper(5, 'R5C4', 'R4C4', 'R3C5', 'R4C6', 'R4C7'),
  new Whisper(5, 'R7C4', 'R6C5', 'R5C5', 'R6C6', 'R7C6'),
];
