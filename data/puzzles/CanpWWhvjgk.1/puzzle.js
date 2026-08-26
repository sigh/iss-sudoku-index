// Title: June 7, 2022: G, as in GAS
// Author: clover!
// Video: https://www.youtube.com/watch?v=CanpWWhvjgk
// Source: https://tinyurl.com/5n767956

// Standard Sudoku givens, from the payload's fixed cells.
const givens = [
  new Given('R2C1', 7),
  new Given('R4C1', 2),
  new Given('R6C9', 9),
  new Given('R8C9', 2),
];

// Thermo: strictly increasing from the round-bulb end (first listed cell in
// each thermometer, per the payload's `thermometer` waypoint order).
const thermometers = [
  new Thermo('R3C7', 'R2C6', 'R2C5', 'R2C4', 'R3C3', 'R4C3'),
  new Thermo('R5C3', 'R6C3', 'R7C3', 'R8C4', 'R8C5', 'R8C6'),
  new Thermo('R5C5', 'R5C6', 'R5C7', 'R6C7', 'R7C7', 'R8C7'),
];

// Kropki dots: white = consecutive, black = 1:2 ratio. "Not all dots are
// necessarily given" means unmarked adjacent pairs carry no constraint, so no
// StrictKropki negative is encoded.
const whiteDots = [
  new WhiteDot('R1C8', 'R2C8'),
  new WhiteDot('R2C8', 'R3C8'),
  new WhiteDot('R9C7', 'R9C8'),
  new WhiteDot('R1C2', 'R1C3'),
  new WhiteDot('R8C1', 'R8C2'),
  new WhiteDot('R8C2', 'R8C3'),
];

const blackDots = [
  new BlackDot('R2C7', 'R2C8'),
  new BlackDot('R2C8', 'R2C9'),
  new BlackDot('R7C2', 'R8C2'),
  new BlackDot('R8C2', 'R9C2'),
  new BlackDot('R9C6', 'R9C7'),
  new BlackDot('R1C3', 'R1C4'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermometers,
  ...whiteDots,
  ...blackDots,
];
