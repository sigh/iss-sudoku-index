// Title: Walking in a circle
// Author: fractalminding
// Video: https://www.youtube.com/watch?v=6cOIc5bJAuI
// Source: https://sudokupad.app/3pNhMr2hpF

// Normal 6x6 Sudoku uses 2x3 boxes. Pink lines are renbans; yellow lines are
// thermometers read from their circular bulbs. Blue closed lines alternate parity
// on every edge, so their first cell is repeated to include the closing edge.
return [
  new Shape('6x6'),

  // Pink renban paths transcribed from the drawn lines.
  new Renban('R6C2', 'R6C3', 'R6C4'),
  new Renban('R5C2', 'R5C3', 'R5C4'),

  // Yellow thermometers transcribed bulb-first from the drawn circles.
  new Thermo('R4C6', 'R5C6', 'R6C6', 'R6C5'),
  new Thermo('R1C4', 'R1C5'),

  // Blue closed paths: adjacent values have different parity.
  new Modular(2,
    'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R5C3', 'R5C4', 'R5C5',
    'R4C5', 'R3C5', 'R2C5', 'R2C4', 'R2C3', 'R2C2'),
  new Modular(2,
    'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R6C2',
    'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R4C6', 'R3C6',
    'R2C6', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1'),
];
