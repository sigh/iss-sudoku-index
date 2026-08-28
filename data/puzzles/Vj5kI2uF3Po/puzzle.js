// Title: A Thermo by Aad ... oh yes!
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Vj5kI2uF3Po
// Source: https://cracking-the-cryptic.web.app/sudoku/m764Rp2p9p

// Normal sudoku rules (default 3x3 box regions). Four thermometers, each 6
// cells, strictly increasing from bulb to tip. Thermo cell order below is
// bulb-first, taken from the drawn line's waypoint order, matching the filled
// circle drawn at each bulb (corner) cell.
return [
  new Shape('9x9'),

  new Given('R3C4', 9),
  new Given('R4C9', 5),
  new Given('R6C7', 3),
  new Given('R8C7', 8),
  new Given('R9C6', 9),

  new Thermo('R1C9', 'R2C8', 'R3C7', 'R4C6', 'R3C5', 'R2C4'),
  new Thermo('R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C3', 'R6C2'),
  new Thermo('R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C7', 'R4C8'),
  new Thermo('R9C1', 'R8C2', 'R7C3', 'R6C4', 'R7C5', 'R8C6'),
];
