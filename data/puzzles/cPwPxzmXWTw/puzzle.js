// Title: Symmetrical Face
// Author: Ridhwan
// Video: https://www.youtube.com/watch?v=cPwPxzmXWTw
// Source: https://app.crackingthecryptic.com/sudoku/69ppjmpB4q

// Grey thermometers: values increase from the bulb (filled circle) end.
// Cell lists drawn from the puzzle's lines/underlays: bulb underlay circles
// mark the low end of each thermometer.
const thermos = [
  new Thermo('R1C1', 'R2C1', 'R3C2', 'R4C3', 'R5C3'),
  new Thermo('R9C1', 'R8C1', 'R7C1'),
  // Thermos below both bulb from R6C1 (two filled-circle underlays drawn on
  // that one cell) and run outward in different directions.
  new Thermo('R6C1', 'R7C2'),
  new Thermo('R6C1', 'R5C1'),
  new Thermo('R1C8', 'R2C7', 'R3C6', 'R4C6', 'R5C6'),
  new Thermo('R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C8', 'R4C9'),
  new Thermo('R9C4', 'R8C4', 'R7C4', 'R6C4'),
];

// Purple lines: digits on the line form a consecutive set, any order.
const renbans = [
  new Renban('R1C2', 'R2C3', 'R3C4', 'R4C4', 'R5C4'),
  new Renban('R4C1', 'R5C2', 'R6C3', 'R7C3', 'R8C3', 'R9C3'),
  new Renban('R6C6', 'R7C6', 'R8C6', 'R9C6'),
  new Renban('R7C9', 'R8C9', 'R9C9'),
  new Renban('R5C9', 'R6C9', 'R7C8'),
  new Renban('R5C7', 'R4C7', 'R3C8', 'R2C9', 'R1C9'),
];

// Black kropki dots: one value is double the other.
const blackDots = [
  new BlackDot('R4C5', 'R5C5'),
  new BlackDot('R1C5', 'R2C5'),
];

return [
  new Shape('9x9'),
  new Given('R3C1', 8),
  new Given('R9C5', 9),
  ...thermos,
  ...renbans,
  ...blackDots,
];
