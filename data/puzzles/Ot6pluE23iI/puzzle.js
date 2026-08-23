// Title: Differential Thermometers
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Ot6pluE23iI
// Source: https://app.crackingthecryptic.com/sudoku/QghGGpd2ht

// Normal sudoku rules apply (standard 3x3 boxes, from the payload's own region
// list). Along each thermometer, digits strictly increase from the bulb
// (filled circle) end. Along each arrow, the digits on the arm sum to the
// digit in the circle at the bulb end.

return [
  new Shape('9x9'),

  new Given('R2C2', 3),
  new Given('R2C8', 9),
  new Given('R4C5', 6),
  new Given('R5C4', 9),
  new Given('R5C6', 8),
  new Given('R6C5', 5),
  new Given('R8C2', 8),
  new Given('R8C8', 5),

  // Thermometers: bulb cell first, then the arm in increasing order.
  ...[
    ['R3C1', 'R3C2', 'R3C3', 'R2C3', 'R1C3'],
    ['R3C9', 'R3C8', 'R2C7', 'R1C7'],
    ['R9C7', 'R8C7', 'R7C7', 'R7C8', 'R7C9'],
    ['R7C1', 'R7C2', 'R8C3', 'R9C3'],
  ].map((cells) => new Thermo(...cells)),

  // Arrows: Arrow takes the bulb/control cell first, then the arm cells.
  ...[
    ['R4C3', 'R3C4', 'R3C5'],
    ['R3C6', 'R4C7', 'R5C7'],
    ['R6C7', 'R7C6', 'R7C5'],
    ['R7C4', 'R6C3', 'R5C3'],
  ].map((cells) => new Arrow(...cells)),
];
