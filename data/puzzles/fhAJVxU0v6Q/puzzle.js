// Title: Elbow Joint
// Author: Arachno
// Video: https://www.youtube.com/watch?v=fhAJVxU0v6Q
// Source: https://sudokupad.app/8kw6qfv8ku

// Normal sudoku (rows, columns, 3x3 regions) plus 5 thermometers: digits
// strictly increase from the bulb end of each. Thermometer cell order and
// bulb end are transcribed from the drawn lines and their bulb-end circle
// markers.
return [
  new Shape('9x9'),

  new Thermo('R1C2', 'R2C2', 'R3C2', 'R4C1', 'R5C1'),
  new Thermo('R9C5', 'R9C6', 'R8C7', 'R8C8', 'R8C9'),
  new Thermo('R7C2', 'R8C2', 'R8C3'),
  new Thermo('R7C6', 'R6C6', 'R5C7', 'R5C8', 'R4C9', 'R3C9'),
  new Thermo('R1C7', 'R1C6', 'R2C5', 'R3C5', 'R3C4', 'R4C3'),
];
